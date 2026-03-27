<script lang="ts">
	import {
		tokens,
		expandedBlock,
		vectorHeight,
		inputText,
		rootRem,
		sampling,
		maxVectorHeight,
		minVectorHeight,
		maxVectorScale,
		headContentHeight,
		temperature,
		modelData,
		isFetchingModel,
		selectedExampleIdx,
		isMobile,
		isOnBlockTransition,
		blockIdx,
		isModelRunning,
		attentionHeadIdx,
		predictedToken
	} from '~/store';
	import { PreTrainedTokenizer } from '@xenova/transformers';
	import Sankey from '~/components/Sankey.svelte';
	import Attention from '~/components/Attention.svelte';
	import SubsequentBlocks from '~/components/SubsequentBlocks.svelte';
	import LinearSoftmax from '~/components/LinearSoftmax.svelte';
	import Embedding from '~/components/Embedding.svelte';
	import Mlp from '~/components/Mlp.svelte';

	import { onMount } from 'svelte';
	import classNames from 'classnames';
	import { AutoTokenizer } from '@xenova/transformers';
	import { ex0, ex1, ex2, ex3, ex4 } from '~/constants/examples';
	import { kvEx0, kvEx1, kvEx2, kvEx3, kvEx4 } from '~/constants/examples/kv';
	import BlockTransition from '~/components/BlockTransition.svelte';
	import QKV from '~/components/QKV.svelte';
	import WeightPopovers from '~/components/WeightPopovers.svelte';

	import { adjustTemperature, fakeRunWithCachedData, getProbabilities } from '~/utils/data';
	import {
		decodeStep,
		kvCache,
		isDecoding,
		currentDecodeData,
		promptTokenCount,
		resetKVCache,
		type KVCacheEntry,
		type DecodeStepData
	} from '~/store/kvcache';

	let active = false;
	let tokenizer: PreTrainedTokenizer | null = null;

	// KV example data for each prompt
	const cachedDataMap = [ex0, ex1, ex2, ex3, ex4];
	const kvExamples = [kvEx0, kvEx1, kvEx2, kvEx3, kvEx4];

	// Track which KV example to use after prefill animation finishes
	let pendingKvExIdx = 0;
	let kvReady = false; // true after prefill animation done
	let prefillText = ''; // inputText captured at end of prefill
	let ignoreInputTextChange = false; // guard against re-triggering prefill when we programmatically set inputText

	onMount(async () => {
		const gpt2Tokenizer = await AutoTokenizer.from_pretrained('Xenova/gpt2');
		tokenizer = gpt2Tokenizer;
		active = true;

		const unsubscribe = subscribeInputs(gpt2Tokenizer);
		return unsubscribe;
	});

	// Watch for prefill animation completion
	let prevModelRunning = false;
	$: {
		const running = $isModelRunning;
		if (prevModelRunning && !running) {
			// prefill animation just finished
			kvReady = true;
			prefillText = $inputText;
			// Override sampled token with the greedy first decode token
			const kvData = kvExamples[pendingKvExIdx];
			const firstStep = kvData.decodeSteps[0];
			if (firstStep) {
				predictedToken.set({
					rank: 0,
					tokenId: firstStep.inputTokenId,
					token: firstStep.inputToken,
					logit: 0,
					scaledLogit: 0,
					expLogit: 1,
					probability: 1
				});
			}
		}
		prevModelRunning = running;
	}

	// Subscribe inputs — always uses cached data (no live ONNX on this page)
	const subscribeInputs = (tok: PreTrainedTokenizer) => {
		const runPrefill = () => {
			kvReady = false;
			resetKVCache();
			pendingKvExIdx = $selectedExampleIdx;

			fakeRunWithCachedData({
				cachedData: cachedDataMap[$selectedExampleIdx],
				tokenizer: tok,
				temperature: $temperature,
				sampling: $sampling
			});
		};

		const unsubscribeInputText = inputText.subscribe(() => {
			if (ignoreInputTextChange) {
				ignoreInputTextChange = false;
				return;
			}
			runPrefill();
		});

		let initialTemperature = true;
		const unsubscribeTemperature = temperature.subscribe((value) => {
			if (initialTemperature) {
				initialTemperature = false;
				return;
			}
			if ($isDecoding) {
				const step = $currentDecodeData;
				const kvData = kvExamples[pendingKvExIdx];
				const greedyNext = kvData.decodeSteps[$decodeStep];
				if (step?.topLogits) {
					updateDecodeStepProbabilities(tok, step, greedyNext);
				}
			} else if ($modelData?.logits) {
				adjustTemperature({ tokenizer: tok, logits: $modelData.logits, temperature: value, sampling: $sampling });
			}
		});

		let initialSampling = true;
		const unsubscribeSampling = sampling.subscribe((value) => {
			if (initialSampling) {
				initialSampling = false;
				return;
			}
			if ($isDecoding) {
				const step = $currentDecodeData;
				const kvData = kvExamples[pendingKvExIdx];
				const greedyNext = kvData.decodeSteps[$decodeStep];
				if (step?.topLogits) {
					updateDecodeStepProbabilities(tok, step, greedyNext);
				}
			} else if ($modelData?.logits) {
				adjustTemperature({ tokenizer: tok, logits: $modelData.logits, temperature: $temperature, sampling: value });
			}
		});

		return () => {
			unsubscribeInputText();
			unsubscribeTemperature();
			unsubscribeSampling();
		};
	};

	// Reconstruct a full-length sparse logit array from top-N pairs
	function reconstructLogits(topLogits: [number, number][], vocabSize = 50257): number[] {
		const logits = new Array(vocabSize).fill(-Infinity);
		for (const [id, logit] of topLogits) {
			logits[id] = logit;
		}
		return logits;
	}

	// Update modelData probabilities for a decode step using its topLogits
	function updateDecodeStepProbabilities(
		tok: PreTrainedTokenizer,
		stepData: DecodeStepData,
		greedyNextToken: { inputTokenId: number; inputToken: string } | undefined
	) {
		if (!stepData.topLogits || !tok) return;
		const logits = reconstructLogits(stepData.topLogits);
		const { probabilities } = getProbabilities({
			tokenizer: tok,
			logits,
			temperature: $temperature,
			sampling: $sampling
		});
		// Find (or fake) the greedy next token entry to use as "sampled"
		const greedyProb = greedyNextToken
			? probabilities.find((p) => p.tokenId === greedyNextToken.inputTokenId) ?? {
					rank: 0,
					tokenId: greedyNextToken.inputTokenId,
					token: greedyNextToken.inputToken,
					logit: logits[greedyNextToken.inputTokenId] ?? 0,
					scaledLogit: (logits[greedyNextToken.inputTokenId] ?? 0) / $temperature,
					expLogit: 1,
					probability: 1
				}
			: probabilities[0];

		modelData.update((d) => ({ ...d, logits, probabilities, sampled: greedyProb }));
		predictedToken.set(greedyProb);
	}

	// Build kvCache entries for a given decode step (0-indexed)
	function buildKVCacheEntries(kvData: typeof kvEx0, stepIdx: number): KVCacheEntry[] {
		const stepData = kvData.decodeSteps[stepIdx];
		const seqLen = stepData.kvSnapshot.keys[0].length;
		const promptTokens = kvData.promptTokens;

		return Array.from({ length: seqLen }, (_, i) => {
			const tokenStr =
				i < promptTokens.length
					? promptTokens[i]
					: kvData.decodeSteps[i - promptTokens.length].inputToken;
			return {
				token: tokenStr,
				// keys[headIdx][tokenIdx] → per-token, all-heads K vectors
				keys: stepData.kvSnapshot.keys.map((headKeys: number[][]) => headKeys[i]),
				values: stepData.kvSnapshot.values.map((headVals: number[][]) => headVals[i])
			};
		});
	}

	// Show the predicted next token in the LinearSoftmax panel
	function setPredictedNextToken(kvData: typeof kvEx0, afterStepIdx: number) {
		// afterStepIdx: 0-indexed step just processed; next predicted = decodeSteps[afterStepIdx+1].inputToken
		const next = kvData.decodeSteps[afterStepIdx + 1];
		if (next) {
				predictedToken.set({
				rank: 0,
				tokenId: next.inputTokenId,
				token: next.inputToken,
				logit: 0,
				scaledLogit: 0,
				expLogit: 1,
				probability: 1
			});
		}
	}

	// Advance to next decode step
	function nextStep() {
		if (!kvReady) return;
		const kvData = kvExamples[pendingKvExIdx];
		const nextIdx = $decodeStep; // 0-indexed into decodeSteps
		if (nextIdx >= kvData.decodeSteps.length) return;

		const stepData = kvData.decodeSteps[nextIdx];
		const entries = buildKVCacheEntries(kvData, nextIdx);

		promptTokenCount.set(kvData.promptTokens.length);
		kvCache.set(entries);
		currentDecodeData.set(stepData as DecodeStepData);

		// Show only the current decode token in QKV/MLP/Embedding columns
		tokens.set([stepData.inputToken]);

		// Accumulate decoded tokens in the text box without re-triggering prefill
		const decodedSoFar = kvData.decodeSteps
			.slice(0, nextIdx + 1)
			.map((s) => s.inputToken)
			.join('');
		ignoreInputTextChange = true;
		inputText.set(prefillText + decodedSoFar);

		// Update probabilities panel with this step's distribution + highlight greedy next token
		const greedyNext = kvData.decodeSteps[nextIdx + 1];
		if (tokenizer && stepData.topLogits) {
			updateDecodeStepProbabilities(tokenizer, stepData as DecodeStepData, greedyNext);
		} else {
			setPredictedNextToken(kvData, nextIdx);
		}

		decodeStep.set(nextIdx + 1);
	}

	// Go back to previous decode step (or back to prefill view)
	function prevStep() {
		const cur = $decodeStep;
		if (cur <= 0) return;

		const newStep = cur - 1;
		decodeStep.set(newStep);

		if (newStep === 0) {
			// Back to prefill: restore all prompt tokens and prefill predictions
			const prefillData = cachedDataMap[pendingKvExIdx];
			tokens.set(prefillData.tokens);
			kvCache.set([]);
			currentDecodeData.set(null);
			ignoreInputTextChange = true;
			inputText.set(prefillText);
			if (tokenizer && $modelData?.logits) {
				adjustTemperature({
					tokenizer,
					logits: $modelData.logits,
					temperature: $temperature,
					sampling: $sampling
				});
			}
			return;
		}

		// Go back one step: rebuild kvCache from step newStep - 1 (0-indexed)
		const kvData = kvExamples[pendingKvExIdx];
		const prevIdx = newStep - 1;
		const stepData = kvData.decodeSteps[prevIdx];
		const entries = buildKVCacheEntries(kvData, prevIdx);

		promptTokenCount.set(kvData.promptTokens.length);
		kvCache.set(entries);
		currentDecodeData.set(stepData as DecodeStepData);
		tokens.set([stepData.inputToken]);

		// Restore accumulated text to match this step
		const decodedSoFar = kvData.decodeSteps
			.slice(0, prevIdx + 1)
			.map((s: { inputToken: string }) => s.inputToken)
			.join('');
		ignoreInputTextChange = true;
		inputText.set(prefillText + decodedSoFar);

		const greedyNext = kvData.decodeSteps[prevIdx + 1];
		if (tokenizer && stepData.topLogits) {
			updateDecodeStepProbabilities(tokenizer, stepData as DecodeStepData, greedyNext);
		} else {
			setPredictedNextToken(kvData, prevIdx);
		}
	}

	// Visual elements
	let vizHeight = 0;
	let titleHeight = rootRem * 5;

	const calculateVectorHeight = () => {
		const gaps = rootRem * 0.5 * ($tokens.length - 1);
		const vectorHeightVal = Math.min(
			Math.max((vizHeight - titleHeight - gaps) / $tokens.length / maxVectorScale, minVectorHeight),
			maxVectorHeight
		);
		vectorHeight.set(vectorHeightVal);
		headContentHeight.set(Math.max($tokens.length * vectorHeightVal * 3 + gaps, rootRem * 20));
	};

	$: if (vizHeight || $tokens.length) {
		calculateVectorHeight();
	}

	$: maxDecodeStep = kvExamples[pendingKvExIdx]?.decodeSteps?.length ?? 0;
</script>

<div
	class:active
	class:decode-mode={$isDecoding}
	class="main-section h-full w-full"
	style={`--vector-height: ${$vectorHeight}px;--title-height: ${titleHeight}px;--content-height:${vizHeight - titleHeight}px;`}
>
	{#if kvReady && !$isModelRunning}
		<div class="decode-controls">
			<button
				class="step-btn"
				on:click={prevStep}
				disabled={$decodeStep <= 0}
			>
				← Prev
			</button>
			<span class="step-label">
				{#if $decodeStep === 0}
					Prefill complete — click Next → to decode
				{:else}
					Decode step {$decodeStep} / {maxDecodeStep}
				{/if}
			</span>
			<button
				class="step-btn"
				on:click={nextStep}
				disabled={$decodeStep >= maxDecodeStep}
			>
				Next →
			</button>
		</div>
	{/if}

	{#if !!$expandedBlock.id}
		<div
			class={classNames('dim', `${$expandedBlock.id || ''}`)}
		></div>
		<div
			class={classNames('dim-partial left', `${$expandedBlock.id || ''}`)}
		></div>
		<div
			class={classNames('dim-partial right', `${$expandedBlock.id || ''}`)}
		></div>
	{/if}
	<div class="sankey opacity-1" class:attention={$expandedBlock.id === 'attention'}>
		<Sankey />
	</div>
	<div class="nodes resize-watch">
		<div class="steps" class:expanded={!!$expandedBlock.id} bind:offsetHeight={vizHeight}>
			<Embedding className="step" />
			<div class="blocks relative">
				<div class="block-steps main" class:initial={$blockIdx === 0}>
					<QKV className="step" />
					<Attention className="step" />
					<Mlp className="step" />
				</div>
				<div
					class="block-steps next"
					class:hide={!$isOnBlockTransition}
					class:initial={$blockIdx === 0}
				>
					<QKV className="step" />
					<Attention className="step" />
					<Mlp className="step" />
				</div>
				<div class="transition-watch" class:hide={!$isOnBlockTransition}></div>
			</div>
			<SubsequentBlocks className="step" />
			<LinearSoftmax className="step" />
		</div>
		<WeightPopovers />
		<BlockTransition />
	</div>
</div>

<style lang="scss">
	.main-section {
		opacity: 0;
		&.active {
			opacity: 1;
		}
	}

	.decode-controls {
		position: fixed;
		bottom: 1.5rem;
		left: 50%;
		transform: translateX(-50%);
		display: flex;
		align-items: center;
		gap: 1rem;
		background: white;
		border: 1px solid theme('colors.gray.200');
		border-radius: 2rem;
		padding: 0.5rem 1.25rem;
		z-index: 9000;
		box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
		font-size: 0.85rem;

		.step-btn {
			color: theme('colors.gray.600');
			cursor: pointer;
			padding: 0.25rem 0.5rem;
			border-radius: 0.25rem;
			transition: background-color 0.15s;

			&:hover:not(:disabled) {
				background-color: theme('colors.gray.100');
				color: theme('colors.gray.800');
			}

			&:disabled {
				opacity: 0.35;
				cursor: not-allowed;
			}
		}

		.step-label {
			color: theme('colors.gray.500');
			white-space: nowrap;
			min-width: 14rem;
			text-align: center;
		}
	}

	.nodes {
		height: 100%;
		width: 100%;
		padding: 1rem 0 3rem 0;
		position: relative;
	}
	.steps {
		position: relative;
		width: 100%;
		height: 100%;
		position: relative;
		display: grid;
		grid-template-columns: auto 3.5fr 0.5fr 0.5fr;

		&.expanded {
			:global(.step > .title) {
				padding-bottom: 3rem;
			}
		}

		.blocks {
			position: relative;
			width: 100%;
			height: 100%;

			.block-steps {
				height: 100%;
				width: 100%;
				position: absolute;
				display: grid;
				grid-template-columns: 0.5fr 2fr 1fr;
			}
			.block-steps.main {
				transform-origin: 3rem center;
				top: 0;
				left: 0;
			}
			.block-steps.next {
				transform-origin: right center;
				justify-content: end;
				top: 0;
				right: 0;
				pointer-events: none;
			}

			.transition-watch {
				position: absolute;
				top: 0;
				left: 0;
				height: 100%;
				width: 100%;
				pointer-events: none;
			}

			.hide {
				display: none;
			}
		}
	}

	.dim {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		z-index: $DIM_INDEX;
		background-color: white;
		opacity: 0.7;
		user-select: none;

		&.attention {
			z-index: 0;
		}
	}
	.dim-partial {
		user-select: none;
		z-index: $PARTIAL_DIM_INDEX;
		position: absolute;
		top: 0;
		height: 100%;

		&.right {
			right: 0;
			background: linear-gradient(90deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 1) 80%);
		}
		&.left {
			left: 0;
			background: linear-gradient(-90deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 1) 80%);
		}

		&.attention {
			&.left {
				width: 20%;
			}
			&.right {
				width: 20%;
			}
		}
	}
	.sankey {
		position: absolute;
		left: 0;
		top: 0;
		width: 100%;
		height: 100%;

		&.attention {
			:global(.sankey-top) {
				z-index: $EXPANDED_ATTENTION_INDEX !important;
				pointer-events: none;
			}
		}
	}

	:global(.step) {
		height: 100%;
		display: grid;
		grid-template-rows: var(--title-height) 1fr;
	}

	:global(.step > .title) {
		z-index: $COLUMN_TITLE_INDEX;
		display: flex;
		flex-direction: column;
		justify-content: end;
		grid-row: 1;
		color: theme('colors.gray.400');
		white-space: nowrap;
		padding-bottom: 2rem;
		overflow: visible;
		min-width: 0;
		transition: all 0.5s;
		cursor: default;

		&:hover {
			color: theme('colors.gray.600');
		}
	}

	:global(.step > .title.expandable) {
		cursor: pointer;
	}

	:global(.step .content) {
		grid-row: 2;
		height: fit-content;
	}

	:global(.column) {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		position: relative;

		:global(.cell) {
			height: var(--vector-height);
			display: flex;
			gap: 1rem;
			align-items: center;
			position: relative;
		}

		:global(.subtitle) {
			position: absolute;
			top: 0;
			transform: translateY(calc(-100% - 1rem));
			text-align: center;
			font-size: 0.8rem;
			color: theme('colors.gray.400');
			width: 100%;
			z-index: $COLUMN_TITLE_INDEX;
		}
	}

	:global(.vector),
	:global(.sub-vector) {
		position: relative;
		z-index: $VECTOR_INDEX;
		width: 12px;
		height: var(--vector-height);
		flex-shrink: 0;
		justify-content: start;
	}
	:global(.cell.x1-12),
	:global(.vector.x1-12),
	:global(.sub-vector.x1-12) {
		height: calc(var(--vector-height) / 12);
	}

	:global(.cell.x3),
	:global(.vector.x3),
	:global(.sub-vector.x3) {
		height: calc(var(--vector-height) * 3);
	}
	:global(.cell.x4),
	:global(.vector.x4),
	:global(.sub-vector.x4) {
		height: calc(var(--vector-height) * 3.1);
	}

	:global(.vector.vocab),
	:global(.sub-vector.vocab) {
		height: 100%;
		width: 0;
	}

	:global(.sub-vector.head-rest) {
		flex: 1 0 0;
	}

	:global(.label) {
		font-size: 0.9rem;
		color: theme('colors.gray.700');
		z-index: $VECTOR_INDEX;
		display: inline;
		max-width: 7rem;
		overflow: hidden;
		text-overflow: ellipsis;
		text-align: right;
		line-height: var(--vector-height);
		height: var(--vector-height);
		flex-shrink: 0;
	}
	:global(.label.float) {
		position: absolute;
		left: -0.8rem;
		transform: translateX(-100%);
	}

	:global(.decode-mode .mlp .label) {
		display: none;
	}
	:global(.label.float-right) {
		position: absolute;
		left: -0.8rem;
	}

	:global(.ellipsis) {
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	:global(.bounding) {
		position: absolute;
		box-sizing: content-box;
		top: -0.5rem;
		padding: 0.5rem 0;
		left: 0;
		height: 100%;
		border: 2px dashed theme('colors.gray.300');
		border-radius: 0.5rem;
		transition: opacity 0.5s;
		opacity: 0;
		pointer-events: none;
	}
	:global(.bounding.active) {
		opacity: 0.8;
	}

	:global(.popover) {
		z-index: $POPOVER_INDEX;
		width: max-content;
	}

	:global(.tooltip) {
		z-index: $TOOLTIP_INDEX;
		background-color: white !important;
		color: theme('colors.gray.600') !important;
		border: 1px solid theme('colors.gray.200') !important;
		padding: 0.2rem 0.5rem !important;
		font-size: 0.8rem !important;
		white-space: nowrap;
		font-weight: 300 !important;
		border-color: theme('colors.gray.200') !important;
	}

	:global(svg g.path-group) {
		transition: opacity 0.5s;
	}
	:global(div.step > div) {
		transition: opacity 0.5s;
	}
	:global(div.step .column) {
		transition: opacity 0.5s;
	}
</style>

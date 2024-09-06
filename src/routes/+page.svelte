<script lang="ts">
	import {
		tokens,
		expandedBlock,
		vectorHeight,
		inputText,
		rootRem,
		maxVectorHeight,
		minVectorHeight,
		maxVectorScale,
		headContentHeight,
		temperature,
		modelData,
		modelSession,
		isFetchingModel
	} from '~/store';
	import Sankey from '~/components/Sankey.svelte';
	import Attention from '~/components/Attention.svelte';
	import SubsequentBlocks from '~/components/SubsequentBlocks.svelte';
	import LinearSoftmax from '~/components/LinearSoftmax.svelte';
	import Embedding from '~/components/Embedding.svelte';
	import Mlp from '~/components/Mlp.svelte';
	import { onMount } from 'svelte';
	import classNames from 'classnames';
	import { base } from '$app/paths';
	import * as ort from 'onnxruntime-web';

	import { adjustTemperature, runModel } from '~/utils/data';
	import { fetchAndMergeChunks } from '~/utils/fetchChunks';
	import WeightPopovers from '~/components/WeightPopovers.svelte';
	import { fade } from 'svelte/transition';
	import { AutoTokenizer } from '@xenova/transformers';

	// run model
	onMount(async () => {
		// Fetch model onnx
		const chunkNum = 63; //TODO: move to model meta
		const chunkUrls = Array(chunkNum)
			.fill(0)
			.map((d, i) => `${base}/model/gpt2.onnx.part${i}`);

		// Fetch from cache
		const mergedArray = await fetchAndMergeChunks(chunkUrls);

		// Create a Blob from the merged array
		const blob = new Blob([mergedArray], { type: 'application/octet-stream' });

		// Create a URL for the Blob
		const url = URL.createObjectURL(blob);

		// Create ONNX session using the Blob URL
		const session = await ort.InferenceSession.create(url, {
			// logSeverityLevel: 0
		});

		modelSession.set(session);

		isFetchingModel.set(false);

		// Initialize tokenizer
		const tokenizer = await AutoTokenizer.from_pretrained('Xenova/gpt2');

		// Subscribe input change
		let initialRun = true;
		const unsubscribeInputText = inputText.subscribe((value) => {
			if ($isFetchingModel || !$modelSession || initialRun) {
				initialRun = false;
				return;
			}
			// run model when input has changed
			runModel({
				tokenizer,
				input: value.trim(),
				temperature: $temperature,
				topK: 50,
				sampleK: 20
			});
		});

		let initialTemperature = true; // prevent initial redundant prediction
		const unsubscribeTemperature = temperature.subscribe((value) => {
			if (initialTemperature) {
				initialTemperature = false;
				return;
			}
			adjustTemperature({
				tokenizer,
				logits: $modelData.logits,
				temperature: value,
				topK: 50,
				sampleK: 20
			});
		});

		return () => {
			unsubscribeInputText();
			unsubscribeTemperature();
		};
	});

	// visual elements
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
</script>

<div
	class="main-section h-full w-full"
	style={`--vector-height: ${$vectorHeight}px;--title-height: ${titleHeight}px;--content-height:${vizHeight - titleHeight}px;`}
>
	{#if !!$expandedBlock.id}
		<div class="dim" transition:fade={{ duration: 100 }}></div>
		<div
			class={classNames('dim-partial left', `${$expandedBlock.id || ''}`)}
			transition:fade={{ duration: 100 }}
		></div>
		<div
			class={classNames('dim-partial right', `${$expandedBlock.id || ''}`)}
			transition:fade={{ duration: 100 }}
		></div>
	{/if}
	<!-- <Spinner color={theme.colors['primary'][500]} /> -->
	<div class="sankey opacity-1" class:attention={$expandedBlock.id === 'attention'}>
		<Sankey />
	</div>
	<div class="nodes resize-watch">
		<div class="steps" class:expanded={!!$expandedBlock.id} bind:offsetHeight={vizHeight}>
			<Embedding className="step" />
			<Attention className="step" />
			<Mlp className="step" />
			<SubsequentBlocks className="step" />
			<LinearSoftmax className="step" />
		</div>

		<WeightPopovers />
	</div>
</div>

<style lang="scss">
	.nodes {
		height: 100%;
		width: 100%;
		padding: 1rem 0 3rem 0;
		position: relative;
	}
	.steps {
		width: 100%;
		height: 100%;
		position: relative;
		display: grid;
		grid-template-columns: 1fr 2fr 1fr 0.5fr 0.5fr;
		grid-template-rows: var(--title-height) 1fr;

		&.expanded {
			:global(.step .title) {
				padding-bottom: 3rem;
			}
		}
	}

	:global(.step) {
		height: 100%;
		display: contents;
	}

	:global(.step .title) {
		z-index: 100;
		display: flex;
		flex-direction: column;
		justify-content: end;
		grid-row: 1;
		color: theme('colors.gray.400');
		opacity: 0.7;
		white-space: nowrap;
		padding-bottom: 2rem;
		overflow: visible;
		min-width: 0;
		transition: all 0.5s;
	}

	:global(.step .title.expandable) {
		cursor: pointer;
		&:hover {
			color: theme('colors.gray.600');
		}
	}

	:global(.step .content) {
		grid-row: 2;
		height: fit-content;
	}

	:global(.column) {
		// z-index: 100;
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
			z-index: 102;
		}
	}

	:global(.vector),
	:global(.sub-vector) {
		position: relative;
		z-index: 101;
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
		z-index: 101;
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
	:global(.label.float-right) {
		position: absolute;
		left: -0.8rem;
		// transform: translateX(100%);
		// text-align: left;
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
	}
	:global(.bounding.active) {
		opacity: 0.8;
	}

	:global(.transformer-bounding) {
		z-index: 200;
		pointer-events: none;
		padding: 3rem 0;
		/* padding-bottom: 1rem; */
		width: 100%;
		height: calc(var(--content-height) - 2rem);
		top: -5rem;
		overflow: visible;
		border: 2px dashed theme('colors.blue.400');

		:global(.bounding-title) {
			color: theme('colors.blue.500');
			position: absolute;
			top: 0;
			left: 0;
			transform: translate(0, -50%);
			background-color: white;
		}
	}
	:global(.transformer-bounding.active) {
		opacity: 1;
	}

	:global(.popover) {
		z-index: 999;
		max-width: 40rem;
		max-height: 30rem;
	}

	:global(.tooltip) {
		z-index: 999;
		background-color: white !important;
		color: theme('colors.gray.600') !important;
		border: 1px solid theme('colors.gray.200') !important;
		padding: 0.2rem 0.5rem !important;
		font-size: 0.8rem !important;
		white-space: nowrap;
		font-weight: 300 !important;
		border-color: theme('colors.gray.200') !important;
	}
	.dim {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		z-index: 800;
		background-color: white;
		opacity: 0.7;
		user-select: none;
	}
	.dim-partial {
		z-index: 850;
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

		&.embedding {
			&.left {
				display: none;
			}
			&.right {
				width: 60%;
			}
		}
		&.attention {
			&.left {
				width: 20%;
			}
			&.right {
				width: 20%;
			}
		}
		&.softmax {
			&.left {
				width: 60%;
			}
			&.right {
				display: none;
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
				z-index: 820 !important;
				pointer-events: none;
			}
			:global(.sankey-top > g) {
				opacity: 0.3;
			}
			:global(.sankey-top > g.attention) {
				opacity: 1;
			}
		}
	}
</style>

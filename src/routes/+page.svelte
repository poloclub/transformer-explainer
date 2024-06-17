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
		predictedColor,
		modelSession
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
	import { mergeChunks } from '~/utils/mergeChunk';
	import WeightPopovers from '~/components/WeightPopovers.svelte';

	// expanded state control
	let isExpanded = false;
	$: if ($expandedBlock.id !== null) {
		isExpanded = true;
	} else {
		isExpanded = false;
	}

	// run model
	onMount(async () => {
		// const modelUrl = `${base}/gpt2-quant.onnx`;
		// const url = `${base}/gpt2.onnx`;

		const chunkNum = 10;
		const chunkUrls = Array(chunkNum)
			.fill(0)
			.map((d, i) => `${base}/gpt2-quant.onnx.part${i}`);

		const mergedArray = await mergeChunks(chunkUrls);

		// Create a Blob from the merged array
		const blob = new Blob([mergedArray], { type: 'application/octet-stream' });

		// Create a URL for the Blob
		const url = URL.createObjectURL(blob);

		// Create ONNX session using the Blob URL
		const session = await ort.InferenceSession.create(url, {
			// logSeverityLevel: 0
		});

		modelSession.set(session);

		const unsubscribeInputText = inputText.subscribe((value) => {
			runModel(value, $temperature);
		});

		let initialRun = true; // prevent redundant initial adjustTemperature
		const unsubscribeTemperature = temperature.subscribe((value) => {
			if (initialRun) {
				initialRun = false;
				return;
			}
			adjustTemperature($modelData?.prediction, value);
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
		headContentHeight.set($tokens.length * vectorHeightVal * 3 + gaps);
	};

	$: if (vizHeight || $tokens.length) {
		calculateVectorHeight();
	}
</script>

<div
	class="main-section h-full"
	style={`--vector-height: ${$vectorHeight}px;--title-height: ${titleHeight}px;`}
>
	<!-- <svg width="500" height="500" xmlns="http://www.w3.org/2000/svg">
		<defs>
			<mask id="reveal-mask">
				<rect x="0" y="0" width="0" height="800" fill="white">
					<animate attributeName="width" from="0" to="1200" dur="3s" fill="freeze" />
				</rect>
			</mask>
		</defs>
		<path
			class="sankeyy"
			fill="url(#purple-indigo)"
			stroke="none"
			stroke-width="2"
			opacity="1"
			d="
		  M 913.34375,100.28125
		  C 993.34375,100.28125 995.0078125,722.9140625 1075.0078125,722.9140625
		  L 1087.0078125,722.9140625
		  L 1087.0078125,771.828125
		  L 1075.0078125,771.828125
		  C 995.0078125,771.828125 993.34375,704.5625 913.34375,704.5625
		  Z
		"
			mask="url(#reveal-mask)"
		></path>
	</svg> -->
	<!-- <Spinner color={theme.colors['primary'][500]} /> -->
	<div class="sankey opacity-1">
		<Sankey />
	</div>
	<div class="nodes resize-watch">
		<div class="steps" class:expanded={isExpanded} bind:offsetHeight={vizHeight}>
			<Embedding className="step" />
			<Attention className="step" />
			<Mlp className="step" />
			<SubsequentBlocks className="step" />
			<LinearSoftmax className="step" />
		</div>

		<WeightPopovers />
	</div>
	<div
		class={classNames('dim pointer-events-none', `${$expandedBlock.id || ''}`, {
			active: !!$expandedBlock.id
		})}
	></div>
</div>

<style lang="scss">
	:global(.last) {
		opacity: 0;
	}
	.nodes {
		height: 100%;
		width: 100%;
		padding: 1rem 0 3rem 0;
		position: relative;
	}
	.sankey {
		position: absolute;
		left: 0;
		top: 0;
		width: 100%;
		height: 100%;
	}
	.steps {
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
		height: calc(var(--vector-height) * 3.2);
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
		width: 7rem;
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
		right: 1rem;
		transform: translateX(100%);
		text-align: left;
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
		height: calc(100% + 5rem);
		top: -5rem;
		overflow: visible;
		border: 2px dashed theme('colors.blue.300');

		:global(.title) {
			color: theme('colors.blue.400');
			position: absolute;
			top: -2rem;
			left: 0;
		}
	}
	:global(.transformer-bounding.active) {
		opacity: 1;
	}

	:global(.popover) {
		z-index: 999;
		// overflow: hidden;
		max-width: 40rem;
		max-height: 30rem;
		// position: absolute;
	}

	.dim {
		transition: opacity 1s;
		opacity: 0;

		z-index: 300;
		position: absolute;
		top: 0;
		height: 100%;
		background: linear-gradient(90deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 1) 80%);

		&.active {
			opacity: 1;
		}

		&.embedding {
			right: 0;
			width: 60vw;
		}
		&.softmax {
			left: 0;
			width: 50vw;
			background: linear-gradient(-90deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 1) 80%);
		}
		&.attention {
			right: 0;
			width: 30vw;
		}
	}
</style>

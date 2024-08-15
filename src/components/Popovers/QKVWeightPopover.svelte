<script lang="ts">
	import { Card } from 'flowbite-svelte';
	import { modelMeta, tokens, rootRem } from '~/store';
	import * as d3 from 'd3';
	import { gsap } from '~/utils/gsap';
	import { fade } from 'svelte/transition';
	import Matrix from '~/components/Matrix.svelte';
	import { onDestroy, onMount } from 'svelte';
	import resolveConfig from 'tailwindcss/resolveConfig';
	import tailwindConfig from '../../../tailwind.config';
	import classNames from 'classnames';
	import Katex from '~/utils/Katex.svelte';

	const { theme } = resolveConfig(tailwindConfig);

	const tokenGap = 6;

	// generate data
	const visibleDimension = 20;
	$: tokenLen = $tokens.length;
	$: embeddingData = Array(tokenLen)
		.fill(0)
		.map((col) =>
			Array(visibleDimension)
				.fill(0)
				.map((d) => Math.random())
		);

	const qkvWeightData = Array(visibleDimension * 3)
		.fill(0)
		.map((col) =>
			Array(visibleDimension)
				.fill(0)
				.map((d) => Math.random())
		);
	const qkvBiasData = Array(1)
		.fill(0)
		.map((col) =>
			Array(visibleDimension * 3)
				.fill(0)
				.map((d) => Math.random())
		);

	$: qkvOutData = Array(tokenLen)
		.fill(0)
		.map((col) =>
			Array(visibleDimension * 3)
				.fill(0)
				.map((d) => Math.random())
		);

	// color scale
	const embeddingColorScale = (d, i) => {
		return d3.interpolate(theme.colors['gray'][100], theme.colors['gray'][400])(d);
	};

	const qkvColorScale = (d, i) => {
		let color = i < 20 ? 'blue' : i < 40 ? 'red' : 'green';
		return d3.interpolate(theme.colors[color][100], theme.colors[color][400])(d);
	};

	let isAnimationActive = false;
	let progress = 0;
	let timeline = gsap.timeline();

	onMount(() => {
		timeline.eventCallback('onUpdate', () => {
			progress = timeline.progress();
			if (progress === 1) isAnimationActive = false;
		});

		setTimeout(() => {
			isAnimationActive = true;
			draw();
		}, 300);
	});

	onDestroy(() => {
		if (timeline) {
			timeline.kill();
			timeline = null;
		}
	});

	// animation
	const draw = () => {
		const embeddingRows = d3.selectAll('.weight-popover-content .token-embedding g.g-row').nodes();
		const weightCols = d3.selectAll('.weight-popover-content .qkv-weights g.g-col').nodes();
		const weightBiasCells = d3.selectAll('.weight-popover-content .qkv-bias rect').nodes();

		const outRows = d3.selectAll('.weight-popover-content .qkv-output g.g-row').nodes();

		// first row detail animation
		// timeline.set(weightBiasCells, { opacity: 0.1 });
		timeline.set('.formula .first-row', { opacity: 1 });
		timeline.set('.formula .total', { opacity: 0 });

		const firstOutputRowRects = d3.select(outRows[0]).selectAll('rect').nodes();
		const firstEmbeddingRowRects = d3.select(embeddingRows[0]).selectAll('rect').nodes();

		firstOutputRowRects.forEach((outputRect, outCellIdx) => {
			const isFirstOutCell = outCellIdx === 0;
			const firstWeightColRects = d3.select(weightCols[outCellIdx]).selectAll('rect').nodes();
			timeline.set(firstEmbeddingRowRects, { opacity: 0.1 });

			firstEmbeddingRowRects.forEach((embeddingRect, i) => {
				timeline.fromTo(
					embeddingRect,
					{ opacity: 0.1 },
					{
						opacity: 1,
						duration: isFirstOutCell ? 0.1 : 0.002
					},
					`<50%`
				);
				timeline.fromTo(
					firstWeightColRects[i],
					{ opacity: 0.1 },
					{
						opacity: 1,
						duration: isFirstOutCell ? 0.1 : 0.002
					},
					`<50%`
				);
			});

			timeline.to(
				weightBiasCells[outCellIdx],
				{
					opacity: 1,
					duration: isFirstOutCell ? 1 : 0.002
				},
				'<'
			);
			timeline.from(
				outputRect,
				{
					opacity: 0,
					fill: 'black',
					duration: isFirstOutCell ? 1 : 0.002
				},
				'<'
			);

			if (isFirstOutCell) {
				timeline.to('.formula .first-row', { opacity: 0, duration: 0.3 });
				timeline.to('.formula .total', { opacity: 1, duration: 0.3 }, `<`);
			}
		});

		// rest row animation
		let previousRowIdx = 0;

		// out vectors
		outRows.forEach(function (row, rowIdx) {
			if (rowIdx === 0) return;

			const outputCells = d3.select(row).selectAll('rect').nodes();
			const embeddingRowRects = d3.select(embeddingRows[rowIdx]).selectAll('rect').nodes();

			// Check if rowIdx has changed
			if (previousRowIdx !== null && previousRowIdx !== rowIdx) {
				timeline.fromTo(
					embeddingRowRects,
					{ opacity: 0.1 },
					{
						opacity: 1,
						duration: 0.01
					},
					`<50%`
				);

				const weightColRects = d3
					.selectAll('.weight-popover-content .qkv-weights g.g-col rect')
					.nodes();
				timeline.set(weightColRects, { opacity: 0.1 });
				timeline.set(weightBiasCells, { opacity: 0.1 });
			}

			outputCells.forEach((d, colIdx) => {
				const weightColRects = d3.select(weightCols[colIdx]).selectAll('rect').nodes();

				timeline.fromTo(
					weightColRects,
					{ opacity: 0.1 },
					{
						opacity: 1,
						duration: 0.01
					},
					`<50%`
				);

				timeline.from(
					d,
					{
						opacity: 0,
						duration: 0.01
					},
					`<50%`
				);
				timeline.fromTo(
					weightBiasCells[colIdx],
					{ opacity: 0.1 },
					{
						opacity: 1,
						duration: 0.01
					},
					'<'
				);
			});
			previousRowIdx = rowIdx;
		});
	};
</script>

<Card
	class={classNames('weight-popover popover bg-white text-sm font-light text-gray-500')}
	transition={fade}
	params={{ duration: 100 }}
>
	<div
		class="weight-popover-title rounded-t-md border-b border-gray-200 bg-gray-100 px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
	>
		<h3 class="font-semibold text-gray-900">QKV Calculation</h3>
		{#if isAnimationActive}
			<button
				class="play-control forward"
				on:click={() => {
					timeline.progress(1);
					isAnimationActive = false;
				}}
				><svg
					class="h-5 w-5 text-gray-500"
					aria-hidden="true"
					xmlns="http://www.w3.org/2000/svg"
					width="24"
					height="24"
					fill="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						fill-rule="evenodd"
						d="M17 6a1 1 0 1 0-2 0v4L8.6 5.2A1 1 0 0 0 7 6v12a1 1 0 0 0 1.6.8L15 14v4a1 1 0 1 0 2 0V6Z"
						clip-rule="evenodd"
					/>
				</svg>
			</button>
		{:else}
			<button
				class="play-control restart"
				on:click={() => {
					isAnimationActive = true;
					timeline.restart();
				}}
			>
				<svg
					class="h-5 w-5 text-gray-500"
					aria-hidden="true"
					xmlns="http://www.w3.org/2000/svg"
					width="24"
					height="24"
					fill="none"
					viewBox="0 0 24 24"
				>
					<path
						stroke="currentColor"
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M17.651 7.65a7.131 7.131 0 0 0-12.68 3.15M18.001 4v4h-4m-7.652 8.35a7.13 7.13 0 0 0 12.68-3.15M6 20v-4h4"
					/>
				</svg></button
			>
		{/if}
	</div>
	<div class="content">
		<div class="weight-popover-content flex items-center justify-start">
			<div class="matrix flex flex-col items-center">
				<div class="tokens" style={`gap:${tokenGap}px`}>
					{#each $tokens as token, index}
						<div class="token-label"><span>{token}</span></div>
					{/each}
				</div>
			</div>
			<div class="matrix flex flex-col items-center">
				<div class="title self-end">Embedding</div>
				<!-- (tokenLen, 768) -->
				<Matrix
					className="token-embedding"
					data={embeddingData}
					showSize={false}
					cellHeight={rootRem * 0.8}
					cellWidth={2}
					rowGap={tokenGap}
					colorScale={embeddingColorScale}
				/>
				<div class="size">matrix({tokenLen}, {$modelMeta.dimension})</div>
			</div>
			<div class="operator"><div class="symbol">&times;</div></div>
			<div class="matrix flex flex-col items-center">
				<div class="title">Q·K·V Weights</div>
				<!-- (768,2034) -->
				<div class="flex gap-0">
					<Matrix
						className="qkv-weights"
						data={qkvWeightData}
						showSize={false}
						groupBy={'col'}
						cellHeight={3}
						cellWidth={3}
						rowGap={0}
						colorScale={qkvColorScale}
					/>
				</div>

				<div class="size">matrix({$modelMeta.dimension}, {$modelMeta.dimension * 3})</div>
			</div>
			<div class="operator"><div class="symbol">+</div></div>
			<div class="matrix flex flex-col items-center">
				<div class="title">Bias</div>
				<!-- (768) -->
				<Matrix
					className="qkv-bias"
					data={qkvBiasData}
					showSize={false}
					groupBy={'col'}
					cellHeight={2}
					cellWidth={8}
					rowGap={0}
					colorScale={embeddingColorScale}
				/>
				<div class="size">vector({$modelMeta.dimension * 3})</div>
			</div>
			<div class="operator"><div class="symbol">=</div></div>
			<div class="matrix flex flex-col items-center">
				<div class="tokens" style={`gap:${tokenGap}px`}>
					{#each $tokens as token, index}
						<div class="token-label"><span>{token}</span></div>
					{/each}
				</div>
			</div>
			<div class="matrix flex flex-col items-center">
				<div class="title">Q·K·V</div>
				<!-- (tokenLen, 2034) -->
				<div class="flex">
					<Matrix
						className="qkv-output"
						data={qkvOutData}
						showSize={false}
						cellHeight={rootRem * 0.8}
						cellWidth={2}
						rowGap={tokenGap}
						colorScale={qkvColorScale}
					/>
				</div>
				<div class="size">matrix({tokenLen}, {$modelMeta.dimension * 3})</div>
			</div>
		</div>
		<div class="formula">
			<div class="first-row">
				<Katex
					displayMode
					math={`
			( E_{1,1} \\cdot W_{1,1} + E_{1,2} \\cdot W_{2,1} + \\cdots + E_{1,768} \\cdot W_{768,1}) + b_1 = QKV_{1,1}`}
				/>
			</div>
			<div class="total">
				<Katex
					displayMode
					math={`
			\\sum_{d=1}^{768} E_{id} \\cdot W_{dj} + b_j = QKV_{ij} 
			`}
				/>
			</div>
		</div>
	</div>
</Card>

<style lang="scss">
	.formula {
		font-size: 0.7rem;
		position: relative;
		padding-bottom: 0.5rem;
		.first-row {
			opacity: 1;
			width: 100%;
			position: absolute;
		}
		.total {
			font-size: 0.6rem;
			opacity: 0;
		}
	}
	:global(.weight-popover) {
		width: max-content !important;
		max-width: 50rem !important;
		// max-height: 20rem !important;
		padding: 0 !important;
		display: flex;
		flex-direction: column;
	}

	.weight-popover-title {
		flex-shrink: 0;
		display: flex;
		align-items: center;
		gap: 1rem;
		justify-content: space-between;
	}
	.content {
		width: 100%;
		overflow-y: scroll;
		overflow-x: hidden;
	}
	.weight-popover-content {
		padding: 3rem 2rem 2.5rem 1rem;
		width: 100%;
	}
	.play-control {
		// position: absolute;
		// right: 1rem;
		// top: 0;
		// height: 2.2rem;
	}

	.tokens {
		padding-right: 0.3rem;
		display: flex;
		flex-direction: column;
	}

	.token-label {
		font-size: 0.8rem;
		line-height: 1;
		text-align: right;
		color: theme('colors.gray.500');
	}

	.matrix {
		height: 100%;
		position: relative;
		justify-content: space-around;
		.title,
		.size {
			color: theme('colors.gray.900');
			font-size: 0.7rem;
			white-space: nowrap;
			position: absolute;
			top: -2rem;
		}
		.size {
			top: inherit;
			bottom: -1.5rem;
		}
	}
	.operator {
		padding: 0 0.5rem;
		font-size: 1.2rem;
	}
</style>

<script lang="ts">
	import { Card, Popover } from 'flowbite-svelte';
	import { QuestionCircleSolid, ChevronRightOutline } from 'flowbite-svelte-icons';
	import { modelMeta, expandedBlock, tokens, inputText, rootRem, vectorHeight } from '~/store';
	import * as d3 from 'd3';
	import { gsap, Flip } from '~/utils/gsap';
	import { fade } from 'svelte/transition';
	import Matrix from '~/components/Matrix.svelte';
	import { onMount } from 'svelte';
	import resolveConfig from 'tailwindcss/resolveConfig';
	import tailwindConfig from '../../../tailwind.config';
	import AnimationControl from '../AnimationControl.svelte';
	import classNames from 'classnames';

	const { theme } = resolveConfig(tailwindConfig);

	const tokenGap = 6;
	let timeline = gsap.timeline({});

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

	// onMount(() => {
	// 	draw();
	// });

	const embeddingColorScale = (d, i) => {
		return d3.interpolate(theme.colors['gray'][100], theme.colors['gray'][400])(d);
	};

	const qkvColorScale = (d, i) => {
		let color = i < 20 ? 'blue' : i < 40 ? 'red' : 'green';
		return d3.interpolate(theme.colors[color][100], theme.colors[color][400])(d);
	};

	const highlightColor = theme.colors['red'][500];

	const draw = () => {
		const embeddingRows = d3.selectAll('.weight-popover-content .token-embedding g.g-row').nodes();
		const weightCols = d3.selectAll('.weight-popover-content .qkv-weights g.g-col').nodes();
		const weightBiasCells = d3.selectAll('.weight-popover-content .qkv-bias rect').nodes();

		const outRows = d3.selectAll('.weight-popover-content .qkv-output g.g-row').nodes();

		// first row detail animation
		timeline.set(weightBiasCells, { opacity: 0.1 });

		const firstOutputRowRects = d3.select(outRows[0]).selectAll('rect').nodes();
		const firstEmbeddingRowRects = d3.select(embeddingRows[0]).selectAll('rect').nodes();

		firstOutputRowRects.forEach((outputRect, outCellIdx) => {
			const firstWeightColRects = d3.select(weightCols[outCellIdx]).selectAll('rect').nodes();
			timeline.set(firstEmbeddingRowRects, { opacity: 0.1 });

			firstEmbeddingRowRects.forEach((embeddingRect, i) => {
				const isFirst = i === 0 && outCellIdx === 0;
				timeline.fromTo(
					embeddingRect,
					{ opacity: 0.1 },
					{
						opacity: 1,
						duration: isFirst ? 1 : 0.005
					},
					`<50%`
				);
				timeline.fromTo(
					firstWeightColRects[i],
					{ opacity: 0.1 },
					{
						opacity: 1,
						duration: isFirst ? 1 : 0.005
					},
					`<50%`
				);
			});

			timeline.to(
				weightBiasCells[outCellIdx],
				{
					opacity: 1,
					duration: outCellIdx === 0 ? 1 : 0.005
				},
				`<50%`
			);
			timeline.from(
				outputRect,
				{
					opacity: 0,
					duration: outCellIdx === 0 ? 1 : 0.005
				},
				`<50%`
			);
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
			});
			previousRowIdx = rowIdx;
		});
	};
</script>

<Card
	class={classNames('weight-popover popover bg-white text-sm font-light text-gray-500')}
	transition={fade}
	params={{ duration: 300 }}
>
	<div
		class="rounded-t-md border-b border-gray-200 bg-gray-100 px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
	>
		<h3 class="font-semibold text-gray-900 dark:text-white">Weight Multiplication</h3>
	</div>
	<div class="weight-content">
		<!-- <div class="desc">
			<p>
				1. Gather the embedding vectors for each token into a single embedding matrix. This matrix's
				dimensions are (batch size, sequence length, embedding dimension).
			</p>
			<p>
				2. Creating Query, Key, and Value Weight Matrices: Use one large weight matrix to generate
				query, key, and value vectors. The size of this weight matrix is (embedding dimension, 3 *
				embedding dimension). This allows you to compute the query, key, and value vectors in one
				step.
			</p>
			<p>
				3. Generating Query, Key, and Value Vectors: Multiply the large weight matrix with the
				embedding matrix to create query, key, and value vectors. The result is a matrix with
				dimensions (batch size, sequence length, 3 * embedding dimension). Split this matrix into
				three parts to get the individual query, key, and value vectors.
			</p>
			<p>
				4. Converting to Multi-Head: Split the generated query, key, and value vectors into multiple
				heads. Each head's dimensions are (batch size, sequence length, number of heads, head
				dimension). Here, the head dimension is calculated as embedding dimension / number of heads.
			</p>
		</div> -->

		<!-- <AnimationControl tl={timeline} slider={false}></AnimationControl> -->

		<button
			class="play-control"
			on:click={() => {
				draw();
			}}>click</button
		>
		<button class="play-control">
			<!-- {#if timeline && !timeline.isActive()}
				<svg
					on:click={() => {
						timeline.play();
					}}
					class="h-5 w-5 text-gray-400"
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 -960 960 960"
					fill="none"
					><path
						fill="currentColor"
						d="M360-320h80v-320h-80v320Zm160 0h80v-320h-80v320ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Z"
					/></svg
				>{:else if timeline && timeline.isActive()}
				<svg
					on:click={() => {
						timeline.pause();
					}}
					class="h-5 w-5 text-gray-400"
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 -960 960 960"
					fill="none"
					><path
						fill="currentColor"
						d="m380-300 280-180-280-180v360ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Z"
					/></svg
				>
			{/if} -->
		</button>
		<div class="weight-popover-content flex items-center justify-start">
			<div class="matrix flex flex-col items-center">
				<div class="tokens" style={`gap:${tokenGap}px`}>
					{#each $tokens as token, index}
						<div class="token-label"><span>{token}</span></div>
					{/each}
				</div>
			</div>
			<div class="matrix flex flex-col items-center">
				<div class="title self-end">Token Embedding</div>
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
				<div class="size">({tokenLen}, {$modelMeta.dimension})</div>
			</div>
			<div class="operator"><div class="symbol">&times;</div></div>
			<div class="matrix flex flex-col items-center">
				<div class="title">QKV Weights</div>
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

				<div class="size">({tokenLen},{$modelMeta.dimension * 3})</div>
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
				<div class="size">(1, {$modelMeta.dimension * 3})</div>
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
				<div class="title">QKV Vectors</div>
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
				<div class="size">({tokenLen}, {$modelMeta.dimension * 3})</div>
			</div>

		</div>
	</div>
</Card>

<style lang="scss">
	:global(.weight-popover) {
		width: max-content !important;
		max-width: 50rem !important;
		max-height: 20rem !important;
		overflow: hidden;
		padding: 0 !important;
	}

	.weight-popover-content {
		padding: 3rem 2rem 3rem 1rem;
	}
	.play-control {
		position: absolute;
		right: 1rem;
		top: 0;
		height: 2.2rem;
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

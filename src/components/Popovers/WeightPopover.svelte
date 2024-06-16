<script lang="ts">
	import { Popover } from 'flowbite-svelte';
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

	const { theme } = resolveConfig(tailwindConfig);

	export let triggeredBy: string;
	export let title: string | undefined = undefined;

	// export let data: any;

	let cellLgHeight = 10 * 1.5;
	let cellLgWidth = 10 * 1.5;

	const colorScale = d3.interpolate('white', theme.colors['blue'][600]);

	const tokenGap = 6;

	let timeline = gsap.timeline({});

	// onMount(() => {
	// 	draw();
	// });

	const draw = () => {
		const embeddingRows = d3.selectAll('.weight-popover-content .token-embedding g.g-row').nodes();
		const weightCols = d3.selectAll('.weight-popover-content .qkv-weights g.g-col').nodes();
		const outRows = d3.selectAll('.weight-popover-content .qkv-output g.g-row').nodes();

		let previousRowIdx = null;

		outRows.forEach(function (row, rowIdx) {
			const rects = d3.select(row).selectAll('rect').nodes();

			// Check if rowIdx has changed
			if (previousRowIdx !== null && previousRowIdx !== rowIdx) {
				const previousEmbeddingRowRects = d3
					.select(embeddingRows[previousRowIdx])
					.selectAll('rect')
					.nodes();
				timeline.to(previousEmbeddingRowRects, {
					fill: (i, d) => {
						return colorScale(d.__data__);
					},
					duration: 0.05
				});
			}
			rects.forEach((d, colIdx) => {
				const weightColRects = d3.select(weightCols[colIdx]).selectAll('rect').nodes();
				const embeddingRowRects = d3.select(embeddingRows[rowIdx]).selectAll('rect').nodes();

				const isFirst = colIdx === 0 && rowIdx === 0;

				timeline.to([weightColRects, embeddingRowRects], {
					fill: (i, d) => {
						return theme.colors['yellow'][600];
					},
					duration: isFirst ? 0.5 : 0.01
				});

				timeline.to(
					weightColRects,
					{
						fill: (i, d) => {
							return colorScale(d.__data__);
						},
						duration: isFirst ? 0.5 : 0.01
					},
					`<50%`
				);

				timeline.from(
					d,
					{
						fill: 'white',
						duration: isFirst ? 0.5 : 0.01
					},
					`<50%`
				);
			});
			previousRowIdx = rowIdx;
		});

		if (previousRowIdx !== null) {
			const previousEmbeddingRowRects = d3
				.select(embeddingRows[previousRowIdx])
				.selectAll('rect')
				.nodes();
			timeline.to(previousEmbeddingRowRects, {
				fill: (i, d) => {
					return colorScale(d.__data__);
				},
				duration: 0.01
			});
		}
	};

	onMount(() => {
		draw();
		timeline.play();
	});

	$: tokenLen = $tokens.length;
	const matrixHeight = Math.max(120, rootRem * 0.8 * tokenLen);
</script>

<button class="btn"> click</button>
<Popover
	triggeredBy={'.btn'}
	trigger="click"
	open={true}
	class="weight-popover popover bg-white text-sm font-light text-gray-500"
	placement="right-start"
	arrow={false}
	transition={fade}
	params={{ duration: 300 }}
	title="Weight Multiplication"
>
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
						<div class="label"><span>{token}</span></div>
					{/each}
				</div>
			</div>
			<div class="matrix flex flex-col items-center">
				<div class="title self-end">Token Embedding</div>
				<!-- (tokenLen, 768) -->
				<!-- (tokenLen,20) -->
				<Matrix
					className="token-embedding"
					data={Array(tokenLen)
						.fill(0)
						.map((col) =>
							Array(20)
								.fill(0)
								.map((d) => Math.random())
						)}
					showSize={false}
					cellHeight={rootRem * 0.8}
					cellWidth={2}
					rowGap={tokenGap}
					colorScale={'gray'}
				/>
				<div class="size">({tokenLen},{$modelMeta.dimension})</div>
			</div>
			<div class="operator"><div class="symbol">&times;</div></div>
			<div class="matrix flex flex-col items-center">
				<div class="title">QKV Weights</div>
				<!-- (768,2034) -->
				<!-- (20,60) -->
				<div class="flex gap-0">
					<Matrix
						className="qkv-weights"
						data={Array(60)
							.fill(0)
							.map((col) =>
								Array(20)
									.fill(0)
									.map((d) => Math.random())
							)}
						showSize={false}
						groupBy={'col'}
						cellHeight={3}
						cellWidth={3}
						rowGap={0}
						colorScale={(d, i) => {
							let color = i < 20 ? 'blue' : i < 40 ? 'red' : 'green';
							return d3.interpolate('white', theme.colors[color][400])(d);
						}}
					/>
				</div>

				<div class="size">({tokenLen},{$modelMeta.dimension * 3})</div>
			</div>
			<div class="operator"><div class="symbol">+</div></div>
			<div class="matrix flex flex-col items-center">
				<div class="title">QKV Bias</div>
				<!-- (768) -->
				<!-- (20) -->
				<Matrix
					className="qkv-bias"
					data={Array(1)
						.fill(0)
						.map((col) =>
							Array(60)
								.fill(0)
								.map((d) => Math.random())
						)}
					showSize={false}
					groupBy={'col'}
					cellHeight={1}
					cellWidth={8}
					rowGap={0}
				/>
				<div class="size">({$modelMeta.dimension * 3})</div>
			</div>
			<div class="operator"><div class="symbol">=</div></div>
			<div class="matrix flex flex-col items-center">
				<div class="tokens" style={`gap:${tokenGap}px`}>
					{#each $tokens as token, index}
						<div class="label"><span>{token}</span></div>
					{/each}
				</div>
			</div>
			<div class="matrix flex flex-col items-center">
				<div class="title">QKV Vectors</div>
				<!-- (tokenLen, 2034) -->
				<!-- (tokenLen, 60) -->
				<div class="flex">
					<Matrix
						className="qkv-output"
						data={Array(tokenLen)
							.fill(0)
							.map((col) =>
								Array(60)
									.fill(0)
									.map((d) => Math.random())
							)}
						showSize={false}
						cellHeight={rootRem * 0.8}
						cellWidth={2}
						rowGap={tokenGap}
						colorScale={(d, i) => {
							let color = i < 20 ? 'blue' : i < 40 ? 'red' : 'green';
							return d3.interpolate('white', theme.colors[color][400])(d);
						}}
					/>
				</div>
				<div class="size">({tokenLen},{$modelMeta.dimension * 3})</div>
			</div>
		</div>
	</div>
</Popover>

<style lang="scss">
	:global(.weight-popover) {
		max-width: 50rem;
		max-height: 20rem;
		overflow: hidden;
	}

	.weight-popover-content {
		padding: 3rem 1rem 2rem 1rem;
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

	.label {
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

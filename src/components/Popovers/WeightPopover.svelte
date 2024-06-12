<script lang="ts">
	import { Popover } from 'flowbite-svelte';
	import { QuestionCircleSolid, ChevronRightOutline } from 'flowbite-svelte-icons';
	import { modelMeta, expandedBlock, tokens } from '~/store';
	import * as d3 from 'd3';
	import { gsap, Flip } from '~/utils/gsap';
	import { fade } from 'svelte/transition';
	import Matrix from '~/components/Matrix.svelte';
	import { onMount } from 'svelte';
	import resolveConfig from 'tailwindcss/resolveConfig';
	import tailwindConfig from '../../../tailwind.config';

	const { theme } = resolveConfig(tailwindConfig);

	export let triggeredBy: string;
	export let title: string | undefined = undefined;

	export let data: any;

	let cellLgHeight = 10 * 1.5;
	let cellLgWidth = 10 * 1.5;

	const colorScale = d3.interpolate('white', theme.colors['primary'][600]);

	const draw = () => {
		const embeddingRows = d3.selectAll('.weight-popover-content .token-embedding g.g-row').nodes();
		const weightCols = d3.selectAll('.weight-popover-content .key-weights g.g-col').nodes();
		const outRows = d3.selectAll('.weight-popover-content .key-output g.g-row').nodes();

		const timeline = gsap.timeline();
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
						return theme.colors['secondary'][600];
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
</script>

<!-- <Popover
	open={true}
	{triggeredBy}
	class="weight-popover z-[9999] bg-white text-sm font-light text-gray-500 "
	placement="right-end"
	arrow={false}
	transition={fade}
	params={{ duration: 300 }}
> -->
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

	<button
		on:click={() => {
			draw();
		}}>animation start</button
	>
	<div class="p-3">
		{#if title}
			<div class="title">
				{title}
			</div>
		{/if}
		<div class="weight-popover-content flex items-center justify-start">
			<div class="tokens">
				{#each $tokens as token, index}
					<div class="label"><span>{token}</span></div>
				{/each}
			</div>
			<Matrix
				className="token-embedding"
				data={Array(8)
					.fill(0)
					.map((col) =>
						Array(20)
							.fill(0)
							.map((d) => Math.random())
					)}
				showSize={'(4, 768)'}
				cellHeight={10}
				cellWidth={10}
			/>
			<div class="operator">X</div>
			<Matrix
				className="key-weights"
				data={Array(10)
					.fill(0)
					.map((col) =>
						Array(10)
							.fill(0)
							.map((d) => Math.random())
					)}
				showSize={'(768, 64)'}
				groupBy={'col'}
				cellHeight={cellLgWidth * 3}
				cellWidth={cellLgWidth * 3}
				rowGap={0}
			/>
			<div class="operator">+</div>
			<Matrix
				className="key-weights"
				data={Array(1)
					.fill(0)
					.map((col) =>
						Array(10)
							.fill(0)
							.map((d) => Math.random())
					)}
				showSize={'(768, 64)'}
				groupBy={'col'}
				cellHeight={cellLgWidth * 3}
				cellWidth={cellLgWidth * 3}
				rowGap={0}
			/>
			<div class="operator">=</div>
			<Matrix
				className="key-output"
				data={Array(4)
					.fill(0)
					.map((col) =>
						Array(12)
							.fill(0)
							.map((d) => Math.random())
					)}
				cellHeight={cellLgWidth * 3}
				cellWidth={cellLgWidth * 3}
				showSize={'(4, 64)'}
			/>
		</div>
	</div>
</div>
<!-- </Popover> -->

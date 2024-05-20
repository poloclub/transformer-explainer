<script lang="ts">
	import { Popover } from 'flowbite-svelte';
	import { QuestionCircleSolid, ChevronRightOutline } from 'flowbite-svelte-icons';
	import { modelMeta, cellHeight, cellWidth, expandedBlock } from '~/store';
	import * as d3 from 'd3';
	import { gsap, Flip } from '~/utils/gsap';
	import { fade } from 'svelte/transition';
	import Matrix from './Matrix.svelte';
	import { onMount } from 'svelte';
	import resolveConfig from 'tailwindcss/resolveConfig';
	import tailwindConfig from '../../tailwind.config';

	const { theme } = resolveConfig(tailwindConfig);

	export let triggeredBy: string;
	export let title: string | undefined = undefined;

	export let data: any;

	let cellLgHeight = $cellHeight * 1.5;
	let cellLgWidth = $cellWidth * 1.5;

	const colorScale = d3.interpolate('white', theme.colors['primary'][600]);

	const draw = () => {
		const embeddingRows = d3.selectAll('.weight-popover-content .token-embedding g.row').nodes();
		const weightCols = d3.selectAll('.weight-popover-content .key-weights g.col').nodes();
		const outRows = d3.selectAll('.weight-popover-content .key-output g.row').nodes();

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
					duration: isFirst ? 0.5 : 0.05
				});

				timeline.to(
					weightColRects,
					{
						fill: (i, d) => {
							return colorScale(d.__data__);
						},
						duration: isFirst ? 0.5 : 0.05
					},
					`<50%`
				);

				timeline.from(
					d,
					{
						fill: 'white',
						duration: isFirst ? 0.5 : 0.05
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
				duration: 0.05
			});
		}
	};
</script>

<Popover
	{triggeredBy}
	class="weight-popover z-[9999] bg-white text-sm font-light text-gray-500 "
	placement="right-end"
	arrow={false}
	transition={fade}
	params={{ duration: 300 }}
>
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
			<Matrix
				className="token-embedding"
				data={Array(4)
					.fill(0)
					.map((col) =>
						Array(12)
							.fill(0)
							.map((d) => Math.random())
					)}
				showSize={'(4, 768)'}
				cellHeight={cellLgWidth * 3}
				cellWidth={cellLgWidth * 3}
				title="Input Embedding"
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
				title="Key Weights for Head 1"
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
				title="Key"
			/>
		</div>
	</div>
</Popover>

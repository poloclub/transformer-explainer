<script lang="ts">
	import * as d3 from 'd3';
	import tailwindConfig from '../../tailwind.config';
	import resolveConfig from 'tailwindcss/resolveConfig';
	import { highlightedToken, rowGap as globalRowGap } from '~/store';
	import { afterUpdate, beforeUpdate } from 'svelte';
	import { color } from 'd3-color';
	import { Tooltip } from 'flowbite-svelte';

	const { theme } = resolveConfig(tailwindConfig);

	export let data: (number | null)[][];
	export let cellHeight: number;
	export let cellWidth: number;
	export let rowGap: number = globalRowGap;
	export let colGap: number = 0;
	export let transpose: boolean = false;
	export let showValue: boolean = false;

	export let rowLen: number;
	export let dimension: number;

	export let groupBy: 'row' | 'col' = 'row';
	export let shape: 'circle' | 'rect' = 'rect';
	export let colorScale: string | ((t: number) => any) | undefined = undefined;

	let svgEl: HTMLOrSVGElement;
	let highlightedIndex: string | number | null;

	$: svgWidth =
		groupBy === 'col'
			? rowLen * cellWidth + (rowLen - 1) * colGap
			: dimension * cellWidth + (dimension - 1) * colGap;
	$: svgHeight =
		groupBy === 'col'
			? dimension * cellHeight + (dimension - 1) * rowGap
			: rowLen * cellHeight + (rowLen - 1) * rowGap;

	// highlightedToken.subscribe(($highlightedToken) => {
	// 	highlightedIndex = $highlightedToken.index;
	// 	if (svgEl) {
	// 		highlightRow();
	// 	}
	// });

	const colorKey = typeof colorScale === 'string' ? colorScale : 'primary';
	const matrixColorScale =
		typeof colorScale === 'function'
			? colorScale
			: d3.interpolate('white', theme.colors[colorKey][500]);

	const highlightColorScale = d3.interpolate('white', theme.colors['secondary'][600]);

	const drawMatrixSvg = () => {
		const svg = d3.select(svgEl);

		if (groupBy === 'col') {
			let cols;
			cols = svg
				.selectAll('g.col')
				.data(data)
				.join('g')
				.attr('class', (d, i) => `col col-${i}`);
			cols.attr('transform', (d, i) => `translate(${i * cellWidth + i * colGap},0)`);

			if (shape === 'rect') {
				cols
					.selectAll('rect.cell')
					.data((d) => d)
					.join('rect')
					.attr('class', 'cell')
					.attr('x', 0)
					.attr('y', (d, i) => i * cellHeight + i * rowGap)
					.attr('width', cellWidth)
					.attr('height', cellHeight)
					.attr('fill', function (d) {
						return matrixColorScale(d);
					});
			}
			if (shape === 'circle') {
				cols
					.selectAll('circle.cell')
					.data((d) => d)
					.join('circle')
					.attr('class', 'cell')
					.attr('cx', 0)
					.attr('cy', (d, i) => i * cellHeight + i * rowGap)
					.attr('r', cellWidth / 2)
					.attr('stroke', theme.colors.gray[500])
					.attr('fill', function (d) {
						return matrixColorScale(d);
					});
			}
		}

		if (groupBy === 'row') {
			let rows;

			rows = svg
				.selectAll('g.g-row')
				.data(data)
				.join('g')
				.attr('class', (d, i) => `g-row g-row-${i}`);

			// .on('click', function (d) {
			// 	if ($highlightedToken.index !== null && !!$highlightedToken.fix) {
			// 		highlightedToken.set({ index: null, fix: false });
			// 	} else {
			// 		const tokenIdx = this.classList[1].split('-')[1];
			// 		highlightedToken.set({ index: Number(tokenIdx), fix: true });
			// 	}
			// })
			// rows
			// 	.on('mouseenter', function (d) {
			// 		if ($highlightedToken.fix) return;
			// 		const tokenIdx = this.classList[1].split('-')[1];
			// 		highlightedToken.update((cur) => ({ ...cur, index: Number(tokenIdx) }));
			// 	})
			// 	.on('mouseleave', function (d) {
			// 		if ($highlightedToken.fix) return;
			// 		highlightedToken.update((cur) => ({ ...cur, index: null }));
			// 	});

			if (shape === 'rect') {
				rows.attr('transform', (d, i) =>
					transpose
						? `translate(${i * cellHeight + i * rowGap},0)`
						: `translate(0,${i * cellHeight + i * rowGap})`
				);

				rows
					.selectAll('rect.cell')
					.data((d) => d)
					.join('rect')
					.attr('class', 'cell')
					.attr(transpose ? 'y' : 'x', (d, i) => i * cellWidth + i * colGap)
					.attr(transpose ? 'x' : 'y', 0)
					.attr('width', transpose ? cellHeight : cellWidth)
					.attr('height', transpose ? cellWidth : cellHeight)
					.attr('fill', function (d) {
						if (!Number.isFinite(d)) return theme.colors.gray[200];
						const tokenIdx = this.parentNode.classList[1].split('-')[1];
						return Number(tokenIdx) === highlightedIndex
							? highlightColorScale(d)
							: matrixColorScale(d);
					});
			}
			if (shape === 'circle') {
				rows.attr('transform', (d, i) =>
					transpose
						? `translate(${cellHeight / 2 + i * cellHeight + i * rowGap},0)`
						: `translate(0,${cellHeight / 2 + i * cellHeight + i * rowGap})`
				);
				const circles = rows
					.selectAll('circle.cell')
					.data((d, i) => d)
					.join('circle')
					.attr('class', (d, i) => `cell col-${i}`)
					.attr(transpose ? 'cy' : 'cx', (d, i) => cellWidth / 2 + i * cellWidth + i * colGap)
					.attr(transpose ? 'cx' : 'cy', 0)
					.attr('r', cellWidth / 2)
					// .attr('stroke-width', 4)
					.attr('stroke', (d) => (!Number.isFinite(d) ? 'none' : theme.colors.gray[200]))
					.on('mouseover', function (event, d) {
						if (Number.isFinite(d)) {
							showTooltip(event, d);
							const currentColor = d3.select(this).attr('fill');
							const darkerColor = d3.color(currentColor).darker(1);
							d3.select(this).attr('fill', darkerColor);
						}
					})
					.on('mouseout', function (event, d) {
						hideTooltip();
						if (Number.isFinite(d)) {
							const tokenIdx = this.parentNode.classList[1].split('-')[1];
							d3.select(this).attr(
								'fill',
								Number(tokenIdx) === highlightedIndex ? highlightColorScale(d) : matrixColorScale(d)
							);
						}
					})
					.transition()
					.duration(100)
					.attr('fill', function (d) {
						if (!Number.isFinite(d)) return theme.colors.gray[200];
						const tokenIdx = this.parentNode.classList[1].split('-')[1];
						return Number(tokenIdx) === highlightedIndex
							? highlightColorScale(d)
							: matrixColorScale(d);
					});
			}

			// if (showValue && cellWidth > 18) {
			// 	rows
			// 		.selectAll('text.cell-val-back')
			// 		.data((d) => d.filter((d) => Number.isFinite(d)))
			// 		.join('text')
			// 		.attr('class', 'cell-text cell-val-back')
			// 		.attr(transpose ? 'y' : 'x', (d, i) => i * cellWidth + i * colGap)
			// 		.attr(transpose ? 'x' : 'y', 0)
			// 		.attr('dy', 4)
			// 		.attr('dx', cellWidth / 2)
			// 		.text((d) => '.' + d.toFixed(2).split('.')[1])
			// 		.style('stroke', 'white')
			// 		.style('stroke-width', 1.5);

			// 	rows
			// 		.selectAll('text.cell-val')
			// 		.data((d) => d.filter((d) => Number.isFinite(d)))
			// 		.join('text')
			// 		.attr('class', 'cell-text cell-val')
			// 		.attr(transpose ? 'y' : 'x', (d, i) => i * cellWidth + i * colGap)
			// 		.attr(transpose ? 'x' : 'y', 0)
			// 		.attr('dy', 4)
			// 		.attr('dx', cellWidth / 2)
			// 		.text((d) => '.' + d.toFixed(2).split('.')[1])
			// 		.style('fill', theme.colors.gray[800]);
			// }
		}
	};

	// const highlightRow = () => {
	// 	const svg = d3.select(svgEl);
	// 	svg
	// 		.selectAll('rect.cell')
	// 		.transition()
	// 		.duration(400)
	// 		.ease(d3.easeExpOut)
	// 		.attr('fill', function (d) {
	// 			if (!Number.isFinite(d)) return theme.colors.gray[100];

	// 			const tokenIdx = this.parentNode.classList[1].split('-')[1];
	// 			return Number(tokenIdx) === highlightedIndex ? highlightColorScale(d) : matrixColorScale(d);
	// 		});
	// };

	$: if (data && svgEl) {
		drawMatrixSvg(data);
	}

	let tooltipData = '';
	let tooltipVisible = false;
	let tooltipX = 0;
	let tooltipY = 0;

	function showTooltip(event, d) {
		tooltipData = `Value: ${d}`;
		tooltipVisible = true;
		const bbox = event.target.getBoundingClientRect();
		tooltipX = bbox.x + bbox.width / 2;
		tooltipY = bbox.y - 10; // Adjust this value to position the tooltip above the circle

		// You can adjust the position of the tooltip here if needed
	}

	function hideTooltip() {
		tooltipVisible = false;
	}
</script>

<div class="relative">
	<svg
		class="matrix-svg"
		bind:this={svgEl}
		width={transpose ? svgHeight : svgWidth}
		height={transpose ? svgWidth : svgHeight}
	>
	</svg>
	{#if tooltipVisible}
		<div class="tooltip" style="left: {tooltipX}px; top: {tooltipY}px;">
			{tooltipData}
		</div>
	{/if}
</div>

<style>
	:global(.cell-text) {
		font-size: 0.6rem;
		font-family: monospace;
		text-anchor: middle;
	}

	.tooltip {
		position: absolute;
		background: #000;
		color: #fff;
		padding: 5px;
		border-radius: 3px;
		pointer-events: none;
		opacity: 0.8;
		z-index: 1000;
	}
</style>

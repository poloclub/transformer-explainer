<script lang="ts">
	import * as d3 from 'd3';
	import tailwindConfig from '../../tailwind.config';
	import resolveConfig from 'tailwindcss/resolveConfig';
	import { afterUpdate, beforeUpdate } from 'svelte';
	import { color } from 'd3-color';
	import { Tooltip } from 'flowbite-svelte';
	import { hoveredMatrixCell } from '~/store';

	const { theme } = resolveConfig(tailwindConfig);

	export let data: (number | null)[][];
	export let cellHeight: number;
	export let cellWidth: number;
	export let rowGap: number = 2;
	export let colGap: number = 0;
	export let transpose: boolean = false;

	export let rowLen: number;
	export let dimension: number;

	export let groupBy: 'row' | 'col' = 'row';
	export let shape: 'circle' | 'rect' = 'rect';
	export let colorScale: string | ((t: number, i: number) => string) | undefined = undefined;

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

	const colorKey = typeof colorScale === 'string' ? colorScale : 'blue';
	const matrixColorScale =
		typeof colorScale === 'function'
			? colorScale
			: d3.interpolate('white', theme.colors[colorKey][400]);

	const highlightColorScale = d3.interpolate('white', theme.colors['yellow'][600]);

	const drawMatrixSvg = () => {
		const svg = d3.select(svgEl);

		if (groupBy === 'col') {
			let cols;
			cols = svg
				.selectAll('g.g-col')
				.data(data)
				.join('g')
				.attr('class', (d, i) => `g-col g-col-${i}`);
			cols.attr('transform', (d, i) => `translate(${i * cellWidth + i * colGap},0)`);

			if (shape === 'rect') {
				cols
					.selectAll('rect.cell')
					.data((d, i) => d.map((value) => ({ value, parentIndex: i })))
					.join('rect')
					.attr('class', 'cell')
					.attr('x', 0)
					.attr('y', (d, i) => i * cellHeight + i * rowGap)
					.attr('width', cellWidth)
					.attr('height', cellHeight)
					.attr('fill', function (d) {
						return matrixColorScale(d.value, d.parentIndex);
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
					.attr('fill', function (d, i) {
						return matrixColorScale(d, i);
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
					.attr('fill', function (d, i) {
						if (!Number.isFinite(d)) return theme.colors.gray[200];
						const tokenIdx = this.parentNode.classList[1].split('-')[1];
						return Number(tokenIdx) === highlightedIndex
							? highlightColorScale(d)
							: matrixColorScale(d, i);
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
					.attr('stroke', (d) => (!Number.isFinite(d) ? 'none' : theme.colors.gray[200]))
					.on('mouseenter', onMouseOverCell)
					.on('mouseleave', onMouseOutCell)
					.transition()
					.duration(100)
					.attr('fill', function (d, i) {
						if (!Number.isFinite(d)) return theme.colors.gray[200];
						return matrixColorScale(d, i);
					});
			}
		}
	};

	$: if (data && svgEl) {
		drawMatrixSvg(data);
	}

	let tooltipData = '';
	let tooltipVisible = false;
	let tooltipX = 0;
	let tooltipY = 0;

	function showTooltip(event, d) {
		tooltipData = d.toFixed(2);
		tooltipVisible = true;

		const bbox = event.target.getBoundingClientRect();
		const parentBbox = svgEl.getBoundingClientRect();

		tooltipX = bbox.left + bbox.width / 2 - parentBbox.left;
		tooltipY = bbox.top - parentBbox.top;
	}

	function hideTooltip() {
		tooltipVisible = false;
	}

	function onMouseOverCell(e, d, i) {
		const rowIdx = Number(this.parentNode.classList[1].split('-')[2]);
		const colIdx = Number(this.classList[1].split('-')[1]);
		hoveredMatrixCell.set({ row: rowIdx, col: colIdx });
		if (Number.isFinite(d)) {
			showTooltip(e, d);
			d3.select(this).attr('stroke', theme.colors.gray[400]);
		}
	}
	function onMouseOutCell(e, d, i) {
		hoveredMatrixCell.set({ row: null, col: null });
		hideTooltip();
		if (Number.isFinite(d)) {
			d3.select(this).attr('stroke', !Number.isFinite(d) ? 'none' : theme.colors.gray[200]);
		}
	}
</script>

<div class="relative">
	<svg
		class="matrix-svg relative"
		bind:this={svgEl}
		width={transpose ? svgHeight : svgWidth}
		height={transpose ? svgWidth : svgHeight}
	>
	</svg>
	{#if tooltipVisible}
		<div
			class="matrix-tooltip divide-gray-200 border border-gray-200 bg-white text-gray-500 shadow-md"
			style="left: {tooltipX}px; top: {tooltipY}px;"
		>
			{tooltipData}
			<div
				class="arrow pointer-events-none absolute block h-[10px] w-[10px] rotate-45 border-b border-e border-inherit bg-inherit"
			></div>
		</div>
	{/if}
</div>

<style lang="scss">
	:global(.cell-text) {
		font-size: 0.6rem;
		font-family: monospace;
		text-anchor: middle;
	}

	.matrix-tooltip {
		position: absolute;
		padding: 0.5rem;
		pointer-events: none;
		transform: translate(-50%, -100%);
		font-family: monospace;
		border-radius: 3px;

		.arrow {
			left: calc(50% - 5px);
			bottom: -5px;
		}
	}
</style>

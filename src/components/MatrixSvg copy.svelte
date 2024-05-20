<script lang="ts">
	import * as d3 from 'd3';
	import tailwindConfig from '../../tailwind.config';
	import resolveConfig from 'tailwindcss/resolveConfig';
	import { highlightedToken, rowGap as globalRowGap } from '~/store';
	import { afterUpdate, beforeUpdate } from 'svelte';

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

	let svgEl: HTMLOrSVGElement;
	let highlightedIndex: string | number | null;

	$: svgWidth =
		groupBy === 'col'
			? rowLen * cellWidth + rowLen * colGap
			: dimension * cellWidth + dimension * colGap;
	$: svgHeight =
		groupBy === 'col'
			? dimension * cellHeight + (dimension - 1) * rowGap
			: rowLen * cellHeight + (rowLen - 1) * rowGap;

	highlightedToken.subscribe(($highlightedToken) => {
		highlightedIndex = $highlightedToken.index;
		if (svgEl) {
			highlightRow();
		}
	});

	const colorScale = d3.interpolate('white', theme.colors['primary'][600]);
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
					return colorScale(d);
				});
		}
		if (groupBy === 'row') {
			let rows;

			rows = svg
				.selectAll('g.row')
				.data(data)
				.join('g')
				.attr('class', (d, i) => `row row-${i}`);

			rows
				.attr('transform', (d, i) =>
					transpose
						? `translate(${i * cellHeight + i * rowGap},0)`
						: `translate(0,${i * cellHeight + i * rowGap})`
				)
				// .on('click', function (d) {
				// 	if ($highlightedToken.index !== null && !!$highlightedToken.fix) {
				// 		highlightedToken.set({ index: null, fix: false });
				// 	} else {
				// 		const tokenIdx = this.classList[1].split('-')[1];
				// 		highlightedToken.set({ index: Number(tokenIdx), fix: true });
				// 	}
				// })
				.on('mouseenter', function (d) {
					if ($highlightedToken.fix) return;
					const tokenIdx = this.classList[1].split('-')[1];
					highlightedToken.update((cur) => ({ ...cur, index: Number(tokenIdx) }));
				})
				.on('mouseleave', function (d) {
					if ($highlightedToken.fix) return;
					highlightedToken.update((cur) => ({ ...cur, index: null }));
				});

			rows
				.selectAll('rect.cell')
				.data((d) => d)
				.join('rect')
				.attr('class', 'cell')
				.attr(transpose ? 'y' : 'x', (d, i) => i * cellWidth)
				.attr(transpose ? 'x' : 'y', 0)
				.attr('width', transpose ? cellHeight : cellWidth)
				.attr('height', transpose ? cellWidth : cellHeight)
				.attr('fill', function (d) {
					if (d === null) return theme.colors.gray[100];
					const tokenIdx = this.parentNode.classList[1].split('-')[1];
					return Number(tokenIdx) === highlightedIndex ? highlightColorScale(d) : colorScale(d);
				});

			if (showValue) {
				rows
					.selectAll('text.cell-val')
					.data((d) => d.filter((d) => d !== null))
					.join('text')
					.attr('class', 'cell-val')
					.attr(transpose ? 'y' : 'x', (d, i) => i * cellWidth)
					.attr(transpose ? 'x' : 'y', 0)
					.attr('dy', 13)
					.attr('dx', 1)
					.text((d) => '.' + d.toFixed(2).split('.')[1])
					.style('color', theme.colors.gray[400]);
			}
		}
	};

	const highlightRow = () => {
		const svg = d3.select(svgEl);
		svg
			.selectAll('rect.cell')
			.transition()
			.duration(400)
			.ease(d3.easeExpOut)
			.attr('fill', function (d) {
				if (d === null) return theme.colors.gray[100];

				const tokenIdx = this.parentNode.classList[1].split('-')[1];
				return Number(tokenIdx) === highlightedIndex ? highlightColorScale(d) : colorScale(d);
			});
	};

	$: if (data && svgEl) {
		drawMatrixSvg(data);
	}
</script>

<svg
	class="matrix-svg"
	bind:this={svgEl}
	width={transpose ? svgHeight : svgWidth}
	height={transpose ? svgWidth : svgHeight}
>
</svg>

<style>
	:global(.cell-val) {
		font-size: 0.6rem;
	}
</style>

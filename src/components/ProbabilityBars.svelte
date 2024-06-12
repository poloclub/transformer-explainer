<script lang="ts">
	import { onMount } from 'svelte';
	import * as d3 from 'd3';
	import { modelData, rootRem } from '~/store';

	import tailwindConfig from '../../tailwind.config';
	import resolveConfig from 'tailwindcss/resolveConfig';
	const { theme } = resolveConfig(tailwindConfig);

	export let rowHeight = 0.5 * rootRem;
	export let rowGap = rootRem;
	export let hoveredIndex: number | null = null;

	$: data = $modelData?.prediction || [];

	let svgEl: HTMLOrSVGElement;

	let percentPrecision = 1;

	let drawBars = () => {
		const svg = d3.select(svgEl);

		let xScale = d3
			.scaleLinear()
			.domain([0, d3.max(data, (d) => d.adjustedProbability)])
			.range([0, svgEl?.clientWidth - rootRem * 3]);

		svg
			.select('g.bars')
			.selectAll('rect')
			.data(data)
			.join('rect')
			.attr('x', 0)
			.attr('y', (d, i) => i * rowHeight + i * rowGap)
			.attr('height', rowHeight)
			.attr('width', (d) => xScale(d.adjustedProbability))
			.attr('rx', 1)
			.attr('ry', 1)
			.attr('fill', (d, i) => {
				if (i === hoveredIndex) {
					return theme.colors.blue[500];
					// } else if (i === $highlightedIndex) {
					// 	return theme.colors.red[300];
					// } else if (i === $finalTokenIndex) {
					// 	return theme.colors.red[700];
				} else {
					return theme.colors.gray[200];
				}
			})
			.on('mouseenter', function (event, d) {
				hoveredIndex = d.rank;
				d3.select(this).style('cursor', 'pointer');
			})
			.on('mouseleave', () => (hoveredIndex = null))
			.transition()
			.ease(d3.easeCubic)
			.duration(500)
			.attr('width', (d) => xScale(d.adjustedProbability));

		//label
		svg
			.select('g.bar-labels')
			.selectAll('text')
			.data(data)
			.join('text')
			.attr('fill', (d, i) => {
				if (i === hoveredIndex) {
					return theme.colors.blue[600];
					// } else if (i === $highlightedIndex) {
					// 	return theme.colors.red[300];
					// } else if (i === $finalTokenIndex) {
					// 	return theme.colors.red[700];
				} else {
					return theme.colors.gray[400];
				}
			})
			.on('mouseenter', function (event, d) {
				hoveredIndex = d.rank;
				d3.select(this).style('cursor', 'pointer');
			})
			.on('mouseleave', () => {
				hoveredIndex = null;
			})
			.attr('x', (d) => 0.4 * rootRem + xScale(d.adjustedProbability))
			.attr('y', (d, i) => i * rowHeight + i * rootRem)
			.attr('dy', rowHeight / 2 + 3)
			.attr('text-anchor', 'start')
			.style('font-size', '0.75rem')
			.transition()
			.duration(500)
			.tween('text', function (d) {
				const that = d3.select(this),
					i = d3.interpolateNumber(that.text().replace('%', ''), d.adjustedProbability * 100);
				return function (t) {
					that.text(i(t).toFixed(percentPrecision) + '%');
				};
			});
	};

	// Initial draw without transition
	onMount(() => {
		drawBars();
	});

	$: if (data && svgEl) {
		drawBars();
	}
</script>

<div class="content-box probability grow">
	<svg bind:this={svgEl} class="h-full w-full">
		<g class="bars"></g>
		<g class="bar-labels"></g>
	</svg>
</div>

<style lang="scss">
	.probability {
		min-width: 6rem;
		z-index: 201;
	}
</style>

<script lang="ts">
	import { onMount } from 'svelte';
	import * as d3 from 'd3';
	import { modelData, rootRem, predictedToken, predictedColor, temperature } from '~/store';

	import tailwindConfig from '../../tailwind.config';
	import resolveConfig from 'tailwindcss/resolveConfig';
	const { theme } = resolveConfig(tailwindConfig);

	export let rowHeight;
	export let rowGap;
	export let hoveredIndex: number | null = null;

	const barHeight = 4;

	let svgEl: HTMLOrSVGElement;

	let percentPrecision = 2;

	let normalColor = theme.colors.gray[300];
	let hoverColor = theme.colors.purple[400];

	export let drawBars = () => {
		const data = $modelData?.probabilities;

		const svg = d3.select(svgEl);

		let xScale = d3
			.scaleLinear()
			.domain([0, d3.max(data, (d) => d.probability)])
			.range([0, svgEl?.clientWidth - rootRem * 3]);

		const groups = svg
			.selectAll('g.probability')
			.data(data)
			.join('g')
			.attr('class', 'probability')
			.attr('transform', (d, i) => {
				const x = 0;
				const y = i * rowHeight + i * rowGap;
				return `translate(${x}, ${y})`;
			});

		groups
			.selectAll('rect.bar')
			.data((d) => [d])
			.join('rect')
			.classed('bar', true)
			// .attr('x', 0)
			.attr('y', (d, i) => rowHeight / 2 - barHeight / 2)
			.attr('height', barHeight)
			.attr('width', (d) => xScale(d.probability))
			.attr('rx', 1)
			.attr('ry', 1)
			.on('mouseenter', function (event, d) {
				hoveredIndex = d.rank;
				d3.select(this).style('cursor', 'pointer');
			})
			.on('mouseleave', () => (hoveredIndex = null))
			.transition()
			.ease(d3.easeCubic)
			.duration(500)
			.attr('width', (d) => xScale(d.probability));

		//label
		groups
			.selectAll('text.label')
			.data((d) => [d])
			.join('text')
			.classed('label', true)
			.on('mouseenter', function (event, d) {
				hoveredIndex = d.rank;
			})
			.on('mouseleave', () => {
				hoveredIndex = null;
			})
			.attr('x', (d) => 0.4 * rootRem + xScale(d.probability))
			.attr('dy', rootRem)
			.attr('text-anchor', 'start')
			.style('font-size', '0.8rem')
			// .style('font-family', 'monospace')
			.transition()
			.duration(500)
			.tween('text', function (d) {
				const that = d3.select(this);
				if (d.probability === 0) {
					return () => {
						that.text(`0%`);
					};
				}
				if (d.probability < 0.01) {
					return () => {
						that.text(`<0.01%`);
					};
				}
				const i = d3.interpolateNumber(
					that.text().replace('%', '').replace('<', ''),
					(d.probability * 100).toFixed(percentPrecision)
				);
				return function (t) {
					let text = i(t).toFixed(percentPrecision) + '%';
					that.text(text);
				};
			});

		updateColor();
	};

	// Initial draw without transition
	onMount(() => {
		drawBars();
	});

	$: if ($modelData && svgEl) {
		drawBars();
	}

	$: if (hoveredIndex !== undefined) {
		updateColor();
	}

	$: if ($predictedToken !== undefined) {
		updateColor();
	}

	// for hover and sampling
	const updateColor = () => {
		if (!svgEl) return;
		const svg = d3.select(svgEl);
		const groups = svg.selectAll('g.probability');

		groups.each(function (d, i) {
			let color;
			if (i === hoveredIndex) {
				color = hoverColor;
			} else if ($predictedToken?.rank === i) {
				color = predictedColor;
			} else {
				color = normalColor;
			}

			d3.select(this).select('rect').attr('fill', color);
			d3.select(this).select('text').attr('fill', color);
		});
	};
</script>

<div class="content-box probability-col grow">
	<svg bind:this={svgEl} class="h-full w-full"> </svg>
</div>

<style lang="scss">
	.probability-col {
		min-width: 6rem;
		z-index: $COLUMN_TITLE_INDEX;
		user-select: none;

		:global(rect.highlighted) {
			fill: theme('colors.purple.500');
		}
	}
</style>

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
		const data = $modelData?.prediction;

		const svg = d3.select(svgEl);

		let xScale = d3
			.scaleLinear()
			.domain([0, d3.max(data, (d) => d.normalizedProbability)])
			.range([0, svgEl?.clientWidth - rootRem * 3]);

		svg
			.select('g.bars')
			.selectAll('rect')
			.data(data)
			.join('rect')
			.attr('x', 0)
			.attr('y', (d, i) => i * rowHeight + i * rowGap + rowHeight / 2 - barHeight / 2)
			.attr('height', barHeight)
			.attr('width', (d) => xScale(d.normalizedProbability))
			.attr('rx', 1)
			.attr('ry', 1)
			.attr('fill', (d, i) => {
				if (i === hoveredIndex) {
					return hoverColor;
				} else if ($predictedToken?.rank === i) {
					return predictedColor;
				} else {
					return normalColor;
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
			.attr('width', (d) => xScale(d.normalizedProbability));

		//label
		svg
			.select('g.bar-labels')
			.selectAll('text')
			.data(data)
			.join('text')
			.attr('class', 'bar-label')
			.attr('fill', (d, i) => {
				if (i === hoveredIndex) {
					return hoverColor;
				} else if ($predictedToken?.rank === i) {
					return predictedColor;
				} else {
					return normalColor;
				}
			})
			.on('mouseenter', function (event, d) {
				hoveredIndex = d.rank;
				d3.select(this).style('cursor', 'pointer');
			})
			.on('mouseleave', () => {
				hoveredIndex = null;
			})
			.attr('x', (d) => 0.4 * rootRem + xScale(d.normalizedProbability))
			.attr('y', (d, i) => i * rowHeight + i * rowGap)
			.attr('dy', rowHeight / 2 + 3)
			.attr('text-anchor', 'start')
			.style('font-size', '0.8rem')
			// .style('font-family', 'monospace')
			.transition()
			.duration(500)
			.tween('text', function (d) {
				const that = d3.select(this);
				if (d.normalizedProbability < 0.01) {
					return () => {
						that.text(`<0.01%`);
					};
				}
				const i = d3.interpolateNumber(
					that.text().replace('%', '').replace('<', ''),
					(d.normalizedProbability * 100).toFixed(percentPrecision)
				);
				return function (t) {
					let text = i(t).toFixed(percentPrecision) + '%';
					that.text(text);
				};
			});
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

	$: if ($predictedToken) {
		updateColor();
	}

	// for hover and sampling
	const updateColor = () => {
		if (!svgEl) return;
		const svg = d3.select(svgEl);
		svg.selectAll('g.bars rect').attr('fill', (d, i) => {
			if (i === hoveredIndex) {
				return hoverColor;
			} else if ($predictedToken?.rank === i) {
				return predictedColor;
			} else {
				return normalColor;
			}
		});

		svg.selectAll('g.bar-labels text').attr('fill', (d, i) => {
			if (i === hoveredIndex) {
				return hoverColor;
			} else if ($predictedToken?.rank === i) {
				return predictedColor;
			} else {
				return normalColor;
			}
		});
	};
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

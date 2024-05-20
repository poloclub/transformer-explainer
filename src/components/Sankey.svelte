<script lang="ts">
	import { tokens, modelMeta } from '~/store';
	import * as d3 from 'd3';
	import { onMount, tick } from 'svelte';
	import resolveConfig from 'tailwindcss/resolveConfig';
	import tailwindConfig from '../../tailwind.config';
	import { gsap, Flip } from '~/utils/gsap';

	const { theme } = resolveConfig(tailwindConfig);

	let svgBackEl: HTMLOrSVGElement;
	let svgEl: HTMLOrSVGElement;

	let resizeObserver: ResizeObserver;

	const defaultCurveOffset = 90;
	const defaultGradientBrightness = 100;

	type PathMap = Record<
		string,
		{
			from: string;
			to: string;
			gradientId?: string;
			fill?: string;
			opacity?: number;
			curve?: number;
			pathGenerator?: (source: DOMRect, target: DOMRect, curveOffset: number) => string;
		}[]
	>;

	const backPathMap: PathMap = {
		heads: [
			{
				from: '.attention .query .head-rest',
				to: '.head-block .query .vector',
				fill: theme.colors.blue[defaultGradientBrightness],
				opacity: 0.4
			},
			{
				from: '.attention .key .head-rest',
				to: '.head-block .key .vector',
				fill: theme.colors.red[defaultGradientBrightness],
				opacity: 0.4
			},
			{
				from: '.attention .value .head-rest',
				to: '.head-block .value .vector',
				fill: theme.colors.green[defaultGradientBrightness],
				opacity: 0.4
			},
			{
				from: '.attention .head-out .vector',
				to: '.mlp .initial .head-rest',
				gradientId: 'transparent-purple'
			}
		]
	};
	const pathMap: PathMap = {
		embedding: [
			{
				from: '.embedding .out .vector',
				to: '.attention .vector',
				gradientId: 'gray-blue'
			}
		],
		attention: [
			{
				from: '.attention .query .head1',
				to: '.head-block .query .vector',
				fill: theme.colors.blue[200]
			},
			{
				from: '.attention .key .head1',
				to: '.head-block .key .vector',
				fill: theme.colors.red[200]
			},
			{
				from: '.attention .value .head1',
				to: '.head-block .value .vector',
				fill: theme.colors.green[200]
			},
			{
				from: '.attention .head-out .vector',
				to: '.mlp .initial .head1',
				fill: theme.colors.purple[200]
			},
			{
				from: '.head-block .key .vector',
				to: '.attention-matrix.active  circle.col-0',
				gradientId: 'red-purple',
				curve: 50,
				pathGenerator: (source: DOMRect, target: DOMRect, curveOffset: number) => {
					return `
        M ${source.right},${source.top} 
        C ${source.right + curveOffset},${source.top} ${target.left - curveOffset},${target.top} ${target.left},${target.top}
        L ${target.left},${target.bottom}
        C ${target.left - curveOffset},${target.bottom} ${source.right + curveOffset},${source.bottom} ${source.right},${source.bottom}
        Z
    `;
				}
			},
			{
				from: '.head-block .query .vector',
				to: '.attention-matrix.active  g.g-row-0 circle',
				gradientId: 'blue-purple',
				curve: 10,
				pathGenerator: (source, target, curveRadius) => {
					return `
      M ${source.right},${source.top}
       L ${target.right - curveRadius},${source.top}
        Q ${target.right},${source.top} ${target.right},${source.top + curveRadius}
        L ${target.right},${target.top - curveRadius}
        Q ${target.right},${target.top} ${target.right},${target.top}
        L ${target.left},${target.top}
        Q ${target.left},${target.top} ${target.left},${target.top - curveRadius}
        L ${target.left},${source.top + curveRadius}
				Q ${target.left},${source.top} ${target.left},${source.top + curveRadius}
        L ${source.right},${source.bottom}
        Z
    `;
				}
			}
			// {
			// 	from: '.attention-matrix.active svg',
			// 	to: '.attention .head-out',
			// 	fill: theme.colors.purple[200],
			// 	curve: 1
			// },
			// {
			// 	from: '.head-block .value',
			// 	to: '.attention .head-out',
			// 	gradientId: 'green-purple'
			// }
		],
		mlp: [
			{
				from: '.mlp .initial .vector',
				to: '.mlp .projections .vector',
				gradientId: 'purple-indigo'
			},
			{
				from: '.mlp .projections .vector',
				to: '.transformer-blocks .initial .vector',
				gradientId: 'indigo-blue'
			}
		],
		'transformer-blocks': [
			{
				from: '.transformer-blocks .initial .vector',
				to: '.transformer-blocks .final .vector',
				gradientId: 'blue-white-blue'
			}
		],
		'linear-softmax': [
			{
				from: '.transformer-blocks .final .vector.last ',
				to: '.linear-softmax .vector',
				gradientId: 'blue-gray'
			}
		]
	};

	const gradientMap = {
		'gray-blue': {
			0: theme.colors.gray[defaultGradientBrightness],
			100: theme.colors.blue[defaultGradientBrightness]
		},
		'purple-indigo': {
			0: theme.colors.purple[defaultGradientBrightness],
			100: theme.colors.indigo[defaultGradientBrightness]
		},
		'indigo-blue': {
			0: theme.colors.indigo[defaultGradientBrightness],
			100: theme.colors.blue[defaultGradientBrightness]
		},
		'blue-white': { 0: theme.colors.blue[defaultGradientBrightness], 100: theme.colors.white },
		'red-white': { 0: theme.colors.red[defaultGradientBrightness], 100: theme.colors.white },
		'green-white': { 0: theme.colors.green[defaultGradientBrightness], 100: theme.colors.white },
		'red-purple': {
			50: theme.colors.red[defaultGradientBrightness],
			100: theme.colors.purple[defaultGradientBrightness]
		},
		'blue-purple': {
			50: theme.colors.blue[defaultGradientBrightness],
			100: theme.colors.purple[defaultGradientBrightness]
		},
		'green-purple': {
			0: theme.colors.green[defaultGradientBrightness],
			100: theme.colors.purple[defaultGradientBrightness]
		},
		'blue-gray': {
			0: theme.colors.blue[defaultGradientBrightness],
			100: theme.colors.gray[defaultGradientBrightness]
		},
		'blue-white-blue': {
			0: theme.colors.blue[defaultGradientBrightness],
			40: theme.colors.white,
			60: theme.colors.white,
			100: theme.colors.blue[defaultGradientBrightness]
		},
		'transparent-purple': {
			0: { color: theme.colors.purple[100], opacity: 0 },
			70: { color: theme.colors.purple[100], opacity: 0.5 },
			100: { color: theme.colors.purple[100], opacity: 1 }
		}
	};

	const createGradients = () => {
		const svg = d3.select(svgEl);
		const defs = svg.append('defs');

		Object.keys(gradientMap).forEach((key) => {
			const stops = gradientMap[key];
			const grad = defs
				.append('linearGradient')
				.attr('id', key)
				.attr('x1', '0%')
				.attr('y1', '0%')
				.attr('x2', '100%')
				.attr('y2', '0%');

			Object.keys(stops).forEach((stop) => {
				let color, opacity;
				if (typeof stops[stop] !== 'string') {
					color = stops[stop].color;
					opacity = stops[stop].opacity;
				} else {
					color = stops[stop];
					opacity = 1;
				}

				grad
					.append('stop')
					.attr('offset', `${stop}%`)
					.attr('stop-color', color)
					.attr('stop-opacity', opacity);
			});
		});
	};

	const drawPath = async () => {
		await tick();
		const svg = d3.select(svgEl);
		const svgBack = d3.select(svgBackEl);

		[
			{ dataMap: pathMap, svg },
			{ dataMap: backPathMap, svg: svgBack }
		].forEach(({ dataMap, svg }) => {
			const g = svg
				.selectAll('g.path-group')
				.data(Object.keys(dataMap))
				.join('g')
				.attr('class', (d) => `path-group ${d}`);

			g.selectAll('path.sankey')
				.data((d) => {
					const data = dataMap[d].map((item) => {
						const sources = d3.selectAll(item.from).nodes() as Element[];
						const targets = d3.selectAll(item.to).nodes() as Element[];

						return sources.map((src, i) => {
							const source = src.getBoundingClientRect();
							const target = targets[i].getBoundingClientRect();
							const curveOffset = item.curve || defaultCurveOffset;

							const generator = item.pathGenerator || pathGenerator;
							const path = generator(source, target, curveOffset);
							return {
								path,
								fill: item.gradientId ? `url(#${item.gradientId})` : item.fill,
								opacity: item.opacity
							};
						});
					});

					return data.flat();
				})
				.join('path')
				.attr('class', 'sankey')
				.attr('fill', (d) => d.fill)
				.attr('opacity', (d) => d.opacity || 1)
				.attr('d', (d) => d.path);
		});
	};

	const pathGenerator = (source: DOMRect, target: DOMRect, curveOffset: number) => {
		const scrollTop = window.scrollY;
		const scrollLeft = window.scrollX;

		return `
        M ${source.right + scrollLeft},${source.top + scrollTop} 
        C ${source.right + scrollLeft + curveOffset},${source.top + scrollTop} ${target.left + scrollLeft - curveOffset},${target.top + scrollTop} ${target.left + scrollLeft},${target.top + scrollTop}
        L ${target.left + scrollLeft},${target.bottom + scrollTop}
        C ${target.left + scrollLeft - curveOffset},${target.bottom + scrollTop} ${source.right + scrollLeft + curveOffset},${source.bottom + scrollTop} ${source.right + scrollLeft},${source.bottom + scrollTop}
        Z
    `;
	};

	onMount(() => {
		createGradients();

		resizeObserver = new ResizeObserver((entries) => {
			drawPath();
		});
		const elements = document?.querySelectorAll('.resize-watch');
		elements.forEach((el) => resizeObserver.observe(el));
		// animationTest();

		return () => {
			resizeObserver.disconnect();
		};
	});

	$: if (typeof window !== 'undefined') {
		$tokens, drawPath();
	}

	const animationTest = () => {
		const grad = document.querySelector('#gray-blue');
		const stop = grad?.querySelectorAll('stop')[1];
		gsap.fromTo(
			stop,
			{ attr: { offset: '0%', ['stop-color']: theme.colors.gray[100] } },
			{
				attr: { offset: '100%', ['stop-color']: theme.colors.blue[200] },
				duration: 1,
				repeat: 100
			}
		);
	};
</script>

<svg
	bind:this={svgBackEl}
	id="back"
	class="absolute left-0 top-0 h-full w-full"
	style={`z-index:${$modelMeta.attention_head_num};`}
></svg><svg
	bind:this={svgEl}
	class="absolute left-0 top-0 h-full w-full"
	style={`z-index:${$modelMeta.attention_head_num + 1};`}
/>

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

	const defaultCurveOffset = 80;
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
			type?: 'stroke' | 'shape';
			id?: string;
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
	$: pathMap = {
		embedding: [
			{
				from: '.embedding .out .vector',
				to: '.embedding .out .ln .main',
				fill: theme.colors.gray[defaultGradientBrightness]
			},
			{
				from: '.embedding .out .ln .main',
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
				to: `.attention-matrix.attention-initial  g.g-row`,
				id: 'key-to-attention',
				type: 'stroke',
				gradientId: 'red-purple',
				curve: 30,
				pathGenerator: (source, target, curveOffset) => {
					const scrollTop = window.scrollY;
					const scrollLeft = window.scrollX;

					const sourceMiddleY = source.top + scrollTop + source.height / 2;
					const targetMiddleY = target.top + scrollTop + target.height / 2;
					const controlPoint1X = source.right + scrollLeft + curveOffset;
					const controlPoint2X = target.left + scrollLeft - curveOffset;

					return `
        M ${source.right + scrollLeft},${sourceMiddleY}
        C ${controlPoint1X},${sourceMiddleY} ${controlPoint2X},${targetMiddleY} ${target.left + scrollLeft},${targetMiddleY}
				L ${target.right + scrollLeft},${targetMiddleY}
    `;
				}
			},
			{
				from: '.head-block .query .vector',
				to: `.attention-matrix.attention-initial  g.g-row-${$tokens.length - 1} circle`,
				gradientId: 'blue-purple',
				id: 'query-to-attention',
				type: 'stroke',
				curve: 20,
				pathGenerator: (source, target, curveOffset) => {
					const scrollTop = window.scrollY;
					const scrollLeft = window.scrollX;

					const sourceMiddleY = source.top + scrollTop + source.height / 2;
					const targetMiddleX = target.left + scrollLeft + target.width / 2;

					return `
        M ${source.right + scrollLeft},${sourceMiddleY}
        L ${targetMiddleX - curveOffset},${sourceMiddleY}
        A ${curveOffset},${curveOffset} 0 0 1 ${targetMiddleX},${sourceMiddleY + curveOffset}
        L ${targetMiddleX},${target.bottom + scrollTop}
    `;
				}
			},
			{
				from: '.attention-matrix.attention-out svg',
				to: '.attention .head-out',
				gradientId: 'transparent-purple2',
				id: 'to-attention-out',
				curve: 20
			},
			{
				from: '.head-block .value',
				to: '.attention .head-out',
				gradientId: 'green-purple',
				id: 'to-attention-out',
				opacity: 0.4
			}
		],
		mlp: [
			{
				from: '.mlp .initial .vector',
				to: '.mlp .initial .residual-start',
				fill: theme.colors.purple[defaultGradientBrightness]
			},
			{
				from: '.mlp .initial .residual-start',
				to: '.mlp .projections .vector',
				gradientId: 'purple-indigo'
			},
			{
				from: '.mlp .projections .vector',
				to: '.transformer-blocks .initial .residual',
				gradientId: 'indigo-blue'
			}
		],
		'transformer-blocks': [
			{
				from: '.transformer-blocks .initial .residual',
				to: '.transformer-blocks .initial .vector',
				fill: theme.colors.blue[defaultGradientBrightness]
			},
			{
				from: '.transformer-blocks .initial .vector',
				to: '.transformer-blocks .final .vector',
				gradientId: 'blue-white-blue'
			}
		],
		'linear-softmax': [
			{
				from: '.transformer-blocks .final .vector.last ',
				to: '.softmax .content .vector',
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
			0: theme.colors.red[defaultGradientBrightness],
			100: theme.colors.purple[200]
		},
		'blue-purple': {
			90: theme.colors.blue[defaultGradientBrightness],
			100: theme.colors.purple[200]
		},
		'green-purple': {
			50: theme.colors.green[defaultGradientBrightness],
			100: theme.colors.purple[200]
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
		},
		'transparent-purple2': {
			0: { color: theme.colors.purple[200], opacity: 0 },
			100: { color: theme.colors.purple[200], opacity: 1 }
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
								id: item.id,
								path,
								fill:
									item.type === 'stroke'
										? 'none'
										: item.gradientId
											? `url(#${item.gradientId})`
											: item.fill,
								opacity: item.opacity,
								stroke:
									item.type === 'stroke'
										? item.gradientId
											? `url(#${item.gradientId})`
											: item.fill
										: 'none'
							};
						});
					});

					return data.flat();
				})
				.join('path')
				.attr('class', (d) => `sankey ${d.id || ''}`)
				.attr('fill', (d) => d.fill)
				.attr('stroke', (d) => d.stroke)
				.attr('stroke-width', 2)
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
				duration: 2,
				repeat: 100
			}
		);
	};
</script>

<svg
	bind:this={svgBackEl}
	id="back"
	class="absolute left-0 top-0 h-full w-full"
	style={`z-index:${$modelMeta.attention_head_num - 1};`}
></svg><svg
	bind:this={svgEl}
	class="absolute left-0 top-0 h-full w-full"
	style={`z-index:${$modelMeta.attention_head_num};`}
/>

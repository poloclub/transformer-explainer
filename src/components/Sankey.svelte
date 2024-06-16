<script lang="ts">
	import { tokens, modelMeta } from '~/store';
	import * as d3 from 'd3';
	import { onMount, tick } from 'svelte';
	import resolveConfig from 'tailwindcss/resolveConfig';
	import tailwindConfig from '../../tailwind.config';
	import { gsap, Flip } from '~/utils/gsap';
	import { gradientMap } from '~/utils/gradient';
	// import WeightPopover from './Popovers/WeightPopover.svelte';

	const { theme } = resolveConfig(tailwindConfig);

	let svgBackEl: HTMLOrSVGElement;
	let svgEl: HTMLOrSVGElement;

	let resizeObserver: ResizeObserver;

	const defaultCurveOffset = 80;

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
		attention: [
			{
				from: '.attention .query .head-rest',
				to: '.head-block .query .vector',
				// fill: theme.colors.blue[defaultGradientBrightness],
				gradientId: 'blue-blue2',
				opacity: 0.4
			},
			{
				from: '.attention .key .head-rest',
				to: '.head-block .key .vector',
				// fill: theme.colors.red[defaultGradientBrightness],
				gradientId: 'red-red2',
				opacity: 0.4
			},
			{
				from: '.attention .value .head-rest',
				to: '.head-block .value .vector',
				gradientId: 'green-green2',
				// fill: theme.colors.green[defaultGradientBrightness],
				opacity: 0.4
			},
			{
				from: '.attention .head-out .vector',
				to: '.mlp .initial .vector .head-rest',
				gradientId: 'transparent-purple',
				opacity: 0.4
			}
		]
	};
	$: pathMap = {
		embedding: [
			{
				from: '.embedding .vector-column .column.vectors .vector',
				to: '.attention .vector',
				gradientId: 'gray-blue',
				opacity: 0.6,
				pathGenerator: (source, target, curveOffset: number) => {
					const scrollTop = window.scrollY;
					const scrollLeft = window.scrollX;

					const rightOffset = 30;

					return `
					M ${source.right + scrollLeft},${source.top + scrollTop}
					L ${source.right + rightOffset + scrollLeft},${source.top + scrollTop}
					C ${source.right + rightOffset + scrollLeft + curveOffset},${source.top + scrollTop} ${target.left + scrollLeft - curveOffset},${target.top + scrollTop} ${target.left + scrollLeft},${target.top + scrollTop}
					L ${target.left + scrollLeft},${target.bottom + scrollTop}
					C ${target.left + scrollLeft - curveOffset},${target.bottom + scrollTop} ${source.right + rightOffset + scrollLeft + curveOffset},${source.bottom + scrollTop} ${source.right + rightOffset + scrollLeft},${source.bottom + scrollTop}
					L ${source.right + scrollLeft},${source.bottom + scrollTop}
					Z
				`;
				}
			}
		],
		attention: [
			{
				from: '.attention .query .head1',
				to: '.head-block .query .vector',
				// fill: theme.colors.blue[200]
				gradientId: 'blue-blue'
			},
			{
				from: '.attention .key .head1',
				to: '.head-block .key .vector',
				// fill: theme.colors.red[200]
				gradientId: 'red-red'
			},
			{
				from: '.attention .value .head1',
				to: '.head-block .value .vector',
				// fill: theme.colors.green[200]
				gradientId: 'green-green'
			},
			{
				from: '.attention .head-out .vector',
				to: '.mlp .initial .head1',
				gradientId: 'purple-purple'
				// fill: theme.colors.purple[200]
			},
			{
				from: '.head-block .key .vector',
				to: `.attention-initial .main g.g-row`,
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
				to: `.attention-matrix.attention-initial .main g.g-row-${$tokens.length - 1} circle`,
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
				from: '.attention-matrix.attention-out .main svg',
				to: '.attention .head-out',
				gradientId: 'transparent-purple2',
				id: 'to-attention-out',
				opacity: 0.4,
				curve: 20,
				pathGenerator: (source, target, curveOffset) => {
					const scrollTop = window.scrollY;
					const scrollLeft = window.scrollX;

					return `
			    M ${source.right + scrollLeft},${source.top + scrollTop}
			    C ${source.right + scrollLeft + curveOffset},${source.top + scrollTop} ${target.left + scrollLeft - curveOffset},${target.top + scrollTop} ${target.left + scrollLeft},${target.top + scrollTop}
			    L ${target.left + scrollLeft},${target.bottom + scrollTop}
			    C ${target.left + scrollLeft - curveOffset},${target.bottom + scrollTop} ${source.right + scrollLeft + curveOffset},${source.bottom + scrollTop} ${source.right + scrollLeft},${source.bottom + scrollTop}
			    Z
			`;
				}
			},
			{
				from: '.head-block .value',
				to: '.attention .head-out',
				gradientId: 'green-purple',
				id: 'to-attention-out',
				opacity: 0.4,
				curve: 60,
				pathGenerator: (source, target, curveOffset) => {
					const scrollTop = window.scrollY;
					const scrollLeft = window.scrollX;

					return `
        M ${source.right + scrollLeft},${source.top + scrollTop} 
        C ${target.left - curveOffset},${source.top + scrollTop} ${target.left + scrollLeft - curveOffset},${source.top + scrollTop} ${target.left + scrollLeft},${target.top + scrollTop}
        L ${target.left + scrollLeft},${target.bottom + scrollTop}
        C ${target.left + scrollLeft - curveOffset},${source.bottom + scrollTop} ${target.left - curveOffset},${source.bottom + scrollTop} ${source.right + scrollLeft},${source.bottom + scrollTop}
        Z
    `;
				}
			}
		],
		mlp: [
			{
				from: '.mlp .column.initial .vector',
				to: '.mlp .projections .vector',
				gradientId: 'purple-indigo',
				curve: 50,
				opacity: 0.4,
				pathGenerator: (source, target, curveOffset: number) => {
					const scrollTop = window.scrollY;
					const scrollLeft = window.scrollX;

					const rightOffset = 49;

					return `
					M ${source.right + scrollLeft},${source.top + scrollTop}
					L ${source.right + rightOffset + scrollLeft},${source.top + scrollTop}
					C ${source.right + rightOffset + scrollLeft + curveOffset},${source.top + scrollTop} ${target.left + scrollLeft - curveOffset},${target.top + scrollTop} ${target.left + scrollLeft},${target.top + scrollTop}
					L ${target.left + scrollLeft},${target.bottom + scrollTop}
					C ${target.left + scrollLeft - curveOffset},${target.bottom + scrollTop} ${source.right + rightOffset + scrollLeft + curveOffset},${source.bottom + scrollTop} ${source.right + rightOffset + scrollLeft},${source.bottom + scrollTop}
					L ${source.right + scrollLeft},${source.bottom + scrollTop}
					Z
				`;
				}
			},
			{
				from: '.mlp .projections .vector',
				to: '.mlp .column.out .vector',
				gradientId: 'indigo-blue',
				curve: 50,
				opacity: 0.4,
				pathGenerator: (source, target, curveOffset: number) => {
					const scrollTop = window.scrollY;
					const scrollLeft = window.scrollX;

					const leftOffset = 20;

					return `
					M ${source.right + scrollLeft},${source.top + scrollTop}
					C ${source.right + scrollLeft + curveOffset},${source.top + scrollTop} ${target.left - leftOffset + scrollLeft - curveOffset},${target.top + scrollTop} ${target.left - leftOffset + scrollLeft},${target.top + scrollTop}
					L ${target.left + scrollLeft},${target.top + scrollTop}
					L ${target.left + scrollLeft},${target.bottom + scrollTop}
					L ${target.left - leftOffset + scrollLeft},${target.bottom + scrollTop}
					C ${target.left - leftOffset + scrollLeft - curveOffset},${target.bottom + scrollTop} ${source.right + scrollLeft + curveOffset},${source.bottom + scrollTop} ${source.right + scrollLeft},${source.bottom + scrollTop}
					L ${source.right + scrollLeft},${source.bottom + scrollTop}
					Z
				`;
				}
			}
		],
		'transformer-blocks': [
			{
				from: '.mlp .out .vector',
				to: '.transformer-blocks .column.final .vector',
				gradientId: 'blue-white-blue',
				opacity: 0.6,
				pathGenerator: (source, target, curveOffset) => {
					const scrollTop = window.scrollY;
					const scrollLeft = window.scrollX;

					return `
        M ${source.right + scrollLeft},${source.top + scrollTop}
        C ${source.right + scrollLeft + curveOffset},${source.top + scrollTop} ${target.left + scrollLeft - curveOffset},${target.top + scrollTop} ${target.left + scrollLeft},${target.top + scrollTop}
        L ${target.left + scrollLeft},${target.bottom + scrollTop}
        C ${target.left + scrollLeft - curveOffset},${target.bottom + scrollTop} ${source.right + scrollLeft + curveOffset},${source.bottom + scrollTop} ${source.right + scrollLeft},${source.bottom + scrollTop}
        Z
    `;
				}
			}
		],
		'linear-softmax': [
			{
				from: '.transformer-blocks .final .vector.last-token ',
				to: '.softmax .content .vector',
				gradientId: 'blue-gray',
				opacity: 0.4
			}
		]
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
			// .on('mouseover', (e, d) => {
			// 	const paths = d3.select(`g.${d}`).selectAll('path');
			// 	paths.style('opacity', 1);
			// })
			// .on('mouseout', (e, d) => {
			// 	const paths = d3.select(`g.${d}`).selectAll('path');
			// 	paths.style('opacity', 0.6);
			// });

			g.selectAll('path.sankey-path')
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

							const isLast = targets.length > 1 && i === sources.length - 1;
							let gradUrl = item.gradientId;

							if (isLast && document.getElementById(item.gradientId + '-last')) {
								gradUrl = item.gradientId + '-last';
							}

							return {
								id: item.id,
								isLast: i === sources.length - 1,
								path,
								fill:
									item.type === 'stroke'
										? 'none'
										: item.gradientId
											? `url(#${gradUrl})`
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
				.attr('class', (d) => `sankey-path ${d.id || ''} ${d.isLast ? 'last' : ''}`)
				.attr('fill', (d) => d.fill)
				.attr('stroke', (d) => d.stroke)
				.attr('stroke-width', 2)
				.attr('opacity', (d) => d.opacity || 1)
				.attr('d', (d) => d.path);
		});
	};

	const pathGenerator = (source, target, curveOffset: number) => {
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
	class="sankey-back absolute left-0 top-0 h-full w-full"
	style={`z-index:${$modelMeta.attention_head_num - 1};`}
></svg><svg
	bind:this={svgEl}
	class="sankey-top absolute left-0 top-0 h-full w-full"
	style={`z-index:${$modelMeta.attention_head_num};`}
/>

<style lang="scss">
	.sankey-top {
		g {
			// opacity: 0.8;
		}
		/* opacity: 0.8; */
	}
</style>

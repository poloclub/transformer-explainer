<script lang="ts">
	import { tokens, modelMeta, hoveredPath, rootRem } from '~/store';
	import * as d3 from 'd3';
	import { onMount, tick } from 'svelte';
	import resolveConfig from 'tailwindcss/resolveConfig';
	import tailwindConfig from '../../tailwind.config';
	import { gsap, Flip } from '~/utils/gsap';
	import { gradientMap } from '~/constants/gradient';
	import {
		ATTENTION_HEAD_1,
		ATTENTION_HEAD_BACK,
		ATTENTION_OUT,
		EMBEDDING,
		LOGIT,
		MLP,
		TRANSFORMER_BLOCKS
	} from '~/constants/opacity';

	const { theme } = resolveConfig(tailwindConfig);

	let svgBackEl: HTMLOrSVGElement;
	let svgEl: HTMLOrSVGElement;

	let resizeObserver: ResizeObserver;
	let screenWidth: number;

	$: curveFactor = Math.floor(screenWidth / 1000) || 1;
	$: defaultCurveOffset = 40 * (curveFactor - 1) + 80;

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
				opacity: ATTENTION_HEAD_BACK
			},
			{
				from: '.attention .key .head-rest',
				to: '.head-block .key .vector',
				// fill: theme.colors.red[defaultGradientBrightness],
				gradientId: 'red-red2',
				opacity: ATTENTION_HEAD_BACK
			},
			{
				from: '.attention .value .head-rest',
				to: '.head-block .value .vector',
				gradientId: 'green-green2',
				// fill: theme.colors.green[defaultGradientBrightness],
				opacity: ATTENTION_HEAD_BACK
			},
			{
				from: '.attention .head-out .vector',
				to: '.mlp .initial .vector .head-rest',
				gradientId: 'transparent-purple',
				opacity: ATTENTION_HEAD_BACK
			}
		]
	};
	$: pathMap = {
		embedding: [
			{
				hoverable: true,
				from: '.embedding .vector-column .column.vectors .vector',
				to: '.attention .vector',
				gradientId: 'gray-blue',
				opacity: EMBEDDING,
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
				from: '.attention .query .sub-vector.head1',
				to: '.head-block .query .vector',
				// fill: theme.colors.blue[200]
				gradientId: 'blue-blue',
				opacity: ATTENTION_HEAD_1
			},
			{
				from: '.attention .key .sub-vector.head1',
				to: '.head-block .key .vector',
				// fill: theme.colors.red[200]
				gradientId: 'red-red',
				opacity: ATTENTION_HEAD_1
			},
			{
				from: '.attention .value .sub-vector.head1',
				to: '.head-block .value .vector',
				// fill: theme.colors.green[200]
				gradientId: 'green-green',
				opacity: ATTENTION_HEAD_1
			},
			{
				from: '.attention .head-out .vector',
				to: '.mlp .initial .head1',
				gradientId: 'purple-purple',
				opacity: ATTENTION_HEAD_1
				// fill: theme.colors.purple[200]
			},
			{
				from: '.head-block .key .vector',
				to: `.attention-matrix.attention-initial .main g.g-row-${$tokens.length - 1} circle`,
				id: 'key-to-attention',
				type: 'stroke',
				gradientId: 'red-purple',
				opacity: ATTENTION_HEAD_1,
				unique: true,
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
				from: '.head-block .query .vector',
				to: `.attention-initial .main g.g-row`,
				gradientId: 'blue-purple',
				id: 'query-to-attention',
				unique: true,
				type: 'stroke',
				opacity: ATTENTION_HEAD_1,
				curve: curveFactor * 30,
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
				from: '.attention-matrix.attention-out .main svg',
				to: '.attention .head-out',
				gradientId: 'transparent-purple2',
				id: 'to-attention-out',
				unique: true,
				opacity: ATTENTION_OUT,
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
				unique: true,
				opacity: ATTENTION_OUT,
				curve: curveFactor * 30,
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
				curve: 50 + (curveFactor - 1) * 20,
				opacity: MLP,
				pathGenerator: (source, target, curveOffset: number) => {
					const scrollTop = window.scrollY;
					const scrollLeft = window.scrollX;

					const rightOffset = rootRem * 3;

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
				curve: 50 + (curveFactor - 1) * 20,
				opacity: MLP,
				pathGenerator: (source, target, curveOffset: number) => {
					const scrollTop = window.scrollY;
					const scrollLeft = window.scrollX;

					const leftOffset = rootRem * 1.5;

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
				opacity: TRANSFORMER_BLOCKS,
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
				opacity: LOGIT,
				unique: true
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

	let prevOpacity = 1;

	let pathHoverTimeout;

	const onMouseOverPathGroup = (e, d) => {
		clearTimeout(pathHoverTimeout);
		hoveredPath.set(d);

		if (pathMap[d]?.[0]?.hoverable) {
			const paths = d3.select(`g.${d}`).selectAll('path');
			prevOpacity = paths.nodes()[0].getAttribute('opacity');
			paths
				.transition()
				.duration(200)
				.style('opacity', Number(prevOpacity) + 0.3);
		}
	};

	const onMouseOutPathGroup = (e, d) => {
		pathHoverTimeout = setTimeout(() => {
			hoveredPath.set(null);
		}, 300);

		if (pathMap[d]?.[0]?.hoverable) {
			const paths = d3.select(`g.${d}`).selectAll('path');
			paths.transition().duration(200).style('opacity', prevOpacity);
		}
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
				.attr('class', (d) => `path-group ${d}`)
				.on('mouseenter', onMouseOverPathGroup)
				.on('mouseleave', onMouseOutPathGroup);

			g.selectAll('path.sankey-path')
				.data((d) => {
					const data = dataMap[d].map((item) => {
						const sources = d3.selectAll(item.from).nodes() as Element[];
						const targets = d3.selectAll(item.to).nodes() as Element[];

						return sources.map((src, i) => {
							const source = src?.getBoundingClientRect();
							const target = targets[i]?.getBoundingClientRect();

							const curveOffset = item.curve || defaultCurveOffset;

							const generator = item.pathGenerator || pathGenerator;
							const path = source && target ? generator(source, target, curveOffset) : '';

							const isLast = targets.length > 1 && i === sources.length - 1;
							let gradUrl = item.gradientId;

							if (isLast && !item.unique && document.getElementById(item.gradientId + '-last')) {
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
				.attr('opacity', (d) => d.opacity)
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
			drawResidualPath();
		});
		const elements = document?.querySelectorAll('.resize-watch');
		elements.forEach((el) => resizeObserver.observe(el));
		// animationTest();

		return () => {
			resizeObserver.disconnect();
		};
	});

	$: if (typeof window !== 'undefined') {
		if ($tokens) {
			drawPath();
			drawResidualPath();
		}
	}

	const drawResidualPath = () => {
		const svg = d3.select(svgEl);

		const starts = d3.selectAll(`.residual-start path.head`).nodes();
		const ends = d3.selectAll(`.residual-end path.head`).nodes();

		const lineData = starts.map((start, i) => {
			const startEl = start.getBoundingClientRect();
			const endEl = ends[i].getBoundingClientRect();

			const x1 = startEl.right;
			const y1 = startEl.top;
			const x2 = endEl.left;
			const y2 = endEl.top;

			return { x1, y1, x2, y2, id: start.id };
		});
		svg
			.selectAll('line.residual-connector')
			.data(lineData)
			.join('line')
			.attr('class', (d) => `residual-connector ${d.id}`)
			.attr('x1', (d) => d.x1)
			.attr('y1', (d) => d.y1)
			.attr('x2', (d) => d.x2)
			.attr('y2', (d) => d.y2)
			.attr('stroke', theme.colors.gray[400])
			.attr('stroke-width', 1)
			.attr('stroke-dasharray', '8,4')
			.style('opacity', 0);
	};

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

<svelte:window bind:innerWidth={screenWidth} />

<div bind:clientWidth={screenWidth} class="h-full w-full">
	<svg
		bind:this={svgBackEl}
		id="back"
		class="sankey-back absolute left-0 top-0 h-full w-full"
		style={`z-index:${$modelMeta.attention_head_num - 1};`}
	></svg>
	<svg
		bind:this={svgEl}
		class="sankey-top absolute left-0 top-0 h-full w-full"
		style={`z-index:${$modelMeta.attention_head_num};`}
	/>
</div>

<style lang="scss">
	.sankey-top,
	.sankey-back {
	}
</style>

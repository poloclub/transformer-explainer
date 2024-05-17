<script lang="ts">
	import { tokens } from '~/store';
	import * as d3 from 'd3';
	import { onMount, tick } from 'svelte';
	import resolveConfig from 'tailwindcss/resolveConfig';
	import tailwindConfig from '../../tailwind.config';

	const { theme } = resolveConfig(tailwindConfig);

	let svgEl: HTMLOrSVGElement;
	let resizeObserver: ResizeObserver;

	const curveOffset = 90;
	const gradientBrightness = 100;

	const pathMap: Record<
		string,
		{ from: string; to: string; gradientId?: string; fill?: string }[]
	> = {
		embedding: [
			{
				from: '.embedding .vector',
				to: '.attention .vector',
				gradientId: 'gray-blue'
			}
		],
		attention: [
			{
				from: '.attention .query .head1',
				to: '.head-block .query .vector',
				fill: theme.colors.blue[100]
			},
			{
				from: '.attention .key .head1',
				to: '.head-block .key .vector',
				fill: theme.colors.red[100]
			},
			{
				from: '.attention .value .head1',
				to: '.head-block .value .vector',
				fill: theme.colors.green[100]
			},

			{
				from: '.attention .head-out .vector',
				to: '.mlp .initial .head1',
				fill: theme.colors.purple[100]
			}
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
			0: theme.colors.gray[gradientBrightness],
			100: theme.colors.blue[gradientBrightness]
		},
		'purple-indigo': {
			0: theme.colors.purple[gradientBrightness],
			100: theme.colors.indigo[gradientBrightness]
		},
		'indigo-blue': {
			0: theme.colors.indigo[gradientBrightness],
			100: theme.colors.blue[gradientBrightness]
		},
		'blue-white': { 0: theme.colors.blue[gradientBrightness], 100: theme.colors.white },
		'red-white': { 0: theme.colors.red[gradientBrightness], 100: theme.colors.white },
		'green-white': { 0: theme.colors.green[gradientBrightness], 100: theme.colors.white },
		'red-purple': {
			0: theme.colors.red[gradientBrightness],
			100: theme.colors.purple[gradientBrightness]
		},
		'blue-purple': {
			0: theme.colors.blue[gradientBrightness],
			100: theme.colors.purple[gradientBrightness]
		},
		'green-purple': {
			0: theme.colors.green[gradientBrightness],
			100: theme.colors.purple[gradientBrightness]
		},
		'blue-gray': {
			0: theme.colors.blue[gradientBrightness],
			100: theme.colors.gray[gradientBrightness]
		},
		'blue-white-blue': {
			0: theme.colors.blue[gradientBrightness],
			40: theme.colors.white,
			60: theme.colors.white,
			100: theme.colors.blue[gradientBrightness]
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
				// .attr('gradientUnits', 'userSpaceOnUse')s
				.attr('x1', '0%')
				.attr('y1', '0%')
				.attr('x2', '100%')
				.attr('y2', '0%');

			Object.keys(stops).forEach((stop) => {
				grad.append('stop').attr('offset', `${stop}%`).attr('stop-color', stops[stop]);
			});
		});
	};

	const drawPath = async () => {
		await tick();
		const svg = d3.select(svgEl);

		const g = svg
			.selectAll('g.path-group')
			.data(Object.keys(pathMap))
			.join('g')
			.attr('class', (d) => `path-group ${d}`);

		g.selectAll('path.sankey')
			.data((d) => {
				const data = pathMap[d].map((item) => {
					const sources = d3.selectAll(item.from).nodes();
					const targets = d3.selectAll(item.to).nodes();

					return sources.map((src, i) => {
						const source = src.getBoundingClientRect();
						const target = targets[i].getBoundingClientRect();

						const path = `
        M ${source.right},${source.top} 
        C ${source.right + curveOffset},${source.top} ${target.left - curveOffset},${target.top} ${target.left},${target.top}
        L ${target.left},${target.bottom}
        C ${target.left - curveOffset},${target.bottom} ${source.right + curveOffset},${source.bottom} ${source.right},${source.bottom}
        Z
    `;
						return { path, fill: item.gradientId ? `url(#${item.gradientId})` : item.fill };
					});
				});

				return data.flat();
			})
			.join('path')
			.attr('class', 'sankey')
			.attr('fill', (d) => d.fill)
			.attr('d', (d) => d.path);
	};

	onMount(() => {
		createGradients();

		resizeObserver = new ResizeObserver((entries) => {
			drawPath();
		});
		const elements = document?.querySelectorAll('.resize-watch');
		elements.forEach((el) => resizeObserver.observe(el));

		return () => {
			resizeObserver.disconnect();
		};
	});

	$: if (typeof window !== 'undefined') {
		$tokens, drawPath();
	}
</script>

<svg bind:this={svgEl} class="h-full w-full" />

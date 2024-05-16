<script lang="ts">
	import { tokens } from '~/store';
	import * as d3 from 'd3';
	import { onMount, tick } from 'svelte';

	let svgEl: HTMLOrSVGElement;
	let resizeObserver: ResizeObserver;

	const pathMap = {
		embedding: [
			{
				from: '.embedding .vector',
				to: '.attention .vector'
			}
		],
		attention: [],
		mlp: [
			{ from: '.mlp .initial .vector', to: '.mlp .projections .vector' },
			{ from: '.mlp .projections .vector', to: '.transformer-blocks .initial .vector' }
		],
		'transformer-blocks': [
			{
				from: '.transformer-blocks .initial .vector',
				to: '.transformer-blocks .final .vector'
			}
		],
		'linear-softmax': [
			{
				from: '.transformer-blocks .final .vector.last ',
				to: '.linear-softmax .vector'
			}
		]
	};

	const curveOffset = 50;

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
						return path;
					});
				});
				return data.flat();
			})
			.join('path')
			.attr('class', 'sankey')
			.attr('fill', 'gray')
			.attr('d', (d) => d);
	};

	onMount(() => {
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

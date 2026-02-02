<script lang="ts">
	import { onMount, tick } from 'svelte';
	import {
		vitConfig,
		vitBlockIdx,
		vitExpandedBlock
	} from '~/store/vit';
	import * as d3 from 'd3';
	import tailwindConfig from '../../../tailwind.config';
	import resolveConfig from 'tailwindcss/resolveConfig';

	const { theme } = resolveConfig(tailwindConfig);

	let svgEl: SVGElement;
	let screenWidth: number;

	// Gradient definitions for ViT flows
	const gradients = {
		'patch-embedding': {
			0: theme.colors.blue[200],
			100: theme.colors.blue[400]
		},
		'cls-embedding': {
			0: theme.colors.purple[200],
			100: theme.colors.purple[400]
		},
		'embedding-attention': {
			0: theme.colors.blue[300],
			50: theme.colors.purple[300],
			100: theme.colors.red[300]
		},
		'attention-mlp': {
			0: theme.colors.red[300],
			100: theme.colors.indigo[400]
		},
		'mlp-output': {
			0: theme.colors.indigo[400],
			100: theme.colors.blue[400]
		},
		'cls-classification': {
			0: theme.colors.purple[400],
			100: theme.colors.green[400]
		}
	};

	// Path configurations for ViT architecture
	$: pathConfigs = [
		{
			id: 'image-to-patches',
			from: '.vit-image-patchify .image-container',
			to: '.vit-patch-embedding .patches-grid',
			gradient: 'patch-embedding',
			opacity: 0.6
		},
		{
			id: 'cls-to-embedding',
			from: '.vit-patch-embedding .cls-section',
			to: '.vit-attention .navigation',
			gradient: 'cls-embedding',
			opacity: 0.5
		},
		{
			id: 'embedding-to-attention',
			from: '.vit-patch-embedding .patches-grid',
			to: '.vit-attention .attention-visuals',
			gradient: 'embedding-attention',
			opacity: 0.5
		},
		{
			id: 'attention-to-mlp',
			from: '.vit-attention .content',
			to: '.vit-mlp .mlp-diagram',
			gradient: 'attention-mlp',
			opacity: 0.4
		},
		{
			id: 'mlp-to-cls',
			from: '.vit-mlp .output-stage',
			to: '.vit-classification .cls-output',
			gradient: 'mlp-output',
			opacity: 0.5
		},
		{
			id: 'cls-to-prediction',
			from: '.vit-classification .cls-output',
			to: '.vit-classification .top-prediction',
			gradient: 'cls-classification',
			opacity: 0.6
		}
	];

	function createGradients() {
		if (!svgEl) return;

		const svg = d3.select(svgEl);
		let defs = svg.select('defs');
		if (defs.empty()) {
			defs = svg.append('defs');
		}

		Object.entries(gradients).forEach(([key, stops]) => {
			const grad = defs
				.append('linearGradient')
				.attr('id', `vit-${key}`)
				.attr('x1', '0%')
				.attr('y1', '0%')
				.attr('x2', '100%')
				.attr('y2', '0%');

			Object.entries(stops).forEach(([offset, color]) => {
				grad.append('stop')
					.attr('offset', `${offset}%`)
					.attr('stop-color', color);
			});
		});
	}

	function generatePath(source: DOMRect, target: DOMRect): string {
		const scrollTop = window.scrollY;
		const scrollLeft = window.scrollX;

		const startX = source.right + scrollLeft;
		const startY = source.top + source.height / 2 + scrollTop;
		const endX = target.left + scrollLeft;
		const endY = target.top + target.height / 2 + scrollTop;

		const curveOffset = Math.min(Math.abs(endX - startX) * 0.4, 80);

		return `
			M ${startX},${startY - source.height / 3}
			C ${startX + curveOffset},${startY - source.height / 3}
				${endX - curveOffset},${endY - target.height / 3}
				${endX},${endY - target.height / 3}
			L ${endX},${endY + target.height / 3}
			C ${endX - curveOffset},${endY + target.height / 3}
				${startX + curveOffset},${startY + source.height / 3}
				${startX},${startY + source.height / 3}
			Z
		`;
	}

	async function drawPaths() {
		await tick();
		if (!svgEl) return;

		const svg = d3.select(svgEl);

		svg.selectAll('path.vit-flow')
			.data(pathConfigs)
			.join('path')
			.attr('class', d => `vit-flow ${d.id}`)
			.attr('d', d => {
				const fromEl = document.querySelector(d.from);
				const toEl = document.querySelector(d.to);

				if (!fromEl || !toEl) return '';

				const sourceRect = fromEl.getBoundingClientRect();
				const targetRect = toEl.getBoundingClientRect();

				return generatePath(sourceRect, targetRect);
			})
			.attr('fill', d => `url(#vit-${d.gradient})`)
			.attr('opacity', d => d.opacity)
			.attr('stroke', 'none');
	}

	onMount(() => {
		createGradients();

		const resizeObserver = new ResizeObserver(() => {
			drawPaths();
		});

		const elements = document.querySelectorAll('.vit-step');
		elements.forEach(el => resizeObserver.observe(el));

		// Initial draw after mount
		setTimeout(drawPaths, 100);

		return () => {
			resizeObserver.disconnect();
		};
	});

	$: if (screenWidth) {
		drawPaths();
	}

	$: if ($vitBlockIdx !== undefined || $vitExpandedBlock) {
		drawPaths();
	}
</script>

<svelte:window bind:innerWidth={screenWidth} />

<svg
	bind:this={svgEl}
	class="vit-sankey"
>
</svg>

<style lang="scss">
	.vit-sankey {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		pointer-events: none;
		z-index: 5;
	}

	:global(.vit-flow) {
		transition: opacity 0.3s;
	}
</style>

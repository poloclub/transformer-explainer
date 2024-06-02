<script lang="ts">
	import { onMount } from 'svelte';
	import { scaleLinear } from 'd3-scale';
	import { interpolateCool } from 'd3-scale-chromatic';
	import * as d3 from 'd3';
	import tailwindConfig from '../../tailwind.config';
	import resolveConfig from 'tailwindcss/resolveConfig';
	import { highlightedToken } from '~/store';

	const { theme } = resolveConfig(tailwindConfig);

	export let data = Array.from({ length: 100 }, () => Math.random());
	export let colorScale: string | ((t: number) => any) | undefined = undefined;

	let canvas: HTMLCanvasElement;

	const lineHeight = 1;

	const colorKey = typeof colorScale === 'string' ? colorScale : 'gray';
	const color =
		typeof colorScale === 'function'
			? colorScale
			: d3.interpolate(theme.colors[colorKey][100], theme.colors[colorKey][500]);

	function drawCanvas() {
		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		const width = canvas.parentElement.clientWidth;
		const height = canvas.parentElement.clientHeight;

		ctx.clearRect(0, 0, width, height);

		let pixelRatio = 4;
		canvas.width = width * pixelRatio;
		canvas.height = height * pixelRatio;
		canvas.style.width = `${width}px`;
		canvas.style.height = `${height}px`;

		for (let i = 0; i < height / lineHeight; i++) {
			const value = data[i % data.length];
			ctx.fillStyle = color(value);
			ctx.fillRect(0, i * lineHeight * pixelRatio, width * pixelRatio, lineHeight * pixelRatio);
		}
	}

	$: if (data && canvas) {
		drawCanvas();
	}
</script>

<canvas bind:this={canvas}></canvas>

<style>
	canvas {
		display: block;
		width: 100%;
		height: 100%;
		overflow: hidden;
	}
</style>

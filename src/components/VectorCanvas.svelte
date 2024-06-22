<script lang="ts">
	import { onMount } from 'svelte';
	import { scaleLinear } from 'd3-scale';
	import { interpolateCool } from 'd3-scale-chromatic';
	import * as d3 from 'd3';
	import tailwindConfig from '../../tailwind.config';
	import resolveConfig from 'tailwindcss/resolveConfig';
	import { highlightedToken, vectorHeight } from '~/store';

	const { theme } = resolveConfig(tailwindConfig);

	let visibleDimension = Math.floor($vectorHeight * 3.5) * 4;
	export let active: boolean = false;
	export let data: number[] = new Array(visibleDimension).fill(0).map((d) => Math.random());
	export let colorScale: string | ((t: number, i: number) => string) | undefined = undefined;

	let canvas: HTMLCanvasElement;

	const lineHeight = 1;

	const colorKey = typeof colorScale === 'string' ? colorScale : 'gray';
	const color =
		typeof colorScale === 'function'
			? colorScale
			: d3.interpolate(theme.colors[colorKey][100], theme.colors[colorKey][400]);

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
			const value = data[i];
			ctx.fillStyle = color(value);
			ctx.fillRect(0, i * lineHeight * pixelRatio, width * pixelRatio, lineHeight * pixelRatio);
		}
	}

	onMount(() => {
		const unsubscribe = vectorHeight.subscribe(drawCanvas);
		return () => {
			unsubscribe();
		};
	});

	$: if (data && canvas) {
		drawCanvas();
	}
</script>

<canvas class:active bind:this={canvas}></canvas>

<style lang="scss">
	canvas {
		position: absolute;
		top: 0;
		left: 0;
		opacity: 0;
		display: block;
		width: 100%;
		height: 100%;
		overflow: hidden;
		transition: opacity 0.2s;

		&.active {
			opacity: 1;
		}

		&:hover {
			opacity: 1;
		}
	}
</style>

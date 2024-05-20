<script lang="ts">
	import * as d3 from 'd3';
	import tailwindConfig from '../../tailwind.config';
	import resolveConfig from 'tailwindcss/resolveConfig';
	import { highlightedToken } from '~/store';

	export let data: number[][] | number[][][];
	export let cellHeight: number;
	export let cellWidth: number;
	export let rowGap: number = 2;
	export let colGap: number = 0;

	export let rowLen: number;
	export let colLen: number;
	export let dimension: number;

	const { theme } = resolveConfig(tailwindConfig);

	let canvasEl: HTMLCanvasElement;

	const colorScale = d3.interpolate('white', theme.colors['primary'][600]);

	function drawCanvas() {
		const ctx = canvasEl.getContext('2d');
		if (!ctx) return;

		ctx.clearRect(0, 0, width, height);

		let pixelRatio = 4;
		canvasEl.width = width * pixelRatio;
		canvasEl.height = height * pixelRatio;
		canvasEl.style.width = `${width}px`;
		canvasEl.style.height = `${height}px`;

		data.forEach((row, i) => {
			row.forEach((value, j) => {
				ctx.fillStyle = highlightedIndex === i ? highlightColorScale(value) : colorScale(value);
				ctx.fillRect(
					j * cellWidth * pixelRatio,
					i * (cellHeight + rowGap) * pixelRatio,
					cellWidth * pixelRatio,
					cellHeight * pixelRatio
				);
			});
		});
	}

	$: if (data && canvasEl) {
		drawCanvas();
	}
</script>

<canvas class="vector-canvas h-full w-full" bind:this={canvasEl}></canvas>

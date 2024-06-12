<script lang="ts">
	import classNames from 'classnames';
	import { Popover } from 'flowbite-svelte';
	import * as d3 from 'd3';
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';
	import { tokens } from '~/store';

	import type { PopoverProps } from 'flowbite-svelte/Popover.svelte';

	export let offset: PopoverProps['offset'] = undefined;
	export let className: PopoverProps['class'] = undefined;
	export let triggeredBy: PopoverProps['triggeredBy'] = undefined;
	export let trigger: PopoverProps['trigger'] = 'hover';
	export let placement: PopoverProps['placement'] = 'right';
	export let open: PopoverProps['open'] = false;

	const numPositions = 40;
	const fullEmbeddingDim = 768; // Compute 768 dimensions
	const visualEmbeddingDim = 100; // Truncate to 100 dimensions for visualization

	let numBarcodeLines = 21;

	function computePositionalEncodings(numPositions, fullEmbeddingDim, visualEmbeddingDim) {
		const posEncodings = Array(visualEmbeddingDim)
			.fill()
			.map(() => Array(numPositions).fill(0));

		for (let pos = 0; pos < numPositions; pos++) {
			for (let i = 0; i < visualEmbeddingDim; i++) {
				const value =
					i % 2 === 0
						? Math.sin(pos / Math.pow(10000, i / fullEmbeddingDim))
						: Math.cos(pos / Math.pow(10000, (i - 1) / fullEmbeddingDim));

				posEncodings[pos][i] = value;
			}
		}
		return posEncodings;
	}

	let posEncodings = [];
	const hoveredRow = writable(null);
	const hoveredCol = writable(null);

	// Create a linear color scale
	const colorScale = d3
		.scaleLinear()
		.domain([-1, 0, 1])
		.range(['rgb(248, 113, 113)', 'rgb(255, 255, 255)', 'rgb(96, 165, 250)'])
		.interpolate(d3.interpolateRgb);

	// Function to get the gradient color using D3
	function getGradientColor(value) {
		return colorScale(value);
	}

	posEncodings = computePositionalEncodings(numPositions, fullEmbeddingDim, visualEmbeddingDim);
</script>

<!-- <Popover
	class={classNames('popover positional-encoding-popover text-sm', className)}
	title="Positional Encoding"
	{offset}
	{triggeredBy}
	{trigger}
	{placement}
	{open}
> -->
<div class="popover-container emb_pos">
	<!-- <div class="title">Positional Encoding</div> -->

	<div class="content">
		<div class="token-container">
			<div class="tokens">
				<div class="subtitle">Token</div>
				<div class="subcontent flex flex-col">
					{#each $tokens as token, token_idx}
						<div
							class="token-box"
							role="group"
							on:mouseenter={() => hoveredCol.set(token_idx)}
							on:mouseleave={() => hoveredCol.set(null)}
							class:highlight-token-box={token_idx === $hoveredCol}
						>
							<span class="text-ellipsis text-center text-gray-900">{token}</span>
						</div>
					{/each}
				</div>
			</div>
			<div class="positions">
				<div class="subtitle">Position</div>
				<div class="subcontent flex flex-col">
					{#each $tokens as token, token_idx}
						<div
							class="position-box"
							role="group"
							on:mouseenter={() => hoveredCol.set(token_idx)}
							on:mouseleave={() => hoveredCol.set(null)}
							class:highlight-token-box={token_idx === $hoveredCol}
						>
							<span class="text-ellipsis text-center text-gray-900">{token_idx}</span>
						</div>
					{/each}
				</div>
			</div>
			<div class="embs">
				<div class="subtitle">Embedding</div>
				<div class="subcontent flex flex-col">
					{#each $tokens as token, token_idx}
						<div
							class="barcode-box flex flex-col justify-between"
							role="group"
							on:mouseenter={() => hoveredCol.set(token_idx)}
							on:mouseleave={() => hoveredCol.set(null)}
							class:highlight-token-box={token_idx === $hoveredCol}
						>
							{#each Array(numBarcodeLines) as _, barcode_idx}
								<div
									class="barcode-bar h-full w-full"
									role="group"
									on:mouseenter={() => hoveredRow.set(barcode_idx)}
									on:mouseleave={() => hoveredRow.set(null)}
									style="background-color: {getGradientColor(
										posEncodings[barcode_idx][token_idx]
									)};"
								></div>
							{/each}
						</div>
					{/each}
				</div>
			</div>
		</div>
		<div class="viz-container">
			<div class="subtitle">Encoding Matrix</div>
			<div class="subcontent viz-subcontent">
				<div class="chart-container mx-auto">
					<div class="embed-dim-axis">
						{#each Array(visualEmbeddingDim + 1).fill(0) as _, index}
							{#if index % 10 === 0}
								<div>{index}</div>
							{/if}
						{/each}
					</div>
					<div class="position-axis">
						{#each Array(numPositions + 1).fill(0) as _, index}
							{#if index % 10 === 0}
								<div>{index}</div>
							{/if}
						{/each}
					</div>
					<div class="matrix flex">
						{#each posEncodings as col, colIndex}
							<div class="matrix-col">
								{#each col as value, rowIndex}
									<div
										class="matrix-cell {$hoveredCol === rowIndex ? 'highlighted-col' : ''}"
										class:barcode-row-highlight={colIndex === $hoveredRow &&
											$hoveredCol === rowIndex}
										style="background-color: {getGradientColor(value)};"
										role="group"
										on:mouseenter={() => {
											hoveredRow.set(colIndex);
											hoveredCol.set(rowIndex);
										}}
										on:mouseleave={() => {
											hoveredRow.set(null);
											hoveredCol.set(null);
										}}
									></div>
								{/each}
							</div>
						{/each}
					</div>
					<div class="gradient-legend-container">
						<div class="gradient-legend"></div>
						<div class="legend-labels">
							<span>1</span>
							<span>0</span>
							<span>-1</span>
						</div>
					</div>
				</div>

				<div class="formula-container mt-4 w-[400] flex-col justify-around gap-1 bg-gray-50 p-2">
					<div class="even-pos flex h-10 flex-1 items-center justify-between gap-4 p-1">
						<div class="flex items-center justify-center gap-1">
							<span class="flex"></span>
							{#if $hoveredCol % 2 === 0}
								<span class="flex w-8 justify-center rounded-sm border border-blue-400">sin</span>
							{:else}
								<span class="flex w-8 justify-center rounded-sm border border-blue-400">cos</span>
							{/if}
							<span>(</span>
							<span class="flex w-8 justify-center rounded-sm border border-blue-400"
								>{$hoveredCol ? $hoveredCol : 'pos'}</span
							>
							<span>/ 10000 </span>
							<sup
								>(2 *
								<span class="mr-1 rounded-sm border border-blue-400 pl-2 pr-2"
									>{$hoveredRow ? $hoveredRow : ' i '}</span
								>
								/ 768)</sup
							>
							<span>)</span>
							<!-- <span>/ 10000 ^ ( 2 *</span>
							<sup>superscript hrllo</sup>
							<span class="w-8 flex justify-center border border-blue-400 rounded-sm">{$hoveredRow ? $hoveredRow : 'i'}</span>
							<span>/ 768 ) )</span> -->
							<!-- <span>=</span> -->
						</div>
						<!-- <div>=</div> -->
						{#if $hoveredCol !== null && $hoveredRow !== null}
							<div>=</div>
							<div
								class="formula-solution-box w-[80] items-center rounded-sm p-2"
								style="background-color: {getGradientColor(posEncodings[$hoveredRow][$hoveredCol])};
								border: 3px solid {getGradientColor(posEncodings[$hoveredRow][$hoveredCol])};
								color: {Math.abs(posEncodings[$hoveredRow][$hoveredCol]) > 0.3 ? 'white' : 'black'};"
							>
								{posEncodings[$hoveredRow][$hoveredCol].toFixed(2)}
							</div>
						{:else}
							<div
								class="formula-solution-box items-center rounded-sm border-2 border-gray-300 p-2"
							></div>
						{/if}
					</div>
				</div>
			</div>
		</div>
	</div>
</div>

<!-- </Popover> -->

<style lang="scss">
	.highlight {
		cursor: pointer !important;
		border: 2px solid theme('colors.gray.500') !important;
		font-weight: bold;
	}

	.formula-solution-box {
		width: 5rem;
		height: 3rem;
		display: flex;
		justify-content: center;
	}

	.popover-container {
		border: 1px solid black;
		max-height: 30rem;
		max-width: 40rem;
		display: flex;
		flex-direction: column;

		.title {
			display: flex;
			align-items: center;
			justify-content: center;
			text-align: center;
			font-size: 1rem;
			color: theme('colors.gray.500');
		}

		.content {
			display: flex;
			.token-container {
				display: flex;
				width: 100%;

				.tokens {
					display: flex;
					flex-direction: column;
					flex-shrink: 0;
				}
				.positions {
					display: flex;
					flex-direction: column;
					flex-shrink: 0;
				}
				.embs {
					display: flex;
					flex-direction: column;
					flex-shrink: 0;
				}
			}
			.viz-container {
				display: flex;
				flex-direction: column;
				justify-content: center;
				align-items: center;
			}
		}
	}

	.subtitle {
		font-size: 0.8rem;
		white-space: nowrap;
		display: flex;
		align-items: center;
		justify-content: center;
		color: theme('colors.gray.500');
	}

	.subcontent {
		flex: 1 0 0;
		display: flex;
		align-items: center;
		// justify-content: start;
		justify-content: space-around;
	}

	.viz-subcontent {
		display: flex;
		flex-direction: column;
		justify-content: start;
	}

	.formula-container {
		display: flex;
		width: 420px;
		// width: 600px;
		height: 80px;
		border-radius: 4px;
		border: 1px dashed theme('colors.gray.400');
	}

	.token-box {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 3rem;
		height: 1rem;
		border-radius: 4px;

		&:hover {
			background-color: theme('colors.gray.100');
			border: 1px solid #e2e8f0;
		}
	}

	.position-box {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 1.5rem;
		height: 1.5rem;
		background-color: theme('colors.gray.100');
		border: 1px solid #e2e8f0;
		border-radius: 4px;
		margin: 0.25rem;
		font-size: 0.9rem;

		&:hover {
			background-color: theme('colors.gray.100');
			border: 1px solid #e2e8f0;
		}
	}

	.barcode-box {
		width: 1rem;
		height: 2rem;
	}

	.highlight-token-box {
		cursor: pointer !important;
		// border: 2px solid theme('colors.gray.500') !important;
		font-weight: bold;
		box-shadow: 0 0 0 1.5px theme('colors.gray.500');
		transition: 0.1s;
		// box-shadow: 0 0 0 1px black, 0 0 0 3px blue;
	}

	.barcode-row-highlight {
		border: 0.2px solid theme('colors.gray.500');
		transform: scaleX(12);
		transition: 0.1s;
		cursor: pointer;
	}

	.barcode-bar:hover {
		// border: 0.5px solid theme('colors.gray.100');
		box-shadow: 0 0 0 1px theme('colors.gray.500');
		transform: scaleX(1.5);
		transition: 0.1s;
	}

	.chart-container {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		margin-top: 20px;
	}

	.matrix {
	}

	.matrix-cell {
		width: 4px;
		height: 4px;
		flex-shrink: 0;
	}

	.matrix-cell.highlighted-col {
		transform: scaleX(5);
		// padding-left: 0.5px solid white;
		// padding-right: 0.5px solid white;
		border-left: 0.1px solid theme('colors.gray.600');
		border-right: 0.1px solid theme('colors.gray.600');
		// border: 0.1px solid theme('colors.gray.500');
		transition: 0.1s;
	}

	.position-axis {
		padding-right: 5px;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		height: 100%;
		font-size: 0.5rem;
		color: theme('colors.gray.500');
	}

	.embed-dim-axis {
		position: absolute;
		top: 0;
		left: 22px;
		display: flex;
		width: 400px;
		justify-content: space-between;
		font-size: 0.5rem;
		color: theme('colors.gray.500');
		transform: translateY(-20px); /* Adjust this value to move the axis above the matrix */
	}

	.gradient-legend-container {
		display: flex;
		align-items: center;
		height: 400px;
		margin-left: 20px;
	}

	.gradient-legend {
		width: 8px;
		height: 100%;
		background: linear-gradient(to top, rgb(96, 165, 250), white, rgb(248, 113, 113));
		border: 1px solid theme('colors.gray.300');
	}

	.legend-labels {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		height: 100%;
		padding-left: 5px;
		color: theme('colors.gray.500');
	}

	.legend-labels span {
		font-size: 0.55rem; /* Adjust the font size as needed */
	}
</style>

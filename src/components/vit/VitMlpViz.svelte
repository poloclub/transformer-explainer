<script lang="ts">
	/**
	 * VitMlpViz - MLP (Feed-Forward Network) Visualization
	 *
	 * Features:
	 * - Before/after representation comparison
	 * - Hidden layer expansion visualization
	 * - GELU activation visualization
	 * - Per-token MLP output display
	 */

	import { fade } from 'svelte/transition';
	import {
		vitConfig,
		vitModelData,
		vitBlockIdx,
		selectedPatchIdx
	} from '~/store/vit';
	import * as d3 from 'd3';

	// Display constants
	const VECTOR_HEIGHT = 100;
	const VECTOR_WIDTH = 12;
	const HIDDEN_VECTOR_WIDTH = 20;

	// Canvas refs
	let inputCanvas: HTMLCanvasElement;
	let hiddenCanvas: HTMLCanvasElement;
	let outputCanvas: HTMLCanvasElement;
	let geluCanvas: HTMLCanvasElement;

	// Get current layer data
	$: layerData = $vitModelData?.layerOutputs[$vitBlockIdx];

	// Token index (CLS = 0, patches = 1-196)
	$: tokenIdx = $selectedPatchIdx === -1 ? 0 : $selectedPatchIdx + 1;

	// Extract vectors for selected token
	$: inputVector = layerData ? extractTokenVector(layerData.attentionOutput, tokenIdx) : null;
	$: hiddenVector = layerData ? extractTokenVector(layerData.mlpHidden, tokenIdx) : null;
	$: outputVector = layerData ? extractTokenVector(layerData.mlpOutput, tokenIdx) : null;

	function extractTokenVector(data: Float32Array, tokenIndex: number): Float32Array {
		if (!data) return new Float32Array(0);
		const dim = tokenIndex === -1 ? vitConfig.hiddenSize :
			data.length / vitConfig.numTokens;
		const start = tokenIndex * dim;
		return data.slice(start, start + dim);
	}

	// Draw canvases when data changes
	$: if (inputCanvas && inputVector) drawVector(inputCanvas, inputVector, 'purple');
	$: if (hiddenCanvas && hiddenVector) drawVector(hiddenCanvas, hiddenVector, 'indigo');
	$: if (outputCanvas && outputVector) drawVector(outputCanvas, outputVector, 'blue');
	$: if (geluCanvas) drawGeluCurve(geluCanvas);

	function drawVector(canvas: HTMLCanvasElement, data: Float32Array, colorName: string) {
		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		const width = canvas.width;
		const height = canvas.height;
		ctx.clearRect(0, 0, width, height);

		// Normalize data
		let min = Infinity, max = -Infinity;
		for (let i = 0; i < data.length; i++) {
			min = Math.min(min, data[i]);
			max = Math.max(max, data[i]);
		}
		const range = max - min || 1;

		// Color scale
		const colorScale = colorName === 'purple' ? d3.interpolatePurples :
			colorName === 'indigo' ? d3.interpolateBlues :
			d3.interpolateBlues;

		// Draw vertical heatmap
		const step = height / Math.min(data.length, height);
		for (let i = 0; i < Math.min(data.length, height); i++) {
			const normalized = (data[i] - min) / range;
			ctx.fillStyle = colorScale(0.2 + normalized * 0.7);
			ctx.fillRect(0, i * step, width, step + 1);
		}
	}

	function drawGeluCurve(canvas: HTMLCanvasElement) {
		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		const width = canvas.width;
		const height = canvas.height;
		ctx.clearRect(0, 0, width, height);

		// Background
		ctx.fillStyle = '#f3f4f6';
		ctx.fillRect(0, 0, width, height);

		// Draw axes
		ctx.strokeStyle = '#d1d5db';
		ctx.lineWidth = 1;
		ctx.beginPath();
		ctx.moveTo(0, height / 2);
		ctx.lineTo(width, height / 2);
		ctx.moveTo(width / 2, 0);
		ctx.lineTo(width / 2, height);
		ctx.stroke();

		// Draw GELU curve
		ctx.strokeStyle = '#6366f1';
		ctx.lineWidth = 2;
		ctx.beginPath();

		const xMin = -3, xMax = 3;
		for (let px = 0; px <= width; px++) {
			const x = xMin + (px / width) * (xMax - xMin);
			// GELU approximation: 0.5 * x * (1 + tanh(sqrt(2/π) * (x + 0.044715 * x^3)))
			const gelu = 0.5 * x * (1 + Math.tanh(Math.sqrt(2 / Math.PI) * (x + 0.044715 * x * x * x)));
			const py = height / 2 - (gelu / 3) * (height / 2);

			if (px === 0) ctx.moveTo(px, py);
			else ctx.lineTo(px, py);
		}
		ctx.stroke();
	}

	// Compute statistics
	$: inputStats = inputVector ? computeStats(inputVector) : null;
	$: outputStats = outputVector ? computeStats(outputVector) : null;

	function computeStats(data: Float32Array): { mean: number; std: number; min: number; max: number } {
		let sum = 0, sumSq = 0, min = Infinity, max = -Infinity;
		for (let i = 0; i < data.length; i++) {
			sum += data[i];
			sumSq += data[i] * data[i];
			min = Math.min(min, data[i]);
			max = Math.max(max, data[i]);
		}
		const mean = sum / data.length;
		const variance = sumSq / data.length - mean * mean;
		return { mean, std: Math.sqrt(variance), min, max };
	}

	function formatNum(n: number): string {
		return n.toFixed(3);
	}
</script>

<div class="vit-mlp-viz">
	<!-- Header -->
	<div class="section-header">
		<h3 class="title">MLP (Feed-Forward)</h3>
		<span class="layer-badge">Layer {$vitBlockIdx + 1}</span>
	</div>

	<div class="content">
		<!-- MLP Flow Diagram -->
		<div class="mlp-flow">
			<!-- Input (After Attention) -->
			<div class="stage input-stage">
				<div class="stage-label">Input</div>
				<div class="vector-container">
					<canvas
						bind:this={inputCanvas}
						width={VECTOR_WIDTH}
						height={VECTOR_HEIGHT}
						class="vector-canvas"
					/>
				</div>
				<div class="dim-label">{vitConfig.hiddenSize}</div>
			</div>

			<!-- W1 + GELU -->
			<div class="transform-section">
				<div class="weight-box">
					<span class="weight-label">W₁</span>
					<div class="weight-dims">{vitConfig.hiddenSize}×{vitConfig.mlpSize}</div>
				</div>
				<svg class="arrow" viewBox="0 0 24 12" width="24" height="12">
					<path d="M0 6 L18 6 M14 2 L20 6 L14 10" fill="none" stroke="currentColor" stroke-width="1.5"/>
				</svg>
			</div>

			<!-- Hidden Layer -->
			<div class="stage hidden-stage">
				<div class="stage-label">Hidden</div>
				<div class="vector-container expanded">
					<canvas
						bind:this={hiddenCanvas}
						width={HIDDEN_VECTOR_WIDTH}
						height={VECTOR_HEIGHT}
						class="vector-canvas"
					/>
				</div>
				<div class="dim-label">{vitConfig.mlpSize}</div>
				<div class="activation-badge">
					<canvas
						bind:this={geluCanvas}
						width={40}
						height={24}
						class="gelu-canvas"
					/>
					<span>GELU</span>
				</div>
			</div>

			<!-- W2 -->
			<div class="transform-section">
				<div class="weight-box">
					<span class="weight-label">W₂</span>
					<div class="weight-dims">{vitConfig.mlpSize}×{vitConfig.hiddenSize}</div>
				</div>
				<svg class="arrow" viewBox="0 0 24 12" width="24" height="12">
					<path d="M0 6 L18 6 M14 2 L20 6 L14 10" fill="none" stroke="currentColor" stroke-width="1.5"/>
				</svg>
			</div>

			<!-- Output -->
			<div class="stage output-stage">
				<div class="stage-label">Output</div>
				<div class="vector-container">
					<canvas
						bind:this={outputCanvas}
						width={VECTOR_WIDTH}
						height={VECTOR_HEIGHT}
						class="vector-canvas"
					/>
				</div>
				<div class="dim-label">{vitConfig.hiddenSize}</div>
			</div>
		</div>

		<!-- Residual Connection Visual -->
		<div class="residual-section">
			<svg class="residual-path" viewBox="0 0 280 20" width="280" height="20">
				<path
					d="M 20 18 L 20 6 Q 20 2 24 2 L 256 2 Q 260 2 260 6 L 260 18"
					fill="none"
					stroke="#9ca3af"
					stroke-width="1.5"
					stroke-dasharray="4,3"
				/>
				<circle cx="140" cy="2" r="6" fill="white" stroke="#9ca3af" stroke-width="1"/>
				<text x="140" y="5" text-anchor="middle" font-size="8" fill="#6b7280">+</text>
			</svg>
			<span class="residual-label">Skip Connection</span>
		</div>

		<!-- Before/After Comparison -->
		{#if inputStats && outputStats}
			<div class="comparison" transition:fade={{ duration: 150 }}>
				<div class="comparison-header">Before / After MLP</div>
				<div class="stats-grid">
					<div class="stat-row">
						<span class="stat-label">Mean:</span>
						<span class="stat-value before">{formatNum(inputStats.mean)}</span>
						<span class="arrow-icon">→</span>
						<span class="stat-value after">{formatNum(outputStats.mean)}</span>
					</div>
					<div class="stat-row">
						<span class="stat-label">Std:</span>
						<span class="stat-value before">{formatNum(inputStats.std)}</span>
						<span class="arrow-icon">→</span>
						<span class="stat-value after">{formatNum(outputStats.std)}</span>
					</div>
					<div class="stat-row">
						<span class="stat-label">Range:</span>
						<span class="stat-value before">[{formatNum(inputStats.min)}, {formatNum(inputStats.max)}]</span>
						<span class="arrow-icon">→</span>
						<span class="stat-value after">[{formatNum(outputStats.min)}, {formatNum(outputStats.max)}]</span>
					</div>
				</div>
			</div>
		{/if}

		<!-- Token Info -->
		<div class="token-info">
			Viewing: {$selectedPatchIdx === -1 ? '[CLS]' : `Patch ${$selectedPatchIdx}`}
		</div>
	</div>
</div>

<style lang="scss">
	.vit-mlp-viz {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.section-header {
		display: flex;
		align-items: center;
		gap: 0.5rem;

		.title {
			font-size: 0.95rem;
			font-weight: 600;
			color: theme('colors.gray.700');
			margin: 0;
		}

		.layer-badge {
			font-size: 0.6rem;
			padding: 0.125rem 0.375rem;
			background: theme('colors.indigo.100');
			color: theme('colors.indigo.600');
			border-radius: 0.25rem;
			font-weight: 500;
		}
	}

	.content {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.mlp-flow {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		padding: 0.75rem;
		background: white;
		border: 1px solid theme('colors.gray.200');
		border-radius: 0.5rem;
	}

	.stage {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.25rem;

		.stage-label {
			font-size: 0.55rem;
			color: theme('colors.gray.400');
			text-transform: uppercase;
			letter-spacing: 0.05em;
		}

		.vector-container {
			padding: 0.25rem;
			background: theme('colors.purple.50');
			border: 1px solid theme('colors.purple.200');
			border-radius: 0.25rem;

			&.expanded {
				background: theme('colors.indigo.50');
				border-color: theme('colors.indigo.200');
			}

			.vector-canvas {
				display: block;
				border-radius: 2px;
			}
		}

		.dim-label {
			font-size: 0.5rem;
			color: theme('colors.gray.500');
			font-family: monospace;
		}

		.activation-badge {
			display: flex;
			align-items: center;
			gap: 0.25rem;
			padding: 0.125rem 0.25rem;
			background: theme('colors.indigo.100');
			border-radius: 0.25rem;
			margin-top: 0.25rem;

			.gelu-canvas {
				border-radius: 2px;
			}

			span {
				font-size: 0.5rem;
				color: theme('colors.indigo.600');
				font-weight: 600;
			}
		}
	}

	.input-stage .vector-container {
		background: theme('colors.purple.50');
		border-color: theme('colors.purple.200');
	}

	.output-stage .vector-container {
		background: theme('colors.blue.50');
		border-color: theme('colors.blue.200');
	}

	.transform-section {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.25rem;

		.weight-box {
			display: flex;
			flex-direction: column;
			align-items: center;
			padding: 0.25rem 0.375rem;
			background: theme('colors.gray.100');
			border: 1px solid theme('colors.gray.300');
			border-radius: 0.25rem;

			.weight-label {
				font-size: 0.6rem;
				font-weight: 600;
				color: theme('colors.gray.600');
			}

			.weight-dims {
				font-size: 0.45rem;
				color: theme('colors.gray.400');
				font-family: monospace;
			}
		}

		.arrow {
			color: theme('colors.gray.400');
		}
	}

	.residual-section {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.125rem;

		.residual-path {
			opacity: 0.8;
		}

		.residual-label {
			font-size: 0.55rem;
			color: theme('colors.gray.400');
		}
	}

	.comparison {
		padding: 0.5rem;
		background: theme('colors.gray.50');
		border: 1px solid theme('colors.gray.200');
		border-radius: 0.375rem;

		.comparison-header {
			font-size: 0.6rem;
			color: theme('colors.gray.500');
			text-transform: uppercase;
			letter-spacing: 0.05em;
			margin-bottom: 0.375rem;
		}

		.stats-grid {
			display: flex;
			flex-direction: column;
			gap: 0.25rem;
		}

		.stat-row {
			display: flex;
			align-items: center;
			gap: 0.375rem;
			font-size: 0.6rem;

			.stat-label {
				color: theme('colors.gray.500');
				min-width: 2.5rem;
			}

			.stat-value {
				font-family: monospace;

				&.before {
					color: theme('colors.purple.600');
				}

				&.after {
					color: theme('colors.blue.600');
				}
			}

			.arrow-icon {
				color: theme('colors.gray.400');
				font-size: 0.5rem;
			}
		}
	}

	.token-info {
		font-size: 0.55rem;
		color: theme('colors.gray.400');
		text-align: center;
	}
</style>

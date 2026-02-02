<script lang="ts">
	/**
	 * VitAttentionViz - Multi-head self-attention visualization
	 *
	 * Features:
	 * - Layer/head selector with smooth navigation
	 * - Attention matrix heatmap (Canvas-based for performance)
	 * - Attention source selector (CLS or patch tokens)
	 * - Spatial attention projection onto image grid
	 * - Attention statistics display
	 */

	import { onMount, afterUpdate } from 'svelte';
	import {
		vitConfig,
		vitModelData,
		vitBlockIdx,
		vitAttentionHeadIdx,
		selectedPatchIdx,
		hoveredPatchIdx,
		currentAttentionWeights,
		spatialAttention,
		attentionMode,
		showClsToken,
		vitColors
	} from '~/store/vit';
	import * as d3 from 'd3';

	// Display constants
	const MATRIX_SIZE = 180;
	const HEATMAP_SIZE = 140;
	const VISIBLE_TOKENS = 40; // Show subset of attention matrix

	// Canvas refs
	let matrixCanvas: HTMLCanvasElement;
	let heatmapCanvas: HTMLCanvasElement;

	// Reactive updates
	$: if (matrixCanvas && $vitModelData) drawAttentionMatrix();
	$: if (heatmapCanvas && $spatialAttention) drawSpatialHeatmap();

	// Navigation handlers
	function changeLayer(delta: number) {
		const newIdx = Math.max(0, Math.min(vitConfig.numLayers - 1, $vitBlockIdx + delta));
		vitBlockIdx.set(newIdx);
	}

	function changeHead(delta: number) {
		const newIdx = Math.max(0, Math.min(vitConfig.numHeads - 1, $vitAttentionHeadIdx + delta));
		vitAttentionHeadIdx.set(newIdx);
	}

	// Source selection
	function selectSource(idx: number) {
		selectedPatchIdx.set(idx);
	}

	// Quick source options (-1 = CLS, then corner/center patches)
	const quickSources = [
		{ label: '[CLS]', idx: -1 },
		{ label: 'P0', idx: 0 },
		{ label: 'P97', idx: 97 },  // Center-ish
		{ label: 'P195', idx: 195 }, // Last patch
	];

	// Color scale for attention
	const colorScale = d3.scaleSequential(d3.interpolateReds).domain([0, 1]);

	// Draw attention matrix
	function drawAttentionMatrix() {
		if (!matrixCanvas || !$vitModelData) return;

		const ctx = matrixCanvas.getContext('2d');
		if (!ctx) return;

		ctx.clearRect(0, 0, MATRIX_SIZE, MATRIX_SIZE);

		const layerData = $vitModelData.layerOutputs[$vitBlockIdx];
		if (!layerData) return;

		const weights = layerData.attentionWeights;
		const numTokens = vitConfig.numTokens;
		const headOffset = $vitAttentionHeadIdx * numTokens * numTokens;

		// Show subset of matrix for performance
		const displaySize = Math.min(numTokens, VISIBLE_TOKENS);
		const cellSize = MATRIX_SIZE / displaySize;

		// Find max for normalization
		let maxWeight = 0;
		for (let i = 0; i < displaySize; i++) {
			for (let j = 0; j < displaySize; j++) {
				maxWeight = Math.max(maxWeight, weights[headOffset + i * numTokens + j]);
			}
		}

		// Draw cells
		for (let i = 0; i < displaySize; i++) {
			for (let j = 0; j < displaySize; j++) {
				const weight = weights[headOffset + i * numTokens + j];
				const normalized = weight / (maxWeight || 1);

				ctx.fillStyle = colorScale(normalized);
				ctx.fillRect(j * cellSize, i * cellSize, cellSize - 0.5, cellSize - 0.5);
			}
		}

		// Highlight selected row
		const selectedToken = $selectedPatchIdx === -1 ? 0 : Math.min($selectedPatchIdx + 1, displaySize - 1);
		if (selectedToken < displaySize) {
			ctx.strokeStyle = vitColors.cls;
			ctx.lineWidth = 2;
			ctx.strokeRect(0, selectedToken * cellSize, MATRIX_SIZE, cellSize);
		}

		// Draw axis labels
		ctx.fillStyle = '#6b7280';
		ctx.font = '9px system-ui';
		ctx.fillText('CLS', 2, 10);
	}

	// Draw spatial heatmap
	function drawSpatialHeatmap() {
		if (!heatmapCanvas || !$spatialAttention) return;

		const ctx = heatmapCanvas.getContext('2d');
		if (!ctx) return;

		ctx.clearRect(0, 0, HEATMAP_SIZE, HEATMAP_SIZE);

		const { data, gridSize } = $spatialAttention;
		const cellSize = HEATMAP_SIZE / gridSize;

		// Find max for normalization
		let maxAttn = 0;
		for (let i = 0; i < data.length; i++) {
			maxAttn = Math.max(maxAttn, data[i]);
		}

		// Draw cells
		for (let i = 0; i < gridSize * gridSize; i++) {
			const row = Math.floor(i / gridSize);
			const col = i % gridSize;
			const attention = data[i] / (maxAttn || 1);

			ctx.fillStyle = colorScale(attention);
			ctx.fillRect(col * cellSize, row * cellSize, cellSize - 0.5, cellSize - 0.5);
		}

		// Highlight selected patch
		if ($selectedPatchIdx >= 0 && $selectedPatchIdx < gridSize * gridSize) {
			const row = Math.floor($selectedPatchIdx / gridSize);
			const col = $selectedPatchIdx % gridSize;
			ctx.strokeStyle = vitColors.cls;
			ctx.lineWidth = 2;
			ctx.strokeRect(col * cellSize, row * cellSize, cellSize, cellSize);
		}
	}

	// Get attention statistics
	$: attentionStats = $currentAttentionWeights ? {
		clsAttention: $currentAttentionWeights[0],
		maxPatchAttention: Math.max(...Array.from($currentAttentionWeights).slice(1)),
		entropy: computeEntropy($currentAttentionWeights)
	} : null;

	function computeEntropy(weights: Float32Array): number {
		let entropy = 0;
		for (let i = 0; i < weights.length; i++) {
			if (weights[i] > 0) {
				entropy -= weights[i] * Math.log2(weights[i]);
			}
		}
		return entropy;
	}

	// Format attention mode label
	$: modeLabel = {
		'single_head': `Head ${$vitAttentionHeadIdx + 1}`,
		'avg_heads': 'All Heads (Avg)',
		'rollout': 'Attention Rollout'
	}[$attentionMode];
</script>

<div class="vit-attention-viz">
	<!-- Header -->
	<div class="section-header">
		<h3 class="title">Multi-Head Self-Attention</h3>
	</div>

	<!-- Navigation Controls -->
	<div class="nav-controls">
		<!-- Layer Selector -->
		<div class="nav-group">
			<span class="nav-label">Layer</span>
			<div class="nav-buttons">
				<button
					class="nav-btn"
					disabled={$vitBlockIdx === 0}
					on:click={() => changeLayer(-1)}
				>
					<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
						<path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
					</svg>
				</button>
				<span class="nav-value">{$vitBlockIdx + 1} / {vitConfig.numLayers}</span>
				<button
					class="nav-btn"
					disabled={$vitBlockIdx === vitConfig.numLayers - 1}
					on:click={() => changeLayer(1)}
				>
					<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
						<path d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z"/>
					</svg>
				</button>
			</div>
		</div>

		<!-- Head Selector -->
		<div class="nav-group">
			<span class="nav-label">Head</span>
			<div class="nav-buttons">
				<button
					class="nav-btn"
					disabled={$vitAttentionHeadIdx === 0}
					on:click={() => changeHead(-1)}
				>
					<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
						<path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
					</svg>
				</button>
				<span class="nav-value">{$vitAttentionHeadIdx + 1} / {vitConfig.numHeads}</span>
				<button
					class="nav-btn"
					disabled={$vitAttentionHeadIdx === vitConfig.numHeads - 1}
					on:click={() => changeHead(1)}
				>
					<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
						<path d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z"/>
					</svg>
				</button>
			</div>
		</div>
	</div>

	<!-- Source Selector -->
	<div class="source-selector">
		<span class="source-label">Attention from:</span>
		<div class="source-buttons">
			{#each quickSources as source}
				<button
					class="source-btn"
					class:active={$selectedPatchIdx === source.idx}
					on:click={() => selectSource(source.idx)}
				>
					{source.label}
				</button>
			{/each}
		</div>
	</div>

	<!-- Visualizations -->
	<div class="viz-container">
		<!-- Attention Matrix -->
		<div class="viz-section">
			<div class="viz-title">Attention Matrix</div>
			<div class="matrix-wrapper">
				<canvas
					bind:this={matrixCanvas}
					width={MATRIX_SIZE}
					height={MATRIX_SIZE}
					class="attention-matrix"
				/>
				<div class="axis-label x-label">Keys (tokens)</div>
				<div class="axis-label y-label">Queries</div>
			</div>
			<div class="viz-info">
				Size: {vitConfig.numTokens} × {vitConfig.numTokens}
			</div>
		</div>

		<!-- Spatial Heatmap -->
		<div class="viz-section">
			<div class="viz-title">
				Spatial Attention
				<span class="viz-subtitle">
					({$selectedPatchIdx === -1 ? '[CLS]' : `P${$selectedPatchIdx}`} → patches)
				</span>
			</div>
			<canvas
				bind:this={heatmapCanvas}
				width={HEATMAP_SIZE}
				height={HEATMAP_SIZE}
				class="spatial-heatmap"
			/>
			<div class="legend">
				<span>Low</span>
				<div class="gradient-bar"></div>
				<span>High</span>
			</div>
		</div>
	</div>

	<!-- Statistics -->
	{#if attentionStats}
		<div class="stats-panel">
			<div class="stat">
				<span class="stat-label">→ [CLS]:</span>
				<span class="stat-value">{(attentionStats.clsAttention * 100).toFixed(1)}%</span>
			</div>
			<div class="stat">
				<span class="stat-label">Max patch:</span>
				<span class="stat-value">{(attentionStats.maxPatchAttention * 100).toFixed(1)}%</span>
			</div>
			<div class="stat">
				<span class="stat-label">Entropy:</span>
				<span class="stat-value">{attentionStats.entropy.toFixed(2)} bits</span>
			</div>
		</div>
	{/if}
</div>

<style lang="scss">
	.vit-attention-viz {
		display: flex;
		flex-direction: column;
		gap: 0.625rem;
	}

	.section-header {
		.title {
			font-size: 0.95rem;
			font-weight: 600;
			color: theme('colors.gray.700');
			margin: 0;
		}
	}

	.nav-controls {
		display: flex;
		gap: 1rem;
		justify-content: center;

		.nav-group {
			display: flex;
			flex-direction: column;
			align-items: center;
			gap: 0.125rem;

			.nav-label {
				font-size: 0.6rem;
				color: theme('colors.gray.400');
				text-transform: uppercase;
				letter-spacing: 0.05em;
			}

			.nav-buttons {
				display: flex;
				align-items: center;
				gap: 0.25rem;

				.nav-btn {
					width: 22px;
					height: 22px;
					display: flex;
					align-items: center;
					justify-content: center;
					border: 1px solid theme('colors.gray.200');
					border-radius: 0.25rem;
					background: white;
					color: theme('colors.gray.600');
					cursor: pointer;
					transition: all 0.15s;
					padding: 0;

					&:hover:not(:disabled) {
						background: theme('colors.gray.50');
						border-color: theme('colors.gray.300');
					}

					&:disabled {
						opacity: 0.3;
						cursor: not-allowed;
					}
				}

				.nav-value {
					font-size: 0.7rem;
					font-family: monospace;
					min-width: 3rem;
					text-align: center;
					color: theme('colors.gray.700');
				}
			}
		}
	}

	.source-selector {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.25rem;

		.source-label {
			font-size: 0.6rem;
			color: theme('colors.gray.400');
		}

		.source-buttons {
			display: flex;
			gap: 0.25rem;

			.source-btn {
				padding: 0.125rem 0.375rem;
				font-size: 0.6rem;
				font-weight: 500;
				border: 1px solid theme('colors.gray.200');
				border-radius: 0.25rem;
				background: white;
				color: theme('colors.gray.600');
				cursor: pointer;
				transition: all 0.15s;

				&:hover {
					background: theme('colors.gray.50');
				}

				&.active {
					background: theme('colors.purple.100');
					border-color: theme('colors.purple.400');
					color: theme('colors.purple.700');
				}
			}
		}
	}

	.viz-container {
		display: flex;
		gap: 0.75rem;
		justify-content: center;
		flex-wrap: wrap;
	}

	.viz-section {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.25rem;

		.viz-title {
			font-size: 0.65rem;
			font-weight: 500;
			color: theme('colors.gray.600');

			.viz-subtitle {
				font-weight: 400;
				color: theme('colors.gray.400');
			}
		}

		.viz-info {
			font-size: 0.55rem;
			color: theme('colors.gray.400');
		}
	}

	.matrix-wrapper {
		position: relative;

		.axis-label {
			position: absolute;
			font-size: 0.5rem;
			color: theme('colors.gray.400');

			&.x-label {
				bottom: -10px;
				left: 50%;
				transform: translateX(-50%);
			}

			&.y-label {
				top: 50%;
				left: -10px;
				transform: translateY(-50%) rotate(-90deg);
			}
		}
	}

	.attention-matrix, .spatial-heatmap {
		border: 1px solid theme('colors.gray.200');
		border-radius: 0.25rem;
	}

	.legend {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		font-size: 0.5rem;
		color: theme('colors.gray.500');
		margin-top: 0.125rem;

		.gradient-bar {
			width: 50px;
			height: 6px;
			background: linear-gradient(to right, #fff5f5, #feb2b2, #fc8181, #f56565, #e53e3e);
			border-radius: 2px;
		}
	}

	.stats-panel {
		display: flex;
		justify-content: center;
		gap: 0.75rem;
		padding: 0.375rem;
		background: theme('colors.purple.50');
		border-radius: 0.25rem;

		.stat {
			display: flex;
			gap: 0.25rem;
			font-size: 0.6rem;

			.stat-label {
				color: theme('colors.gray.500');
			}

			.stat-value {
				color: theme('colors.purple.700');
				font-weight: 600;
				font-family: monospace;
			}
		}
	}
</style>

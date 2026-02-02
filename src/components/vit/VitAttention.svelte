<script lang="ts">
	import { onMount } from 'svelte';
	import {
		vitConfig,
		vitModelData,
		vitBlockIdx,
		vitAttentionHeadIdx,
		highlightedPatch,
		hoveredPatchForAttention,
		vitExpandedBlock,
		patchGridSize
	} from '~/store/vit';
	import classNames from 'classnames';
	import tailwindConfig from '../../../tailwind.config';
	import resolveConfig from 'tailwindcss/resolveConfig';
	import * as d3 from 'd3';

	const { theme } = resolveConfig(tailwindConfig);

	export let className: string = '';

	const gridSize = patchGridSize;
	const matrixDisplaySize = 180; // Size of the attention matrix display
	const heatmapSize = 140; // Size of the spatial heatmap

	$: isExpanded = $vitExpandedBlock.id === 'attention';

	// Get current attention data
	$: currentLayer = $vitModelData?.layerOutputs[$vitBlockIdx];
	$: currentHead = currentLayer?.attentionHeads[$vitAttentionHeadIdx];
	$: attentionMatrix = currentHead?.attentionMatrix || [];

	// Selected source for attention visualization (CLS or patch)
	let selectedSource: 'cls' | number = 'cls';

	// Get attention row for selected source
	$: attentionRow = selectedSource === 'cls'
		? attentionMatrix[0] || []
		: attentionMatrix[(selectedSource as number) + 1] || [];

	// Color scale for attention
	const colorScale = d3.scaleSequential(d3.interpolateReds).domain([0, 1]);

	function handleLayerChange(delta: number) {
		const newIdx = Math.max(0, Math.min(vitConfig.numLayers - 1, $vitBlockIdx + delta));
		vitBlockIdx.set(newIdx);
	}

	function handleHeadChange(delta: number) {
		const newIdx = Math.max(0, Math.min(vitConfig.numHeads - 1, $vitAttentionHeadIdx + delta));
		vitAttentionHeadIdx.set(newIdx);
	}

	function handleClick() {
		if (isExpanded) {
			vitExpandedBlock.set({ id: null });
		} else {
			vitExpandedBlock.set({ id: 'attention' });
		}
	}

	function handleSourceSelect(source: 'cls' | number) {
		selectedSource = source;
	}

	// When a patch is highlighted externally, update selected source
	$: if ($highlightedPatch.index !== null) {
		selectedSource = $highlightedPatch.index;
	}

	// Canvas for spatial heatmap
	let heatmapCanvas: HTMLCanvasElement;

	function drawSpatialHeatmap() {
		if (!heatmapCanvas || attentionRow.length === 0) return;

		const ctx = heatmapCanvas.getContext('2d');
		if (!ctx) return;

		ctx.clearRect(0, 0, heatmapSize, heatmapSize);

		const cellSize = heatmapSize / gridSize;

		// Draw attention to patches (skip index 0 which is CLS-to-CLS)
		for (let i = 1; i < attentionRow.length && i <= vitConfig.numPatches; i++) {
			const patchIdx = i - 1;
			const row = Math.floor(patchIdx / gridSize);
			const col = patchIdx % gridSize;
			const attention = attentionRow[i];

			ctx.fillStyle = colorScale(attention * 1.5); // Amplify for visibility
			ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
		}

		// Draw grid lines
		ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
		ctx.lineWidth = 0.5;
		for (let i = 0; i <= gridSize; i++) {
			ctx.beginPath();
			ctx.moveTo(i * cellSize, 0);
			ctx.lineTo(i * cellSize, heatmapSize);
			ctx.stroke();
			ctx.beginPath();
			ctx.moveTo(0, i * cellSize);
			ctx.lineTo(heatmapSize, i * cellSize);
			ctx.stroke();
		}
	}

	$: if (attentionRow && heatmapCanvas) {
		drawSpatialHeatmap();
	}

	// Canvas for attention matrix
	let matrixCanvas: HTMLCanvasElement;
	const matrixVisibleSize = 30; // Show 30x30 of the matrix

	function drawAttentionMatrix() {
		if (!matrixCanvas || attentionMatrix.length === 0) return;

		const ctx = matrixCanvas.getContext('2d');
		if (!ctx) return;

		ctx.clearRect(0, 0, matrixDisplaySize, matrixDisplaySize);

		const displaySize = Math.min(attentionMatrix.length, matrixVisibleSize);
		const cellSize = matrixDisplaySize / displaySize;

		for (let i = 0; i < displaySize; i++) {
			for (let j = 0; j < displaySize; j++) {
				const value = attentionMatrix[i]?.[j] || 0;
				ctx.fillStyle = colorScale(value * 2);
				ctx.fillRect(j * cellSize, i * cellSize, cellSize, cellSize);
			}
		}

		// Highlight selected row
		const highlightRow = selectedSource === 'cls' ? 0 : (selectedSource as number) + 1;
		if (highlightRow < displaySize) {
			ctx.strokeStyle = theme.colors.purple[500];
			ctx.lineWidth = 2;
			ctx.strokeRect(0, highlightRow * cellSize, matrixDisplaySize, cellSize);
		}

		// Draw axes labels
		ctx.fillStyle = theme.colors.gray[600];
		ctx.font = '8px sans-serif';
		ctx.fillText('CLS', 2, 8);
		ctx.save();
		ctx.rotate(-Math.PI / 2);
		ctx.fillText('CLS', -10, 8);
		ctx.restore();
	}

	$: if (attentionMatrix && matrixCanvas) {
		drawAttentionMatrix();
	}
</script>

<div
	class={classNames('vit-attention step', className, { expanded: isExpanded })}
	role="button"
	tabindex="0"
	on:click={handleClick}
	on:keydown={(e) => e.key === 'Enter' && handleClick()}
>
	<div class="title expandable">
		<div class="title-text">Multi-Head Self-Attention</div>
	</div>

	<div class="content">
		<!-- Layer/Head Navigation -->
		<div class="navigation">
			<div class="nav-group">
				<span class="nav-label">Layer</span>
				<div class="nav-controls">
					<button on:click|stopPropagation={() => handleLayerChange(-1)} disabled={$vitBlockIdx === 0}>
						<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
							<path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
						</svg>
					</button>
					<span class="nav-value">{$vitBlockIdx + 1} / {vitConfig.numLayers}</span>
					<button on:click|stopPropagation={() => handleLayerChange(1)} disabled={$vitBlockIdx === vitConfig.numLayers - 1}>
						<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
							<path d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z" />
						</svg>
					</button>
				</div>
			</div>
			<div class="nav-group">
				<span class="nav-label">Head</span>
				<div class="nav-controls">
					<button on:click|stopPropagation={() => handleHeadChange(-1)} disabled={$vitAttentionHeadIdx === 0}>
						<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
							<path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
						</svg>
					</button>
					<span class="nav-value">{$vitAttentionHeadIdx + 1} / {vitConfig.numHeads}</span>
					<button on:click|stopPropagation={() => handleHeadChange(1)} disabled={$vitAttentionHeadIdx === vitConfig.numHeads - 1}>
						<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
							<path d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z" />
						</svg>
					</button>
				</div>
			</div>
		</div>

		<!-- Source Selector -->
		<div class="source-selector">
			<span class="source-label">Attention from:</span>
			<div class="source-options">
				<button
					class="source-btn"
					class:selected={selectedSource === 'cls'}
					on:click|stopPropagation={() => handleSourceSelect('cls')}
				>
					[CLS]
				</button>
				{#each [0, 48, 97, 145, 195] as patchIdx}
					<button
						class="source-btn"
						class:selected={selectedSource === patchIdx}
						on:click|stopPropagation={() => handleSourceSelect(patchIdx)}
					>
						P{patchIdx}
					</button>
				{/each}
			</div>
		</div>

		<div class="attention-visuals">
			<!-- Attention Matrix -->
			<div class="matrix-section">
				<div class="section-title">Attention Matrix</div>
				<div class="matrix-container">
					<canvas
						bind:this={matrixCanvas}
						width={matrixDisplaySize}
						height={matrixDisplaySize}
					/>
					<div class="axis-label x-axis">Keys (patches + CLS)</div>
					<div class="axis-label y-axis">Queries</div>
				</div>
				<div class="matrix-info">
					<span>Size: {vitConfig.numPatches + 1} x {vitConfig.numPatches + 1}</span>
				</div>
			</div>

			<!-- Spatial Heatmap -->
			<div class="heatmap-section">
				<div class="section-title">
					Spatial Attention
					<span class="subtitle">
						({selectedSource === 'cls' ? '[CLS]' : `Patch ${selectedSource}`} → patches)
					</span>
				</div>
				<div class="heatmap-container">
					<canvas
						bind:this={heatmapCanvas}
						width={heatmapSize}
						height={heatmapSize}
					/>
				</div>
				<div class="heatmap-legend">
					<span>Low</span>
					<div class="gradient-bar"></div>
					<span>High</span>
				</div>
			</div>
		</div>

		<!-- CLS Attention Value -->
		<div class="cls-attention-info">
			<span class="info-label">Attention to [CLS]:</span>
			<span class="info-value">{(attentionRow[0] * 100).toFixed(1)}%</span>
		</div>
	</div>
</div>

<style lang="scss">
	.vit-attention {
		cursor: pointer;

		&.expanded {
			.content {
				z-index: 100;
			}
		}
	}

	.title {
		display: flex;
		flex-direction: column;
		justify-content: flex-end;
		padding-bottom: 1.5rem;
		color: theme('colors.gray.400');

		.title-text {
			font-size: 0.9rem;
		}
	}

	.content {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		padding: 0.5rem;
	}

	.navigation {
		display: flex;
		gap: 1rem;
		justify-content: center;

		.nav-group {
			display: flex;
			flex-direction: column;
			align-items: center;
			gap: 0.25rem;

			.nav-label {
				font-size: 0.65rem;
				color: theme('colors.gray.400');
				text-transform: uppercase;
			}

			.nav-controls {
				display: flex;
				align-items: center;
				gap: 0.25rem;

				button {
					padding: 0.125rem;
					border: 1px solid theme('colors.gray.300');
					border-radius: 0.25rem;
					background: white;
					cursor: pointer;
					color: theme('colors.gray.600');
					transition: all 0.15s;

					&:hover:not(:disabled) {
						background: theme('colors.gray.100');
						border-color: theme('colors.gray.400');
					}

					&:disabled {
						opacity: 0.3;
						cursor: not-allowed;
					}
				}

				.nav-value {
					font-size: 0.75rem;
					font-family: monospace;
					min-width: 3rem;
					text-align: center;
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
			font-size: 0.65rem;
			color: theme('colors.gray.400');
		}

		.source-options {
			display: flex;
			gap: 0.25rem;
			flex-wrap: wrap;
			justify-content: center;

			.source-btn {
				padding: 0.125rem 0.375rem;
				font-size: 0.65rem;
				border: 1px solid theme('colors.gray.300');
				border-radius: 0.25rem;
				background: white;
				cursor: pointer;
				transition: all 0.15s;

				&:hover {
					background: theme('colors.gray.100');
				}

				&.selected {
					background: theme('colors.purple.100');
					border-color: theme('colors.purple.400');
					color: theme('colors.purple.700');
				}
			}
		}
	}

	.attention-visuals {
		display: flex;
		gap: 1rem;
		justify-content: center;
		flex-wrap: wrap;
	}

	.matrix-section, .heatmap-section {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.25rem;

		.section-title {
			font-size: 0.7rem;
			color: theme('colors.gray.500');
			font-weight: 500;

			.subtitle {
				font-weight: 400;
				color: theme('colors.gray.400');
			}
		}
	}

	.matrix-container {
		position: relative;

		canvas {
			border: 1px solid theme('colors.gray.300');
			border-radius: 0.25rem;
		}

		.axis-label {
			position: absolute;
			font-size: 0.55rem;
			color: theme('colors.gray.400');

			&.x-axis {
				bottom: -12px;
				left: 50%;
				transform: translateX(-50%);
			}

			&.y-axis {
				top: 50%;
				left: -8px;
				transform: translateY(-50%) rotate(-90deg);
				transform-origin: center;
			}
		}
	}

	.matrix-info {
		font-size: 0.6rem;
		color: theme('colors.gray.400');
	}

	.heatmap-container {
		canvas {
			border: 1px solid theme('colors.gray.300');
			border-radius: 0.25rem;
		}
	}

	.heatmap-legend {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		font-size: 0.6rem;
		color: theme('colors.gray.500');

		.gradient-bar {
			width: 60px;
			height: 8px;
			background: linear-gradient(to right, #fff5f5, #feb2b2, #fc8181, #f56565, #e53e3e, #c53030);
			border-radius: 2px;
			border: 1px solid theme('colors.gray.200');
		}
	}

	.cls-attention-info {
		display: flex;
		justify-content: center;
		gap: 0.5rem;
		padding: 0.25rem;
		background: theme('colors.purple.50');
		border-radius: 0.25rem;
		font-size: 0.7rem;

		.info-label {
			color: theme('colors.gray.500');
		}

		.info-value {
			color: theme('colors.purple.600');
			font-weight: 600;
			font-family: monospace;
		}
	}
</style>

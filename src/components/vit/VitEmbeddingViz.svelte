<script lang="ts">
	/**
	 * VitEmbeddingViz - Patch embedding and position encoding visualization
	 *
	 * Features:
	 * - CLS token display
	 * - Patch embedding vectors (scrollable list)
	 * - Position encoding visualization
	 * - Combined embedding view
	 */

	import { onMount } from 'svelte';
	import {
		vitConfig,
		vitModelData,
		selectedPatchIdx,
		hoveredPatchIdx,
		vitColors
	} from '~/store/vit';
	import * as d3 from 'd3';

	// Display constants
	const VECTOR_HEIGHT = 24;
	const VECTOR_WIDTH = 8;
	const MAX_VISIBLE_PATCHES = 8;

	// Canvas for vector visualization
	let vectorCanvases: Map<string, HTMLCanvasElement> = new Map();

	// Draw a single embedding vector on canvas
	function drawVector(canvas: HTMLCanvasElement, data: Float32Array, colorScale: (t: number) => string) {
		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		const height = canvas.height;
		const width = canvas.width;

		// Normalize data
		let min = Infinity, max = -Infinity;
		for (let i = 0; i < data.length; i++) {
			min = Math.min(min, data[i]);
			max = Math.max(max, data[i]);
		}
		const range = max - min || 1;

		// Draw vertical gradient
		const step = height / data.length;
		for (let i = 0; i < Math.min(data.length, height); i++) {
			const normalized = (data[i] - min) / range;
			ctx.fillStyle = colorScale(normalized);
			ctx.fillRect(0, i * step, width, step + 1);
		}
	}

	// Reactive: redraw when data changes
	$: if ($vitModelData) {
		setTimeout(redrawVectors, 0);
	}

	function redrawVectors() {
		vectorCanvases.forEach((canvas, key) => {
			if (!$vitModelData) return;

			const [type, idxStr] = key.split('-');
			const idx = parseInt(idxStr);

			let data: Float32Array;
			let colorScale: (t: number) => string;

			if (type === 'cls') {
				// CLS token embedding
				data = new Float32Array(vitConfig.hiddenSize);
				for (let i = 0; i < vitConfig.hiddenSize; i++) {
					data[i] = $vitModelData.inputEmbeddings[i];
				}
				colorScale = d3.interpolatePurples;
			} else if (type === 'patch') {
				// Patch embedding
				const offset = (idx + 1) * vitConfig.hiddenSize;
				data = new Float32Array(vitConfig.hiddenSize);
				for (let i = 0; i < vitConfig.hiddenSize; i++) {
					data[i] = $vitModelData.inputEmbeddings[offset + i];
				}
				colorScale = d3.interpolateBlues;
			} else if (type === 'pos') {
				// Position embedding
				const offset = idx * vitConfig.hiddenSize;
				data = new Float32Array(vitConfig.hiddenSize);
				for (let i = 0; i < vitConfig.hiddenSize; i++) {
					data[i] = $vitModelData.positionEmbeddings[offset + i];
				}
				colorScale = d3.interpolateOranges;
			} else {
				return;
			}

			drawVector(canvas, data, colorScale);
		});
	}

	function registerCanvas(node: HTMLCanvasElement, key: string) {
		vectorCanvases.set(key, node);
		return {
			destroy() {
				vectorCanvases.delete(key);
			}
		};
	}

	// Patch display range
	$: displayPatches = Array.from({ length: MAX_VISIBLE_PATCHES }, (_, i) => i);

	// Check if patch is selected/hovered
	$: isSelected = (idx: number) => $selectedPatchIdx === idx;
	$: isHovered = (idx: number) => $hoveredPatchIdx === idx;
</script>

<div class="vit-embedding-viz">
	<!-- Header -->
	<div class="section-header">
		<h3 class="title">Patch + Position Embedding</h3>
	</div>

	<div class="content">
		<!-- CLS Token Section -->
		<div class="embedding-section cls-section">
			<div class="section-label">[CLS] Token</div>
			<div class="token-row cls-row">
				<span class="token-label cls-label">[CLS]</span>
				<div class="vector-group">
					<canvas
						use:registerCanvas={'cls-0'}
						width={VECTOR_WIDTH}
						height={VECTOR_HEIGHT}
						class="vector-canvas cls"
					/>
					<span class="operator">+</span>
					<canvas
						use:registerCanvas={'pos-0'}
						width={VECTOR_WIDTH}
						height={VECTOR_HEIGHT}
						class="vector-canvas pos"
					/>
					<span class="operator">=</span>
					<canvas
						use:registerCanvas={'cls-0'}
						width={VECTOR_WIDTH}
						height={VECTOR_HEIGHT}
						class="vector-canvas combined"
					/>
				</div>
			</div>
		</div>

		<!-- Patch Embeddings Section -->
		<div class="embedding-section patch-section">
			<div class="section-label">Patch Embeddings</div>
			<div class="patches-list">
				{#each displayPatches as patchIdx}
					<div
						class="token-row"
						class:selected={isSelected(patchIdx)}
						class:hovered={isHovered(patchIdx)}
					>
						<span
							class="token-label"
							class:selected={isSelected(patchIdx)}
						>
							P<sub>{patchIdx}</sub>
						</span>
						<div class="vector-group">
							<canvas
								use:registerCanvas={`patch-${patchIdx}`}
								width={VECTOR_WIDTH}
								height={VECTOR_HEIGHT}
								class="vector-canvas patch"
							/>
							<span class="operator">+</span>
							<canvas
								use:registerCanvas={`pos-${patchIdx + 1}`}
								width={VECTOR_WIDTH}
								height={VECTOR_HEIGHT}
								class="vector-canvas pos"
							/>
						</div>
					</div>
				{/each}
				<div class="ellipsis">
					... {vitConfig.numPatches - MAX_VISIBLE_PATCHES} more patches
				</div>
			</div>
		</div>

		<!-- Legend -->
		<div class="legend">
			<div class="legend-item">
				<div class="legend-color patch"></div>
				<span>Patch Embed</span>
			</div>
			<div class="legend-item">
				<div class="legend-color pos"></div>
				<span>Position</span>
			</div>
			<div class="legend-item">
				<div class="legend-color cls"></div>
				<span>[CLS]</span>
			</div>
		</div>

		<!-- Dimension Info -->
		<div class="dim-info">
			Dimension: {vitConfig.hiddenSize}
		</div>
	</div>
</div>

<style lang="scss">
	.vit-embedding-viz {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.section-header {
		.title {
			font-size: 0.95rem;
			font-weight: 600;
			color: theme('colors.gray.700');
			margin: 0;
		}
	}

	.content {
		display: flex;
		flex-direction: column;
		gap: 0.625rem;
	}

	.embedding-section {
		.section-label {
			font-size: 0.6rem;
			color: theme('colors.gray.400');
			text-transform: uppercase;
			letter-spacing: 0.05em;
			margin-bottom: 0.25rem;
		}
	}

	.cls-section {
		padding-bottom: 0.5rem;
		border-bottom: 1px dashed theme('colors.gray.200');
	}

	.token-row {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.125rem 0.25rem;
		border-radius: 0.25rem;
		transition: background 0.15s;

		&.selected {
			background: rgba(147, 51, 234, 0.1);
		}

		&.hovered:not(.selected) {
			background: rgba(59, 130, 246, 0.08);
		}

		&.cls-row {
			background: theme('colors.purple.50');
			border-radius: 0.25rem;
			padding: 0.25rem 0.375rem;
		}
	}

	.token-label {
		font-size: 0.65rem;
		font-family: monospace;
		color: theme('colors.gray.600');
		min-width: 2rem;

		&.cls-label {
			color: theme('colors.purple.600');
			font-weight: 600;
		}

		&.selected {
			color: theme('colors.purple.600');
			font-weight: 600;
		}

		sub {
			font-size: 0.5rem;
		}
	}

	.vector-group {
		display: flex;
		align-items: center;
		gap: 0.25rem;
	}

	.operator {
		font-size: 0.7rem;
		color: theme('colors.gray.400');
	}

	.vector-canvas {
		border-radius: 2px;
		border: 1px solid theme('colors.gray.200');

		&.patch {
			background: theme('colors.blue.50');
		}

		&.pos {
			background: theme('colors.orange.50');
		}

		&.cls, &.combined {
			background: theme('colors.purple.50');
		}
	}

	.patches-list {
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
		max-height: 200px;
		overflow-y: auto;
	}

	.ellipsis {
		font-size: 0.6rem;
		color: theme('colors.gray.400');
		font-style: italic;
		text-align: center;
		padding: 0.25rem;
	}

	.legend {
		display: flex;
		gap: 0.75rem;
		justify-content: center;
		padding: 0.375rem;
		background: theme('colors.gray.50');
		border-radius: 0.25rem;

		.legend-item {
			display: flex;
			align-items: center;
			gap: 0.25rem;
			font-size: 0.55rem;
			color: theme('colors.gray.600');
		}

		.legend-color {
			width: 10px;
			height: 10px;
			border-radius: 2px;

			&.patch {
				background: theme('colors.blue.400');
			}

			&.pos {
				background: theme('colors.orange.400');
			}

			&.cls {
				background: theme('colors.purple.400');
			}
		}
	}

	.dim-info {
		font-size: 0.55rem;
		color: theme('colors.gray.400');
		text-align: center;
	}
</style>

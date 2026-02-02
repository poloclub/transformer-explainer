<script lang="ts">
	import { onMount } from 'svelte';
	import {
		vitConfig,
		vitCurrentImage,
		highlightedPatch,
		hoveredPatchForAttention,
		showAttentionOverlay,
		vitModelData,
		vitBlockIdx,
		vitAttentionHeadIdx,
		patchGridSize,
		selectedImageIdx,
		sampleImages
	} from '~/store/vit';
	import { getClsAttention } from '~/constants/vitExamples';
	import classNames from 'classnames';
	import { base } from '$app/paths';
	import tailwindConfig from '../../../tailwind.config';
	import resolveConfig from 'tailwindcss/resolveConfig';

	const { theme } = resolveConfig(tailwindConfig);

	export let className: string = '';
	export let showPatchGrid: boolean = true;
	export let interactive: boolean = true;

	let imageEl: HTMLImageElement;
	let containerEl: HTMLDivElement;
	let canvasEl: HTMLCanvasElement;

	const gridSize = patchGridSize; // 14x14 patches
	const displaySize = 224; // Display size in pixels

	$: patchDisplaySize = displaySize / gridSize;

	// Get attention overlay for current layer/head
	$: attentionOverlay = $showAttentionOverlay && $vitModelData
		? getClsAttention($vitModelData, $vitBlockIdx, $vitAttentionHeadIdx)
		: null;

	function handlePatchHover(row: number, col: number) {
		if (!interactive) return;
		const index = row * gridSize + col;
		highlightedPatch.set({ index, row, col, fix: false });
		hoveredPatchForAttention.set(index);
	}

	function handlePatchLeave() {
		if (!interactive) return;
		if (!$highlightedPatch.fix) {
			highlightedPatch.set({ index: null, row: null, col: null, fix: false });
			hoveredPatchForAttention.set(null);
		}
	}

	function handlePatchClick(row: number, col: number) {
		if (!interactive) return;
		const index = row * gridSize + col;
		if ($highlightedPatch.fix && $highlightedPatch.index === index) {
			highlightedPatch.set({ index: null, row: null, col: null, fix: false });
			hoveredPatchForAttention.set(null);
		} else {
			highlightedPatch.set({ index, row, col, fix: true });
			hoveredPatchForAttention.set(index);
		}
	}

	function selectImage(idx: number) {
		selectedImageIdx.set(idx);
	}

	// Draw attention heatmap overlay
	function drawAttentionOverlay() {
		if (!canvasEl || !attentionOverlay) return;

		const ctx = canvasEl.getContext('2d');
		if (!ctx) return;

		ctx.clearRect(0, 0, displaySize, displaySize);

		// Skip index 0 (CLS token attention to itself)
		for (let i = 1; i < attentionOverlay.length; i++) {
			const patchIdx = i - 1;
			const row = Math.floor(patchIdx / gridSize);
			const col = patchIdx % gridSize;
			const attention = attentionOverlay[i];

			// Color based on attention value
			const alpha = Math.min(attention * 2, 0.7);
			ctx.fillStyle = `rgba(239, 68, 68, ${alpha})`; // Red overlay
			ctx.fillRect(
				col * patchDisplaySize,
				row * patchDisplaySize,
				patchDisplaySize,
				patchDisplaySize
			);
		}
	}

	$: if (attentionOverlay && canvasEl) {
		drawAttentionOverlay();
	}

	$: currentImageSrc = sampleImages[$selectedImageIdx]?.src;
</script>

<div class={classNames('vit-image-patchify', className)} bind:this={containerEl}>
	<div class="title">
		<span class="title-text">Input Image</span>
		<span class="subtitle">224 x 224 pixels</span>
	</div>

	<div class="content">
		<!-- Image selector -->
		<div class="image-selector">
			{#each sampleImages as image, idx}
				<button
					class="image-option"
					class:selected={$selectedImageIdx === idx}
					on:click={() => selectImage(idx)}
				>
					<img src={`${base}${image.src}`} alt={image.name} />
					<span>{image.name}</span>
				</button>
			{/each}
		</div>

		<!-- Main image with patch grid overlay -->
		<div class="image-container" style="width: {displaySize}px; height: {displaySize}px;">
			<img
				bind:this={imageEl}
				src={`${base}${currentImageSrc}`}
				alt="Input"
				class="input-image"
				style="width: {displaySize}px; height: {displaySize}px;"
			/>

			<!-- Attention overlay canvas -->
			{#if $showAttentionOverlay}
				<canvas
					bind:this={canvasEl}
					class="attention-overlay"
					width={displaySize}
					height={displaySize}
				/>
			{/if}

			<!-- Patch grid overlay -->
			{#if showPatchGrid}
				<div class="patch-grid">
					{#each Array(gridSize) as _, row}
						{#each Array(gridSize) as _, col}
							{@const patchIndex = row * gridSize + col}
							<div
								class="patch-cell"
								class:highlighted={$highlightedPatch.index === patchIndex}
								class:fixed={$highlightedPatch.fix && $highlightedPatch.index === patchIndex}
								style="
									width: {patchDisplaySize}px;
									height: {patchDisplaySize}px;
									left: {col * patchDisplaySize}px;
									top: {row * patchDisplaySize}px;
								"
								on:mouseenter={() => handlePatchHover(row, col)}
								on:mouseleave={handlePatchLeave}
								on:click={() => handlePatchClick(row, col)}
								role="button"
								tabindex="0"
								on:keydown={(e) => e.key === 'Enter' && handlePatchClick(row, col)}
							>
								{#if $highlightedPatch.index === patchIndex}
									<span class="patch-label">{patchIndex}</span>
								{/if}
							</div>
						{/each}
					{/each}
				</div>
			{/if}
		</div>

		<!-- Info panel -->
		<div class="info-panel">
			<div class="info-item">
				<span class="info-label">Patches:</span>
				<span class="info-value">{gridSize} x {gridSize} = {vitConfig.numPatches}</span>
			</div>
			<div class="info-item">
				<span class="info-label">Patch size:</span>
				<span class="info-value">{vitConfig.patchSize} x {vitConfig.patchSize} pixels</span>
			</div>
			{#if $highlightedPatch.index !== null}
				<div class="info-item highlighted">
					<span class="info-label">Selected patch:</span>
					<span class="info-value">
						#{$highlightedPatch.index} (row {$highlightedPatch.row}, col {$highlightedPatch.col})
					</span>
				</div>
			{/if}
		</div>

		<!-- Attention overlay toggle -->
		<label class="overlay-toggle">
			<input type="checkbox" bind:checked={$showAttentionOverlay} />
			<span>Show CLS attention</span>
		</label>
	</div>
</div>

<style lang="scss">
	.vit-image-patchify {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.title {
		display: flex;
		flex-direction: column;
		color: theme('colors.gray.500');

		.title-text {
			font-size: 1rem;
			font-weight: 500;
		}

		.subtitle {
			font-size: 0.75rem;
			color: theme('colors.gray.400');
		}
	}

	.content {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		align-items: center;
	}

	.image-selector {
		display: flex;
		gap: 0.5rem;

		.image-option {
			display: flex;
			flex-direction: column;
			align-items: center;
			gap: 0.25rem;
			padding: 0.25rem;
			border: 2px solid transparent;
			border-radius: 0.5rem;
			background: theme('colors.gray.100');
			cursor: pointer;
			transition: all 0.2s;

			&:hover {
				border-color: theme('colors.blue.300');
			}

			&.selected {
				border-color: theme('colors.blue.500');
				background: theme('colors.blue.50');
			}

			img {
				width: 40px;
				height: 40px;
				border-radius: 0.25rem;
				object-fit: cover;
			}

			span {
				font-size: 0.65rem;
				color: theme('colors.gray.600');
			}
		}
	}

	.image-container {
		position: relative;
		border: 2px solid theme('colors.gray.300');
		border-radius: 0.5rem;
		overflow: hidden;
		box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);

		.input-image {
			display: block;
			object-fit: cover;
		}

		.attention-overlay {
			position: absolute;
			top: 0;
			left: 0;
			pointer-events: none;
			mix-blend-mode: multiply;
		}

		.patch-grid {
			position: absolute;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;

			.patch-cell {
				position: absolute;
				border: 1px solid rgba(255, 255, 255, 0.3);
				cursor: pointer;
				transition: all 0.15s;
				display: flex;
				align-items: center;
				justify-content: center;

				&:hover {
					background: rgba(59, 130, 246, 0.3);
					border-color: rgba(59, 130, 246, 0.8);
				}

				&.highlighted {
					background: rgba(59, 130, 246, 0.4);
					border-color: theme('colors.blue.500');
					border-width: 2px;
					z-index: 10;
				}

				&.fixed {
					background: rgba(147, 51, 234, 0.4);
					border-color: theme('colors.purple.500');
				}

				.patch-label {
					font-size: 0.6rem;
					font-weight: bold;
					color: white;
					text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
				}
			}
		}
	}

	.info-panel {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		padding: 0.5rem 1rem;
		background: theme('colors.gray.50');
		border-radius: 0.5rem;
		font-size: 0.75rem;

		.info-item {
			display: flex;
			gap: 0.5rem;

			&.highlighted {
				color: theme('colors.purple.600');
				font-weight: 500;
			}

			.info-label {
				color: theme('colors.gray.500');
			}

			.info-value {
				color: theme('colors.gray.700');
				font-family: monospace;
			}
		}
	}

	.overlay-toggle {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.75rem;
		color: theme('colors.gray.600');
		cursor: pointer;

		input {
			accent-color: theme('colors.red.500');
		}
	}
</style>

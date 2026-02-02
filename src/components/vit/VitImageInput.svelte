<script lang="ts">
	/**
	 * VitImageInput - Image display with patch grid overlay and attention heatmap
	 *
	 * Features:
	 * - Image upload or sample selection
	 * - 14x14 patch grid overlay (196 patches)
	 * - Interactive patch selection on hover/click
	 * - Spatial attention heatmap overlay
	 * - Smooth animations
	 */

	import { onMount, createEventDispatcher } from 'svelte';
	import { fade, scale } from 'svelte/transition';
	import {
		vitConfig,
		vitCurrentImage,
		vitModelData,
		selectedPatchIdx,
		hoveredPatchIdx,
		showAttentionOverlay,
		spatialAttention,
		vitColors,
		sampleImages,
		selectedImageIdx,
		vitIsLoading
	} from '~/store/vit';
	import { preprocessImage, runVitInference } from '~/utils/vitModel';
	import { base } from '$app/paths';

	const dispatch = createEventDispatcher();

	// Constants
	const DISPLAY_SIZE = 280;  // Display size in pixels
	const { gridSize, numPatches, patchSize } = vitConfig;
	const cellSize = DISPLAY_SIZE / gridSize;

	// Local state
	let canvasEl: HTMLCanvasElement;
	let imageCanvas: HTMLCanvasElement | null = null;
	let fileInput: HTMLInputElement;
	let isProcessing = false;

	// Reactive: draw attention overlay when data changes
	$: if (canvasEl && $spatialAttention && $showAttentionOverlay) {
		drawAttentionOverlay();
	} else if (canvasEl && !$showAttentionOverlay) {
		clearCanvas();
	}

	// Load initial image on mount
	onMount(async () => {
		await loadSampleImage($selectedImageIdx);
	});

	// Load sample image
	async function loadSampleImage(idx: number) {
		selectedImageIdx.set(idx);
		const sample = sampleImages[idx];
		if (!sample) return;

		isProcessing = true;
		vitIsLoading.set(true);

		try {
			const imageSrc = `${base}${sample.src}`;
			const { pixels, canvas } = await preprocessImage(imageSrc);

			vitCurrentImage.set({
				src: imageSrc,
				name: sample.name,
				pixels,
				canvas
			});

			imageCanvas = canvas;

			// Run inference
			const output = await runVitInference(imageSrc);
			vitModelData.set(output);

			dispatch('inference', output);
		} catch (error) {
			console.error('Failed to process image:', error);
		} finally {
			isProcessing = false;
			vitIsLoading.set(false);
		}
	}

	// Handle file upload
	async function handleFileUpload(event: Event) {
		const input = event.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;

		isProcessing = true;
		vitIsLoading.set(true);

		try {
			const url = URL.createObjectURL(file);
			const { pixels, canvas } = await preprocessImage(url);

			vitCurrentImage.set({
				src: url,
				name: file.name,
				pixels,
				canvas
			});

			imageCanvas = canvas;

			// Run inference
			const output = await runVitInference(url);
			vitModelData.set(output);

			dispatch('inference', output);

			URL.revokeObjectURL(url);
		} catch (error) {
			console.error('Failed to process uploaded image:', error);
		} finally {
			isProcessing = false;
			vitIsLoading.set(false);
		}
	}

	// Patch interaction handlers
	function handlePatchEnter(idx: number) {
		hoveredPatchIdx.set(idx);
	}

	function handlePatchLeave() {
		hoveredPatchIdx.set(null);
	}

	function handlePatchClick(idx: number) {
		selectedPatchIdx.set(idx);
		dispatch('patchSelect', idx);
	}

	// Get patch position
	function getPatchPosition(idx: number): { row: number; col: number; x: number; y: number } {
		const row = Math.floor(idx / gridSize);
		const col = idx % gridSize;
		return {
			row,
			col,
			x: col * cellSize,
			y: row * cellSize
		};
	}

	// Draw attention heatmap overlay
	function drawAttentionOverlay() {
		if (!canvasEl || !$spatialAttention) return;

		const ctx = canvasEl.getContext('2d');
		if (!ctx) return;

		ctx.clearRect(0, 0, DISPLAY_SIZE, DISPLAY_SIZE);

		const { data, gridSize: gs } = $spatialAttention;

		// Find max attention for normalization
		let maxAttn = 0;
		for (let i = 0; i < data.length; i++) {
			maxAttn = Math.max(maxAttn, data[i]);
		}

		// Draw attention heatmap
		for (let i = 0; i < numPatches; i++) {
			const { x, y } = getPatchPosition(i);
			const attention = data[i] / (maxAttn || 1);

			// Red heatmap with alpha based on attention
			const alpha = Math.pow(attention, 0.7) * 0.7; // Non-linear scaling
			ctx.fillStyle = `rgba(239, 68, 68, ${alpha})`;
			ctx.fillRect(x, y, cellSize, cellSize);
		}
	}

	function clearCanvas() {
		if (!canvasEl) return;
		const ctx = canvasEl.getContext('2d');
		if (ctx) ctx.clearRect(0, 0, DISPLAY_SIZE, DISPLAY_SIZE);
	}

	// Check if patch is selected or hovered
	$: isSelected = (idx: number) => $selectedPatchIdx === idx;
	$: isHovered = (idx: number) => $hoveredPatchIdx === idx;
</script>

<div class="vit-image-input">
	<!-- Header -->
	<div class="section-header">
		<h3 class="title">Input Image</h3>
		<span class="subtitle">{vitConfig.imageSize} × {vitConfig.imageSize} pixels</span>
	</div>

	<!-- Sample Image Selector -->
	<div class="sample-selector">
		{#each sampleImages as sample, idx}
			<button
				class="sample-btn"
				class:active={$selectedImageIdx === idx}
				disabled={isProcessing}
				on:click={() => loadSampleImage(idx)}
			>
				<span class="sample-name">{sample.name}</span>
			</button>
		{/each}
		<button
			class="upload-btn"
			disabled={isProcessing}
			on:click={() => fileInput.click()}
		>
			<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
				<path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
			</svg>
			Upload
		</button>
		<input
			bind:this={fileInput}
			type="file"
			accept="image/*"
			on:change={handleFileUpload}
			class="hidden"
		/>
	</div>

	<!-- Image Container -->
	<div
		class="image-container"
		style="width: {DISPLAY_SIZE}px; height: {DISPLAY_SIZE}px;"
	>
		<!-- Base Image -->
		{#if $vitCurrentImage?.canvas}
			<canvas
				class="base-image"
				width={DISPLAY_SIZE}
				height={DISPLAY_SIZE}
				style="background-image: url({$vitCurrentImage.canvas.toDataURL()})"
			/>
		{:else}
			<div class="placeholder">
				{#if isProcessing}
					<div class="loader"></div>
					<span>Processing...</span>
				{:else}
					<span>Select an image</span>
				{/if}
			</div>
		{/if}

		<!-- Attention Overlay -->
		{#if $showAttentionOverlay}
			<canvas
				bind:this={canvasEl}
				class="attention-overlay"
				width={DISPLAY_SIZE}
				height={DISPLAY_SIZE}
			/>
		{/if}

		<!-- Patch Grid Overlay -->
		<div class="patch-grid">
			{#each Array(numPatches) as _, idx}
				{@const pos = getPatchPosition(idx)}
				<button
					class="patch-cell"
					class:selected={isSelected(idx)}
					class:hovered={isHovered(idx)}
					style="
						left: {pos.x}px;
						top: {pos.y}px;
						width: {cellSize}px;
						height: {cellSize}px;
					"
					on:mouseenter={() => handlePatchEnter(idx)}
					on:mouseleave={handlePatchLeave}
					on:click={() => handlePatchClick(idx)}
				>
					{#if isSelected(idx) || isHovered(idx)}
						<span class="patch-label" transition:fade={{ duration: 100 }}>
							{idx}
						</span>
					{/if}
				</button>
			{/each}
		</div>

		<!-- Selected Patch Highlight -->
		{#if $selectedPatchIdx !== null && $selectedPatchIdx >= 0}
			{@const pos = getPatchPosition($selectedPatchIdx)}
			<div
				class="selection-highlight"
				style="
					left: {pos.x}px;
					top: {pos.y}px;
					width: {cellSize}px;
					height: {cellSize}px;
				"
				transition:scale={{ duration: 150 }}
			/>
		{/if}
	</div>

	<!-- Info Panel -->
	<div class="info-panel">
		<div class="info-row">
			<span class="label">Patches:</span>
			<span class="value">{gridSize} × {gridSize} = {numPatches}</span>
		</div>
		<div class="info-row">
			<span class="label">Patch size:</span>
			<span class="value">{patchSize} × {patchSize} pixels</span>
		</div>
		{#if $selectedPatchIdx !== null && $selectedPatchIdx >= 0}
			{@const pos = getPatchPosition($selectedPatchIdx)}
			<div class="info-row selected">
				<span class="label">Selected:</span>
				<span class="value">P{$selectedPatchIdx} (row {pos.row}, col {pos.col})</span>
			</div>
		{/if}
	</div>

	<!-- Controls -->
	<div class="controls">
		<label class="toggle">
			<input type="checkbox" bind:checked={$showAttentionOverlay} />
			<span>Show attention heatmap</span>
		</label>
	</div>
</div>

<style lang="scss">
	.vit-image-input {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.section-header {
		.title {
			font-size: 0.95rem;
			font-weight: 600;
			color: theme('colors.gray.700');
			margin: 0;
		}

		.subtitle {
			font-size: 0.7rem;
			color: theme('colors.gray.400');
		}
	}

	.sample-selector {
		display: flex;
		flex-wrap: wrap;
		gap: 0.375rem;

		.sample-btn, .upload-btn {
			padding: 0.25rem 0.5rem;
			font-size: 0.7rem;
			font-weight: 500;
			border: 1px solid theme('colors.gray.200');
			border-radius: 0.375rem;
			background: white;
			color: theme('colors.gray.600');
			cursor: pointer;
			transition: all 0.15s;

			&:hover:not(:disabled) {
				background: theme('colors.gray.50');
				border-color: theme('colors.gray.300');
			}

			&:disabled {
				opacity: 0.5;
				cursor: not-allowed;
			}

			&.active {
				background: theme('colors.blue.50');
				border-color: theme('colors.blue.400');
				color: theme('colors.blue.700');
			}
		}

		.upload-btn {
			display: flex;
			align-items: center;
			gap: 0.25rem;
		}
	}

	.hidden {
		display: none;
	}

	.image-container {
		position: relative;
		border-radius: 0.5rem;
		overflow: hidden;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
		background: theme('colors.gray.100');

		.base-image {
			position: absolute;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
			background-size: cover;
			background-position: center;
		}

		.placeholder {
			position: absolute;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			gap: 0.5rem;
			color: theme('colors.gray.400');
			font-size: 0.8rem;

			.loader {
				width: 24px;
				height: 24px;
				border: 2px solid theme('colors.gray.200');
				border-top-color: theme('colors.blue.500');
				border-radius: 50%;
				animation: spin 0.8s linear infinite;
			}
		}

		.attention-overlay {
			position: absolute;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
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
				border: 1px solid rgba(255, 255, 255, 0.2);
				background: transparent;
				cursor: pointer;
				transition: all 0.1s;
				padding: 0;
				display: flex;
				align-items: center;
				justify-content: center;

				&:hover {
					background: rgba(59, 130, 246, 0.2);
					border-color: rgba(59, 130, 246, 0.5);
				}

				&.selected {
					background: rgba(147, 51, 234, 0.25);
					border-color: theme('colors.purple.400');
					border-width: 2px;
					z-index: 10;
				}

				&.hovered:not(.selected) {
					background: rgba(59, 130, 246, 0.3);
					border-color: rgba(59, 130, 246, 0.7);
				}

				.patch-label {
					font-size: 0.55rem;
					font-weight: 600;
					color: white;
					text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
					pointer-events: none;
				}
			}
		}

		.selection-highlight {
			position: absolute;
			border: 2px solid theme('colors.purple.500');
			border-radius: 2px;
			pointer-events: none;
			box-shadow: 0 0 0 2px rgba(147, 51, 234, 0.3);
			z-index: 20;
		}
	}

	.info-panel {
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
		padding: 0.5rem;
		background: theme('colors.gray.50');
		border-radius: 0.375rem;
		font-size: 0.7rem;

		.info-row {
			display: flex;
			gap: 0.5rem;

			&.selected {
				color: theme('colors.purple.600');
				font-weight: 500;
			}

			.label {
				color: theme('colors.gray.500');
			}

			.value {
				color: theme('colors.gray.700');
				font-family: monospace;
				font-size: 0.65rem;
			}
		}
	}

	.controls {
		.toggle {
			display: flex;
			align-items: center;
			gap: 0.375rem;
			font-size: 0.7rem;
			color: theme('colors.gray.600');
			cursor: pointer;

			input {
				accent-color: theme('colors.red.500');
			}
		}
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}
</style>

<script lang="ts">
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import classNames from 'classnames';
	import {
		vitConfig,
		vitModelData,
		vitExpandedBlock,
		vitBlockIdx,
		vitAttentionHeadIdx,
		selectedImageIdx,
		vitIsLoading
	} from '~/store/vit';
	import { vitExampleDataMap } from '~/constants/vitExamples';
	import VitImagePatchify from '~/components/vit/VitImagePatchify.svelte';
	import VitPatchEmbedding from '~/components/vit/VitPatchEmbedding.svelte';
	import VitAttention from '~/components/vit/VitAttention.svelte';
	import VitMlp from '~/components/vit/VitMlp.svelte';
	import VitClassification from '~/components/vit/VitClassification.svelte';
	import VitSankey from '~/components/vit/VitSankey.svelte';
	import { base } from '$app/paths';

	let active = false;

	onMount(() => {
		// Load initial data
		vitModelData.set(vitExampleDataMap[$selectedImageIdx]);
		active = true;

		// Subscribe to image changes
		const unsubscribe = selectedImageIdx.subscribe((idx) => {
			vitModelData.set(vitExampleDataMap[idx]);
		});

		return unsubscribe;
	});

	function handleOutsideClick() {
		vitExpandedBlock.set({ id: null });
	}
</script>

<svelte:head>
	<title>ViT Explainer - Vision Transformer Visualization</title>
</svelte:head>

<div class="vit-page" class:active>
	<!-- Header -->
	<header class="vit-header">
		<div class="header-content">
			<div class="title-section">
				<a href="{base}/" class="back-link">
					<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
						<path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
					</svg>
				</a>
				<h1>Vision Transformer (ViT) Explainer</h1>
			</div>
			<p class="subtitle">
				Interactive visualization of "An Image is Worth 16x16 Words"
				<span class="citation">(Dosovitskiy et al., 2020)</span>
			</p>
		</div>
	</header>

	<!-- Main Visualization -->
	<main class="vit-main" on:click={handleOutsideClick} role="presentation">
		{#if !!$vitExpandedBlock.id}
			<div class="dim" transition:fade={{ duration: 100 }}></div>
		{/if}

		<!-- Sankey Flow Paths -->
		<VitSankey />

		<!-- Visualization Grid -->
		<div class="vit-grid">
			<!-- Step 1: Input Image & Patchify -->
			<section class="vit-step image-section">
				<VitImagePatchify className="step-content" />
			</section>

			<!-- Step 2: Patch Embedding -->
			<section class="vit-step embedding-section">
				<VitPatchEmbedding className="step-content" />
			</section>

			<!-- Step 3: Transformer Encoder (Attention) -->
			<section class="vit-step attention-section">
				<VitAttention className="step-content" />
			</section>

			<!-- Step 4: MLP -->
			<section class="vit-step mlp-section">
				<VitMlp className="step-content" />
			</section>

			<!-- Step 5: Classification Head -->
			<section class="vit-step classification-section">
				<VitClassification className="step-content" />
			</section>
		</div>

		<!-- Architecture Overview -->
		<div class="architecture-info">
			<div class="info-card">
				<h3>ViT Architecture</h3>
				<div class="arch-flow">
					<span class="flow-item">Image</span>
					<span class="flow-arrow">→</span>
					<span class="flow-item">{vitConfig.numPatches} Patches</span>
					<span class="flow-arrow">→</span>
					<span class="flow-item">[CLS] + Embeddings</span>
					<span class="flow-arrow">→</span>
					<span class="flow-item">{vitConfig.numLayers}× Transformer</span>
					<span class="flow-arrow">→</span>
					<span class="flow-item">Classification</span>
				</div>
				<div class="arch-stats">
					<div class="stat">
						<span class="stat-label">Patch Size</span>
						<span class="stat-value">{vitConfig.patchSize}×{vitConfig.patchSize}</span>
					</div>
					<div class="stat">
						<span class="stat-label">Hidden Dim</span>
						<span class="stat-value">{vitConfig.hiddenSize}</span>
					</div>
					<div class="stat">
						<span class="stat-label">Heads</span>
						<span class="stat-value">{vitConfig.numHeads}</span>
					</div>
					<div class="stat">
						<span class="stat-label">Layers</span>
						<span class="stat-value">{vitConfig.numLayers}</span>
					</div>
				</div>
			</div>
		</div>
	</main>

	<!-- Footer -->
	<footer class="vit-footer">
		<p>
			Based on the paper:
			<a href="https://arxiv.org/abs/2010.11929" target="_blank" rel="noopener">
				"An Image is Worth 16x16 Words: Transformers for Image Recognition at Scale"
			</a>
		</p>
	</footer>
</div>

<style lang="scss">
	.vit-page {
		min-height: 100vh;
		background: linear-gradient(180deg, #fafbfc 0%, #ffffff 100%);
		opacity: 0;
		transition: opacity 0.3s;

		&.active {
			opacity: 1;
		}
	}

	.vit-header {
		padding: 1.5rem 2rem;
		border-bottom: 1px solid theme('colors.gray.200');
		background: white;

		.header-content {
			max-width: 1400px;
			margin: 0 auto;
		}

		.title-section {
			display: flex;
			align-items: center;
			gap: 1rem;

			.back-link {
				display: flex;
				align-items: center;
				justify-content: center;
				width: 36px;
				height: 36px;
				border-radius: 50%;
				background: theme('colors.gray.100');
				color: theme('colors.gray.600');
				transition: all 0.2s;

				&:hover {
					background: theme('colors.gray.200');
					color: theme('colors.gray.800');
				}
			}

			h1 {
				font-size: 1.5rem;
				font-weight: 600;
				color: theme('colors.gray.800');
				margin: 0;
			}
		}

		.subtitle {
			margin: 0.5rem 0 0 3rem;
			font-size: 0.875rem;
			color: theme('colors.gray.500');

			.citation {
				font-style: italic;
			}
		}
	}

	.vit-main {
		position: relative;
		max-width: 1600px;
		margin: 0 auto;
		padding: 2rem;
		min-height: calc(100vh - 200px);
	}

	.dim {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: rgba(255, 255, 255, 0.8);
		z-index: 50;
	}

	.vit-grid {
		display: grid;
		grid-template-columns: 280px 200px 280px 180px 220px;
		gap: 1.5rem;
		align-items: start;

		@media (max-width: 1400px) {
			grid-template-columns: repeat(3, 1fr);
			grid-template-rows: auto auto;
		}

		@media (max-width: 900px) {
			grid-template-columns: 1fr;
		}
	}

	.vit-step {
		background: white;
		border-radius: 0.75rem;
		border: 1px solid theme('colors.gray.200');
		padding: 1rem;
		transition: all 0.2s;
		min-height: 400px;

		&:hover {
			border-color: theme('colors.gray.300');
			box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
		}

		:global(.step-content) {
			height: 100%;
		}
	}

	.architecture-info {
		margin-top: 2rem;
		display: flex;
		justify-content: center;

		.info-card {
			background: white;
			border: 1px solid theme('colors.gray.200');
			border-radius: 0.75rem;
			padding: 1.5rem 2rem;
			max-width: 800px;
			width: 100%;

			h3 {
				font-size: 1rem;
				font-weight: 600;
				color: theme('colors.gray.700');
				margin: 0 0 1rem 0;
				text-align: center;
			}

			.arch-flow {
				display: flex;
				align-items: center;
				justify-content: center;
				gap: 0.5rem;
				flex-wrap: wrap;
				margin-bottom: 1.5rem;

				.flow-item {
					padding: 0.25rem 0.75rem;
					background: theme('colors.blue.50');
					border: 1px solid theme('colors.blue.200');
					border-radius: 0.5rem;
					font-size: 0.75rem;
					color: theme('colors.blue.700');
				}

				.flow-arrow {
					color: theme('colors.gray.400');
				}
			}

			.arch-stats {
				display: flex;
				justify-content: center;
				gap: 2rem;
				flex-wrap: wrap;

				.stat {
					display: flex;
					flex-direction: column;
					align-items: center;

					.stat-label {
						font-size: 0.65rem;
						color: theme('colors.gray.400');
						text-transform: uppercase;
					}

					.stat-value {
						font-size: 1rem;
						font-weight: 600;
						color: theme('colors.gray.700');
						font-family: monospace;
					}
				}
			}
		}
	}

	.vit-footer {
		padding: 1.5rem 2rem;
		border-top: 1px solid theme('colors.gray.200');
		background: white;
		text-align: center;

		p {
			margin: 0;
			font-size: 0.875rem;
			color: theme('colors.gray.500');

			a {
				color: theme('colors.blue.600');
				text-decoration: none;

				&:hover {
					text-decoration: underline;
				}
			}
		}
	}

	// Expanded state styles
	:global(.vit-step.expanded) {
		z-index: 100;
		box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
	}
</style>

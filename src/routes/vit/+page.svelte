<script lang="ts">
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import {
		vitConfig,
		vitModelData,
		vitIsLoading,
		vitIsModelReady
	} from '~/store/vit';
	import VitImageInput from '~/components/vit/VitImageInput.svelte';
	import VitEmbeddingViz from '~/components/vit/VitEmbeddingViz.svelte';
	import VitAttentionViz from '~/components/vit/VitAttentionViz.svelte';
	import VitMlpViz from '~/components/vit/VitMlpViz.svelte';
	import VitClassificationViz from '~/components/vit/VitClassificationViz.svelte';
	import { base } from '$app/paths';

	let pageReady = false;

	onMount(() => {
		// Page becomes ready once mounted - VitImageInput handles initial image loading
		pageReady = true;
	});

	// Track when model data is available (set by VitImageInput)
	$: if ($vitModelData) {
		vitIsModelReady.set(true);
	}
</script>

<svelte:head>
	<title>ViT Explainer - Vision Transformer Visualization</title>
	<meta name="description" content="Interactive visualization of Vision Transformer (ViT) - An Image is Worth 16x16 Words" />
</svelte:head>

<div class="vit-page" class:ready={pageReady}>
	<!-- Loading Overlay -->
	{#if $vitIsLoading}
		<div class="loading-overlay" transition:fade={{ duration: 200 }}>
			<div class="loading-spinner">
				<div class="spinner"></div>
				<span>Processing image...</span>
			</div>
		</div>
	{/if}

	<!-- Header -->
	<header class="vit-header">
		<div class="header-content">
			<div class="title-row">
				<a href="{base}/" class="back-link" title="Back to GPT-2 Explainer">
					<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
						<path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
					</svg>
				</a>
				<div class="title-text">
					<h1>Vision Transformer (ViT) Explainer</h1>
					<p class="subtitle">
						Interactive visualization of "An Image is Worth 16x16 Words"
						<a href="https://arxiv.org/abs/2010.11929" target="_blank" rel="noopener" class="paper-link">
							(Dosovitskiy et al., 2020)
						</a>
					</p>
				</div>
			</div>
		</div>
	</header>

	<!-- Main Content -->
	<main class="vit-main">
		<!-- Pipeline Overview -->
		<div class="pipeline-overview">
			<div class="pipeline-step" class:active={true}>
				<span class="step-num">1</span>
				<span class="step-label">Input</span>
			</div>
			<div class="pipeline-arrow">
				<svg viewBox="0 0 24 12" width="24" height="12">
					<path d="M0 6 L18 6 M14 2 L20 6 L14 10" fill="none" stroke="currentColor" stroke-width="1.5"/>
				</svg>
			</div>
			<div class="pipeline-step">
				<span class="step-num">2</span>
				<span class="step-label">Embed</span>
			</div>
			<div class="pipeline-arrow">
				<svg viewBox="0 0 24 12" width="24" height="12">
					<path d="M0 6 L18 6 M14 2 L20 6 L14 10" fill="none" stroke="currentColor" stroke-width="1.5"/>
				</svg>
			</div>
			<div class="pipeline-step">
				<span class="step-num">3</span>
				<span class="step-label">Attention</span>
			</div>
			<div class="pipeline-arrow">
				<svg viewBox="0 0 24 12" width="24" height="12">
					<path d="M0 6 L18 6 M14 2 L20 6 L14 10" fill="none" stroke="currentColor" stroke-width="1.5"/>
				</svg>
			</div>
			<div class="pipeline-step">
				<span class="step-num">4</span>
				<span class="step-label">MLP</span>
			</div>
			<div class="pipeline-arrow">
				<svg viewBox="0 0 24 12" width="24" height="12">
					<path d="M0 6 L18 6 M14 2 L20 6 L14 10" fill="none" stroke="currentColor" stroke-width="1.5"/>
				</svg>
			</div>
			<div class="pipeline-step">
				<span class="step-num">5</span>
				<span class="step-label">Classify</span>
			</div>
		</div>

		<!-- Visualization Grid -->
		<div class="viz-grid">
			<!-- Column 1: Image Input -->
			<section class="viz-card image-card">
				<VitImageInput />
			</section>

			<!-- Column 2: Embeddings -->
			<section class="viz-card embedding-card">
				<VitEmbeddingViz />
			</section>

			<!-- Column 3: Attention -->
			<section class="viz-card attention-card">
				<VitAttentionViz />
			</section>

			<!-- Column 4: MLP -->
			<section class="viz-card mlp-card">
				<VitMlpViz />
			</section>

			<!-- Column 5: Classification -->
			<section class="viz-card classification-card">
				<VitClassificationViz />
			</section>
		</div>

		<!-- Architecture Info -->
		<div class="arch-info">
			<div class="arch-card">
				<h3>Toy ViT Architecture</h3>
				<div class="arch-stats">
					<div class="stat">
						<span class="stat-value">{vitConfig.imageSize}x{vitConfig.imageSize}</span>
						<span class="stat-label">Input Size</span>
					</div>
					<div class="stat">
						<span class="stat-value">{vitConfig.patchSize}x{vitConfig.patchSize}</span>
						<span class="stat-label">Patch Size</span>
					</div>
					<div class="stat">
						<span class="stat-value">{vitConfig.numPatches}</span>
						<span class="stat-label">Patches</span>
					</div>
					<div class="stat">
						<span class="stat-value">{vitConfig.hiddenSize}</span>
						<span class="stat-label">Hidden Dim</span>
					</div>
					<div class="stat">
						<span class="stat-value">{vitConfig.numLayers}</span>
						<span class="stat-label">Layers</span>
					</div>
					<div class="stat">
						<span class="stat-value">{vitConfig.numHeads}</span>
						<span class="stat-label">Heads</span>
					</div>
					<div class="stat">
						<span class="stat-value">{vitConfig.numClasses}</span>
						<span class="stat-label">Classes</span>
					</div>
				</div>
			</div>
		</div>
	</main>

	<!-- Footer -->
	<footer class="vit-footer">
		<p>
			This is a toy ViT model with random weights for educational visualization.
			Based on <a href="https://arxiv.org/abs/2010.11929" target="_blank" rel="noopener">"An Image is Worth 16x16 Words"</a>
		</p>
	</footer>
</div>

<style lang="scss">
	.vit-page {
		min-height: 100vh;
		background: linear-gradient(180deg, #f8fafc 0%, #ffffff 100%);
		opacity: 0;
		transition: opacity 0.3s ease;

		&.ready {
			opacity: 1;
		}
	}

	.loading-overlay {
		position: fixed;
		inset: 0;
		background: rgba(255, 255, 255, 0.9);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;

		.loading-spinner {
			display: flex;
			flex-direction: column;
			align-items: center;
			gap: 1rem;

			.spinner {
				width: 40px;
				height: 40px;
				border: 3px solid theme('colors.gray.200');
				border-top-color: theme('colors.blue.500');
				border-radius: 50%;
				animation: spin 0.8s linear infinite;
			}

			span {
				font-size: 0.875rem;
				color: theme('colors.gray.600');
			}
		}
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}

	.vit-header {
		padding: 1rem 1.5rem;
		background: white;
		border-bottom: 1px solid theme('colors.gray.200');
		position: sticky;
		top: 0;
		z-index: 100;

		.header-content {
			max-width: 1600px;
			margin: 0 auto;
		}

		.title-row {
			display: flex;
			align-items: center;
			gap: 1rem;
		}

		.back-link {
			display: flex;
			align-items: center;
			justify-content: center;
			width: 36px;
			height: 36px;
			border-radius: 50%;
			background: theme('colors.gray.100');
			color: theme('colors.gray.600');
			transition: all 0.15s;
			flex-shrink: 0;

			&:hover {
				background: theme('colors.gray.200');
				color: theme('colors.gray.800');
			}
		}

		.title-text {
			h1 {
				font-size: 1.25rem;
				font-weight: 600;
				color: theme('colors.gray.800');
				margin: 0;
			}

			.subtitle {
				font-size: 0.75rem;
				color: theme('colors.gray.500');
				margin: 0.25rem 0 0 0;

				.paper-link {
					color: theme('colors.blue.600');
					text-decoration: none;

					&:hover {
						text-decoration: underline;
					}
				}
			}
		}
	}

	.vit-main {
		max-width: 1600px;
		margin: 0 auto;
		padding: 1.5rem;
	}

	.pipeline-overview {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		margin-bottom: 1.5rem;
		padding: 0.75rem 1rem;
		background: white;
		border: 1px solid theme('colors.gray.200');
		border-radius: 0.5rem;
		flex-wrap: wrap;

		.pipeline-step {
			display: flex;
			align-items: center;
			gap: 0.375rem;
			padding: 0.375rem 0.625rem;
			background: theme('colors.gray.50');
			border: 1px solid theme('colors.gray.200');
			border-radius: 0.375rem;
			transition: all 0.15s;

			&.active {
				background: theme('colors.blue.50');
				border-color: theme('colors.blue.300');

				.step-num {
					background: theme('colors.blue.500');
				}

				.step-label {
					color: theme('colors.blue.700');
				}
			}

			.step-num {
				width: 18px;
				height: 18px;
				background: theme('colors.gray.400');
				color: white;
				border-radius: 50%;
				font-size: 0.65rem;
				font-weight: 600;
				display: flex;
				align-items: center;
				justify-content: center;
			}

			.step-label {
				font-size: 0.7rem;
				color: theme('colors.gray.600');
				font-weight: 500;
			}
		}

		.pipeline-arrow {
			color: theme('colors.gray.400');
		}
	}

	.viz-grid {
		display: grid;
		grid-template-columns: repeat(5, 1fr);
		gap: 1rem;
		margin-bottom: 1.5rem;

		@media (max-width: 1400px) {
			grid-template-columns: repeat(3, 1fr);
		}

		@media (max-width: 900px) {
			grid-template-columns: repeat(2, 1fr);
		}

		@media (max-width: 600px) {
			grid-template-columns: 1fr;
		}
	}

	.viz-card {
		background: white;
		border: 1px solid theme('colors.gray.200');
		border-radius: 0.625rem;
		padding: 1rem;
		min-height: 400px;
		transition: all 0.2s;

		&:hover {
			border-color: theme('colors.gray.300');
			box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
		}
	}

	.arch-info {
		display: flex;
		justify-content: center;

		.arch-card {
			background: white;
			border: 1px solid theme('colors.gray.200');
			border-radius: 0.625rem;
			padding: 1rem 1.5rem;
			max-width: 900px;
			width: 100%;

			h3 {
				font-size: 0.85rem;
				font-weight: 600;
				color: theme('colors.gray.700');
				margin: 0 0 0.75rem 0;
				text-align: center;
			}

			.arch-stats {
				display: flex;
				justify-content: center;
				gap: 1.5rem;
				flex-wrap: wrap;

				.stat {
					display: flex;
					flex-direction: column;
					align-items: center;
					gap: 0.125rem;

					.stat-value {
						font-size: 1rem;
						font-weight: 600;
						color: theme('colors.gray.800');
						font-family: monospace;
					}

					.stat-label {
						font-size: 0.6rem;
						color: theme('colors.gray.500');
						text-transform: uppercase;
						letter-spacing: 0.02em;
					}
				}
			}
		}
	}

	.vit-footer {
		padding: 1rem 1.5rem;
		border-top: 1px solid theme('colors.gray.200');
		background: white;
		text-align: center;

		p {
			margin: 0;
			font-size: 0.75rem;
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
</style>

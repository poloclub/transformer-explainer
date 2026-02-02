<script lang="ts">
	/**
	 * VitClassificationViz - Classification head visualization
	 *
	 * Features:
	 * - Final CLS token representation
	 * - Top-k predictions with probability bars
	 * - Logit values display
	 * - Animated probability updates
	 */

	import { fade, slide } from 'svelte/transition';
	import { flip } from 'svelte/animate';
	import {
		vitConfig,
		vitModelData,
		vitColors
	} from '~/store/vit';
	import * as d3 from 'd3';

	// Display constants
	const TOP_K = 5;
	const MAX_BAR_WIDTH = 120;

	// Get top predictions
	$: topPredictions = $vitModelData?.predictions.slice(0, TOP_K) || [];
	$: topPrediction = topPredictions[0];

	// CLS vector canvas
	let clsCanvas: HTMLCanvasElement;

	$: if (clsCanvas && $vitModelData) {
		drawClsVector();
	}

	function drawClsVector() {
		if (!clsCanvas || !$vitModelData) return;

		const ctx = clsCanvas.getContext('2d');
		if (!ctx) return;

		const data = $vitModelData.clsOutput;
		const height = clsCanvas.height;
		const width = clsCanvas.width;

		// Normalize
		let min = Infinity, max = -Infinity;
		for (let i = 0; i < data.length; i++) {
			min = Math.min(min, data[i]);
			max = Math.max(max, data[i]);
		}
		const range = max - min || 1;

		// Draw
		const step = height / data.length;
		for (let i = 0; i < Math.min(data.length, height); i++) {
			const normalized = (data[i] - min) / range;
			ctx.fillStyle = d3.interpolatePurples(normalized);
			ctx.fillRect(0, i * step, width, step + 1);
		}
	}

	// Format probability
	function formatProb(p: number): string {
		return (p * 100).toFixed(1) + '%';
	}

	// Format logit
	function formatLogit(l: number): string {
		return l.toFixed(2);
	}
</script>

<div class="vit-classification-viz">
	<!-- Header -->
	<div class="section-header">
		<h3 class="title">Classification Head</h3>
	</div>

	<div class="content">
		<!-- CLS Output -->
		<div class="cls-output">
			<div class="output-label">Final [CLS] Representation</div>
			<div class="cls-flow">
				<div class="cls-token">
					<span class="token-label">[CLS]</span>
					<canvas
						bind:this={clsCanvas}
						width={10}
						height={32}
						class="cls-vector"
					/>
				</div>
				<div class="arrow">
					<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
						<path d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z"/>
					</svg>
				</div>
				<div class="mlp-head">
					<span class="head-label">MLP Head</span>
					<div class="head-box"></div>
				</div>
			</div>
		</div>

		<!-- Top Prediction Badge -->
		{#if topPrediction}
			<div class="top-prediction" transition:fade={{ duration: 200 }}>
				<div class="prediction-badge">
					<span class="check-icon">
						<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
							<path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
						</svg>
					</span>
					<div class="prediction-info">
						<span class="class-name">{topPrediction.className}</span>
						<span class="probability">{formatProb(topPrediction.probability)}</span>
					</div>
				</div>
			</div>
		{/if}

		<!-- Top-K Predictions -->
		<div class="predictions-list">
			<div class="list-header">Top-{TOP_K} Predictions</div>
			{#each topPredictions as pred, idx (pred.classIdx)}
				<div
					class="prediction-row"
					class:top={idx === 0}
					animate:flip={{ duration: 200 }}
				>
					<span class="rank">#{idx + 1}</span>
					<span class="class-name">{pred.className}</span>
					<div class="bar-container">
						<div
							class="bar"
							class:top={idx === 0}
							style="width: {pred.probability * MAX_BAR_WIDTH}px"
						></div>
					</div>
					<span class="prob-value">{formatProb(pred.probability)}</span>
				</div>
			{/each}
		</div>

		<!-- Logits (collapsed by default) -->
		<details class="logits-details">
			<summary class="logits-summary">Show logits</summary>
			<div class="logits-grid">
				{#each topPredictions as pred}
					<div class="logit-item">
						<span class="logit-class">{pred.className}</span>
						<span class="logit-value">{formatLogit(pred.logit)}</span>
					</div>
				{/each}
			</div>
		</details>

		<!-- Info -->
		<div class="info-footer">
			Output: {vitConfig.numClasses} classes
		</div>
	</div>
</div>

<style lang="scss">
	.vit-classification-viz {
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

	.cls-output {
		padding-bottom: 0.5rem;
		border-bottom: 1px dashed theme('colors.gray.200');

		.output-label {
			font-size: 0.6rem;
			color: theme('colors.gray.400');
			text-transform: uppercase;
			letter-spacing: 0.05em;
			margin-bottom: 0.25rem;
		}

		.cls-flow {
			display: flex;
			align-items: center;
			gap: 0.5rem;
		}

		.cls-token {
			display: flex;
			align-items: center;
			gap: 0.25rem;

			.token-label {
				font-size: 0.65rem;
				font-weight: 600;
				color: theme('colors.purple.600');
				font-family: monospace;
			}

			.cls-vector {
				border-radius: 2px;
				border: 1px solid theme('colors.purple.200');
			}
		}

		.arrow {
			color: theme('colors.gray.400');
		}

		.mlp-head {
			display: flex;
			flex-direction: column;
			align-items: center;
			gap: 0.125rem;

			.head-label {
				font-size: 0.5rem;
				color: theme('colors.gray.400');
			}

			.head-box {
				width: 36px;
				height: 20px;
				background: linear-gradient(135deg, theme('colors.indigo.200'), theme('colors.indigo.400'));
				border-radius: 0.25rem;
				border: 1px solid theme('colors.indigo.300');
			}
		}
	}

	.top-prediction {
		.prediction-badge {
			display: flex;
			align-items: center;
			gap: 0.5rem;
			padding: 0.5rem 0.625rem;
			background: linear-gradient(135deg, theme('colors.green.50'), theme('colors.green.100'));
			border: 2px solid theme('colors.green.400');
			border-radius: 0.5rem;

			.check-icon {
				color: theme('colors.green.500');
				display: flex;
			}

			.prediction-info {
				display: flex;
				flex-direction: column;
				gap: 0.125rem;

				.class-name {
					font-size: 0.85rem;
					font-weight: 600;
					color: theme('colors.gray.800');
					text-transform: capitalize;
				}

				.probability {
					font-size: 0.75rem;
					font-weight: 500;
					color: theme('colors.green.600');
				}
			}
		}
	}

	.predictions-list {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;

		.list-header {
			font-size: 0.6rem;
			color: theme('colors.gray.400');
			text-transform: uppercase;
			letter-spacing: 0.05em;
		}

		.prediction-row {
			display: flex;
			align-items: center;
			gap: 0.375rem;
			padding: 0.25rem 0.375rem;
			background: white;
			border: 1px solid theme('colors.gray.200');
			border-radius: 0.25rem;
			transition: all 0.15s;

			&.top {
				background: theme('colors.green.50');
				border-color: theme('colors.green.300');

				.class-name {
					color: theme('colors.green.700');
					font-weight: 600;
				}

				.bar {
					background: theme('colors.green.400');
				}
			}

			.rank {
				font-size: 0.55rem;
				color: theme('colors.gray.400');
				min-width: 1.25rem;
			}

			.class-name {
				font-size: 0.65rem;
				color: theme('colors.gray.700');
				min-width: 70px;
				text-transform: capitalize;
			}

			.bar-container {
				flex: 1;
				height: 6px;
				background: theme('colors.gray.100');
				border-radius: 3px;
				overflow: hidden;

				.bar {
					height: 100%;
					background: theme('colors.purple.400');
					border-radius: 3px;
					transition: width 0.3s ease-out;
				}
			}

			.prob-value {
				font-size: 0.6rem;
				font-family: monospace;
				color: theme('colors.gray.600');
				min-width: 2.5rem;
				text-align: right;
			}
		}
	}

	.logits-details {
		.logits-summary {
			font-size: 0.6rem;
			color: theme('colors.gray.400');
			cursor: pointer;

			&:hover {
				color: theme('colors.gray.600');
			}
		}

		.logits-grid {
			display: grid;
			grid-template-columns: repeat(2, 1fr);
			gap: 0.25rem;
			margin-top: 0.25rem;
			padding: 0.375rem;
			background: theme('colors.gray.50');
			border-radius: 0.25rem;

			.logit-item {
				display: flex;
				justify-content: space-between;
				font-size: 0.55rem;

				.logit-class {
					color: theme('colors.gray.500');
					text-transform: capitalize;
				}

				.logit-value {
					color: theme('colors.gray.700');
					font-family: monospace;
				}
			}
		}
	}

	.info-footer {
		font-size: 0.55rem;
		color: theme('colors.gray.400');
		text-align: center;
	}
</style>

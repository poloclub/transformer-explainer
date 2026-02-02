<script lang="ts">
	import {
		vitConfig,
		vitModelData,
		vitExpandedBlock,
		selectedPredictionIdx
	} from '~/store/vit';
	import VectorCanvas from '../common/VectorCanvas.svelte';
	import classNames from 'classnames';
	import tailwindConfig from '../../../tailwind.config';
	import resolveConfig from 'tailwindcss/resolveConfig';
	import * as d3 from 'd3';

	const { theme } = resolveConfig(tailwindConfig);

	export let className: string = '';

	$: isExpanded = $vitExpandedBlock.id === 'classification';
	$: predictions = $vitModelData?.predictions || [];
	$: topPrediction = $vitModelData?.topPrediction;
	$: finalClsToken = $vitModelData?.finalClsToken || [];

	// Max bar width for probability visualization
	const maxBarWidth = 150;

	function handleClick() {
		if (isExpanded) {
			vitExpandedBlock.set({ id: null });
		} else {
			vitExpandedBlock.set({ id: 'classification' });
		}
	}

	function selectPrediction(idx: number) {
		selectedPredictionIdx.set(idx);
	}

	const clsColor = d3.interpolate(theme.colors.purple[100], theme.colors.purple[500]);
	const greenColor = d3.interpolate(theme.colors.green[100], theme.colors.green[500]);
</script>

<div
	class={classNames('vit-classification step', className, { expanded: isExpanded })}
	role="button"
	tabindex="0"
	on:click={handleClick}
	on:keydown={(e) => e.key === 'Enter' && handleClick()}
>
	<div class="title expandable">
		<div class="title-text">Classification Head</div>
	</div>

	<div class="content">
		<!-- CLS Token Output -->
		<div class="cls-output">
			<div class="section-label">Final [CLS] Representation</div>
			<div class="cls-visual">
				<span class="token-label">[CLS]</span>
				<div class="vector cls">
					<VectorCanvas
						active
						data={finalClsToken.slice(0, 200).map(v => (v + 1) / 2)}
						colorScale={clsColor}
					/>
				</div>
				<div class="arrow">
					<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
						<path d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z" />
					</svg>
				</div>
				<div class="mlp-head">
					<span class="mlp-label">MLP Head</span>
					<div class="mlp-box"></div>
				</div>
			</div>
		</div>

		<!-- Top Prediction Highlight -->
		{#if topPrediction}
			<div class="top-prediction">
				<div class="prediction-badge">
					<span class="prediction-icon">
						<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
							<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
						</svg>
					</span>
					<div class="prediction-content">
						<span class="prediction-class">{topPrediction.className}</span>
						<span class="prediction-prob">{(topPrediction.probability * 100).toFixed(1)}%</span>
					</div>
				</div>
			</div>
		{/if}

		<!-- Probability Distribution -->
		<div class="predictions-list" class:expanded={isExpanded}>
			<div class="section-label">Top-5 Predictions</div>
			{#each predictions as prediction, idx}
				<button
					class="prediction-row"
					class:selected={$selectedPredictionIdx === idx}
					class:top={idx === 0}
					on:click|stopPropagation={() => selectPrediction(idx)}
				>
					<span class="rank">#{idx + 1}</span>
					<span class="class-name">{prediction.className}</span>
					<div class="prob-bar-container">
						<div
							class="prob-bar"
							style="width: {prediction.probability * maxBarWidth}px"
						></div>
					</div>
					<span class="prob-value">{(prediction.probability * 100).toFixed(1)}%</span>
				</button>
			{/each}
		</div>

		<!-- Logits Info -->
		{#if isExpanded && predictions.length > 0}
			<div class="logits-info">
				<div class="section-label">Logit Values</div>
				<div class="logits-grid">
					{#each predictions.slice(0, 3) as prediction}
						<div class="logit-item">
							<span class="logit-class">{prediction.className}</span>
							<span class="logit-value">{prediction.logit.toFixed(2)}</span>
						</div>
					{/each}
				</div>
			</div>
		{/if}

		<!-- Info -->
		<div class="info-footer">
			<span>Output: {vitConfig.numClasses} classes (ImageNet)</span>
		</div>
	</div>
</div>

<style lang="scss">
	.vit-classification {
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

	.section-label {
		font-size: 0.65rem;
		color: theme('colors.gray.400');
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin-bottom: 0.25rem;
	}

	.cls-output {
		padding-bottom: 0.5rem;
		border-bottom: 1px dashed theme('colors.gray.200');

		.cls-visual {
			display: flex;
			align-items: center;
			gap: 0.5rem;

			.token-label {
				font-size: 0.75rem;
				color: theme('colors.purple.600');
				font-weight: 600;
				font-family: monospace;
			}

			.vector {
				position: relative;
				width: 12px;
				height: 40px;
				border-radius: 2px;
				overflow: hidden;
				background: theme('colors.purple.100');
			}

			.arrow {
				color: theme('colors.gray.400');
			}

			.mlp-head {
				display: flex;
				flex-direction: column;
				align-items: center;
				gap: 0.125rem;

				.mlp-label {
					font-size: 0.6rem;
					color: theme('colors.gray.400');
				}

				.mlp-box {
					width: 40px;
					height: 25px;
					background: linear-gradient(135deg, theme('colors.indigo.200'), theme('colors.indigo.400'));
					border-radius: 0.25rem;
					border: 1px solid theme('colors.indigo.300');
				}
			}
		}
	}

	.top-prediction {
		.prediction-badge {
			display: flex;
			align-items: center;
			gap: 0.5rem;
			padding: 0.5rem 0.75rem;
			background: linear-gradient(135deg, theme('colors.green.50'), theme('colors.green.100'));
			border: 2px solid theme('colors.green.400');
			border-radius: 0.5rem;

			.prediction-icon {
				color: theme('colors.green.500');
			}

			.prediction-content {
				display: flex;
				flex-direction: column;

				.prediction-class {
					font-size: 0.9rem;
					font-weight: 600;
					color: theme('colors.gray.800');
					text-transform: capitalize;
				}

				.prediction-prob {
					font-size: 0.8rem;
					color: theme('colors.green.600');
					font-weight: 500;
				}
			}
		}
	}

	.predictions-list {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;

		.prediction-row {
			display: flex;
			align-items: center;
			gap: 0.5rem;
			padding: 0.25rem 0.5rem;
			background: white;
			border: 1px solid theme('colors.gray.200');
			border-radius: 0.25rem;
			cursor: pointer;
			transition: all 0.15s;
			text-align: left;

			&:hover {
				background: theme('colors.gray.50');
				border-color: theme('colors.gray.300');
			}

			&.selected {
				background: theme('colors.purple.50');
				border-color: theme('colors.purple.300');
			}

			&.top {
				background: theme('colors.green.50');
				border-color: theme('colors.green.300');

				.class-name {
					color: theme('colors.green.700');
					font-weight: 600;
				}

				.prob-bar {
					background: theme('colors.green.400');
				}
			}

			.rank {
				font-size: 0.65rem;
				color: theme('colors.gray.400');
				min-width: 1.5rem;
			}

			.class-name {
				font-size: 0.75rem;
				color: theme('colors.gray.700');
				min-width: 100px;
				text-transform: capitalize;
			}

			.prob-bar-container {
				flex: 1;
				height: 8px;
				background: theme('colors.gray.100');
				border-radius: 4px;
				overflow: hidden;

				.prob-bar {
					height: 100%;
					background: theme('colors.purple.400');
					border-radius: 4px;
					transition: width 0.3s ease;
				}
			}

			.prob-value {
				font-size: 0.7rem;
				font-family: monospace;
				color: theme('colors.gray.600');
				min-width: 3rem;
				text-align: right;
			}
		}
	}

	.logits-info {
		padding: 0.5rem;
		background: theme('colors.gray.50');
		border-radius: 0.25rem;

		.logits-grid {
			display: grid;
			grid-template-columns: repeat(3, 1fr);
			gap: 0.5rem;

			.logit-item {
				display: flex;
				flex-direction: column;
				align-items: center;
				padding: 0.25rem;

				.logit-class {
					font-size: 0.6rem;
					color: theme('colors.gray.500');
					text-transform: capitalize;
				}

				.logit-value {
					font-size: 0.75rem;
					font-family: monospace;
					color: theme('colors.gray.700');
					font-weight: 500;
				}
			}
		}
	}

	.info-footer {
		font-size: 0.6rem;
		color: theme('colors.gray.400');
		text-align: center;
	}
</style>

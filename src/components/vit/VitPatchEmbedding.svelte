<script lang="ts">
	import { tick } from 'svelte';
	import {
		vitConfig,
		vitModelData,
		highlightedPatch,
		vitExpandedBlock,
		patchGridSize
	} from '~/store/vit';
	import VectorCanvas from '../common/VectorCanvas.svelte';
	import classNames from 'classnames';
	import tailwindConfig from '../../../tailwind.config';
	import resolveConfig from 'tailwindcss/resolveConfig';
	import * as d3 from 'd3';

	const { theme } = resolveConfig(tailwindConfig);

	export let className: string = '';

	const gridSize = patchGridSize;
	const maxVisiblePatches = 8; // Show subset for clarity

	$: isExpanded = $vitExpandedBlock.id === 'patch-embedding';

	// Get a subset of patches to display
	$: displayPatches = $vitModelData?.patchEmbeddings.slice(0, maxVisiblePatches) || [];

	// CLS token data
	$: clsEmbedding = $vitModelData?.clsToken || [];
	$: clsPositional = $vitModelData?.clsPositionalEncoding || [];

	function handleClick() {
		if (isExpanded) {
			vitExpandedBlock.set({ id: null });
		} else {
			vitExpandedBlock.set({ id: 'patch-embedding' });
		}
	}

	// Color scales
	const patchColor = d3.interpolate(theme.colors.blue[100], theme.colors.blue[500]);
	const positionalColor = (d: number, i: number) =>
		d3.scaleDiverging()
			.domain([0, 0.5, 1])
			.range([theme.colors.orange[400], 'white', theme.colors.orange[600]])(d);
	const clsColor = d3.interpolate(theme.colors.purple[100], theme.colors.purple[500]);
</script>

<div
	class={classNames('vit-patch-embedding step', className, { expanded: isExpanded })}
	role="button"
	tabindex="0"
	on:click={handleClick}
	on:keydown={(e) => e.key === 'Enter' && handleClick()}
>
	<div class="title expandable">
		<div class="title-text">Patch + Position Embedding</div>
	</div>

	<div class="content">
		<!-- CLS Token (always first) -->
		<div class="token-section cls-section">
			<div class="section-label">[CLS] Token</div>
			<div class="token-row">
				<div class="token-item cls-token">
					<span class="token-label">[CLS]</span>
					<div class="embedding-visual">
						<div class="vector cls">
							<VectorCanvas active data={clsEmbedding.slice(0, 200).map(v => (v + 1) / 2)} colorScale={clsColor} />
						</div>
						{#if isExpanded}
							<span class="plus">+</span>
							<div class="vector positional">
								<VectorCanvas active data={clsPositional.slice(0, 200).map(v => (v + 1) / 2)} colorScale={positionalColor} />
							</div>
							<span class="equals">=</span>
							<div class="vector combined">
								<VectorCanvas active data={clsEmbedding.slice(0, 200).map((v, i) => ((v + clsPositional[i]) / 2 + 1) / 2)} colorScale={clsColor} />
							</div>
						{/if}
					</div>
				</div>
			</div>
		</div>

		<!-- Patch Embeddings -->
		<div class="token-section patch-section">
			<div class="section-label">Patch Embeddings</div>
			<div class="patches-grid" class:expanded={isExpanded}>
				{#each displayPatches as patch, idx}
					{@const isHighlighted = $highlightedPatch.index === patch.patchIndex}
					<div class="token-row" class:highlighted={isHighlighted}>
						<div class="token-item">
							<span class="token-label" class:highlighted={isHighlighted}>
								P<sub>{patch.patchIndex}</sub>
							</span>
							<div class="embedding-visual">
								<div class="vector patch">
									<VectorCanvas
										active
										data={patch.embedding.slice(0, 200).map(v => (v + 1) / 2)}
										colorScale={patchColor}
									/>
								</div>
								{#if isExpanded}
									<span class="plus">+</span>
									<div class="vector positional">
										<VectorCanvas
											active
											data={patch.positionalEncoding.slice(0, 200).map(v => (v + 1) / 2)}
											colorScale={positionalColor}
										/>
									</div>
									<span class="equals">=</span>
									<div class="vector combined">
										<VectorCanvas
											active
											data={patch.combined.slice(0, 200).map(v => (v + 1) / 2)}
											colorScale={patchColor}
										/>
									</div>
								{/if}
							</div>
						</div>
					</div>
				{/each}
				<!-- Ellipsis for remaining patches -->
				<div class="ellipsis-row">
					<span class="ellipsis-text">... {vitConfig.numPatches - maxVisiblePatches} more patches</span>
				</div>
			</div>
		</div>

		<!-- Legend -->
		{#if isExpanded}
			<div class="legend">
				<div class="legend-item">
					<div class="legend-color patch"></div>
					<span>Patch Embedding</span>
				</div>
				<div class="legend-item">
					<div class="legend-color positional"></div>
					<span>Positional Encoding</span>
				</div>
				<div class="legend-item">
					<div class="legend-color cls"></div>
					<span>[CLS] Token</span>
				</div>
			</div>
		{/if}

		<!-- Dimension info -->
		<div class="dim-info">
			<span>Vector dimension: {vitConfig.hiddenSize}</span>
		</div>
	</div>
</div>

<style lang="scss">
	.vit-patch-embedding {
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
		gap: 1rem;
		padding: 0.5rem;
	}

	.token-section {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;

		.section-label {
			font-size: 0.7rem;
			color: theme('colors.gray.400');
			text-transform: uppercase;
			letter-spacing: 0.05em;
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
		padding: 0.25rem 0;

		&.highlighted {
			background: rgba(147, 51, 234, 0.1);
			border-radius: 0.25rem;
		}
	}

	.token-item {
		display: flex;
		align-items: center;
		gap: 0.5rem;

		.token-label {
			font-size: 0.75rem;
			color: theme('colors.gray.600');
			min-width: 2.5rem;
			font-family: monospace;

			&.highlighted {
				color: theme('colors.purple.600');
				font-weight: 600;
			}
		}
	}

	.cls-token .token-label {
		color: theme('colors.purple.600');
		font-weight: 600;
	}

	.embedding-visual {
		display: flex;
		align-items: center;
		gap: 0.25rem;

		.plus, .equals {
			font-size: 0.8rem;
			color: theme('colors.gray.400');
			padding: 0 0.25rem;
		}

		.vector {
			position: relative;
			width: 12px;
			height: 30px;
			border-radius: 2px;
			overflow: hidden;

			&.patch {
				background: theme('colors.blue.100');
			}

			&.positional {
				background: theme('colors.orange.100');
			}

			&.combined {
				background: theme('colors.blue.200');
			}

			&.cls {
				background: theme('colors.purple.100');
			}
		}
	}

	.patches-grid {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		max-height: 300px;
		overflow-y: auto;

		&.expanded {
			max-height: 400px;
		}
	}

	.ellipsis-row {
		padding: 0.5rem;
		text-align: center;

		.ellipsis-text {
			font-size: 0.7rem;
			color: theme('colors.gray.400');
			font-style: italic;
		}
	}

	.legend {
		display: flex;
		gap: 1rem;
		padding: 0.5rem;
		background: theme('colors.gray.50');
		border-radius: 0.25rem;

		.legend-item {
			display: flex;
			align-items: center;
			gap: 0.25rem;
			font-size: 0.65rem;
			color: theme('colors.gray.600');

			.legend-color {
				width: 12px;
				height: 12px;
				border-radius: 2px;

				&.patch {
					background: theme('colors.blue.400');
				}

				&.positional {
					background: theme('colors.orange.400');
				}

				&.cls {
					background: theme('colors.purple.400');
				}
			}
		}
	}

	.dim-info {
		font-size: 0.65rem;
		color: theme('colors.gray.400');
		text-align: center;
	}
</style>

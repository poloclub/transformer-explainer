<script lang="ts">
	import {
		vitConfig,
		vitModelData,
		vitBlockIdx,
		vitExpandedBlock
	} from '~/store/vit';
	import VectorCanvas from '../common/VectorCanvas.svelte';
	import classNames from 'classnames';
	import tailwindConfig from '../../../tailwind.config';
	import resolveConfig from 'tailwindcss/resolveConfig';
	import * as d3 from 'd3';

	const { theme } = resolveConfig(tailwindConfig);

	export let className: string = '';

	$: isExpanded = $vitExpandedBlock.id === 'mlp';
	$: currentLayer = $vitModelData?.layerOutputs[$vitBlockIdx];

	// MLP dimensions
	const hiddenSize = vitConfig.hiddenSize; // 768
	const mlpSize = hiddenSize * 4; // 3072 (typical expansion factor)

	function handleClick() {
		if (isExpanded) {
			vitExpandedBlock.set({ id: null });
		} else {
			vitExpandedBlock.set({ id: 'mlp' });
		}
	}

	const purpleColor = d3.interpolate(theme.colors.purple[100], theme.colors.purple[500]);
	const indigoColor = d3.interpolate(theme.colors.indigo[100], theme.colors.indigo[500]);
	const blueColor = d3.interpolate(theme.colors.blue[100], theme.colors.blue[500]);
</script>

<div
	class={classNames('vit-mlp step', className, { expanded: isExpanded })}
	role="button"
	tabindex="0"
	on:click={handleClick}
	on:keydown={(e) => e.key === 'Enter' && handleClick()}
>
	<div class="title expandable">
		<div class="title-text">MLP (Feed-Forward)</div>
	</div>

	<div class="content">
		<!-- MLP Architecture Diagram -->
		<div class="mlp-diagram">
			<!-- Input -->
			<div class="mlp-stage input-stage">
				<div class="stage-label">Input</div>
				<div class="vectors-column">
					{#each Array(5) as _, i}
						<div class="vector">
							<VectorCanvas
								active
								data={Array(50).fill(0).map(() => Math.random())}
								colorScale={purpleColor}
							/>
						</div>
					{/each}
					<div class="ellipsis">...</div>
				</div>
				<div class="dim-label">{hiddenSize}</div>
			</div>

			<!-- Arrow -->
			<div class="arrow-section">
				<div class="weight-box">
					<span class="weight-label">W1</span>
					<div class="weight-visual"></div>
				</div>
				<svg viewBox="0 0 40 24" width="40" height="24">
					<defs>
						<marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
							<polygon points="0 0, 10 3.5, 0 7" fill="#9CA3AF" />
						</marker>
					</defs>
					<line x1="0" y1="12" x2="35" y2="12" stroke="#9CA3AF" stroke-width="2" marker-end="url(#arrowhead)" />
				</svg>
			</div>

			<!-- Hidden Layer -->
			<div class="mlp-stage hidden-stage">
				<div class="stage-label">Hidden</div>
				<div class="vectors-column expanded">
					{#each Array(8) as _, i}
						<div class="vector">
							<VectorCanvas
								active
								data={Array(50).fill(0).map(() => Math.random())}
								colorScale={indigoColor}
							/>
						</div>
					{/each}
					<div class="ellipsis">...</div>
				</div>
				<div class="dim-label">{mlpSize}</div>
				<div class="activation-label">GELU</div>
			</div>

			<!-- Arrow -->
			<div class="arrow-section">
				<div class="weight-box">
					<span class="weight-label">W2</span>
					<div class="weight-visual"></div>
				</div>
				<svg viewBox="0 0 40 24" width="40" height="24">
					<line x1="0" y1="12" x2="35" y2="12" stroke="#9CA3AF" stroke-width="2" marker-end="url(#arrowhead)" />
				</svg>
			</div>

			<!-- Output -->
			<div class="mlp-stage output-stage">
				<div class="stage-label">Output</div>
				<div class="vectors-column">
					{#each Array(5) as _, i}
						<div class="vector">
							<VectorCanvas
								active
								data={Array(50).fill(0).map(() => Math.random())}
								colorScale={blueColor}
							/>
						</div>
					{/each}
					<div class="ellipsis">...</div>
				</div>
				<div class="dim-label">{hiddenSize}</div>
			</div>
		</div>

		<!-- Residual Connection -->
		<div class="residual-info">
			<div class="residual-visual">
				<span class="residual-label">+ Residual Connection</span>
				<svg viewBox="0 0 200 30" width="200" height="30">
					<path
						d="M 10 25 L 10 10 C 10 5 15 5 20 5 L 180 5 C 185 5 190 5 190 10 L 190 25"
						fill="none"
						stroke="#9CA3AF"
						stroke-width="1.5"
						stroke-dasharray="4,2"
					/>
				</svg>
			</div>
		</div>

		<!-- Layer Info -->
		{#if isExpanded}
			<div class="layer-info">
				<div class="info-row">
					<span class="info-label">Current Layer:</span>
					<span class="info-value">{$vitBlockIdx + 1} / {vitConfig.numLayers}</span>
				</div>
				<div class="info-row">
					<span class="info-label">Hidden expansion:</span>
					<span class="info-value">{hiddenSize} → {mlpSize} → {hiddenSize}</span>
				</div>
				<div class="info-row">
					<span class="info-label">Activation:</span>
					<span class="info-value">GELU</span>
				</div>
			</div>
		{/if}
	</div>
</div>

<style lang="scss">
	.vit-mlp {
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

	.mlp-diagram {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.25rem;
		padding: 0.5rem;
	}

	.mlp-stage {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.25rem;

		.stage-label {
			font-size: 0.6rem;
			color: theme('colors.gray.400');
			text-transform: uppercase;
		}

		.vectors-column {
			display: flex;
			flex-direction: column;
			gap: 2px;
			padding: 0.25rem;
			background: theme('colors.gray.50');
			border-radius: 0.25rem;
			border: 1px solid theme('colors.gray.200');

			&.expanded {
				background: theme('colors.indigo.50');
				border-color: theme('colors.indigo.200');
			}

			.vector {
				position: relative;
				width: 10px;
				height: 20px;
				border-radius: 2px;
				overflow: hidden;
			}

			.ellipsis {
				font-size: 0.5rem;
				color: theme('colors.gray.400');
				text-align: center;
			}
		}

		.dim-label {
			font-size: 0.55rem;
			color: theme('colors.gray.500');
			font-family: monospace;
		}

		.activation-label {
			font-size: 0.55rem;
			color: theme('colors.indigo.500');
			font-weight: 500;
			padding: 0.125rem 0.25rem;
			background: theme('colors.indigo.100');
			border-radius: 0.25rem;
		}
	}

	.arrow-section {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.25rem;

		.weight-box {
			display: flex;
			flex-direction: column;
			align-items: center;

			.weight-label {
				font-size: 0.5rem;
				color: theme('colors.gray.400');
			}

			.weight-visual {
				width: 20px;
				height: 12px;
				background: linear-gradient(90deg, theme('colors.gray.200'), theme('colors.gray.300'));
				border-radius: 2px;
			}
		}
	}

	.residual-info {
		display: flex;
		justify-content: center;

		.residual-visual {
			display: flex;
			flex-direction: column;
			align-items: center;

			.residual-label {
				font-size: 0.6rem;
				color: theme('colors.gray.400');
			}
		}
	}

	.layer-info {
		padding: 0.5rem;
		background: theme('colors.gray.50');
		border-radius: 0.25rem;

		.info-row {
			display: flex;
			gap: 0.5rem;
			font-size: 0.65rem;

			.info-label {
				color: theme('colors.gray.500');
			}

			.info-value {
				color: theme('colors.gray.700');
				font-family: monospace;
			}
		}
	}
</style>

<script lang="ts">
	import { tokens, modelMeta, isBoundingBoxActive, expandedBlock, blockIdx } from '~/store';
	import classNames from 'classnames';
	import { Tooltip } from 'flowbite-svelte';
	import VectorCanvas from './common/VectorCanvas.svelte';

	export let className: string | undefined = undefined;
</script>

<div
	class={classNames('transformer-blocks', className, {
		expanded: $expandedBlock.id !== null
	})}
	role="group"
	on:mouseenter={() => {
		isBoundingBoxActive.set(true);
	}}
	on:mouseleave={() => {
		isBoundingBoxActive.set(false);
	}}
>
	<div class="title"></div>
	<div class="content">
		<div class="column final relative">
			<div
				class="guide flex flex-col items-start gap-1"
				class:active={$blockIdx !== $modelMeta.layer_num - 1}
			>
				<div class="text" class:highlight={$isBoundingBoxActive}>
					{$modelMeta.layer_num - $blockIdx - 1} more identical<br /><span class="strong"
						>Transformer<br />Blocks</span
					>.
				</div>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-6 w-6 text-gray-300"
					viewBox="0 0 3 5"
					fill="none"
				>
					<path
						d="M1.18221 4.58047C1.23103 4.62928 1.31017 4.62928 1.35899 4.58047L2.15448 3.78497C2.2033 3.73616 2.2033 3.65701 2.15448 3.6082C2.10567 3.55938 2.02652 3.55938 1.97771 3.6082L1.2706 4.3153L0.563493 3.6082C0.514677 3.55938 0.435531 3.55938 0.386716 3.6082C0.3379 3.65701 0.3379 3.73616 0.386716 3.78497L1.18221 4.58047ZM1.1456 0.285461V4.49208H1.3956V0.285461H1.1456Z"
						fill="currentColor"
					/>
				</svg>
			</div>

			{#each $tokens as token, index}
				<div class="cell" class:last={index === $tokens.length - 1}>
					<div
						class={classNames(`vector shrink-0 bg-blue-200`, {
							'last-token': index === $tokens.length - 1
						})}
					>
						<VectorCanvas colorScale="blue" />
					</div>
					<Tooltip placement="right" class="popover">vector({$modelMeta.dimension})</Tooltip>
				</div>
			{/each}
		</div>
		<div class="second-column">
			<div class="prob-dim" class:expanded={$expandedBlock.id === 'softmax'}></div>
		</div>
	</div>
</div>

<style lang="scss">
	.transformer-blocks {
		&.expanded {
			.guide {
				opacity: 0.2;
			}
		}
		.guide {
			opacity: 0;
			transition: opacity 0.2s;
			white-space: pre;
			position: absolute;
			top: 0;
			left: calc(-50% - 0.5rem);
			transform: translateY(-100%);
			color: theme('colors.gray.400');

			.text {
				transition: opacity 0.5s;
				line-height: 1.2;
				padding-left: 0.5rem;
				font-size: 0.85rem;
				.strong {
					font-weight: 600;
				}

				&.highlight {
					.strong {
						transition: all 0.5s;
						color: theme('colors.blue.500');
						font-weight: 600;
					}
				}
			}
			&.active {
				opacity: 1;
			}
		}
		.content {
			display: grid;
			grid-template-columns: repeat(4, minmax(var(--min-column-width), 1fr));

			.column.final {
				grid-column-start: 2;

				.label.float {
					left: 2rem;
				}
			}
		}
		.column.initial .cell {
			gap: 0.6rem;
		}
	}

	.second-column {
		grid-column: span 2;
	}
	.prob-dim {
		pointer-events: none;
		position: absolute;
		bottom: -3rem;
		transform: translateX(-1rem);
		width: 100%;
		height: 30%;
		z-index: $ABOVE_COLUMN;
		background-color: white;
		background: linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 1) 100%);

		&.expanded {
			z-index: $EXPANDED_DIM_INDEX;
		}
	}
</style>

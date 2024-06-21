<script lang="ts">
	import { tokens, modelMeta, isBoundingBoxActive, expandedBlock } from '~/store';
	import classNames from 'classnames';
	import Operation from './Operation.svelte';
	import { Tooltip } from 'flowbite-svelte';
	import VectorCanvas from './VectorCanvas.svelte';

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
			<div class="guide flex flex-col items-start gap-1">
				<!-- <svg class="arrow" width="28" height="30" viewBox="0 0 28 30" fill="none">
					<path
						d="M4.01159 29.4026C4.23396 29.5664 4.54695 29.5188 4.71068 29.2965L7.37882 25.6728C7.54255 25.4504 7.49501 25.1374 7.27264 24.9737C7.05028 24.81 6.73728 24.8575 6.57355 25.0799L4.20188 28.3009L0.980829 25.9292C0.758462 25.7655 0.445469 25.813 0.281739 26.0354C0.118009 26.2578 0.165543 26.5708 0.387911 26.7345L4.01159 29.4026ZM4.80238 28.9249C4.10481 24.3318 4.43981 17.4539 7.67418 11.7465C10.885 6.08071 16.9895 1.5 28 1.5V0.5C16.655 0.5 10.2048 5.25263 6.80417 11.2535C3.42706 17.2128 3.09382 24.3349 3.81372 29.0751L4.80238 28.9249Z"
						fill="#D1D5DB"
					/>
				</svg> -->

				<div class="text" class:active={$isBoundingBoxActive}>
					{$modelMeta.layer_num - 1} more identical<br /><span class="highlight"
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
					<!-- {#if index === $tokens.length - 1}
						<span class="label float">{token}</span>
					{/if} -->
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
				.highlight {
					font-weight: 600;
					// color: theme('colors.gray.500');
				}

				&.active {
					opacity: 1;
					.highlight {
						transition: all 0.5s;
						color: theme('colors.blue.500');
						font-weight: 600;
					}
				}
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
		position: absolute;
		bottom: -3rem;
		transform: translateX(-1rem);
		width: 100%;
		height: 30%;
		z-index: 300;
		background-color: white;
		background: linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 1) 100%);

		&.expanded {
			z-index: 999;
		}
	}
</style>

<script lang="ts">
	import { tokens, expandedBlock, modelMeta } from '~/store';
	import classNames from 'classnames';
	import { gsap, Flip } from '~/utils/gsap';
	import { tick, setContext, getContext } from 'svelte';
	import VectorCanvas from './VectorCanvas.svelte';
	import * as d3 from 'd3';
	import OperationGroup from './OperationGroup.svelte';
	import HelpPopover from './HelpPopover.svelte';
	import tailwindConfig from '../../tailwind.config';
	import resolveConfig from 'tailwindcss/resolveConfig';
	import { Tooltip } from 'flowbite-svelte';
	const { theme } = resolveConfig(tailwindConfig);

	export let className: string | undefined = undefined;

	setContext('block-id', 'embedding');

	const blockId = getContext('block-id');

	let isEmbeddingExpanded = false;

	$: if ($expandedBlock.id !== blockId && isEmbeddingExpanded) {
		isEmbeddingExpanded = false;
		collapseEmbedding();
	}

	const onClickEmbedding = () => {
		if (!isEmbeddingExpanded) {
			expandedBlock.set({ id: blockId });
			expandEmbedding();
		} else {
			expandedBlock.set({ id: null });
			collapseEmbedding();
		}
	};

	let containerState: any;

	const expandEmbedding = async () => {
		containerState = Flip.getState('.embedding .token-column');
		isEmbeddingExpanded = true;
		await tick();

		Flip.from(containerState, {
			duration: 1,
			ease: 'power2.inOut'
		});
		gsap.to('.embedding-detail', {
			opacity: 1,
			duration: 0.5,
			delay: 0.5
		});
	};

	const collapseEmbedding = async () => {
		containerState = Flip.getState('.embedding .token-column');
		isEmbeddingExpanded = false;
		await tick();

		Flip.from(containerState, {
			duration: 0.5,
			ease: 'power2.inOut'
		});
	};

	let isHovered = false;

	function handleMouseEnter() {
		isHovered = true;
	}

	function handleMouseLeave() {
		isHovered = false;
	}

	const embeddingVectorColor = 'bg-gray-300';

	// Weight Popover

	let mouseX = 0;
	let mouseY = 0;
	let showPopover = false;

	function handleMouseOver() {
		showPopover = true;
	}

	function handleMouseMove(event) {
		mouseX = event.clientX;
		mouseY = event.clientY;
	}

	function handleMouseOut() {
		showPopover = false;
	}
</script>

<div
	class={classNames('embedding', className)}
	role="button"
	on:click={onClickEmbedding}
	on:keydown={onClickEmbedding}
	tabindex="0"
>
	<div
		class="title expandable"
		on:mouseenter={handleMouseEnter}
		on:mouseleave={handleMouseLeave}
		role="group"
	>
		<div>Embedding</div>
	</div>
	<div class="content relative">
		<div class="token-column resizable resize-watch flex">
			<!-- token -->
			<div class="column token-string relative">
				{#if isEmbeddingExpanded}<div class="subtitle embedding-detail">Token</div>{/if}
				{#each $tokens as token, index}
					<div class="cell" class:last={index === $tokens.length - 1}>
						<span class="label">{token}</span>
					</div>
				{/each}
				<div
					class="bounding embedding-bounding"
					class:active={isHovered && !isEmbeddingExpanded}
				></div>
			</div>
			{#if isEmbeddingExpanded}
				<Tooltip
					triggeredBy=".embedding .vector"
					placement="right"
					class="popover text-sm font-light">size(1, {$modelMeta.dimension})</Tooltip
				>
				<!-- token id and embedding -->
				<div class="column token-embedding embedding-detail">
					<div class="subtitle flex items-center gap-1">
						<span>Token Embedding</span><HelpPopover id="token-embedding"
							>Token Embedding is</HelpPopover
						>
					</div>
					{#each $tokens as token, index}
						<div class="token-id flex items-center">
							<div class="vocab-index ellipsis flex items-center text-right text-xs text-gray-400">
								<div class="flex flex-col items-center">
									{#if index === 0}
										<div class="look-up flex items-center gap-1">
											<span>look up</span><svg
												class="h-3 w-3 text-gray-400"
												aria-hidden="true"
												xmlns="http://www.w3.org/2000/svg"
												fill="none"
												viewBox="0 0 24 24"
											>
												<path
													stroke="currentColor"
													stroke-linecap="round"
													stroke-width="2"
													d="m21 21-3.5-3.5M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z"
												/>
											</svg>
										</div>
									{/if}
									<svg
										xmlns="http://www.w3.org/2000/svg"
										viewBox="0 0 31 9"
										fill="none"
										class="w-10 text-gray-300"
									>
										<path
											fill="currentColor"
											d="M30.3886 4.74352C30.5839 4.54826 30.5839 4.23168 30.3886 4.03642L27.2067 0.854435C27.0114 0.659173 26.6948 0.659173 26.4996 0.854435C26.3043 1.0497 26.3043 1.36628 26.4996 1.56154L29.328 4.38997L26.4996 7.2184C26.3043 7.41366 26.3043 7.73024 26.4996 7.9255C26.6948 8.12076 27.0114 8.12076 27.2067 7.9255L30.3886 4.74352ZM0.31958 4.88997H30.0351V3.88997H0.31958V4.88997Z"
										/>
									</svg>
								</div>
							</div>
							<div class="cell flex items-center">
								<div class={`vector ${embeddingVectorColor}`}>
									<VectorCanvas active />
								</div>
								<span class="index-val text-xs">
									{#if index === 0}
										<span class="label">id</span><br />
									{/if}
									<span class="val">{(Math.random() * 10000).toFixed()}</span>
								</span>
							</div>
						</div>
					{/each}
				</div>
				<!-- position embedding -->
				<div class="column symbol embedding-detail">
					{#each $tokens as token, index}
						<div class="cell">+</div>
					{/each}
				</div>
				<div class="column embedding-detail position-embedding">
					<div class="subtitle flex gap-1">
						<span>Positional Embedding</span><HelpPopover id="position-embedding"
							>Positional Embedding is</HelpPopover
						>
					</div>
					{#each $tokens as token, index}
						<div class="cell flex items-center">
							<div class={`vector ${embeddingVectorColor}`}>
								<VectorCanvas
									active
									colorScale={(d, i) => {
										return d3
											.scaleDiverging()
											.domain([0, 0.5, 1])
											.range([theme.colors['red'][400], 'white', theme.colors['blue'][400]])(d);
									}}
								/>
							</div>
							<span class="index-val text-xs">
								{#if index === 0}
									<span class="label">poition</span><br />
								{/if}
								<span class="val">{index}</span>
							</span>
						</div>
					{/each}
				</div>
				<div class="column symbol embedding-d etail">
					{#each $tokens as token, index}
						<div class="cell">=</div>
					{/each}
				</div>
				<!-- <PositionalEncodingPopover triggeredBy=".position-embedding" /> -->
			{/if}
		</div>
		<div class="vector-column flex">
			<Tooltip triggeredBy=".embedding .vector" placement="right" class="popover text-sm font-light"
				>size(1, {$modelMeta.dimension})</Tooltip
			>
			<div class="column vectors">
				{#each $tokens as token, index}
					<div class={`vector ${embeddingVectorColor}`} class:last={index === $tokens.length - 1}>
						<VectorCanvas active={isHovered || isEmbeddingExpanded} />
					</div>
				{/each}
			</div>
			<OperationGroup type="dropout" id={'embedding-dropout'} />
			<OperationGroup type="residual-start" id={'residual-first'} />
			<OperationGroup type="ln" id={'embedding-ln'} />
		</div>
	</div>
</div>

<style lang="scss">
	.embedding-bounding {
		top: -0.5rem;
		padding: 0.5rem 0;
		left: 0;
		width: calc(100% + 0.8rem);
		height: 100%;
	}
	:global(.dropout-popover),
	:global(.ln-popover) {
		width: 20rem;
		top: 100% !important;
	}

	.embedding {
		.embedding-detail {
			opacity: 0;
		}
		.title {
			justify-content: end;
			padding-left: 3rem;
		}
		.content {
			padding-left: 2rem;
			display: grid;
			grid-template-columns: auto repeat(4, minmax(3vw, 1fr));

			.token-column {
				// gap: 2rem;
				.column {
					padding: 0 1rem;

					.cell {
						justify-content: flex-end;
						gap: 0.5rem;
						text-align: left;
					}
				}
				.symbol {
					font-size: 0.8rem;
					color: theme('colors.gray.400');
				}
			}

			.token-string {
				width: 7rem;
				flex-shrink: 0;
			}

			.subtitle {
				justify-content: center;
				align-items: end;
			}
			.index-val .label {
				color: theme('colors.gray.400');
				line-height: 1;
				font-size: 0.7rem;
			}
			.index-val .val {
				width: 4rem;
				text-align: left;
				font-size: 0.8rem;
				color: theme('colors.gray.600');
				font-family: monospace;
			}

			.token-embedding {
				position: relative;
				width: 11rem;

				.vocab-index {
					width: 5rem;
					flex-shrink: 0;
					display: flex;
					justify-content: center;
					overflow: visible;
					padding-right: 1rem;
				}
			}

			.position-embedding {
				.cell {
					justify-content: center;
					gap: 0.5rem;
				}
				.index-val {
					width: 2rem;
					justify-content: start;
				}
				// &:hover {
				// 	background-color: theme('colors.gray.100');
				// }
			}
		}
	}
</style>

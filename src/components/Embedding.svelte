<script lang="ts">
	import { tokens, expandedBlock, modelData } from '~/store';
	import classNames from 'classnames';
	import { gsap, Flip } from '~/utils/gsap';
	import { tick, setContext, getContext } from 'svelte';
	import Operation from './Operation.svelte';
	import VectorCanvas from './VectorCanvas.svelte';
	import { fade } from 'svelte/transition';

	import { getData } from '~/utils/data';
	import PositionalEncodingPopover from './Popovers/PositionalEncodingPopover.svelte';
	import WeightPopover from './Popovers/WeightPopover.svelte';
	import DropoutPopover from './Popovers/DropoutPopover.svelte';
	import LayerNormPopover from './Popovers/LayerNormPopover.svelte';
	import OperationGroup from './OperationGroup.svelte';

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
		<div
			class="token-column resizable resize-watch flex"
			role="button"
			on:mouseenter={handleMouseEnter}
			on:mouseleave={handleMouseLeave}
			on:click={onClickEmbedding}
			on:keydown={onClickEmbedding}
			tabindex="0"
		>
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
				<!-- token id and embedding -->
				<div class="column token-embedding embedding-detail">
					<div class="subtitle">Token Embedding</div>
					{#each $tokens as token, index}
						<div class="token-id flex items-center">
							<div class="vocab-index ellipsis flex items-center text-right text-xs text-gray-400">
								<span>vocabulary</span><svg
									class="h-3 w-3 text-gray-600"
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
							<div class="flex">
								<span class="index-val bg-gray-100 text-center text-xs"
									>id: {(Math.random() * 10000).toFixed()}</span
								>
								<div class={`vector ${embeddingVectorColor}`}>
									<VectorCanvas />
								</div>
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
					<div class="subtitle">Positional Embedding</div>
					{#each $tokens as token, index}
						<div class="cell flex items-center">
							<div class={`vector ${embeddingVectorColor}`}><VectorCanvas /></div>
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
			<div
				class="column vectors"
				role="button"
				on:mouseenter={handleMouseEnter}
				on:mouseleave={handleMouseLeave}
				on:click={onClickEmbedding}
				on:keydown={onClickEmbedding}
				tabindex="0"
			>
				{#each $tokens as token, index}
					<div class={`vector ${embeddingVectorColor}`} class:last={index === $tokens.length - 1}>
						<VectorCanvas
							data={$modelData?.outputs['input_emb']?.data[index]}
							active={isHovered || isEmbeddingExpanded}
						/>
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

			.token-embedding {
				position: relative;
				width: 13rem;

				.vocab-index {
					width: 10rem;
					margin-right: 0.2rem;
				}
				.index-val {
					width: 5rem;
					border-radius: 4px;
					text-align: center;
					font-size: 0.7rem;
					color: theme('colors.gray.600');
				}
			}

			.position-embedding {
				&:hover {
					background-color: theme('colors.gray.100');
				}
			}
		}
	}
</style>

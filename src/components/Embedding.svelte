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
	let isDOHovered = false;
	let isRDHovered = false;
	let isLNHovered = false;

	function handleMouseEnter() {
		isHovered = true;
	}

	function handleMouseLeave() {
		isHovered = false;
	}

	const embeddingVectorColor = 'bg-gray-300';
</script>

<div class={classNames('embedding', className)}>
	<div
		class="title"
		on:click={onClickEmbedding}
		on:keydown={onClickEmbedding}
		role="button"
		tabindex="0"
	>
		<div>Embedding</div>
	</div>
	<div class="content relative">
		<div class="token-column resizable resize-watch flex">
			<!-- token -->
			<div class="column token-string">
				{#if isEmbeddingExpanded}<div class="subtitle embedding-detail">Token String</div>{/if}
				{#each $tokens as token, index}
					<div class="cell label" class:last={index === $tokens.length - 1}>
						<span>{token}</span>
					</div>
				{/each}
			</div>
			{#if isEmbeddingExpanded}
				<!-- token id and embedding -->
				<div class="column token-embedding embedding-detail">
					<div class="subtitle">Token IDs & Embeddings</div>
					{#each $tokens as token, index}
						<div class="token-id flex items-center">
							<div class="vocab-index ellipsis flex items-center text-right text-xs text-gray-400">
								<span>vocabulary</span><svg
									class="h-3 w-3 text-gray-600"
									aria-hidden="true"
									xmlns="http://www.w3.org/2000/svg"
									width="24"
									height="24"
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
					<div class="subtitle">Positional Embeddings</div>
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
				<PositionalEncodingPopover triggeredBy=".position-embedding" />
			{/if}
		</div>
		<div class="vector-column flex">
			<div
				class="column vectors"
				role="group"
				on:mouseenter={handleMouseEnter}
				on:mouseleave={handleMouseLeave}
			>
				{#each $tokens as token, index}
					<div class={`vector ${embeddingVectorColor}`} class:last={index === $tokens.length - 1}>
						<div
							class="canvas-container h-full w-full"
							class:active={isHovered || isEmbeddingExpanded}
						>
							<VectorCanvas data={$modelData?.outputs['input_emb']?.data[index]} />
						</div>
					</div>
				{/each}
			</div>
			<div
				class="column dropout"
				role="group"
				on:mouseenter={() => {
					isDOHovered = true;
				}}
				on:mouseleave={() => {
					isDOHovered = false;
				}}
			>
				{#each $tokens as token, index}
					<div class="cell" class:last={index === $tokens.length - 1}>
						<Operation type="dropout" tail={index === $tokens.length - 1} active={isDOHovered} />
					</div>
				{/each}
				<DropoutPopover triggeredBy=".column.dropout" offset={1} />
			</div>
			<div
				class="column residual"
				role="group"
				on:mouseenter={() => {
					isRDHovered = true;
				}}
				on:mouseleave={() => {
					isRDHovered = false;
				}}
			>
				{#each $tokens as token, index}
					<div class="cell" class:last={index === $tokens.length - 1}>
						<Operation type="residual-start" head={index === 0} active={isRDHovered} />
					</div>
				{/each}
			</div>
			<div
				class="column ln"
				role="group"
				on:mouseenter={() => {
					isLNHovered = true;
				}}
				on:mouseleave={() => {
					isLNHovered = false;
				}}
			>
				{#each $tokens as token, index}
					<div class="cell" class:last={index === $tokens.length - 1}>
						<Operation type="ln" tail={index === $tokens.length - 1} active={isLNHovered} />
					</div>
				{/each}
				<LayerNormPopover triggeredBy=".column.ln" />
			</div>
		</div>
	</div>
</div>

<style lang="scss">
	:global(.dropout-popover),
	:global(.ln-popover) {
		width: 20rem;
		top: 100% !important;
	}
	.canvas-container {
		transition: opacity 0.5s;
		opacity: 0;
		overflow: hidden;
		&.active {
			opacity: 1;
		}
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
					height: fit-content;
				}
				.symbol {
					font-size: 0.8rem;
					color: theme('colors.gray.400');
				}
			}

			.token-string {
				width: 5rem;
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

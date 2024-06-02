<script lang="ts">
	import { tokens, expandedBlock } from '~/store';
	import classNames from 'classnames';
	import { gsap, Flip } from '~/utils/gsap';
	import { tick, setContext, getContext } from 'svelte';
	import Operation from './Operation.svelte';
	import VectorCanvas from './VectorCanvas.svelte';
	import { fade } from 'svelte/transition';
	import { Popover } from 'flowbite-svelte';

	import { getData } from '~/utils/data';

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
		containerState = Flip.getState('.embedding .initial');
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
		containerState = Flip.getState('.embedding .initial');
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
		<div class="tokens initial">
			{#if isEmbeddingExpanded}
				<div
					class="embedding-subtitle embedding-detail items-end text-center text-xs text-gray-400 opacity-0"
				>
					<div class="token-string">Token String</div>
					<div class="token-id">Token IDs</div>
					<div class="token-embedding">Token<br />Embeddings</div>
					<div class="w-2"></div>
					<div class="position-embedding">Positional<br />Embeddings</div>
					<div class="w-2"></div>
				</div>
			{/if}
			{#each $tokens as token, index}
				<div class="token resize-watch">
					<span class="token-string label">{token}</span>
					{#if isEmbeddingExpanded}
						<div class="embedding-detail items-center opacity-0">
							<div class="token-id flex gap-2">
								<span class="vocab-index ellipsis text-right text-xs text-gray-400"
									>vocab['{token}'] =</span
								>
								<span class="label bg-gray-100 text-center text-xs"
									>{(Math.random() * 10000).toFixed()}</span
								>
							</div>
							<div class="token-embedding">
								<div class={`vector bg-gray-200`}>
									<VectorCanvas />
								</div>
							</div>
							<div class="w-2 text-xs text-gray-400">+</div>
							<div class="position-embedding">
								<div class={`vector bg-gray-200`}><VectorCanvas /></div>
							</div>
							<div class="w-6 text-xs text-gray-400">=</div>
						</div>
					{/if}
				</div>
			{/each}
		</div>
		<div class="flex">
			<div
				class="tokens vector"
				role="group"
				on:mouseenter={handleMouseEnter}
				on:mouseleave={handleMouseLeave}
			>
				{#each $tokens as token, index}
					<div class="token">
						<div class={`vector bg-gray-200`}>
							<div
								class="canvas-container h-full w-full"
								class:active={isHovered || isEmbeddingExpanded}
							>
								<VectorCanvas />
							</div>
						</div>
					</div>
				{/each}
			</div>
			<div
				class="tokens dropout"
				role="group"
				on:mouseenter={() => {
					isDOHovered = true;
				}}
				on:mouseleave={() => {
					isDOHovered = false;
				}}
			>
				{#each $tokens as token, index}
					<div class="token">
						<Operation type="dropout" tail={index === $tokens.length - 1} active={isDOHovered} />
					</div>
				{/each}
				<Popover
					offset={1}
					class="dropout-popover text-sm"
					title="Drop out"
					triggeredBy=".tokens.dropout"
					trigger="hover"
					arrow={false}
					placement="right">...</Popover
				>
			</div>
			<div
				class="tokens residual"
				role="group"
				on:mouseenter={() => {
					isRDHovered = true;
				}}
				on:mouseleave={() => {
					isRDHovered = false;
				}}
			>
				{#each $tokens as token, index}
					<div class="token">
						<Operation type="residual-start" head={index === 0} active={isRDHovered} />
					</div>
				{/each}
			</div>
			<div
				class="tokens ln"
				role="group"
				on:mouseenter={() => {
					isLNHovered = true;
				}}
				on:mouseleave={() => {
					isLNHovered = false;
				}}
			>
				{#each $tokens as token, index}
					<div class="token">
						<Operation type="ln" tail={index === $tokens.length - 1} active={isLNHovered} />
					</div>
				{/each}
				<Popover
					offset={1}
					class="ln-popover text-sm"
					title="Layer Normalization"
					triggeredBy=".tokens.ln"
					trigger="hover"
					arrow={false}
					placement="right">...</Popover
				>
			</div>
		</div>
	</div>
</div>

<style lang="scss">
	:global(.dropout-popover),
	:global(.ln-popover) {
		z-index: 999;
		width: 20rem;
		top: 100% !important;
		/* transform: translateY(-100%); */
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
		.title {
			justify-content: end;
			padding-left: 3rem;
		}
		.content {
			padding-left: 2rem;
			display: grid;
			grid-template-columns: auto repeat(3, minmax(3vw, 1fr));

			.tokens {
				position: relative;
				height: fit-content;
				.vector {
					flex-shrink: 0;
				}
			}

			.embedding-detail {
				display: flex;
				gap: 1rem;
			}

			.token-string {
				width: 5rem;
				flex-shrink: 0;
			}

			.token-id {
				width: 13rem;
				.vocab-index {
					width: 8rem;
				}
				.label {
					width: 5rem;
					border-radius: 4px;
					text-align: center;
				}
			}

			.token-embedding {
				width: 3rem;
				display: flex;
				justify-content: center;
			}
			.position-embedding {
				width: 3rem;
				display: flex;
				justify-content: center;
			}

			.embedding-subtitle {
				position: absolute;
				top: 0;
				transform: translateY(calc(-100% - 1rem));
				> div {
					text-align: center;
				}
			}

			.tokens.initial {
				padding-right: 0.8rem;
			}
			.tokens.out .token {
				gap: 0.6rem;
			}
		}
	}
</style>

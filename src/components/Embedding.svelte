<script lang="ts">
	import { tokens } from '~/store';
	import classNames from 'classnames';
	import { gsap, Flip } from '~/utils/gsap';
	import { tick } from 'svelte';

	export let className: string | undefined = undefined;

	let isEmbeddingExpanded = false;
	let containerState: any;

	const onClickEmbedding = () => {
		if (!isEmbeddingExpanded) {
			expandEmbedding();
		} else {
			collapseEmbedding();
		}
	};

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
</script>

<div
	class={classNames('embedding', className)}
	on:click={onClickEmbedding}
	on:keydown={onClickEmbedding}
	role="button"
	tabindex="0"
>
	<div class="title">Embedding</div>
	<div class="content resize-watch">
		<div class="tokens initial pr-4">
			{#each $tokens as token, index}
				<div class="token">
					<span class="label">{token}</span>
					{#if isEmbeddingExpanded}
						<div class="embedding-detail flex items-center gap-2 opacity-0">
							<span class="ellipsis w-[8rem] text-right text-xs text-gray-400"
								>vocab['{token}'] =</span
							>
							<span class="label token-id w-[5rem] bg-gray-100 text-center text-xs"
								>{(Math.random() * 10000).toFixed()}</span
							>
							<div class={`vector bg-gray-200`}></div>
							<div class="text-right text-xs text-gray-400">+</div>
							<div class={`vector bg-gray-200`}></div>
							<div class="text-right text-xs text-gray-400">=</div>
						</div>
					{/if}
				</div>
			{/each}
		</div>
		<div class="tokens out bg-white">
			{#each $tokens as token, index}
				<div class="token">
					<div class={`vector bg-gray-200`}></div>
				</div>
			{/each}
		</div>
	</div>
</div>

<style lang="scss">
	.embedding {
		.content {
			display: grid;
			grid-template-columns: auto repeat(4, minmax(3.5vw, 1fr));

			.embedding-detail {
				justify-content: start;
			}
			.tokens {
				.label {
					width: 5rem;
					flex-shrink: 0;
				}
				.vector {
					flex-shrink: 0;
				}
				.token-id {
					border-radius: 4px;
					text-align: center;
				}
			}
		}
	}
</style>

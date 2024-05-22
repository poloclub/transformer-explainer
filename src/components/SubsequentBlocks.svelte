<script lang="ts">
	import { tokens, modelMeta, isBoundingBoxActive } from '~/store';
	import classNames from 'classnames';
	import Operation from './Operation.svelte';

	export let className: string | undefined = undefined;
</script>

<div
	class={classNames('transformer-blocks', className)}
	role="group"
	on:mouseenter={() => {
		isBoundingBoxActive.set(true);
	}}
	on:mouseleave={() => {
		isBoundingBoxActive.set(false);
	}}
>
	<div class="title select-none">
		<div class="text" class:active={!$isBoundingBoxActive}>
			Transformer Block &times; {$modelMeta.layer_num}
		</div>
	</div>
	<div class="content">
		<div class="tokens initial">
			{#each $tokens as token, index}
				<div class="token">
					<Operation type="residual-end" head={index === 0} />
					<Operation type="ln" />
					<div class={`vector bg-blue-200`}></div>
				</div>
			{/each}
		</div>
		<div class=""></div>
		<div class="tokens final">
			{#each $tokens as token, index}
				<div class="token">
					<div
						class={classNames(`vector shrink-0 bg-blue-200`, {
							last: index === $tokens.length - 1
						})}
					></div>
					<span class="label float-right">{token}</span>
				</div>
			{/each}
		</div>
	</div>
</div>

<style lang="scss">
	.transformer-blocks {
		.title {
			align-items: center;
			padding-right: 1rem;

			.text {
				transition: opacity 0.5s;
				opacity: 0;
				&.active {
					opacity: 1;
				}
			}
		}
		.content {
			display: grid;
			grid-template-columns: repeat(3, minmax(2vw, 1fr));
		}
		.tokens.initial .token {
			gap: 0.6rem;
		}
	}
</style>

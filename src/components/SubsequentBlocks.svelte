<script lang="ts">
	import { tokens, modelMeta } from '~/store';
	import classNames from 'classnames';

	export let className: string | undefined = undefined;
</script>

<div class={classNames('transformer-blocks', className)}>
	<div class="title">Transformer Blocks (2 ~ {$modelMeta.layer_num})</div>
	<div class="content">
		<div class="tokens initial">
			{#each $tokens as token, index}
				<div class="token">
					<span class="label float">{token}</span>
					<div class={`vector bg-blue-200`}></div>
				</div>
			{/each}
		</div>
		<div class="tokens final">
			{#each $tokens as token, index}
				<div
					class={classNames(`vector bg-blue-200`, {
						last: index === $tokens.length - 1
					})}
				></div>
			{/each}
		</div>
	</div>
</div>

<style lang="scss">
	.transformer-blocks {
		.content {
			display: grid;
			grid-template-columns: repeat(4, minmax(3.5vw, 1fr));
		}
	}
</style>

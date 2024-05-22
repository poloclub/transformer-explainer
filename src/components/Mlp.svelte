<script lang="ts">
	import { tokens, isBoundingBoxActive, modelMeta } from '~/store';
	import classNames from 'classnames';
	import { setContext } from 'svelte';
	import Operation from './Operation.svelte';

	export let className: string | undefined = undefined;

	setContext('block-id', 'mlp');
</script>

<div class={classNames('mlp', className)}>
	<div class="title">MLP</div>
	<div class="content relative">
		<div class="bounding" class:active={$isBoundingBoxActive}></div>
		<div class="tokens initial">
			{#each $tokens as token, index}
				<div class="token">
					<span class="label float">{token}</span>
					<div class={`vector flex flex-col  bg-purple-200`}>
						<div class="sub-vector x1-12 head1"></div>
						<div class="sub-vector head-rest grow"></div>
					</div>
					<Operation type="dropout" />
					<Operation type="residual-end" head={index === 0} />
					<Operation type="ln" />
					<Operation type="residual-start" head={index === 0} />
				</div>
			{/each}
		</div>
		<div class="tokens projections">
			{#each $tokens as token, index}
				<div class="token">
					<div class={`vector x4 bg-indigo-200`}></div>
				</div>
			{/each}
		</div>
	</div>
</div>

<style lang="scss">
	.mlp {
		.bounding {
			border-radius: 0 10px 10px 0;
			padding-right: 2.5rem;
			right: -2.5rem;
			border-left: none;
		}
		.content {
			display: grid;
			grid-template-columns: repeat(6, minmax(3.5vw, 1fr));

			.initial {
				grid-column: span 3;
			}
			.tokens.initial .token {
				gap: 0.6rem;
			}
			.tokens.projections {
				margin-left: 1.2rem;
			}
		}
	}
</style>

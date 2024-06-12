<script lang="ts">
	import { tokens, isBoundingBoxActive, modelMeta } from '~/store';
	import classNames from 'classnames';
	import { setContext } from 'svelte';
	import Operation from './Operation.svelte';

	export let className: string | undefined = undefined;

	setContext('block-id', 'mlp');

	const firstLayerlColor = 'bg-purple-200';
	const secondLayerColor = 'bg-indigo-200';
	const outputColor = 'bg-blue-200';
</script>

<div class={classNames('mlp', className)}>
	<div class="title">MLP</div>
	<div class="content relative">
		<div class="bounding" class:active={$isBoundingBoxActive}></div>
		<div class="layer first-layer flex">
			<div class="column initial">
				{#each $tokens as token, index}
					<div class="cell" class:last={index === $tokens.length - 1}>
						<span class="label float">{token}</span>
						<div class={`vector flex flex-col  ${firstLayerlColor}`}>
							<div class="sub-vector x1-12 head1"></div>
							<div class="sub-vector head-rest grow"></div>
						</div>
					</div>
				{/each}
			</div>
			<div class="column dropout">
				{#each $tokens as token, index}
					<div class="cell" class:last={index === $tokens.length - 1}>
						<Operation type="dropout" />
					</div>
				{/each}
			</div>
			<div class="column residual-end">
				{#each $tokens as token, index}
					<div class="cell" class:last={index === $tokens.length - 1}>
						<Operation type="residual-end" head={index === 0} />
					</div>
				{/each}
			</div>
			<div class="column ln">
				{#each $tokens as token, index}
					<div class="cell" class:last={index === $tokens.length - 1}>
						<Operation type="ln" />
					</div>
				{/each}
			</div>
			<div class="column residual-start">
				{#each $tokens as token, index}
					<div class="cell" class:last={index === $tokens.length - 1}>
						<Operation type="residual-start" head={index === 0} />
					</div>
				{/each}
			</div>
		</div>
		<div class="layer second-layer flex justify-between">
			<div class="column projections">
				{#each $tokens as token, index}
					<div
						class={classNames('cell x4', { small: index !== 0 && index !== $tokens.length - 1 })}
						class:last={index === $tokens.length - 1}
					>
						<div class={classNames(`vector x4 ${secondLayerColor} opacity-60`)}></div>
					</div>
				{/each}
			</div>
			<div class="ouputs flex">
				<div class="column residual-end">
					{#each $tokens as token, index}
						<div class="cell" class:last={index === $tokens.length - 1}>
							<Operation type="residual-end" head={index === 0} />
						</div>
					{/each}
				</div>
				<div class="column ln">
					{#each $tokens as token, index}
						<div class="cell" class:last={index === $tokens.length - 1}>
							<Operation type="ln" />
						</div>
					{/each}
				</div>
				<div class="column out">
					{#each $tokens as token, index}
						<div class="cell" class:last={index === $tokens.length - 1}>
							<div class={`vector ${outputColor}`}></div>
						</div>
					{/each}
				</div>
			</div>
		</div>
	</div>
</div>

<style lang="scss">
	.mlp {
		.bounding {
			border-radius: 0 10px 10px 0;
			padding-right: 0.5rem;
			right: -0.5rem;
			border-left: none;
		}
		.content {
			display: grid;
			grid-template-columns: repeat(4, minmax(3vw, 1fr));

			.layer {
				grid-column: span 2;
			}
			.tokens.initial .token {
				/* gap: 0.6rem; */
			}
		}
	}
	// .layer {
	// 	height: 500px;
	// 	display: flex;
	// 	align-items: center;
	// }
	// :global(.transformer-blocks .final) {
	// 	height: 500px !important;
	// 	display: flex !important;
	// 	align-items: center !important;
	// 	justify-content: center;
	// }
	// .projections {
	// 	.small {
	// 		height: 2px !important;

	// 		.vector {
	// 			height: 2px !important;
	// 		}
	// 	}
	// }
</style>

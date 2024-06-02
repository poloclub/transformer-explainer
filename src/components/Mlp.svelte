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
		<div class="layer first-layer flex">
			<div class="tokens initial">
				{#each $tokens as token, index}
					<div class="token">
						<span class="label float">{token}</span>
						<div class={`vector flex flex-col  bg-purple-200`}>
							<div class="sub-vector x1-12 head1"></div>
							<div class="sub-vector head-rest grow"></div>
						</div>
					</div>
				{/each}
			</div>
			<div class="tokens dropout">
				{#each $tokens as token, index}
					<div class="token">
						<Operation type="dropout" />
					</div>
				{/each}
			</div>
			<div class="tokens residual-end">
				{#each $tokens as token, index}
					<div class="token">
						<Operation type="residual-end" head={index === 0} />
					</div>
				{/each}
			</div>
			<div class="tokens ln">
				{#each $tokens as token, index}
					<div class="token">
						<Operation type="ln" />
					</div>
				{/each}
			</div>
			<div class="tokens residual-start">
				{#each $tokens as token, index}
					<div class="token">
						<Operation type="residual-start" head={index === 0} />
					</div>
				{/each}
			</div>
		</div>
		<div class="layer second-layer flex justify-between">
			<div class="tokens projections">
				{#each $tokens as token, index}
					<div class="token">
						<div class={`vector x4 bg-indigo-200`}></div>
					</div>
				{/each}
			</div>
			<div class="flex">
				<div class="tokens residual-end">
					{#each $tokens as token, index}
						<div class="token">
							<Operation type="residual-end" head={index === 0} />
						</div>
					{/each}
				</div>
				<div class="tokens ln">
					{#each $tokens as token, index}
						<div class="token">
							<Operation type="ln" />
						</div>
					{/each}
				</div>
				<div class="tokens out">
					{#each $tokens as token, index}
						<div class="token">
							<div class={`vector bg-blue-200`}></div>
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
			grid-template-columns: repeat(8, minmax(3vw, 1fr));

			.layer {
				grid-column: span 4;
			}
			.tokens.initial .token {
				/* gap: 0.6rem; */
			}
		}
	}
</style>

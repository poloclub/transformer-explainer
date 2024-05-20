<script lang="ts">
	import { tokens } from '~/store';
	import classNames from 'classnames';

	export let className: string | undefined = undefined;
</script>

<div class={classNames('mlp', className)}>
	<div class="title">MLP</div>
	<div class="content">
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
		<div class="tokens projections">
			{#each $tokens as token, index}
				<div class={`vector x4 bg-indigo-200`}></div>
			{/each}
		</div>
	</div>
</div>

<style lang="scss">
	.mlp {
		.content {
			display: grid;
			grid-template-columns: repeat(6, minmax(3.5vw, 1fr));

			.tokens {
				grid-column: span 3;
			}
		}
	}
</style>

<script lang="ts">
	import { tokens } from '~/store';
	import classNames from 'classnames';
	import { setContext } from 'svelte';

	export let className: string | undefined = undefined;

	setContext('block-id', 'linearSoftmax');
</script>

<div class={classNames('linear-softmax', className)}>
	<div class="title">Linear · Softmax</div>
	<div class="content">
		<div class="logit"></div>
		<div class="tokens">
			<div class={`vector vocab bg-gray-200`}></div>
		</div>
	</div>
</div>

<style lang="scss">
	.linear-softmax {
		.title {
			align-items: end;
			padding-right: 1rem;
		}
		.content {
			display: grid;
			grid-template-columns: repeat(6, minmax(2vw, 1fr));

			.tokens {
				grid-column-start: 4;
			}
		}
	}
</style>

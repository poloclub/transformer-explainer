<script lang="ts">
	import { tokens } from '~/store';
	import classNames from 'classnames';

	export let className: string | undefined = undefined;
</script>

<div class={classNames('linear-softmax', className)}>
	<div class="title">Linear · Softmax</div>
	<div class="content">
		<div class="tokens">
			<div class={`vector vocab bg-gray-200`}></div>
		</div>
	</div>
</div>

<style lang="scss">
	.linear-softmax {
		.content {
			display: grid;
			grid-template-columns: repeat(2, minmax(3.5vw, 1fr));
		}
	}
</style>

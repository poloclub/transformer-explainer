<script lang="ts">
	import type { PopoverProps } from 'flowbite-svelte/Popover.svelte';
	import CommonPopover from './CommonPopover.svelte';

	export let offset: PopoverProps['offset'] = undefined;
	export let className: PopoverProps['class'] = undefined;
	export let triggeredBy: PopoverProps['triggeredBy'] = undefined;
	export let trigger: PopoverProps['trigger'] = undefined;
	export let placement: PopoverProps['placement'] = undefined;
	export let reference: PopoverProps['reference'];
</script>

<CommonPopover
	className="residual-popover"
	title="残差连接"
	{offset}
	{triggeredBy}
	{trigger}
	{placement}
	{reference}
	goTo="article-residual"
>
	<div class="residual-content">
		添加跳过连接以实现更好的梯度流
	</div></CommonPopover
>

<style lang="scss">
	:global(.residual-popover) {
		width: 12rem !important;
		.residual-content {
			font-size: 0.8rem;
		}
	}
</style>

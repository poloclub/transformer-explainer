<script lang="ts">
	import type { PopoverProps } from 'flowbite-svelte/Popover.svelte';
	import CommonPopover from './CommonPopover.svelte';

	export let offset: PopoverProps['offset'] = undefined;
	export let className: PopoverProps['class'] = undefined;
	export let triggeredBy: PopoverProps['triggeredBy'] = undefined;
	export let trigger: PopoverProps['trigger'] = undefined;
	export let placement: PopoverProps['placement'] = undefined;
</script>

<CommonPopover
	className="activation-popover"
	title="GELU 激活函数"
	{offset}
	{triggeredBy}
	{trigger}
	{placement}
	goTo="article-activation"
>
	<div class="activation-content">对线性变换结果施加非线性变换，使网络能够学习复杂模式。</div></CommonPopover
>

<style>
	.activation-content {
		width: 12rem;
	}
</style>

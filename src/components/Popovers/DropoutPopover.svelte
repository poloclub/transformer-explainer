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
	className="dropout-popover"
	title="随机失活（Dropout）"
	{offset}
	{triggeredBy}
	{trigger}
	{placement}
	goTo="article-dropout"
>
	<div class="dropout-content">训练时随机将部分输出置零；推理时关闭。</div></CommonPopover
>

<style lang="scss">
	.dropout-content {
		width: 12rem;
	}
</style>

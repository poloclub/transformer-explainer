<script lang="ts">
	import classNames from 'classnames';
	import { Popover } from 'flowbite-svelte';
	import type { PopoverProps } from 'flowbite-svelte/Popover.svelte';
	import { fade } from 'svelte/transition';
	import CommonPopover from './CommonPopover.svelte';

	export let offset: PopoverProps['offset'] = undefined;
	export let className: PopoverProps['class'] = undefined;
	export let triggeredBy: PopoverProps['triggeredBy'] = undefined;
	export let trigger: PopoverProps['trigger'] = undefined;
	export let placement: PopoverProps['placement'] = undefined;
</script>

<CommonPopover
	className="ln-popover"
	title="层归一化"
	{offset}
	{triggeredBy}
	{trigger}
	{placement}
	goTo="article-ln"
>
	<div class="ln-content w-[10rem]">
		标准化层输入以保持一致的平均值和方差
	</div></CommonPopover
>

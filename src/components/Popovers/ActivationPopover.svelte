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
	title="GELU Activation"
	{offset}
	{triggeredBy}
	{trigger}
	{placement}
	goTo="article-activation"
>
	<div class="activation-content">
		Applies non-linear transformation to linearly transformed output to learn complex patterns.
	</div></CommonPopover
>

<style>
	.activation-content {
		width: 12rem;
	}
</style>

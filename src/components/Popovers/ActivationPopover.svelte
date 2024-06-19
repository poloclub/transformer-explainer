<script lang="ts">
	import classNames from 'classnames';
	import { Popover } from 'flowbite-svelte';
	import type { PopoverProps } from 'flowbite-svelte/Popover.svelte';
	import { fade } from 'svelte/transition';

	export let offset: PopoverProps['offset'] = undefined;
	export let className: PopoverProps['class'] = undefined;
	export let triggeredBy: PopoverProps['triggeredBy'] = undefined;
	export let trigger: PopoverProps['trigger'] = 'hover';
	export let placement: PopoverProps['placement'] = 'right';
</script>

<Popover
	class={classNames('popover activation-popover text-sm', className)}
	title="GeLu Activation"
	{offset}
	{triggeredBy}
	{trigger}
	{placement}
	arrow={false}
	transition={fade}
	params={{ duration: 100 }}
>
	<div class="activation-content">
		The GELU (Gaussian Error Linear Unit) activation function combines linear and non-linear
		behavior by scaling inputs using the Gaussian cumulative distribution function. It retains small
		negative values for smoother gradients and is effective in models like BERT.
	</div></Popover
>

<style>
	.activation-content {
		width: 20rem;
	}
</style>

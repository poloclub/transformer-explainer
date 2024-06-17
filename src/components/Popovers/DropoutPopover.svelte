<script lang="ts">
	import classNames from 'classnames';
	import { Popover } from 'flowbite-svelte';
	import type { PopoverProps } from 'flowbite-svelte/Popover.svelte';

	export let offset: PopoverProps['offset'] = undefined;
	export let className: PopoverProps['class'] = undefined;
	export let triggeredBy: PopoverProps['triggeredBy'] = undefined;
	export let trigger: PopoverProps['trigger'] = 'hover';
	export let placement: PopoverProps['placement'] = 'right';
</script>

<Popover
	class={classNames('popover dropout-popover text-sm', className)}
	title="Drop out"
	{offset}
	{triggeredBy}
	{trigger}
	{placement}
	arrow={false}
>
	<div class="dropout-content">Drop out is</div></Popover
>

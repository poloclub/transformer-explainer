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
	class={classNames('popover ln-popover text-sm', className)}
	title="Layer Normalization"
	{offset}
	{triggeredBy}
	{trigger}
	{placement}
	arrow={false}
	transition={fade}
	params={{ duration: 100 }}
>
	<div class="ln-content">Layer normalization is</div></Popover
>

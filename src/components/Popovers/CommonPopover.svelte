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
	export let title: PopoverProps['title'] = undefined;
	export let goTo: string | undefined = undefined;
	export let reference: PopoverProps['reference'] | undefined = undefined;

	function scrollToDiv(e) {
		e.stopPropagation();
		if (!goTo) return;
		const targetDiv = document.getElementById(goTo);
		if (targetDiv) {
			const targetPosition = targetDiv.getBoundingClientRect().top + window.scrollY;
			const offsetPosition = targetPosition - 50;
			window.scrollTo({
				top: offsetPosition,
				behavior: 'smooth'
			});
		}
	}
</script>

<Popover
	class={classNames('popover text-sm', className)}
	{title}
	{triggeredBy}
	{trigger}
	{placement}
	{reference}
	offset={1}
	arrow={false}
>
	<div class="content">
		<slot></slot>
		{#if goTo}
			<div class="more-btn mt-1 text-blue-600 hover:underline" on:click={scrollToDiv}>
				Read more
			</div>
		{/if}
	</div></Popover
>

<style lang="scss">
	.more-btn {
		cursor: pointer;
	}
</style>

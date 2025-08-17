<script lang="ts">
	import classNames from 'classnames';
	import { Popover } from 'flowbite-svelte';
	import type { PopoverProps } from 'flowbite-svelte/Popover.svelte';
	import { userId } from '~/store';
	import { onClickReadMore } from '~/utils/event';

	export let offset: PopoverProps['offset'] = undefined;
	export let className: PopoverProps['class'] = undefined;
	export let triggeredBy: PopoverProps['triggeredBy'] = undefined;
	export let trigger: PopoverProps['trigger'] = 'hover';
	export let placement: PopoverProps['placement'] = 'right';
	export let title: PopoverProps['title'] = undefined;
	export let goTo: string | undefined = undefined;
	export let reference: PopoverProps['reference'] | undefined = undefined;

	let startTime;
	const onShow = (e) => {
		startTime = e.timeStamp;
		window.dataLayer?.push({
			event: 'visibility-show',
			visible_name: `help-popover-${className}`,
			start_time: e.timeStamp,
			user_id: $userId
		});
	};
	const onHide = (e) => {
		window.dataLayer?.push({
			event: 'visibility-hide',
			visible_name: `help-popover-${className}`,
			end_time: e.timeStamp,
			visible_duration: e.timeStamp - (startTime || 0),
			user_id: $userId
		});
	};
</script>

<!-- bug: {triggeredBy} prop triggers show event twice -->
<Popover
	class={classNames('popover text-sm', className)}
	{title}
	{placement}
	{reference}
	offset={1}
	arrow={false}
	data-click={`popover-${className}`}
	on:show={(e) => {
		if (e.detail) {
			onShow(e);
		} else {
			onHide(e);
		}
	}}
>
	<div class="content">
		<slot></slot>
		{#if goTo}
			<div
				class="more-btn mt-1 text-blue-600 hover:underline"
				on:click={(e) =>
					onClickReadMore(e, goTo, {
						value: title
					})}
				data-click={`read-more-btn-${className}`}
			>
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

<script lang="ts">
	import { Popover } from 'flowbite-svelte';
	import { userId } from '~/store';
	import { onClickReadMore } from '~/utils/event';

	export let id: string;
	export let placement: string = 'bottom';
	export let goTo: string | undefined = undefined;
	export let textbook: string | undefined = undefined;

	let startTime;
	const onShow = (e) => {
		startTime = e.timeStamp;
		window.dataLayer?.push({
			event: 'visibility-show',
			visible_name: `help-popover-${id}`,
			start_time: e.timeStamp,
			user_id: $userId
		});
	};
	const onHide = (e) => {
		window.dataLayer?.push({
			event: 'visibility-hide',
			visible_name: `help-popover-${id}`,
			end_time: e.timeStamp,
			visible_duration: e.timeStamp - (startTime || 0),
			user_id: $userId
		});
	};
</script>

<div {id} class="help" data-click={`help-icon`}>
	<svg
		class="h-4 w-4 text-gray-300"
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 -960 960 960"
		fill="currentColor"
		><path
			d="M478-240q21 0 35.5-14.5T528-290q0-21-14.5-35.5T478-340q-21 0-35.5 14.5T428-290q0 21 14.5 35.5T478-240Zm-36-154h74q0-33 7.5-52t42.5-52q26-26 41-49.5t15-56.5q0-56-41-86t-97-30q-57 0-92.5 30T342-618l66 26q5-18 22.5-39t53.5-21q32 0 48 17.5t16 38.5q0 20-12 37.5T506-526q-44 39-54 59t-10 73Zm38 314q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Z"
		/></svg
	>
</div>
<Popover
	triggeredBy={`#${id}`}
	{placement}
	class="help popover"
	data-click={`help-popover-${id}`}
	on:show={(e) => {
		if (e.detail) {
			onShow(e);
		} else {
			onHide(e);
		}
	}}
	><div class="help-content">
		<slot />
		{#if textbook}
			<div class="textbook-link">
				<a
					href={`https://transformer-explainer.github.io/textbook/${textbook}`}
					target="_blank"
					data-click={`textbook-link-${id}`}
					class="text-blue-600 hover:underline"
				>
					Open Textbook
				</a>
			</div>
		{/if}
		{#if goTo}
			<div
				data-click={`read-more-btn-${id}`}
				class="more-btn mt-1 text-blue-600 hover:underline"
				on:click={(e) => onClickReadMore(e, goTo, { value: id })}
			>
				Read more
			</div>
		{/if}
	</div></Popover
>

<style lang="scss">
	.help-content {
		text-align: left !important;
		white-space: pre;
		line-height: 1.2;
		font-weight: 400;
		font-size: 0.8rem;
	}
	.more-btn {
		cursor: pointer;
	}
</style>

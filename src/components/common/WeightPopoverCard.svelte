<script lang="ts">
	import { Card } from 'flowbite-svelte';
	import { CloseOutline } from 'flowbite-svelte-icons';
	import { onDestroy, onMount } from 'svelte';
	import { userId, weightPopover } from '~/store';

	export let id: string;
	export let title: string;
	export let className: string | undefined = undefined;
	export let isAnimationActive: boolean = false;
	export let timeline;
	export let isOpen: boolean = true;

	let startTime;

	onMount(() => {
		startTime = performance.now();
		window.dataLayer?.push({
			event: 'visibility-show',
			visible_name: `weight-popover-${id}`,
			start_time: startTime,
			user_id: $userId
		});
	});
	onDestroy(() => {
		let endTime = performance.now();
		let visibleDuration = endTime - startTime;

		window.dataLayer?.push({
			event: 'visibility-hide',
			visible_name: `weight-popover-${id}`,
			end_time: endTime,
			visible_duration: visibleDuration,
			user_id: $userId
		});
	});
</script>

<Card
	class={`weight-popover-card popover bg-white text-sm font-light text-gray-500 ${className}`}
	data-click="weight-popover"
	on:click={(e) => {
		e.stopPropagation();
	}}
>
	<div
		class="weight-popover-title rounded-t-md border-b border-gray-200 bg-gray-100 px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
	>
		<h3 class="font-semibold text-gray-900">{title}</h3>
		<div class="controls">
			{#if isAnimationActive}
				<button
					class="play-control forward"
					data-click="matrix-calc-forward-btn"
					on:click={(e) => {
						e.stopPropagation();
						timeline.progress(1);
						isAnimationActive = false;
					}}
					><svg
						class="h-5 w-5 text-gray-500"
						aria-hidden="true"
						xmlns="http://www.w3.org/2000/svg"
						width="24"
						height="24"
						fill="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							fill-rule="evenodd"
							d="M17 6a1 1 0 1 0-2 0v4L8.6 5.2A1 1 0 0 0 7 6v12a1 1 0 0 0 1.6.8L15 14v4a1 1 0 1 0 2 0V6Z"
							clip-rule="evenodd"
						/>
					</svg>
				</button>
			{:else}
				<button
					class="play-control restart"
					data-click="matrix-calc-restart-btn"
					on:click={(e) => {
						e.stopPropagation();
						isAnimationActive = true;
						timeline.restart();
					}}
				>
					<svg
						class="h-5 w-5 text-gray-500"
						aria-hidden="true"
						xmlns="http://www.w3.org/2000/svg"
						width="24"
						height="24"
						fill="none"
						viewBox="0 0 24 24"
					>
						<path
							stroke="currentColor"
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M17.651 7.65a7.131 7.131 0 0 0-12.68 3.15M18.001 4v4h-4m-7.652 8.35a7.13 7.13 0 0 0 12.68-3.15M6 20v-4h4"
						/>
					</svg></button
				>
			{/if}
			<button
				class="close"
				data-click="matrix-calc-close-btn"
				on:click={(e) => {
					e.stopPropagation();
					weightPopover.set(null);
					isOpen = false;
				}}><CloseOutline class="h-5 w-5 text-gray-500" /></button
			>
		</div>
	</div>
	<div class="content">
		<slot />
	</div>
</Card>

<style lang="scss">
	:global(.weight-popover-card) {
		width: max-content !important;
		max-width: none !important;
		padding: 0 !important;
		display: flex;
		flex-direction: column;
	}

	.weight-popover-title {
		flex-shrink: 0;
		display: flex;
		align-items: center;
		gap: 1rem;
		justify-content: space-between;
	}
	.content {
		width: 100%;

		:global(.formula) {
			position: relative;

			:global(.first-row) {
				opacity: 1;
				width: 100%;
				position: absolute;
			}
			:global(.total) {
				opacity: 0;
			}
			:global(.katex-html) {
				font-size: 0.9rem;
			}
		}
	}
	.controls {
		display: flex;
		gap: 0.5rem;
	}

	:global(.weight-popover-content) {
		padding: 3rem 2rem 1.5rem 1rem;
		width: 100%;

		:global(.tokens) {
			padding-right: 0.3rem;
			display: flex;
			flex-direction: column;
		}

		:global(.token-label) {
			font-size: 0.8rem;
			line-height: 1;
			text-align: right;
			color: theme('colors.gray.500');
		}

		:global(.matrix) {
			height: 100%;
			position: relative;
			justify-content: space-around;

			:global(.title),
			:global(.size) {
				color: theme('colors.gray.900');
				font-size: 0.8rem;
				white-space: nowrap;
				position: absolute;
			}
			:global(.size) {
				bottom: -1.5rem;
			}

			:global(.title) {
				line-height: 1.2;
				text-align: center;
				bottom: calc(100% + 1rem);
			}
		}
		:global(.operator) {
			padding: 0 0.5rem;
			font-size: 1.2rem;
			color: black;
			opacity: 0.8;
		}
	}
</style>

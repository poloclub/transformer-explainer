<script lang="ts">
	import { onMount } from 'svelte';
	import QkvWeightPopover from './Popovers/QKVWeightPopover.svelte';
	import { hoveredPath } from '~/store';
	import { fade } from 'svelte/transition';

	let resizeObserver: ResizeObserver;
	let qkvPos = { left: 0, top: 0 };
	let isHovered = false;

	onMount(() => {
		const setPosition = () => {
			const scrollLeft = window.scrollX;
			const topbarHeight = document.querySelector('.top-bar')?.offsetHeight;

			const embedding = document.querySelector('.step.embedding .content');
			const rect = embedding.getBoundingClientRect();

			qkvPos = { left: rect.right + scrollLeft, top: rect.top - topbarHeight };
		};

		setPosition();

		resizeObserver = new ResizeObserver((entries) => {
			setPosition();
		});
		const elements = document?.querySelectorAll('.resize-watch');
		elements.forEach((el) => resizeObserver.observe(el));

		return () => {
			resizeObserver.disconnect();
		};
	});
</script>

{#if $hoveredPath === 'embedding' || isHovered}
	<div
		class="qkv-weight-popover"
		style={`left:${qkvPos.left}px;top:${qkvPos.top}px;`}
		in:fade={{ duration: 300 }}
		on:mouseenter={() => {
			isHovered = true;
		}}
		on:mouseleave={() => {
			isHovered = false;
		}}
		role="group"
	>
		<QkvWeightPopover></QkvWeightPopover>
	</div>
{/if}

<style lang="scss">
	.qkv-weight-popover {
		z-index: 999;
		position: absolute;
		// top: 0;
		// bottom: 50%;
		transform: translateX(1rem);
	}
</style>

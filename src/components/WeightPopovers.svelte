<script lang="ts">
	import { onMount } from 'svelte';
	import QkvWeightPopover from './Popovers/QKVWeightPopover.svelte';
	import { hoveredPath } from '~/store';
	import { fade } from 'svelte/transition';

	let resizeObserver: ResizeObserver;
	let qkvPos = { left: 0, top: 0 };
	let mlpPos = { left: 0, top: 0 };
	let isHovered = false;

	onMount(() => {
		const setPosition = () => {
			const scrollLeft = window.scrollX;
			const topbarHeight = document.querySelector('.top-bar')?.offsetHeight;

			const embedding = document.querySelector('.step.embedding .content');
			const mlp = document.querySelector('.step.mlp .content');

			const embeddingRect = embedding.getBoundingClientRect();
			const mlpRect = mlp.getBoundingClientRect();

			qkvPos = { left: embeddingRect.right + scrollLeft, top: embeddingRect.top - topbarHeight };
			mlpPos = { left: mlpRect.left + scrollLeft, top: mlpRect.top - topbarHeight };
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
		class="qkv-weight-popover weight-popover"
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

<!-- {#if $hoveredPath === 'mlp' || isHovered}
	<div
		class="mlp-weight-popover weight-popover"
		style={`left:${mlpPos.left}px;top:${mlpPos.top}px;`}
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
{/if} -->

<style lang="scss">
	.weight-popover {
		z-index: 999;
		position: absolute;
	}
	.qkv-weight-popover {
		transform: translateX(1rem);
	}
	.mlp-weight-popover {
		transform: translateX(calc(-100% - 0.5rem));
	}
</style>

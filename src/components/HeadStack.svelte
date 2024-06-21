<script lang="ts">
	import { modelMeta, headGap } from '~/store';
	import classNames from 'classnames';
	import { onMount } from 'svelte';

	let headContent: HTMLDivElement;
	let headBlockSize = { width: 0, height: 0 };
	let opacityOffset = 0.1;

	onMount(() => {
		const resizeObserver = new ResizeObserver((entries) => {
			for (let entry of entries) {
				const { width, height } = entry.contentRect;
				headBlockSize = {
					width,
					height
				};
			}
		});
		resizeObserver.observe(headContent);

		return () => {
			resizeObserver.unobserve(headContent);
		};
	});
</script>

<div class="multi-head flex w-full">
	{#each Array($modelMeta.attention_head_num + 1).fill(0) as _, index}
		{#if index === 0}
			<div class={'first-head-content'} bind:this={headContent}>
				<slot></slot>
			</div>
		{:else}
			<div
				class={'rest absolute'}
				class:first={index === 1}
				style={`transform:translate(${index * headGap.x}px,${index * headGap.y}px) scale(${1 - headGap.scale * index}); 
      z-index: ${$modelMeta.attention_head_num - index};opacity:${Math.max(0.1, 1 - index * opacityOffset)};`}
			>
				<div
					class="card"
					style={`width: ${headBlockSize.width}px; height: ${headBlockSize.height}px;`}
				></div>
			</div>
		{/if}
	{/each}
</div>

<style lang="scss">
	.multi-head {
		position: relative;
	}
	.first-head-content {
		width: 100%;
		z-index: 200;
	}
	.card {
		background-color: white;
		border: 1px solid #f9fafb;
		box-shadow:
			0px 4px 6px -1px rgba(3, 7, 18, 0.15),
			0px 2px 4px -2px rgba(3, 7, 18, 0.08);
	}
</style>

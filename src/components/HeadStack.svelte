<script lang="ts">
	import { modelMeta } from '~/store';
	import classNames from 'classnames';
	import { onMount } from 'svelte';

	let headContent: HTMLDivElement;
	let headBlockSize = { width: 0, height: 0 };
	let headGap = { x: 5, y: 8, scale: 0 };
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

	let blocks: HTMLDivElement[] = [];
</script>

<div class="multi-head flex w-full">
	{#each Array($modelMeta.attention_head_num).fill(0) as _, index}
		<div
			bind:this={blocks[index]}
			class={classNames('head-container', {
				rest: index !== 0,
				absolute: index !== 0,
				'w-full': index === 0
			})}
			style={`transform:translate(${index * headGap.x}px,${index * headGap.y}px) scale(${1 - headGap.scale * index}); 
      z-index: ${$modelMeta.attention_head_num - index};opacity:${Math.max(0.1, 1 - index * opacityOffset)};`}
		>
			{#if index === 0}
				<div class="w-full" bind:this={headContent}>
					<div class="">
						<slot></slot>
					</div>
					<div class="title text-right text-gray-400">
						Head {index + 1} of {$modelMeta.attention_head_num}
					</div>
				</div>
			{:else}
				<div
					class=""
					style={`width: ${headBlockSize.width}px; height: ${headBlockSize.height}px;`}
				></div>
			{/if}
		</div>
	{/each}
</div>

<style lang="scss">
	.head-container {
		background-color: white;
		border: 1px solid #f9fafb;
		box-shadow:
			0px 4px 6px -1px rgba(0, 0, 0, 0.1),
			0px 2px 4px -2px rgba(0, 0, 0, 0.05);
	}
</style>

<script lang="ts">
	import { kvCache, promptTokenCount } from '~/store/kvcache';
	import { attentionHeadIdx } from '~/store';
	import VectorCanvas from '~/components/common/VectorCanvas.svelte';
	import { afterUpdate } from 'svelte';
	import { gsap } from '~/utils/gsap';

	let prevLength = 0;
	let rowEls: (HTMLElement | null)[] = [];

	afterUpdate(() => {
		const currentLength = $kvCache.length;
		if (currentLength > prevLength) {
			const newRow = rowEls[currentLength - 1];
			if (newRow) {
				gsap.from(newRow, { opacity: 0, y: 6, duration: 0.35, ease: 'power2.out' });
			}
		}
		prevLength = currentLength;
	});
</script>

<div class="kv-table">
	<div class="kv-header">
		<span class="col-token"></span>
		<span class="col-vec-label">K</span>
		<span class="col-vec-label">V</span>
	</div>
	{#if $kvCache.length === 0}
		<div class="kv-empty">Run prefill then click Next →</div>
	{:else}
		{#each $kvCache as entry, i}
			<div
				class="kv-row"
				class:is-prompt={i < $promptTokenCount}
				bind:this={rowEls[i]}
			>
				<span class="col-token" title={entry.token}>{entry.token}</span>
				<div class="col-vec-container">
					<VectorCanvas
						data={entry.keys[$attentionHeadIdx] ?? entry.keys[0] ?? []}
						colorScale="red"
						active={true}
					/>
				</div>
				<div class="col-vec-container">
					<VectorCanvas
						data={entry.values[$attentionHeadIdx] ?? entry.values[0] ?? []}
						colorScale="green"
						active={true}
					/>
				</div>
			</div>
		{/each}
	{/if}
</div>

<style lang="scss">
	.kv-table {
		display: flex;
		flex-direction: column;
		gap: 2px;
		padding: 0.5rem;
		font-size: 0.75rem;
		max-height: 280px;
		overflow-y: auto;
	}

	.kv-header,
	.kv-row {
		display: grid;
		grid-template-columns: 5rem 28px 28px;
		align-items: center;
		gap: 4px;
	}

	.kv-header {
		color: theme('colors.gray.400');
		padding-bottom: 2px;
		border-bottom: 1px solid theme('colors.gray.100');
		margin-bottom: 2px;
	}

	.col-vec-label {
		text-align: center;
	}

	.col-token {
		color: theme('colors.gray.600');
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.kv-row.is-prompt .col-token {
		color: theme('colors.gray.400');
	}

	.col-vec-container {
		position: relative;
		width: 24px;
		height: 48px;
		flex-shrink: 0;
	}

	.kv-empty {
		color: theme('colors.gray.400');
		font-size: 0.7rem;
		padding: 0.5rem 0;
	}
</style>

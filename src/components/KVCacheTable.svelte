<script lang="ts">
	import { kvCache, promptTokenCount } from '~/store/kvcache';
	import { attentionHeadIdx } from '~/store';
	import VectorCanvas from '~/components/common/VectorCanvas.svelte';
	import { afterUpdate } from 'svelte';
	import { gsap } from '~/utils/gsap';

	let prevLength = 0;
	let colEls: (HTMLElement | null)[] = [];

	afterUpdate(() => {
		const currentLength = $kvCache.length;
		if (currentLength > prevLength) {
			const newCol = colEls[currentLength - 1];
			if (newCol) {
				gsap.from(newCol, { opacity: 0, x: 6, duration: 0.35, ease: 'power2.out' });
			}
		}
		prevLength = currentLength;
	});
</script>

{#if $kvCache.length > 0}
	<div class="kv-table">
		<!-- Row labels: K / V -->
		<div class="row-labels">
			<span class="row-spacer"></span>
			<span class="row-label k-label">K</span>
			<span class="row-label v-label">V</span>
		</div>
		<!-- One column per cached token -->
		<div class="kv-cols-wrap">
			{#each $kvCache as entry, i}
				<div
					class="kv-col"
					class:is-prompt={i < $promptTokenCount}
					bind:this={colEls[i]}
				>
					<span class="token-label" title={entry.token}>{entry.token}</span>
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
		</div>
	</div>
{/if}

<style lang="scss">
	.kv-table {
		display: flex;
		flex-direction: row;
		align-items: flex-start;
		gap: 3px;
		font-size: 0.7rem;
		overflow-x: auto;
		padding-bottom: 2px;
	}

	/* Left-side row labels: K / V */
	.row-labels {
		display: flex;
		flex-direction: column;
		align-items: center;
		flex-shrink: 0;
		gap: 2px;

		.row-spacer {
			/* matches token-label height */
			height: 2rem;
		}

		.row-label {
			height: 48px;
			display: flex;
			align-items: center;
			font-weight: 600;
			font-size: 0.7rem;
		}

		.k-label {
			color: theme('colors.red.500');
		}

		.v-label {
			color: theme('colors.green.600');
		}
	}

	/* Scrollable column strip */
	.kv-cols-wrap {
		display: flex;
		flex-direction: row;
		gap: 3px;
		overflow-x: auto;
	}

	/* One column per token */
	.kv-col {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 2px;
		flex-shrink: 0;

		.token-label {
			writing-mode: vertical-lr;
			transform: rotate(180deg);
			height: 2rem;
			font-size: 0.65rem;
			color: theme('colors.gray.600');
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
		}

		&.is-prompt .token-label {
			color: theme('colors.gray.400');
		}
	}

	.col-vec-container {
		position: relative;
		width: 24px;
		height: 48px;
		flex-shrink: 0;
	}
</style>

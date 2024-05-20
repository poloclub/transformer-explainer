<script lang="ts">
	import { expandedBlock, cellHeight, cellWidth, highlightedToken, tokens, rowGap } from '~/store';
	import classNames from 'classnames';
	import Matrix from '~/components/Matrix.svelte';
	import { gsap } from '~/utils/gsap';
	import { mask } from '~/utils/array';
	import { setContext, getContext } from 'svelte';
	import WeightPopover from '~/components/WeightPopover.svelte';
	import { attentionOutput, masked, qk } from '~/utils/data';

	export let data: any;

	let rem = 12;
	$: cellSize = Math.max((1 / $tokens.length) * rem * 8, 10);

	let attentionQK: HTMLDivElement;
	let attentionMask: HTMLDivElement;
	let attentionSoftmax: HTMLDivElement;
	let attentionResult: HTMLDivElement;

	let attentionMatrixWidth = 0;

	let isAttentionExpanded = false;
	// const blockId = getContext('block-id');

	// $: if ($expandedBlock.id !== blockId) {
	// 	isAttentionExpanded = false;
	// 	collapseAttention();
	// }

	const onClickAttention = () => {
		isAttentionExpanded = !isAttentionExpanded;
		if (isAttentionExpanded) {
			// expandedBlock.set({ id: blockId });
			expandAttention();
		} else {
			collapseAttention();
		}
	};

	let expandTl = gsap.timeline();
	const expandAttention = () => {
		expandTl.to(attentionResult, {
			opacity: 0,
			display: 'none',
			duration: 0.2
		});

		// show QK
		expandTl
			.set(attentionQK, {
				width: 'auto',
				display: 'flex',
				opacity: 0
			})
			.to(attentionQK, {
				opacity: 1,
				duration: 0.5
			});

		// show Masked
		expandTl
			.set(attentionMask, { width: 0, x: attentionMatrixWidth * -1, opacity: 0 })
			.to(attentionMask, {
				opacity: 1,
				display: 'flex',
				width: attentionMatrixWidth,
				x: 0,
				duration: 0.5
			});

		// show Softmaxed
		expandTl
			.set(attentionSoftmax, { width: 0, x: attentionMatrixWidth * -1, opacity: 0 })
			.to(attentionSoftmax, {
				opacity: 1,
				display: 'flex',
				width: attentionMatrixWidth,
				x: 0,
				duration: 0.5
			});
	};

	let collapseTl = gsap.timeline();
	const collapseAttention = () => {
		collapseTl.to([attentionQK, attentionMask, attentionSoftmax], {
			opacity: 0,
			display: 'none',
			width: 0,
			duration: 0.5
		});

		collapseTl.to(
			attentionResult,
			{
				opacity: 1,
				display: 'flex',
				duration: 0.5
			},
			0
		);
	};
</script>

<div class="flex items-center gap-8 px-10">
	<!-- <WeightPopover triggeredBy={'#key-container'} title={'Key Calculation'} {data} /> -->
	<div
		role="button"
		tabindex="0"
		class={classNames('attention-matrix-container relative flex gap-3 p-3 pb-1', {
			active: isAttentionExpanded
		})}
		on:click={onClickAttention}
		on:keydown={onClickAttention}
	>
		<div
			class={classNames('attention-matrix attention-qk flex flex-col items-center', {
				active: isAttentionExpanded
			})}
			bind:this={attentionQK}
		>
			<Matrix
				{data}
				showSize={false}
				cellHeight={cellSize}
				cellWidth={cellSize}
				rowGap={3}
				colGap={3}
				shape={'circle'}
				colorScale={'purple'}
			/>
			<div class="text-gray-400">QK<sup>T</sup></div>
		</div>
		<div
			class="attention-matrix attention-mask flex flex-col items-center"
			bind:this={attentionMask}
		>
			<Matrix
				{data}
				showSize={false}
				cellHeight={cellSize}
				cellWidth={cellSize}
				rowGap={3}
				colGap={3}
				shape={'circle'}
				colorScale={'purple'}
			/>
			<div class="text-gray-400">Mask</div>
		</div>

		<div
			class="attention-matrix attention-softmax flex flex-col items-center"
			bind:this={attentionSoftmax}
		>
			<Matrix
				{data}
				showSize={false}
				cellHeight={cellSize}
				cellWidth={cellSize}
				rowGap={3}
				colGap={3}
				showValue={true}
				shape={'circle'}
				colorScale={'purple'}
			/>
			<div class="text-gray-400">Softmax</div>
		</div>
		<div
			class={classNames('attention-matrix attention-result flex flex-col items-center', {
				active: !isAttentionExpanded
			})}
			bind:this={attentionResult}
			bind:offsetWidth={attentionMatrixWidth}
		>
			<Matrix
				{data}
				showSize={false}
				cellHeight={cellSize}
				cellWidth={cellSize}
				rowGap={3}
				colGap={3}
				showValue={false}
				shape={'circle'}
				colorScale={'purple'}
			/>
			<div class="text-gray-400">Attention</div>
		</div>
	</div>
</div>

<style lang="scss">
	.attention-matrix-container {
		cursor: pointer;
		border-radius: 0.5rem;
		transition: 0.2s background-color;

		&:hover {
			background-color: #f8fafc;
		}
	}

	.attention-matrix-container {
		.attention-qk,
		.attention-mask,
		.attention-softmax {
			display: none;
		}
	}
</style>

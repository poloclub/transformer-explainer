<script lang="ts">
	import { expandedBlock, tokens } from '~/store';
	import classNames from 'classnames';
	import Matrix from '~/components/Matrix.svelte';
	import { gsap } from '~/utils/gsap';
	import { mask } from '~/utils/array';
	import { getContext } from 'svelte';
	import WeightPopover from '~/components/WeightPopover.svelte';
	import { attentionOutput, masked, qk } from '~/utils/mock_data';

	export let data: any;

	let rem = 16;
	let maxCellSize = 20;
	let minCellSize = 10;
	$: cellSize = Math.min(maxCellSize, Math.max((1 / $tokens.length) * rem * 6, minCellSize));

	let attentionQK: HTMLDivElement;
	let attentionMask: HTMLDivElement;
	let attentionSoftmax: HTMLDivElement;
	let attentionResult: HTMLDivElement;

	let attentionMatrixWidth = 0;

	let isAttentionExpanded = false;

	const blockId = getContext('block-id');

	$: if ($expandedBlock.id !== blockId && isAttentionExpanded) {
		isAttentionExpanded = false;
		collapseAttention();
	}

	const onClickAttention = () => {
		isAttentionExpanded = !isAttentionExpanded;
		if (isAttentionExpanded) {
			expandedBlock.set({ id: blockId });
			expandAttention();
		} else {
			expandedBlock.set({ id: null });
			collapseAttention();
		}
	};

	let expandTl = gsap.timeline();
	let collapseTl = gsap.timeline();

	const expandAttention = () => {
		collapseTl.progress(1);

		const keyPaths = document.querySelectorAll('div.sankey g.attention path.key-to-attention');
		const queryPaths = document.querySelectorAll('div.sankey g.attention path.query-to-attention');
		const outPaths = document.querySelectorAll('div.sankey g.attention path.to-attention-out');

		[...keyPaths, ...queryPaths].forEach((path) => {
			const length = path.getTotalLength();
			path.style.strokeDasharray = length;
			path.style.strokeDashoffset = length;
		});

		const QKDuration = 1.2;
		const stagger = Number((QKDuration / $tokens.length).toFixed(2));

		expandTl.set(outPaths, { opacity: 0 });
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
			})
			.to(keyPaths, {
				strokeDashoffset: 0,
				stagger,
				duration: QKDuration,
				ease: 'power2.out'
				// ease: 'back.out(1.7)'
			})
			.to(
				queryPaths,
				{
					strokeDashoffset: 0,
					stagger,
					duration: QKDuration,
					// ease: 'back.out(1.7)'
					ease: 'power2.out'
				},
				'<'
			)
			.from(
				attentionQK.querySelectorAll('svg circle'),
				{
					scale: 0,
					transformOrigin: '50% 50%',
					opacity: 0,
					delay: QKDuration / $tokens.length,
					stagger: Number((QKDuration / Math.pow($tokens.length, 2)).toFixed(2)),
					ease: 'power2.out',
					// ease: 'back.out(1.7)',
					duration: QKDuration
				},
				'<'
			);

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

		expandTl.to(outPaths, { opacity: 0.4 });
	};

	const collapseAttention = () => {
		expandTl.progress(1);
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
				'attention-initial': isAttentionExpanded
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
				data={mask(data)}
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
			class={classNames('attention-matrix attention-softmax flex flex-col items-center', {
				'attention-out': isAttentionExpanded
			})}
			bind:this={attentionSoftmax}
		>
			<Matrix
				data={mask(data)}
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
				'attention-initial': !isAttentionExpanded,
				'attention-out': !isAttentionExpanded
			})}
			bind:this={attentionResult}
			bind:offsetWidth={attentionMatrixWidth}
		>
			<Matrix
				data={mask(data)}
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

		/* &:hover {
			background-color: #f8fafc;
		} */
	}

	.attention-matrix-container {
		.attention-qk,
		.attention-mask,
		.attention-softmax {
			display: none;
		}
	}
</style>

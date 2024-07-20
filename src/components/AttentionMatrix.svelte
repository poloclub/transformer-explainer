<script lang="ts">
	import { expandedBlock, tokens, modelData, rootRem } from '~/store';
	import classNames from 'classnames';
	import Matrix from '~/components/Matrix.svelte';
	import { gsap } from '~/utils/gsap';
	import { maskArray } from '~/utils/array';
	import { getContext, onMount } from 'svelte';
	import resolveConfig from 'tailwindcss/resolveConfig';
	import tailwindConfig from '../../tailwind.config';
	import * as d3 from 'd3';
	import Katex from '~/utils/Katex.svelte';
	import { Tooltip } from 'flowbite-svelte';
	import { ATTENTION_OUT } from '~/constants/opacity';

	const { theme } = resolveConfig(tailwindConfig);

	$: placeHolderData = Array($tokens.length)
		.fill(0)
		.map((col) => Array($tokens.length).fill(-Infinity));
	$: queryKey = $modelData?.outputs?.block_0_attn_head_0_attn?.data || placeHolderData;
	$: masked = $modelData?.outputs?.block_0_attn_head_0_attn_masked?.data || placeHolderData;
	$: softmaxed = $modelData?.outputs?.block_0_attn_head_0_attn_dropout?.data || placeHolderData;

	let factor = 1; //todo
	let maxCellSize = 20 * factor;
	let minCellSize = 10 * factor;
	$: cellSize = Math.min(
		maxCellSize,
		Math.max((1 / $tokens.length) * rootRem * 6 * factor, minCellSize)
	);

	let attentionQK: HTMLDivElement;
	let attentionMask: HTMLDivElement;
	let attentionSoftmax: HTMLDivElement;
	let attentionResult: HTMLDivElement;

	let attentionMatrixWidth = 0;

	let isAttentionExpanded = false;

	const blockId = getContext('block-id');

	// event handling

	$: if ($expandedBlock.id !== blockId && isAttentionExpanded) {
		isAttentionExpanded = false;
		collapseAttention();
	}

	const onClickAttention = () => {
		// isAttentionExpanded = !isAttentionExpanded;
		// if (isAttentionExpanded) {
		// 	expandedBlock.set({ id: blockId });
		// 	expandAttention();
		// }
		// else {
		// 	expandedBlock.set({ id: null });
		// 	collapseAttention();
		// }
		if (!isAttentionExpanded) {
			expandedBlock.set({ id: blockId });
			expandAttention();
		}
	};

	let expandableEl: HTMLDivElement;

	function handleOutsideClick(e) {
		if (isAttentionExpanded && !expandableEl.contains(e.target)) {
			expandedBlock.set({ id: null });
		}
	}
	onMount(() => {
		document.body.addEventListener('click', handleOutsideClick);
		return () => {
			document.body.removeEventListener('click', handleOutsideClick);
		};
	});

	// animation
	let expandTl = gsap.timeline();
	let collapseTl = gsap.timeline();

	const expandAttention = () => {
		isAttentionExpanded = true;
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

		expandTl
			.set([attentionMask.querySelector('.prev'), attentionSoftmax.querySelector('.prev')], {
				opacity: 1
			})
			.set([attentionMask.querySelector('.main'), attentionSoftmax.querySelector('.main')], {
				opacity: 0
			});
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
			})
			.to(attentionMask.querySelector('.prev'), {
				opacity: 0,
				duration: 1
			})
			.to(
				attentionMask.querySelector('.main'),
				{
					opacity: 1,
					duration: 1
				},
				'<'
			);

		// show Softmaxed
		expandTl
			.set(attentionSoftmax, { width: 0, x: attentionMatrixWidth * -1, opacity: 0 })
			.to(attentionSoftmax, {
				opacity: 1,
				display: 'flex',
				width: attentionMatrixWidth,
				x: 0,
				duration: 0.4
			})
			.to(attentionSoftmax.querySelector('.prev'), {
				opacity: 0,
				duration: 1
			})
			.to(
				attentionSoftmax.querySelector('.main'),
				{
					opacity: 1,
					duration: 1
				},
				'<'
			);

		// const grad = document.querySelector('#green-purple');
		// const stop = grad?.querySelectorAll('stop')[1];
		expandTl.to(outPaths, { opacity: ATTENTION_OUT });
	};

	const collapseAttention = () => {
		isAttentionExpanded = false;
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

	// color scale
	$: qkColorScaleDomain = d3.extent(queryKey.flat());
	$: qkColorScale = (d, i) => {
		return d3
			.scaleLinear()
			.domain(qkColorScaleDomain)
			.range(['white', theme.colors['purple'][700]])(d);
	};
	const maskedColorScale = (d, i) => {
		return d3.scaleLinear().domain([-3, 3]).range(['white', theme.colors['purple'][700]])(d);
	};
	const softmaxColorScale = (d, i) => {
		return d3.interpolate('white', theme.colors['purple'][700])(d);
	};
</script>

<div
	class="flex items-center gap-8 px-5"
	style={`--attention-matrix-width: ${attentionMatrixWidth}px;`}
>
	<!-- QK -->
	<div
		role="none"
		class={classNames('attention-matrix-container relative flex', {
			active: isAttentionExpanded
		})}
		bind:this={expandableEl}
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
				className="main"
				data={queryKey}
				showSize={false}
				cellHeight={cellSize}
				cellWidth={cellSize}
				rowGap={3}
				colGap={3}
				shape={'circle'}
				colorScale={qkColorScale}
			/>
			<div class="matrix-label">Dot product</div>
			<Tooltip class="popover tooltip">
				<Katex math={'Q \\cdot K^T'}></Katex>
			</Tooltip>
			<div class="color-scale">
				<span class="val">{qkColorScaleDomain[0]?.toFixed(1)}</span>
				<div class="bar"></div>
				<span class="val">{qkColorScaleDomain[1]?.toFixed(1)}</span>
			</div>
		</div>
		<!-- Scaling · Mask -->
		<div
			class="attention-matrix attention-mask flex flex-col items-center"
			bind:this={attentionMask}
		>
			<svg
				class="arrow"
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
					d="M19 12H5m14 0-4 4m4-4-4-4"
				/>
			</svg>

			<div>
				<Matrix
					className="prev absolute top-0 left-0 pointer-events-none"
					data={queryKey}
					showSize={false}
					cellHeight={cellSize}
					cellWidth={cellSize}
					rowGap={3}
					colGap={3}
					shape={'circle'}
					colorScale={qkColorScale}
				/>
				<Matrix
					className="main opacity-0"
					data={maskArray(masked)}
					showSize={false}
					cellHeight={cellSize}
					cellWidth={cellSize}
					rowGap={3}
					colGap={3}
					shape={'circle'}
					colorScale={maskedColorScale}
				/>
			</div>
			<div class="matrix-label">Scaling · Mask</div>
			<Tooltip class="popover tooltip">
				<Katex math={'\\frac{QK^T}{\\sqrt{d_k}} + M'}></Katex>
			</Tooltip>
			<div class="color-scale">
				<span class="val">-3.0</span>
				<div class="bar"></div>
				<span class="val">3.0</span>
			</div>
		</div>

		<!-- Softmax · Dropout -->
		<div
			class={classNames('attention-matrix attention-softmax flex flex-col items-center', {
				'attention-out': isAttentionExpanded
			})}
			bind:this={attentionSoftmax}
		>
			<svg
				class="arrow"
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
					d="M19 12H5m14 0-4 4m4-4-4-4"
				/>
			</svg>
			<div>
				<Matrix
					className="prev absolute top-0 left-0  pointer-events-none"
					data={maskArray(masked)}
					showSize={false}
					cellHeight={cellSize}
					cellWidth={cellSize}
					rowGap={3}
					colGap={3}
					shape={'circle'}
					colorScale={maskedColorScale}
				/>
				<Matrix
					className="main opacity-0"
					data={maskArray(softmaxed)}
					showSize={false}
					cellHeight={cellSize}
					cellWidth={cellSize}
					rowGap={3}
					colGap={3}
					shape={'circle'}
					colorScale={softmaxColorScale}
				/>
			</div>

			<div class="matrix-label">Softmax · Dropout</div>
			<Tooltip class="popover tooltip">
				<Katex math={'\\text{Dropout}(\\text{softmax}(\\frac{QK^T}{\\sqrt{d_k}} + M))'}></Katex>
			</Tooltip>
			<div class="color-scale">
				<span class="val">-1.0</span>
				<div class="bar"></div>
				<span class="val">1.0</span>
			</div>
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
				className="main"
				data={maskArray(softmaxed)}
				showSize={false}
				cellHeight={cellSize}
				cellWidth={cellSize}
				rowGap={3}
				colGap={3}
				shape={'circle'}
				colorScale={softmaxColorScale}
			/>

			<div class="matrix-label">Attention</div>
		</div>
	</div>
</div>

<style lang="scss">
	.attention-matrix-container {
		cursor: pointer;
		border-radius: 0.5rem;
		transition: 0.2s background-color;
		gap: 1rem;
		padding: 1rem;
	}

	.attention-matrix-container {
		.attention-qk,
		.attention-mask,
		.attention-softmax {
			display: none;
		}

		:global(.matrix) {
			padding: 0.5rem;
		}
		.matrix-label {
			white-space: nowrap;
			color: theme('colors.gray.400');
		}
		.attention-result {
			.matrix-label:hover {
				color: theme('colors.gray.600');
			}
		}
		.arrow {
			position: absolute;
			left: -1rem;
			top: calc(var(--attention-matrix-width) / 2 - 0.5rem);
			width: 1.2rem;
			height: 1.2rem;
			color: theme('colors.gray.300');
		}

		.attention-matrix {
			position: relative;
		}
	}
	.color-scale {
		position: absolute;
		bottom: -1.2rem;
		height: 1rem;
		display: flex;
		justify-content: space-between;
		align-items: center;
		width: 100%;
		padding: 0 1rem;
		gap: 0.2rem;

		.bar {
			height: 0.4rem;
			flex: 1 0 0;
			border: 1px solid theme('colors.gray.200');
			background: linear-gradient(90deg, white 0%, theme('colors.purple.700') 100%);
		}
		.val {
			flex-shrink: 0;
			font-family: monospace;
			font-size: 0.7rem;
			color: theme('colors.gray.600');
		}
	}
</style>

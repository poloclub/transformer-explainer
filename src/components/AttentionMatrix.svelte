<script lang="ts">
	import {
		expandedBlock,
		tokens,
		modelData,
		rootRem,
		attentionHeadIdx,
		hoveredMatrixCell,
		blockIdx,
		isExpandOrCollapseRunning,
		userId,
		headContentHeight
	} from '~/store';
	import classNames from 'classnames';
	import Matrix from '~/components/common/Matrix.svelte';
	import { gsap } from '~/utils/gsap';
	import { maskArray } from '~/utils/array';
	import { getContext, onMount } from 'svelte';
	import { fly, fade } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import resolveConfig from 'tailwindcss/resolveConfig';
	import tailwindConfig from '../../tailwind.config';
	import * as d3 from 'd3';
	import Katex from '~/utils/Katex.svelte';
	import { Tooltip } from 'flowbite-svelte';
	import { ATTENTION_OUT } from '~/constants/opacity';
	import { ga } from '~/utils/event';
	import { ZoomInOutline, CloseOutline } from 'flowbite-svelte-icons';
	import TextbookTooltip from '~/components/common/TextbookTooltip.svelte';
	import { textPages } from '~/utils/textbookPages';
	import { highlightAttentionPath, removeAttentionPathHighlight } from '~/utils/textbook';
	import { isDecoding, currentDecodeData, kvCache } from '~/store/kvcache';
	import KVCacheTable from '~/components/KVCacheTable.svelte';
	import VectorCanvas from '~/components/common/VectorCanvas.svelte';

	const { theme } = resolveConfig(tailwindConfig);

	$: placeHolderData = Array($tokens.length)
		.fill(0)
		.map((col) => Array($tokens.length).fill(-Infinity));
	$: queryKey =
		$modelData?.outputs?.[`block_${$blockIdx}_attn_head_${$attentionHeadIdx}_attn`]?.data ||
		placeHolderData;
	$: masked =
		$modelData?.outputs?.[`block_${$blockIdx}_attn_head_${$attentionHeadIdx}_attn_masked`]?.data ||
		placeHolderData;
	$: softmaxed =
		$modelData?.outputs?.[`block_${$blockIdx}_attn_head_${$attentionHeadIdx}_attn_dropout`]?.data ||
		placeHolderData;

	// Decode mode: 1×N attention strip from currentDecodeData
	$: decodeSoftmaxed =
		$currentDecodeData?.attentionOutputs?.[
			`block_${$blockIdx}_attn_head_${$attentionHeadIdx}_attn_dropout`
		]?.data || [[]];

	// Normalize to [0, max] so low-entropy distributions remain visible
	$: decodeMax = Math.max(...(decodeSoftmaxed[0] ?? []), 0.01);
	$: decodeColorScale = (d: number) =>
		d3.interpolate('white', theme.colors['purple'][700])(d / decodeMax);

	// Derive pre-softmax stages from softmax via log-space inversion
	const EPS = 1e-9;
	$: decodeScaled = [decodeSoftmaxed[0].map((p: number) => Math.log(p + EPS))];
	$: decodeQK = [decodeSoftmaxed[0].map((p: number) => Math.log(p + EPS) * 8)]; // *sqrt(64)
	$: decodeQKDomain = d3.extent(decodeQK[0].filter(Number.isFinite)) as [number, number];
	$: decodeQKColorScale = (d: number) =>
		d3.scaleLinear<string>().domain(decodeQKDomain).range(['white', theme.colors['purple'][700]])(d);
	const decodeScaledColorScale = (d: number) =>
		d3.scaleLinear<string>().domain([-3, 3]).range(['white', theme.colors['purple'][700]])(d);

	// Compute attention output and normalize value vectors for display
	$: {
		const weights = decodeSoftmaxed[0];
		const rawValues = $kvCache.map((e) => e.values[$attentionHeadIdx] ?? e.values[0] ?? []);

		// Global min/max across all tokens + all dims for consistent color scale
		const allNums = rawValues.flat().filter(Number.isFinite);
		const vMin = allNums.length ? Math.min(...allNums) : -1;
		const vMax = allNums.length ? Math.max(...allNums) : 1;
		const vRange = vMax - vMin || 1;

		// Normalize each token's value vector to [0, 1]
		decodeValueNorm = rawValues.map((vec) => vec.map((v) => (v - vMin) / vRange));

		// Compute out = attention @ values (raw), then normalize to [0, 1]
		if (!weights.length || !rawValues.length) {
			decodeOutValues = new Array(64).fill(0.5);
		} else {
			const out = new Array(64).fill(0);
			for (let j = 0; j < 64; j++) {
				for (let i = 0; i < weights.length; i++) {
					out[j] += (weights[i] ?? 0) * (rawValues[i]?.[j] ?? 0);
				}
			}
			const oMin = Math.min(...out);
			const oMax = Math.max(...out);
			const oRange = oMax - oMin || 1;
			decodeOutValues = out.map((v) => (v - oMin) / oRange);
		}
	}

	let decodeValueNorm: number[][] = [];
	let decodeOutValues: number[] = new Array(64).fill(0.5);

	let decodeOutOpen = false;

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
	let decodeExpanded = false; // separate from prefill expand — no animation DOM deps

	const blockId = getContext('block-id');

	// event handling — only run prefill expand/collapse when NOT in decode mode
	$: if ($expandedBlock.id !== blockId && isAttentionExpanded && !$isDecoding) {
		isAttentionExpanded = false;
		collapseAttention();
	}
	$: if ($expandedBlock.id === blockId && !isAttentionExpanded && !$isDecoding) {
		isAttentionExpanded = true;
		expandAttention();
	}
	// When switching back to prefill, reset decode state
	$: if (!$isDecoding) decodeExpanded = false;
	$: if (!decodeExpanded) decodeOutOpen = false;

	const onClickAttention = (e) => {
		e.stopPropagation();
		e.preventDefault();
		textPages.find((page) => page.id === 'masked-self-attention')?.complete();

		if ($isDecoding) {
			// Decode mode: toggle expand without running the prefill animation
			decodeExpanded = !decodeExpanded;
			expandedBlock.set({ id: decodeExpanded ? blockId : null });
		} else if (!isAttentionExpanded) {
			expandedBlock.set({ id: blockId });
		}
	};

	let expandableEl: HTMLDivElement;
	let decodeExpandableEl: HTMLDivElement;

	function handleOutsideClick(e) {
		if (isAttentionExpanded && expandableEl && !expandableEl.contains(e.target)) {
			expandedBlock.set({ id: null });
		}
		if (decodeExpanded && decodeExpandableEl && !decodeExpandableEl.contains(e.target)) {
			decodeExpanded = false;
			expandedBlock.set({ id: null });
		}
	}
	onMount(() => {
		document.querySelector('.main-section').addEventListener('click', handleOutsideClick);
		return () => {
			document.querySelector('.main-section').removeEventListener('click', handleOutsideClick);
		};
	});

	// animation
	let expandTl = gsap.timeline();
	let collapseTl = gsap.timeline();

	// google analytics
	let startTime = null;

	const expandAttention = () => {
		highlightAttentionPath();

		isAttentionExpanded = true;
		isExpandOrCollapseRunning.set(true);
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

		expandTl.to(outPaths, {
			opacity: ATTENTION_OUT,
			onComplete: () => {
				isExpandOrCollapseRunning.set(false);
			}
		});

		startTime = performance.now();
		window.dataLayer?.push({
			event: 'visibility-show',
			visible_name: 'attention-expansion',
			start_time: startTime,
			user_id: $userId
		});
	};

	const collapseAttention = () => {
		removeAttentionPathHighlight();
		let endTime = performance.now();
		let visibleDuration = endTime - startTime;

		window.dataLayer?.push({
			event: 'visibility-hide',
			visible_name: 'attention-expansion',
			end_time: endTime,
			visible_duration: visibleDuration,
			user_id: $userId
		});

		isAttentionExpanded = false;
		isExpandOrCollapseRunning.set(true);
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
				duration: 0.5,
				onComplete: () => {
					isExpandOrCollapseRunning.set(false);
				}
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

	const onMouseOverCell = (e, d, el) => {
		const rowIdx = d.rowIndex;
		const colIdx = d.colIndex;
		hoveredMatrixCell.set({ row: rowIdx, col: colIdx });
		if (Number.isFinite(d.cell)) {
			d3.select(el).attr('stroke', theme.colors.gray[400]);
		}
	};
	const onMouseOutCell = (e, d, el) => {
		hoveredMatrixCell.set({ row: null, col: null });
		if (Number.isFinite(d.cell)) {
			d3.select(el).attr('stroke', !Number.isFinite(d.cell) ? 'none' : theme.colors.gray[200]);
		}
	};

	const showTooltip = (e, d) => {
		if (!Number.isFinite(d)) return;
		return d.toFixed(2);
	};
</script>

{#if $isDecoding}
	<div
		class="decode-attention px-5"
		class:expanded={decodeExpanded}
		role="button"
		tabindex="0"
		bind:this={decodeExpandableEl}
		on:click={onClickAttention}
		on:keydown={onClickAttention}
		style={`min-height: ${$headContentHeight}px`}
	>
		<!-- Collapsed: compact attention strip -->
		{#if !decodeExpanded}
			<div class="decode-collapsed" in:fade={{ duration: 250, easing: cubicOut }}>
				{#if $currentDecodeData}
					<div class="decode-labels">
						<span class="label-kvcache">KV Cache</span>
						<span class="label-new">New: {$currentDecodeData.inputToken}</span>
					</div>
				{/if}
				<Matrix
					data={decodeSoftmaxed}
					showSize={false}
					cellHeight={cellSize}
					cellWidth={cellSize}
					rowGap={3}
					colGap={3}
					shape={'circle'}
					colorScale={decodeColorScale}
					{onMouseOverCell}
					{onMouseOutCell}
					{showTooltip}
				/>
				<div class="matrix-label">
					Attention <ZoomInOutline />
				</div>
			</div>
		{:else}
			<!-- Expanded: 3-panel attention pipeline + Out -->
			<div
				class="decode-expanded-inner"
				role="none"
				on:click|stopPropagation={() => {}}
				in:fly={{ x: -24, duration: 400, easing: cubicOut }}
				out:fade={{ duration: 150 }}
			>
				<!-- Step-by-step panels: Dot Product → Scaling·Mask → Softmax -->
				<div class="decode-panels">
					<!-- Dot Product -->
					<div class="decode-panel">
						<Matrix
							data={decodeQK}
							showSize={false}
							cellHeight={cellSize}
							cellWidth={cellSize}
							rowGap={3}
							colGap={3}
							shape={'circle'}
							colorScale={decodeQKColorScale}
							{onMouseOverCell}
							{onMouseOutCell}
							{showTooltip}
						/>
						<div class="matrix-label">Dot product</div>
						<div class="color-scale">
							<span class="val">{decodeQKDomain[0]?.toFixed(1)}</span>
							<div class="bar"></div>
							<span class="val">{decodeQKDomain[1]?.toFixed(1)}</span>
						</div>
					</div>
					<!-- Arrow -->
					<svg class="panel-arrow" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
						<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 12H5m14 0-4 4m4-4-4-4"/>
					</svg>
					<!-- Scaling · Mask -->
					<div class="decode-panel">
						<Matrix
							data={decodeScaled}
							showSize={false}
							cellHeight={cellSize}
							cellWidth={cellSize}
							rowGap={3}
							colGap={3}
							shape={'circle'}
							colorScale={decodeScaledColorScale}
							{onMouseOverCell}
							{onMouseOutCell}
							{showTooltip}
						/>
						<div class="matrix-label">Scaling · Mask</div>
						<div class="color-scale">
							<span class="val">-3.0</span>
							<div class="bar"></div>
							<span class="val">3.0</span>
						</div>
					</div>
					<!-- Arrow -->
					<svg class="panel-arrow" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
						<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 12H5m14 0-4 4m4-4-4-4"/>
					</svg>
					<!-- Softmax -->
					<div class="decode-panel">
						<Matrix
							data={decodeSoftmaxed}
							showSize={false}
							cellHeight={cellSize}
							cellWidth={cellSize}
							rowGap={3}
							colGap={3}
							shape={'circle'}
							colorScale={decodeColorScale}
							{onMouseOverCell}
							{onMouseOutCell}
							{showTooltip}
						/>
						<div class="matrix-label">Softmax</div>
						<div class="color-scale">
							<span class="val">0.0</span>
							<div class="bar"></div>
							<span class="val">1.0</span>
						</div>
					</div>
					<!-- Out trigger — styled like prefill Out column label -->
					<div
						class="decode-out-trigger"
						role="button"
						tabindex="0"
						on:click|stopPropagation={() => (decodeOutOpen = !decodeOutOpen)}
						on:keydown|stopPropagation={(e) => e.key === 'Enter' && (decodeOutOpen = !decodeOutOpen)}
					>
						<span class="out-label">Out</span>
						<ZoomInOutline size="sm" />
						<Tooltip class="popover" placement="bottom">click to see Attention Out calculation</Tooltip>
					</div>
				</div>

				<!-- KV cache table -->
				<KVCacheTable />

				<!-- Inline Attention × Value = Out modal -->
				{#if decodeOutOpen}
					<div
						class="decode-out-modal"
						role="none"
						on:click|stopPropagation={() => {}}
						in:fly={{ y: 8, duration: 300, easing: cubicOut }}
						out:fade={{ duration: 150 }}
					>
						<div class="decode-out-header">
							<span>Attention Head {$attentionHeadIdx + 1} Out</span>
							<button
								class="decode-out-close"
								on:click|stopPropagation={() => (decodeOutOpen = false)}
							><CloseOutline class="h-4 w-4 text-gray-500" /></button>
						</div>
						<div class="decode-out-content">
							<!-- Attention 1×N -->
							<div class="out-col">
								<div class="out-title">Attention</div>
								<Matrix
									data={decodeSoftmaxed}
									showSize={false}
									cellHeight={12}
									cellWidth={12}
									rowGap={3}
									colGap={3}
									shape={'circle'}
									colorScale={decodeColorScale}
								/>
								<div class="out-size">(1, {decodeSoftmaxed[0].length})</div>
							</div>
							<span class="out-op">&times;</span>
							<!-- Value: N token strips -->
							<div class="out-col">
								<div class="out-title">Value</div>
								<div class="value-strips">
									{#each decodeValueNorm as normVec}
										<div class="vec-strip">
											<VectorCanvas
												data={normVec}
												colorScale="green"
												active={true}
											/>
										</div>
									{/each}
								</div>
								<div class="out-size">({$kvCache.length}, 64)</div>
							</div>
							<span class="out-op">=</span>
							<!-- Out: 1×64 -->
							<div class="out-col">
								<div class="out-title">Out</div>
								<div class="vec-strip out-vec">
									<VectorCanvas data={decodeOutValues} colorScale="purple" active={true} />
								</div>
								<div class="out-size">(1, 64)</div>
							</div>
						</div>
						<div class="out-formula">
							<Katex displayMode math={`\\sum_{k=1}^{${decodeSoftmaxed[0].length}} Attention_{1,k} \\cdot Value_{k,j} = Out_{1,j}`} />
						</div>
					</div>
				{/if}
			</div>
		{/if}
	</div>
{:else}
<div
	class="flex items-center gap-8 px-5"
	style={`--attention-matrix-width: ${attentionMatrixWidth}px;`}
	data-click="attention-matrix"
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
				{onMouseOverCell}
				{onMouseOutCell}
				{showTooltip}
			/>
			<TextbookTooltip id="masked-self-attention">
				<div class="matrix-label">Dot product</div>
			</TextbookTooltip>

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
					{onMouseOverCell}
					{onMouseOutCell}
					{showTooltip}
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
					{onMouseOverCell}
					{onMouseOutCell}
					{showTooltip}
				/>
			</div>
			<TextbookTooltip id="masked-self-attention">
				<div class="matrix-label">Scaling · Mask</div>
			</TextbookTooltip>

			<Tooltip class="popover tooltip">
				<Katex math={'\\frac{QK^T}{\\sqrt{d_k}} + M'}></Katex>
			</Tooltip>
			<div class="color-scale">
				<span class="val">-3.0</span>
				<div class="bar"></div>
				<span class="val">3.0</span>
			</div>
		</div>

		<!-- Softmax -->
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
					{onMouseOverCell}
					{onMouseOutCell}
					{showTooltip}
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
					{onMouseOverCell}
					{onMouseOutCell}
					{showTooltip}
				/>
			</div>

			<TextbookTooltip id="masked-self-attention">
				<div class="matrix-label">Softmax</div>
			</TextbookTooltip>
			<Tooltip class="popover tooltip">
				<Katex math={'\\text{softmax}(\\frac{QK^T}{\\sqrt{d_k}} + M)'}></Katex>
			</Tooltip>
			<div class="color-scale">
				<span class="val">0.0</span>
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
				{onMouseOverCell}
				{onMouseOutCell}
				{showTooltip}
			/>

			<div class="matrix-label flex items-center gap-1">
				Attention <ZoomInOutline></ZoomInOutline>
			</div>
		</div>
	</div>
</div>
{/if}

<style lang="scss">
	.decode-attention {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		cursor: pointer;
		border-radius: 0.5rem;
		padding: 0.5rem;
		transition: background-color 0.2s;
		overflow: visible;

		&:hover {
			background-color: theme('colors.gray.50');
		}

		&.expanded {
			background-color: transparent;
			overflow: visible;
		}

		.decode-collapsed {
			display: flex;
			flex-direction: column;
			align-items: flex-start;
			gap: 0.25rem;
		}

		.decode-labels {
			display: flex;
			justify-content: space-between;
			width: 100%;
			font-size: 0.7rem;
			color: theme('colors.gray.400');
		}

		.label-new {
			color: theme('colors.blue.400');
			font-weight: 500;
		}

		.matrix-label {
			color: theme('colors.gray.400');
			font-size: 0.8rem;
			white-space: nowrap;
			display: flex;
			align-items: center;
			gap: 0.25rem;
		}

		.decode-expanded-inner {
			display: flex;
			flex-direction: column;
			gap: 1rem;
			cursor: default;
			overflow: visible;
		}

		.decode-panels {
			display: flex;
			flex-direction: row;
			align-items: center;
			gap: 0.5rem;
			flex-wrap: nowrap;
			overflow: visible;

			.decode-panel {
				display: flex;
				flex-direction: column;
				align-items: flex-start;
				gap: 0.25rem;
				position: relative;
				padding-bottom: 1.5rem;
				flex-shrink: 0;
			}

			.panel-arrow {
				color: theme('colors.gray.300');
				flex-shrink: 0;
			}
		}

		.decode-out-trigger {
			cursor: pointer;
			color: theme('colors.purple.400');
			display: flex;
			flex-direction: column;
			align-items: center;
			gap: 0.2rem;
			padding: 0.25rem 0.5rem;
			flex-shrink: 0;
			transition: color 0.15s;
			align-self: flex-start;

			.out-label {
				font-size: 0.9rem;
				font-weight: 500;
				white-space: nowrap;
			}

			&:hover {
				color: theme('colors.purple.600');
			}
		}

		.decode-out-modal {
			background: white;
			border: 1px solid theme('colors.gray.200');
			border-radius: 0.5rem;
			padding: 1rem 1.5rem 0.75rem;
			box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

			.decode-out-header {
				display: flex;
				justify-content: space-between;
				align-items: center;
				font-weight: 600;
				font-size: 0.85rem;
				color: theme('colors.gray.800');
				margin-bottom: 1rem;
			}

			.decode-out-close {
				background: none;
				border: none;
				cursor: pointer;
				padding: 0.1rem;
				display: flex;
				align-items: center;
			}

			.decode-out-content {
				display: flex;
				align-items: flex-start;
				gap: 1rem;
			}

			.out-col {
				display: flex;
				flex-direction: column;
				align-items: center;
				gap: 0.4rem;
				position: relative;

				.out-title {
					font-size: 0.75rem;
					color: theme('colors.gray.700');
					font-weight: 500;
					white-space: nowrap;
				}

				.out-size {
					font-size: 0.7rem;
					color: theme('colors.gray.400');
					font-family: monospace;
					margin-top: 0.25rem;
				}
			}

			.out-op {
				font-size: 1.2rem;
				color: theme('colors.gray.700');
				align-self: center;
				margin-top: 1.2rem;
			}

			.value-strips {
				display: flex;
				flex-direction: column;
				gap: 2px;
			}

			.vec-strip {
				position: relative;
				width: 24px;
				height: 32px;
				flex-shrink: 0;
			}

			.out-vec {
				height: 64px;
			}

			.out-formula {
				margin-top: 0.75rem;
				text-align: center;
				:global(.katex-display) {
					margin: 0 !important;
					font-size: 0.85rem;
				}
			}
		}
	}

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

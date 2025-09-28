<script lang="ts">
	import { modelMeta, tokens, rootRem, modelData, attentionHeadIdx, blockIdx } from '~/store';
	import * as d3 from 'd3';
	import { gsap } from '~/utils/gsap';
	import Matrix from '~/components/common/Matrix.svelte';
	import { onDestroy, onMount } from 'svelte';
	import resolveConfig from 'tailwindcss/resolveConfig';
	import tailwindConfig from '../../../tailwind.config';
	import { maskArray } from '~/utils/array';
	import WeightPopoverCard from '../common/WeightPopoverCard.svelte';
	import Katex from '~/utils/Katex.svelte';

	const { theme } = resolveConfig(tailwindConfig);

	const tokenGap = 6;

	// placeholder data
	$: placeHolderData = Array($tokens.length)
		.fill(0)
		.map((col) => Array($tokens.length).fill(-Infinity));

	// generate data
	$: softmaxed = $modelData?.outputs?.[`block_${$blockIdx}_attn_head_${$attentionHeadIdx}_attn_dropout`]?.data || placeHolderData;

	const visibleDimension = 8;
	$: tokenLen = $tokens.length;
	$: valueData = Array(visibleDimension)
		.fill(0)
		.map((col) =>
			Array(tokenLen)
				.fill(0)
				.map((d) => Math.random())
		);
	$: outData = Array(tokenLen)
		.fill(0)
		.map((col) =>
			Array(visibleDimension)
				.fill(0)
				.map((d) => Math.random())
		);

	// color scale
	const valueColorScale = (d, i) => {
		return d3.interpolate(theme.colors['green'][100], theme.colors['green'][400])(d);
	};

	const outColorScale = (d, i) => {
		return d3.interpolate(theme.colors['purple'][100], theme.colors['purple'][400])(d);
	};

	const softmaxColorScale = (d, i) => {
		return d3.interpolate('white', theme.colors['purple'][700])(d);
	};

	// animation
	let isAnimationActive = false;
	let progress = 0;
	let timeline = gsap.timeline();

	onMount(() => {
		timeline.eventCallback('onUpdate', () => {
			progress = timeline.progress();
			if (progress === 1) isAnimationActive = false;
		});

		setTimeout(() => {
			isAnimationActive = true;
			draw();
		}, 300);
	});

	onDestroy(() => {
		if (timeline) {
			timeline.kill();
			timeline = null;
		}
	});

	const draw = () => {
		const attentionRows = d3
			.selectAll('.attention-weight-popover .attention-matrix g.g-row')
			.nodes();
		const valueCols = d3.selectAll('.attention-weight-popover .value-matrix g.g-col').nodes();
		const outRows = d3.selectAll('.attention-weight-popover .head-out-matrix g.g-row').nodes();

		const mulSymbol = d3.select('.attention-weight-popover .symbol.mul').node();
		const equalSymbol = d3.select('.weight-popover-content .symbol.equal').node();

		const highlight = '#94a3b8';

		// first row detail animation
		timeline.set('.formula .first-row', { opacity: 1 });
		timeline.set('.formula .total', { opacity: 0 });

		const firstOutputRowRects = d3.select(outRows[0]).selectAll('rect').nodes();
		const firstAttentionRowCircles = d3.select(attentionRows[0]).selectAll('circle').nodes();

		firstOutputRowRects.forEach((outputRect, outCellIdx) => {
			const isFirstOutCell = outCellIdx === 0;
			const firstValColRects = d3.select(valueCols[outCellIdx]).selectAll('rect').nodes();
			timeline.set(firstAttentionRowCircles, { opacity: 0.1 });

			firstAttentionRowCircles.forEach((attentionRect, i) => {
				//attention
				timeline
					.fromTo(
						attentionRect,
						{ opacity: 0.1, strokeWidth: 0 },
						{
							opacity: 1,
							duration: isFirstOutCell ? 0.1 : 0.002,
							strokeWidth: 10,
							stroke: highlight
						}
					)
					.to(
						attentionRect,
						{
							strokeWidth: 0,
							duration: isFirstOutCell ? 0.1 : 0.002
						},
						'<50%'
					);

				//value
				timeline
					.fromTo(
						firstValColRects[i],
						{ opacity: 0.1, strokeWidth: 0 },
						{
							opacity: 1,
							duration: isFirstOutCell ? 0.1 : 0.002,
							strokeWidth: 10,
							stroke: highlight
						},
						'<-50%'
					)
					.to(
						firstValColRects[i],
						{
							strokeWidth: 0,
							duration: isFirstOutCell ? 0.1 : 0.002
						},
						'<50%'
					);
			});

			//symbol
			if (isFirstOutCell) {
				timeline.from(
					[
						mulSymbol,
						equalSymbol,
						'.formula .first-row .part1',
						equalSymbol,
						'.formula .first-row .part2'
					],
					{
						duration: 0.05,
						opacity: 1
					},
					'<50%'
				);
			}
			//out
			timeline
				.fromTo(
					outputRect,
					{ opacity: 0, strokeWidth: 0 },
					{
						opacity: 1,
						duration: isFirstOutCell ? 0.4 : 0.002,
						strokeWidth: 10,
						stroke: highlight
					},
					'<-50%'
				)
				.to(
					outputRect,

					{
						strokeWidth: 0,
						duration: isFirstOutCell ? 0.4 : 0.002
					},
					'<50%'
				);

			if (isFirstOutCell) {
				timeline.to('.formula .first-row', { opacity: 0, duration: 0.3 }, '>+1');
				timeline.to('.formula .total', { opacity: 1, duration: 0.3 }, `<`);
			}
		});

		// rest row animation
		let previousRowIdx = 0;

		// out vectors
		outRows.forEach(function (row, rowIdx) {
			if (rowIdx === 0) return;

			const outputCells = d3.select(row).selectAll('rect').nodes();
			const attentionRowCircles = d3.select(attentionRows[rowIdx]).selectAll('circle').nodes();

			// Check if rowIdx has changed
			if (previousRowIdx !== null && previousRowIdx !== rowIdx) {
				timeline.fromTo(
					attentionRowCircles,
					{ opacity: 0.1 },
					{
						opacity: 1,
						duration: 0.01
					},
					'<'
				);
			}

			outputCells.forEach((d, colIdx) => {
				const valueColRects = d3.select(valueCols[colIdx]).selectAll('rect').nodes();

				timeline.fromTo(
					valueColRects,
					{ opacity: 0.1 },
					{
						opacity: 1,
						duration: 0.01
					},
					`<50%`
				);

				timeline.from(
					d,
					{
						opacity: 0,
						duration: 0.01
					},
					`<50%`
				);
			});
			previousRowIdx = rowIdx;
		});
	};

	// event
	let highlightCol: number | undefined = undefined;
	let highlightRow: number | undefined = undefined;

	const onMouseOverCell = (e, d) => {
		if (isAnimationActive) return;
		highlightRow = d.rowIndex;
		highlightCol = d.colIndex;
	};
	const onMouseOutSvg = () => {
		highlightCol = undefined;
		highlightRow = undefined;
	};
</script>

<WeightPopoverCard
	id="attention"
	title={`Attention Head ${$attentionHeadIdx + 1} Out`}
	bind:isAnimationActive
	{timeline}
>
	<div class="attention-weight-poover weight-popover-content flex items-center justify-start">
		<div class="matrix flex flex-col items-center">
			<div class="title">Attention</div>
			<Matrix
				className="attention-matrix"
				data={maskArray(softmaxed)}
				showSize={false}
				cellHeight={12}
				cellWidth={12}
				rowGap={3}
				colGap={3}
				shape={'circle'}
				colorScale={softmaxColorScale}
				{highlightRow}
			/>
			<div class="size">({tokenLen}, {tokenLen})</div>
		</div>
		<div class="operator"><div class="symbol mul">&times;</div></div>
		<div class="matrix flex flex-col items-center">
			<div class="tokens" style={`gap:${tokenGap}px`}>
				{#each $tokens as token, index}
					<div class="token-label"><span>{token}</span></div>
				{/each}
			</div>
		</div>
		<div class="matrix flex flex-col items-center">
			<div class="title flex items-center gap-1">Value</div>
			<div class="flex gap-0">
				<Matrix
					className="value-matrix"
					data={valueData}
					showSize={false}
					groupBy={'col'}
					cellHeight={rootRem * 0.7}
					cellWidth={2}
					rowGap={tokenGap}
					colorScale={valueColorScale}
					{highlightCol}
				/>
			</div>

			<div class="size">
				({tokenLen}, {$modelMeta.dimension / $modelMeta.attention_head_num})
			</div>
		</div>
		<div class="operator"><div class="symbol equal">=</div></div>
		<div class="matrix flex flex-col items-center">
			<div class="tokens" style={`gap:${tokenGap}px`}>
				{#each $tokens as token, index}
					<div class="token-label"><span>{token}</span></div>
				{/each}
			</div>
		</div>
		<div class="matrix flex flex-col items-center">
			<div class="title">Out</div>
			<div class="flex">
				<Matrix
					className="head-out-matrix"
					data={outData}
					showSize={false}
					cellHeight={rootRem * 0.7}
					cellWidth={2}
					rowGap={tokenGap}
					colorScale={outColorScale}
					{onMouseOverCell}
					{onMouseOutSvg}
					{highlightCol}
					{highlightRow}
				/>
			</div>
			<div class="size">
				({tokenLen}, {$modelMeta.dimension / $modelMeta.attention_head_num})
			</div>
		</div>
	</div>
	<div class="formula">
		<div class="first-row flex items-center justify-center gap-1">
			<span class="part1">
				<Katex
					displayMode
					math={`
	Attention_{1,1} \\cdot Value_{1,1} + \\cdots + Attention_{1,${tokenLen}} \\cdot Value_{${tokenLen},1}`}
				/>
			</span>
			<span class="part2">
				<Katex displayMode math={`= Out_{1,1}`} />
			</span>
		</div>
		<div class="total">
			<Katex
				displayMode
				math={`
	\\sum_{k=1}^{${tokenLen}} Attention_{ik} \\cdot Value_{kj}= Out_{ij} 
	`}
			/>
		</div>
	</div>
</WeightPopoverCard>

<style lang="scss">
	.weight-popover-content {
		padding: 3rem 3rem 1.5rem 2.5rem;
		gap: 1rem;
	}
</style>

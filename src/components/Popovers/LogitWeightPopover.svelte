<script lang="ts">
	import { modelMeta, tokens, rootRem } from '~/store';
	import * as d3 from 'd3';
	import { gsap } from '~/utils/gsap';
	import Matrix from '~/components/common/Matrix.svelte';
	import { onDestroy, onMount } from 'svelte';
	import resolveConfig from 'tailwindcss/resolveConfig';
	import tailwindConfig from '../../../tailwind.config';
	import HelpPopover from '../common/HelpPopover.svelte';
	import WeightPopoverCard from '../common/WeightPopoverCard.svelte';
	import Katex from '~/utils/Katex.svelte';

	export let isOpen = true;

	const { theme } = resolveConfig(tailwindConfig);

	const tokenGap = 6;

	// generate data
	const visibleDimension = 18;
	$: tokenLen = $tokens.length;
	$: inputData = Array(1)
		.fill(0)
		.map((col) =>
			Array(visibleDimension)
				.fill(0)
				.map((d) => Math.random())
		);

	const weightData = Array(visibleDimension * 5)
		.fill(0)
		.map((col) =>
			Array(visibleDimension)
				.fill(0)
				.map((d) => Math.random())
		);
	const biasData = Array(1)
		.fill(0)
		.map((col) =>
			Array(visibleDimension * 5)
				.fill(0)
				.map((d) => Math.random())
		);

	$: logitData = Array(1)
		.fill(0)
		.map((col) =>
			Array(visibleDimension * 5)
				.fill(0)
				.map((d) => Math.random())
		);

	// color scale
	const embeddingColorScale = (d, i) => {
		return d3.interpolate(theme.colors['blue'][100], theme.colors['blue'][400])(d);
	};
	const weightColorScale = (d, i) => {
		return d3.interpolate(theme.colors['gray'][100], theme.colors['gray'][400])(d);
	};
	const logitColorScale = (d, i) => {
		return d3.interpolate(theme.colors['blue'][100], theme.colors['gray'][400])(d);
	};

	// animation
	let isAnimationActive = false;
	let progress = 0;
	let timeline;

	onMount(() => {
		timeline = gsap.timeline();

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
		const embeddingRows = d3.selectAll('.weight-popover-content .hidden-state g.g-row').nodes();
		const weightCols = d3.selectAll('.weight-popover-content .lm-head-weights g.g-col').nodes();
		const weightBiasCells = d3.selectAll('.weight-popover-content .lm-head-bias rect').nodes();

		const outRows = d3.selectAll('.weight-popover-content .logits g.g-row').nodes();

		const mulSymbol = d3.select('.weight-popover-content .symbol.mul').node();
		const plusSymbol = d3.select('.weight-popover-content .symbol.plus').node();
		const equalSymbol = d3.select('.weight-popover-content .symbol.equal').node();

		const highlight = '#94a3b8';

		// first row detail animation
		timeline.set(weightBiasCells, { opacity: 0.1 });
		timeline.set('.formula .first-row', { opacity: 1 });
		timeline.set('.formula .total', { opacity: 0 });

		const firstOutputRowRects = d3.select(outRows[0]).selectAll('rect').nodes();
		const firstEmbeddingRowRects = d3.select(embeddingRows[0]).selectAll('rect').nodes();

		firstOutputRowRects.forEach((outputRect, outCellIdx) => {
			const isFirstOutCell = outCellIdx === 0;
			const firstWeightColRects = d3.select(weightCols[outCellIdx]).selectAll('rect').nodes();
			timeline.set(firstEmbeddingRowRects, { opacity: 0.1 });

			firstEmbeddingRowRects.forEach((embeddingRect, i) => {
				//embedding
				timeline
					.fromTo(
						embeddingRect,
						{ opacity: 0.1, strokeWidth: 0 },
						{
							opacity: 1,
							duration: isFirstOutCell ? 0.1 : 0.002,
							strokeWidth: 10,
							stroke: highlight
						}
					)
					.to(
						embeddingRect,
						{
							strokeWidth: 0,
							duration: isFirstOutCell ? 0.1 : 0.002
						},
						'<50%'
					);

				//weights
				timeline
					.fromTo(
						firstWeightColRects[i],
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
						firstWeightColRects[i],
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
						plusSymbol,
						equalSymbol,
						'.formula .first-row .part2'
					],
					{
						duration: 0.05,
						opacity: 1
					},
					'<50%'
				);

				// timeline.from(
				// 	[plusSymbol, equalSymbol, '.formula .first-row .part2'],
				// 	{
				// 		duration: 0.5,
				// 		opacity: 0.1
				// 	},
				// 	'<'
				// );
			}
			//bias
			timeline
				.fromTo(
					weightBiasCells[outCellIdx],

					{ opacity: 0.1, strokeWidth: 0 },
					{
						opacity: 1,
						duration: isFirstOutCell ? 0.4 : 0.002,
						strokeWidth: 10,
						stroke: highlight
					},
					'<'
				)
				.to(
					weightBiasCells[outCellIdx],

					{
						strokeWidth: 0,
						duration: isFirstOutCell ? 0.4 : 0.002
					},
					'<50%'
				);

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
			const embeddingRowRects = d3.select(embeddingRows[rowIdx]).selectAll('rect').nodes();

			// Check if rowIdx has changed
			if (previousRowIdx !== null && previousRowIdx !== rowIdx) {
				timeline.fromTo(
					embeddingRowRects,
					{ opacity: 0.1 },
					{
						opacity: 1,
						duration: 0.01
					},
					'<'
				);

				const weightColRects = d3
					.selectAll('.weight-popover-content .lm-head-weights g.g-col rect')
					.nodes();
				timeline.set(weightColRects, { opacity: 0.1 });
				timeline.set(weightBiasCells, { opacity: 0.1 });
			}

			outputCells.forEach((d, colIdx) => {
				const weightColRects = d3.select(weightCols[colIdx]).selectAll('rect').nodes();

				timeline.fromTo(
					weightColRects,
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
				timeline.fromTo(
					weightBiasCells[colIdx],
					{ opacity: 0.1 },
					{
						opacity: 1,
						duration: 0.01
					},
					'<'
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

<WeightPopoverCard id="logits" title={'Logits'} bind:isAnimationActive {timeline} bind:isOpen>
	<div class="weight-popover-content flex items-center justify-start">
		<div class="matrix flex flex-col items-center">
			<div class="title flex items-center gap-1">
				<span>输出<br />Embedding</span>
				<HelpPopover id="hidden-states"
					>{`经过所有 Transformer Blocks 后，\n最后一个 token 的 embedding 向量\n包含了前文 token 的上下文信息。`}</HelpPopover
				>
			</div>
			<Matrix
				className="hidden-state"
				data={inputData}
				showSize={false}
				cellHeight={rootRem * 0.8}
				cellWidth={2}
				rowGap={tokenGap}
				colorScale={embeddingColorScale}
				{highlightRow}
			/>
			<div class="size">(1, {$modelMeta.dimension})</div>
		</div>
		<div class="operator"><div class="symbol mul pl-3">&times;</div></div>
		<div class="matrix flex flex-col items-center">
			<div class="title flex items-center gap-1">
				输出投影权重（Output Projection Weights）
				<HelpPopover id="lm-head-weights"
					>{`把最后的 embedding 变换为词表分布。\n参数在训练中学习得到，在预测时保持固定。`}</HelpPopover
				>
			</div>
			<div class="flex gap-0">
				<Matrix
					className="lm-head-weights"
					data={weightData}
					showSize={false}
					groupBy={'col'}
					cellHeight={2}
					cellWidth={2}
					rowGap={0}
					colorScale={weightColorScale}
					{highlightCol}
				/>
			</div>

			<div class="size">({$modelMeta.dimension}, 50,257)</div>
		</div>
		<div class="operator"><div class="symbol plus">+</div></div>
		<div class="matrix flex flex-col items-center">
			<div class="title flex items-center gap-1">
				输出投影偏置（Output Projection Bias）<HelpPopover id="lm-head-bias"
					>{`变换后额外加上的偏移量。\n参数在训练中学习得到，在预测时保持固定。`}</HelpPopover
				>
			</div>
			<Matrix
				className="lm-head-bias"
				data={biasData}
				showSize={false}
				groupBy={'col'}
				cellHeight={1}
				cellWidth={8}
				rowGap={0}
				colorScale={weightColorScale}
				highlightRow={highlightCol}
			/>
			<div class="size">(50,257)</div>
		</div>
		<div class="operator"><div class="symbol equal">=</div></div>
		<div class="matrix flex flex-col items-center">
			<div class="title flex items-center gap-1">
				Logits
				<HelpPopover id="logits"
					>{`应用 Softmax 之前的原始分数，\n表示模型对每个词表 token 的偏好。`}</HelpPopover
				>
			</div>
			<div class="flex">
				<Matrix
					className="logits"
					data={logitData}
					showSize={false}
					cellHeight={rootRem * 0.8}
					cellWidth={2}
					rowGap={tokenGap}
					colorScale={logitColorScale}
					{onMouseOverCell}
					{onMouseOutSvg}
					{highlightCol}
					{highlightRow}
				/>
			</div>
			<div class="size">(1, 50,257)</div>
		</div>
	</div>
	<div class="formula">
		<div class="first-row flex items-center justify-center gap-1">
			<span class="part1">
				<Katex
					displayMode
					math={`
	(Embedding_{1}×Weights_{1,1} + \\cdots + Embedding_{768}×Weights_{768,1})`}
				/>
			</span>
			<span class="part2">
				<Katex displayMode math={`+ Bias_1 = Logits_{1}`} />
			</span>
		</div>
		<div class="total">
			<Katex
				displayMode
				math={`
	\\sum_{d=1}^{768} Embedding_{d} \\cdot Weights_{di} + Bias_j = Logits_{i} 
	`}
			/>
		</div>
	</div>
</WeightPopoverCard>

<style lang="scss">
	.weight-popover-content {
		padding: 3rem 2rem 1.5rem 3.5rem;
		gap: 0.5rem;
	}
	.matrix .title {
		text-align: center;
		line-height: 1.2;
	}
</style>

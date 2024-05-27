<script lang="ts">
	import { Tooltip, Range, Button } from 'flowbite-svelte';
	import { expandedBlock, cellHeight, cellWidth, highlightedToken, tokens, rowGap } from '~/store';
	import { setContext, getContext } from 'svelte';
	import classNames from 'classnames';
	import { gsap, Flip } from '~/utils/gsap';
	import { onMount, tick } from 'svelte';
	import * as d3 from 'd3';
	import tailwindConfig from '../../tailwind.config';
	import resolveConfig from 'tailwindcss/resolveConfig';
	import { writable } from 'svelte/store';
	import { temperature } from '~/store';
	import { OriginalBarData } from '../utils/mock_data';
	import { applyTemperatureToData, sampleTokenIndex } from '../utils/sampler.js';
	import { predictedToken, highlightedIndex, finalTokenIndex } from '~/store';

	export let className: string | undefined = undefined;

	const { theme } = resolveConfig(tailwindConfig);

	setContext('block-id', 'softmax');

	const blockId = getContext('block-id');

	let isSoftmaxExpanded = false;
	$: console.log($expandedBlock.id, blockId, isSoftmaxExpanded);

	$: if ($expandedBlock.id !== blockId && isSoftmaxExpanded) {
		isSoftmaxExpanded = false;
		collapseSoftmax();
	}

	const onClickSoftmax = () => {
		if (!isSoftmaxExpanded) {
			expandedBlock.set({ id: blockId });
			expandSoftmax();
		} else {
			expandedBlock.set({ id: null });
			collapseSoftmax();
		}
	};

	let containerState: any;

	const expandSoftmax = async () => {
		containerState = Flip.getState('.softmax .initial');
		isSoftmaxExpanded = true;
		await tick();

		Flip.from(containerState, {
			duration: 1,
			ease: 'power2.inOut'
		});
		gsap.to('.softmax-detail', {
			opacity: 1,
			duration: 0.5,
			delay: 0.5
		});
	};

	const collapseSoftmax = async () => {
		containerState = Flip.getState('.softmax .initial');
		isSoftmaxExpanded = false;
		await tick();

		Flip.from(containerState, {
			duration: 0.5,
			ease: 'power2.inOut'
		});
	};

	// ===========================================================================
	// ===========================      SVG      =================================
	// Adjustable PARAMS
	let rootFontSize = 16; // Default value in case getComputedStyle fails

	const dataSize = 20;
	const barHeight = 1.25 * rootFontSize;
	const barMaxWidth = 80;
	const token_left_padding = 0;
	const token_top_padding = 0;
	const gap_between_bars = 0.5 * rootFontSize;
	const gap_between_text_and_bars = 10;
	const percentPrecision = 2;

  // HOVER BEHAVIOR
  const hoveredIndex = writable(null);

	let barData = applyTemperatureToData(OriginalBarData, $temperature);
	$: barData = applyTemperatureToData(OriginalBarData, $temperature);

	let predicted_tokens = barData.map((d) => d.token);
	let token_ids = barData.map((d) => d.token_id);
	$: logits = barData?.map((d) => d.logit) || [];
	$: exponents = logits?.map((d) => Math.exp(d)) || [];
	$: probabilities = barData?.map((d) => d.probability) || [];
	// ===========================================================================

	let svgEl: HTMLOrSVGElement;
	$: xScale = d3
		.scaleLinear()
		.domain([0, d3.max(barData, (d) => d.probability)])
		.range([1, barMaxWidth]);

	// Initial draw without transition
	onMount(() => {
		const svg = d3.select(svgEl);

		svg
			.select('g.bars')
			.selectAll('rect')
			.data(barData)
			.join('rect')
			.attr('height', barHeight)
      .attr('width', 1)
			.attr('x', token_left_padding + gap_between_text_and_bars)
			.attr('y', (d, i) => token_top_padding + i * barHeight + i * gap_between_bars)
			.attr('fill', theme.colors.gray[300])
			.attr('rx', 1)
			.attr('ry', 1);

		svg
			.select('g.bar-labels')
			.selectAll('text')
			.data(barData)
			.join('text')
      .text((d) => 0.00 + '%')
			.attr(
				'x',
				(d) =>
					token_left_padding +
					gap_between_text_and_bars +
					gap_between_text_and_bars
			)
			.attr('y', (d, i) => token_top_padding + i * barHeight + i * gap_between_bars)
			.attr('dy', barHeight / 2 + 3)
			.attr('text-anchor', 'start')
			.style('font-size', '1rem');
	});

	$: if (barData) {

		const svg = d3.select(svgEl);

		svg
			.select('g.bars')
			.selectAll('rect')
			.data(barData)
			.join('rect')
      .attr('fill', (d, i) => {
					if (i === $hoveredIndex) {
							return theme.colors.blue[500];
					} else if (i === $highlightedIndex) {
							return theme.colors.red[300];
					} else if (i === $finalTokenIndex) {
							return theme.colors.red[700];
					} else {
							return theme.colors.gray[300];
					}
				}
			)
      .on('mouseenter', function(event, d) {
        hoveredIndex.set(barData.indexOf(d));
        d3.select(this).style('cursor', 'pointer');
      })
      .on('mouseleave', () => hoveredIndex.set(null))
			.transition()
			.ease(d3.easeCubic)
			.duration(500)
			.attr('height', barHeight)
			.attr('width', (d) => xScale(d.probability))
			.attr('x', token_left_padding + gap_between_text_and_bars)
			.attr('y', (d, i) => token_top_padding + i * barHeight + i * gap_between_bars)
			.attr('rx', 1)
			.attr('ry', 1)

		svg
			.select('g.bar-labels')
			.selectAll('text')
			.data(barData)
			.join('text')
      .attr('fill', (d, i) => {
					if (i === $hoveredIndex) {
							return theme.colors.blue[600];
					} else if (i === $highlightedIndex) {
							return theme.colors.red[300];
					} else if (i === $finalTokenIndex) {
							return theme.colors.red[700];
					} else {
							return theme.colors.gray[400];
					}
				}
			)
      .on('mouseenter', function(event, d) {
        hoveredIndex.set(barData.indexOf(d));
        d3.select(this).style('cursor', 'pointer');
      })
      .on('mouseleave', () => hoveredIndex.set(null))
			.transition()
			.duration(500)
			.tween('text', function (d) {
				const that = d3.select(this),
					i = d3.interpolateNumber(that.text().replace('%', ''), d.probability * 100);
				return function (t) {
					that.text(i(t).toFixed(percentPrecision) + '%');
				};
			})
			.attr(
				'x',
				(d) =>
					token_left_padding +
					gap_between_text_and_bars +
					xScale(d.probability) +
					gap_between_text_and_bars
			)
			.attr('y', (d, i) => token_top_padding + i * barHeight + i * gap_between_bars)
			.attr('dy', barHeight / 2 + 3)
			.attr('text-anchor', 'start')
			.style('font-size', '0.75rem');

	}
</script>

<div
	class={classNames('softmax', className)}
	role="button"
	on:click={onClickSoftmax}
	on:keydown={onClickSoftmax}
	tabindex="0"
>

	<div class="title">
		<div>Softmax</div>
	</div>

	<div class="content">

		<div class="first-column relative flex justify-end">

				<div class="content-box w-20 z-[101]">
					{#each predicted_tokens as token, idx}
						<div
								class="text-box text-box-right justify-end text-right pr-2"
								on:mouseenter={() => hoveredIndex.set(idx)}
								on:mouseleave={() => hoveredIndex.set(null)}
								class:highlight={idx === $hoveredIndex}
								class:sample_highlight={$highlightedIndex === idx}
								class:final_token_highlight={$finalTokenIndex === idx}
						>
								<span class="">{token}</span>
						</div>
						<Tooltip class="text-xs" placement="left" type="light">
							Token ID: {token_ids[idx]}
						</Tooltip>
					{/each}
				</div>

			<div class="vector vocab opacity-1 w-0"></div>
			<div class="softmax-subtitle initial softmax-detail flex justify-around text-xs text-center opacity-0">
				{#if isSoftmaxExpanded}
					<div class="first-column-subtitle">
						<div class="title-text text-end">Tokens</div>
					</div>
					<div class="title-box">
						<div class="title-text">Logits</div>
					</div>
					<div class="title-box">
						<div class="title-text">Exponents</div>
					</div>
					<div class="title-box">
						<div class="title-text">Probability</div>
					</div>
				{/if}
			</div>

		</div>

		<div class="resize-watch second-column initial flex flex-col gap-4">

			<div class="content-row flex w-full justify-around">
				{#if isSoftmaxExpanded}
					<div class="content-col embedding-detail z-[101]">
						<div class="content-box vector-box">
							{#each logits as logit, idx}
								<div
										class="text-box text-center"
										on:mouseenter={() => hoveredIndex.set(idx)}
										on:mouseleave={() => hoveredIndex.set(null)}
										class:highlight={idx === $hoveredIndex}
										class:sample_highlight={$highlightedIndex === idx}
										class:final_token_highlight={$finalTokenIndex === idx}
								>
										{logit.toFixed(2)}
								</div>
								<Tooltip class="text-xs" placement="left" type="light">
									{(logit * $temperature).toFixed(2)} ÷ {$temperature} = {logit.toFixed(2)}
								</Tooltip>
							{/each}
						</div>
					</div>
					<div class="content-col embedding-detail z-[101]">
						<div class="content-box vector-box">
							{#each exponents as exponent, idx}
								<div
										class="text-box text-center"
										on:mouseenter={() => hoveredIndex.set(idx)}
										on:mouseleave={() => hoveredIndex.set(null)}
										class:highlight={idx === $hoveredIndex}
										class:sample_highlight={$highlightedIndex === idx}
										class:final_token_highlight={$finalTokenIndex === idx}
								>
										{#if exponent > 100000}
											{exponent.toExponential(2)}
										{:else if exponent < 10}
											{exponent.toFixed(2)}
										{:else}
											{exponent.toFixed(0)}
										{/if}
								</div>
								<Tooltip class="text-xs" placement="left" type="light">
									exp({logits[idx].toFixed(2)}) = {exponent.toFixed(2)}
								</Tooltip>
							{/each}
						</div>
					</div>
					{/if}
					<div class="content-col z-[101]">
						<div class="content-box flex flex-col pt-2">
							<svg bind:this={svgEl} class="h-full w-full">
								<g class="bars"></g>
								<g class="bar-labels"></g>
							</svg>
						</div>
					</div>
			</div>
		</div>
	</div>
</div>

<style lang="scss">

  .content {
    margin: 0px;
		display: grid;
		grid-template-columns:  minmax(10rem, 1fr) auto;

		button {
			&:hover {
				background-color: #f8fafc;
			}

			span {
				// font-size: 12px;
				font-size: 0.75rem;
				line-height: 20px;
			}
		}
  .current {
    transform: translateY(0);
  }

    .highlight {
      color: white;
      background-color: theme('colors.blue.500');
      cursor: pointer;
			transition: background-color 0.2s;

    }

		.sample_highlight {
			color: white;
			background-color: theme('colors.red.300');
		}

		.final_token_highlight {
			color: white;
			background-color: theme('colors.red.700');
			transition: background-color 1s;
		}

		.hyperparams {
			height: 100px;
			display: flex;
			flex-direction: row;
			justify-content: center;
			align-items: center;
			gap: 1rem;
		}

		.first-column-subtitle {
			width: 100%;
			display: flex;
			justify-content: end;
			border-radius: 0.5rem;
			top: 0;
			color: theme('colors.gray.400');
		}

		.softmax-subtitle {
			gap: 0.5rem;
      position: absolute;
			left:0;
			top: 0;
			transform: translateY(calc(-100% - 1rem));

			.title-box {
				display: flex;
				justify-content: center;
				border-radius: 0.5rem;
				top: 0;
				width: 6rem;

				&:hover{
					background-color: theme('colors.gray.50');
				}

				.title-text {
					display: flex;
					align-items: end;
					color: theme('colors.gray.400');
				}

			}
		}

		.content-box {
			display: flex;
			flex-direction: column;
			justify-content: center;
			// align-items: center;
			color: theme('colors.gray.400');
			font-size: 0.75rem;
			line-height: 1.25rem;
			gap: 0.5rem;
			padding-top: 0.5rem;
			padding-bottom: 0.5rem;
		}

		.content-row {
			.content-col {
				// width: 100%;
				width: 6rem;
				display: flex;
				justify-content: center;
			}

			.vector-box {
				background-color: theme('colors.gray.50');
				width: 4rem;
				border-right: 1px solid theme('colors.gray.200');
				border-left: 1px solid theme('colors.gray.200');

				// &::before,
				// &::after {
				// 	content: '';
				// 	width: 5px;
				// 	height: 1px;
				// 	background-color: theme('colors.gray.400');
				// 	top: 0;
				// }
			}
		}
	}

</style>

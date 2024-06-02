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
		containerState = Flip.getState('.softmax .softmax-detail.expandable');
		isSoftmaxExpanded = true;
		await tick();

		const main = document.getElementById('main');
		main.style.justifyContent = 'end';
		await tick();

		Flip.from(containerState, {
			duration: 1,
			ease: 'power2.inOut',
			onStart: () => {
				drawBars();
			}
		});
		gsap.to('.softmax-detail', {
			opacity: 1,
			duration: 0.5,
			delay: 0.5
		});
	};

	const collapseSoftmax = async () => {
		containerState = Flip.getState('.softmax .softmax-detail.expandable');
		isSoftmaxExpanded = false;
		await tick();

		await Flip.from(containerState, {
			duration: 0.5,
			ease: 'power2.inOut',
			onComplete: () => {
				drawBars();
			}
		});
		gsap.to('.softmax-detail', {
			opacity: 0,
			duration: 0.5
		});

		await tick();
		const main = document.getElementById('main');
		main.style.justifyContent = 'start';
	};

	// ===========================================================================
	// ===========================      SVG      =================================
	// Adjustable PARAMS
	let rootFontSize = 16; // Default value in case getComputedStyle fails

	const dataSize = 20;
	const barHeight = 0.5 * rootFontSize;
	const barMaxWidth = 60;
	const token_left_padding = 0;
	const token_top_padding = 0;
	const gap_between_bars = rootFontSize;
	const gap_between_text_and_bars = 0.2 * rootFontSize;
	const percentPrecision = 1;

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

	let drawBars = () => {
		const svg = d3.select(svgEl);

		let xScale = d3
			.scaleLinear()
			.domain([0, d3.max(barData, (d) => d.probability)])
			.range([0, svgEl?.clientWidth - rootFontSize * 3]);

		svg
			.select('g.bars')
			.selectAll('rect')
			.data(barData)
			.join('rect')
			.attr('x', token_left_padding)
			.attr('y', (d, i) => token_top_padding + i * barHeight + i * gap_between_bars)
			.attr('height', barHeight)
			.attr('width', (d) => xScale(d.probability))
			.attr('rx', 1)
			.attr('ry', 1)
			.attr('fill', (d, i) => {
				if (i === $hoveredIndex) {
					return theme.colors.blue[500];
				} else if (i === $highlightedIndex) {
					return theme.colors.red[300];
				} else if (i === $finalTokenIndex) {
					return theme.colors.red[700];
				} else {
					return theme.colors.gray[200];
				}
			})
			.on('mouseenter', function (event, d) {
				hoveredIndex.set(barData.indexOf(d));
				d3.select(this).style('cursor', 'pointer');
			})
			.on('mouseleave', () => hoveredIndex.set(null))
			.transition()
			.ease(d3.easeCubic)
			.duration(500)
			.attr('width', (d) => xScale(d.probability));

		//label
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
			})
			.on('mouseenter', function (event, d) {
				hoveredIndex.set(barData.indexOf(d));
				d3.select(this).style('cursor', 'pointer');
			})
			.on('mouseleave', () => hoveredIndex.set(null))
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
			.style('font-size', '0.75rem')
			.transition()
			.duration(500)
			.tween('text', function (d) {
				const that = d3.select(this),
					i = d3.interpolateNumber(that.text().replace('%', ''), d.probability * 100);
				return function (t) {
					that.text(i(t).toFixed(percentPrecision) + '%');
				};
			});
	};

	// Initial draw without transition
	onMount(() => {
		drawBars();
	});

	$: if (barData && svgEl) {
		drawBars();
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
		<div>Probabilities</div>
	</div>
	<div
		class="content"
		style={`--softmax-row-height: ${barHeight}px;--softmax-row-gap: ${gap_between_bars}px`}
	>
		<div class="first-column relative flex justify-end">
			<div class="content-box token-string">
				{#each predicted_tokens as token, idx}
					<div
						role="group"
						class="text-box"
						on:mouseenter={() => hoveredIndex.set(idx)}
						on:mouseleave={() => hoveredIndex.set(null)}
						class:highlight={idx === $hoveredIndex}
						class:sample_highlight={$highlightedIndex === idx}
						class:final_token_highlight={$finalTokenIndex === idx}
					>
						{token}
					</div>
					<Tooltip class="text-xs" placement="left" type="light">
						Token ID: {token_ids[idx]}
					</Tooltip>
				{/each}
			</div>
			<div class="vector vocab opacity-1 w-0"></div>
		</div>

		<div class="resize-watch second-column flex flex-col">
			{#if isSoftmaxExpanded}
				<div class="softmax-subtitle softmax-detail flex text-center text-xs opacity-0">
					<div class="title-box token-string !justify-end">
						<div class="title-text">Tokens</div>
					</div>
					<div class="title-box logits">
						<div class="title-text">Logits</div>
					</div>
					<div class="title-box exponents">
						<div class="title-text">Exponents</div>
					</div>
					<div class="title-box probability">
						<div class="title-text">Probability</div>
					</div>
				</div>
			{/if}
			<div class="content-row flex gap-2">
				<div class="softmax-detail expandable flex gap-2 opacity-0">
					{#if isSoftmaxExpanded}
						<div class="content-box vector-box logits ml-2">
							{#each logits as logit, idx}
								<div
									role="group"
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
						<div class="content-box vector-box exponents">
							{#each exponents as exponent, idx}
								<div
									role="group"
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
					{/if}
				</div>
				<div class="content-box probability flex grow flex-col">
					<svg bind:this={svgEl} class="h-full w-full">
						<g class="bars"></g>
						<g class="bar-labels"></g>
					</svg>
				</div>
			</div>
			<div class="dim"></div>
		</div>
	</div>
</div>

<style lang="scss">
	.content {
		padding-right: 3rem;
		display: grid;
		grid-template-columns: 0 auto;

		.content-box {
			flex-shrink: 0;
			display: flex;
			flex-direction: column;
			color: theme('colors.gray.400');
			gap: var(--softmax-row-gap);

			.text-box {
				text-align: right;
				font-size: 0.8rem;
				padding-right: 4px;
				display: flex;
				justify-content: center;
				align-items: center;
				width: 100%;
				line-height: var(--softmax-row-height);
			}
		}

		.second-column {
			padding-left: 2px;
		}

		.content-row {
			.vector-box {
				background-color: theme('colors.gray.50');
				border-right: 1px solid theme('colors.gray.200');
				border-left: 1px solid theme('colors.gray.200');
			}
		}

		.token-string {
			width: 6rem;
			z-index: 201;

			.text-box {
				justify-content: end;
			}
		}
		.logits {
			width: 6rem;
			z-index: 200;
		}
		.exponents {
			width: 6rem;
			z-index: 200;
		}
		.probability {
			flex: 1 0 0;
			min-width: 6rem;
			z-index: 201;
		}

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

		.softmax-subtitle {
			gap: 0.5rem;
			position: absolute;
			left: -6rem;
			top: 0;
			transform: translateY(calc(-100% - 1rem));

			.title-box {
				flex-shrink: 0;
				display: flex;
				justify-content: center;
				border-radius: 0.5rem;
				top: 0;

				&:hover {
					background-color: theme('colors.gray.50');
				}

				.title-text {
					display: flex;
					align-items: end;
					color: theme('colors.gray.400');
				}
			}
		}
	}

	.second-column {
		position: relative;

		.dim {
			position: absolute;
			bottom: 0;
			width: 100%;
			height: 50vh;
			z-index: 300;
			background-color: white;
			background: linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 1) 70%);
		}
	}
</style>

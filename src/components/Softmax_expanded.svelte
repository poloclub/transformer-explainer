<script lang="ts">
	import { Tooltip, Range, Button } from 'flowbite-svelte';
	import { expandedBlock, cellHeight, cellWidth, highlightedToken, tokens, rowGap } from '~/store';
	import { setContext, getContext } from 'svelte';
	import classNames from 'classnames';
	import gsap from 'gsap';
	import { onMount, tick } from 'svelte';
	import * as d3 from 'd3';
	import tailwindConfig from '../../tailwind.config';
	import resolveConfig from 'tailwindcss/resolveConfig';
	import { writable } from 'svelte/store';
	import { temperature } from '~/store';

	const { theme } = resolveConfig(tailwindConfig);

	// ===========================================================================
	// Adjustable PARAMS
	let rootFontSize = 16; // Default value in case getComputedStyle fails

	const dataSize = 20;
	const barHeight = rootFontSize;
	const barMaxWidth = 80;
	const token_left_padding = 0;
	const token_top_padding = 0;
	const gap_between_bars = 0.5 * rootFontSize;
	const gap_between_text_and_bars = 5;
	const percentPrecision = 2;

  // HOVER BEHAVIOR
  const hoveredIndex = writable(null);


	// // ACTUAL DATA
	let OriginalBarData = [
		{ token: 'great', token_id: 1049, logit: 8.420611381530762, probability: 0.05054401233792305 },
		{ token: 'big', token_id: 1263, logit: 7.39492654800415, probability: 0.018122598528862 },
		{
			token: 'member',
			token_id: 2888,
			logit: 7.361647129058838,
			probability: 0.017529413104057312
		},
		{ token: 'good', token_id: 922, logit: 7.354094982147217, probability: 0.017397526651620865 },
		{ token: 'very', token_id: 845, logit: 7.138553619384766, probability: 0.014024232514202595 },
		{
			token: 'major',
			token_id: 1688,
			logit: 7.0558366775512695,
			probability: 0.012910871766507626
		},
		{ token: 'small', token_id: 1402, logit: 7.034438133239746, probability: 0.012637533247470856 },
		{ token: 'top', token_id: 1353, logit: 7.018462657928467, probability: 0.01243724673986435 },
		{
			token: 'private',
			token_id: 2839,
			logit: 6.951408386230469,
			probability: 0.011630622670054436
		},
		{ token: 'huge', token_id: 3236, logit: 6.743682384490967, probability: 0.009449061937630177 },
		{
			token: 'strong',
			token_id: 1913,
			logit: 6.724063873291016,
			probability: 0.009265491738915443
		},
		{ token: 'bit', token_id: 1643, logit: 6.68026876449585, probability: 0.008868466131389141 },
		{ token: '"', token_id: 366, logit: 6.677203178405762, probability: 0.008841320872306824 },
		{ token: 'school', token_id: 1524, logit: 6.64955997467041, probability: 0.008600265718996525 },
		{ token: 'team', token_id: 1074, logit: 6.605846881866455, probability: 0.008232420310378075 },
		{
			token: 'public',
			token_id: 1171,
			logit: 6.605170249938965,
			probability: 0.008226851001381874
		},
		{ token: 'little', token_id: 1310, logit: 6.595873832702637, probability: 0.00815072562545538 },
		{
			token: 'perfect',
			token_id: 2818,
			logit: 6.581667900085449,
			probability: 0.008035754784941673
		},
		{
			token: 'place',
			token_id: 1295,
			logit: 6.5282111167907715,
			probability: 0.007617469411343336
		},
		{
			token: 'program',
			token_id: 1430,
			logit: 6.490026473999023,
			probability: 0.007332082372158766
		},
		{
			token: 'national',
			token_id: 2260,
			logit: 6.4784722328186035,
			probability: 0.007247853092849255
		},
		{ token: 'long', token_id: 890, logit: 6.410051345825195, probability: 0.006768533028662205 },
		{ token: 'two', token_id: 734, logit: 6.34706449508667, probability: 0.006355354096740484 },
		{
			token: 'unique',
			token_id: 3748,
			logit: 6.244614124298096,
			probability: 0.005736487917602062
		},
		{ token: 'well', token_id: 880, logit: 6.24260950088501, probability: 0.005725000519305468 },
		{
			token: 'Division',
			token_id: 7458,
			logit: 6.199276924133301,
			probability: 0.005482219625264406
		},
		{ token: 'state', token_id: 1181, logit: 6.191622257232666, probability: 0.005440414883196354 },
		{
			token: 'college',
			token_id: 4152,
			logit: 6.159815311431885,
			probability: 0.0052700950764119625
		},
		{
			token: 'football',
			token_id: 4346,
			logit: 6.128932476043701,
			probability: 0.005109827034175396
		},
		{ token: 'one', token_id: 530, logit: 6.1205549240112305, probability: 0.005067198537290096 },
		{ token: 'non', token_id: 1729, logit: 6.114068508148193, probability: 0.005034436471760273 }
	];
	function applyTemperatureToData(data, temperature) {
		const adjustedLogits = data.map((d) => d.logit / temperature);

		const expValues = adjustedLogits.map((d) => Math.exp(d));
		const sumExpValues = expValues.reduce((sum, value) => sum + value, 0);

		const finalData = data.map((d, i) => ({
			...d,
			logit: adjustedLogits[i],
			probability: expValues[i] / sumExpValues
		}));

		return finalData;
	}
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
		// .domain(d3.extent(barData, (d) => d.probability))
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
			// .attr('width', (d) => xScale(d.probability))
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
			.style('font-size', '0.5rem');
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
			.style('font-size', '0.5rem');

	}

	// SAMPLER
  let finalToken = '';
  let highlightedIndex = writable(null);
	let finalTokenIndex = writable(null);
  let previousIndex = null;

	let predictedToken = '';

  function sampleTokenIndex() {
    let cumulativeProbabilities = [];
    let cumulativeSum = 0;

    for (let token of barData) {
      cumulativeSum += token.probability;
      cumulativeProbabilities.push(cumulativeSum);
    }

    const randomValue = Math.random();
    for (let i = 0; i < cumulativeProbabilities.length; i++) {
      if (randomValue < cumulativeProbabilities[i]) {
        return i;
      }
    }
  }

  function sampleToken() {
    const index = sampleTokenIndex();
    return barData[index].token;
  }

	async function animateSampling() {
		let iterations = 20;
		let i = 0;
		finalTokenIndex.set(null);

		const startDelay = 140;
		const endDelay = 10;

		let randomIndex = null;

		function getDelay(iteration) {
			return startDelay + ((endDelay - startDelay) * ((iterations - iteration) / iterations));
		}

		function runIteration() {
			if (i >= iterations) {
				finalToken = barData[randomIndex].token;
				finalTokenIndex.set(barData.findIndex(t => t.token === finalToken));
				highlightedIndex.set(null);
				previousIndex = null;
				return;
			}

			randomIndex = sampleTokenIndex();
			highlightedIndex.set(randomIndex);
			predictedToken = barData[randomIndex].token;
			previousIndex = randomIndex;

			i++;
			let delay = getDelay(i);
			console.log(`Iteration: ${i}, Delay: ${delay}`);  // Log the iteration and delay

			setTimeout(runIteration, delay);
		}

		runIteration();  // Start the first iteration
	}


</script>

<div class="softmax-container flex flex-col gap-4">
<!-- <div class="softmax-container flex h-full w-full"> -->
	<div class="hyperparams">

		<div class="sample-button flex justify-center">
			<div class="pr-4">
			  <Button outline color="red" on:click={animateSampling}>Sample</Button>
			</div>

			<div class="sliding-text-container w-32 outline outline-1 outline-red-700 rounded-md flex items-center justify-center">
				<div class="prediction-text">
					{predictedToken}
				</div>
			</div>
		</div>
	</div>

	<div class="title-row flex justify-around">
		<div class="title-box">
			<div class="title-text">Tokens</div>
		</div>
		<Tooltip class="text-xs" placement="top" type="light">
			vocab(token_id)
		</Tooltip>
		<div class="title-box">
			<div class="title-text">Logits</div>
		</div>
		<Tooltip class="text-xs" placement="top" type="light">
			logit(token) / $temperature
		</Tooltip>
		<div class="title-box">
			<div class="title-text">Exponents</div>
		</div>
		<Tooltip class="text-xs" placement="top" type="light">
			exp(logit)
		</Tooltip>
		<div class="title-box">
			<div class="title-text">Probability</div>
		</div>
		<Tooltip class="text-xs" placement="top" type="light">
			exp(logit) / sum(all_exponents)
		</Tooltip>
	</div>

	<div class="content-row flex w-full justify-around">
		<div class="content-col">
			<div class="content-box w-20">
				{#each predicted_tokens as token, idx}
          <div
              class="text-box text-box-right"
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
		</div>
		<div class="content-col">
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
		<div class="content-col">
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
		<div class="content-col">
			<div class="content-box flex flex-col">
				<svg bind:this={svgEl} class="h-full w-full">
					<g class="bars"></g>
					<g class="bar-labels"></g>
				</svg>
			</div>
		</div>
	</div>
</div>

<style lang="scss">

  .softmax-container {
    margin: 0px;

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

  .slider-container {
    display: flex;
		// flex-direction: column;
    align-items: center;
		justify-content: center;
    width: 100%;
		height: 20px;
  }

  .slider {
  	-webkit-appearance: none;  /* Override default CSS styles */
  	appearance: none;
		border-radius: 0.25rem;
    width: 100%;
    height: 4px;
    background: theme('colors.gray.300');
    outline: none;
		opacity: 0.7;

		&::-webkit-slider-thumb {
			-webkit-appearance: none;  /* Override default look */
			appearance: none;
			width: 12px;
			height: 12px;
			border-radius: 50%;
			border: 1px solid theme('colors.gray.500');
			background: white;
			cursor: pointer;
		  }
    }

	.prediction-text {
			position: absolute;
			width: 100%;
			text-align: center;
			font-size: 1rem; /* Adjust font size */
			// transition: transform 0.6s ease-in-out;
			// transition: linear 2s;
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
			// transition: background-color 0.5s;
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

		.slider-labels {
			left: 0;
			right: 0;
		}

		.title-row {
			.title-box {
				display: flex;
				width: 100%;
				justify-content: center;
				border-radius: 0.5rem;

				&:hover{
				background-color: theme('colors.gray.50');
				}

				.title-text {
					display: flex;
					align-items: end;
					color: theme('colors.gray.500');
					padding: 4px;
					font-size: 1.25rem;
				}
			}
		}

		.content-row {
			.content-col {
				width: 100%;
				display: flex;
				justify-content: center;
			}
			.content-box {
				display: flex;
				flex-direction: column;
				justify-content: center;
				color: theme('colors.gray.400');
				font-size: 0.75rem;
				line-height: 1rem;
				gap: 0.25rem;
			}

			.text-box {
				display: flex;
				justify-content: center;
				align-items: center;
				height: 1.25rem;
				border-radius: 0.25rem;
				padding-right: 0.5rem;

				// &:hover {
				// 	background-color: theme('colors.gray.200');
				// 	cursor: pointer;
				// }
			}
			.text-box-right {
				justify-content: end;
			}

			.vector-box {
				background-color: theme('colors.gray.50');
				width: 80px;
				border-right: 1px solid theme('colors.gray.400');
				border-left: 1px solid theme('colors.gray.400');

				&::before,
				&::after {
					content: '';
					width: 5px;
					height: 1px;
					background-color: theme('colors.gray.400');
					top: 0;
				}
			}
		}
	}
</style>

<script lang="ts">
	import { Tooltip, Range } from 'flowbite-svelte';
	import { expandedBlock, cellHeight, cellWidth, highlightedToken, tokens, rowGap } from '~/store';
	import { setContext, getContext } from 'svelte';
	import classNames from 'classnames';
	import gsap from 'gsap';
	import { onMount, tick } from 'svelte';
	import * as d3 from 'd3';
	import tailwindConfig from '../../tailwind.config';
	import resolveConfig from 'tailwindcss/resolveConfig';
	import { writable } from 'svelte/store';

	const { theme } = resolveConfig(tailwindConfig);

	// export let data: any;

	setContext('block-id', 'linear');
	const blockId = getContext('block-id');

	let linearContainer: HTMLDivElement;
	let linearContainerWidth = 0;
	let cellLgHeight = $cellHeight * 2;
	let cellLgWidth = $cellWidth * 2;

	let isLinearExpanded = false;
	let containerState: any;

	// ===========================================================================
	// Adjustable PARAMS
	let rootFontSize = 16; // Default value in case getComputedStyle fails
	console.log(rootFontSize);

	const dataSize = 20;
	const barHeight = rootFontSize;
	const barMaxWidth = 80;
	const token_left_padding = 0;
	const token_top_padding = 0;
	const gap_between_bars = 0.5 * rootFontSize;
	const gap_between_text_and_bars = 5;
	const percentPrecision = 2;

	// // ===========================================================================
	// // SIMULATING DATA
	// const randomWords = [
	//   'svelte', 'react', 'tailwind', 'huggingface', 'transformers', 'pytorch',
	// 	'attention', 'embedding', 'layernorm', 'residual', 'token',
	// 	'gpt2', 'bert', 'bart', 'gemini', 'chatgpt', 't5',
	//   'seongmin', 'polo', 'aeree', 'alex', 'grace', 'alec', 'jay',
	// 	'tomato', 'lemon', 'apple', 'banana', 'orange', 'grape',
	// 	'carrot', 'potato', 'onion', 'garlic', 'ginger', 'pepper',
	// ];
	// const getRandomWord = () => randomWords[Math.floor(Math.random() * randomWords.length)];
	// function getRandomBetween(min: number, max: number) {
	//   return Math.random() * (max - min) + min;
	// }
	// // Function to compute the softmax of an array
	// function softmax(arr) {
	//   const maxVal = Math.max(...arr);  // For numerical stability
	//   const expValues = arr.map(x => Math.exp(x - maxVal));
	//   const sumExpValues = expValues.reduce((sum, val) => sum + val, 0);
	//   return expValues.map(val => val / sumExpValues);
	// }

	// const barData = Array.from({ length: dataSize }, (v, i) => ({
	//   token_id: Math.floor(getRandomBetween(100, 10000)),
	//   token: getRandomWord(),
	//   logits: getRandomBetween(-5, 5),
	//   // probability: Math.random(),
	// }));
	//   // Extract logits and compute their softmax
	// const logits = barData.map(d => d.logits);
	// const probabilities = softmax(logits);
	// // Assign probabilities back to barData
	// barData.forEach((d, i) => {
	//   d.probability = probabilities[i];
	// });

	// barData.sort((a ,b) => b.probability - a.probability);
	// // let predicted_tokens;
	// let predicted_tokens = barData.map(d => d.token);
	// // debugger;
	// console.log(barData,predicted_tokens);
	// // ===========================================================================

	// TEMPERATURE
	let temperatureIndex = 9; // Default to the value corresponding to 1.0 in the array
	const temperatureArray = [
		0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0, 9.0, 10.0
	];

	$: temperature = temperatureArray[temperatureIndex];

	// let temperature = 1.0;
	// $: temperature = 1.0;

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
	let barData = applyTemperatureToData(OriginalBarData, temperature);
	$: barData = applyTemperatureToData(OriginalBarData, temperature);

	let predicted_tokens = barData.map((d) => d.token);
	let token_ids = barData.map((d) => d.token_id);
	$: logits = barData?.map((d) => d.logit) || [];
	$: exponents = logits?.map((d) => Math.exp(d)) || [];
	$: probabilities = barData?.map((d) => d.probability) || [];
	// ===========================================================================

	let svgEl: HTMLOrSVGElement;
	$: xScale = d3
		.scaleLinear()
		.domain(d3.extent(barData, (d) => d.probability))
		.range([1, barMaxWidth]);

	// Initial draw without transition
	onMount(() => {
		console.log(`mount`);
		const svg = d3.select(svgEl);

		svg
			.select('g.bars')
			.selectAll('rect')
			.data(barData)
			.join('rect')
			.attr('height', barHeight)
			.attr('width', (d) => xScale(d.probability))
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
			.text((d) => (d.probability * 100).toFixed(percentPrecision) + '%')
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
			.style('font-size', '0.5rem')
			.style('fill', theme.colors.gray[400]);
	});

	$: if (barData) {
		// const updatedBarData = applyTemperatureToData(barData, temperature);

		const svg = d3.select(svgEl);

		svg
			.select('g.bars')
			.selectAll('rect')
			.data(barData)
			.join('rect')
			.transition()
			.ease(d3.easeCubic)
			.duration(500)
			.attr('height', barHeight)
			.attr('width', (d) => xScale(d.probability))
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
			.style('font-size', '0.5rem')
			.style('fill', theme.colors.gray[400]);
	}
</script>

<div class="softmax-container flex flex-col gap-4">
	<div class="temperature-slider relative m-4 mb-4 w-96">
		<p>Temperature: {temperature}</p>
		<Range
			class="slider"
			bind:value={temperatureIndex}
			min="0"
			max={temperatureArray.length - 1}
			step="1"
		/>
		<div class="slider-labels absolute mt-2 flex w-full justify-around">
			{#each temperatureArray as temp, i}
				<div class="flex w-1">
					<span class="text-xs">{temp}</span>
				</div>
			{/each}
		</div>
	</div>

	<div class="title-row flex justify-around">
		<div class="title-box">
			<div class="title-text">Tokens</div>
		</div>
		<div class="title-box">
			<div class="title-text">Logits</div>
		</div>
		<div class="title-box">
			<div class="title-text">Exponents</div>
		</div>
		<!-- <div class="title-box">
      <div class="title-text">Proba (html)</div>
    </div> -->
		<div class="title-box">
			<div class="title-text">Probability</div>
		</div>
	</div>

	<div class="content-row flex w-full justify-around">
		<div class="content-col">
			<div class="content-box w-20">
				{#each predicted_tokens as token, idx}
					<div class="text-box text-box-right hover:bg-gray-200">
						<span class="">{token}</span>
					</div>
					<Tooltip class="text-xs" placement="right" type="light">
						Token ID: {token_ids[idx]}
					</Tooltip>
				{/each}
			</div>
		</div>
		<div class="content-col">
			<div class="content-box vector-box">
				{#each logits as logit}
					<div class="text-box text-center">
						{logit.toFixed(2)}
					</div>
				{/each}
			</div>
		</div>
		<div class="content-col">
			<div class="content-box vector-box">
				{#each exponents as exponent}
					<div class="text-box text-center">
						{#if exponent > 100000}
							{exponent.toExponential(2)}
						{:else}
							{exponent.toFixed(2)}
						{/if}
					</div>
				{/each}
			</div>
		</div>
		<!-- <div class="content-col">
      <div class="content-box">
        {#each probabilities as proba}
          <div  class="text-box text-center">
            {(proba * 100).toFixed(2)}%
          </div>
        {/each}
      </div>
    </div> -->
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

		.slider-labels {
			left: 0;
			right: 0;
			// bottom: -20px;
		}

		.title-row {
			.title-box {
				display: flex;
				width: 100%;
				justify-content: center;
				.title-text {
					display: flex;
					align-items: end;
					color: theme('colors.gray.500');
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

				&:hover {
					background-color: theme('colors.gray.200');
					cursor: pointer;
				}
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

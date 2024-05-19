<script lang="ts">
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
	const dataSize = 20;
	const barHeight = 20;
	const barMaxWidth = 80;
  const token_left_padding = 0;
  const token_top_padding = 0;
  const gap_between_bars = 4;
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

	console.log('hi')
	// // ACTUAL DATA
  const barData = [
    {token: 'great', token_id: 1049, logit: 8.420611381530762, probability: 0.05054401233792305},
    {token: 'big', token_id: 1263, logit: 7.39492654800415, probability: 0.018122598528862},
    {token: 'member', token_id: 2888, logit: 7.361647129058838, probability: 0.017529413104057312},
    {token: 'good', token_id: 922, logit: 7.354094982147217, probability: 0.017397526651620865},
    {token: 'very', token_id: 845, logit: 7.138553619384766, probability: 0.014024232514202595},
    {token: 'major', token_id: 1688, logit: 7.0558366775512695, probability: 0.012910871766507626},
    {token: 'small', token_id: 1402, logit: 7.034438133239746, probability: 0.012637533247470856},
    {token: 'top', token_id: 1353, logit: 7.018462657928467, probability: 0.01243724673986435},
    {token: 'private', token_id: 2839, logit: 6.951408386230469, probability: 0.011630622670054436},
    {token: 'huge', token_id: 3236, logit: 6.743682384490967, probability: 0.009449061937630177},
    {token: 'strong', token_id: 1913, logit: 6.724063873291016, probability: 0.009265491738915443},
    {token: 'bit', token_id: 1643, logit: 6.68026876449585, probability: 0.008868466131389141},
    {token: '"', token_id: 366, logit: 6.677203178405762, probability: 0.008841320872306824},
    {token: 'school', token_id: 1524, logit: 6.64955997467041, probability: 0.008600265718996525},
    {token: 'team', token_id: 1074, logit: 6.605846881866455, probability: 0.008232420310378075},
    {token: 'public', token_id: 1171, logit: 6.605170249938965, probability: 0.008226851001381874},
    {token: 'little', token_id: 1310, logit: 6.595873832702637, probability: 0.00815072562545538},
    {token: 'perfect', token_id: 2818, logit: 6.581667900085449, probability: 0.008035754784941673},
    {token: 'place', token_id: 1295, logit: 6.5282111167907715, probability: 0.007617469411343336},
    {token: 'program', token_id: 1430, logit: 6.490026473999023, probability: 0.007332082372158766},
    {token: 'national', token_id: 2260, logit: 6.4784722328186035, probability: 0.007247853092849255},
    {token: 'long', token_id: 890, logit: 6.410051345825195, probability: 0.006768533028662205},
    {token: 'two', token_id: 734, logit: 6.34706449508667, probability: 0.006355354096740484},
    {token: 'unique', token_id: 3748, logit: 6.244614124298096, probability: 0.005736487917602062},
    {token: 'well', token_id: 880, logit: 6.24260950088501, probability: 0.005725000519305468},
    {token: 'Division', token_id: 7458, logit: 6.199276924133301, probability: 0.005482219625264406},
    {token: 'state', token_id: 1181, logit: 6.191622257232666, probability: 0.005440414883196354},
    {token: 'college', token_id: 4152, logit: 6.159815311431885, probability: 0.0052700950764119625},
    {token: 'football', token_id: 4346, logit: 6.128932476043701, probability: 0.005109827034175396},
    {token: 'one', token_id: 530, logit: 6.1205549240112305, probability: 0.005067198537290096},
    {token: 'non', token_id: 1729, logit: 6.114068508148193, probability: 0.005034436471760273}
  ]
	let predicted_tokens = barData.map(d => d.token);
	// // ===========================================================================


  let svgEl: HTMLOrSVGElement;
  // const margin = { top: 20, right: 20, bottom: 20, left: 20 };
  // const width: number = 400 - margin.left - margin.right;
  // const height: number = 800 - margin.top - margin.bottom;

  const xScale = d3.scaleLinear().domain(d3.extent(barData, d => d.probability)).range([1, barMaxWidth]);


	const drawBarChart = () => {

    const svg = d3
      .select(svgEl)

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
			.attr('rx', 1)  // Rounded corners
			.attr('ry', 1)  // Rounded corners

		svg
			.select('g.bar-labels')
			.selectAll('text')
			.data(barData)
			.join('text')
      .text((d) => (d.probability * 100).toFixed(percentPrecision) + '%')
      .attr('x', (d) => token_left_padding + gap_between_text_and_bars + xScale(d.probability) + gap_between_text_and_bars)
      .attr('y', (d, i) => token_top_padding + i * barHeight + i * gap_between_bars)
			.attr('dy', barHeight / 2 + 3)

			.attr('text-anchor', 'start')
			.style('font-size', '0.5rem')
			.style('fill', theme.colors.gray[400])
	};

	// TEMPERATURE
	$: if (barData && svgEl) {
		// updateProbabilities();
		drawBarChart();
	}
</script>





<div class="softmax-container flex h-full w-full">
  <div class="token-labels flex flex-col gap-1 text-gray-500">
    {#each predicted_tokens as token}
      <button class='flex justify-end'>
        <span class="">{token}</span>
      </button>
    {/each}
  </div>
  <div class="bars-container w-full shrink-0">
    <svg bind:this={svgEl} class="w-full h-full">
      <g class="bars"></g>
      <g class="bar-labels"></g>
    </svg>
  </div>
</div>





<style lang="scss">

	.softmax-container {
		// margin: 20px;

		button{
			&:hover {
				background-color: #f8fafc;
		}

			span{
				// font-size: 12px;
				font-size: 0.75rem;
				line-height: 20px;

			}
	  }
	}
</style>

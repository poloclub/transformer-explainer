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

	export let data: any;

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
		{ token: 'great', token_id: 1049, logit: 8.4206, probability: 0.0505 },
		{ token: 'big', token_id: 1263, logit: 7.3949, probability: 0.0181 },
		{ token: 'member', token_id: 2888, logit: 7.3616, probability: 0.0175 },
		{ token: 'good', token_id: 922, logit: 7.3541, probability: 0.0174 },
		{ token: 'very', token_id: 845, logit: 7.1386, probability: 0.0140 },
		{ token: 'major', token_id: 1688, logit: 7.0558, probability: 0.0129 },
		{ token: 'small', token_id: 1402, logit: 7.0344, probability: 0.0126 },
		{ token: 'top', token_id: 1353, logit: 7.0185, probability: 0.0124 },
		{ token: 'private', token_id: 2839, logit: 6.9514, probability: 0.0116 },
		{ token: 'huge', token_id: 3236, logit: 6.7437, probability: 0.0094 },
		{ token: 'strong', token_id: 1913, logit: 6.7241, probability: 0.0093 },
		{ token: 'bit', token_id: 1643, logit: 6.6803, probability: 0.0089 },
		{ token: '"', token_id: 366, logit: 6.6772, probability: 0.0088 },
		{ token: 'school', token_id: 1524, logit: 6.6496, probability: 0.0086 },
		{ token: 'team', token_id: 1074, logit: 6.6058, probability: 0.0082 },
		{ token: 'public', token_id: 1171, logit: 6.6052, probability: 0.0082 },
		{ token: 'little', token_id: 1310, logit: 6.5959, probability: 0.0082 },
		{ token: 'perfect', token_id: 2818, logit: 6.5817, probability: 0.0080 },
		{ token: 'place', token_id: 1295, logit: 6.5282, probability: 0.0076 },
		{ token: 'program', token_id: 1430, logit: 6.4900, probability: 0.0073 }
	];
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





<div class="h-full">
	<div class="softmax-container flex h-full">
		<div class="token-labels flex flex-col gap-1 text-gray-500">
			{#each predicted_tokens as token}
				<button class='flex justify-end'>
					<span class="">{token}</span>
				</button>
			{/each}
		</div>
		<div class="bars-container">
			<svg bind:this={svgEl}>
				<g class="bars"></g>
				<!-- <g class="token-labels h-full"></g> -->
				<g class="bar-labels"></g>
			</svg>
		</div>
	</div>
</div>





<style lang="scss">

	.softmax-container {
		margin: 20px;

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

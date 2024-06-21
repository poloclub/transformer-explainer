<!-- <script lang="ts">
	import { Tooltip, Range, Button } from 'flowbite-svelte';
	import { writable } from 'svelte/store';
	import { predictedToken, highlightedIndex, finalTokenIndex } from '~/store';
	import { OriginalBarData } from '../utils/mock_data.ts';
	import { applyTemperatureToData } from '../utils/sampler.js';
	import { temperature, inputText } from '~/store';

	export let handleSubmit;

	let barData = applyTemperatureToData(OriginalBarData, $temperature);
	$: barData = applyTemperatureToData(OriginalBarData, $temperature);
	// input:{
	// 		token: 'member',
	// 		token_id: 2888,
	// 		logit: 7.361647129058838,
	// 		probability: 0.017529413104057312
	// 	},

	// SAMPLER
	let finalToken = '';
	let previousIndex = null;

	async function animateSampling() {
		let iterations = 10;
		let i = 0;
		finalTokenIndex.set(null);

		const startDelay = 200;
		const endDelay = 50;

		let randomIndex = null;

		function getDelay(iteration) {
			return startDelay + (endDelay - startDelay) * ((iterations - iteration) / iterations);
		}

		function runIteration() {
			if (i >= iterations) {
				finalToken = barData[randomIndex].token;
				highlightedIndex.set(null);
				finalTokenIndex.set(barData.findIndex((t) => t.token === finalToken));
				// console.log(`Final Token Index: ${$finalTokenIndex}`);
				// console.log(`Final Token: ${finalToken}`);
				previousIndex = null;

				let newInput = $inputText + ' ' + finalToken;
				// console.log(`Net Input: ${newInput}`);
				inputText.set(newInput.trim());
				return;
			}

			randomIndex = sampleTokenIndex(barData);
			highlightedIndex.set(randomIndex);
			// console.log(`Highlighted Index: ${$highlightedIndex}`);

			let prediciton = barData[randomIndex].token;
			predictedToken.set(prediciton);

			previousIndex = randomIndex;

			i++;
			let delay = getDelay(i);
			// console.log(`Iteration: ${i}, Delay: ${delay}`);  // Log the iteration and delay

			setTimeout(runIteration, delay);
		}

		runIteration(); // Start the first iteration
	}
</script>

<div class="sample-button flex justify-center gap-2">
	 <div
		class="sliding-text-container flex w-32 items-center justify-center rounded-md outline outline-1 outline-red-700"
	>
		<div class="prediction-text">
			{$predictedToken}
		</div>
	</div> 
	<div class="h-full">
		<Button
			type="submit"
			outline
			color="blue"
			size="xs"
			on:click={() => {
				animateSampling();
				handleSubmit();
			}}>Generate</Button
		>
	</div>
</div> -->

<script lang="ts">
	import { temperature } from '~/store';
	import HelpPopover from './common/HelpPopover.svelte';
	import Slider from './common/Slider.svelte';

	export let disabled: boolean = false;

	// TEMPERATURE
	let temperatureIndex = 6; // Default to the value corresponding to 0.8 in the array
	const temperatureArray = [
		// 0.05, 0.1, // error in Math.exp()
		0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0, 9.0, 10.0
	];

	$: temperatureTemp = temperatureArray[temperatureIndex];
	$: temperature.set(temperatureTemp);
</script>

<div class="temperature-input" data-click="temperature-input">
	<Slider
		{disabled}
		className="temperature-slider"
		min={0}
		max={temperatureArray.length - 1}
		step={1}
		bind:value={temperatureIndex}
		valueText={temperatureTemp}
	>
		<div class="temperature-text flex items-center gap-[2px]">
			<div>Temperature</div>
			<HelpPopover id="temperature-help" placement="right" goTo="article-temperature">
				{`Changes output \nprobability distribution \nand randomness \nof next token.`}
			</HelpPopover>
		</div>
	</Slider>
</div>

<style lang="scss">
	.temperature-input {
		:global(.slider-container) {
			width: 7rem;
		}
	}

	.temperature-text {
		margin-left: -0.5rem;
		font-size: 1rem;
		white-space: nowrap;
		flex-shrink: 0;
		font-size: 0.8rem;
		line-height: 0;
		font-weight: 500;
		color: theme('colors.gray.600');
	}
</style>

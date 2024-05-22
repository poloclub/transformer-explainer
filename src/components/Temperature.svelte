<script lang="ts">
  import {temperature} from '~/store';
  import { writable } from 'svelte/store';

  const hoveredIndex = writable(null);

	// TEMPERATURE
	let temperatureIndex = 10; // Default to the value corresponding to 1.0 in the array
	const temperatureArray = [
		0.05, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0, 9.0, 10.0
	];
	const ticks = [0, temperatureArray.length - 1];

	$: temperatureTemp = temperatureArray[temperatureIndex];
  $: temperature.set(temperatureTemp);
</script>


<div class="temperature-slider border border-gray-300 text-gray-900">
  <div class="temperature-text">
  <p>Temperature:</p>
  </div>
  <div class="temperature-value">
     <p>{temperatureTemp}</p>
  </div>
  <div class="slider-container w-full">
    <div class='w-full'>
      <input
      class='slider'
      type="range"
      min={0}
      max={temperatureArray.length - 1}
      step={1}
      bind:value={temperatureIndex}
      />
    </div>
  </div>
</div>

<style lang="scss">

  .temperature-slider {
    // height: 3rem;
    width: 400px;
    padding-left: 1rem;
    padding-right: 1rem;

    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 2rem;

    border: 1px solid #e2e8f0;
    border-radius: 0.5rem;
  }

  .temperature-text{
    font-size: 1rem;
    white-space: nowrap;
    flex-shrink: 0;
    font-size: 1rem;

  }

  .temperature-value {
    font-size: 1rem;
    white-space: nowrap;
    flex-shrink: 0;
    width: 20px;
  }

  .slider-container {
    display: flex;
    align-items: center;
    width: 100%;
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

</style>
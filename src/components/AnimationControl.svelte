<script lang="ts">
	import classNames from 'classnames';
	import { Button } from 'flowbite-svelte';
	import { PauseSolid, PlaySolid } from 'flowbite-svelte-icons';
	import { getContext } from 'svelte';

	let progress = 0;

	export let tl: gsap.core.Timeline;
	export let isActive: boolean = false;
	export let slider: boolean;

	$: if (tl) {
		tl.eventCallback('onUpdate', () => {
			progress = tl.progress();
			if (progress === 1) isActive = false;
		});
	}

	function play() {
		if (!tl) return;
		tl.play();
		isActive = true;
	}

	function pause() {
		if (!tl) return;
		tl.pause();
		isActive = false;
	}

	function restart() {
		if (!tl) return;
		// prepareAnimation();
		tl.restart();
		isActive = true;
	}

	function handleSliderChange(event) {
		if (!tl) return;
		const newProgress = parseFloat(event.target.value);
		tl.progress(newProgress);
		pause();
	}

	const playControl = () => {
		isActive = tl.isActive();
		if (progress < 1 && isActive) {
			pause();
		} else if (progress < 1 && !isActive) {
			play();
		} else if (progress >= 1) {
			restart();
		}
	};
</script>

<div class="play-control flex items-center">
	<Button class="!p-1 focus-within:ring-0" color="none" on:click={playControl}
		>{#if isActive}
			<svg
				class="h-3 w-3 text-gray-600"
				stroke="currentColor"
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 -960 960 960"
				><path
					d="M360-320h80v-320h-80v320Zm160 0h80v-320h-80v320ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Z"
				/></svg
			>{:else}
			<svg
				class="h-3 w-3 text-gray-600"
				stroke="currentColor"
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 -960 960 960"
				><path
					d="m380-300 280-180-280-180v360ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Z"
				/></svg
			>
		{/if}</Button
	>

	{#if slider}
		<input
			class={classNames(
				'range range-sm',
				'h-1 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 dark:bg-gray-700'
			)}
			type="range"
			min="0"
			max="1"
			step="0.01"
			bind:value={progress}
			on:input={handleSliderChange}
		/>{/if}
</div>

<style lang="scss">
	input[type='range']::-webkit-slider-thumb {
		height: 0.8rem !important;
		width: 0.8rem !important;
		border: 3px solid #fff;
		background-color: #d1d5db;
		&:hover {
			background-color: #9ca3af;
		}
	}
	input[type='range']::-moz-range-thumb {
		height: 0.8rem !important;
		width: 0.8rem !important;
		border: 3px solid #fff;
	}
	input[type='range']::-ms-thumb {
		height: 0.8rem !important;
		width: 0.8rem !important;
		border: 3px solid #fff;
	}
</style>

<script lang="ts">
	import { Radio } from 'flowbite-svelte';
	import { sampling } from '~/store';
	import HelpPopover from './common/HelpPopover.svelte';
	import Slider from './common/Slider.svelte';

	export let disabled: boolean = false;

	$: samplingValMax = $sampling.type === 'top-k' ? 50 : 1;
	$: samplingValMin = $sampling.type === 'top-k' ? 1 : 0.1;
	$: samplingValStep = $sampling.type === 'top-k' ? 1 : 0.1;
</script>

<div class="sampling-input" data-click="input-sampling">
	<Slider
		{disabled}
		className="sampling-slider"
		min={samplingValMin}
		max={samplingValMax}
		step={samplingValStep}
		bind:value={$sampling.value}
		valueText={`${$sampling.type === 'top-k' ? 'k' : 'p'}=${$sampling.value}`}
	>
		<div class="sampling-type">
			<div class="title flex items-center gap-[2px]">
				<div>Sampling</div>
				<HelpPopover id="sampling-help" placement="right" goTo="article-sampling">
					{`Changes how next \ntoken is selected from \nprobability distribution.`}
				</HelpPopover>
			</div>
			<div class="sampling-type-input flex">
				<Radio
					class={`type-btn ${disabled ? 'disabled' : ''}`}
					inline
					value="top-k"
					on:click={(e) => {
						e.stopPropagation();
					}}
					on:change={(e) => {
						e.target.checked && sampling.set({ type: 'top-k', value: 5 });
						window.dataLayer?.push({
							event: 'sampling-selected',
							sampling_type: 'top-k'
						});
					}}
					checked={$sampling.type === 'top-k'}
					{disabled}
					color="purple">Top-k</Radio
				>
				<Radio
					class={`type-btn ${disabled ? 'disabled' : ''}`}
					inline
					value="top-p"
					checked={$sampling.type === 'top-p'}
					on:click={(e) => {
						e.stopPropagation();
					}}
					on:change={(e) => {
						e.target.checked && sampling.set({ type: 'top-p', value: 0.5 });
						window.dataLayer?.push({
							event: 'sampling-selected',
							sampling_type: 'top-p'
						});
					}}
					{disabled}
					color="purple">Top-p</Radio
				>
			</div>
		</div>
	</Slider>
</div>

<style lang="scss">
	.sampling-type {
		display: flex;
		gap: 0.5rem;
		height: 1rem;
	}
	.sampling-type-input {
		display: flex;
		gap: 0.5rem;
	}

	:global(.type-btn) {
		font-size: 0.8rem;
		cursor: pointer;
		color: theme('colors.gray.900');
		font-weight: 400;
		line-height: 1.4;
	}
	:global(.type-btn.disabled) {
		cursor: not-allowed;
	}
	:global(.type-btn input) {
		width: 0.6rem;
		height: 0.6rem;
		margin-inline-end: 0.2rem;
		cursor: pointer;

		&:checked {
			background-size: 0.6rem 0.6rem;
		}
		&:focus {
			outline: none;
			box-shadow: none;
		}
		&:disabled {
			cursor: not-allowed;
		}
	}
	.sampling-input {
		height: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: space-between;
		position: relative;

		:global(.slider-container) {
			width: 7rem;
		}
	}
	.title {
		font-size: 1rem;
		white-space: nowrap;
		flex-shrink: 0;
		font-size: 0.8rem;
		line-height: 0;
		font-weight: 500;
		color: theme('colors.gray.600');
	}
</style>

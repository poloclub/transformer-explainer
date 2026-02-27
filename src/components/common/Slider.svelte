<script lang="ts">
	import { userId } from '~/store';

	export let className: string | undefined;
	export let disabled: boolean = false;
	export let min: number;
	export let max: number;
	export let step: number;
	export let value: number;
	export let valueText: string;
	export let onClick: (() => void) | undefined = undefined;

	let startValue = null;
	let endValue = null;

	function handleMouseDown() {
		startValue = valueText;
	}

	function handleMouseUp() {
		endValue = valueText;
		window.dataLayer?.push({
			event: `slider-interaction-${className}`,
			slider_start_value: startValue,
			slider_end_value: endValue,
			user_id: $userId
		});
	}
</script>

<div class={`slider-input shrink-0 text-gray-900 ${className}`}>
	<div class="slider-head flex w-full shrink-0 items-center justify-center">
		<slot></slot>
	</div>
	<div class="slider-container">
		<input
			{disabled}
			class="slider"
			type="range"
			{min}
			{max}
			{step}
			bind:value
			on:click={(e) => {
				e.preventDefault();
				e.stopPropagation();
				onClick?.();
			}}
			on:mousedown={handleMouseDown}
			on:mouseup={handleMouseUp}
		/>
		<div class="value">
			<p>{valueText}</p>
		</div>
	</div>
</div>

<style lang="scss">
	.slider-input {
		height: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: space-between;

		.slider-container {
			// height: 1rem;
			display: flex;
			align-items: center;
		}

		.value {
			white-space: nowrap;
			flex-shrink: 0;
			font-size: 0.9rem;
			line-height: 0;
			font-family: monospace;
			color: theme('colors.gray.800');
			margin-left: 0.5rem;
		}
	}

	.slider {
		-webkit-appearance: none; /* Override default CSS styles */
		appearance: none;
		border-radius: 0.25rem;
		width: 100%;
		height: 4px;
		background: theme('colors.gray.300');
		outline: none;
		opacity: 0.7;
	}

	/* WebKit-based browsers (Chrome, Safari, etc.) */
	.slider::-webkit-slider-thumb {
		-webkit-appearance: none; /* Override default look */
		appearance: none;
		width: 12px;
		height: 12px;
		border-radius: 50%;
		border: 1px solid theme('colors.gray.400');
		background: white;
		cursor: pointer;
	}

	/* Disabled state for WebKit-based browsers */
	.slider:disabled::-webkit-slider-thumb {
		background: theme('colors.gray.200');
		cursor: not-allowed;
	}

	/* Firefox */
	.slider::-moz-range-thumb {
		width: 12px;
		height: 12px;
		border-radius: 50%;
		border: 1px solid theme('colors.gray.400');
		background: white;
		cursor: pointer;
	}

	/* Disabled state for Firefox */
	.slider:disabled::-moz-range-thumb {
		background: theme('colors.gray.200');
		cursor: not-allowed;
	}

	/* Firefox track */
	.slider::-moz-range-track {
		width: 100%;
		height: 4px;
		background: theme('colors.gray.300');
		border-radius: 0.25rem;
	}

	/* Firefox progress part */
	.slider::-moz-range-progress {
		background: theme('colors.gray.300'); /* 채워진 부분의 색상 */
	}
</style>

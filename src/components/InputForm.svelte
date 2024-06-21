<script lang="ts">
	import Input from 'flowbite-svelte/Input.svelte';
	import Select from 'flowbite-svelte/Select.svelte';
	import Button from 'flowbite-svelte/Button.svelte';
	import ButtonGroup from 'flowbite-svelte/ButtonGroup.svelte';
	import Dropdown from 'flowbite-svelte/Dropdown.svelte';
	import DropdownItem from 'flowbite-svelte/DropdownItem.svelte';
	import Temperature from './Temperature.svelte';
	import TokenGenerator from './TokenGenerator.svelte';

	import { ArrowRightOutline, ChevronDownOutline } from 'flowbite-svelte-icons';
	import {
		inputText,
		selectedModel,
		modelData,
		isModelRunning,
		temperature,
		predictedToken,
		inputTextExample,
		isFetchingModel,
		expandedBlock,
		selectedExampleIdx
	} from '~/store';
	import { Spinner } from 'flowbite-svelte';
	import LoadingDots from './LoadingDots.svelte';
	import classNames from 'classnames';

	let inputRef: HTMLDivElement;
	let inputTextTemp = $inputText;

	$: predictedTokenTemp = $predictedToken?.token || '';

	const onFocusInput = (e) => {
		// set predicted to empty
		predictedTokenTemp = '';
		//add predicted token to inputText
		inputTextTemp = e.target?.textContent;
	};

	const onInput = (e) => {
		const userInput = e.target?.querySelector('.user-input');
		inputTextTemp = userInput.innerText;
	};

	const handleSubmit = (e) => {
		// set predicted to empty
		predictedTokenTemp = '';
		// add predicted token to inputText
		inputTextTemp = inputRef?.textContent?.trim() || '';

		inputText.set(inputTextTemp);
	};

	const handleKeyDown = (e) => {
		if (e.key === 'Enter') {
			handleSubmit(e);
		}
	};

	let dropdownOpen = false;
	const onSelectExample = (d, i) => {
		dropdownOpen = false;
		inputTextTemp = d;
		predictedTokenTemp = '';
		inputText.set(d.trim());
		selectedExampleIdx.set(i);
	};

	$: isLoading = $isFetchingModel || $isModelRunning;
	$: disabled = $isFetchingModel || $isModelRunning || $expandedBlock.id !== null;
</script>

<div class="input-area flex flex-shrink-0">
	<!-- <div class="flex items-center gap-1 whitespace-nowrap"> -->
	<!-- <Label>Model</Label> -->
	<!-- <Select
			items={[
				{ value: 'gpt2-sm', name: 'gpt2-sm' },
				{ value: 'gpt2-md', name: 'gpt2-md' },
				{ value: 'gpt2', name: 'gpt2' }
			]}
			bind:value={$selectedModel}
			size="sm"
		/> -->
	<!-- </div> -->
	<div class="flex flex-1 items-center gap-1 whitespace-nowrap">
		<form class=" flex w-full items-center gap-2">
			<ButtonGroup class="w-full grow" size="sm">
				<button
					type="button"
					{disabled}
					class:disabled
					class="select-button inline-flex items-center justify-center border border-s-0 border-gray-200 bg-white px-3 py-2 text-center text-xs font-medium text-gray-900 first:rounded-s-lg first:border-s last:rounded-e-lg"
				>
					Examples<ChevronDownOutline class="pointer-events-none h-4 w-4 text-gray-500" />
				</button>
				<Dropdown placement="bottom-start" bind:open={dropdownOpen}>
					{#each inputTextExample as text, index}
						<DropdownItem
							on:click={() => {
								onSelectExample(text, index);
							}}>{text}</DropdownItem
						>
					{/each}
				</Dropdown>
				<div class="input-container relative" class:disabled>
					<div
						bind:this={inputRef}
						contenteditable={!disabled}
						class="input-box"
						placeholder="Test your own input text"
						on:focus={onFocusInput}
						on:input={onInput}
						on:keydown={handleKeyDown}
						role="input"
					>
						<span class="user-input">{inputTextTemp}</span><span class="predicted"
							>{predictedTokenTemp}</span
						>
					</div>
					{#if isLoading}
						<div class="loading"><LoadingDots /></div>
					{/if}
					{#if $isFetchingModel}
						<span class="helper-text"
							>Try the examples while GPT-2 model is being downloaded (600MB)</span
						>{/if}
				</div>
			</ButtonGroup>
			<button
				{disabled}
				class={classNames('generate-button rounded-lg text-center text-sm shadow-sm', {
					disabled,
					active: !disabled
				})}
				type="submit"
				on:click={handleSubmit}
			>
				Generate
			</button>
		</form>
	</div>
	<Temperature disabled={isLoading} />
</div>

<style lang="scss">
	.input-area {
		gap: 1rem;
		padding-left: 1rem;
		padding-right: 1.25rem;
	}
	.predicted {
		color: red;
	}
	.select-button {
		flex-shrink: 0;
		border: 1px solid theme('colors.gray.300');
		// background-color: theme('colors.gray.50');
		color: theme('colors.gray.900');
		&:hover {
			background-color: theme('colors.gray.100');
		}
		&:focus {
			outline: none;
		}
		&.disabled {
			cursor: not-allowed;
		}
	}
	.input-container {
		display: flex;
		flex: 1 0 0;
		align-items: center;

		border: 1px solid theme('colors.gray.300');
		color: theme('colors.gray.900');
		border-left: none;
		border-start-end-radius: 0.5rem;
		border-end-end-radius: 0.5rem;
		font-size: 0.9rem;
		line-height: 1rem;
		padding: 0.5rem;
		width: 100%;

		white-space: pre-wrap;
		gap: 0.3rem;
		.input-box {
			// flex: 1 0 0;
			white-space: nowrap;
			&:focus {
				outline: none;
			}
		}
		&.disabled {
			cursor: not-allowed;
		}
		input {
			width: 100%;
		}
		.loading {
			flex-shrink: 0;
		}
		.predicted {
			color: var(--predicted-color);
			font-weight: 600;
		}
	}
	.helper-text {
		position: absolute;
		bottom: 0;
		right: 0;
		transform: translate(0, calc(100% + 4px));
		color: theme('colors.gray.400');
		font-size: 0.8rem;
	}
	:global(.generate-button) {
		padding: 0.4rem 0.8rem;
		border: 1px solid theme('colors.gray.300');
		color: theme('colors.gray.900');
		transition: all 0.2s;
	}
	:global(.generate-button.active) {
		&:hover {
			border: 1px solid var(--predicted-color);
			color: var(--predicted-color);
		}
	}
	:global(.generate-button.disabled) {
		opacity: 1;
		background-color: theme('colors.gray.100');
		color: theme('colors.gray.400');
		cursor: not-allowed;
	}

	:global(.generate-button):focus {
		border: 1px solid var(--predicted-color);
		color: var(--predicted-color);
	}
</style>

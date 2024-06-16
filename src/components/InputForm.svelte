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
		inputTextExample
	} from '~/store';
	import { Spinner } from 'flowbite-svelte';
	import LoadingDots from './LoadingDots.svelte';

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
		inputTextTemp = inputRef?.textContent || '';

		inputText.set(inputTextTemp);
	};
</script>

<div class="input-area flex flex-shrink-0 gap-4 p-1.5 px-5">
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
				<Button size="xs" class="select-button">
					Example<ChevronDownOutline class="pointer-events-none h-4 w-4 text-gray-500" />
				</Button>
				<Dropdown>
					{#each inputTextExample as text}
						<DropdownItem>{text}</DropdownItem>
					{/each}
				</Dropdown>
				<div class="input-container">
					<div
						bind:this={inputRef}
						contenteditable={!$isModelRunning}
						class="input-box"
						placeholder="Test your own input text"
						on:focus={onFocusInput}
						on:input={onInput}
					>
						<span class="user-input">{inputTextTemp}</span><span class="predicted"
							>{predictedTokenTemp}</span
						>
					</div>
					{#if $isModelRunning}
						<div class="loading"><LoadingDots /></div>
					{/if}
				</div>
			</ButtonGroup>
			<Button
				disabled={$isModelRunning}
				class="generate-button"
				type="submit"
				size="sm"
				on:click={handleSubmit}
			>
				Generate
			</Button>
		</form>
	</div>
	<Temperature />
</div>

<style lang="scss">
	.predicted {
		color: red;
	}
	:global(.select-button) {
		flex-shrink: 0;
		border: 1px solid theme('colors.gray.300');
		background-color: theme('colors.gray.100');
		color: theme('colors.gray.900');
		&:hover {
			background-color: theme('colors.gray.200');
		}
		&:focus {
			outline: none;
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

		input {
			width: 100%;
		}
		.loading {
			flex-shrink: 0;
		}
		.predicted {
			color: theme('colors.orange.400');
			// background-color: theme('colors.blue.100');
			// padding: 0.1rem;
		}
	}
	:global(.generate-button) {
		padding: 0.4rem 0.8rem;
		border: 1px solid theme('colors.orange.400');
		color: theme('colors.orange.400');
		transition: all 0.2s;

		&:hover {
			background-color: theme('colors.orange.100');
		}
	}
	:global(.generate-button):focus {
		outline: none;
	}
</style>

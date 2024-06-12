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
		predictedToken
	} from '~/store';
	import { Spinner } from 'flowbite-svelte';
	import LoadingDots from './LoadingDots.svelte';

	let inputRef: HTMLDivElement;

	// initial value is initial inputText
	let inputTextTemp = $inputText;

	$: predictedTokenTemp = $predictedToken?.token || '';

	const onFocusInput = (e) => {
		// set predicted empty
		predictedTokenTemp = '';
		//add predicted token to inputText
		inputTextTemp = e.target?.textContent;
	};

	const onInput = (e) => {
		const userInput = e.target?.querySelector('.user-input');
		inputTextTemp = userInput.innerText;
	};

	const handleSubmit = (e) => {
		// set predicted empty
		predictedTokenTemp = '';
		//add predicted token to inputText
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
				<Button
					size="xs"
					color="none"
					class="flex-shrink-0 border border-gray-300 bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-inset focus:ring-gray-300 dark:border-gray-700 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-700 dark:focus:ring-gray-800"
				>
					Select Example<ChevronDownOutline class="pointer-events-none h-4 w-4 text-gray-500" />
				</Button>
				<Dropdown>
					<DropdownItem>test1</DropdownItem>
					<DropdownItem>test2</DropdownItem>
					<DropdownItem>test3</DropdownItem>
					<DropdownItem>test4</DropdownItem>
				</Dropdown>
				<div
					bind:this={inputRef}
					contenteditable={!$isModelRunning}
					class="focus:border-none focus:ring-2 focus:ring-inset focus:ring-gray-300"
					placeholder="Test your own input text"
					on:focus={onFocusInput}
					on:input={onInput}
				>
					<span class="user-input">{inputTextTemp}</span><span class="predicted"
						>{predictedTokenTemp}</span
					>
				</div>
				{#if $isModelRunning}
					<LoadingDots />
				{/if}
			</ButtonGroup>
			<Button
				disabled={$isModelRunning}
				color="blue"
				class="!p-1.5 focus:ring-inset"
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
	.input-container {
		border: 1px solid theme('colors.gray.300');
		border-left: none;
		border-start-end-radius: 0.5rem;
		border-end-end-radius: 0.5rem;
		font-size: 0.75rem;
		line-height: 1rem;
		padding: 0.5rem;
		width: 100%;
		border-color: theme('colors.gray.300');

		input {
			width: 100%;
		}
	}
</style>

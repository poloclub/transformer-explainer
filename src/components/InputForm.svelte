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
	import { inputText, selectedModel } from '~/store';

	let inputTextTemp = $inputText;

	function handleSubmit() {
		inputText.set(inputTextTemp);
	}
</script>

<div class="input-area flex flex-shrink-0 gap-4 p-1.5 px-5">
	<div class="flex items-center gap-1 whitespace-nowrap">
		<!-- <Label>Model</Label> -->
		<Select
			items={[
				{ value: 'gpt2-sm', name: 'gpt2-sm' },
				{ value: 'gpt2-md', name: 'gpt2-md' },
				{ value: 'gpt2', name: 'gpt2' }
			]}
			bind:value={$selectedModel}
			size="sm"
		/>
	</div>
	<div class="flex flex-1 items-center gap-1 whitespace-nowrap">
		<form class="w-full">
			<ButtonGroup class="w-full" size="sm">
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
				<Input
					class="focus:border-none focus:ring-2 focus:ring-inset focus:ring-gray-300"
					size="sm"
					placeholder="Test your own input text"
					bind:value={inputTextTemp}
				/>
				<Button
					color="primary"
					class="!p-1.5 focus:ring-inset"
					type="submit"
					size="xs"
					on:click={handleSubmit}
				>
					<ArrowRightOutline class="pointer-events-none h-5 w-5" />
				</Button>
			</ButtonGroup>
		</form>
	</div>
	<TokenGenerator />
	<Temperature />
</div>

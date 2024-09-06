<script lang="ts">
	import ButtonGroup from 'flowbite-svelte/ButtonGroup.svelte';
	import Dropdown from 'flowbite-svelte/Dropdown.svelte';
	import DropdownItem from 'flowbite-svelte/DropdownItem.svelte';
	import Temperature from './Temperature.svelte';
	import { ex0, ex1, ex2, ex3, ex4 } from '~/constants/examples';

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
		selectedExampleIdx,
		tokens,
		isLoaded,
		modelSession
	} from '~/store';
	import { Spinner } from 'flowbite-svelte';
	import LoadingDots from './LoadingDots.svelte';
	import classNames from 'classnames';
	import { tick } from 'svelte';

	let inputRef: HTMLDivElement;
	let predictRef: HTMLDivElement;

	$: inputTextTemp = $inputText || '';

	$: predictedTokenTemp = $predictedToken?.token || '';

	const wordLimit = 12;
	$: exceedLimit = inputTextTemp.split(' ').length >= wordLimit;

	// Text input
	const onFocusInput = (e) => {
		let formattedString = (inputTextTemp + predictedTokenTemp).replace(/[\s\n]+/g, ' ');

		inputTextTemp = formattedString;

		// set predicted to empty
		predictedTokenTemp = '';
		// set input box text
		inputRef.innerText = inputTextTemp;
	};

	const onInput = (e) => {
		inputTextTemp = inputRef.innerText;
	};

	const handleSubmit = (e) => {
		onFocusInput();
		inputText.set(inputTextTemp);
	};

	const handleKeyDown = (e) => {
		if (e.key === 'Enter') {
			e.preventDefault();
			if (disabled || exceedLimit) return;
			handleSubmit(e);
		}
	};

	// Example select box
	let dropdownOpen = false;
	const initialDataMap = [ex0, ex1, ex2, ex3, ex4];
	const onSelectExample = (d, i) => {
		dropdownOpen = false;

		inputTextTemp = d;
		inputRef.innerText = inputTextTemp;

		predictedTokenTemp = '';
		inputText.update((prev) => {
			if (prev === d.trim()) {
				return d + ' ';
			}
			return d.trim();
		});
		selectedExampleIdx.set(i);

		if ($isFetchingModel || !$modelSession) {
			const initialData = initialDataMap[i];
			modelData.set(initialData);
			predictedToken.set(initialData.sampled);
			tokens.set(initialData.tokens);
		}
	};

	const moveCursorToEnd = (element) => {
		const range = document.createRange();
		const sel = window.getSelection();
		range.selectNodeContents(element);
		range.collapse(false);
		sel.removeAllRanges();
		sel.addRange(range);
		element.focus();
	};

	$: isLoading = $isFetchingModel || $isModelRunning;
	$: disabled = $isFetchingModel || $isModelRunning || $expandedBlock.id !== null;
	$: selectDisabled = $isModelRunning || $expandedBlock.id !== null;
</script>

<div class="input-area">
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

	<form class="input-form">
		<ButtonGroup class="input-btn-group" size="sm">
			<button
				type="button"
				disabled={selectDisabled}
				class:selectDisabled
				class="select-button inline-flex shrink-0 items-center justify-center border border-s-0 border-gray-200 bg-white px-3 py-2 text-center text-xs font-medium text-gray-900 first:rounded-s-lg first:border-s last:rounded-e-lg"
			>
				Examples<ChevronDownOutline class="pointer-events-none h-4 w-4 text-gray-500" />
			</button>
			<Dropdown placement="bottom-start" bind:open={dropdownOpen} class="example-dropdown">
				{#each inputTextExample as text, index}
					<DropdownItem
						class={$selectedExampleIdx === index && 'active'}
						on:click={() => {
							onSelectExample(text, index);
						}}>{text}</DropdownItem
					>
				{/each}
			</Dropdown>

			<div
				class="input-container"
				class:disabled
				on:click={(e) => {
					e.stopPropagation();
					inputRef.focus();
					moveCursorToEnd(inputRef);
				}}
			>
				<div class={`editable ${!$isModelRunning ? 'w-full' : ''}`}>
					<div
						bind:this={inputRef}
						contenteditable={!disabled}
						class="text-box"
						placeholder="Test your own input text"
						on:focus={onFocusInput}
						on:input={onInput}
						on:keydown={handleKeyDown}
						on:click={(e) => {
							e.stopPropagation();
						}}
						role="input"
					>
						{inputTextTemp}
					</div>
					<div
						bind:this={predictRef}
						class="predicted"
						role="none"
						on:click={(e) => {
							e.stopPropagation();
							onFocusInput(e);
							inputRef.focus();
							moveCursorToEnd(inputRef);
						}}
					>
						<span>{predictedTokenTemp}</span>
					</div>
				</div>
				{#if $isModelRunning}
					<div class="loading"><LoadingDots /></div>
				{/if}
				{#if $isLoaded && $isFetchingModel}
					<span class="helper-text"
						>Try the examples while GPT-2 model is being downloaded (600MB)</span
					>
				{:else if exceedLimit}
					<span class="helper-text">You can enter up to {wordLimit} words.</span>
				{/if}
			</div>
		</ButtonGroup>
		<button
			disabled={disabled || exceedLimit || exceedLimit}
			class={classNames('generate-button rounded-lg text-center text-sm shadow-sm', {
				disabled: disabled || exceedLimit,
				active: !(disabled || exceedLimit)
			})}
			type="submit"
			on:click={handleSubmit}
		>
			Generate
		</button>
	</form>
	<Temperature disabled={isLoading} />
</div>

<style lang="scss">
	.input-area {
		width: 100%;
		flex-shrink: 0;
		display: flex;
		gap: 1rem;
		padding-left: 1rem;
		padding-right: 1.25rem;

		.input-form {
			width: 100%;
			flex: 1 0 0;
			display: flex;
			align-items: center;
			gap: 0.5rem;

			:global(.input-btn-group) {
				flex: 1 0 0;
				display: flex;
			}
		}
	}
	.input-container {
		position: relative;
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
		white-space: pre-wrap;
		gap: 0.3rem;

		width: 10px; // to keep input box width

		.editable {
			overflow-y: hidden;
			justify-content: end; // to show the last word

			display: flex;
			align-items: center;
			overflow-x: hidden;
			white-space: nowrap;

			.text-box {
				white-space: nowrap;
				br {
					display: none;
				}

				&:focus {
					outline: none;
				}
			}
			.predicted {
				// flex-shrink: 0;
				flex: 1 0 0;
				color: var(--predicted-color);
				font-weight: 600;
				span {
					white-space: pre;
				}
			}
		}

		&.disabled {
			cursor: not-allowed;
		}

		.loading {
			flex-shrink: 0;
		}
	}

	.select-button {
		flex-shrink: 0;
		font-size: 0.8rem;
		border: 1px solid theme('colors.gray.300');
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
	:global(.example-dropdown) {
		:global(.active) {
			background-color: theme('colors.gray.100') !important;
		}
	}
	.helper-text {
		position: absolute;
		bottom: 0;
		right: 0;
		padding: 0.3rem 0;
		transform: translate(0, 100%);
		color: theme('colors.gray.400');
		font-size: 0.9rem;
	}
	:global(.generate-button) {
		padding: 0.4rem 0.8rem;
		border: 1px solid theme('colors.gray.300');
		color: theme('colors.gray.900');
		transition: all 0.2s;
		flex-shrink: 0;
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

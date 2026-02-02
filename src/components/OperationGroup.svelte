<script lang="ts">
	import classNames from 'classnames';
	import Operation from './Operation.svelte';
	import DropoutPopover from './Popovers/DropoutPopover.svelte';
	import { tokens } from '~/store';
	import LayerNormPopover from './Popovers/LayerNormPopover.svelte';
	import ActivationPopover from './Popovers/ActivationPopover.svelte';
	import ResidualPopover from './Popovers/ResidualPopover.svelte';
	import { onClickReadMore } from '~/utils/event';
	import { drawResidualLine } from '~/utils/animation';
	import {
		isTextbookOpen,
		textbookCurrentPage,
		textbookCurrentPageId,
		textbookPreviousPage
	} from '~/store';
	import { textPages } from '~/utils/textbookPages';

	export let id: string;
	export let className: string | undefined = undefined;
	export let type: string | undefined = undefined;

	const { drawLine, removeLine } = drawResidualLine(id);
	let isHovered = false;
	let containerElement;

	const onMouseOver = () => {
		if ($isTextbookOpen && $textbookCurrentPageId === 'residual') return;
		isHovered = true;
		drawLine();
	};
	const onMouseOut = () => {
		if ($isTextbookOpen && $textbookCurrentPageId === 'residual') return;
		isHovered = false;
		removeLine();
	};

	const typeToPageIdMap = {
		activation: 'mlp',
		dropout: 'dropout',
		ln: 'layer-normalization',
		'residual-start': 'residual',
		'residual-end': 'residual'
	};

	function openTextbookPage(e) {
		e.preventDefault();
		e.stopPropagation();

		const pageId = typeToPageIdMap[type];
		if (!pageId) return;

		const pageIndex = textPages.findIndex((page) => page.id === pageId);
		if (pageIndex !== -1) {
			textbookPreviousPage.set($textbookCurrentPage);
			isTextbookOpen.set(true);
			textbookCurrentPage.set(pageIndex);
			textbookCurrentPageId.set(pageId);
		}
	}
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
{#if type === 'activation'}
	<div
		{id}
		data-click="activation"
		class={classNames('operation-col column activation', className)}
		role="group"
		class:active={isHovered}
		bind:this={containerElement}
		on:mouseenter={() => {
			isHovered = true;
		}}
		on:mouseleave={() => {
			isHovered = false;
		}}
		on:click={openTextbookPage}
	>
		{#each $tokens as token, index}
			<Operation
				className={classNames(className, {
					last: index === $tokens.length - 1
				})}
				type="activation"
				head={index === 0}
				tail={index === $tokens.length - 1}
				active={isHovered}
			/>
		{/each}
	</div>
	<!-- <ActivationPopover triggeredBy={`#${id}`} offset={1} /> -->
{:else if type === 'dropout'}
	<div
		{id}
		data-click="dropout"
		class={classNames('operation-col column dropout', className)}
		role="group"
		class:active={isHovered}
		bind:this={containerElement}
		on:mouseenter={() => {
			isHovered = true;
		}}
		on:mouseleave={() => {
			isHovered = false;
		}}
		on:click={openTextbookPage}
	>
		{#each $tokens as token, index}
			<Operation
				className={classNames(className, {
					last: index === $tokens.length - 1
				})}
				type="dropout"
				tail={index === $tokens.length - 1}
				active={isHovered}
			/>
		{/each}
	</div>
	<!-- <DropoutPopover triggeredBy={`#${id}`} offset={1} /> -->
{:else if type === 'ln'}
	<div
		{id}
		data-click="layernorm"
		class={classNames('operation-col column ln', className)}
		role="group"
		class:active={isHovered}
		bind:this={containerElement}
		on:mouseenter={() => {
			isHovered = true;
		}}
		on:mouseleave={() => {
			isHovered = false;
		}}
		on:click={openTextbookPage}
	>
		{#each $tokens as token, index}
			<Operation
				className={classNames(className, {
					last: index === $tokens.length - 1
				})}
				type="ln"
				tail={index === $tokens.length - 1}
				active={isHovered}
			/>
		{/each}
	</div>
	<!-- <LayerNormPopover triggeredBy={`#${id}`} /> -->
{:else if type === 'residual-start'}
	<div
		data-click="residual-start"
		id={`${id}-start`}
		class={classNames('operation-col column residual', className)}
		role="group"
		class:active={isHovered}
		bind:this={containerElement}
		on:mouseenter={onMouseOver}
		on:mouseleave={onMouseOut}
		on:click={openTextbookPage}
	>
		{#each $tokens as token, index}
			<Operation
				{id}
				className={classNames(className, {
					last: index === $tokens.length - 1
				})}
				type="residual-start"
				head={index === 0}
				active={isHovered}
			/>
		{/each}
	</div>
	<!-- <ResidualPopover reference={`#${id}-start`} triggeredBy={`[id^='${id}-']`} offset={1} /> -->
{:else if type === 'residual-end'}
	<div
		id={`${id}-end`}
		data-click="residual-end"
		class={classNames('operation-col column residual', className)}
		role="group"
		class:active={isHovered}
		bind:this={containerElement}
		on:mouseenter={onMouseOver}
		on:mouseleave={onMouseOut}
		on:click={openTextbookPage}
	>
		{#each $tokens as token, index}
			<Operation
				{id}
				className={classNames(className, {
					last: index === $tokens.length - 1
				})}
				type="residual-end"
				head={index === 0}
				active={isHovered}
			/>
		{/each}
	</div>
{/if}

<style lang="scss">
	.column.operation-col {
		cursor: help;
		z-index: $ABOVE_COLUMN;
		height: fit-content;

		&.residual {
			opacity: 0.5 !important;
			&.active {
				opacity: 1 !important;
			}
		}

		&.active {
			z-index: $ABOVE_COLUMN;
			&::after {
				content: '';
				position: absolute;
				height: 100%;
				width: 1.3rem;
				z-index: $POPOVER_INDEX;
			}
		}
	}

	:global(.dropout-popover),
	:global(.ln-popover),
	:global(.residual-popover) {
		width: 10rem;
		z-index: $POPOVER_INDEX;
	}
</style>

<script lang="ts">
	import classNames from 'classnames';
	import Operation from './Operation.svelte';
	import DropoutPopover from './Popovers/DropoutPopover.svelte';
	import { tokens } from '~/store';
	import LayerNormPopover from './Popovers/LayerNormPopover.svelte';
	import ActivationPopover from './Popovers/ActivationPopover.svelte';
	import * as d3 from 'd3';
	import { onMount } from 'svelte';

	export let id: string;
	export let className: string | undefined = undefined;
	export let type: string | undefined = undefined;

	let isActivationHovered = false;
	let isDOHovered = false;
	let isRDHovered = false;
	let isRDEndHovered = false;
	let isLNHovered = false;

	onMount(() => {});
	const drawConnector = () => {
		const svg = d3.select('.sankey-top');

		const start = d3.select(`.residual-start.${className}`).node()?.getBoundingClientRect();
		const end = d3.select(`.residual-end.${className}`).node()?.getBoundingClientRect();

		const x1 = start.right;
		const y1 = start.top + start.height / 2;
		const x2 = end.left;
		const y2 = end.top + end.height / 2;

		svg
			.selectAll('.residual-connector line')
			.data([0])
			.join('line')
			.attr('class', 'residual-connector')
			.attr('x1', x1)
			.attr('y1', y1)
			.attr('x2', x2)
			.attr('y2', y2);
	};
</script>

{#if type === 'activation'}
	<div
		{id}
		class={classNames('column activation', className)}
		role="group"
		on:mouseenter={() => {
			isActivationHovered = true;
		}}
		on:mouseleave={() => {
			isActivationHovered = false;
		}}
	>
		{#each $tokens as token, index}
			<Operation
				className={classNames(className, {
					last: index === $tokens.length - 1
				})}
				type="activation"
				tail={index === $tokens.length - 1}
				active={isActivationHovered}
			/>
		{/each}
		<ActivationPopover triggeredBy={`#${id}`} offset={1} />
	</div>
{:else if type === 'dropout'}
	<div
		{id}
		class={classNames('column dropout', className)}
		role="group"
		on:mouseenter={() => {
			isDOHovered = true;
		}}
		on:mouseleave={() => {
			isDOHovered = false;
		}}
	>
		{#each $tokens as token, index}
			<Operation
				className={classNames(className, {
					last: index === $tokens.length - 1
				})}
				type="dropout"
				tail={index === $tokens.length - 1}
				active={isDOHovered}
			/>
		{/each}
		<DropoutPopover triggeredBy={`#${id}`} offset={1} />
	</div>
{:else if type === 'ln'}
	<div
		{id}
		class={classNames('column ln', className)}
		role="group"
		on:mouseenter={() => {
			isLNHovered = true;
		}}
		on:mouseleave={() => {
			isLNHovered = false;
		}}
	>
		{#each $tokens as token, index}
			<Operation
				className={classNames(className, {
					last: index === $tokens.length - 1
				})}
				type="ln"
				tail={index === $tokens.length - 1}
				active={isLNHovered}
			/>
		{/each}
		<LayerNormPopover triggeredBy={`#${id}`} open={isLNHovered} />
	</div>
{:else if type === 'residual-start'}
	<div
		id={`${id}-start`}
		class={classNames('column residual', className)}
		role="group"
		on:mouseenter={() => {
			isRDHovered = true;
		}}
		on:mouseleave={() => {
			isRDHovered = false;
		}}
	>
		{#each $tokens as token, index}
			<Operation
				className={classNames(className, {
					last: index === $tokens.length - 1
				})}
				type="residual-start"
				head={index === 0}
				active={isRDHovered}
			/>
		{/each}
	</div>
{:else if type === 'residual-end'}
	<div
		id={`${id}-end`}
		class={classNames('column residual', className)}
		role="group"
		on:mouseenter={() => {
			isRDEndHovered = true;
		}}
		on:mouseleave={() => {
			isRDEndHovered = false;
		}}
	>
		{#each $tokens as token, index}
			<Operation
				className={classNames(className, {
					last: index === $tokens.length - 1
				})}
				type="residual-end"
				head={index === 0}
				active={isRDEndHovered}
			/>
		{/each}
	</div>
{/if}

<style lang="scss">
	.column {
		// z-index: 200;
		height: fit-content;
	}
</style>

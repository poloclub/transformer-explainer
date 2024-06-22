<script lang="ts">
	import classNames from 'classnames';
	import MatrixSvg from './MatrixSvg.svelte';

	export let data: number[][];
	export let showSize: boolean | undefined | string = true;
	export let cellHeight: number;
	export let cellWidth: number;
	export let rowGap: number = 2;
	export let colGap: number = 0;
	export let cellGap: number = 0;
	export let showValue: boolean = false;
	export let groupBy: 'row' | 'col' = 'row';
	export let shape: 'circle' | 'rect' = 'rect';
	export let colorScale: string | ((t: number) => any) | undefined = undefined;

	export let className: string | undefined = undefined;
	export let title: string | undefined = undefined;
	export let titlePos: 't' | 'b' | undefined = 't';

	export let transpose: boolean = false;

	let rowLen: number = 0;
	let dimension: number = 0;

	$: {
		rowLen = data.length;
		dimension = data[0]?.length || 0;
	}

	$: props = {
		data,
		cellHeight,
		cellWidth,
		rowLen,
		dimension,
		rowGap,
		colGap,
		transpose,
		// showValue,
		groupBy,
		shape,
		colorScale
	};

	$: isDataReady = data.length > 0;
</script>

<div
	data-id="matrix"
	class={classNames(className, 'matrix-container flex flex-col items-center gap-1 leading-none')}
>
	{#if title && titlePos === 't'}
		<div class="leading-none">{title}</div>
	{/if}
	<div class={classNames('matrix inline-block  align-top')}>
		<slot name="inner-title" />
		{#if isDataReady}
			<MatrixSvg {...props} />
		{/if}
	</div>
	{#if title || showSize}
		<div class="flex flex-col items-center gap-0.5">
			{#if title && titlePos === 'b'}
				<div class="whitespace-nowrap leading-none text-gray-500">{title}</div>
			{/if}
			{#if showSize}
				{#if typeof showSize === 'string'}
					<div class="whitespace-nowrap leading-none text-gray-500">
						{showSize}
					</div>{:else}
					<div class="whitespace-nowrap leading-none text-gray-500">
						({rowLen}, {dimension})
					</div>
				{/if}
			{/if}
		</div>
	{/if}
</div>

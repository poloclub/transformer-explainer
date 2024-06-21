<script lang="ts">
	import { tokens, isBoundingBoxActive, modelMeta } from '~/store';
	import classNames from 'classnames';
	import { setContext } from 'svelte';
	import Operation from './Operation.svelte';
	import OperationGroup from './OperationGroup.svelte';
	import VectorCanvas from './VectorCanvas.svelte';
	import { Tooltip } from 'flowbite-svelte';

	export let className: string | undefined = undefined;

	setContext('block-id', 'mlp');

	const firstLayerlColor = 'bg-purple-200';
	const secondLayerColor = 'bg-indigo-200';
	const outputColor = 'bg-blue-200';

	let isHovered = false;

	function handleMouseEnter() {
		isHovered = true;
	}

	function handleMouseLeave() {
		isHovered = false;
	}

	let vectorHoverIdx: number | null = null;
</script>

<div class={classNames('mlp', className)}>
	<div class="title" on:mouseenter={handleMouseEnter} on:mouseleave={handleMouseLeave} role="group">
		MLP
	</div>
	<div class="content relative">
		<div class="bounding transformer-bounding" class:active={$isBoundingBoxActive}></div>
		<div class="bounding mlp-bounding" class:active={isHovered}></div>
		<div class="layer first-layer flex">
			<div class="column initial">
				{#each $tokens as token, index}
					<div
						class="cell"
						class:last={index === $tokens.length - 1}
						on:mouseenter={() => {
							vectorHoverIdx = index;
						}}
						on:mouseleave={() => {
							vectorHoverIdx = null;
						}}
						role="group"
					>
						<span class="label float">{token}</span>
						<div class={`vector flex flex-col  ${firstLayerlColor}`}>
							<VectorCanvas colorScale="purple" active={vectorHoverIdx === index} />
							<div class="sub-vector x1-12 head1"></div>
							<div class="sub-vector head-rest grow"></div>
						</div>
					</div>
					<Tooltip placement="right" class="popover">vector({$modelMeta.dimension})</Tooltip>
				{/each}
			</div>
			<OperationGroup type="dropout" id={'mlp-first-dropout'} />
			<OperationGroup type="residual-end" id={'residual-first'} />
			<OperationGroup type="ln" id={'mlp-first-ln'} />
			<OperationGroup type="residual-start" id={'residual-second'} />
		</div>
		<div class="layer second-layer flex justify-between">
			<div class="projections flex">
				<div class="column">
					{#each $tokens as token, index}
						<div
							class={classNames('cell x4', { small: index !== 0 && index !== $tokens.length - 1 })}
							class:last={index === $tokens.length - 1}
						>
							<div class={classNames(`vector x4 ${secondLayerColor} opacity-80`)}>
								<VectorCanvas colorScale="indigo" />
							</div>
						</div>
						<Tooltip placement="right" class="popover">vector({$modelMeta.dimension * 4})</Tooltip>
					{/each}
				</div>
				<OperationGroup type="activation" id={'mlp-activation'} className="x4" />
			</div>
			<div class="ouputs flex">
				<div class="column out-label">
					{#each $tokens as token, index}
						<div class="cell" class:last={index === $tokens.length - 1}>
							<span class="label float">{token}</span>
						</div>
					{/each}
				</div>
				<OperationGroup type="residual-end" id={'residual-second'} />
				<OperationGroup type="ln" id={'mlp-second-ln'} />
				<div class="column out">
					{#each $tokens as token, index}
						<div class="cell" class:last={index === $tokens.length - 1}>
							<div class={`vector ${outputColor}`}>
								<VectorCanvas colorScale="blue" />
							</div>
						</div>
						<Tooltip placement="right" class="popover">vector({$modelMeta.dimension})</Tooltip>
					{/each}
				</div>
			</div>
		</div>
	</div>
</div>

<style lang="scss">
	.mlp {
		.mlp-bounding {
			top: -0.5rem;
			padding: 0.5rem 0;
			left: -0.2rem;
			width: calc(100% + 0.2rem);
			height: 100%;
		}
		.transformer-bounding {
			border-radius: 0 10px 10px 0;
			padding-right: 0.5rem;
			right: -0.5rem;
			border-left: none;
		}
		.content {
			display: grid;
			grid-template-columns: repeat(4, minmax(var(--min-column-width), 1fr));

			.layer {
				grid-column: span 2;
			}
			.tokens.initial .token {
				/* gap: 0.6rem; */
			}

			.column.activation {
			}
		}
		.column.out-label {
			.label {
				opacity: 0;
			}
			.last .label {
				opacity: 1;
			}
		}
	}
	// .layer {
	// 	height: 500px;
	// 	display: flex;
	// 	align-items: center;
	// }
	// :global(.transformer-blocks .final) {
	// 	height: 500px !important;
	// 	display: flex !important;
	// 	align-items: center !important;
	// 	justify-content: center;
	// }
	// .projections {
	// 	.small {
	// 		height: 2px !important;

	// 		.vector {
	// 			height: 2px !important;
	// 		}
	// 	}
	// }
</style>

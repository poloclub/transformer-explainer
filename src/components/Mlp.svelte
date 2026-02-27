<script lang="ts">
	import { tokens, modelMeta, blockIdx, attentionHeadIdx, vectorHeight } from '~/store';
	import classNames from 'classnames';
	import { onMount, setContext } from 'svelte';
	import OperationGroup from './OperationGroup.svelte';
	import VectorCanvas from './common/VectorCanvas.svelte';
	import { Tooltip } from 'flowbite-svelte';
	import { onClickReadMore } from '~/utils/event';
	import TextbookTooltip from '~/components/common/TextbookTooltip.svelte';

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

	// attentionHeadIdx subscribe
	const headCursors = {};

	onMount(() => {
		const unsubscribe = attentionHeadIdx.subscribe(async (newIdx) => {
			Object.values(headCursors).forEach((el) => {
				el.style.top = `${($vectorHeight / $modelMeta.attention_head_num) * newIdx}px`;
			});
		});

		return () => {
			unsubscribe();
		};
	});
</script>

<div class={classNames('mlp', 'mlpUp', 'mlpDown', className)} data-click="mlp-step">
	<div
		class="title"
		on:mouseenter={handleMouseEnter}
		on:mouseleave={handleMouseLeave}
		role="group"
		data-click="mlp-step-title"
	>
		<div class="w-max">
			<TextbookTooltip id="mlp">MLP</TextbookTooltip>
		</div>
	</div>

	<div class="content relative">
		<div class="bounding mlp-bounding" class:active={isHovered}></div>
		<div class="layer mlpUp first-layer flex">
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
							<div
								class="sub-vector x1-12 head1 absolute"
								bind:this={headCursors[`token${index}_out`]}
							></div>
							<div class="sub-vector head-rest grow"></div>
						</div>
					</div>
				{/each}
			</div>
			<Tooltip triggeredBy={'.step.mlp .initial .cell'} class="popover" placement="right">
				vector({$modelMeta.dimension})</Tooltip
			>
			<OperationGroup type="dropout" id={'mlp-first-dropout'} />
			<OperationGroup type="residual-end" id={'embedding-residual'} />
			<OperationGroup type="ln" id={'mlp-first-ln'} />
			<OperationGroup type="residual-start" id={'mlp-residual'} />
		</div>
		<div class="layer mlpUp mlpDown second-layer flex justify-between">
			<div class="column mlp-mid-column">
				{#each $tokens as token, index}
					<div
						class={classNames('cell x4', { small: index !== 0 && index !== $tokens.length - 1 })}
						class:last={index === $tokens.length - 1}
					>
						<div class={classNames(`vector x4 ${secondLayerColor} opacity-80`)}>
							<VectorCanvas colorScale="indigo" />
						</div>
					</div>
				{/each}
			</div>
		</div>
		<Tooltip triggeredBy={'.step.mlp .mlp-mid-column .cell'} class="popover" placement="right">
			vector({$modelMeta.dimension * 4})</Tooltip
		>
		<div class="layer mlpDown out-layer relative flex justify-between">
			<div class="activation">
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
				<OperationGroup type="residual-end" id={'mlp-residual'} />
				<OperationGroup type="ln" id={'mlp-second-ln'} />
				<div
					class="column out mlp-out-column"
					class:last-block={$blockIdx === $modelMeta.layer_num - 1}
				>
					{#each $tokens as token, index}
						<div class="cell" class:last={index === $tokens.length - 1}>
							<div class={`vector ${outputColor}`}>
								<VectorCanvas colorScale="blue" />
							</div>
						</div>
					{/each}
				</div>
				<Tooltip triggeredBy={'.step.mlp .mlp-out-column .cell'} class="popover" placement="right">
					vector({$modelMeta.dimension})</Tooltip
				>
			</div>
		</div>
	</div>
</div>

<style lang="scss">
	.mlp {
		.title > div {
			// cursor: help;
		}

		.mlp-bounding {
			top: -0.5rem;
			padding: 0.5rem 0;
			left: -0.2rem;
			width: calc(100% + 0.2rem);
			height: 100%;
		}
		.content {
			display: grid;
			grid-template-columns: repeat(4, minmax(var(--min-column-width), 1fr));

			.first-layer {
				grid-column: span 2;
			}

			.activation {
				position: relative;
				left: calc(-100% + 0.8rem);
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
		.last-block {
			pointer-events: none;
			.vector {
				width: 0;
			}
		}
	}
</style>

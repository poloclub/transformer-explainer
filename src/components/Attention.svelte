<script lang="ts">
	import HeadStack from '~/components/HeadStack.svelte';
	import {
		tokens,
		modelMeta,
		isBoundingBoxActive,
		headContentHeight,
		expandedBlock,
		headGap,
		hoveredMatrixCell
	} from '~/store';
	import classNames from 'classnames';
	import AttentionMatrix from '~/components/AttentionMatrix.svelte';
	import { setContext, getContext } from 'svelte';
	import VectorCanvas from './VectorCanvas.svelte';
	import { Tooltip } from 'flowbite-svelte';
	import { active } from 'd3';

	export let className: string | undefined = undefined;

	setContext('block-id', 'attention');
	const blockId = getContext('block-id');
	$: isAttentionExpanded = $expandedBlock.id === blockId;

	const queryVectorColor = 'bg-blue-200';
	const keyVectorColor = 'bg-red-200';
	const valVectorColor = 'bg-green-200';

	const queryHeadVectorColor = 'bg-blue-300';
	const keyHeadVectorColor = 'bg-red-300';
	const valHeadVectorColor = 'bg-green-300';

	const outputVectorColor = 'bg-purple-300';

	let isHovered = false;

	function handleMouseEnter() {
		isHovered = true;
	}

	function handleMouseLeave() {
		isHovered = false;
	}

	let vectorHoverIdx: number | null = null;
</script>

<div class={classNames('attention', className, { expanded: isAttentionExpanded })}>
	<div class="title" on:mouseenter={handleMouseEnter} on:mouseleave={handleMouseLeave} role="group">
		<div>Multi-head Self Attention</div>
	</div>
	<div class="content relative">
		<div class="bounding transformer-bounding" class:active={$isBoundingBoxActive}>
			<div class="bounding-title">Transformer Block 1</div>
		</div>
		<div
			class="bounding attention-bounding"
			class:active={isHovered && !isAttentionExpanded}
			style={`padding-bottom:${$modelMeta.attention_head_num * headGap.y}px`}
		></div>
		<!-- <div class="title absolute top-0">First Transformer Block</div> -->

		<div class="column">
			{#each $tokens as token, index}
				<div
					class="qkv-weighted vector x3 flex flex-col"
					class:last={index === $tokens.length - 1}
					on:mouseenter={() => {
						vectorHoverIdx = index;
					}}
					on:mouseleave={() => {
						vectorHoverIdx = null;
					}}
					role="group"
				>
					<div class={`sub-vector query relative flex grow flex-col ${queryVectorColor}`}>
						<VectorCanvas colorScale="blue" active={vectorHoverIdx === index} />
						<div class={`sub-vector x1-12 head1 ${queryHeadVectorColor}`}></div>
						<div class="sub-vector head-rest grow">
							{#if vectorHoverIdx !== index}<span>Q</span>{/if}
						</div>
					</div>
					<div class={`sub-vector key relative flex grow flex-col ${keyVectorColor}`}>
						<VectorCanvas colorScale="red" active={vectorHoverIdx === index} />
						<div class={`sub-vector x1-12 head1 ${keyHeadVectorColor}`}></div>
						<div class="sub-vector head-rest grow">
							{#if vectorHoverIdx !== index}<span>K</span>{/if}
						</div>
					</div>
					<div class={`sub-vector value relative flex grow flex-col ${valVectorColor}`}>
						<VectorCanvas colorScale="green" active={vectorHoverIdx === index} />
						<div class={`sub-vector x1-12 head1 ${valHeadVectorColor}`}></div>
						<div class="sub-vector head-rest grow">
							{#if vectorHoverIdx !== index}<span>V</span>{/if}
						</div>
					</div>
				</div>
				<Tooltip placement="right" class="popover">vector({$modelMeta.dimension * 3})</Tooltip>
			{/each}
		</div>
		<div class="heads">
			<HeadStack>
				<div
					class="head-block flex w-full items-center justify-between px-2"
					style={`height:${$headContentHeight}px;`}
				>
					<div class="qkv flex h-full flex-col justify-center gap-[5rem] pl-[6rem]">
						<div class="column key">
							<div class="title">Key</div>

							{#each $tokens as token, index}
								<div
									class="head1 key cell x1-12 text-xs class:last={index === $tokens.length - 1}"
									class:active={$hoveredMatrixCell.col === index}
								>
									<span class="label float">{token}</span>
									<div class={`vector x1-12 ${keyHeadVectorColor}`}></div>
								</div>
								<Tooltip placement="right" class="popover"
									>Key, Head 1, vector({$modelMeta.dimension /
										$modelMeta.attention_head_num})</Tooltip
								>
							{/each}
						</div>
						<div class="column query">
							<div class="title">Query</div>
							{#each $tokens as token, index}
								<div
									class="head1 cell x1-12 query text-xs"
									class:last={index === $tokens.length - 1}
									class:active={$hoveredMatrixCell.row === index}
								>
									<span class="label float">{token}</span>
									<div class={`vector x1-12  ${queryHeadVectorColor}`}></div>
								</div>
								<Tooltip placement="right" class="popover"
									>Query, Head 1, vector({$modelMeta.dimension /
										$modelMeta.attention_head_num})</Tooltip
								>
							{/each}
						</div>
						<div class="column value">
							<div class="title">Value</div>
							{#each $tokens as token, index}
								<div class="head1 cell x1-12 text-xs" class:last={index === $tokens.length - 1}>
									<span class="label float">{token}</span>
									<div class={`vector x1-12 ${valHeadVectorColor}`}></div>
								</div>
								<Tooltip placement="right" class="popover"
									>Value, Head 1, vector({$modelMeta.dimension /
										$modelMeta.attention_head_num})</Tooltip
								>
							{/each}
						</div>
					</div>
					<div class="resize-watch attention-matrix flex">
						<AttentionMatrix />
					</div>
					<div class="head-out mx-[2rem]">
						<div class="column out">
							<div class="title">Out</div>
							{#each $tokens as token, index}
								<div class="head1 cell x1-12" class:last={index === $tokens.length - 1}>
									<div class={`vector x1-12 ${outputVectorColor}`}></div>
								</div>
								<Tooltip placement="right" class="popover"
									>Attention Out, Head 1, vector({$modelMeta.dimension /
										$modelMeta.attention_head_num})</Tooltip
								>
							{/each}
						</div>
					</div>
					<div class="head-title absolute bottom-2 right-3 text-right text-gray-400">
						Head 1 of {$modelMeta.attention_head_num}
					</div>
				</div>
			</HeadStack>
		</div>
	</div>
</div>

<style lang="scss">
	.attention {
		&.expanded {
			.title,
			:global(.first-head-content) {
				z-index: 900;
			}
			:global(.multi-head .rest.first) {
				z-index: 810 !important;
			}
		}
		.transformer-bounding {
			border-radius: 10px 0 0 10px;
			padding-left: 0.5rem;

			left: -0.5rem;
			border-right: none;
		}
		.bounding-title {
			margin-left: 1rem;
		}
		.attention-bounding {
			top: -0.5rem;
			padding: 0.5rem 0;
			left: -0.2rem;
			width: calc(100% + 1rem);
			height: calc(100%);
		}
		.column {
			.label {
				font-size: 0.7rem;
				color: theme('colors.gray.600');
			}
			.title {
				position: absolute;
				top: -1.5rem;
				left: 50%;
				transform: translateX(-50%);
				font-size: 0.8rem;
			}
			&.query .title {
				color: theme('colors.blue.400');
			}
			&.key .title {
				color: theme('colors.red.400');
			}
			&.value .title {
				color: theme('colors.green.400');
			}
			&.out .title {
				color: theme('colors.purple.400');
			}
		}
		.content {
			display: grid;
			grid-template-columns: 0 auto 0;

			.tokens {
				gap: 0.6rem;
			}
		}
		.heads {
			padding: 0 6rem 0 7rem;

			.head1.cell {
				.label {
					height: auto;
					line-height: 1;
				}
				&.active {
					&.query {
						.label {
							background-color: theme('colors.blue.100');
							color: theme('colors.blue.700');
						}
					}
					&.key {
						.label {
							background-color: theme('colors.red.100');
							color: theme('colors.red.700');
						}
					}
				}
			}
		}

		.sub-vector {
			user-select: none;
			font-size: 0.8rem;
			&.query {
				color: theme('colors.blue.300');
			}
			&.key {
				color: theme('colors.red.300');
			}
			&.value {
				color: theme('colors.green.300');
			}

			.head-rest {
				display: flex;
				justify-content: center;
				align-items: center;
			}
		}
	}
</style>

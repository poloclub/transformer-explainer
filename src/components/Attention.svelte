<script lang="ts">
	import HeadStack from '~/components/HeadStack.svelte';
	import {
		tokens,
		modelMeta,
		headContentHeight,
		expandedBlock,
		headGap,
		hoveredMatrixCell,
		attentionHeadIdx
	} from '~/store';
	import classNames from 'classnames';
	import AttentionMatrix from '~/components/AttentionMatrix.svelte';

	import { setContext, getContext } from 'svelte';
	import { Tooltip } from 'flowbite-svelte';
	import { onClickReadMore } from '~/utils/event';
	import TextbookTooltip from './common/TextbookTooltip.svelte';

	export let className: string | undefined = undefined;

	setContext('block-id', 'attention');
	const blockId = getContext('block-id');
	$: isAttentionExpanded = $expandedBlock.id === blockId;

	const queryHeadVectorColor = 'bg-blue-400';
	const keyHeadVectorColor = 'bg-red-400';
	const valHeadVectorColor = 'bg-green-400';

	const outputVectorColor = 'bg-purple-500';

	let isHovered = false;

	function handleMouseEnter() {
		isHovered = true;
	}

	function handleMouseLeave() {
		isHovered = false;
	}
</script>

<div
	class={classNames('attention', className, {
		expanded: isAttentionExpanded
	})}
	data-click="attention-step"
>
	<div
		class="title"
		on:mouseenter={handleMouseEnter}
		on:mouseleave={handleMouseLeave}
		role="group"
		data-click="attention-step-title"
	>
		<div class="w-max">
			<TextbookTooltip id="self-attention">多头自注意力</TextbookTooltip>
		</div>
	</div>
	<div class="content relative">
		<div
			class="bounding attention-bounding"
			class:active={isHovered && !isAttentionExpanded}
			style={`padding-bottom:${$modelMeta.attention_head_num * headGap.y}px`}
		></div>
		<div class="heads">
			<HeadStack>
				<div
					class="head-block flex w-full items-center justify-between px-2"
					style={`height:${$headContentHeight}px;`}
				>
					<div class="qkv flex h-full flex-col justify-center gap-[5rem] pl-[6rem]">
						<div class="column key">
							<div class="head1 title"><TextbookTooltip id="qkv">键</TextbookTooltip></div>

							{#each $tokens as token, index}
								<div
									class="head1 key cell x1-12 text-xs"
									class:last={index === $tokens.length - 1}
									class:active={$hoveredMatrixCell.col === index}
								>
									<span class="label float">{token}</span>
									<div class={`vector x1-12 ${keyHeadVectorColor}`}></div>
								</div>
							{/each}
							<Tooltip class="popover" triggeredBy={'.step.attention .key .cell'} placement="right"
								>键，注意力头 {$attentionHeadIdx + 1}，向量（{$modelMeta.dimension /
									$modelMeta.attention_head_num} 维）</Tooltip
							>
						</div>
						<div class="column query">
							<div class="head1 title">
								<TextbookTooltip id="qkv">查询</TextbookTooltip>
							</div>
							{#each $tokens as token, index}
								<div
									class="head1 cell x1-12 query text-xs"
									class:last={index === $tokens.length - 1}
									class:active={$hoveredMatrixCell.row === index}
								>
									<span class="label float">{token}</span>
									<div class={`vector x1-12  ${queryHeadVectorColor}`}></div>
								</div>
							{/each}
							<Tooltip
								class="popover"
								triggeredBy={'.step.attention .query .cell'}
								placement="right"
								>查询，注意力头 {$attentionHeadIdx + 1}，向量（{$modelMeta.dimension /
									$modelMeta.attention_head_num} 维）</Tooltip
							>
						</div>
						<div class="column value">
							<div class="head1 title"><TextbookTooltip id="qkv">值</TextbookTooltip></div>
							{#each $tokens as token, index}
								<div class="head1 cell x1-12 text-xs" class:last={index === $tokens.length - 1}>
									<span class="label float">{token}</span>
									<div class={`vector x1-12 ${valHeadVectorColor}`}></div>
								</div>
							{/each}
							<Tooltip
								class="popover"
								triggeredBy={'.step.attention .value .cell'}
								placement="right"
								>值，注意力头 {$attentionHeadIdx + 1}，向量（{$modelMeta.dimension /
									$modelMeta.attention_head_num} 维）</Tooltip
							>
						</div>
					</div>
					<div class="resize-watch attention-matrix flex">
						<AttentionMatrix />
					</div>
					<div class="head-out mx-[2rem]">
						<div class="column out">
							<div class="head1 title">
								<TextbookTooltip id="output-concatenation">输出</TextbookTooltip>
							</div>
							{#each $tokens as token, index}
								<div class="head1 cell x1-12" class:last={index === $tokens.length - 1}>
									<div class={`vector x1-12 ${outputVectorColor}`}></div>
								</div>
							{/each}
							<Tooltip class="popover" triggeredBy={'.step.attention .out .cell'} placement="right"
								>注意力输出，向量（{$modelMeta.dimension / $modelMeta.attention_head_num} 维）</Tooltip
							>
						</div>
					</div>
				</div>
			</HeadStack>
		</div>
	</div>
</div>

<style lang="scss">
	.attention-matrix,
	.head-title {
		z-index: $COLUMN_TITLE_INDEX;
	}
	.attention {
		> .title > div {
			// cursor: help;
		}
		&.expanded {
			.title,
			:global(.head-content) {
				z-index: $EXPANDED_CONTENT_INDEX;
			}
			:global(.multi-head .head-card:first-child) {
				z-index: $EXPANDED_CONTENT_INDEX !important;
			}
		}

		.attention-bounding {
			top: -0.5rem;
			padding: 0.5rem 0;
			left: -0.3rem;
			width: calc(100% + 1rem);
			height: calc(100%);
		}
		.column {
			.label {
				font-size: 0.7rem;
				color: theme('colors.gray.600');
			}
			.title {
				z-index: $COLUMN_TITLE_INDEX;
				position: absolute;
				top: -1.7rem;
				left: 50%;
				transform: translateX(-50%);
				display: inline-flex;
				gap: 0.15rem;
				align-items: center;
				white-space: nowrap;
				font-size: 0.9rem;
				transition: none;
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
			grid-template-columns: auto 0;

			.tokens {
				gap: 0.6rem;
			}
		}
		.heads {
			padding: 0 7rem 0 8rem;

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
							font-size: 1rem;
							z-index: 100;
							padding: 0.2rem;
						}
					}
					&.key {
						.label {
							background-color: theme('colors.red.100');
							color: theme('colors.red.700');
							font-size: 1rem;
							z-index: 100;
							padding: 0.2rem;
						}
					}
				}
			}
		}
	}
</style>

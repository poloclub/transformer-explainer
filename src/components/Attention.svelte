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

	export let className: string | undefined = undefined;

	setContext('block-id', 'attention');
	const blockId = getContext('block-id');
	$: isAttentionExpanded = $expandedBlock.id === blockId;

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
</script>

<div class={classNames('attention', className, { expanded: isAttentionExpanded })}>
	<div
		class="title"
		on:mouseenter={handleMouseEnter}
		on:mouseleave={handleMouseLeave}
		on:click={(e) => onClickReadMore(e, 'self-attention')}
		role="group"
	>
		<div>Multi-head Self Attention</div>
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
							<div class="head1 title">Key</div>

							{#each $tokens as token, index}
								<div
									class="head1 key cell x1-12 text-xs"
									class:last={index === $tokens.length - 1}
									class:active={$hoveredMatrixCell.col === index}
								>
									<span class="label float">{token}</span>
									<div class={`vector x1-12 ${keyHeadVectorColor}`}></div>
								</div>
								<Tooltip placement="right" class="popover"
									>Key, Head {$attentionHeadIdx + 1}, vector({$modelMeta.dimension /
										$modelMeta.attention_head_num})</Tooltip
								>
							{/each}
						</div>
						<div class="column query">
							<div class="head1 title">Query</div>
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
									>Query, Head {$attentionHeadIdx + 1}, vector({$modelMeta.dimension /
										$modelMeta.attention_head_num})</Tooltip
								>
							{/each}
						</div>
						<div class="column value">
							<div class="head1 title">Value</div>
							{#each $tokens as token, index}
								<div class="head1 cell x1-12 text-xs" class:last={index === $tokens.length - 1}>
									<span class="label float">{token}</span>
									<div class={`vector x1-12 ${valHeadVectorColor}`}></div>
								</div>
								<Tooltip placement="right" class="popover"
									>Value, Head {$attentionHeadIdx + 1}, vector({$modelMeta.dimension /
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
							<div class="head1 title">Out</div>
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
		> .title {
			cursor: help;
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
				top: -1.5rem;
				left: 50%;
				transform: translateX(-50%);
				font-size: 0.8rem;
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
	}
</style>

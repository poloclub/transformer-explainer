<script lang="ts">
	import { Tooltip } from 'flowbite-svelte';
	import { setContext, getContext, onMount } from 'svelte';
	import classNames from 'classnames';
	import { gsap, Flip } from '~/utils/gsap';
	import { tick } from 'svelte';
	import tailwindConfig from '../../tailwind.config';
	import resolveConfig from 'tailwindcss/resolveConfig';
	import {
		rootRem,
		temperature,
		sampling,
		isExpandOrCollapseRunning,
		isTextbookOpen,
		textbookCurrentPageId,
		userId
	} from '~/store';
	import { expandedBlock, predictedToken, highlightedIndex, modelData } from '~/store';
	import ProbabilityBars from './ProbabilityBars.svelte';
	import Katex from '~/utils/Katex.svelte';
	import { ga } from '~/utils/event';
	import { EyeOutline, ZoomInOutline } from 'flowbite-svelte-icons';
	import { fade } from 'svelte/transition';
	import SoftmaxPopover from './Popovers/SoftmaxPopover.svelte';
	import LogitWeightPopover from './Popovers/LogitWeightPopover.svelte';
	import { textPages } from '~/utils/textbookPages';
	import TextbookTooltip from '~/components/common/TextbookTooltip.svelte';

	export let className: string | undefined = undefined;

	setContext('block-id', 'softmax');

	const blockId = getContext('block-id');

	let isSoftmaxExpanded = false;
	let showLogitPopover = false;

	// event handling
	$: if ($expandedBlock.id !== blockId && isSoftmaxExpanded) {
		isSoftmaxExpanded = false;
		collapseSoftmax();
	}
	$: if ($expandedBlock.id === blockId && !isSoftmaxExpanded) {
		isSoftmaxExpanded = true;
		expandSoftmax();
	}

	const onClickSoftmax = () => {
		if (!isSoftmaxExpanded) {
			expandedBlock.set({ id: blockId });
		}
	};

	const onClickSoftmaxTitle = (e) => {
		e.stopPropagation();
		e.preventDefault();
		textPages.find((page) => page.id === 'output-probabilities')?.out();

		if (!isSoftmaxExpanded) {
			expandedBlock.set({ id: blockId });
			expandSoftmax();
		} else {
			expandedBlock.set({ id: null });
			collapseSoftmax();
		}
	};
	let expandableEl: HTMLDivElement;

	function handleOutsideClick(e) {
		if (isSoftmaxExpanded && !expandableEl.contains(e.target)) {
			expandedBlock.set({ id: null });
		}
	}
	onMount(() => {
		document.querySelector('.main-section').addEventListener('click', handleOutsideClick);
		return () => {
			document.querySelector('.main-section').removeEventListener('click', handleOutsideClick);
		};
	});

	// animation
	let containerState: any;

	let drawBars: () => void;

	// google analytics
	let startTime = null;

	const expandSoftmax = async () => {
		containerState = Flip.getState('.softmax .softmax-detail.expandable');
		isSoftmaxExpanded = true;
		await tick();

		isExpandOrCollapseRunning.set(true);

		gsap.set('.steps', { justifyContent: 'end' });
		gsap.set('.softmax-detail', { opacity: 0 });

		Flip.from(containerState, {
			duration: 0.5,
			ease: 'power2.inOut',
			onComplete: () => {
				drawBars?.();
				isExpandOrCollapseRunning.set(false);
			}
		});
		gsap.to('.softmax-detail', {
			opacity: 1,
			duration: 0.2,
			delay: 0.5
		});

		startTime = performance.now();
		window.dataLayer?.push({
			event: 'visibility-show',
			visible_name: 'prob-expansion',
			start_time: startTime,
			user_id: $userId
		});
	};

	const collapseSoftmax = async () => {
		let endTime = performance.now();
		let visibleDuration = endTime - startTime;

		window.dataLayer?.push({
			event: 'visibility-hide',
			visible_name: 'prob-expansion',
			end_time: endTime,
			visible_duration: visibleDuration,
			user_id: $userId
		});

		showLogitPopover = false;

		containerState = Flip.getState('.softmax .softmax-detail.expandable');
		isSoftmaxExpanded = false;
		await tick();

		isExpandOrCollapseRunning.set(true);

		await Flip.from(containerState, {
			duration: 0.5,
			ease: 'power2.inOut',
			onComplete: () => {
				drawBars?.();
				isExpandOrCollapseRunning.set(false);
			}
		});
		gsap.to('.softmax-detail', {
			opacity: 0,
			duration: 0.2
		});

		gsap.set('.steps', { justifyContent: 'start' });
	};

	let rowHeight = rootRem * 1.4;
	let rowGap = 0.5 * rootRem;

	let hoveredIndex: number | null = null;

	$: data = $modelData?.probabilities || [];
	$: tokenIds = data?.map((d) => d.tokenId);
	$: logits = data?.map((d) => d.logit) || [];
	$: scaledLogits = data?.map((d) => d.scaledLogit) || [];

	// top-k
	$: topKLogits = data?.map((d) => d.topKLogit) || [];

	// top-p
	$: topPProbabilities = data?.map((d) => d.topPProbability) || [];
	$: cumulativeProbabilities = data?.map((d) => d.cumulativeProbability) || [];
	$: cutoffIndex = data?.[0].cutoffIndex;

	let isHovered = false;

	function handleMouseEnter() {
		isHovered = true;
	}

	function handleMouseLeave() {
		isHovered = false;
	}

	const onClickLogits = (e) => {
		e.stopPropagation();
		e.preventDefault();
		showLogitPopover = !showLogitPopover;
	};
</script>

<div
	class={classNames('softmax', className, {
		expanded: isSoftmaxExpanded,
		'textbook-highlight': $isTextbookOpen && $textbookCurrentPageId === 'transformer-architecture'
	})}
	role="none"
	bind:this={expandableEl}
	on:click={onClickSoftmax}
	on:keydown={onClickSoftmax}
	data-click="prob-step"
>
	<div
		class="title expandable"
		role="none"
		on:click={onClickSoftmaxTitle}
		on:keydown={onClickSoftmaxTitle}
		on:mouseenter={handleMouseEnter}
		on:mouseleave={handleMouseLeave}
		data-click="prob-step-title"
	>
		<div class="title-text flex w-max items-center gap-1">
			Probabilities
			<ZoomInOutline></ZoomInOutline>
		</div>
	</div>

	<div
		class="content resize-watch relative"
		style={`--softmax-row-height: ${rowHeight}px;--softmax-row-gap: ${rowGap}px`}
	>
		<div class="bounding softmax-bounding" class:active={isHovered && !isSoftmaxExpanded}></div>
		<div class="first-column relative flex justify-end">
			<div class="content-box token-string">
				{#each data as item, idx}
					<div
						role="group"
						class="text-box"
						on:mouseenter={() => (hoveredIndex = idx)}
						on:mouseleave={() => (hoveredIndex = null)}
						class:highlight={idx === hoveredIndex}
						class:sample_highlight={$highlightedIndex === idx}
						class:final_token_highlight={$predictedToken?.rank === idx}
					>
						<span>{item.token.trim() === '' ? '\u00A0' : item.token}</span>
						<Tooltip class="softmax-tooltip" type="light">
							Token ID: <span class="number">{tokenIds[idx]}</span>
						</Tooltip>
					</div>
				{/each}
			</div>
			<div class="vector vocab opacity-1 w-0"></div>
		</div>

		<div class="second-column flex flex-col">
			{#if isSoftmaxExpanded}
				<div class="softmax-subtitle softmax-detail flex text-center text-xs opacity-0">
					<div class="title-box token-string !justify-end">
						<div class="title-text">Tokens</div>
					</div>
					<div class="title-box logits">
						<div
							class="title-text btn shadow-sm"
							on:click={onClickLogits}
							data-click="prob-expansion-logit-btn"
						>
							Logits <EyeOutline class="icon text-gray-400" size="sm" />
						</div>
					</div>
					<div class="title-box scaled">
						<TextbookTooltip id="temperature"
							><div class="title-text">Scaled logits</div></TextbookTooltip
						>
					</div>
					<div class="title-box sampling">
						<TextbookTooltip id="sampling"
							><div class="title-text">
								{$sampling.type === 'top-k' ? 'Top-k' : 'Softmax & Top-p'}
							</div></TextbookTooltip
						>
					</div>
					<div class="title-box probability">
						<div class="title-text mr-1">
							{$sampling.type === 'top-k' ? 'Softmax' : 'Normalization'}
						</div>
					</div>
				</div>
			{/if}
			<div class="content-row flex gap-2">
				<div class="softmax-detail expandable flex gap-2 opacity-0">
					{#if isSoftmaxExpanded}
						<div class="content-box vector-box logits ml-2">
							{#each logits as logit, idx}
								{#if logit !== undefined}
									<div
										role="group"
										class="text-box text-center"
										on:mouseenter={() => (hoveredIndex = idx)}
										on:mouseleave={() => (hoveredIndex = null)}
										class:highlight={idx === hoveredIndex}
										class:sample_highlight={$highlightedIndex === idx}
										class:final_token_highlight={$predictedToken?.rank === idx}
									>
										<span class="number">{logit?.toFixed(2)}</span>
									</div>
									<Tooltip class="softmax-tooltip" type="light">
										<Katex math={`\\text{logit}_{${tokenIds[idx]}}`}></Katex>
									</Tooltip>
								{/if}
							{/each}
						</div>
						<div class="content-box vector-box scaled">
							{#each scaledLogits as logit, idx}
								{#if logit !== undefined}
									<div
										role="group"
										class="text-box text-center"
										on:mouseenter={() => (hoveredIndex = idx)}
										on:mouseleave={() => (hoveredIndex = null)}
										class:highlight={idx === hoveredIndex}
										class:sample_highlight={$highlightedIndex === idx}
										class:final_token_highlight={$predictedToken?.rank === idx}
									>
										<span class="number">{logit?.toFixed(2)}</span>
									</div>
									<Tooltip class="softmax-tooltip" type="light">
										<Katex math={`${logits[idx]?.toFixed(2)} / ${$temperature}`}></Katex>
									</Tooltip>
								{/if}
							{/each}
						</div>
						<div class="content-box vector-box sampling">
							{#if $sampling.type === 'top-k'}
								{#each topKLogits as logit, idx}
									{#if logit !== undefined}
										<div
											role="group"
											class="text-box text-center"
											on:mouseenter={() => (hoveredIndex = idx)}
											on:mouseleave={() => (hoveredIndex = null)}
											class:highlight={idx === hoveredIndex}
											class:sample_highlight={$highlightedIndex === idx}
											class:final_token_highlight={$predictedToken?.rank === idx}
											class:cutoff={$sampling.value === idx + 1}
											class:filtered={$sampling.value > idx}
										>
											{#if logit === Infinity}
												<span class="infinity"><Katex math={'\\infty'} /></span>
											{:else if logit === -Infinity}
												<span class="infinity"><Katex math={'-\\infty'} /></span>
											{:else}
												<span class="number">{logit?.toFixed(2)}</span>
											{/if}
										</div>
									{/if}
								{/each}
							{:else}
								{#each topPProbabilities as prob, idx}
									{#if prob !== undefined}
										<div
											role="group"
											class="text-box text-center"
											on:mouseenter={() => (hoveredIndex = idx)}
											on:mouseleave={() => (hoveredIndex = null)}
											class:highlight={idx === hoveredIndex}
											class:sample_highlight={$highlightedIndex === idx}
											class:final_token_highlight={$predictedToken?.rank === idx}
											class:cutoff={cutoffIndex === idx}
											class:filtered={cutoffIndex >= idx}
											class:zero={cutoffIndex < idx}
										>
											<span class="number" class:strike={cutoffIndex < idx}>{prob.toFixed(2)}</span>
											{#if cutoffIndex === idx}
												<span class="cutoff-label"
													>sum={cumulativeProbabilities[idx]?.toFixed(2)}</span
												>
											{/if}
										</div>
										<Tooltip class="softmax-tooltip" type="light">
											sum=<Katex math={`${cumulativeProbabilities[idx]?.toFixed(2)}`}></Katex>
										</Tooltip>
									{/if}
								{/each}
							{/if}
						</div>
					{/if}
				</div>
				<ProbabilityBars bind:hoveredIndex {rowGap} {rowHeight} bind:drawBars />
			</div>
		</div>
		{#if isSoftmaxExpanded && !!$predictedToken}
			<div class="softmax-popover">
				<SoftmaxPopover bind:hoveredIndex />
			</div>
		{/if}
		{#if isSoftmaxExpanded && showLogitPopover}
			<div class="softmax-weight-popover weight-popover logit-popover" in:fade={{ duration: 300 }}>
				<LogitWeightPopover bind:isOpen={showLogitPopover}></LogitWeightPopover>
			</div>
		{/if}
	</div>
</div>

<style lang="scss">
	.softmax-popover {
		position: absolute;
		top: 0;
		right: calc(100% + 6rem);
	}
	.logit-popover {
		z-index: $POPOVER_INDEX;
		width: max-content !important;
		position: absolute;
		top: 15rem;
		right: calc(100% + 6rem);
	}
	:global(.frac-line) {
		border-color: black;
	}

	:global(.softmax-tooltip) {
		z-index: $TOOLTIP_INDEX;
	}
	.softmax {
		.top-k-line {
			width: 100%;
			height: 1px;
			background: theme('colors.purple.500');
			top: 1.5rem;
			position: absolute;
		}
		&.expanded {
			.title,
			.content {
				z-index: $EXPANDED_CONTENT_INDEX;
			}
		}

		.content {
			.softmax-bounding {
				top: -0.5rem;
				padding: 0.5rem 0;
				left: -5rem;
				width: calc(100% + 3rem);
				height: 100%;
			}

			padding-right: 3rem;
			display: grid;
			grid-template-columns: 0 auto;

			.content-box {
				flex-shrink: 0;
				display: flex;
				flex-direction: column;
				color: theme('colors.gray.400');
				gap: var(--softmax-row-gap);

				span.number {
					font-family: monospace;
					font-size: 0.8rem;
				}

				.text-box {
					cursor: default;
					position: relative;
					flex-shrink: 0;
					text-align: right;
					font-size: 0.9rem;
					padding-right: 4px;
					display: flex;
					justify-content: center;
					align-items: center;
					width: 100%;
					height: var(--softmax-row-height);

					&.zero {
						color: theme('colors.gray.300');
					}

					&.filtered {
						background-color: theme('colors.purple.100');
						color: theme('colors.gray.500');
					}

					&.highlight {
						color: theme('colors.purple.600');
						transition: background-color 0.2s;
					}

					&.sample_highlight {
						color: white;
						background-color: theme('colors.purple.400');
					}

					&.final_token_highlight {
						color: var(--predicted-color);
						font-weight: 600;
						transition: background-color 1s;
					}

					&.cutoff {
						position: relative;

						.cutoff-label {
							position: absolute;
							color: theme('colors.purple.500');
							top: 1rem;
							transform: translate(0, 50%);
							font-size: 0.9rem;
							font-weight: 600;
							font-family: serif;
							line-height: 1;
							background-color: theme('colors.gray.50');
						}
					}
				}
			}

			.second-column {
				padding-left: 2px;
			}

			.content-row {
				.vector-box {
					background-color: theme('colors.gray.50');
					border-right: 1px solid theme('colors.gray.200');
					border-left: 1px solid theme('colors.gray.200');
				}
			}

			.token-string {
				width: 5rem;

				.text-box {
					justify-content: end;

					span {
						z-index: $COLUMN_TITLE_INDEX;
					}
				}
			}
			.logits,
			.scaled,
			.sampling {
				width: 5rem;
			}
			.strike {
				text-decoration: line-through;
			}
			.current {
				transform: translateY(0);
			}

			.softmax-subtitle {
				gap: 0.5rem;
				position: absolute;
				left: -5rem;
				top: 0;
				transform: translateY(calc(-100% - 1rem));

				.title-box {
					flex-shrink: 0;
					display: flex;
					justify-content: center;
					border-radius: 0.5rem;
					top: 0;
					align-items: end;

					.title-text {
						display: flex;
						align-items: end;
						gap: 2px;
						color: theme('colors.gray.400');

						&:hover {
							background-color: theme('colors.gray.50');
						}

						&.btn {
							color: theme('colors.gray.500');
							height: max-content;
							border: 1px solid theme('colors.gray.300');
							border-radius: 0.3rem;
							padding: 0.1rem 0.3rem;
							cursor: pointer;
						}
					}
				}
			}
		}

		.second-column {
			position: relative;

			.dim {
				user-select: none;
				position: absolute;
				bottom: 0;
				width: 100%;
				height: 50vh;
				z-index: $EXPANDED_DIM_INDEX;
				background-color: white;
				background: linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 1) 70%);
			}
		}
	}
</style>

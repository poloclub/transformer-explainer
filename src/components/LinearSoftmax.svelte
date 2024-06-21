<script lang="ts">
	import { Tooltip } from 'flowbite-svelte';
	import { setContext, getContext, onMount } from 'svelte';
	import classNames from 'classnames';
	import { gsap, Flip } from '~/utils/gsap';
	import { tick } from 'svelte';
	import tailwindConfig from '../../tailwind.config';
	import resolveConfig from 'tailwindcss/resolveConfig';
	import { rootRem, temperature } from '~/store';
	import { OriginalBarData } from '../utils/mock_data';
	import {
		expandedBlock,
		predictedToken,
		highlightedIndex,
		isModelRunning,
		modelData
	} from '~/store';
	import ProbabilityBars from './ProbabilityBars.svelte';
	import Katex from '~/utils/Katex.svelte';

	export let className: string | undefined = undefined;

	const { theme } = resolveConfig(tailwindConfig);

	setContext('block-id', 'softmax');

	const blockId = getContext('block-id');

	let isSoftmaxExpanded = false;

	// event handling
	$: if ($expandedBlock.id !== blockId && isSoftmaxExpanded) {
		isSoftmaxExpanded = false;
		collapseSoftmax();
	}

	const onClickSoftmax = () => {
		if (!isSoftmaxExpanded) {
			expandedBlock.set({ id: blockId });
			expandSoftmax();
		}
	};

	const onClickSoftmaxTitle = (e) => {
		e.stopPropagation();
		e.preventDefault();
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
		document.body.addEventListener('click', handleOutsideClick);
		return () => {
			document.body.removeEventListener('click', handleOutsideClick);
		};
	});

	// animation
	let containerState: any;

	let drawBars: () => void;

	const expandSoftmax = async () => {
		containerState = Flip.getState('.softmax .softmax-detail.expandable');
		isSoftmaxExpanded = true;
		await tick();

		gsap.set('.steps', { justifyContent: 'end' });
		gsap.set('.softmax-detail', { opacity: 0 });

		Flip.from(containerState, {
			duration: 0.5,
			ease: 'power2.inOut',
			onComplete: () => {
				drawBars?.();
			}
		});
		gsap.to('.softmax-detail', {
			opacity: 1,
			duration: 0.2,
			delay: 0.5
		});
	};

	const collapseSoftmax = async () => {
		containerState = Flip.getState('.softmax .softmax-detail.expandable');
		isSoftmaxExpanded = false;
		await tick();

		await Flip.from(containerState, {
			duration: 0.5,
			ease: 'power2.inOut',
			onComplete: () => {
				drawBars?.();
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

	$: data = $modelData?.prediction || [];
	$: tokenIds = data?.map((d) => d.tokenId);
	// $: logits = data?.map((d) => d.adjustedLogit) || [];
	$: logits = data?.map((d) => d.logit) || [];
	$: exponents = data?.map((d) => d.adjustedExp) || [];

	let isHovered = false;

	function handleMouseEnter() {
		isHovered = true;
	}

	function handleMouseLeave() {
		isHovered = false;
	}
</script>

<div
	class={classNames('softmax', className, { expanded: isSoftmaxExpanded })}
	role="none"
	bind:this={expandableEl}
	on:click={onClickSoftmax}
	on:keydown={onClickSoftmax}
>
	<div
		class="title expandable"
		role="none"
		on:click={onClickSoftmaxTitle}
		on:keydown={onClickSoftmaxTitle}
		on:mouseenter={handleMouseEnter}
		on:mouseleave={handleMouseLeave}
	>
		<div>Probabilities</div>
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
						<Tooltip class="popover" placement="left" type="light">
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
						<div class="title-text">Logits</div>
						<Tooltip class="popover tooltip text-xs"
							><Katex math={'\\text{logits} = \\text{hidden state} \\times \\text{LM Head Weights}'}
							></Katex></Tooltip
						>
					</div>
					<div class="title-box exponents">
						<div class="title-text">Exponents</div>
						<Tooltip class="popover tooltip"
							><Katex math={'e^{logit_i / temperature}'}></Katex></Tooltip
						>
					</div>
					<div class="title-box probability">
						<div class="title-text">Softmax</div>
						<Tooltip class="popover tooltip">
							<Katex math={'\\frac{e^{\\text{logit}_i / T}}{\\sum_{j} e^{\\text{logit}_j / T}}'}
							></Katex>
						</Tooltip>
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
										<span class="number">{logit.toFixed(2)}</span>
									</div>
									<Tooltip class="popover" placement="left" type="light">
										<Katex math={`\\text{logit}_{${tokenIds[idx]}}`}></Katex>
										<!-- {(logit * $temperature).toFixed(2)} ÷ {$temperature} = {logit.toFixed(2)} -->
									</Tooltip>
								{/if}
							{/each}
						</div>
						<div class="content-box vector-box exponents">
							{#each exponents as exponent, idx}
								<div
									role="group"
									class="text-box text-center"
									on:mouseenter={() => (hoveredIndex = idx)}
									on:mouseleave={() => (hoveredIndex = null)}
									class:highlight={idx === hoveredIndex}
									class:sample_highlight={$highlightedIndex === idx}
									class:final_token_highlight={$predictedToken?.rank === idx}
								>
									<span class="number">{exponent.toExponential(2)}</span>

									<!-- {#if exponent > 100000}
										{exponent.toExponential(2)}
									{:else if exponent < 10}
										{exponent.toFixed(2)}
									{:else}
										{exponent.toFixed(0)}
									{/if} -->
								</div>
								<Tooltip class="popover" placement="left" type="light">
									<Katex math={`e^{${logits[idx]?.toFixed(2)} / ${$temperature}}`}></Katex>
									<!-- exp({logits[idx].toFixed(2)}) = {exponent.toExponential(2)} -->
								</Tooltip>
							{/each}
						</div>
					{/if}
				</div>
				<ProbabilityBars bind:hoveredIndex {rowGap} {rowHeight} bind:drawBars />
			</div>
		</div>
	</div>
</div>

<style lang="scss">
	.softmax {
		&.expanded {
			.title,
			.content {
				z-index: 900;
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

			// height: auto;
			padding-right: 3rem;
			display: grid;
			grid-template-columns: 0 auto;

			.content-box {
				// position: absolute;
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
					flex-shrink: 0;
					text-align: right;
					font-size: 0.9rem;
					padding-right: 4px;
					display: flex;
					justify-content: center;
					align-items: center;
					width: 100%;
					height: var(--softmax-row-height);

					&.highlight {
						color: theme('colors.purple.600');
						cursor: pointer;
						transition: background-color 0.2s;
					}

					&.sample_highlight {
						color: white;
						background-color: theme('colors.purple.400');
					}

					&.final_token_highlight {
						color: var(--predicted-color);
						font-weight: 600;
						// background-color: theme('colors.blue.200');
						transition: background-color 1s;
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
				width: 6rem;
				z-index: 201;

				.text-box {
					justify-content: end;

					span {
					}
				}
			}
			.logits {
				width: 6rem;
				// z-index: 200;
			}
			.exponents {
				width: 6rem;
				// z-index: 200;
			}

			.current {
				transform: translateY(0);
			}

			.softmax-subtitle {
				gap: 0.5rem;
				position: absolute;
				left: -6rem;
				top: 0;
				transform: translateY(calc(-100% - 1rem));

				.title-box {
					flex-shrink: 0;
					display: flex;
					justify-content: center;
					border-radius: 0.5rem;
					top: 0;

					&:hover {
						background-color: theme('colors.gray.50');
					}

					.title-text {
						display: flex;
						align-items: end;
						color: theme('colors.gray.400');
					}
				}
			}
		}

		.second-column {
			position: relative;

			.dim {
				position: absolute;
				bottom: 0;
				width: 100%;
				height: 50vh;
				z-index: 300;
				background-color: white;
				background: linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 1) 70%);
			}
		}
	}
</style>

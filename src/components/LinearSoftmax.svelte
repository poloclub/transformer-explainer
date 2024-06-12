<script lang="ts">
	import { Tooltip } from 'flowbite-svelte';
	import { setContext, getContext } from 'svelte';
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

	export let className: string | undefined = undefined;

	const { theme } = resolveConfig(tailwindConfig);

	setContext('block-id', 'softmax');

	const blockId = getContext('block-id');

	let isSoftmaxExpanded = false;

	$: if ($expandedBlock.id !== blockId && isSoftmaxExpanded) {
		isSoftmaxExpanded = false;
		collapseSoftmax();
	}

	const onClickSoftmax = () => {
		if (!isSoftmaxExpanded) {
			expandedBlock.set({ id: blockId });
			expandSoftmax();
		} else {
			expandedBlock.set({ id: null });
			collapseSoftmax();
		}
	};

	let containerState: any;

	const expandSoftmax = async () => {
		containerState = Flip.getState('.softmax .softmax-detail.expandable');
		isSoftmaxExpanded = true;
		await tick();

		const main = document.getElementById('main');
		main.style.justifyContent = 'end';
		await tick();

		Flip.from(containerState, {
			duration: 1,
			ease: 'power2.inOut'
			// onStart: () => {
			// 	drawBars();
			// }
		});
		gsap.to('.softmax-detail', {
			opacity: 1,
			duration: 0.5,
			delay: 0.5
		});
	};

	const collapseSoftmax = async () => {
		containerState = Flip.getState('.softmax .softmax-detail.expandable');
		isSoftmaxExpanded = false;
		await tick();

		await Flip.from(containerState, {
			duration: 0.5,
			ease: 'power2.inOut'
			// onComplete: () => {
			// 	drawBars();
			// }
		});
		gsap.to('.softmax-detail', {
			opacity: 0,
			duration: 0.5
		});

		await tick();
		const main = document.getElementById('main');
		main.style.justifyContent = 'start';
	};

	let rowHeight = 0.5 * rootRem;
	let rowGap = rootRem;
	let hoveredIndex: number | null = null;

	$: data = $modelData?.prediction || [];
	$: tokenIds = data?.map((d) => d.tokenId);
	$: logits = data?.map((d) => d.adjustedLogit) || [];
	$: exponents = data?.map((d) => d.adjustedExp) || [];
</script>

<div
	class={classNames('softmax', className)}
	role="button"
	on:click={onClickSoftmax}
	on:keydown={onClickSoftmax}
	tabindex="0"
>
	<div class="title">
		<div>Probabilities</div>
	</div>
	<div
		class="content"
		style={`--softmax-row-height: ${rowHeight}px;--softmax-row-gap: ${rowGap}px`}
	>
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
						{item.token}
					</div>
					<Tooltip class="text-xs" placement="left" type="light">
						Token ID: {tokenIds[idx]}
					</Tooltip>
				{/each}
			</div>
			<div class="vector vocab opacity-1 w-0"></div>
		</div>

		<div class="resize-watch second-column flex flex-col">
			{#if isSoftmaxExpanded}
				<div class="softmax-subtitle softmax-detail flex text-center text-xs opacity-0">
					<div class="title-box token-string !justify-end">
						<div class="title-text">Tokens</div>
					</div>
					<div class="title-box logits">
						<div class="title-text">Logits</div>
					</div>
					<div class="title-box exponents">
						<div class="title-text">Exponents</div>
					</div>
					<div class="title-box probability">
						<div class="title-text">Probability</div>
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
										{logit.toFixed(2)}
									</div>
									<Tooltip class="text-xs" placement="left" type="light">
										{(logit * $temperature).toFixed(2)} ÷ {$temperature} = {logit.toFixed(2)}
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
									{#if exponent > 100000}
										{exponent.toExponential(2)}
									{:else if exponent < 10}
										{exponent.toFixed(2)}
									{:else}
										{exponent.toFixed(0)}
									{/if}
								</div>
								<Tooltip class="text-xs" placement="left" type="light">
									exp({logits[idx].toFixed(2)}) = {exponent.toFixed(2)}
								</Tooltip>
							{/each}
						</div>
					{/if}
				</div>
				<ProbabilityBars {rowGap} {rowHeight} bind:hoveredIndex />
			</div>
			<div class="dim"></div>
		</div>
	</div>
</div>

<style lang="scss">
	.content {
		padding-right: 3rem;
		display: grid;
		grid-template-columns: 0 auto;

		.content-box {
			flex-shrink: 0;
			display: flex;
			flex-direction: column;
			color: theme('colors.gray.400');
			gap: var(--softmax-row-gap);

			.text-box {
				text-align: right;
				font-size: 0.8rem;
				padding-right: 4px;
				display: flex;
				justify-content: center;
				align-items: center;
				width: 100%;
				line-height: var(--softmax-row-height);
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
			}
		}
		.logits {
			width: 6rem;
			z-index: 200;
		}
		.exponents {
			width: 6rem;
			z-index: 200;
		}

		button {
			&:hover {
				background-color: #f8fafc;
			}

			span {
				// font-size: 12px;
				font-size: 0.75rem;
				line-height: 20px;
			}
		}
		.current {
			transform: translateY(0);
		}

		.highlight {
			color: white;
			background-color: theme('colors.blue.500');
			cursor: pointer;
			transition: background-color 0.2s;
		}

		.sample_highlight {
			color: white;
			background-color: theme('colors.red.300');
		}

		.final_token_highlight {
			color: white;
			background-color: theme('colors.red.700');
			transition: background-color 1s;
		}

		.hyperparams {
			height: 100px;
			display: flex;
			flex-direction: row;
			justify-content: center;
			align-items: center;
			gap: 1rem;
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
</style>

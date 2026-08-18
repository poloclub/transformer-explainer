<script lang="ts">
	import { Card } from 'flowbite-svelte';
	import { modelData, sampling, predictedToken, temperature } from '~/store';
	import Katex from '~/utils/Katex.svelte';
	import { ArrowRightOutline } from 'flowbite-svelte-icons';
	import Arrow from '../common/Arrow.svelte';
	import TextbookTooltip from '../common/TextbookTooltip.svelte';

	export let hoveredIndex: number | null = null;

	$: data = $modelData?.probabilities || [];

	function getStringNumber(num?: number, decimal = 2) {
		if (num === -Infinity) return '-∞';
		if (num === Infinity) return '∞';
		else return num?.toFixed(decimal);
	}

	$: selected =
		hoveredIndex !== null
			? data[hoveredIndex]
			: !!$predictedToken
				? data[$predictedToken?.rank]
				: data[0];
</script>

<Card class={'softmax-popover popover bg-white text-sm'}>
	<div
		class="softmax-popover-title rounded-t-md border-b border-gray-200 bg-gray-100 px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
	>
		<h3 class="font-semibold text-gray-900">
			词元 <span class="highlight">"{selected?.token}"</span> 被采样的概率
		</h3>
	</div>
	<div class="softmax-popover-content">
		<div class="formula-steps">
			<div class="formula-step scaled">
				<TextbookTooltip id="temperature">
					<div class="step-title">温度缩放后的 logit</div></TextbookTooltip
				>
				<div class="step-content">
					<div class="fraction">
						<div class="frac-top relative">
							<span class="annotation logit"><span>logit</span><Arrow size={16} /></span>
							<span class="highlight number">{getStringNumber(selected.logit)}</span>
						</div>
						<div class="frac-line"></div>
						<div class="frac-bottom relative">
							<span class="number">{$temperature}</span>
							<span class="annotation temp"> <Arrow size={16} /><span>温度</span></span>
						</div>
					</div>
				</div>
			</div>
			<ArrowRightOutline class="step-arrow" />
			{#if $sampling.type === 'top-p'}
				<div class="formula-step">
					<div class="step-title">
						<div>Softmax 归一化</div>
					</div>
					<div class="step-content">
						<div class="fraction-formula">
							<div class="fraction">
								<div class="frac-top">
									<span class="text">exp</span>(<span class="highlight number"
										>{getStringNumber(selected?.scaledLogit)}</span
									>)
								</div>
								<div class="frac-line"></div>
								<div class="frac-bottom">
									{#each data.slice(0, 4) as item, idx}
										<span
											><span class="text">exp</span>(<span
												class:highlight={idx === selected?.rank}
												class="number">{getStringNumber(item.scaledLogit)}</span
											>) +{' '}
										</span>
									{/each}

									<span class:highlight={selected?.rank >= 5}>•••</span>
								</div>
							</div>
						</div>
					</div>
				</div>
				<ArrowRightOutline class="step-arrow" />
			{/if}
			<div class="formula-step sampling">
				<TextbookTooltip id="sampling">
					<div class="step-title">
						<span>{$sampling.type === 'top-k' ? 'Top-k' : 'Top-p'} 筛选</span>
						<span class="sub-title"
							>({$sampling.type === 'top-k' ? 'k' : 'p'}={$sampling.value})</span
						>
					</div></TextbookTooltip
				>
				<div class="step-content">
					<div class="topk-formula">
						{#if $sampling.type === 'top-k'}
							<div class="cases">
								<div class="case-row">
									<span class="condition text"
										>如果 logit <Katex math={'\\in'} /> Top-{$sampling.value}
									</span>
									<span class="number" class:highlight={selected?.rank < $sampling.value}
										>{getStringNumber(selected?.scaledLogit)}</span
									>
								</div>
								<div class="case-row">
									<span class="condition text"
										>否则 <span
											class="number infinity"
											class:highlight={selected?.rank >= $sampling.value}
											><Katex math={'-\\infty'} /></span
										></span
									>
								</div>
							</div>
						{:else}
							<div class="cases">
								<div class="case-row">
									<span class="condition text">
										若累计概率 ≤ {$sampling.value}
									</span>
									<span class="number" class:highlight={selected?.rank <= selected?.cutoffIndex}
										>{getStringNumber(selected?.topPProbability)}</span
									>
								</div>
								<div class="case-row">
									<span class="condition text"
										>否则 <span
											class="number infinity"
											class:highlight={selected?.rank > selected?.cutoffIndex}>0</span
										></span
									>
								</div>
							</div>
						{/if}
					</div>
				</div>
			</div>
			<ArrowRightOutline class="step-arrow" />
			{#if $sampling.type === 'top-k'}
				<div class="formula-step softmax-step">
					<div class="step-title">Softmax 归一化</div>
					<div class="step-content">
						<div class="fraction">
							<div class="frac-top">
								<span class="text">exp</span>(<span
									class="highlight number"
									class:filtered={$sampling.value > selected?.rank}
								>
									{#if selected?.topKLogit === -Infinity}
										<Katex math={'-\\infty'} />
									{:else}
										{getStringNumber(selected?.topKLogit)}
									{/if}
								</span>)
							</div>
							<div class="frac-line"></div>
							<div class="frac-bottom">
								{#each data.slice(0, 4) as item, idx}
									<span
										><span class="text">exp</span>(<span
											class:highlight={idx === selected?.rank}
											class="number"
											class:filtered={$sampling.value > idx}
										>
											{#if item?.topKLogit === -Infinity}
												<Katex math={'-\\infty'} />
											{:else}
												{getStringNumber(item?.topKLogit)}
											{/if}
										</span>) +{' '}
									</span>
								{/each}

								<span class:highlight={selected?.rank >= 4}>•••</span>
							</div>
						</div>
					</div>
				</div>
			{:else}
				<div class="formula-step norm-step">
					<div class="step-title">归一化</div>
					<div class="step-content">
						{#if selected?.cutoffIndex >= selected?.rank}
							<div class="fraction">
								<div class="frac-top">
									<span
										class="highlight number"
										class:filtered={selected?.cutoffIndex >= selected?.rank}
										>{getStringNumber(selected?.topPProbability)}</span
									>
								</div>
								<div class="frac-line"></div>
								<div class="frac-bottom">
									{#each data.slice(0, 4) as item, idx}
										{#if idx <= item.cutoffIndex}
											<div>
												<span
													class:highlight={idx === selected?.rank}
													class="number"
													class:filtered={true}
													>{getStringNumber(
														idx > item.cutoffIndex ? 0 : item.topPProbability
													)}</span
												>

												<span class="sum" class:active={idx !== item.cutoffIndex}>+</span>
											</div>
										{/if}
									{/each}
									{#if 4 <= selected?.cutoffIndex}
										<div class:highlight={selected?.rank >= 5}>•••</div>
									{/if}
								</div>
							</div>
						{:else}
							<div></div>
						{/if}
					</div>
				</div>
			{/if}

			<div class="formula-step final-step">
				<div class="step-content">
					<span class="number"
						>= <span class="highlight">{getStringNumber(selected?.probability * 100, 2)}%</span
						></span
					>
				</div>
			</div>
		</div>
	</div></Card
>

<style lang="scss">
	.formula-steps {
		height: 10rem;
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 1rem;

		:global(.step-arrow) {
			color: theme('colors.gray.400');
		}

		.norm-step {
			width: 3rem;
		}
		.final-step {
			width: 4rem;
			white-space: nowrap;
		}
		.first-result {
			margin: 0 -0.6rem;
		}
	}
	.formula-step {
		height: 100%;
		flex-shrink: 0;
		display: flex;
		flex-direction: column;
		gap: 1rem;

		.step-title {
			flex-shrink: 0;
			text-align: center;
			width: 100%;
			display: flex;
			flex-direction: column;
			position: relative;

			.sub-title {
				width: 100%;
				font-size: 0.8rem;
				color: theme('colors.gray.400');
				position: absolute;
				text-align: center;
				bottom: -1.1rem;
			}
		}
		.step-content {
			flex: 1 0 0;
			flex-shrink: 0;
			width: 100%;
			display: flex;
			align-items: center;
			position: relative;
		}

		.annotation {
			display: flex;
			flex-direction: column;
			align-items: center;
			gap: 0.1rem;
			position: absolute;
			font-size: 0.75rem;
			color: theme('colors.gray.400');
			line-height: 0;
			left: 50%;
			transform: translateX(-50%);

			&.logit {
				gap: 0.4rem;

				bottom: 1.5rem;
				:global(svg) {
					transform: scaleY(-1);
				}
			}
			&.temp {
				top: 1.3rem;
			}
		}
		.number {
			font-family: monospace;
		}
		.filtered {
			background-color: theme('colors.purple.100');
		}
		.text {
			font-size: 0.9rem;
			font-weight: 300;
		}
		.highlight {
			color: theme('colors.purple.500');
			font-weight: 600;
		}

		.fraction {
			flex-shrink: 0;
			text-align: center;

			.frac-line {
				width: 100%;
				height: 1px;
				background-color: black;
				margin: 0.1rem 0;
			}
			.frac-top {
				padding-right: 0.8rem;
			}
			.frac-bottom {
				width: 100%;
				display: flex;
				flex-direction: column;
			}
			.sum {
				opacity: 0;
				&.active {
					opacity: 1;
				}
			}
		}

		.topk-formula {
			.cases {
				display: flex;
				flex-direction: column;
				gap: 0.5rem;
			}
			.case-row {
				display: flex;
				flex-direction: column;
				align-items: center;
				gap: 0.2rem;
			}
		}
	}

	:global(.softmax-popover) {
		width: max-content !important;
		max-width: none !important;
		padding: 0 !important;
		display: flex;
	}

	.softmax-popover-title {
		.highlight {
			color: theme('colors.purple.700');
			font-weight: 800;
		}
	}
	.softmax-popover-content {
		height: 100%;
		padding: 1rem 2rem;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		gap: 1.5rem;

		.desc {
			// font-style: italic;
			color: theme('colors.gray.400');
			font-weight: 300;
		}
	}
</style>

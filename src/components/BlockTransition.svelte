<script lang="ts">
	import { AngleLeftOutline, AngleRightOutline } from 'flowbite-svelte-icons';
	import { onMount, tick } from 'svelte';
	import {
		blockIdx,
		blockIdxTemp,
		rootRem,
		modelMeta,
		isOnBlockTransition,
		isBoundingBoxActive,
		expandedBlock,
		weightPopover,
		isOnAnimation,
		userId
	} from '~/store';
	import { textPages } from '~/utils/textbookPages';
	import TextbookTooltip from './common/TextbookTooltip.svelte';

	let resizeObserver: ResizeObserver;
	let boundingPos = { left: 0, top: 0, width: 0 };

	let duration = 800;

	const asyncUpdateBlockIdx = (timeout = duration) => {
		setTimeout(() => {
			$blockIdx = $blockIdxTemp;
		}, timeout);
	};

	const animateForwardTransition = async ({ asyncTime } = {}) => {
		const container = document.querySelector('.steps .blocks');
		await tick();

		isOnBlockTransition.set(true);
		await tick();

		container.classList.add('animate-forward');
		await tick();

		asyncUpdateBlockIdx(asyncTime);

		setTimeout(() => {
			container.classList.remove('animate-forward');
			isOnBlockTransition.set(false);
		}, duration);
	};

	const animateBackwardTransition = async ({ asyncTime } = {}) => {
		const container = document.querySelector('.steps .blocks');
		await tick();

		isOnBlockTransition.set(true);
		await tick();

		container.classList.add('animate-backward');
		await tick();

		asyncUpdateBlockIdx(asyncTime);

		setTimeout(() => {
			container.classList.remove('animate-backward');
			isOnBlockTransition.set(false);
		}, duration);
	};

	let currentBlockIdx = $blockIdxTemp;

	blockIdxTemp.subscribe((newIdx) => {
		if (newIdx === currentBlockIdx) return;

		// 2->1
		if (currentBlockIdx === 1 && newIdx === 0) {
			animateBackwardTransition({ asyncTime: 0 });
			currentBlockIdx = newIdx;
			return;
		}
		//11->12
		if (currentBlockIdx === $modelMeta.layer_num - 2 && newIdx === $modelMeta.layer_num - 1) {
			animateForwardTransition({ asyncTime: 0 });
			currentBlockIdx = newIdx;
			return;
		}

		// 12->1
		if (currentBlockIdx === $modelMeta.layer_num - 1 && newIdx === 0) {
			animateForwardTransition();
			currentBlockIdx = newIdx;
			return;
		}
		// 1->12
		if (newIdx === $modelMeta.layer_num - 1 && currentBlockIdx === 0) {
			animateBackwardTransition();
			currentBlockIdx = newIdx;
			return;
		}

		if (newIdx > currentBlockIdx) {
			animateForwardTransition();
			currentBlockIdx = newIdx;
			return;
		}

		if (newIdx < currentBlockIdx) {
			animateBackwardTransition();
			currentBlockIdx = newIdx;
			return;
		}
	});

	// transformer block bounding
	onMount(() => {
		const setPosition = () => {
			const scrollLeft = window.scrollX;
			const topbarHeight = document.querySelector('.top-bar')?.offsetHeight;

			const embedding = document.querySelector('.step.qkv .content .block-start-column');
			const block =
				$blockIdx === $modelMeta.layer_num - 1
					? document.querySelector('.step.transformer-blocks .content .column.final')
					: document.querySelector('.step.transformer-blocks .content');

			const embeddingRect = embedding.getBoundingClientRect();
			const blockRect = block.getBoundingClientRect();

			boundingPos = {
				left: embeddingRect.left + scrollLeft + rootRem,
				top: embeddingRect.top - topbarHeight,
				width: blockRect.left - embeddingRect.left - rootRem
			};
		};
		setPosition();

		resizeObserver = new ResizeObserver((entries) => {
			setPosition();
		});
		const elements = document?.querySelectorAll('.resize-watch');
		elements.forEach((el) => resizeObserver.observe(el));
	});

	const onClickNext = (e) => {
		e.stopPropagation();
		textPages.find((page) => page.id === 'blocks')?.complete();

		$blockIdxTemp = $blockIdxTemp < $modelMeta.layer_num - 1 ? $blockIdxTemp + 1 : 0;

		window.dataLayer?.push({
			event: `pagination-transformer-block-next`,
			page_num: $blockIdxTemp,
			pagination_name: 'transformer-block',
			user_id: $userId
		});
	};
	const onClickPrev = (e) => {
		e.stopPropagation();
		textPages.find((page) => page.id === 'blocks')?.complete();

		$blockIdxTemp = $blockIdxTemp > 0 ? $blockIdxTemp - 1 : $modelMeta.layer_num - 1;

		window.dataLayer?.push({
			event: `pagination-transformer-block-prev`,
			page_num: $blockIdxTemp,
			pagination_name: 'transformer-block',
			user_id: $userId
		});
	};
</script>

<div
	class="transformer-bounding"
	class:active={$isBoundingBoxActive}
	style={`left:${boundingPos.left}px;top:${boundingPos.top - rootRem * 3.5}px;width:${boundingPos.width}px;`}
></div>
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
	class="transformer-bounding-title"
	data-click="transformer-bounding-title"
	class:deactive={!!$weightPopover}
	class:hide={!!$expandedBlock.id}
	on:mouseenter={() => {
		isBoundingBoxActive.set(true);
	}}
	on:mouseleave={() => {
		isBoundingBoxActive.set(false);
	}}
	style={`top:${boundingPos.top - rootRem * 3.5}px;`}
	class:active={$isBoundingBoxActive}
>
	<TextbookTooltip id="blocks">
		<span class="title-text">第 {$blockIdxTemp + 1} 个 Transformer 块</span>
	</TextbookTooltip>
	<button
		data-click="transformer-block-prev-btn"
		on:click={onClickPrev}
		disabled={$isOnAnimation || $isOnBlockTransition || $blockIdxTemp === 0}
		><AngleLeftOutline size="sm" /></button
	>
	<button
		data-click="transformer-block-next-btn"
		on:click={onClickNext}
		disabled={$isOnAnimation || $isOnBlockTransition || $blockIdxTemp === $modelMeta.layer_num - 1}
		><AngleRightOutline size="sm" /></button
	>
</div>

<style lang="scss">
	.transformer-bounding-title {
		&.deactive {
			pointer-events: none;
		}
		position: absolute;
		left: 13rem;
		transform: translate(0, calc(-100% - 0.2rem));
		z-index: $BOUNDING_BOX_INDEX;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.3rem;
		color: theme('colors.gray.400');
		transition: opacity 0.2s;

		&.hide {
			opacity: 0;
		}

		.title-text {
			width: 10rem;
			white-space: nowrap;
			text-align: center;
			font-weight: 500;
		}

		button {
			border-radius: 0.3rem;
			padding: 0.1rem;
			border: 1px solid theme('colors.gray.300');
			color: theme('colors.gray.400');
			box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
		}
		button:disabled {
			color: theme('colors.gray.200');
			border: 1px solid theme('colors.gray.200');
		}

		&.active {
			color: theme('colors.blue.600');

			button {
				border: 1px solid theme('colors.blue.500');
				color: theme('colors.blue.600');
			}
			button:disabled {
				border: 1px solid theme('colors.blue.300');
				color: theme('colors.blue.300');
			}
		}
	}
	.transformer-bounding {
		position: absolute;
		opacity: 1;
		z-index: $BOUNDING_BOX_INDEX;
		pointer-events: none;
		height: calc(95% - 3.5rem);
		border-radius: 1rem;
		transition: all 0.2s;

		&.active {
			border: 2px dashed theme('colors.blue.400');
		}
	}
</style>

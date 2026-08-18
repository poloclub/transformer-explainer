<script lang="ts">
	import {
		modelMeta,
		headGap,
		attentionHeadIdx,
		attentionHeadIdxTemp,
		isOnAnimation,
		userId
	} from '~/store';
	import { onMount } from 'svelte';
	import { gsap, Power1 } from '~/utils/gsap';
	import { AngleLeftOutline, AngleRightOutline } from 'flowbite-svelte-icons';
	import TextbookTooltip from './common/TextbookTooltip.svelte';
	import { textPages } from '~/utils/textbookPages';

	const asyncUpdateAttentionIdx = () => {
		setTimeout(() => {
			$attentionHeadIdx = $attentionHeadIdxTemp;
		}, 850);
	};

	let headContent: HTMLDivElement;
	let headBlockSize = { width: 0, height: 0 };
	let opacityOffset = 0.1;

	$: headStyles = Array.from({ length: $modelMeta.attention_head_num }, (_, index) => ({
		width: `${headBlockSize.width}px`,
		height: `${headBlockSize.height}px`,
		transform: `translate(${index * headGap.x}px, ${index * headGap.y}px) scale(${1 - headGap.scale * index})`,
		x: index * headGap.x,
		y: index * headGap.y,
		scale: 1 - headGap.scale * index,
		zIndex: $modelMeta.attention_head_num - index,
		opacity: Math.max(0.2, 1 - index * opacityOffset)
	}));

	onMount(() => {
		const resizeObserver = new ResizeObserver((entries) => {
			for (let entry of entries) {
				const { width, height } = entry.contentRect;
				headBlockSize = {
					width,
					height
				};
			}
		});
		resizeObserver.observe(headContent);

		return () => {
			resizeObserver.unobserve(headContent);
		};
	});

	let currentHeadIdx = $attentionHeadIdxTemp;

	attentionHeadIdxTemp.subscribe((newIdx) => {
		if (newIdx === currentHeadIdx) return;

		// 12->1
		if (currentHeadIdx === $modelMeta.attention_head_num - 1 && newIdx === 0) {
			animateForwardTransition();
			currentHeadIdx = newIdx;
			return;
		}
		// 1->12
		if (newIdx === $modelMeta.attention_head_num - 1 && currentHeadIdx === 0) {
			animateBackwardTransition();
			currentHeadIdx = newIdx;
			return;
		}

		if (newIdx > currentHeadIdx) {
			animateForwardTransition();
			currentHeadIdx = newIdx;
			return;
		}

		if (newIdx < currentHeadIdx) {
			animateBackwardTransition();
			currentHeadIdx = newIdx;
			return;
		}
	});

	let container;
	let heads = [];
	let disablePagination = false;

	onMount(() => {
		heads = Array.from(container.children);
	});

	let tl;

	const animateForwardTransition = () => {
		if (tl) {
			tl.progress(1).kill();
		}

		// disablePagination = true;

		const shiftTime = 0.4;

		const [firstHead, ...restHeads] = heads;

		tl = gsap.timeline({
			ease: Power1.easeOut,
			onStart: () => {
				asyncUpdateAttentionIdx();
			},
			onComplete: () => {
				container.appendChild(firstHead);
				heads.push(heads.shift());
				disablePagination = false;
			}
		});

		// bugfix: initialize styles
		tl.set(heads, {
			x: (i) => headStyles[i].x,
			y: (i) => headStyles[i].y,
			opacity: (i) => headStyles[i].opacity,
			scale: (i) => headStyles[i].scale,
			zIndex: (i) => headStyles[i].zIndex
		});

		// move back cards
		tl.to(restHeads, {
			x: (i) => headStyles[i].x,
			y: (i) => headStyles[i].y,
			opacity: (i) => headStyles[i].opacity,
			scale: (i) => headStyles[i].scale,
			stagger: { from: 'end', amount: 0.06 }
		});

		// hide content
		// tl.set(headContent, {
		// 	opacity: 0.6
		// });
		// tl.set('.sankey-top', { zIndex: $modelMeta.attention_head_num - 1 });

		// hide first card
		tl.to(firstHead, {
			ease: Power1.easeIn,
			// x: '-10%',
			// y: '10%',
			scale: 1.4,
			opacity: 0,
			duration: shiftTime
		});

		// show content
		// tl.set('.sankey-top', { zIndex: $modelMeta.attention_head_num });
		// tl.set(headContent, {
		// 	opacity: 1
		// });
		tl.set(restHeads, {
			zIndex: (i) => headStyles[i].zIndex,
			opacity: (i) => headStyles[i].opacity,
			scale: (i) => headStyles[i].scale
		});

		// show first item at the end
		const secondLastStyle = headStyles[headStyles.length - 2];
		const lastStyle = headStyles[headStyles.length - 1];

		tl.set(firstHead, {
			opacity: secondLastStyle.opacity,
			scale: secondLastStyle.scale,
			x: secondLastStyle.x,
			y: secondLastStyle.y,
			zIndex: secondLastStyle.zIndex
		});
		tl.to(firstHead, {
			opacity: lastStyle.opacity,
			scale: lastStyle.scale,
			x: lastStyle.x,
			y: lastStyle.y,
			zIndex: lastStyle.zIndex,
			duration: shiftTime
		});
	};

	const animateBackwardTransition = () => {
		if (tl) {
			tl.progress(1).kill();
		}

		// disablePagination = true;

		const shiftTime = 0.4;

		const lastHead = heads[heads.length - 1];
		const restHeads = heads.slice(0, -1);

		tl = gsap.timeline({
			ease: Power1.easeOut,
			onStart: () => {
				asyncUpdateAttentionIdx();
			},
			onComplete: () => {
				container.prepend(lastHead);
				heads.unshift(heads.pop());
				disablePagination = false;
			}
		});

		// bugfix: initialize styles
		tl.set(heads, {
			x: (i) => headStyles[i].x,
			y: (i) => headStyles[i].y,
			opacity: (i) => headStyles[i].opacity,
			scale: (i) => headStyles[i].scale,
			zIndex: (i) => headStyles[i].zIndex
		});

		tl.to(restHeads, {
			x: (i) => headStyles[i + 1].x,
			y: (i) => headStyles[i + 1].y,
			scale: (i) => headStyles[i + 1].scale,
			stagger: { from: 'end', amount: 0.06 }
		});

		// hide last card
		tl.to(
			lastHead,
			{
				ease: Power1.easeIn,
				y: '100%',
				opacity: 0,
				duration: shiftTime
			},
			'<'
		);

		// hide content
		// tl.set(headContent, {
		// 	opacity: 0
		// });
		// tl.set('.sankey-top', { zIndex: $modelMeta.attention_head_num - 1 });

		// show last card at the first
		const firstStyle = headStyles[0];

		tl.set(lastHead, {
			// x: '-10%',
			// y: '10%',
			x: firstStyle.x,
			y: firstStyle.y,
			scale: 1.4,
			opacity: 0,
			zIndex: firstStyle.zIndex
		});
		tl.to(lastHead, {
			// x: firstStyle.x,
			// y: firstStyle.y,
			opacity: firstStyle.opacity,
			scale: firstStyle.scale,
			duration: shiftTime
		});

		// show content
		// tl.set('.sankey-top', { zIndex: $modelMeta.attention_head_num });
		// tl.set(headContent, {
		// 	opacity: 1
		// });

		tl.set(restHeads, {
			zIndex: (i) => headStyles[i + 1].zIndex,
			opacity: (i) => headStyles[i + 1].opacity,
			scale: (i) => headStyles[i + 1].scale
		});
	};

	const onClickNext = () => {
		textPages.find((page) => page.id === 'multi-head')?.complete();

		$attentionHeadIdxTemp =
			$attentionHeadIdxTemp < $modelMeta.attention_head_num - 1 ? $attentionHeadIdxTemp + 1 : 0;
		window.dataLayer?.push({
			event: `pagination-attention-head-next`,
			page_num: $attentionHeadIdxTemp,
			pagination_name: 'attention-head',
			user_id: $userId
		});
	};

	const onClickPrev = () => {
		textPages.find((page) => page.id === 'multi-head')?.complete();

		$attentionHeadIdxTemp =
			$attentionHeadIdxTemp > 0 ? $attentionHeadIdxTemp - 1 : $modelMeta.attention_head_num - 1;
		window.dataLayer?.push({
			event: `pagination-attention-head-prev`,
			page_num: $attentionHeadIdxTemp,
			pagination_name: 'attention-head',
			user_id: $userId
		});
	};
</script>

<div class="multi-head flex w-full" data-click="attention-head">
	<div class="head-title absolute bottom-2 right-3 text-right text-gray-400">
		<TextbookTooltip id="multi-head">
			<span class="title-text"
				>注意力头 {$attentionHeadIdxTemp + 1} / {$modelMeta.attention_head_num}</span
			></TextbookTooltip
		>
		<button
			on:click={onClickPrev}
			disabled={$isOnAnimation || disablePagination}
			data-click="attention-head-prev-btn"><AngleLeftOutline size="sm"></AngleLeftOutline></button
		>
		<button
			on:click={onClickNext}
			disabled={$isOnAnimation || disablePagination}
			data-click="attention-head-next-btn"><AngleRightOutline size="sm"></AngleRightOutline></button
		>
	</div>
	<div class={'head-content'} bind:this={headContent}>
		<slot></slot>
	</div>
	<div class="head-card-container absolute" bind:this={container}>
		{#each headStyles as head, index}
			<div
				class={`head-${index} head-card absolute`}
				class:first={index === 0}
				style={`width:${head.width};height:${head.height};transform:${head.transform};z-index:${head.zIndex};opacity:${head.opacity};`}
			></div>
		{/each}
	</div>
</div>

<style lang="scss">
	.head-title {
		padding-bottom: 0.5rem;
		padding-right: 0.5rem;

		z-index: $MULTI_HEAD_TITLE;
		display: flex;
		align-items: center;
		gap: 0.3rem;
		justify-content: space-between;
	}

	.multi-head {
		position: relative;

		.title-text {
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
	}
	.head-content {
		width: 100%;

		.contents {
			width: 100%;
		}
	}

	.head-card-container {
		z-index: 11;
	}
	.head-card {
		background-color: white;
		border: 1px solid #f9fafb;
		box-shadow:
			0px 4px 6px -1px rgba(3, 7, 18, 0.15),
			0px 2px 4px -2px rgba(3, 7, 18, 0.08);
	}
</style>

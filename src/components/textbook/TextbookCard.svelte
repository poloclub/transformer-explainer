<script lang="ts">
	import { Button } from 'flowbite-svelte';
	import { fade } from 'svelte/transition';
	import { textbookCurrentPage } from '~/store';
	import { textPages } from '~/utils/textbookPages';
	import TextbookNavigation from './TextbookNavigation.svelte';

	export let onClose: () => void;

	let isMouseInCard = false;
	let mousePosition = { x: 0, y: 0 };
	let cardElement: HTMLDivElement;

	function handleClose() {
		// Execute current page's out callback before closing
		const currentPage = textPages[$textbookCurrentPage];
		if (currentPage?.out) {
			currentPage.out();
		}
		onClose();
	}

	function handleMouseMove(event: MouseEvent) {
		if (!cardElement) return;
		const rect = cardElement.getBoundingClientRect();
		mousePosition = {
			x: event.clientX - rect.left,
			y: event.clientY - rect.top
		};
	}

	function handleMouseEnter() {
		isMouseInCard = true;
	}

	function handleMouseLeave() {
		isMouseInCard = false;
	}

	$: isLeftSide = cardElement ? mousePosition.x < cardElement.offsetWidth / 2 : true;
</script>

<div class="floating-container" transition:fade={{ duration: 150 }}>
	<div
		class="text-card"
		bind:this={cardElement}
		on:mousemove={handleMouseMove}
		on:mouseenter={handleMouseEnter}
		on:mouseleave={handleMouseLeave}
	>
		<div class="card-header">
			<div class="flex w-full items-center justify-between">
				<h3 class="text-lg font-semibold text-gray-900">
					{textPages[$textbookCurrentPage].title}
				</h3>
				<Button color="light" size="xs" class="close-btn" on:click={handleClose}>✕</Button>
			</div>
		</div>
		<div class="card-body">
			<div class="text-carousel">
				<div class="carousel-content">
					{#each textPages as page, index}
						<div class="carousel-slide" class:active={$textbookCurrentPage === index}>
							<div class="textbook-content">
								{#if page.component}
									<svelte:component this={page.component} />
								{:else if page.content}
									{@html page.content}
								{/if}
							</div>
						</div>
					{/each}
				</div>

				<TextbookNavigation {textPages} {isMouseInCard} {isLeftSide} />
			</div>
		</div>
	</div>
</div>

<style lang="scss">
	.text-card {
		width: 540px;
		height: 300px;
		box-shadow:
			0 12px 32px rgba(0, 0, 0, 0.12),
			0 4px 8px rgba(0, 0, 0, 0.06);
		border-radius: 0.6rem;
		backdrop-filter: blur(10px);
		background: rgba(255, 255, 255, 0.4);
		display: flex;
		flex-direction: column;
		cursor: default;

		.card-header {
			flex-shrink: 0;
			padding: 0.5rem;
		}

		.card-body {
			flex: 1 0 0;
			padding: 0 1rem 0.5rem 1rem;
		}
	}

	.text-carousel {
		position: relative;
		height: 100%;
		padding-bottom: 2rem;

		.carousel-content {
			position: relative;
			height: 100%;
		}

		.carousel-slide {
			position: absolute;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
			opacity: 0;
			transition: opacity 0.3s ease;
			// display: flex;
			// flex-direction: column;
			// justify-content: center;

			&.active {
				opacity: 1;
			}
		}
	}

	:global(.close-btn) {
		padding: 0.25rem 0.5rem;
		min-width: auto;
	}

	/* Textbook Content Styles */
	.textbook-content {
		line-height: 1.6;
		font-size: 0.95rem;
		cursor: default;
	}

	:global(.textbook-content p) {
		margin: 0 0 0.5rem 0;
	}

	:global(.textbook-content span.highlight) {
		// background: var(--textbook-highlight-background) !important;
	}
	:global(.textbook-content span.red) {
		color: theme('colors.red.500');
		font-weight: 500;
	}
	:global(.textbook-content span.blue) {
		color: theme('colors.blue.500');
		font-weight: 500;
	}
	:global(.textbook-content span.green) {
		color: theme('colors.green.500');
		font-weight: 500;
	}

	:global(.textbook-content span.purple) {
		color: theme('colors.purple.500');
		font-weight: 500;
	}

	:global(.textbook-content strong),
	:global(.textbook-content b) {
		// color: #1f2937;
		color: var(--textbook-highlight-color);
		// background: var(--textbook-highlight-background) !important;

		font-weight: 500;
		// background: rgba(59, 130, 246, 0.1);
		// padding: 0.1rem 0.2rem;
		// border-radius: 3px;
	}

	:global(.textbook-content br) {
		line-height: 0.8;
	}

	:global(.textbook-content ul),
	:global(.textbook-content ol) {
		margin: 0.5rem 0;
		padding-left: 0.5rem;
	}

	:global(.textbook-content li) {
		margin: 0.2rem 0;
		line-height: 1.3;
	}

	:global(.textbook-content blockquote) {
		// border-left: 3px solid #3b82f6;
		// padding: 0.5rem 0 0.5rem 0.3rem;
		margin: 0.5rem 0;
		font-style: italic;
		font-size: 0.9rem;
		color: var(--textbook-highlight-color);
		// background: var(--textbook-highlight-background) !important;

		// background: rgba(59, 130, 246, 0.05);
	}

	/* Numbered List Styles */
	:global(.textbook-content .numbered-list) {
		display: flex;
		flex-direction: column;
	}

	:global(.textbook-content .numbered-item) {
		display: flex;
		align-items: flex-start;
		gap: 0.6rem;
		padding: 0.5rem;
		// background: rgba(249, 250, 251, 0.6);
		// border-radius: 8px;
		// border: 1px solid rgba(229, 231, 235, 0.4);
	}

	:global(.textbook-content .number-circle) {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 1rem;
		height: 1rem;
		margin-top: 0.2rem;
		background: linear-gradient(135deg, #3b82f6, #2563eb);
		color: white;
		font-weight: 600;
		font-size: 0.7rem;
		border-radius: 50%;
		flex-shrink: 0;
	}

	:global(.textbook-content .item-content) {
		flex: 1;
		line-height: 1.4;
	}
</style>

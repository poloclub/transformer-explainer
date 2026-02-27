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

	// Draggable state
	let isDragging = false;
	let position = { x: window.innerWidth - 540 - 32, y: window.innerHeight - 300 - 32 };
	let dragStart = { x: 0, y: 0 };

	// Resizable state
	let isResizing = false;
	let resizeDirection = '';
	let size = { width: 540, height: 300 };
	let resizeStart = { x: 0, y: 0, width: 0, height: 0, posX: 0, posY: 0 };

	const MIN_WIDTH = 400;
	const MIN_HEIGHT = 250;
	const RESIZE_HANDLE_SIZE = 10;
	const EDGE_MARGIN = 32; // 2rem
	const SNAP_DISTANCE = 100; // pixels from corner to trigger snap

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

	// Drag functions
	function handleCardMouseDown(event: MouseEvent) {
		if ((event.target as HTMLElement).closest('.close-btn')) return;

		// Check if in resize zone
		const direction = getResizeDirection(event);
		if (direction) {
			startResize(event, direction);
			return;
		}

		isDragging = true;
		dragStart = {
			x: event.clientX - position.x,
			y: event.clientY - position.y
		};
	}

	function handleGlobalMouseMove(event: MouseEvent) {
		if (isDragging) {
			position = {
				x: event.clientX - dragStart.x,
				y: event.clientY - dragStart.y
			};
		} else if (isResizing) {
			handleResize(event);
		}
	}

	function snapToCorner() {
		const corners = [
			{ x: EDGE_MARGIN, y: EDGE_MARGIN }, // top-left
			{ x: window.innerWidth - size.width - EDGE_MARGIN, y: EDGE_MARGIN }, // top-right
			{ x: EDGE_MARGIN, y: window.innerHeight - size.height - EDGE_MARGIN }, // bottom-left
			{
				x: window.innerWidth - size.width - EDGE_MARGIN,
				y: window.innerHeight - size.height - EDGE_MARGIN
			} // bottom-right
		];

		let minDistance = Infinity;
		let closestCorner = null;

		for (const corner of corners) {
			const distance = Math.sqrt(
				Math.pow(position.x - corner.x, 2) + Math.pow(position.y - corner.y, 2)
			);
			if (distance < minDistance) {
				minDistance = distance;
				closestCorner = corner;
			}
		}

		if (minDistance < SNAP_DISTANCE && closestCorner) {
			position = { x: closestCorner.x, y: closestCorner.y };
		}
	}

	function handleGlobalMouseUp() {
		if (isDragging) {
			snapToCorner();
		}
		isDragging = false;
		isResizing = false;
		resizeDirection = '';
	}

	// Resize functions
	function getResizeDirection(event: MouseEvent): string {
		if (!cardElement || isDragging || isResizing) return '';

		const rect = cardElement.getBoundingClientRect();
		const x = event.clientX - rect.left;
		const y = event.clientY - rect.top;

		const nearRight = rect.width - x <= RESIZE_HANDLE_SIZE;
		const nearBottom = rect.height - y <= RESIZE_HANDLE_SIZE;
		const nearLeft = x <= RESIZE_HANDLE_SIZE;
		const nearTop = y <= RESIZE_HANDLE_SIZE;

		if (nearRight && nearBottom) return 'se';
		if (nearLeft && nearBottom) return 'sw';
		if (nearRight && nearTop) return 'ne';
		if (nearLeft && nearTop) return 'nw';
		if (nearRight) return 'e';
		if (nearBottom) return 's';
		if (nearLeft) return 'w';
		if (nearTop) return 'n';

		return '';
	}

	function handleCardMouseMove(event: MouseEvent) {
		if (!isResizing && !isDragging) {
			const direction = getResizeDirection(event);
			resizeDirection = direction;

			// Update CSS variable for cursor
			if (cardElement) {
				const cursor = direction ? getCursorForDirection(direction) : 'grab';
				cardElement.style.setProperty('--card-cursor', cursor);
			}
		} else if (isDragging) {
			if (cardElement) {
				cardElement.style.setProperty('--card-cursor', 'grabbing');
			}
		}
		handleMouseMove(event);
	}

	function startResize(event: MouseEvent, direction: string) {
		isResizing = true;
		resizeDirection = direction;
		resizeStart = {
			x: event.clientX,
			y: event.clientY,
			width: size.width,
			height: size.height,
			posX: position.x,
			posY: position.y
		};
		event.preventDefault();
	}

	function handleResize(event: MouseEvent) {
		const dx = event.clientX - resizeStart.x;
		const dy = event.clientY - resizeStart.y;

		let newWidth = resizeStart.width;
		let newHeight = resizeStart.height;
		let newX = resizeStart.posX;
		let newY = resizeStart.posY;

		if (resizeDirection.includes('e')) {
			newWidth = Math.max(MIN_WIDTH, resizeStart.width + dx);
		}
		if (resizeDirection.includes('w')) {
			const calculatedWidth = resizeStart.width - dx;
			if (calculatedWidth >= MIN_WIDTH) {
				newWidth = calculatedWidth;
				newX = resizeStart.posX + dx;
			} else {
				newWidth = MIN_WIDTH;
				newX = resizeStart.posX + (resizeStart.width - MIN_WIDTH);
			}
		}
		if (resizeDirection.includes('s')) {
			newHeight = Math.max(MIN_HEIGHT, resizeStart.height + dy);
		}
		if (resizeDirection.includes('n')) {
			const calculatedHeight = resizeStart.height - dy;
			if (calculatedHeight >= MIN_HEIGHT) {
				newHeight = calculatedHeight;
				newY = resizeStart.posY + dy;
			} else {
				newHeight = MIN_HEIGHT;
				newY = resizeStart.posY + (resizeStart.height - MIN_HEIGHT);
			}
		}

		size = { width: newWidth, height: newHeight };
		position = { x: newX, y: newY };
	}

	function getCursorForDirection(direction: string): string {
		const cursorMap: Record<string, string> = {
			n: 'ns-resize',
			s: 'ns-resize',
			e: 'ew-resize',
			w: 'ew-resize',
			ne: 'nesw-resize',
			sw: 'nesw-resize',
			nw: 'nwse-resize',
			se: 'nwse-resize'
		};
		return cursorMap[direction] || 'default';
	}

	$: isLeftSide = cardElement ? mousePosition.x < cardElement.offsetWidth / 2 : true;
</script>

<svelte:window on:mousemove={handleGlobalMouseMove} on:mouseup={handleGlobalMouseUp} />

<div
	class="floating-container"
	transition:fade={{ duration: 150 }}
	style="left: {position.x}px; top: {position.y}px;"
>
	<div
		class="text-card"
		bind:this={cardElement}
		on:mousemove={handleCardMouseMove}
		on:mousedown={handleCardMouseDown}
		on:mouseenter={handleMouseEnter}
		on:mouseleave={handleMouseLeave}
		role="dialog"
		aria-label="Textbook"
		style="width: {size.width}px; height: {size.height}px;"
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
	.floating-container {
		position: fixed;
		z-index: 1000;
	}

	.text-card {
		box-shadow:
			0 12px 32px rgba(0, 0, 0, 0.12),
			0 4px 8px rgba(0, 0, 0, 0.06);
		border-radius: 0.6rem;
		backdrop-filter: blur(10px);
		background: rgba(255, 255, 255, 0.4);
		display: flex;
		flex-direction: column;
		user-select: none;
		cursor: var(--card-cursor, grab);

		* {
			cursor: inherit;
		}

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

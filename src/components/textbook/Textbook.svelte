<script lang="ts">
	import { GradientButton } from 'flowbite-svelte';
	import { BookOpenSolid } from 'flowbite-svelte-icons';
	import { fade } from 'svelte/transition';
	import {
		textbookCurrentPage,
		textbookPreviousPage,
		isTextbookOpen,
		expandedBlock,
		textbookCurrentPageId,
		userId
	} from '~/store';
	import { textPages } from '~/utils/textbookPages';
	import TextbookCard from './TextbookCard.svelte';

	export let showTextCard: boolean = false;

	$: if (showTextCard) {
		handlePageTransition($textbookCurrentPage, $textbookPreviousPage);
	} else {
		if ($textbookPreviousPage >= 0 && textPages[$textbookPreviousPage]?.out) {
			textPages[$textbookPreviousPage].out();
		}
		textbookPreviousPage.set(-1);
	}

	function handlePageTransition(newPage: number, oldPage: number) {
		if (oldPage >= 0 && oldPage !== newPage) {
			textPages[oldPage]?.out();
		}
		setTimeout(() => {
			textPages[newPage]?.on();
		}, 0);
	}
</script>

<!-- Floating Book Button -->
{#if !showTextCard}
	<div class="floating-container" transition:fade={{ duration: 150 }}>
		<GradientButton
			pill={true}
			color="purpleToBlue"
			class="floating-btn h-14 w-14"
			on:click={() => {
				isTextbookOpen.set(true);

				window.dataLayer?.push({
					event: `open-textbook`,
					page_id: $textbookCurrentPageId,
					open_via: 'floating-button',
					user_id: $userId
				});
			}}
		>
			<BookOpenSolid class="h-8 w-8" />
		</GradientButton>
	</div>
{/if}

{#if showTextCard}
	<TextbookCard onClose={() => isTextbookOpen.set(false)} />
{/if}

<style lang="scss">
	.floating-container {
		position: fixed;
		bottom: 2rem;
		right: 2rem;
		z-index: $TEXTBOOK_INDEX;
	}

	.floating-btn {
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
		transition: all 0.2s ease;

		&:hover {
			transform: translateY(-2px);
			box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
		}
	}
	:root {
		--textbook-highlight-color: theme('colors.blue.600');
		--textbook-highlight-background: linear-gradient(
			to top,
			rgba(251, 255, 0, 0.5),
			rgba(251, 255, 0, 0.3),
			rgba(255, 212, 8, 0)
		);
		--textbook-highlight-shadow-in:
			inset 0 0 10px rgba(251, 255, 0, 0.5), inset 0 0 10px 2px rgba(251, 255, 0, 0.3);
		--textbook-highlight-shadow-out:
			0 2px 8px 1px rgba(251, 255, 0, 0.5), 0 1.5px 6px 3px rgba(251, 255, 0, 0.12);
	}

	:global(.remove-finger) {
		&::after {
			display: none !important;
		}

		:global(*) {
			&::after {
				display: none !important;
			}
		}
	}

	// page - transformer
	:global(.generate-button) {
		.highlight-text {
			display: none;
		}
	}
	:global(.input-form.textbook-highlight .input-btn-group) {
		transition: box-shadow 0.2s ease-in-out;
		box-shadow: var(--textbook-highlight-shadow-out) !important;
	}

	:global(.input-form .generate-button.textbook-highlight) {
		transition: box-shadow 0.2s ease-in-out;
		box-shadow: var(--textbook-highlight-shadow-out) !important;

		// animation: textbook-button-blink 2s infinite;
		border: 1px solid var(--predicted-color);
		color: var(--predicted-color);
		position: relative;
		&::after {
			content: '👆';
			display: block;
			white-space: nowrap;
			position: absolute;
			bottom: -2.2rem;
			right: 0;
			left: 50%;
			transform: translateX(-50%);
			color: var(--textbook-highlight-color);
			font-size: 2rem;
			pointer-events: none;
			animation: finger-poke 1.5s ease-in-out infinite;
		}
	}

	:global(.input-form .select-button.textbook-highlight) {
		position: relative;
		&::after {
			content: '👆';
			display: block;
			white-space: nowrap;
			position: absolute;
			bottom: -2.2rem;
			right: 0;
			left: 50%;
			transform: translateX(-50%);
			color: var(--textbook-highlight-color);
			font-size: 2rem;
			pointer-events: none;
			animation: finger-poke 1.5s ease-in-out infinite;
		}
	}

	// page - architecture
	:global(.step.textbook-highlight > .title) {
		width: 1rem !important;
		white-space: nowrap !important;
		color: var(--textbook-highlight-color) !important;
		font-weight: 500 !important;
	}
	:global(.textbook-highlight .bounding) {
		opacity: 1 !important;
		border: 1px dashed var(--textbook-highlight-color) !important;
		box-shadow: var(--textbook-highlight-shadow-in) !important;
		z-index: $BOUNDING_BOX_INDEX !important;
		border-radius: 1rem !important;
	}
	:global(.embedding.textbook-highlight),
	:global(.softmax.textbook-highlight) {
		:global(.title) {
			padding-bottom: 3.5rem !important;
		}
		:global(.bounding) {
			top: -3.3rem !important;
			padding: 0 !important;
		}
	}
	:global(.transformer-bounding-title.textbook-highlight) {
		color: var(--textbook-highlight-color) !important;
		:global(button) {
			border: 1px solid var(--textbook-highlight-color) !important;
			color: var(--textbook-highlight-color) !important;
		}
		:global(button:disabled) {
			border: 1px solid var(--textbook-highlight-color) !important;
			color: var(--textbook-highlight-color) !important;
		}
	}
	:global(.transformer-bounding.textbook-highlight) {
		border: 1px dashed var(--textbook-highlight-color) !important;
		box-shadow: var(--textbook-highlight-shadow-in) !important;
	}

	// page - embedding
	:global(.embedding .column.textbook-highlight) {
		// border-radius: 1rem;
		transition: all 0.2s !important;
		background: var(--textbook-highlight-background) !important;

		:global(.subtitle) {
			transition: all 0.2s !important;
			// font-weight: 600 !important;
			color: var(--textbook-highlight-color) !important;
		}

		:global(.bounding) {
			opacity: 0 !important;
		}
	}
	:global(.embedding .title.textbook-highlight .title-text) {
		position: relative;
		transition: all 0.2s ease-in-out;
		cursor: pointer;
		color: theme('colors.gray.600') !important;
		background: var(--textbook-highlight-background) !important;

		&::after {
			content: '👈';
			display: block;
			white-space: nowrap;
			position: absolute;
			right: -2rem;
			color: var(--textbook-highlight-color);
			font-size: 2rem;
			pointer-events: none;
			animation: finger-poke-horizon 1.5s ease-in-out infinite;
		}
	}

	// page qkv
	:global(.qkv-column.textbook-highlight) {
		&::after {
			z-index: $BOUNDING_BOX_INDEX;
			content: '👇';
			display: block;
			white-space: nowrap;
			position: absolute;
			right: 2rem;
			top: -2rem;
			color: var(--textbook-highlight-color);
			font-size: 2rem;
			pointer-events: none;
			animation: finger-poke 1.5s ease-in-out infinite;
		}
	}
	:global(.path-group.qkv.textbook-highlight) {
		animation: opacity-blink 1.5s ease-in-out infinite !important;
	}

	// page multi-head
	:global(.multi-head .head-title.textbook-highlight) {
		color: var(--textbook-highlight-color) !important;
		// font-weight: 600 !important;
		transition: all 0.3s ease-in-out !important;
		scale: 1.1 !important;

		:global(button) {
			transition: all 0.5s !important;
			border: 1px solid var(--textbook-highlight-color) !important;
			color: var(--textbook-highlight-color) !important;
			box-shadow: var(--textbook-highlight-shadow-out) !important;
		}

		&::after {
			z-index: $BOUNDING_BOX_INDEX;
			content: '👈';
			display: block;
			white-space: nowrap;
			position: absolute;
			right: -1.5rem;
			bottom: 0rem;
			color: var(--textbook-highlight-color);
			font-size: 2rem;
			pointer-events: none;
			animation: finger-poke-horizon 1.5s ease-in-out infinite;
		}
	}

	// page attention
	:global(.attention-result.textbook-highlight) {
		&::after {
			content: '👆';
			display: block;
			white-space: nowrap;
			position: absolute;
			bottom: -2.2rem;
			left: 50%;
			color: var(--textbook-highlight-color);
			font-size: 2rem;
			pointer-events: none;
			animation: finger-poke 1.5s ease-in-out infinite;
		}
	}
	:global(.attention-result.textbook-highlight .matrix-label) {
		color: theme('colors.gray.600') !important;
		background: var(--textbook-highlight-background) !important;
	}

	// page output concat
	:global(path.to-attention-out.value-to-out.textbook-highlight) {
		animation: opacity-blink 1.5s ease-in-out infinite !important;
		&::after {
			z-index: $BOUNDING_BOX_INDEX;
			content: '👈';
			display: block;
			white-space: nowrap;
			position: absolute;
			right: -1.5rem;
			bottom: 0rem;
			color: var(--textbook-highlight-color);
			font-size: 2rem;
			pointer-events: none;
			animation: finger-poke-horizon 1.5s ease-in-out infinite;
		}
		// color: var(--textbook-highlight-color) !important;
	}
	:global(.column.out.textbook-highlight) {
		&::after {
			z-index: $BOUNDING_BOX_INDEX;
			content: '👈';
			display: block;
			white-space: nowrap;
			position: absolute;
			left: 0;
			bottom: -4rem;
			color: var(--textbook-highlight-color);
			font-size: 2rem;
			pointer-events: none;
			animation: finger-poke-horizon 1.5s ease-in-out infinite;
		}
	}

	// page transformer blocks
	:global(.step.transformer-blocks .guide.textbook-highlight) {
		transition: all 0.5s !important;
		scale: 1.1 !important;
	}

	:global(.transformer-bounding-title.textbook-button-highlight) {
		color: var(--textbook-highlight-color) !important;
		// font-weight: 600 !important;
		transition: all 0.3s ease-in-out !important;
		scale: 1.1 !important;

		:global(button) {
			transition: all 0.5s !important;
			border: 1px solid var(--textbook-highlight-color) !important;
			color: var(--textbook-highlight-color) !important;
			box-shadow: var(--textbook-highlight-shadow-out) !important;
		}
		&::after {
			z-index: $BOUNDING_BOX_INDEX;
			content: '👈';
			display: block;
			white-space: nowrap;
			position: absolute;
			right: -2rem;
			bottom: -0.5rem;
			color: var(--textbook-highlight-color);
			font-size: 1.7rem;
			pointer-events: none;
			animation: finger-poke-horizon 1.5s ease-in-out infinite;
		}
	}
	:global(.attention .title.textbook-highlight) {
		color: var(--textbook-highlight-color) !important;
	}
	:global(.mlp .title.textbook-highlight) {
		color: var(--textbook-highlight-color);
	}

	// logit
	:global(.path-group.softmax.textbook-highlight > path) {
		animation: opacity-blink 1.5s ease-in-out infinite !important;
	}
	:global(.column.final.textbook-highlight) {
		&::after {
			z-index: $BOUNDING_BOX_INDEX;
			content: '👉';
			display: block;
			white-space: nowrap;
			position: absolute;
			right: 1rem;
			bottom: 0rem;
			color: var(--textbook-highlight-color);
			font-size: 2rem;
			pointer-events: none;
			animation: finger-poke-horizon 1.5s ease-in-out infinite;
		}
	}

	// page 12 probabilities
	:global(.step.softmax .title.textbook-highlight .title-text) {
		position: relative;
		transition: all 0.2s ease-in-out;
		cursor: pointer;
		color: theme('colors.gray.600') !important;
		background: var(--textbook-highlight-background) !important;

		&::after {
			content: '👈';
			display: block;
			white-space: nowrap;
			position: absolute;
			right: -2rem;
			color: var(--textbook-highlight-color);
			font-size: 2rem;
			pointer-events: none;
			animation: finger-poke-horizon 1.5s ease-in-out infinite;
		}
	}

	// page temperature
	:global(.formula-step.scaled.textbook-highlight) {
		background: var(--textbook-highlight-background) !important;
		color: theme('colors.gray.600') !important;
	}

	:global(.title-box.scaled.textbook-highlight .title-text) {
		color: theme('colors.gray.600') !important;
		background: var(--textbook-highlight-background) !important;
	}
	:global(.content-box.scaled.textbook-highlight) {
		background: var(--textbook-highlight-background) !important;
	}

	:global(.temperature-input.textbook-highlight) {
		position: relative;
		&::after {
			content: '👆';
			display: block;
			white-space: nowrap;
			position: absolute;
			bottom: -2.5rem;
			left: 50%;
			transform: translateX(-50%);
			color: var(--textbook-highlight-color);
			font-size: 2rem;
			pointer-events: none;
			animation: finger-poke 1.5s ease-in-out infinite;
		}
	}
	:global(.temperature-input.textbook-highlight) {
		background: var(--textbook-highlight-background) !important;
	}

	// page sampling
	:global(.formula-step.sampling.textbook-highlight) {
		background: var(--textbook-highlight-background) !important;
		color: theme('colors.gray.600') !important;
	}

	:global(.title-box.sampling.textbook-highlight .title-text) {
		color: theme('colors.gray.600') !important;
		background: var(--textbook-highlight-background) !important;
	}
	:global(.content-box.sampling.textbook-highlight) {
		background: var(--textbook-highlight-background) !important;
	}
	:global(.sampling-input.textbook-highlight) {
		position: relative;
		&::after {
			content: '👆';
			display: block;
			white-space: nowrap;
			position: absolute;
			bottom: -2.5rem;
			left: 50%;
			transform: translateX(-50%);
			color: var(--textbook-highlight-color);
			font-size: 2rem;
			pointer-events: none;
			animation: finger-poke 1.5s ease-in-out infinite;
		}
	}
	:global(.sampling-input.textbook-highlight) {
		background: var(--textbook-highlight-background) !important;
	}

	// residual
	:global(.operation-col.residual.textbook-highlight) {
		// pointer-events: none;
	}
	:global(.residual-start.textbook-highlight .residual-text) {
		color: theme('colors.gray.600') !important;
		background: var(--textbook-highlight-background) !important;
	}

	// ln, dropout
	:global(.operation-col.textbook-highlight) {
		// pointer-events: none;
	}
	:global(.operation-col.textbook-highlight .icon) {
		opacity: 0 !important;
	}
	:global(.operation-col.textbook-highlight .line) {
		opacity: 1 !important;
	}
	:global(.operation-col.textbook-highlight .guide) {
		opacity: 1 !important;
	}
	:global(.operation-col.textbook-highlight .guide-text) {
		color: theme('colors.gray.600') !important;
		background: var(--textbook-highlight-background) !important;
	}

	// animation
	@keyframes finger-poke {
		0%,
		100% {
			transform: translateY(0);
		}
		20% {
			transform: translateY(-4px);
		}
		40% {
			transform: translateY(3px);
		}
		60% {
			transform: translateY(-2px);
		}
		80% {
			transform: translateY(0);
		}
	}
	@keyframes finger-poke-horizon {
		0%,
		100% {
			transform: translateX(0);
		}
		20% {
			transform: translateX(-4px);
		}
		40% {
			transform: translateX(3px);
		}
		60% {
			transform: translateX(-2px);
		}
		80% {
			transform: translateX(0);
		}
	}

	@keyframes textbook-button-blink {
		0% {
			border: 1px solid theme('colors.gray.300');
			color: theme('colors.gray.600');
		}
		50% {
			border: 1px solid var(--predicted-color);
			color: var(--predicted-color);
		}
		100% {
			border: 1px solid theme('colors.gray.300');
			color: theme('colors.gray.600');
		}
	}
	@keyframes scale-blink {
		0% {
			transform: scale(1);
		}
		50% {
			transform: scale(1.08);
		}
		100% {
			transform: scale(1);
		}
	}
	@keyframes opacity-blink {
		0%,
		100% {
			opacity: 0.6;
		}
		50% {
			opacity: 1;
		}
	}
</style>

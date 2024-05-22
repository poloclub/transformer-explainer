<script lang="ts">
	import { tokens } from '~/store';
	import Sankey from '~/components/Sankey.svelte';
	import Attention from '~/components/Attention.svelte';
	import SubsequentBlocks from '~/components/SubsequentBlocks.svelte';
	// import LinearSoftmax from '~/components/LinearSoftmax.svelte';
	import LinearSoftmax from '~/components/LinearSoftmax.svelte';
	import Embedding from '~/components/Embedding.svelte';
	import Mlp from '~/components/Mlp.svelte';

	import { Spinner } from 'flowbite-svelte';

	import resolveConfig from 'tailwindcss/resolveConfig';
	import tailwindConfig from '../../tailwind.config';

	const { theme } = resolveConfig(tailwindConfig);

	// onMount(() => {
	// 	const tl = gsap.timeline();
	// 	tl.from('.main-section', { opacity: 0, duration: 1 });
	// });

	const rootRem = 16;

	let vizHeight = 0;
	let titleHeight = rootRem * 5;
	const minVectorHeight = 12;
	const maxVectorHeight = 36;

	const maxVectorScale = 4;
	$: gaps = rootRem * 0.5 * ($tokens.length - 1);

	$: vectorHeight = Math.min(
		Math.max((vizHeight - titleHeight - gaps) / $tokens.length / maxVectorScale, minVectorHeight),
		maxVectorHeight
	);
	$: headContentHeight = $tokens.length * vectorHeight * 3 + gaps;
</script>

<div
	class="main-section h-full"
	style={`--vector-height: ${vectorHeight}px;--title-height: ${titleHeight}px`}
>
	<!-- <Spinner color={theme.colors['primary'][500]} /> -->
	<div class="sankey pointer-events-none">
		<Sankey />
	</div>
	<div class="nodes resize-watch">
		<div class="steps" bind:offsetHeight={vizHeight}>
			<Embedding className="step" />
			<Attention className="step" {headContentHeight} />
			<Mlp className="step" />
			<SubsequentBlocks className="step" />
			<LinearSoftmax className="step" />
		</div>
	</div>
</div>

<style lang="scss">
	.nodes {
		height: 100%;
		width: 100%;
		padding: 1rem 3rem 3rem 3rem;
		position: relative;
	}
	.sankey {
		position: absolute;
		left: 0;
		top: 0;
		width: 100%;
		height: 100%;
	}
	.steps {
		height: 100%;
		position: relative;
		display: grid;
		grid-template-columns: 4fr 8fr 6fr 4fr 2fr;
		grid-template-rows: var(--title-height) 1fr;
	}

	:global(.step) {
		display: contents;
	}

	:global(.step .title) {
		z-index: 101;
		display: flex;
		flex-direction: column;
		justify-content: end;
		grid-row: 1;
		color: theme('colors.gray.300');
		white-space: nowrap;
		padding-bottom: 1rem;
	}

	:global(.step .content) {
		grid-row: 2;
	}

	:global(.tokens) {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	:global(.vector),
	:global(.sub-vector) {
		z-index: 101;
		width: 12px;
		height: var(--vector-height);
	}

	:global(.vector.x1-12),
	:global(.sub-vector.x1-12) {
		height: calc(var(--vector-height) / 12);
	}

	:global(.vector.x3),
	:global(.sub-vector.x3) {
		height: calc(var(--vector-height) * 3);
	}

	:global(.vector.x4),
	:global(.sub-vector.x4) {
		height: calc(var(--vector-height) * 4);
	}

	:global(.vector.vocab),
	:global(.sub-vector.vocab) {
		height: 100%;
	}

	:global(.token) {
		display: flex;
		gap: 1rem;
		align-items: center;
		position: relative;

		:global(.label) {
			z-index: 101;
			display: inline;
			width: 4rem;
			overflow: hidden;
			text-overflow: ellipsis;
			text-align: right;
			line-height: var(--vector-height);
		}
		:global(.label.float) {
			position: absolute;
			left: -1rem;
			transform: translateX(-100%);
		}
	}

	:global(.ellipsis) {
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
</style>

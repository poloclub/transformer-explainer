<script lang="ts">
	import { tokens, expandedBlock, vectorHeight } from '~/store';
	import Sankey from '~/components/Sankey.svelte';
	import Attention from '~/components/Attention.svelte';
	import SubsequentBlocks from '~/components/SubsequentBlocks.svelte';
	// import LinearSoftmax from '~/components/LinearSoftmax.svelte';
	import LinearSoftmax from '~/components/LinearSoftmax.svelte';
	import Embedding from '~/components/Embedding.svelte';
	import Mlp from '~/components/Mlp.svelte';
	import { onMount } from 'svelte';

	import { Spinner } from 'flowbite-svelte';

	import resolveConfig from 'tailwindcss/resolveConfig';
	import tailwindConfig from '../../tailwind.config';
	import classNames from 'classnames';

	import { getData } from '~/utils/data.ts';

	const { theme } = resolveConfig(tailwindConfig);

	// onMount(() => {
	// 	const tl = gsap.timeline();
	// 	tl.from('.main-section', { opacity: 0, duration: 1 });
	// });

	let isExpanded = false;
	$: if ($expandedBlock.id !== null) {
		isExpanded = true;
	} else {
		isExpanded = false;
	}

	const run = async()=>{
		console.log('run')
		const res = await getData('Georgia tech is a');
		console.log(res)
	}
	onMount(() => {
		run()
		// const tl = gsap.timeline();
		// tl.from('.main-section', { opacity: 0, duration: 1 });
	});


	let offset;
	console.log(offset);

	const rootRem = 16;

	let vizHeight = 0;
	let titleHeight = rootRem * 6;
	const minVectorHeight = 12;
	const maxVectorHeight = 36;

	const maxVectorScale = 4;
	$: gaps = rootRem * 0.5 * ($tokens.length - 1);

	$: vectorHeightVal = Math.min(
		Math.max((vizHeight - titleHeight - gaps) / $tokens.length / maxVectorScale, minVectorHeight),
		maxVectorHeight
	);

	$: vectorHeight.set(vectorHeightVal);

	$: headContentHeight = $tokens.length * vectorHeightVal * 3 + gaps;
</script>

<div
	class="main-section h-full"
	style={`--vector-height: ${vectorHeightVal}px;--title-height: ${titleHeight}px`}
>
	<!-- <Spinner color={theme.colors['primary'][500]} /> -->
	<div class="sankey opacity-1 pointer-events-none">
		<Sankey />
	</div>
	<div class="nodes resize-watch">
		<div class="steps" class:expanded={isExpanded} bind:offsetHeight={vizHeight}>
			<Embedding className="step" />
			<Attention className="step" {headContentHeight} />
			<Mlp className="step" />
			<SubsequentBlocks className="step" />
			<LinearSoftmax className="step" />
		</div>
	</div>
	<div
		class={classNames('dim pointer-events-none', `${$expandedBlock.id || ''}`, {
			active: !!$expandedBlock.id
		})}
	></div>
</div>

<style lang="scss">
	.nodes {
		height: 100%;
		width: 100%;
		padding: 1rem 0 3rem 0;
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
		grid-template-columns: 4fr 6fr 8fr 4fr 2fr;
		grid-template-rows: var(--title-height) 1fr;

		&.expanded {
			:global(.step .title) {
				padding-bottom: 3rem;
			}
		}
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
		padding-bottom: 2rem;
		overflow: visible;
		min-width: 0;

		transition: all 0.5s;
		&:hover {
			color: theme('colors.gray.400');
		}
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
		flex-shrink: 0;
		justify-content: start;
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
		width: 0;
	}

	:global(.sub-vector.head-rest) {
		flex: 1 0 0;
	}

	:global(.token) {
		display: flex;
		gap: 1rem;
		align-items: center;
		position: relative;

		:global(.label) {
			font-size: 0.9rem;
			color: theme('colors.gray.700');
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
			left: -0.8rem;
			transform: translateX(-100%);
		}
		:global(.label.float-right) {
			position: absolute;
			right: 1rem;
			transform: translateX(100%);
			text-align: left;
		}
	}

	:global(.ellipsis) {
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	:global(.bounding) {
		z-index: 200;
		pointer-events: none;
		opacity: 0;
		box-sizing: content-box;
		position: absolute;
		padding-top: 3rem;
		/* padding-bottom: 1rem; */
		width: 100%;
		height: 100%;
		top: -5rem;
		overflow: visible;
		transition: opacity 0.5s;
		border: 2px dashed theme('colors.blue.300');

		:global(.title) {
			color: theme('colors.blue.400');
			position: absolute;
			top: -2rem;
			left: 0;
		}
	}
	:global(.bounding.active) {
		opacity: 1;
	}

	.dim {
		transition: opacity 1s;
		opacity: 0;

		z-index: 300;
		position: absolute;
		top: 0;
		height: 100%;
		background: linear-gradient(90deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 1) 80%);

		&.active {
			opacity: 1;
		}

		&.embedding {
			right: 0;
			width: 60vw;
		}
		&.softmax {
			left: 0;
			width: 50vw;
			background: linear-gradient(-90deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 1) 80%);
		}
		&.attention {
			right: 0;
			width: 30vw;
		}
	}
</style>

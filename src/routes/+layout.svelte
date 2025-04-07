<script lang="ts">
	import '~/styles/app.css';
	import '~/styles/global.scss';
	import Topbar from '~/components/Topbar.svelte';
	import { isLoaded, predictedColor, rootRem } from '~/store';
	import Article from '~/components/article/Article.svelte';
	import { onMount } from 'svelte';
	import { Spinner } from 'flowbite-svelte';
	import Alert from '~/components/Alert.svelte';

	let topBarHeight = 0;
	let scrollLeft = 0;

	let minScreenWidth = 1300;
	let minColumWidth = Math.floor(minScreenWidth / 24) - rootRem * 2;

	let intersectionObserver: IntersectionObserver;
	let tobBarActive = false;
	let target: HTMLElement;

	onMount(() => {
		isLoaded.set(true);

		intersectionObserver = new IntersectionObserver(handleIntersection, {
			root: null,
			rootMargin: '0px',
			threshold: 0.2
		});

		if (target) {
			intersectionObserver.observe(target);
		}
		window.addEventListener('scroll', handleMobileScrollX);

		return () => {
			intersectionObserver.disconnect();
			window.removeEventListener('scroll', handleMobileScrollX);
		};
	});

	function handleIntersection(entries) {
		entries.forEach((entry) => {
			if (entry.isIntersecting) {
				tobBarActive = true;
			} else {
				tobBarActive = false;
			}
		});
	}

	const handleMobileScrollX = () => {
		scrollLeft = window.scrollX || document.documentElement.scrollLeft;
	};
</script>

<div
	id="app"
	style={`--min-screen-width:${minScreenWidth}px;--min-column-width:${minColumWidth}px;--predicted-color:${predictedColor};`}
>
	<div id="landing">
		<header bind:offsetHeight={topBarHeight} style="transform: translateX({-1 * scrollLeft}px);">
			<Topbar isActive={tobBarActive} />
		</header>
		<main id="main" style={`padding-top:${topBarHeight}px`} bind:this={target}>
			{#if $isLoaded}
				<slot />
			{:else}
				<div class="flex h-full w-full items-center justify-center"><Spinner color="purple" /></div>
			{/if}
		</main>
	</div>
	<div class="article h-auto w-full">
		<Article></Article>
	</div>
</div>

<!-- <div class="alert">
	<Alert />
</div> -->

<style lang="scss">
	.alert {
		position: fixed;
		bottom: 1rem;
		right: 1rem;
		z-index: 9999;
	}

	#app {
		height: 100vh;
		min-width: 900px;
	}

	#landing {
		height: 90%;
		width: 100%;
		min-width: var(--min-screen-width);
	}

	header {
		min-width: var(--min-screen-width);
		width: 100%;
		position: fixed;
		z-index: $TOP_BAR_INDEX;
	}
	main {
		position: relative;
		height: 100%;
		width: 100%;
		display: flex;
		justify-content: start;
		overflow: hidden;
	}
	.article {
		padding-top: 2rem;
	}
</style>

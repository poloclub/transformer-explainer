<script>
	import '~/styles/app.css';
	import '~/styles/global.scss';
	import Topbar from '~/components/Topbar.svelte';
	import { predictedColor, rootRem } from '~/store';

	let topBarHeight = 0;

	let minScreenWidth = 1400;
	let minColumWidth = Math.floor(minScreenWidth / 24) - rootRem * 2;
</script>

<svelte:head>
	<title>Transformer Explainer</title>
</svelte:head>

<div
	id="app"
	style={`--min-screen-width:${minScreenWidth}px;--min-column-width:${minColumWidth}px;--predicted-color:${predictedColor};`}
>
	<div id="landing">
		<header bind:offsetHeight={topBarHeight}>
			<Topbar />
		</header>
		<main id="main" style={`padding-top:${topBarHeight}px`}>
			<slot />
		</main>
	</div>
	<div class="article h-[1000px] w-full bg-gray-200"></div>
	<!-- <footer></footer> -->
</div>

<style lang="scss">
	#app {
		height: 100vh;
		min-width: 900px;
		overflow: hidden;
	}

	#landing {
		height: 100%;
		width: 100%;

	header {
		min-width: var(--min-screen-width);
		width: 100%;
		position: fixed;
		z-index: 999;
	}
	main {
		position: relative;
		height: 100%;
		width: 100%;
		display: flex;
		justify-content: start;
		overflow: hidden;
	}
</style>

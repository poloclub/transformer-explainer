<script>
	import '~/styles/app.css';
	import '~/styles/global.scss';
	import Topbar from '~/components/Topbar.svelte';
	import { predictedColor } from '~/store';

	let topBarHeight = 0;
</script>

<svelte:head>
	<title>Transformer Explainer</title>
</svelte:head>

<div id="app" style={`--predicted-color:${predictedColor};`}>
	<div class="landing h-screen">
		<header bind:offsetHeight={topBarHeight}>
			<Topbar />
		</header>
		<main id="main" style={`padding-top:${topBarHeight}px`}>
			<slot />
		</main>
	</div>
	<!-- <footer></footer> -->
</div>

<style lang="scss">
	#app {
		height: 100vh;
		min-width: 900px;
		overflow: hidden;
	}

	header {
		min-width: 900px;
		width: 100%;
		position: fixed;
		z-index: 999;
	}
	main {
		position: relative;
		height: 100%;
		display: flex;
		justify-content: start;
	}
</style>

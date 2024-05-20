<script>
	import '~/styles/app.css';
	import '~/styles/global.scss';
	import Header from '~/components/Header.svelte';
	import InputForm from '~/components/InputForm.svelte';

	let topBarHeight = 0;
</script>

<svelte:head>
	<title>Transformer Explainer</title>
</svelte:head>

<div class="app">
	<div class="landing h-screen">
		<div class="top-bar w-full" bind:offsetHeight={topBarHeight}>
			<Header></Header>
			<InputForm />
		</div>
		<main style={`padding-top:${topBarHeight}px`}>
			<slot />
		</main>
	</div>
	<footer></footer>
</div>

<style lang="scss">
	.app {
		min-width: 900px;
	}
	.top-bar {
		min-width: 900px;
		width: 100%;
		position: fixed;
		z-index: 200;
	}
	main {
		position: relative;
		height: 100%;
	}
</style>

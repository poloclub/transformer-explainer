<script>
	import '~/styles/app.css';
	import '~/styles/global.scss';
	import Header from '~/components/Header.svelte';
</script>

<svelte:head>
	<title>Transformer Explainer</title>
</svelte:head>

<div class="app">
	<div class="landing flex h-screen flex-col">
		<Header></Header>
		<main class="flex-[1_0_0] overflow-hidden"><slot /></main>
	</div>
	<footer></footer>
</div>

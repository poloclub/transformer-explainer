<script lang="ts">
	import '~/styles/app.css';
	import '~/styles/global.scss';
</script>

<div id="vit-app">
	<slot />
</div>

<style lang="scss">
	#vit-app {
		min-height: 100vh;
		width: 100%;
	}
</style>

<script>
	import { Alert } from 'flowbite-svelte';
	import { fade } from 'svelte/transition';

	let showAlert = true;

	setTimeout(() => {
		showAlert = false;
	}, 10000);
</script>

{#if showAlert}
	<div transition:fade>
		<Alert color="blue" dismissable>
			<div class="alert-content">
				We collect anonymous data for research.
				<a
					href="./consent-form.pdf"
					class="font-semibold underline hover:text-blue-800 dark:hover:text-blue-900"
					target="_blank"
				>
					Learn more
				</a>
			</div>
		</Alert>
	</div>
{/if}

<style lang="scss">
	.alert-content {
		// width: 30rem;
	}
</style>

<script>
	import { Alert } from 'flowbite-svelte';
	import { InfoCircleSolid } from 'flowbite-svelte-icons';
	import { fade } from 'svelte/transition';

	let showAlert = true;

	setTimeout(() => {
		showAlert = false;
	}, 5000);
</script>

{#if showAlert}
	<div transition:fade>
		<Alert color="blue" dismissable>
			<InfoCircleSolid slot="icon" class="h-5 w-5" />
			We collect anonymous click data to improve user experience.
			<a
				href="/"
				class="font-semibold underline hover:text-blue-800 dark:hover:text-blue-900"
				target="_blank"
			>
				Read more
			</a>
		</Alert>
	</div>
{/if}

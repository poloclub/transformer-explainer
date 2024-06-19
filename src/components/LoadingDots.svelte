<script>
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';

	onMount(() => {
		const timeline = gsap.timeline({ repeat: -1 });
		timeline.fromTo(
			'.dot',
			{ y: 3 },
			{
				y: -3,
				duration: 0.3,
				stagger: 0.1
			}
		);
		timeline.to('.dot', {
			y: 3,
			duration: 0.3,
			stagger: 0.1
		});
	});
</script>

<div class="container">
	<div class="dot"></div>
	<div class="dot"></div>
	<div class="dot"></div>
</div>

<style>
	.container {
		display: flex;
		align-items: center;
	}
	.dot {
		width: 6px;
		height: 6px;
		background-color: var(--predicted-color);
		border-radius: 50%;
		margin: 0 2px;
	}
</style>

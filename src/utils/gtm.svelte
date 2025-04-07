<script>
	import { onMount } from 'svelte';

	onMount(() => {
		if (import.meta.env.VITE_GTM_ID && typeof document !== 'undefined') {
			const iframe = document.createElement('iframe');
			iframe.src = `https://www.googletagmanager.com/ns.html?id=${import.meta.env.VITE_GTM_ID}`;
			iframe.height = '0';
			iframe.width = '0';
			iframe.style.display = 'none';
			iframe.style.visibility = 'hidden';

			const noscript = document.createElement('noscript');
			noscript.appendChild(iframe);

			document.body.prepend(noscript);
		}
	});
</script>

<svelte:head>
	{#if import.meta.env.VITE_GTM_ID}
		<!-- Google Tag Manager -->
		{@html `
        <script>
            (function (w, d, s, l, i) {
				w[l] = w[l] || [];
				w[l].push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
				var f = d.getElementsByTagName(s)[0],
					j = d.createElement(s),
					dl = l != 'dataLayer' ? '&l=' + l : '';
				j.async = true;
				j.src = 'https://www.googletagmanager.com/gtm.js?id=' + i + dl;
				f.parentNode.insertBefore(j, f);
			})(window, document, 'script', 'dataLayer', '${import.meta.env.VITE_GTM_ID}');
        </script>
        `}
	{/if}

	{#if import.meta.env.VITE_GA_ID}
		<!-- Google tag (gtag.js) -->
		<script
			async
			src={`https://www.googletagmanager.com/gtag/js?id=${import.meta.env.VITE_GA_ID}`}
		></script>
		{@html `
        <script>
            window.dataLayer = window.dataLayer || [];
            function gtag() {
            dataLayer.push(arguments);
            }
            gtag('js', new Date());
            // gtag('config', 'G-HHT51PP7TD', { debug_mode: true });
            gtag('config', '${import.meta.env.VITE_GA_ID}');
        </script>
        `}
	{/if}
</svelte:head>

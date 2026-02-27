<script>
	export let size = 24;
	export let color = 'currentColor';
	export let type = 'straight';
</script>

{#if type === 'straight'}
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 4.77 13.46"
		width={size}
		height={size}
		fill="none"
		stroke={color}
		stroke-width="1"
		stroke-linecap="round"
		stroke-linejoin="round"
	>
		<g>
			<g>
				<polyline class="cls-1" points="2.38 9.08 2.38 .38 .38 3.72" />
				<line class="cls-1" x1="2.4" y1=".38" x2="4.4" y2="3.73" />
			</g>
		</g>
	</svg>
{:else}
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24.43 17.11"
		width={size}
		height={size}
		fill="none"
		stroke={color}
		stroke-width="1"
		stroke-linecap="round"
		stroke-linejoin="round"
	>
		<g>
			<g>
				<path class="cls-1" d="M.5.5S.24,13.92,23.93,13.92l-3.24-2.61" />
				<line class="cls-1" x1="23.9" y1="13.97" x2="20.88" y2="16.61" />
			</g>
		</g>
	</svg>
{/if}

<script lang="ts">
	import { vectorHeight, expandedBlock } from '~/store';

	export let className: string | undefined = undefined;
	export let type: string | undefined = undefined;
	export let head: boolean = false;
	export let tail: boolean = false;

	let width = 50;
</script>

{#if type === 'dropout'}
	<div class={`dropout`}>
		<svg class="main">
			<path d={`M0,0 L0,${$vectorHeight}`}></path>
		</svg>
		{#if tail}
			<svg class="guide" class:active={!$expandedBlock.id} width="44px">
				<path
					d="M44.3186 4.46399C44.5314 4.28801 44.5613 3.97284 44.3853 3.76004L41.5175 0.292199C41.3416 0.0793953 41.0264 0.0495441 40.8136 0.225525C40.6008 0.401505 40.5709 0.716677 40.7469 0.929481L43.296 4.012L40.2135 6.56113C40.0007 6.73711 39.9709 7.05228 40.1468 7.26509C40.3228 7.47789 40.638 7.50774 40.8508 7.33176L44.3186 4.46399ZM44.0471 3.58091C38.7621 3.08034 27.8926 4.80481 18.3357 11.5838C8.74613 18.386 0.5 30.2626 0.5 50H1.5C1.5 30.5889 9.58721 19.0154 18.9143 12.3994C28.2741 5.76023 38.9045 4.0983 43.9529 4.57645L44.0471 3.58091Z"
				/>
				<text x="4" y="60" text-anchor="middle">Dropout</text>
			</svg>
		{/if}
	</div>
{:else if type === 'ln'}
	<div class={`ln`}>
		<svg class="main">
			<path
				d={`M-5,1 L5,1 L-3,${$vectorHeight * 0.15} L3,${$vectorHeight * 0.2} L0,${$vectorHeight * 0.25} L0,${$vectorHeight - $vectorHeight * 0.25} L-3,${$vectorHeight - $vectorHeight * 0.2} L3,${$vectorHeight - $vectorHeight * 0.15} L-5,${$vectorHeight - 1} L5,${$vectorHeight - 1}`}
			></path>
		</svg>
		{#if tail}
			<svg class="guide" class:active={!$expandedBlock.id} width="27px">
				<path
					d="M27.3536 4.35355C27.5488 4.15829 27.5488 3.84171 27.3536 3.64645L24.1716 0.46447C23.9763 0.269208 23.6597 0.269208 23.4645 0.464471C23.2692 0.659733 23.2692 0.976316 23.4645 1.17158L26.2929 4L23.4645 6.82843C23.2692 7.02369 23.2692 7.34028 23.4645 7.53554C23.6597 7.7308 23.9763 7.7308 24.1716 7.53554L27.3536 4.35355ZM27 3.5C20.3125 3.50001 15.2969 6.63952 11.5638 11.7944C7.84616 16.9278 5.39057 24.0677 3.75991 32.1346C0.498061 48.2711 0.5 68.3247 0.5 84H1.5C1.5 68.2984 1.50194 48.352 4.74009 32.3328C6.35943 24.3218 8.77884 17.3448 12.3737 12.3809C15.9531 7.4384 20.6875 4.50001 27 4.5V3.5Z"
				/>
				<text x="4" y="95" text-anchor="middle">Layer Normalization</text>
			</svg>{/if}
	</div>
{:else if type === 'residual-start'}
	<div class={`residual residual-start`}>
		<svg class="main">
			{#if head}<path d="M0,0 Q0,-20 30,-20"></path>
				<text x="30" y="-20" dy="4" dx="4">Residual</text>{/if}
			<path d={`M0,0 L0,${$vectorHeight}`}></path>
		</svg>
	</div>
{:else if type === 'residual-end'}
	<div class={`residual residual-end`}>
		<svg class="main">
			{#if head}<path d="M0,0 Q0,-20 -30,-20"></path>
				<!-- <text x="-30" y="-20" text-anchor="end">Residual</text> -->
			{/if}
			<path d={`M0,0 L0,${$vectorHeight}`}></path>
		</svg>
	</div>
{/if}

<style lang="scss">
	.residual,
	.dropout,
	.ln {
		position: relative;
		width: 1px;
		flex-shrink: 0;
		z-index: 101;
		height: var(--vector-height);

		svg.main {
			height: 100%;
			width: 100%;
			overflow: visible;
		}
	}

	.dropout {
		path {
			stroke: theme('colors.gray.400');
			stroke-dasharray: 2, 2;
			fill: none;
			opacity: 0.5;
			stroke-width: 2;
		}
	}
	.residual {
		path {
			stroke: theme('colors.gray.400');
			fill: none;
			opacity: 0.5;
			stroke-width: 1;
		}
		text {
			font-size: 0.8rem;
			fill: theme('colors.gray.400');
		}
	}
	.ln {
		path {
			stroke: theme('colors.gray.400');
			fill: none;
			opacity: 0.3;
			stroke-width: 1;
		}
	}

	svg.guide {
		position: absolute;
		top: calc(100% - 10px);
		transform: translateX(calc(-100% - 5px));
		transition: opacity 0.5s;
		opacity: 0;

		&.active {
			opacity: 1;
		}

		path {
			fill: theme('colors.gray.500');
			stroke: none;
			opacity: 0.5;
			stroke-dasharray: none;
			stroke-width: 0.5;
		}

		text {
			font-size: 0.7rem;
			fill: theme('colors.gray.400');
		}
	}
</style>

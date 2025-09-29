<script lang="ts">
	import classNames from 'classnames';
	import { Popover } from 'flowbite-svelte';
	import { vectorHeight, expandedBlock } from '~/store';
	import { onMount } from 'svelte';

	export let id: string | undefined = undefined;
	export let className: string | undefined = undefined;
	export let type: string | undefined = undefined;
	export let head: boolean = false;
	export let tail: boolean = false;
	export let active: boolean = false;

	let width = 50;
	let textElement: SVGTextElement;
	let textBBox: DOMRect;

	onMount(() => {
		if (textElement) {
			textBBox = textElement.getBBox();
		}
	});
</script>

{#if type === 'activation'}
	<div class={classNames(`cell activation`, className)} class:active>
		<div class="cursor"></div>
		<svg class="main">
			<!-- <path class="line" d={`M 0 0 L 10 0 L 20 -20`} style={'transform:translateY(50%)'}></path> -->
			<path class="line line1" d={`M0,0 L0,${$vectorHeight * 3.1 - 3}`}></path>
			<!-- <path class="line line2" d={`M0,0 L0,40%`}></path> -->
			<circle class="icon" cx="50%" cy="50%" r="3"></circle>
		</svg>
		{#if head}
			<div class="guide">
				<!-- <svg>
					<path d="M0,0 Q0,-16 30,-16"></path>
				</svg> -->
				<div class="guide-text gelu-text">GeLU</div>
			</div>
		{/if}
	</div>
{:else if type === 'dropout'}
	<div class={classNames(`cell dropout`, className)} class:active>
		<div class="cursor"></div>
		<svg class="main">
			<path class="line" d={`M0,0 L0,${$vectorHeight}`}></path>
			<circle class="icon" cx="50%" cy="50%" r="3"></circle>
		</svg>
		{#if tail}
			<div class="guide">
				<svg width="20px">
					<!-- <path
						d="M44.3186 4.46399C44.5314 4.28801 44.5613 3.97284 44.3853 3.76004L41.5175 0.292199C41.3416 0.0793953 41.0264 0.0495441 40.8136 0.225525C40.6008 0.401505 40.5709 0.716677 40.7469 0.929481L43.296 4.012L40.2135 6.56113C40.0007 6.73711 39.9709 7.05228 40.1468 7.26509C40.3228 7.47789 40.638 7.50774 40.8508 7.33176L44.3186 4.46399ZM44.0471 3.58091C38.7621 3.08034 27.8926 4.80481 18.3357 11.5838C8.74613 18.386 0.5 30.2626 0.5 50H1.5C1.5 30.5889 9.58721 19.0154 18.9143 12.3994C28.2741 5.76023 38.9045 4.0983 43.9529 4.57645L44.0471 3.58091Z"
					/> -->
					<path d="M0,50 Q0,0 24,0"></path>
				</svg>
				<div class="guide-text dropout-text">Dropout</div>
			</div>
		{/if}
	</div>
{:else if type === 'ln'}
	<div class={classNames(`cell ln`, className)} class:active>
		<div class="cursor"></div>
		<svg class="main">
			<circle class="icon" cx="50%" cy="50%" r="3"></circle>
			<path
				class="line"
				d={`
     M 0 0
    C 0 ${$vectorHeight * 0.25}, ${$vectorHeight * 0.2} ${$vectorHeight * 0.25}, ${$vectorHeight * 0.2} ${$vectorHeight * 0.5}
    C ${$vectorHeight * 0.2} ${$vectorHeight * 0.75}, 0 ${$vectorHeight * 0.75}, 0 ${$vectorHeight}
  `}
			/>
		</svg>
		{#if tail}
			<div class="guide">
				<svg width="20px">
					<!-- <path
						d="M27.3536 4.35355C27.5488 4.15829 27.5488 3.84171 27.3536 3.64645L24.1716 0.46447C23.9763 0.269208 23.6597 0.269208 23.4645 0.464471C23.2692 0.659733 23.2692 0.976316 23.4645 1.17158L26.2929 4L23.4645 6.82843C23.2692 7.02369 23.2692 7.34028 23.4645 7.53554C23.6597 7.7308 23.9763 7.7308 24.1716 7.53554L27.3536 4.35355ZM27 3.5C20.3125 3.50001 15.2969 6.63952 11.5638 11.7944C7.84616 16.9278 5.39057 24.0677 3.75991 32.1346C0.498061 48.2711 0.5 68.3247 0.5 84H1.5C1.5 68.2984 1.50194 48.352 4.74009 32.3328C6.35943 24.3218 8.77884 17.3448 12.3737 12.3809C15.9531 7.4384 20.6875 4.50001 27 4.5V3.5Z"
					/> -->
					<path d="M0,50 Q0,0 24,0"></path>
				</svg>
				<div class="guide-text ln-text">Layer Normalization</div>
			</div>
		{/if}
	</div>
{:else if type === 'residual-start'}
	<div class={classNames(`residual residual-start cell`, className)} class:active>
		<div class="cursor"></div>
		{#if head}
			<div class="guide-text residual-text">Residual</div>
		{/if}
		<svg class="main">
			{#if head}<path {id} class="head" d="M0,0 Q0,-16 30,-16"></path>{/if}
			<path d={`M0,0 L0,${$vectorHeight}`}></path>
		</svg>
	</div>
{:else if type === 'residual-end'}
	<div class={classNames(`residual residual-end cell`, className)} class:active>
		<div class="cursor"></div>
		<svg class="main">
			{#if head}<path {id} class="head" d="M0,0 Q0,-16 -30,-16"></path>
				<!-- <text x="-30" y="-20" text-anchor="end">Residual</text> -->
			{/if}
			<path d={`M0,0 L0,${$vectorHeight}`}></path>
		</svg>
	</div>
{/if}

<style lang="scss">
	.activation,
	.residual,
	.dropout,
	.ln {
		position: relative;
		width: 1.2rem;
		flex-shrink: 0;
		z-index: $OPERATION_INDEX;
		// height: var(--vector-height);

		.cursor {
			height: 100%;
			position: absolute;
			left: 50%;
		}
		svg.main {
			height: 100%;
			width: 100%;
			overflow: visible;
		}
		svg path {
			transform: translateX(50%);
		}
		svg .icon {
			fill: theme('colors.gray.300');
			opacity: 0.6;
		}
		.icon {
			opacity: 1;
			transition: opacity 0.3s;
		}
		.line {
			opacity: 0;
			transition: opacity 0.3s;
		}

		&.active {
			.icon {
				opacity: 0;
			}
			.line {
				opacity: 1;
			}
			.guide {
				opacity: 1;
			}
		}
	}

	.dropout {
		path {
			stroke: theme('colors.gray.400');
			stroke-dasharray: 2, 2;
			fill: none;
			stroke-width: 2;
		}
	}
	.residual {
		width: 0.5rem;

		path {
			stroke: theme('colors.gray.400');
			fill: none;
			stroke-width: 1;
		}
		.head {
			stroke: theme('colors.gray.400');
		}
		.residual-text {
			position: absolute;
			top: -2.2rem;
			left: 4rem;
			transform: translateX(-50%);
			font-size: 0.9rem;
			color: theme('colors.gray.400');
			white-space: nowrap;
		}
	}
	.ln {
		path {
			stroke: theme('colors.gray.400');
			fill: none;
			stroke-width: 1;
		}
	}
	.activation {
		path {
			stroke: theme('colors.gray.400');
			fill: none;
			stroke-dasharray: 2, 4;
			fill: none;
			stroke-width: 2;
		}

		.guide {
			// background-color: red;
			height: 100%;
			width: 100%;
			top: 0;
			transform: translate(0, 0);
			.guide-text {
				top: 50%;
				transform: translate(0, -50%);
				opacity: 1;
			}
		}
	}

	.guide {
		position: absolute;
		top: calc(100% - 10px);
		left: 0;
		transition: opacity 0.5s;
		transform: translateX(calc(-100% - 5px));
		opacity: 0;

		svg {
			width: 100%;
			height: 100%;
			overflow: visible;
		}
		.guide-text {
			position: absolute;
			top: 50px;
			left: 50%;
			transform: translateX(-50%);
			font-size: 0.9rem;
			color: theme('colors.gray.400');
			white-space: nowrap;
		}

		path {
			stroke: theme('colors.gray.400');
			fill: none;
			stroke-width: 1;
			stroke-dasharray: none;
		}
	}
</style>

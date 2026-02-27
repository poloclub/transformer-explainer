<script lang="ts">
	import { tokens, modelMeta, attentionHeadIdx, vectorHeight, blockIdx } from '~/store';
	import classNames from 'classnames';
	import { onMount } from 'svelte';
	import VectorCanvas from './common/VectorCanvas.svelte';
	import OperationGroup from './OperationGroup.svelte';
	import { Tooltip } from 'flowbite-svelte';

	export let className: string | undefined = undefined;

	const embeddingVectorColor = 'bg-gray-300';

	let vectorHoverIdx: number | null = null;
	const queryVectorColor = 'bg-blue-200';
	const keyVectorColor = 'bg-red-200';
	const valVectorColor = 'bg-green-200';

	const queryHeadVectorColor = 'bg-blue-300';
	const keyHeadVectorColor = 'bg-red-300';
	const valHeadVectorColor = 'bg-green-300';

	// attentionHeadIdx subscribe
	const headCursors = {};

	onMount(() => {
		const unsubscribe = attentionHeadIdx.subscribe(async (newIdx) => {
			Object.values(headCursors).forEach((el) => {
				el.style.top = `${($vectorHeight / $modelMeta.attention_head_num) * newIdx}px`;
			});
		});

		return () => {
			unsubscribe();
		};
	});
</script>

<div class={classNames('qkv', className)} role="none" data-click="qkv-step">
	<div class="content relative">
		<div
			class="vector-column block-start-column relative flex"
			class:initial-column={$blockIdx === 0}
		>
			<div class="column vectors embedding-column">
				{#each $tokens as token, index}
					<div
						class={`vector ${$blockIdx !== 0 ? 'bg-blue-200' : embeddingVectorColor}`}
						class:last={index === $tokens.length - 1}
					>
						<VectorCanvas colorScale={$blockIdx !== 0 ? 'blue' : 'gray'} />
					</div>
				{/each}
			</div>
			<Tooltip class="popover" triggeredBy={'.qkv .embedding-column .vector'} placement="right"
				>vector({$modelMeta.dimension})</Tooltip
			>

			<div class="operations flex">
				<OperationGroup type="dropout" id={'embedding-dropout'} />
				<OperationGroup type="residual-start" id={'embedding-residual'} />
				<OperationGroup type="ln" id={'embedding-ln'} />
			</div>
		</div>
		<div class="column qkv-column">
			{#each $tokens as token, index}
				<div
					class="qkv-weighted vector x3 flex flex-col"
					class:last={index === $tokens.length - 1}
					on:mouseenter={() => {
						vectorHoverIdx = index;
					}}
					on:mouseleave={() => {
						vectorHoverIdx = null;
					}}
					role="group"
				>
					<div class={`sub-vector query relative flex grow flex-col ${queryVectorColor}`}>
						<VectorCanvas colorScale="blue" active={vectorHoverIdx === index} />
						<div
							class={`sub-vector x1-12 head1 ${queryHeadVectorColor} absolute`}
							bind:this={headCursors[`token${index}_query`]}
						></div>
						<div class="sub-vector head-rest">
							{#if vectorHoverIdx !== index}<span>Q</span>{/if}
						</div>
					</div>
					<div class={`sub-vector key relative flex grow flex-col ${keyVectorColor}`}>
						<VectorCanvas colorScale="red" active={vectorHoverIdx === index} />
						<div
							class={`sub-vector x1-12 head1 ${keyHeadVectorColor} absolute`}
							bind:this={headCursors[`token${index}_key`]}
						></div>
						<div class="sub-vector head-rest">
							{#if vectorHoverIdx !== index}<span>K</span>{/if}
						</div>
					</div>
					<div class={`sub-vector value relative flex grow flex-col ${valVectorColor}`}>
						<VectorCanvas colorScale="green" active={vectorHoverIdx === index} />
						<div
							class={`sub-vector x1-12 head1 ${valHeadVectorColor} absolute`}
							bind:this={headCursors[`token${index}_value`]}
						></div>
						<div class="sub-vector head-rest">
							{#if vectorHoverIdx !== index}<span>V</span>{/if}
						</div>
					</div>
				</div>
			{/each}
			<Tooltip class="popover" triggeredBy={'.qkv .qkv-column .vector'} placement="right"
				>vector({$modelMeta.dimension * 3})</Tooltip
			>
		</div>
	</div>
</div>

<style lang="scss">
	.qkv {
		.content {
			display: grid;
			grid-template-columns: 1fr 1fr;

			.vector-column {
				position: relative;
				left: 3rem;

				&.initial-column {
					left: -12px;
				}
			}
			.qkv-column {
				position: relative;
				left: 12px;
				display: flex;
				flex-direction: column;
				align-items: end;

				&.hide {
					pointer-events: none;
					opacity: 0.2;
				}
				.sub-vector {
					user-select: none;
					font-size: 1rem;
					span {
						opacity: 0.3;
					}
					&.query {
						color: theme('colors.blue.500');
					}
					&.key {
						color: theme('colors.red.500');
					}
					&.value {
						color: theme('colors.green.500');
					}

					.head-rest {
						height: 100%;
						display: flex;
						justify-content: center;
						align-items: center;
						font-weight: 700;
						text-shadow:
							-1px -1px 0 white,
							1px -1px 0 white,
							-1px 1px 0 white,
							1px 1px 0 white;
					}
				}
			}
		}

		&.animate-forward {
			.vector-column {
				transition-delay: 900ms;
				transition: left 100ms;
			}
		}
	}
</style>

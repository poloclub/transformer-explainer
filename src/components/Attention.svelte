<script lang="ts">
	import HeadStack from '~/components/HeadStack.svelte';
	import { tokens, modelMeta, isBoundingBoxActive, headContentHeight, modelData } from '~/store';
	import classNames from 'classnames';
	import AttentionMatrix from '~/components/AttentionMatrix.svelte';
	import { setContext } from 'svelte';

	export let className: string | undefined = undefined;

	setContext('block-id', 'attention');

	$: attentionData = Array($tokens.length)
		.fill(0)
		.map((col) =>
			Array($tokens.length)
				.fill(0)
				.map((d) => Math.random())
		);

	const queryVectorColor = 'bg-blue-200';
	const keyVectorColor = 'bg-red-200';
	const valVectorColor = 'bg-green-200';

	const queryHeadVectorColor = 'bg-blue-300';
	const keyHeadVectorColor = 'bg-red-300';
	const valHeadVectorColor = 'bg-green-300';

	const outputVectorColor = 'bg-purple-300';
</script>

<div class={classNames('attention', className)}>
	<div class="title">
		<div>Multi-head Self Attention</div>
	</div>
	<div class="content relative">
		<div class="bounding" class:active={$isBoundingBoxActive}>
			<!-- <div class="title absolute top-0">First Transformer Block</div> -->
		</div>
		<div class="column">
			{#each $tokens as token, index}
				<div class="vector x3 flex flex-col" class:last={index === $tokens.length - 1}>
					<div class={`sub-vector query flex grow flex-col ${queryVectorColor}`}>
						<div class={`sub-vector x1-12 head1 ${queryHeadVectorColor}`}></div>
						<div class="sub-vector head-rest grow"></div>
					</div>
					<div class={`sub-vector key flex grow flex-col ${keyVectorColor}`}>
						<div class={`sub-vector x1-12 head1 ${keyHeadVectorColor}`}></div>
						<div class="sub-vector head-rest grow"></div>
					</div>
					<div class={`sub-vector value flex grow flex-col ${valVectorColor}`}>
						<div class={`sub-vector x1-12 head1 ${valHeadVectorColor}`}></div>
						<div class="sub-vector head-rest grow"></div>
					</div>
				</div>
			{/each}
		</div>
		<div class="heads">
			<HeadStack>
				<div
					class="head-block flex w-full items-center justify-between px-2"
					style={`height:${$headContentHeight}px;`}
				>
					<div class="qkv flex h-full flex-col justify-center gap-[5rem] pl-[6rem]">
						<div class="column query">
							{#each $tokens as token, index}
								<div class="cell x1-12 text-xs" class:last={index === $tokens.length - 1}>
									<span class="label float">{token}</span>
									<div class={`vector x1-12  ${queryHeadVectorColor}`}></div>
								</div>
							{/each}
						</div>
						<div class="column key">
							{#each $tokens as token, index}
								<div class="cell x1-12 text-xs class:last={index === $tokens.length - 1}">
									<span class="label float">{token}</span>
									<div class={`vector x1-12 ${keyHeadVectorColor}`}></div>
								</div>
							{/each}
						</div>
						<div class="column value">
							{#each $tokens as token, index}
								<div class="cell x1-12 text-xs" class:last={index === $tokens.length - 1}>
									<span class="label float">{token}</span>
									<div class={`vector x1-12 ${valHeadVectorColor}`}></div>
								</div>
							{/each}
						</div>
					</div>
					<div class="resize-watch attention-matrix flex">
						<AttentionMatrix data={attentionData} />
					</div>
					<div class="head-out mx-[2rem]">
						<div class="column">
							{#each $tokens as token, index}
								<div class="cell x1-12" class:last={index === $tokens.length - 1}>
									<div class={`vector x1-12 ${outputVectorColor}`}></div>
								</div>
							{/each}
						</div>
					</div>
					<div class="head-title absolute bottom-2 right-3 text-right text-gray-400">
						Head 1 of {$modelMeta.attention_head_num}
					</div>
				</div>
			</HeadStack>
		</div>
	</div>
</div>

<style lang="scss">
	.attention {
		.bounding {
			border-radius: 10px 0 0 10px;
			padding-left: 0.5rem;
			left: -0.5rem;
			border-right: none;
		}
		.content {
			display: grid;
			grid-template-columns: 0 auto 0;

			.tokens {
				gap: 0.6rem;
			}
		}
		.heads {
			padding: 0 6rem 0 7rem;
		}
	}
</style>

<script lang="ts">
	import HeadStack from '~/components/HeadStack.svelte';
	import { tokens, modelMeta, isBoundingBoxActive } from '~/store';
	import classNames from 'classnames';
	import AttentionMatrix from '~/components/AttentionMatrix.svelte';
	import { setContext } from 'svelte';

	export let className: string | undefined = undefined;
	export let headContentHeight: number = 0;

	setContext('block-id', 'attention');

	$: attentionData = Array($tokens.length)
		.fill(0)
		.map((col) =>
			Array($tokens.length)
				.fill(0)
				.map((d) => Math.random())
		);
</script>

<div class={classNames('attention', className)}>
	<div class="title">
		<div>Multi-head Self Attention</div>
	</div>
	<div class="content relative">
		<div class="bounding" class:active={$isBoundingBoxActive}>
			<div class="title absolute top-0">Transformer Block</div>
		</div>
		<div class="tokens">
			{#each $tokens as token, index}
				<div class="vector x3 flex flex-col">
					<div class={`sub-vector query flex grow flex-col bg-blue-200`}>
						<div class="sub-vector x1-12 head1"></div>
						<div class="sub-vector head-rest grow"></div>
					</div>
					<div class={`sub-vector key flex grow flex-col bg-red-200`}>
						<div class="sub-vector x1-12 head1"></div>
						<div class="sub-vector head-rest grow"></div>
					</div>
					<div class={`sub-vector value flex grow flex-col bg-green-200`}>
						<div class="sub-vector x1-12 head1"></div>
						<div class="sub-vector head-rest grow"></div>
					</div>
				</div>
			{/each}
		</div>
		<div class="heads">
			<HeadStack>
				<div
					class="head-block resize-watch flex w-full items-center justify-between px-2"
					style={`height:${headContentHeight}px;`}
				>
					<div class="flex h-full flex-col justify-center gap-[5rem] pl-[5rem]">
						<div class="tokens query">
							{#each $tokens as token, index}
								<div class="token text-xs">
									<span class="label float">{token}</span>
									<div class={`vector x1-12  bg-blue-300`}></div>
								</div>
							{/each}
						</div>
						<div class="tokens key">
							{#each $tokens as token, index}
								<div class="token text-xs">
									<span class="label float">{token}</span>
									<div class={`vector x1-12 bg-red-300`}></div>
								</div>
							{/each}
						</div>
						<div class="tokens value">
							{#each $tokens as token, index}
								<div class="token text-xs">
									<span class="label float">{token}</span>
									<div class={`vector x1-12 bg-green-300`}></div>
								</div>
							{/each}
						</div>
					</div>
					<div class="attention-matrix flex">
						<AttentionMatrix data={attentionData} />
					</div>
					<div class="head-out mx-4">
						<div class="tokens">
							{#each $tokens as token, index}
								<div class="token">
									<div class={`vector x1-12 bg-purple-400`}></div>
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
			padding-left: 1rem;
			left: -1rem;
			border-right: none;

			.title {
				position: absolute;
				top: -2rem;
			}
		}
		.content {
			display: grid;
			grid-template-columns: 0 auto;

			.tokens {
				gap: 0.6rem;
			}
		}
		.heads {
			padding: 0 5rem;
		}
	}
</style>

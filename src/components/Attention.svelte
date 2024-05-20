<script lang="ts">
	import HeadStack from '~/components/HeadStack.svelte';
	import { tokens, modelMeta } from '~/store';
	import classNames from 'classnames';
	import AttentionMatrix from '~/components/AttentionMatrix.svelte';

	export let className: string | undefined = undefined;
	export let headContentHeight: number = 0;

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
		<div>Transformer Block 1</div>
		<div>Multi-head Self Attention</div>
	</div>
	<div class="content relative">
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
					<div class="head-out pr-4">
						<div class="tokens">
							{#each $tokens as token, index}
								<div class="token">
									<div class={`vector x1-12 bg-purple-300`}></div>
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
		.content {
			display: grid;
			grid-template-columns: 0 auto;
		}
		.heads {
			padding: 0 5rem;
		}
	}
</style>

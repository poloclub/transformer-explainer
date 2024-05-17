<script lang="ts">
	import HeadStack from '~/components/HeadStack.svelte';
	import InputForm from '~/components/InputForm.svelte';
	import { tokens, modelMeta } from '~/store';
	import classNames from 'classnames';
	import Sankey from '~/components/Sankey.svelte';

	let vizHeight = 0;
	let titleHeight = 0;

	const minVectorHeight = 12;
	const maxVectorHeight = 36;

	const rem = 16;
	const padding = rem * 6;
	const maxVectorScale = 4;
	$: gaps = rem * 0.5 * ($tokens.length - 1);

	$: vectorHeight = Math.min(
		Math.max(
			(vizHeight - padding - titleHeight - gaps) / $tokens.length / maxVectorScale,
			minVectorHeight
		),
		maxVectorHeight
	);
</script>

<div class="sankey">
	<Sankey />
</div>
<div class="main-section flex h-full flex-col" style={`--vector-height: ${vectorHeight}px;`}>
	<div class="input"><InputForm /></div>
	<div class="viz-section resize-watch" bind:offsetHeight={vizHeight}>
		<div class="steps">
			<div class="step embedding">
				<div class="title" bind:offsetHeight={titleHeight}>Embedding</div>
				<div class="content">
					<div class="vectors">
						{#each $tokens as token, index}
							<div class="token">
								<span>{token}</span>
								<div class={`vector bg-gray-200`}></div>
							</div>
						{/each}
					</div>
				</div>
			</div>
			<div class="step attention">
				<div class="title">
					<div>Transformer Block 1</div>
					<div>Multi-head Self Attention</div>
				</div>
				<div class="content">
					<div class="vectors">
						{#each $tokens as token, index}
							<div class="vector x3 flex flex-col">
								<div class={`sub-vector query flex grow flex-col bg-blue-200`}>
									<div class="sub-vector x1-12 head1"></div>
									<div class="sub-vector head-rest grow"></div>
								</div>
								<div class={`sub-vector key grow bg-red-200`}>
									<div class="sub-vector x1-12 head1"></div>
									<div class="sub-vector head-rest grow"></div>
								</div>
								<div class={`sub-vector value grow bg-green-200`}>
									<div class="sub-vector x1-12 head1"></div>
									<div class="sub-vector head-rest grow"></div>
								</div>
							</div>
						{/each}
					</div>
					<div class="heads">
						<HeadStack>
							<div class="head-block flex items-center justify-between p-10 pl-[6rem]">
								<div class="flex flex-col gap-10">
									<div class="vectors query">
										{#each $tokens as token, index}
											<div class="token text-xs">
												<span>{token}</span>
												<div class={`vector x1-12 bg-blue-200`}></div>
											</div>
										{/each}
									</div>
									<div class="vectors key">
										{#each $tokens as token, index}
											<div class="token text-xs">
												<span>{token}</span>
												<div class={`vector x1-12 bg-red-200`}></div>
											</div>
										{/each}
									</div>
									<div class="vectors value">
										{#each $tokens as token, index}
											<div class="token text-xs">
												<span>{token}</span>
												<div class={`vector x1-12 bg-green-200`}></div>
											</div>
										{/each}
									</div>
								</div>

								<div class="attention-matrix"></div>

								<div class="head-out">
									<div class="vectors">
										{#each $tokens as token, index}
											<div class="token">
												<div class={`vector x1-12 bg-purple-200`}></div>
											</div>
										{/each}
									</div>
								</div>
							</div>
						</HeadStack>
					</div>
				</div>
			</div>
			<div class="step mlp">
				<div class="title">MLP</div>
				<div class="content">
					<div class="vectors initial">
						{#each $tokens as token, index}
							<div class="token">
								<span>{token}</span>
								<div class={`vector bg-purple-200`}>
									<div class="sub-vector x1-12 head1"></div>
									<div class="sub-vector head-rest grow"></div>
								</div>
							</div>
						{/each}
					</div>
					<div class="vectors projections">
						{#each $tokens as token, index}
							<div class={`vector x4 bg-indigo-200`}></div>
						{/each}
					</div>
				</div>
			</div>
			<div class="step transformer-blocks">
				<div class="title">Transformer Blocks (2 ~ {$modelMeta.layer_num})</div>
				<div class="content">
					<div class="vectors initial">
						{#each $tokens as token, index}
							<div class="token">
								<span>{token}</span>
								<div class={`vector bg-blue-200`}></div>
							</div>
						{/each}
					</div>
					<div class="vectors final">
						{#each $tokens as token, index}
							<div
								class={classNames(`vector bg-blue-200`, {
									last: index === $tokens.length - 1
								})}
							></div>
						{/each}
					</div>
				</div>
			</div>
			<div class="step linear-softmax">
				<div class="title">Linear · Softmax</div>
				<div class="content">
					<div class="vectors">
						<div class={`vector vocab bg-gray-200`}></div>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>

<style lang="scss">
	.input {
		z-index: 101;
	}
	.viz-section {
		flex: 1 0 0;
		width: 100%;
		min-height: 600px;
		min-width: 900px;
		padding: 3rem;
		position: relative;
	}
	.sankey {
		z-index: 100;
		position: absolute;
		left: 0;
		top: 0;
		width: 100%;
		height: 100%;
	}
	.steps {
		position: relative;
		display: grid;
		grid-template-columns: 4fr 8fr 6fr 4fr 2fr; //24 cols
		grid-template-rows: auto 1fr;
		height: 100%;
	}

	.step {
		display: contents;

		&.embedding {
			.content {
				display: grid;
				grid-template-columns: repeat(4, 1fr);
			}
			.vectors {
				grid-column: 2;
			}
		}

		&.attention {
			.content {
				display: grid;
				grid-template-columns: repeat(8, 1fr);
			}
			.heads {
				grid-column: span 6;
			}
		}

		&.mlp {
			.content {
				display: grid;
				grid-template-columns: repeat(6, 1fr);
				.vectors {
					grid-column: span 3;
				}
			}
		}

		&.transformer-blocks {
			.content {
				display: grid;
				grid-template-columns: repeat(4, 1fr);
			}
		}
		&.linear-softmax {
			.content {
				display: grid;
				grid-template-columns: repeat(2, 1fr);
			}
		}
	}

	.step .title {
		display: flex;
		flex-direction: column;
		justify-content: end;
		grid-row: 1;
		padding-bottom: 1rem;
		color: theme('colors.gray.300');
	}

	.step .content {
		grid-row: 2;
	}

	.vectors {
		height: 100%;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.vector,
	.sub-vector {
		width: 14px;
		height: var(--vector-height);

		&.x1-12 {
			height: calc(var(--vector-height) / 12);
		}

		&.x3 {
			height: calc(var(--vector-height) * 3);
		}
		&.x4 {
			height: calc(var(--vector-height) * 4);
		}
		&.vocab {
			height: 100%;
		}
	}

	.token {
		display: flex;
		gap: 1rem;
		align-items: center;
		position: relative;

		> span {
			z-index: 101;
			display: inline;
			width: 4rem;
			overflow: hidden;
			text-overflow: ellipsis;
			text-align: right;
			position: absolute;
			left: -1rem;
			transform: translateX(-100%);
		}
	}
</style>

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
	<InputForm />
	<div class="viz-section resize-watch" bind:offsetHeight={vizHeight}>
		<div class="steps">
			<div class="step embedding">
				<div class="title" bind:offsetHeight={titleHeight}>Embedding</div>
				<div class="content">
					<div class="vectors">
						{#each $tokens as token, index}
							<button>
								<div class="token">
									<span>{token}</span>
									<div class="vector"></div>
								</div>
							</button>
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
							<div class="vector x3"></div>
						{/each}
					</div>
					<div class="heads">
						<HeadStack>
							<div class="vectors">
								{#each $tokens as token, index}
									<div class="vector x1-12"></div>
								{/each}
							</div>
							<div class="vectors">
								{#each $tokens as token, index}
									<div class="vector x1-12"></div>
								{/each}
							</div>
							<div class="vectors">
								{#each $tokens as token, index}
									<div class="vector x1-12"></div>
								{/each}
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
							<button>
								<div class="token">
									<span>{token}</span>
									<div class="vector"></div>
								</div>
							</button>
						{/each}
					</div>
					<div class="vectors projections">
						{#each $tokens as token, index}
							<button>
								<div class="token">
									<div class="vector x4"></div>
								</div>
							</button>
						{/each}
					</div>
				</div>
			</div>
			<div class="step transformer-blocks">
				<div class="title">Transformer Blocks (2 ~ {$modelMeta.layer_num})</div>
				<div class="content">
					<div class="vectors initial">
						{#each $tokens as token, index}
							<button>
								<div class="token">
									<span>{token}</span>
									<div class="vector"></div>
								</div>
							</button>
						{/each}
					</div>
					<div class="vectors final">
						{#each $tokens as token, index}
							<button>
								<div class="token">
									<div class={classNames('vector', { last: index === $tokens.length - 1 })}></div>
								</div>
							</button>
						{/each}
					</div>
				</div>
			</div>
			<div class="step linear-softmax">
				<div class="title">Linear · Softmax</div>
				<div class="content">
					<div class="vectors">
						<div class="vector vocab"></div>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>

<style lang="scss">
	.viz-section {
		flex: 1 0 0;
		width: 100%;
		min-height: 600px;
		min-width: 900px;
		padding: 3rem;
		position: relative;
	}
	.sankey {
		position: absolute;
		left: 0;
		top: 0;
		width: 100%;
		height: 100%;
	}
	.steps {
		position: relative;
		z-index: 1;
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
	.vector {
		width: 10px;
		height: var(--vector-height);
		background-color: black;

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
			display: inline;
			width: 4rem;
			overflow: hidden;
			text-overflow: ellipsis;
			text-align: right;
			position: absolute;
			left: -1rem;
			transform: translateX(-100%);
			z-index: 100;
		}
	}
</style>

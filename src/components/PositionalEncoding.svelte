<script>
	import { rgb } from 'd3';
  import { onMount } from 'svelte';
	import { writable } from 'svelte/store';
	import { tokens } from '~/store';
  import Sankey from '~/components/Sankey.svelte';

  const numPositions = 100;
  const fullEmbeddingDim = 768; // Compute 768 dimensions
  const visualEmbeddingDim = 200; // Truncate to 80 dimensions for visualization


  function computePositionalEncodings(numPositions, fullEmbeddingDim, visualEmbeddingDim) {
    const posEncodings = [];
    for (let pos = 0; pos < numPositions; pos++) {
      const posEncoding = [];
      for (let i = 0; i < fullEmbeddingDim; i++) {
        if (i % 2 === 0) {
          posEncoding.push(Math.sin(pos / Math.pow(10000, i / fullEmbeddingDim)));
        } else {
          posEncoding.push(Math.cos(pos / Math.pow(10000, (i - 1) / fullEmbeddingDim)));
        }
      }
      posEncodings.push(posEncoding.slice(0, visualEmbeddingDim)); // Keep only the first XX dimensions
    }
    return posEncodings;
  }

  let posEncodings = [];
  const hoveredRow = writable(null);
	const hoveredCol = writable(null);

  // function generateBarcodeArray() {
	// 	return Array.from({ length: 30 }, () => Math.random());
  // }
  // function valueToGrayscale(value) {
  //   const grayValue = Math.round((1 - value) * 127.5);
  //   return `rgb(${grayValue}, ${grayValue}, ${grayValue}, 0.7)`;
  // }

  // function getGradientColor(value) {
	// 	// rgb(48, 111, 171)
	// 	// rgb(223, 115, 94)
  //   if (value > 0) {
  //     return `rgba(48, 111, 171, ${value})`; // Blue gradient
  //   } else {
  //     return `rgba(223, 115, 94, ${-value})`; // Red gradient
  //   }
  // }

  function getGradientColor(value) {
		// rgba(248, 113, 113)
		// rgba(96, 165, 250)
    if (value > 0) {
      return `rgba(96, 165, 250, ${value})`; // Blue gradient
    } else {
      return `rgba(248, 113, 113, ${-value})`; // Red gradient
    }
  }

	posEncodings = computePositionalEncodings(numPositions, fullEmbeddingDim, visualEmbeddingDim);

</script>


<div class="popover-container emb_pos">
	<div class="title">Positional Encoding</div>

	<div class="content">
		<div class="token-container">
			<div class="tokens">
				<div class="subtitle">Token</div>
				<div class="subcontent flex flex-col">
					{#each $tokens as token, token_idx}
						<div class="token-box"
							on:mouseenter={() => hoveredRow.set(token_idx)}
							on:mouseleave={() => hoveredRow.set(null)}
							class:highlight-token-box={token_idx === $hoveredRow}
						>
							<span class="text-ellipsis text-center text-gray-900">{token}</span>
						</div>
					{/each}
				</div>
			</div>
			<div class="positions">
				<div class="subtitle">Position</div>
				<div class="subcontent flex flex-col">
					{#each $tokens as token, token_idx}
						<div class="token-box"
							on:mouseenter={() => hoveredRow.set(token_idx)}
							on:mouseleave={() => hoveredRow.set(null)}
							class:highlight-token-box={token_idx === $hoveredRow}
						>
							<span class="text-ellipsis text-center text-gray-900">{token_idx}</span>
						</div>
					{/each}
				</div>
			</div>
			<div class="embs">
				<div class="subtitle">Embedding</div>
				<div class="subcontent flex flex-col">
					{#each $tokens as token, token_idx}
						<div class="token-box barcode-box flex justify-between"

							on:mouseenter={() => hoveredRow.set(token_idx)}
							on:mouseleave={() => hoveredRow.set(null)}
							class:highlight-token-box={token_idx === $hoveredRow}
						>
							{#each Array(41) as _, barcode_idx}
							  <div class="barcode-bar w-full h-full"
								on:mouseenter={() => hoveredCol.set(barcode_idx)}
								on:mouseleave={() => hoveredCol.set(null)}
								style="background-color: {getGradientColor(posEncodings[token_idx][barcode_idx])};"
								></div>
							{/each}
						</div>
					{/each}
				</div>
			</div>
		</div>
		<div class="viz-container">
			<div class="subtitle">Encoding Matrix</div>
			<div class="subcontent viz-subcontent">
				<div class="chart-container mx-auto">
					<div class="position-axis">
						{#each Array(numPositions+1).fill(0) as _, index}
							{#if index % 10 === 0}
								<div>{index}</div>
							{/if}
						{/each}
					</div>
					<div class="matrix">
						{#each posEncodings as row, rowIndex}
							<div
								class="matrix-row"
								on:mouseenter={() => hoveredRow.set(rowIndex)}
								on:mouseleave={() => hoveredRow.set(null)}
								class:matrix-row-highlight={rowIndex === $hoveredRow}
							>
								{#each row as value, colIndex}
									<div
										class="matrix-cell {($hoveredRow === rowIndex) ? 'highlighted-row' : ''}"
										style="background-color: {getGradientColor(value)};"
										on:mouseenter={() => hoveredCol.set(colIndex)}
										on:mouseleave={() => hoveredCol.set(null)}

									></div>
								{/each}
							</div>
						{/each}
					</div>
					<div class="gradient-legend-container">
						<div class="gradient-legend"></div>
						<div class="legend-labels">
							<span>1</span>
							<span>0</span>
							<span>-1</span>
						</div>
					</div>
				</div>
				<div class="formula-container flex-col justify-around gap-1 p-2 bg-gray-50 w-[400] mt-4">
					<div class="even-pos flex flex-1 gap-4 justify-start h-10 p-1 items-center">
						<div class="flex gap-1 justify-center items-center">
							<span class="flex "></span>
							{#if $hoveredCol % 2 === 0}
								<span class="w-8 flex justify-center">sin</span>
							{:else}
								<span class="w-8 flex justify-center">cos</span>
							{/if}
							<span>(</span>
					    <span class="w-8 flex justify-center">{$hoveredCol ? $hoveredCol : 'pos'}</span>
					   	<span>/ 10000 ^ ( 2 *</span>
							<span class="w-8 flex justify-center">{$hoveredRow ? $hoveredRow : 'i'}</span>
							<span>/ 768 ) )</span>
							<span>=</span>
						</div>
						{#if $hoveredCol !== null && $hoveredRow !== null}
						<div class="formula-solution-box w-[80] rounded-sm p-2 items-center"
						  style="background-color: {getGradientColor(posEncodings[$hoveredRow][$hoveredCol])};
							border: 3px solid {getGradientColor(posEncodings[$hoveredRow][$hoveredCol])};
							color: {Math.abs(posEncodings[$hoveredRow][$hoveredCol]) > 0.3 ? 'white' : 'black'};"
						>
							{posEncodings[$hoveredRow][$hoveredCol].toFixed(2)}
						</div>
						{:else}
						<div class="formula-solution-box rounded-sm p-2 border-gray-300 border-2 items-center">
							<span class="opacity-0"></span>
						</div>
						{/if}
					</div>
				</div>
			</div>
		</div>
	</div>


</div>




<style lang="scss">

  .highlight {
		cursor: pointer !important;
		border: 2px solid theme('colors.gray.500') !important;
		font-weight: bold;
	}

  .highlight-token-box {
		cursor: pointer !important;
		// border: 2px solid theme('colors.gray.500') !important;
		font-weight: bold;
		box-shadow: 0 0 0 1.5px theme('colors.gray.500');
		transition: 0.1s;
		// box-shadow: 0 0 0 1px black, 0 0 0 3px blue;
	}


	.barcode-bar:hover{
		// border: 0.5px solid theme('colors.gray.100');
		box-shadow: 0 0 0 1px theme('colors.gray.100');
		transform: scaleY(1.3);
		transition: 0.1s;
	}

	.formula-solution-box {
		width: 80px;
		height: 40px;
		display: flex;
		justify-content: center;
	}

  .popover-container {
		height: 500px;
		width: 1000px;
		display: flex;
		flex-direction: column;

		.title {
			flex: 1 0 10%;
			display: flex;
			align-items: center;
			justify-content: center;
			text-align: center;
			font-size: 1.5rem;
			color: theme('colors.gray.500');
		}

		.content {
			flex: 9 0 90%;
			display: flex;

			.token-container {
				flex: 2 0 20%;
				display: flex;
				width: 100%;
				gap: 1.5rem;

				.tokens {
					display: flex;
					flex-direction: column;
					width: 100%;
				}
				.positions {
					display: flex;
					flex-direction: column;
					width: 100%;
				}
				.embs {
					display: flex;
					flex-direction: column;
					width: 100%;
				}
			}
			.viz-container {
				flex: 8 0 80%;
				display: flex;
				flex-direction: column;
				justify-content: center;
				align-items: center;
			}
		}
	}

	.subtitle {
		height: 50px;
		display: flex;
		align-items: center;
		justify-content: center;
		color: theme('colors.gray.500');
	}

	.subcontent {
		flex: 1 0 0;
		display: flex;
		align-items: center;
		justify-content: start;
	}

	.viz-subcontent {
		display: flex;
		flex-direction: column;

	}

  .chart-container {
		display: flex;
		// flex: 8 0 80%;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
  }

	.formula-container {
		display: flex;
		width: 440px;
		height: 80px;
		border-radius: 4px;
		border: 1px dashed theme('colors.gray.400');
	}

  .token-box {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 8rem;
		height: 2rem;
		background-color: theme('colors.gray.100');
		// width: 50px;
		// height: 50px;
		border: 1px solid #e2e8f0;
		border-radius: 4px;
		margin: 0.5rem;


	}

  .matrix {
		// height: 100%;
		width: 100%;
    display: grid;
    grid-template-columns: repeat(200, 3px); /* 200 columns */
    grid-template-rows: repeat(100, 3px); /* 100 rows */
  }

  .matrix-row {
    display: contents;
  }

  .matrix-cell {
    width: 3px;
    height: 3px;
    display: inline-block;
    // transition: transform 0.1s;
  }

	// .matrix-row-highlight {
	// 	transform: scale(5);
	// }

  .matrix-cell.highlighted-row {
    transform: scale(5);
		// border-top: 1px solid theme('colors.gray.400');
		// border-bottom: 1px solid theme('colors.gray.400');
		border-top: 0.5px solid white;
		border-bottom: 0.5px solid white;
		// border-radius: 4px;
		// border: 1px solid theme('colors.gray.400');
		transition: 0.1s;
  }

  .matrix-row:hover .tooltip {
    display: block;
  }

  .position-axis {
		padding-right: 5px;
    top: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
		// height: 100%;
		height: 320px;
    justify-content: space-around;
    font-size: 0.5rem;
    color: theme('colors.gray.500');
  }

.gradient-legend-container {
  display: flex;
  // flex-direction: column;
  align-items: center;
  height: 300px;
	// height: 100%;
	margin-left: 20px;
}

.gradient-legend {
  width: 8px;
  height: 100%;
  background: linear-gradient(to top, rgb(96, 165, 250), white, rgb(248, 113, 113));
  border: 1px solid theme('colors.gray.300');
}

.legend-labels {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  padding-left: 5px;
	color: theme('colors.gray.500');
}

.legend-labels span {
  font-size: 0.55rem; /* Adjust the font size as needed */
}


</style>


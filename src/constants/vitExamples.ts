// Sample ViT model data for demonstration
// Generates realistic-looking attention patterns for visualization

const config: VitModelConfig = {
	imageSize: 224,
	patchSize: 16,
	numPatches: 196, // 14 x 14
	hiddenSize: 768,
	numLayers: 12,
	numHeads: 12,
	numClasses: 1000
};

const gridSize = 14; // sqrt(196)

// Generate random embedding vector
function generateEmbedding(seed: number, dim: number = 768): number[] {
	const result: number[] = [];
	let s = seed;
	for (let i = 0; i < dim; i++) {
		s = (s * 1103515245 + 12345) & 0x7fffffff;
		result.push((s / 0x7fffffff) * 2 - 1); // Normalize to [-1, 1]
	}
	return result;
}

// Generate attention matrix with realistic patterns
// CLS token attends broadly, spatial locality for patch-to-patch attention
function generateAttentionMatrix(
	headIndex: number,
	layerIndex: number
): number[][] {
	const size = config.numPatches + 1; // +1 for CLS
	const matrix: number[][] = [];

	// Different attention patterns for different heads
	const patternType = headIndex % 4;

	for (let i = 0; i < size; i++) {
		const row: number[] = [];
		for (let j = 0; j < size; j++) {
			let attention = 0;

			if (i === 0) {
				// CLS token attention - attends broadly to all patches
				if (j === 0) {
					attention = 0.05; // Small self-attention
				} else {
					// CLS attends more to center/salient regions
					const patchRow = Math.floor((j - 1) / gridSize);
					const patchCol = (j - 1) % gridSize;
					const centerDist = Math.sqrt(
						Math.pow(patchRow - gridSize / 2, 2) +
						Math.pow(patchCol - gridSize / 2, 2)
					);
					attention = Math.exp(-centerDist / (gridSize * 0.5)) * 0.5 + Math.random() * 0.2;
				}
			} else if (j === 0) {
				// Patches attending to CLS - increases with layer depth
				attention = (0.1 + layerIndex * 0.02) * (0.5 + Math.random() * 0.5);
			} else {
				// Patch-to-patch attention
				const iRow = Math.floor((i - 1) / gridSize);
				const iCol = (i - 1) % gridSize;
				const jRow = Math.floor((j - 1) / gridSize);
				const jCol = (j - 1) % gridSize;
				const dist = Math.sqrt(Math.pow(iRow - jRow, 2) + Math.pow(iCol - jCol, 2));

				switch (patternType) {
					case 0: // Local attention pattern
						attention = Math.exp(-dist * dist / 4) * 0.8 + Math.random() * 0.1;
						break;
					case 1: // Horizontal stripe attention
						attention = iRow === jRow ? 0.4 + Math.random() * 0.3 : Math.random() * 0.1;
						break;
					case 2: // Vertical stripe attention
						attention = iCol === jCol ? 0.4 + Math.random() * 0.3 : Math.random() * 0.1;
						break;
					case 3: // Global attention (later layers)
						attention = 0.2 + Math.random() * 0.3;
						break;
				}
			}

			row.push(Math.max(0, Math.min(1, attention)));
		}

		// Normalize row to sum to 1 (softmax-like)
		const sum = row.reduce((a, b) => a + b, 0);
		matrix.push(row.map(v => v / sum));
	}

	return matrix;
}

// Generate patches
function generatePatches(): VitPatch[] {
	const patches: VitPatch[] = [];
	for (let i = 0; i < config.numPatches; i++) {
		const row = Math.floor(i / gridSize);
		const col = i % gridSize;
		patches.push({
			index: i,
			row,
			col,
			data: generateEmbedding(i * 100, config.patchSize * config.patchSize * 3)
		});
	}
	return patches;
}

// Generate patch embeddings
function generatePatchEmbeddings(): VitPatchEmbedding[] {
	const embeddings: VitPatchEmbedding[] = [];
	for (let i = 0; i < config.numPatches; i++) {
		const embedding = generateEmbedding(i * 1000, config.hiddenSize);
		const positional = generateEmbedding(i * 2000 + 5000, config.hiddenSize);
		const combined = embedding.map((v, j) => v + positional[j]);
		embeddings.push({
			patchIndex: i,
			embedding,
			positionalEncoding: positional,
			combined
		});
	}
	return embeddings;
}

// Generate layer outputs
function generateLayerOutputs(): VitLayerOutput[] {
	const outputs: VitLayerOutput[] = [];
	for (let l = 0; l < config.numLayers; l++) {
		const heads: VitAttentionHead[] = [];
		for (let h = 0; h < config.numHeads; h++) {
			heads.push({
				headIndex: h,
				attentionMatrix: generateAttentionMatrix(h, l)
			});
		}

		// Generate attention output and MLP output
		const attentionOutput: number[][] = [];
		const mlpOutput: number[][] = [];
		for (let p = 0; p <= config.numPatches; p++) {
			attentionOutput.push(generateEmbedding(l * 10000 + p * 100, config.hiddenSize));
			mlpOutput.push(generateEmbedding(l * 20000 + p * 100 + 50000, config.hiddenSize));
		}

		outputs.push({
			layerIndex: l,
			attentionHeads: heads,
			attentionOutput,
			mlpOutput
		});
	}
	return outputs;
}

// ImageNet class predictions for cat
const catPredictions: VitClassPrediction[] = [
	{ classId: 281, className: 'tabby cat', probability: 0.72, logit: 8.2 },
	{ classId: 282, className: 'tiger cat', probability: 0.15, logit: 6.1 },
	{ classId: 283, className: 'Persian cat', probability: 0.06, logit: 5.2 },
	{ classId: 285, className: 'Egyptian cat', probability: 0.03, logit: 4.5 },
	{ classId: 287, className: 'lynx', probability: 0.01, logit: 3.2 }
];

const dogPredictions: VitClassPrediction[] = [
	{ classId: 207, className: 'golden retriever', probability: 0.68, logit: 7.9 },
	{ classId: 208, className: 'Labrador retriever', probability: 0.18, logit: 6.3 },
	{ classId: 209, className: 'Chesapeake Bay retriever', probability: 0.05, logit: 4.8 },
	{ classId: 206, className: 'cocker spaniel', probability: 0.04, logit: 4.5 },
	{ classId: 205, className: 'komondor', probability: 0.02, logit: 3.8 }
];

const birdPredictions: VitClassPrediction[] = [
	{ classId: 11, className: 'goldfinch', probability: 0.58, logit: 7.2 },
	{ classId: 12, className: 'house finch', probability: 0.22, logit: 6.0 },
	{ classId: 13, className: 'junco', probability: 0.08, logit: 4.9 },
	{ classId: 14, className: 'indigo bunting', probability: 0.05, logit: 4.3 },
	{ classId: 15, className: 'robin', probability: 0.03, logit: 3.7 }
];

const carPredictions: VitClassPrediction[] = [
	{ classId: 817, className: 'sports car', probability: 0.62, logit: 7.5 },
	{ classId: 751, className: 'racing car', probability: 0.20, logit: 6.1 },
	{ classId: 656, className: 'minivan', probability: 0.07, logit: 4.6 },
	{ classId: 609, className: 'jeep', probability: 0.05, logit: 4.2 },
	{ classId: 511, className: 'convertible', probability: 0.03, logit: 3.6 }
];

// Generate complete model data for each image
function generateVitModelData(predictions: VitClassPrediction[]): VitModelData {
	return {
		config,
		patches: generatePatches(),
		patchEmbeddings: generatePatchEmbeddings(),
		clsToken: generateEmbedding(999999, config.hiddenSize),
		clsPositionalEncoding: generateEmbedding(888888, config.hiddenSize),
		layerOutputs: generateLayerOutputs(),
		finalClsToken: generateEmbedding(777777, config.hiddenSize),
		predictions,
		topPrediction: predictions[0]
	};
}

// Export sample data for each image
export const vitCatData = generateVitModelData(catPredictions);
export const vitDogData = generateVitModelData(dogPredictions);
export const vitBirdData = generateVitModelData(birdPredictions);
export const vitCarData = generateVitModelData(carPredictions);

export const vitExampleDataMap = [vitCatData, vitDogData, vitBirdData, vitCarData];

// Utility to get attention for a specific patch
export function getAttentionForPatch(
	data: VitModelData,
	layerIdx: number,
	headIdx: number,
	patchIdx: number
): number[] {
	const layer = data.layerOutputs[layerIdx];
	const head = layer.attentionHeads[headIdx];
	// patchIdx + 1 because index 0 is CLS token
	return head.attentionMatrix[patchIdx + 1];
}

// Get CLS token attention (what does CLS attend to?)
export function getClsAttention(
	data: VitModelData,
	layerIdx: number,
	headIdx: number
): number[] {
	const layer = data.layerOutputs[layerIdx];
	const head = layer.attentionHeads[headIdx];
	return head.attentionMatrix[0];
}

import { writable, derived, get } from 'svelte/store';
import tailwindConfig from '../../tailwind.config';
import resolveConfig from 'tailwindcss/resolveConfig';

const { theme } = resolveConfig(tailwindConfig);

// =============================================================================
// ViT MODEL CONFIGURATION
// Using a toy ViT configuration optimized for browser visualization
// Real ViT-Base: 12 layers, 12 heads, 768 hidden, 16x16 patches on 224x224 = 196 patches
// Our toy model: 4 layers, 4 heads, 192 hidden, 14x14 patches for performance
// =============================================================================

export const vitConfig = {
	// Image dimensions
	imageSize: 224,
	patchSize: 16,

	// Computed: 224/16 = 14 patches per side = 196 total patches
	// Note: Using 14x14 (196 patches) is standard for ViT with 224x224 images
	// 16x16 (256 patches) would require 256x256 images or different patch size
	get gridSize() { return Math.floor(this.imageSize / this.patchSize); }, // 14
	get numPatches() { return this.gridSize * this.gridSize; }, // 196
	get numTokens() { return this.numPatches + 1; }, // 197 (patches + CLS)

	// Model dimensions (toy model for browser)
	hiddenSize: 192,      // Embedding dimension (real ViT-Base: 768)
	mlpSize: 768,         // MLP hidden size (4x hidden)
	numLayers: 4,         // Number of transformer layers (real: 12)
	numHeads: 4,          // Number of attention heads (real: 12)
	headDim: 48,          // Hidden / heads = 192 / 4 = 48

	// Output
	numClasses: 10,       // Simplified for demo (real ImageNet: 1000)

	// Class labels for demo
	classLabels: [
		'airplane', 'automobile', 'bird', 'cat', 'deer',
		'dog', 'frog', 'horse', 'ship', 'truck'
	] as const
};

// Freeze config to prevent accidental modification
Object.freeze(vitConfig);

// =============================================================================
// STORES
// =============================================================================

// Current loaded image data
export const vitCurrentImage = writable<{
	src: string;
	name: string;
	pixels: Float32Array | null;  // Normalized pixel data [3, 224, 224]
	canvas: HTMLCanvasElement | null;
} | null>(null);

// Model inference results
export const vitModelData = writable<{
	// Input stage
	patchEmbeddings: Float32Array;      // [numPatches, hiddenSize]
	positionEmbeddings: Float32Array;   // [numTokens, hiddenSize]
	inputEmbeddings: Float32Array;      // [numTokens, hiddenSize] - after adding pos

	// Per-layer outputs
	layerOutputs: Array<{
		// Attention
		queryProj: Float32Array;          // [numTokens, hiddenSize]
		keyProj: Float32Array;            // [numTokens, hiddenSize]
		valueProj: Float32Array;          // [numTokens, hiddenSize]
		attentionWeights: Float32Array;   // [numHeads, numTokens, numTokens]
		attentionOutput: Float32Array;    // [numTokens, hiddenSize]

		// MLP
		mlpHidden: Float32Array;          // [numTokens, mlpSize]
		mlpOutput: Float32Array;          // [numTokens, hiddenSize]

		// Layer output (after residual + layernorm)
		output: Float32Array;             // [numTokens, hiddenSize]
	}>;

	// Output stage
	clsOutput: Float32Array;            // [hiddenSize] - final CLS token
	logits: Float32Array;               // [numClasses]
	probabilities: Float32Array;        // [numClasses] - after softmax
	predictions: Array<{
		classIdx: number;
		className: string;
		probability: number;
		logit: number;
	}>;
} | null>(null);

// =============================================================================
// UI STATE
// =============================================================================

// Which block/component is expanded
export const vitExpandedBlock = writable<{ id: string | null }>({ id: null });

// Current layer being viewed (0 to numLayers-1)
export const vitBlockIdx = writable<number>(0);

// Current attention head being viewed (0 to numHeads-1)
export const vitAttentionHeadIdx = writable<number>(0);

// Selected/highlighted patch (-1 for CLS, 0-195 for patches)
export const selectedPatchIdx = writable<number>(0);

// Hover state for patch
export const hoveredPatchIdx = writable<number | null>(null);

// Show attention overlay on image
export const showAttentionOverlay = writable<boolean>(true);

// Show CLS token in visualizations
export const showClsToken = writable<boolean>(true);

// Attention aggregation mode
export const attentionMode = writable<'single_head' | 'avg_heads' | 'rollout'>('single_head');

// Animation state
export const vitIsAnimating = writable<boolean>(false);
export const vitIsLoading = writable<boolean>(false);
export const vitIsModelReady = writable<boolean>(false);

// =============================================================================
// DERIVED STORES
// =============================================================================

// Get attention weights for current layer/head/patch
export const currentAttentionWeights = derived(
	[vitModelData, vitBlockIdx, vitAttentionHeadIdx, selectedPatchIdx],
	([$data, $layer, $head, $patch]) => {
		if (!$data || !$data.layerOutputs[$layer]) return null;

		const weights = $data.layerOutputs[$layer].attentionWeights;
		const numTokens = vitConfig.numTokens;

		// Extract attention row for selected token
		// Token 0 is CLS, tokens 1-196 are patches
		const tokenIdx = $patch === -1 ? 0 : $patch + 1;
		const headOffset = $head * numTokens * numTokens;
		const rowOffset = tokenIdx * numTokens;

		const attentionRow = new Float32Array(numTokens);
		for (let i = 0; i < numTokens; i++) {
			attentionRow[i] = weights[headOffset + rowOffset + i];
		}

		return attentionRow;
	}
);

// Get spatial attention (map attention back to image grid)
export const spatialAttention = derived(
	[currentAttentionWeights, showClsToken],
	([$weights, $showCls]) => {
		if (!$weights) return null;

		const gridSize = vitConfig.gridSize;
		const spatial = new Float32Array(gridSize * gridSize);

		// Skip CLS token (index 0) and map to grid
		for (let i = 0; i < gridSize * gridSize; i++) {
			spatial[i] = $weights[i + 1]; // +1 to skip CLS
		}

		return {
			data: spatial,
			clsAttention: $weights[0], // Attention to CLS token
			gridSize
		};
	}
);

// =============================================================================
// COLORS
// =============================================================================

export const vitColors = {
	cls: theme.colors.purple[500],
	clsLight: theme.colors.purple[200],
	patch: theme.colors.blue[500],
	patchLight: theme.colors.blue[200],
	positional: theme.colors.orange[500],
	positionalLight: theme.colors.orange[200],
	query: theme.colors.blue[500],
	key: theme.colors.red[500],
	value: theme.colors.green[500],
	attention: theme.colors.red[500],
	attentionLight: theme.colors.red[200],
	mlp: theme.colors.indigo[500],
	mlpLight: theme.colors.indigo[200],
	classification: theme.colors.green[500],
	classificationLight: theme.colors.green[200],
	highlight: theme.colors.yellow[400],
	grid: theme.colors.gray[300]
};

// =============================================================================
// SAMPLE IMAGES
// =============================================================================

export const sampleImages = [
	{ id: 'cat', name: 'Cat', src: '/vit/images/cat.svg' },
	{ id: 'dog', name: 'Dog', src: '/vit/images/dog.svg' },
	{ id: 'bird', name: 'Bird', src: '/vit/images/bird.svg' },
	{ id: 'car', name: 'Car', src: '/vit/images/car.svg' },
];

export const selectedImageIdx = writable<number>(0);

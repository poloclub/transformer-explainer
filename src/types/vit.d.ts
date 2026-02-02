// Vision Transformer (ViT) Types

type VitPatch = {
	index: number;
	row: number;
	col: number;
	data: number[]; // Flattened pixel data (e.g., 16x16x3 = 768 for RGB)
};

type VitPatchEmbedding = {
	patchIndex: number;
	embedding: number[]; // 768-dimensional embedding
	positionalEncoding: number[];
	combined: number[]; // embedding + positional
};

type VitAttentionHead = {
	headIndex: number;
	attentionMatrix: number[][]; // (num_patches + 1) x (num_patches + 1), +1 for CLS token
};

type VitLayerOutput = {
	layerIndex: number;
	attentionHeads: VitAttentionHead[];
	attentionOutput: number[][];
	mlpOutput: number[][];
};

type VitClassPrediction = {
	classId: number;
	className: string;
	probability: number;
	logit: number;
};

type VitModelConfig = {
	imageSize: number; // e.g., 224
	patchSize: number; // e.g., 16
	numPatches: number; // (imageSize / patchSize)^2, e.g., 196
	hiddenSize: number; // e.g., 768
	numLayers: number; // e.g., 12
	numHeads: number; // e.g., 12
	numClasses: number; // e.g., 1000 for ImageNet
};

type VitModelData = {
	config: VitModelConfig;
	patches: VitPatch[];
	patchEmbeddings: VitPatchEmbedding[];
	clsToken: number[]; // The learned [CLS] token embedding
	clsPositionalEncoding: number[];
	layerOutputs: VitLayerOutput[];
	finalClsToken: number[]; // After all transformer layers
	predictions: VitClassPrediction[];
	topPrediction: VitClassPrediction;
};

type VitImageData = {
	src: string;
	name: string;
	width: number;
	height: number;
	pixels?: Uint8ClampedArray;
};

type HighlightedPatch = {
	index: number | null;
	row: number | null;
	col: number | null;
	fix?: boolean;
};

import { writable, derived } from 'svelte/store';
import tailwindConfig from '../../tailwind.config';
import resolveConfig from 'tailwindcss/resolveConfig';

const { theme } = resolveConfig(tailwindConfig);

// ViT Model Configuration
export const vitConfig: VitModelConfig = {
	imageSize: 224,
	patchSize: 16,
	numPatches: 196, // 14 x 14
	hiddenSize: 768,
	numLayers: 12,
	numHeads: 12,
	numClasses: 1000
};

// Patch grid dimensions
export const patchGridSize = Math.sqrt(vitConfig.numPatches); // 14

// Current image
export const vitCurrentImage = writable<VitImageData | null>(null);

// Model data
export const vitModelData = writable<VitModelData | null>(null);

// UI State
export const vitExpandedBlock = writable<{ id: string | null }>({ id: null });
export const vitBlockIdx = writable<number>(0);
export const vitAttentionHeadIdx = writable<number>(0);

// Highlighted patch for interaction
export const highlightedPatch = writable<HighlightedPatch>({
	index: null,
	row: null,
	col: null,
	fix: false
});

// Hover state for attention visualization
export const hoveredPatchForAttention = writable<number | null>(null);

// Show attention overlay on image
export const showAttentionOverlay = writable<boolean>(true);

// Animation state
export const vitIsOnAnimation = writable<boolean>(false);
export const vitIsLoading = writable<boolean>(false);

// Selected class prediction index
export const selectedPredictionIdx = writable<number>(0);

// Patch size for display
export const displayPatchSize = writable<number>(16);

// Colors for ViT visualization
export const vitColors = {
	cls: theme.colors.purple[500],
	patch: theme.colors.blue[400],
	positional: theme.colors.orange[400],
	attention: theme.colors.red[400],
	mlp: theme.colors.indigo[500],
	classification: theme.colors.green[500]
};

// Sample images for demo
export const sampleImages: VitImageData[] = [
	{ src: '/vit/images/cat.svg', name: 'Cat', width: 224, height: 224 },
	{ src: '/vit/images/dog.svg', name: 'Dog', width: 224, height: 224 },
	{ src: '/vit/images/bird.svg', name: 'Bird', width: 224, height: 224 },
	{ src: '/vit/images/car.svg', name: 'Car', width: 224, height: 224 }
];

// Selected image index
export const selectedImageIdx = writable<number>(0);

// Derived: Current patches count (including CLS)
export const totalTokens = derived([], () => vitConfig.numPatches + 1);

// Weight popover state
export const vitWeightPopover = writable<string | null>(null);

// Tooltip state
export const vitTooltip = writable<string | null>(null);

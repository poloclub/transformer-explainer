import { writable, derived } from 'svelte/store';

export const modelMetaMap: Record<string, ModelMetaData> = {
	'gpt2-sm': { layer_num: 6, attention_head_num: 6, dimension: 12 },
	'gpt2-md': { layer_num: 12, attention_head_num: 12, dimension: 48 },
	gpt2: { layer_num: 6, attention_head_num: 6, dimension: 768 }
};

// selected token vector
export const highlightedToken = writable<HighlightedToken>({
	index: null,
	value: null,
	fix: false
});

export const highlightedHead = writable<HighlightedToken>({
	index: null,
	value: null,
	fix: false
});

// expanded block
export const expandedBlock = writable<ExpandedBlock>({ id: 'tramsformer-block' });

// user input text
const initialText = 'Georgia tech is a big school of science';
export const inputText = writable(initialText);
export const tokens = derived(inputText, ($inputText) => $inputText.trim().split(' '));

// selected model and meta data
const initialSelectedModel = 'gpt2-md';
export const selectedModel = writable(initialSelectedModel);
export const modelMeta = derived(selectedModel, ($selectedModel) => modelMetaMap[$selectedModel]);

// Temperature setting
export const initialtTemperature = 110.0;
export const temperature = writable(initialtTemperature);

// Matrix cell width, height
export const cellWidth = derived(modelMeta, ($meta) => {
	// return 8;
	const maxColSize = 100;
	const minColSize = 0.05;
	return Math.max(maxColSize / $meta.dimension, minColSize);
});
export const cellHeight = writable(8);

export const rowGap = 2;

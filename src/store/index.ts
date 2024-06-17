import { writable, derived } from 'svelte/store';
import * as ort from 'onnxruntime-web';
import tailwindConfig from '../../tailwind.config';
import resolveConfig from 'tailwindcss/resolveConfig';
const { theme } = resolveConfig(tailwindConfig);

export const inputTextExample = [
	'Data visualization empowers users to',
	'Artificial Intelligence is transforming the',
	'IEEE VIS conference highlights the',
	'Neural networks can learn to',
	'Predictive modeling enhances the'
];

export const modelSession = writable<ort.InferenceSession>();

// transformer model output
export const modelData = writable<ModelData>();
export const tokens = writable<string[]>('Data visualization em powers users to'.split(' '));

// is transformer running?
export const isModelRunning = writable(false);

export const modelMetaMap: Record<string, ModelMetaData> = {
	gpt2: { layer_num: 12, attention_head_num: 12, dimension: 768 },
	'gpt2-medium': { layer_num: 24, attention_head_num: 16, dimension: 1024 },
	'gpt2-large': { layer_num: 36, attention_head_num: 20, dimension: 1280 }
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
export const expandedBlock = writable<ExpandedBlock>({ id: null });

// user input text
export const inputText = writable(inputTextExample[0]);
// export const tokens = derived(inputText, ($inputText) => $inputText.trim().split(' '));

// selected model and meta data
const initialSelectedModel = 'gpt2';
export const selectedModel = writable(initialSelectedModel);
export const modelMeta = derived(selectedModel, ($selectedModel) => modelMetaMap[$selectedModel]);

// Temperature setting
export const initialtTemperature = 1.0;
export const temperature = writable(initialtTemperature);

// Prediction result
export const initialPredictedToken = '';
export const predictedToken = writable<PredictionItem>();
export const highlightedIndex = writable(null);
export const finalTokenIndex = writable(null);

// Visual element style
export const rootRem = 16;
export const minVectorHeight = 12;
export const maxVectorHeight = 36;
export const maxVectorScale = 4;

export const vectorHeight = writable(0);
export const headContentHeight = writable(0);
export const headGap = { x: 5, y: 8, scale: 0 };

export const isBoundingBoxActive = writable(false);

export const predictedColor = theme.colors.indigo[400];

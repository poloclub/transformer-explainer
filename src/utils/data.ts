import { AutoTokenizer, PreTrainedTokenizer } from '@xenova/transformers';
import * as ort from 'onnxruntime-web';
import { modelData, isModelRunning, temperature, predictedToken } from '~/store';
import BigNumber from 'bignumber.js';
import { applyTemperatureToData, sampleToken } from './sampler';
import { showFlowAnimation, showSamplingAnimation } from './animation';
import { base } from '$app/paths';

ort.env.wasm.wasmPaths = 'https://cdn.jsdelivr.net/npm/onnxruntime-web/dist/';

export const runModel = async (input: string, temperature: number, tokenLength: number) => {
	isModelRunning.set(true);

	// setTimeout(() => {
	// 	showFlowAnimation(tokenLength);
	// }, 100);

	const { outputs, prediction, inputTokens } = await getData(input);
	const adjustedData = applyTemperatureToData(prediction, temperature);
	const sampledToken = sampleToken(adjustedData);

	modelData.set({ inputTokens, outputs, prediction: adjustedData });

	await showFlowAnimation(tokenLength);

	predictedToken.set(sampledToken);

	isModelRunning.set(false);

	// inputText.update((currentText) => currentText + data.predictedToken);
};

export const adjustTemperature = async (data: Prediction, temperature: number) => {
	const adjustedData = applyTemperatureToData(data, temperature);
	const sampledToken = sampleToken(adjustedData);

	modelData.update((d) => ({ ...d, prediction: adjustedData }));
	await showSamplingAnimation();

	predictedToken.set(sampledToken);
};

const softmax = (logits: number[]) => {
	const maxLogit = Math.max(...logits);
	const expLogits = logits.map((x) => Math.exp(x - maxLogit));
	const sumExpLogits = expLogits.reduce((a, b) => a + b, 0);
	return expLogits.map((x) => x / sumExpLogits);
};

export const getTokenization = async (input: string) => {
	const tokenizer = await AutoTokenizer.from_pretrained('gpt2');

	const token_ids = tokenizer.encode(input);
	const input_tokens = tokenizer.decode(token_ids);

	return {
		token_ids,
		input_tokens
	};
};

const visibleDimension = 100;
const processTensorData = (tensor: any, limit = visibleDimension) => {
	const originalDims = tensor.dims;
	const originalData = tensor.data;
	const newData = [];

	for (let i = 0; i < originalDims[1]; i++) {
		const start = i * originalDims[2];
		const end = start + limit;
		newData.push(Array.from(originalData.slice(start, end)));
	}

	return {
		data: newData as number[][],
		dims: originalDims,
		size: tensor.size
	};
};

const getTopKPrediction = (
	logits: number[],
	probabilities: number[],
	tokenizer: PreTrainedTokenizer,
	k: number
): Prediction => {
	const output = Array.from(logits).map((logit, index) => ({
		tokenId: index,
		logit,
		probability: probabilities[index]
	}));
	output.sort((a, b) => b.probability - a.probability);
	return output
		.slice(0, k)
		.map((d, i) => ({ ...d, rank: i, token: tokenizer.decode([d.tokenId]) }));
};

export const getData = async (inputText: string) => {
	try {
		// Tokenize input text
		const { token_ids, input_tokens } = await getTokenization(inputText);

		// Convert token_ids to tensor
		const inputTensor = new ort.Tensor(
			'int64',
			new BigInt64Array(token_ids.map((x) => BigInt(x))),
			[1, token_ids.length]
		);

		// Load the model
		// TODO: use svelte store, create once.
		const session = await ort.InferenceSession.create(`${base}/model.onnx`);

		// Prepare the feeds (inputs)
		const feeds = { input: inputTensor };

		// Run inference
		const results = await session.run(feeds);

		// Extract the logits
		const logits = results['linear_output'].data;

		// Apply softmax to the logits to get probabilities
		const probabilities = softmax(logits);

		// Find the index of the highest probability
		// const maxIndex = probabilities.indexOf(Math.max(...probabilities));

		// Decode the output tokens back to text
		const tokenizer = await AutoTokenizer.from_pretrained('gpt2');
		// const outputText = tokenizer.decode([maxIndex]);

		const topK = 100;
		const prediction = getTopKPrediction(logits, probabilities, tokenizer, topK);

		// Extract the dictionary values
		const outputs = targetTensors.reduce(
			(obj, key) => {
				obj[key] = processTensorData(results[key]);
				return obj;
			},
			{} as ModelData['outputs']
		);

		return {
			inputTokens: input_tokens,
			outputs,
			prediction
		};
	} catch (error) {
		console.error('Error during inference:', error.message);
		throw error;
	}
};

const targetTensors = [
	'tok_emb',
	'transformer_wpe_weight',
	'pos_emb',
	'input_emb',
	'input_emb_dropout',
	'block_0_ln_1_input_mean',
	'block_0_ln_1_input_var',
	'block_0_ln_1_input_normalized',
	'block_0_ln_1_weight',
	'block_0_ln_1_bias',
	'block_0_ln_1_output',
	'block_0_attn_head_0_q_weights',
	'block_0_attn_head_0_k_weights',
	'block_0_attn_head_0_v_weights',
	'block_0_attn_head_0_q_bias',
	'block_0_attn_head_0_k_bias',
	'block_0_attn_head_0_v_bias',
	'block_0_attn_head_0_q',
	'block_0_attn_head_0_k',
	'block_0_attn_head_0_v',
	'block_0_attn_head_0_q_transposed',
	'block_0_attn_head_0_k_transposed',
	'block_0_attn_head_0_v_transposed',
	'block_0_attn_head_0_attn',
	'block_0_attn_head_0_attn_scaled',
	'block_0_attn_head_0_attn_masked',
	'block_0_attn_head_0_attn_softmax',
	'block_0_attn_head_0_attn_dropout',
	'block_0_attn_head_0_v_output',
	'block_0_attn_v_output_combined',
	'block_0_attn_proj_weights',
	'block_0_attn_proj_bias',
	'block_0_attn_attn_output',
	'block_0_res_1',
	'block_0_ln_2_input_mean',
	'block_0_ln_2_input_var',
	'block_0_ln_2_input_normalized',
	'block_0_ln_2_weight',
	'block_0_ln_2_bias',
	'block_0_ln_2_output',
	'block_0_mlp_linear_1_weight',
	'block_0_mlp_linear_1_bias',
	'block_0_mlp_linear_1_output',
	'block_0_mlp_gelu_output',
	'block_0_mlp_linear_2_weight',
	'block_0_mlp_linear_2_bias',
	'block_0_mlp_linear_2_output',
	'block_0_mlp_output_after_dropout',
	'block_0_res_2',
	'ln_f_input_mean',
	'ln_f_input_var',
	'ln_f_input_normalized',
	'ln_f_weight',
	'ln_f_bias',
	'ln_f_output',
	'linear_weight',
	'linear_output'
];
// test

// const input = 'To be or not to be is the';

// const testGetTokenization = (input) => {
// 	getTokenization(input)
// 		.then((result) => {
// 			console.log('Token IDs:', result.token_ids);
// 			console.log('Input Tokens:', result.input_tokens);
// 		})
// 		.catch((error) => {
// 			console.error('Error:', error);
// 		});
// };

// const testGetData = (input) => {
// 	getData(input)
// 		.then((output) => {
// 			console.log('Final attention matrix:', output.outputs.block_0_attn_head_0_attn_dropout);
// 			console.log('Generated last token: ', output.last_token, ', ', output.output_text);
// 		})
// 		.catch((err) => {
// 			console.error('Error:', err);
// 		});
// };

// testGetTokenization(input);
// testGetData(input);

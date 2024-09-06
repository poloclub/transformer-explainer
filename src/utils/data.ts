import { PreTrainedTokenizer } from '@xenova/transformers';
import * as ort from 'onnxruntime-web';
import { modelData, tokens, tokenIds, isModelRunning, predictedToken, modelSession } from '~/store';
import { get } from 'svelte/store';
import { reshapeArray } from './array';
import { showFlowAnimation } from './animation';

ort.env.wasm.wasmPaths = 'https://cdn.jsdelivr.net/npm/onnxruntime-web/dist/';

export const runModel = async ({
	tokenizer,
	input,
	temperature,
	topK,
	sampleK
}: {
	tokenizer: PreTrainedTokenizer;
	input: string;
	temperature: number;
	topK: number;
	sampleK: number;
}) => {
	isModelRunning.set(true);

	const { token_ids, input_tokens } = await getTokenization(tokenizer, input === '' ? ' ' : input);

	tokens.set(input_tokens);
	tokenIds.set(token_ids);

	const { logits, outputs } = await getData(token_ids);

	const prediction = getPrediction({ tokenizer, logits, topK, temperature });

	const sampledToken = sampleToken(prediction, sampleK);

	modelData.set({ logits, outputs, prediction, sampled: sampledToken });

	// To ensure the animation starts after all elements have been rendered
	setTimeout(async () => {
		await showFlowAnimation(input_tokens.length);
		predictedToken.set(sampledToken);
		isModelRunning.set(false);
	}, 0);
};

export const adjustTemperature = async ({
	tokenizer,
	logits,
	temperature,
	topK,
	sampleK
}: {
	tokenizer: PreTrainedTokenizer;
	logits: Prediction;
	topK: number;
	temperature: number;
	sampleK: number;
}) => {
	const prediction = getPrediction({ tokenizer, logits, topK, temperature });
	const sampledToken = sampleToken(prediction, sampleK);

	modelData.update((d) => ({ ...d, prediction, sampled: sampledToken }));
	//todo
	// await showSamplingAnimation();
	predictedToken.set(sampledToken);
};

export const getTokenization = async (tokenizer: PreTrainedTokenizer, input: string) => {
	const token_ids = tokenizer.encode(input);
	const input_tokens = token_ids.map((id) => tokenizer.decode([id])).flat();

	return {
		token_ids,
		input_tokens
	};
};

export const getData = async (token_ids: number[]) => {
	try {
		// Convert token_ids to tensor
		const inputTensor = new ort.Tensor('int64', token_ids, [1, token_ids.length]);

		// Get the session from the store
		const session = get(modelSession);
		if (!session) {
			throw new Error('Model session is not initialized.');
		}

		// Prepare the feeds (inputs)
		const feeds = { input: inputTensor };

		// Run inference
		const results = await session.run(feeds);

		// Extract the logits
		const logits = results['linear_output'].data;

		// Extract the dictionary values
		const outputs = targetTensors.reduce(
			(obj, key) => {
				const out = results[key];
				const processedData = {
					...out,
					data: reshapeArray([...out.cpuData], out.dims)
				};
				obj[key] = processedData;
				return obj;
			},
			{} as ModelData['outputs']
		);

		return {
			logits,
			outputs
		};
	} catch (error) {
		console.error('Error during inference:', error.message);
		throw error;
	}
};

export const getPrediction = ({
	tokenizer,
	logits,
	topK = 100,
	temperature = 1
}: {
	tokenizer: PreTrainedTokenizer;
	logits: number[];
	topK: number;
	temperature: number;
}): Prediction => {
	// adjust temperature
	const adjustedLogits = logits.map((d) => d / temperature);

	// softmax
	const maxLogit = Math.max(...adjustedLogits);
	const adjustedExps = adjustedLogits.map((x) => Math.exp(x - maxLogit));
	const sumExpLogits = adjustedExps.reduce((a, b) => a + b, 0);
	const adjustedProb = adjustedExps.map((x) => x / sumExpLogits);

	const output = Array.from(logits)
		.map((logit, i) => ({
			tokenId: i,
			logit,
			adjustedLogit: adjustedLogits[i],
			adjustedProbability: adjustedProb[i],
			adjustedExp: adjustedExps[i]
		}))
		.sort((a, b) => b.adjustedProbability - a.adjustedProbability);

	const topKOutput = output.slice(0, topK);

	// normalize top k prob
	const sumTopKProbabilities = topKOutput.reduce((a, b) => a + b.adjustedProbability, 0);

	const normalizedTopK = topKOutput.map((d, i) => {
		return {
			...d,
			rank: i,
			token: tokenizer.decode([d.tokenId]),
			normalizedProbability: d.adjustedProbability / sumTopKProbabilities
		};
	});

	return normalizedTopK;
};

export function sampleToken(topK: Prediction, sampleK: number) {
	const data = topK.slice(0, sampleK);

	const cumulativeProbabilities = [];
	data.reduce((sum, d, i) => (cumulativeProbabilities[i] = sum + d.normalizedProbability), 0);

	const randomValue = Math.random(); // 0 ~ 1

	for (let i = 0; i < cumulativeProbabilities.length; i++) {
		if (randomValue < cumulativeProbabilities[i]) {
			return data[i];
		}
	}
	// When the temperature is high, all tokens tend to have similarly small probabilities,
	// making it more likely for random values to be larger.
	// This ensures random selection - further investigation needed.
	return data[Math.floor(Math.random() * sampleK)];
}

const targetTensors = [
	// 'tok_emb',
	// 'transformer_wpe_weight',
	// 'pos_emb',
	// 'input_emb',
	// 'input_emb_dropout',
	// 'block_0_ln_1_input_mean',
	// 'block_0_ln_1_input_var',
	// 'block_0_ln_1_input_normalized',
	// 'block_0_ln_1_weight',
	// 'block_0_ln_1_bias',
	// 'block_0_ln_1_output',
	// 'block_0_attn_head_0_q_weights',
	// 'block_0_attn_head_0_k_weights',
	// 'block_0_attn_head_0_v_weights',
	// 'block_0_attn_head_0_q_bias',
	// 'block_0_attn_head_0_k_bias',
	// 'block_0_attn_head_0_v_bias',
	// 'block_0_attn_head_0_q',
	// 'block_0_attn_head_0_k',
	// 'block_0_attn_head_0_v',
	// 'block_0_attn_head_0_q_transposed',
	// 'block_0_attn_head_0_k_transposed',
	// 'block_0_attn_head_0_v_transposed',
	'block_0_attn_head_0_attn',
	'block_0_attn_head_0_attn_scaled',
	'block_0_attn_head_0_attn_masked',
	'block_0_attn_head_0_attn_softmax',
	'block_0_attn_head_0_attn_dropout',
	// 'block_0_attn_head_0_v_output',
	// 'block_0_attn_v_output_combined',
	// 'block_0_attn_proj_weights',
	// 'block_0_attn_proj_bias',
	// 'block_0_attn_attn_output',
	// 'block_0_res_1',
	// 'block_0_ln_2_input_mean',
	// 'block_0_ln_2_input_var',
	// 'block_0_ln_2_input_normalized',
	// 'block_0_ln_2_weight',
	// 'block_0_ln_2_bias',
	// 'block_0_ln_2_output',
	// 'block_0_mlp_linear_1_weight',
	// 'block_0_mlp_linear_1_bias',
	// 'block_0_mlp_linear_1_output',
	// 'block_0_mlp_gelu_output',
	// 'block_0_mlp_linear_2_weight',
	// 'block_0_mlp_linear_2_bias',
	// 'block_0_mlp_linear_2_output',
	// 'block_0_mlp_output_after_dropout',
	// 'block_0_res_2',
	// 'ln_f_input_mean',
	// 'ln_f_input_var',
	// 'ln_f_input_normalized',
	// 'ln_f_weight',
	// 'ln_f_bias',
	// 'ln_f_output',
	// 'linear_weight',
	'linear_output'
];

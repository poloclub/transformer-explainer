import { AutoTokenizer } from '@xenova/transformers';
import ort from 'onnxruntime-node';

const softmax = (logits) => {
    const maxLogit = Math.max(...logits);
    const expLogits = logits.map(x => Math.exp(x - maxLogit));
    const sumExpLogits = expLogits.reduce((a, b) => a + b, 0);
    return expLogits.map(x => x / sumExpLogits);
};

export const getTokenization = async (input) => {
    const tokenizer = await AutoTokenizer.from_pretrained('gpt2');

    const token_ids = tokenizer.encode(input);
    const input_tokens = tokenizer.decode(token_ids);

    return {
        token_ids,
        input_tokens
    };
};

export const getData = async (inputText) => {
    try {
        // Tokenize input text
        const { token_ids } = await getTokenization(inputText);

        // Convert token_ids to tensor
        const inputTensor = new ort.Tensor('int64', new BigInt64Array(token_ids.map(x => BigInt(x))), [1, token_ids.length]);

        // Load the model
        const session = await ort.InferenceSession.create('src/utils/model/params_output/model.onnx');

        // Prepare the feeds (inputs)
        const feeds = { input: inputTensor };

        // Run inference
        const results = await session.run(feeds);

        // Extract the logits
        const logits = results['linear_output'].data;

        // Apply softmax to the logits to get probabilities
        const probabilities = softmax(logits);

        // Find the index of the highest probability
        const maxIndex = probabilities.indexOf(Math.max(...probabilities));

        // Decode the output tokens back to text
        const tokenizer = await AutoTokenizer.from_pretrained('gpt2');
        const outputText = tokenizer.decode([maxIndex]);

        // Extract the dictionary values
        const outputs = {
            tok_emb: results["tok_emb"],
            transformer_wpe_weight: results["transformer_wpe_weight"],
            pos_emb: results["pos_emb"],
            input_emb: results["input_emb"],
            input_emb_dropout: results["input_emb_dropout"],
            block_0_ln_1_input_mean: results["block_0_ln_1_input_mean"],
            block_0_ln_1_input_var: results["block_0_ln_1_input_var"],
            block_0_ln_1_input_normalized: results["block_0_ln_1_input_normalized"],
            block_0_ln_1_weight: results["block_0_ln_1_weight"],
            block_0_ln_1_bias: results["block_0_ln_1_bias"],
            block_0_ln_1_output: results["block_0_ln_1_output"],
            block_0_attn_head_0_q_weights: results["block_0_attn_head_0_q_weights"],
            block_0_attn_head_0_k_weights: results["block_0_attn_head_0_k_weights"],
            block_0_attn_head_0_v_weights: results["block_0_attn_head_0_v_weights"],
            block_0_attn_head_0_q_bias: results["block_0_attn_head_0_q_bias"],
            block_0_attn_head_0_k_bias: results["block_0_attn_head_0_k_bias"],
            block_0_attn_head_0_v_bias: results["block_0_attn_head_0_v_bias"],
            block_0_attn_head_0_q: results["block_0_attn_head_0_q"],
            block_0_attn_head_0_k: results["block_0_attn_head_0_k"],
            block_0_attn_head_0_v: results["block_0_attn_head_0_v"],
            block_0_attn_head_0_q_transposed: results["block_0_attn_head_0_q_transposed"],
            block_0_attn_head_0_k_transposed: results["block_0_attn_head_0_k_transposed"],
            block_0_attn_head_0_v_transposed: results["block_0_attn_head_0_v_transposed"],
            block_0_attn_head_0_attn: results["block_0_attn_head_0_attn"],
            block_0_attn_head_0_attn_scaled: results["block_0_attn_head_0_attn_scaled"].data,
            block_0_attn_head_0_attn_masked: results["block_0_attn_head_0_attn_masked"],
            block_0_attn_head_0_attn_softmax: results["block_0_attn_head_0_attn_softmax"],
            block_0_attn_head_0_attn_dropout: results["block_0_attn_head_0_attn_dropout"],
            block_0_attn_head_0_v_output: results["block_0_attn_head_0_v_output"],
            block_0_attn_v_output_combined: results["block_0_attn_v_output_combined"],
            block_0_attn_proj_weights: results["block_0_attn_proj_weights"],
            block_0_attn_proj_bias: results["block_0_attn_proj_bias"],
            block_0_attn_attn_output: results["block_0_attn_attn_output"],
            block_0_res_1: results["block_0_res_1"],
            block_0_ln_2_input_mean: results["block_0_ln_2_input_mean"],
            block_0_ln_2_input_var: results["block_0_ln_2_input_var"],
            block_0_ln_2_input_normalized: results["block_0_ln_2_input_normalized"],
            block_0_ln_2_weight: results["block_0_ln_2_weight"],
            block_0_ln_2_bias: results["block_0_ln_2_bias"],
            block_0_ln_2_output: results["block_0_ln_2_output"],
            block_0_mlp_linear_1_weight: results["block_0_mlp_linear_1_weight"],
            block_0_mlp_linear_1_bias: results["block_0_mlp_linear_1_bias"],
            block_0_mlp_linear_1_output: results["block_0_mlp_linear_1_output"],
            block_0_mlp_gelu_output: results["block_0_mlp_gelu_output"],
            block_0_mlp_linear_2_weight: results["block_0_mlp_linear_2_weight"],
            block_0_mlp_linear_2_bias: results["block_0_mlp_linear_2_bias"],
            block_0_mlp_linear_2_output: results["block_0_mlp_linear_2_output"],
            block_0_mlp_output_after_dropout: results["block_0_mlp_output_after_dropout"],
            block_0_res_2: results["block_0_res_2"],
            ln_f_input_mean: results["ln_f_input_mean"],
            ln_f_input_var: results["ln_f_input_var"],
            ln_f_input_normalized: results["ln_f_input_normalized"],
            ln_f_weight: results["ln_f_weight"],
            ln_f_bias: results["ln_f_bias"],
            ln_f_output: results["ln_f_output"],
            linear_weight: results["linear_weight"],
            linear_output: results["linear_output"]
        };

        return {
            outputs,
            last_token: maxIndex,
            output_text: outputText
        };
    } catch (error) {
        console.error("Error during inference:", error.message);
        throw error;
    }
};

// test

const input = "To be or not to be is the";

const testGetTokenization = (input) => {
    getTokenization(input)
        .then(result => {
            console.log('Token IDs:', result.token_ids);
            console.log('Input Tokens:', result.input_tokens);
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

const testGetData = (input) => {
    getData(input)
        .then(output => {
            console.log("Final attention matrix:", output.outputs.block_0_attn_head_0_attn_dropout);
            console.log("Generated last token: ", output.last_token, ", ", output.output_text);
        })
        .catch(err => {
            console.error("Error:", err);
        });
}

testGetTokenization(input);
testGetData(input);

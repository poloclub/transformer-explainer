import { AutoTokenizer } from '@xenova/transformers';

export const getTokenization = async(input: string) => {
    const tokenizer = await AutoTokenizer.from_pretrained('gpt2'); // load pre-trained toakenizer

    const token_ids = tokenizer.encode(input);
    const input_tokens = tokenizer.decode(token_ids);

    return {
        token_ids,
        input_tokens
    }
};

export const attentionOutput = [
	[1.0, -Infinity, -Infinity, -Infinity, -Infinity, -Infinity, -Infinity, -Infinity],
	[0.0416, 0.9584, -Infinity, -Infinity, -Infinity, -Infinity, -Infinity, -Infinity],
	[0.1651, 0.1737, 0.6612, -Infinity, -Infinity, -Infinity, -Infinity, -Infinity],
	[0.2461, 0.3274, 0.2074, 0.2191, -Infinity, -Infinity, -Infinity, -Infinity],
	[0.0474, 0.0892, 0.0908, 0.1517, 0.6208, -Infinity, -Infinity, -Infinity],
	[0.0843, 0.0933, 0.1594, 0.2414, 0.0931, 0.3284, -Infinity, -Infinity],
	[0.1506, 0.1773, 0.1069, 0.136, 0.1935, 0.1553, 0.0803, -Infinity],
	[0.0423, 0.0486, 0.1517, 0.0567, 0.0769, 0.0661, 0.1164, 0.4413]
];

export const qk = [
	[3.3533, 0.3428, 0.0783, -0.0508, -0.6059, -0.864, 0.205, -0.4236],
	[-0.1291, 3.008, 1.035, 0.9296, 1.2946, -0.1833, 0.1382, 0.4975],
	[-0.2186, -0.1678, 1.1688, 0.356, 0.2397, -0.0626, 0.9939, 0.3423],
	[-0.1361, 0.1493, -0.3071, -0.252, -0.0585, 0.0928, -0.6452, -0.1741],
	[-0.0581, 0.5733, 0.5906, 1.1044, 2.5133, 0.5165, 0.7713, 0.7104],
	[0.3017, 0.4031, 0.939, 1.354, 0.4012, 1.6616, 0.2766, 0.63],
	[-0.1425, 0.0208, -0.4853, -0.2446, 0.1081, -0.1118, -0.7712, -0.4014],
	[0.4445, 0.5833, 1.7208, 0.7366, 1.0418, 0.891, 1.4559, 2.7889]
];

export const masked = [
	[3.3533, -Infinity, -Infinity, -Infinity, -Infinity, -Infinity, -Infinity, -Infinity],
	[-0.1291, 3.008, -Infinity, -Infinity, -Infinity, -Infinity, -Infinity, -Infinity],
	[-0.2186, -0.1678, 1.1688, -Infinity, -Infinity, -Infinity, -Infinity, -Infinity],
	[-0.1361, 0.1493, -0.3071, -0.252, -Infinity, -Infinity, -Infinity, -Infinity],
	[-0.0581, 0.5733, 0.5906, 1.1044, 2.5133, -Infinity, -Infinity, -Infinity],
	[0.3017, 0.4031, 0.939, 1.354, 0.4012, 1.6616, -Infinity, -Infinity],
	[-0.1425, 0.0208, -0.4853, -0.2446, 0.1081, -0.1118, -0.7712, -Infinity],
	[0.4445, 0.5833, 1.7208, 0.7366, 1.0418, 0.891, 1.4559, 2.7889]
];


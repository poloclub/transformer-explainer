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

export const OriginalBarData = [
		{ token: 'great', token_id: 1049, logit: 8.420611381530762, probability: 0.05054401233792305 },
		{ token: 'big', token_id: 1263, logit: 7.39492654800415, probability: 0.018122598528862 },
		{
			token: 'member',
			token_id: 2888,
			logit: 7.361647129058838,
			probability: 0.017529413104057312
		},
		{ token: 'good', token_id: 922, logit: 7.354094982147217, probability: 0.017397526651620865 },
		{ token: 'very', token_id: 845, logit: 7.138553619384766, probability: 0.014024232514202595 },
		{
			token: 'major',
			token_id: 1688,
			logit: 7.0558366775512695,
			probability: 0.012910871766507626
		},
		{ token: 'small', token_id: 1402, logit: 7.034438133239746, probability: 0.012637533247470856 },
		{ token: 'top', token_id: 1353, logit: 7.018462657928467, probability: 0.01243724673986435 },
		{
			token: 'private',
			token_id: 2839,
			logit: 6.951408386230469,
			probability: 0.011630622670054436
		},
		{ token: 'huge', token_id: 3236, logit: 6.743682384490967, probability: 0.009449061937630177 },
		{
			token: 'strong',
			token_id: 1913,
			logit: 6.724063873291016,
			probability: 0.009265491738915443
		},
		{ token: 'bit', token_id: 1643, logit: 6.68026876449585, probability: 0.008868466131389141 },
		{ token: '"', token_id: 366, logit: 6.677203178405762, probability: 0.008841320872306824 },
		{ token: 'school', token_id: 1524, logit: 6.64955997467041, probability: 0.008600265718996525 },
		{ token: 'team', token_id: 1074, logit: 6.605846881866455, probability: 0.008232420310378075 },
		{
			token: 'public',
			token_id: 1171,
			logit: 6.605170249938965,
			probability: 0.008226851001381874
		},
		{ token: 'little', token_id: 1310, logit: 6.595873832702637, probability: 0.00815072562545538 },
		{
			token: 'perfect',
			token_id: 2818,
			logit: 6.581667900085449,
			probability: 0.008035754784941673
		},
		{
			token: 'place',
			token_id: 1295,
			logit: 6.5282111167907715,
			probability: 0.007617469411343336
		},
		{
			token: 'program',
			token_id: 1430,
			logit: 6.490026473999023,
			probability: 0.007332082372158766
		},
		{
			token: 'national',
			token_id: 2260,
			logit: 6.4784722328186035,
			probability: 0.007247853092849255
		},
		{ token: 'long', token_id: 890, logit: 6.410051345825195, probability: 0.006768533028662205 },
		{ token: 'two', token_id: 734, logit: 6.34706449508667, probability: 0.006355354096740484 },
		{
			token: 'unique',
			token_id: 3748,
			logit: 6.244614124298096,
			probability: 0.005736487917602062
		},
		{ token: 'well', token_id: 880, logit: 6.24260950088501, probability: 0.005725000519305468 },
		{
			token: 'Division',
			token_id: 7458,
			logit: 6.199276924133301,
			probability: 0.005482219625264406
		},
		{ token: 'state', token_id: 1181, logit: 6.191622257232666, probability: 0.005440414883196354 },
		{
			token: 'college',
			token_id: 4152,
			logit: 6.159815311431885,
			probability: 0.0052700950764119625
		},
		{
			token: 'football',
			token_id: 4346,
			logit: 6.128932476043701,
			probability: 0.005109827034175396
		},
		{ token: 'one', token_id: 530, logit: 6.1205549240112305, probability: 0.005067198537290096 },
		{ token: 'non', token_id: 1729, logit: 6.114068508148193, probability: 0.005034436471760273 }
	];
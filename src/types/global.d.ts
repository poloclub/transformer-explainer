type Flow = {
	type?: 'path' | 'node';
	id: string;
	from?: string;
	to?: string;
	match?: boolean;
	arrow?: boolean;
	anchor?: { from?: 'l' | 'r' | 't' | 'b'; to?: 'l' | 'r' | 't' | 'b' };
	stroke?: { width?: number };
	transition?: gsap.TweenVars & { position?: gsap.Position };
	curve?: 'vh' | 'hv';
};

type MatrixData = number[][];

type ModelMetaData = {
	layer_num: number;
	attention_head_num: number;
	dimension: number;
	chunkTotal?: number;
};

type HighlightedToken = {
	index: number | string | null;
	value?: string | null;
	fix?: boolean;
};

type HighlightedHead = {
	index: number | string | null;
	value?: string | null;
	fix?: boolean;
};

type ExpandedBlock = { id: number | string | null };

type PredictionItem = {
	rank: number;
	tokenId: number;
	token: string;
	logit: number;
	adjustedLogit: number;
	adjustedProbability: number;
	normalizedProbability: number;
	adjustedExp: number;
};
type Prediction = PredictionItem[];
type ModelData = {
	logits: number[];
	outputs: Record<string, { data: number[][]; dims: number[]; size: number }>;
	prediction: Prediction;
	sampled: PredictionItem;
};

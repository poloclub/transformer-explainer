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

type ModelMetaData = { layer_num: number; attention_head_num: number; dimension: number };

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

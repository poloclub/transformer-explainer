import { writable, derived } from 'svelte/store';

export const decodeStep = writable<number>(0);
// 0 = prefill complete, 1+ = decode steps

export type KVCacheEntry = {
	token: string;
	keys: number[][];   // [12 heads, 64] — all heads for this token
	values: number[][];  // [12 heads, 64]
};

export const kvCache = writable<KVCacheEntry[]>([]);
// Grows by one row per step advance

export const isDecoding = derived(decodeStep, ($s) => $s > 0);

export type DecodeStepData = {
	inputToken: string;
	inputTokenId: number;
	kvSnapshot: {
		keys: number[][][];   // [12 heads, seq_len, 64]
		values: number[][][]; // [12 heads, seq_len, 64]
	};
	attentionOutputs: Record<string, { data: number[][]; dims: number[]; size: number }>;
	topLogits?: [number, number][];  // [[tokenId, logit], ...] top-50 by raw logit
	logits?: number[];
};

export const currentDecodeData = writable<DecodeStepData | null>(null);

export const promptTokenCount = writable<number>(0);

export function resetKVCache() {
	decodeStep.set(0);
	kvCache.set([]);
	currentDecodeData.set(null);
	promptTokenCount.set(0);
}

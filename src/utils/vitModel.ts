/**
 * Toy Vision Transformer (ViT) Implementation
 *
 * This is a simplified ViT that runs entirely in the browser using TypeScript.
 * It uses pre-initialized random weights (seeded for reproducibility) and
 * captures all intermediate tensors needed for visualization.
 *
 * Architecture:
 * - Input: [3, 224, 224] normalized image
 * - Patchify: Split into 14x14 = 196 patches of 16x16x3 = 768 dims each
 * - Patch Embedding: Linear projection from 768 -> hiddenSize
 * - Position Embedding: Learned embeddings for 197 positions (CLS + 196 patches)
 * - Transformer: numLayers blocks of (LayerNorm -> Attention -> LayerNorm -> MLP)
 * - Classification: LayerNorm -> Linear head on CLS token
 */

import { vitConfig } from '~/store/vit';

// =============================================================================
// RANDOM NUMBER GENERATOR (seeded for reproducibility)
// =============================================================================

class SeededRandom {
	private seed: number;

	constructor(seed: number = 42) {
		this.seed = seed;
	}

	// Mulberry32 PRNG
	next(): number {
		let t = (this.seed += 0x6d2b79f5);
		t = Math.imul(t ^ (t >>> 15), t | 1);
		t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	}

	// Generate random number in range [-scale, scale]
	uniform(scale: number = 1): number {
		return (this.next() * 2 - 1) * scale;
	}

	// Generate array of random numbers (Xavier/Glorot initialization)
	glorotUniform(fanIn: number, fanOut: number, size: number): Float32Array {
		const scale = Math.sqrt(6 / (fanIn + fanOut));
		const arr = new Float32Array(size);
		for (let i = 0; i < size; i++) {
			arr[i] = this.uniform(scale);
		}
		return arr;
	}
}

// =============================================================================
// TENSOR OPERATIONS
// =============================================================================

// Matrix multiplication: [M, K] x [K, N] -> [M, N]
function matmul(
	a: Float32Array,
	b: Float32Array,
	M: number,
	K: number,
	N: number
): Float32Array {
	const result = new Float32Array(M * N);
	for (let i = 0; i < M; i++) {
		for (let j = 0; j < N; j++) {
			let sum = 0;
			for (let k = 0; k < K; k++) {
				sum += a[i * K + k] * b[k * N + j];
			}
			result[i * N + j] = sum;
		}
	}
	return result;
}

// Add bias: [M, N] + [N] -> [M, N]
function addBias(x: Float32Array, bias: Float32Array, M: number, N: number): Float32Array {
	const result = new Float32Array(M * N);
	for (let i = 0; i < M; i++) {
		for (let j = 0; j < N; j++) {
			result[i * N + j] = x[i * N + j] + bias[j];
		}
	}
	return result;
}

// Element-wise addition: [M, N] + [M, N] -> [M, N]
function add(a: Float32Array, b: Float32Array): Float32Array {
	const result = new Float32Array(a.length);
	for (let i = 0; i < a.length; i++) {
		result[i] = a[i] + b[i];
	}
	return result;
}

// Layer normalization
function layerNorm(
	x: Float32Array,
	gamma: Float32Array,
	beta: Float32Array,
	numTokens: number,
	hiddenSize: number,
	eps: number = 1e-6
): Float32Array {
	const result = new Float32Array(numTokens * hiddenSize);

	for (let t = 0; t < numTokens; t++) {
		// Compute mean
		let mean = 0;
		for (let h = 0; h < hiddenSize; h++) {
			mean += x[t * hiddenSize + h];
		}
		mean /= hiddenSize;

		// Compute variance
		let variance = 0;
		for (let h = 0; h < hiddenSize; h++) {
			const diff = x[t * hiddenSize + h] - mean;
			variance += diff * diff;
		}
		variance /= hiddenSize;

		// Normalize and scale
		const std = Math.sqrt(variance + eps);
		for (let h = 0; h < hiddenSize; h++) {
			const normalized = (x[t * hiddenSize + h] - mean) / std;
			result[t * hiddenSize + h] = gamma[h] * normalized + beta[h];
		}
	}

	return result;
}

// GELU activation
function gelu(x: Float32Array): Float32Array {
	const result = new Float32Array(x.length);
	for (let i = 0; i < x.length; i++) {
		const v = x[i];
		// Approximate GELU: 0.5 * x * (1 + tanh(sqrt(2/pi) * (x + 0.044715 * x^3)))
		const cdf = 0.5 * (1 + Math.tanh(Math.sqrt(2 / Math.PI) * (v + 0.044715 * v * v * v)));
		result[i] = v * cdf;
	}
	return result;
}

// Softmax over last dimension
function softmax(x: Float32Array, rows: number, cols: number): Float32Array {
	const result = new Float32Array(rows * cols);

	for (let r = 0; r < rows; r++) {
		// Find max for numerical stability
		let maxVal = -Infinity;
		for (let c = 0; c < cols; c++) {
			maxVal = Math.max(maxVal, x[r * cols + c]);
		}

		// Compute exp and sum
		let sum = 0;
		for (let c = 0; c < cols; c++) {
			const exp = Math.exp(x[r * cols + c] - maxVal);
			result[r * cols + c] = exp;
			sum += exp;
		}

		// Normalize
		for (let c = 0; c < cols; c++) {
			result[r * cols + c] /= sum;
		}
	}

	return result;
}

// =============================================================================
// ViT MODEL WEIGHTS
// =============================================================================

interface VitWeights {
	// Patch embedding
	patchEmbed: Float32Array;       // [patchDim, hiddenSize]
	patchBias: Float32Array;        // [hiddenSize]

	// CLS token
	clsToken: Float32Array;         // [hiddenSize]

	// Position embedding
	posEmbed: Float32Array;         // [numTokens, hiddenSize]

	// Per-layer weights
	layers: Array<{
		// Attention
		qkvWeight: Float32Array;      // [hiddenSize, 3 * hiddenSize]
		qkvBias: Float32Array;        // [3 * hiddenSize]
		attnOutWeight: Float32Array;  // [hiddenSize, hiddenSize]
		attnOutBias: Float32Array;    // [hiddenSize]
		attnNormGamma: Float32Array;  // [hiddenSize]
		attnNormBeta: Float32Array;   // [hiddenSize]

		// MLP
		mlpFc1Weight: Float32Array;   // [hiddenSize, mlpSize]
		mlpFc1Bias: Float32Array;     // [mlpSize]
		mlpFc2Weight: Float32Array;   // [mlpSize, hiddenSize]
		mlpFc2Bias: Float32Array;     // [hiddenSize]
		mlpNormGamma: Float32Array;   // [hiddenSize]
		mlpNormBeta: Float32Array;    // [hiddenSize]
	}>;

	// Classification head
	finalNormGamma: Float32Array;   // [hiddenSize]
	finalNormBeta: Float32Array;    // [hiddenSize]
	headWeight: Float32Array;       // [hiddenSize, numClasses]
	headBias: Float32Array;         // [numClasses]
}

let cachedWeights: VitWeights | null = null;

function initializeWeights(): VitWeights {
	if (cachedWeights) return cachedWeights;

	const rng = new SeededRandom(42);
	const { hiddenSize, mlpSize, numLayers, numTokens, patchSize, numClasses } = vitConfig;
	const patchDim = patchSize * patchSize * 3; // 768 for 16x16x3

	const weights: VitWeights = {
		// Patch embedding: project flattened patch to hidden size
		patchEmbed: rng.glorotUniform(patchDim, hiddenSize, patchDim * hiddenSize),
		patchBias: new Float32Array(hiddenSize), // Zero init

		// Learned CLS token
		clsToken: rng.glorotUniform(1, hiddenSize, hiddenSize),

		// Position embeddings (learned)
		posEmbed: rng.glorotUniform(numTokens, hiddenSize, numTokens * hiddenSize),

		layers: [],

		// Final layer norm
		finalNormGamma: new Float32Array(hiddenSize).fill(1),
		finalNormBeta: new Float32Array(hiddenSize),

		// Classification head
		headWeight: rng.glorotUniform(hiddenSize, numClasses, hiddenSize * numClasses),
		headBias: new Float32Array(numClasses)
	};

	// Initialize layer weights
	for (let l = 0; l < numLayers; l++) {
		weights.layers.push({
			// QKV projection (combined for efficiency)
			qkvWeight: rng.glorotUniform(hiddenSize, 3 * hiddenSize, hiddenSize * 3 * hiddenSize),
			qkvBias: new Float32Array(3 * hiddenSize),
			attnOutWeight: rng.glorotUniform(hiddenSize, hiddenSize, hiddenSize * hiddenSize),
			attnOutBias: new Float32Array(hiddenSize),
			attnNormGamma: new Float32Array(hiddenSize).fill(1),
			attnNormBeta: new Float32Array(hiddenSize),

			// MLP
			mlpFc1Weight: rng.glorotUniform(hiddenSize, mlpSize, hiddenSize * mlpSize),
			mlpFc1Bias: new Float32Array(mlpSize),
			mlpFc2Weight: rng.glorotUniform(mlpSize, hiddenSize, mlpSize * hiddenSize),
			mlpFc2Bias: new Float32Array(hiddenSize),
			mlpNormGamma: new Float32Array(hiddenSize).fill(1),
			mlpNormBeta: new Float32Array(hiddenSize)
		});
	}

	cachedWeights = weights;
	return weights;
}

// =============================================================================
// ViT FORWARD PASS
// =============================================================================

export interface VitOutput {
	// Input stage
	patchEmbeddings: Float32Array;
	positionEmbeddings: Float32Array;
	inputEmbeddings: Float32Array;

	// Per-layer outputs
	layerOutputs: Array<{
		queryProj: Float32Array;
		keyProj: Float32Array;
		valueProj: Float32Array;
		attentionWeights: Float32Array;
		attentionOutput: Float32Array;
		mlpHidden: Float32Array;
		mlpOutput: Float32Array;
		output: Float32Array;
	}>;

	// Output stage
	clsOutput: Float32Array;
	logits: Float32Array;
	probabilities: Float32Array;
	predictions: Array<{
		classIdx: number;
		className: string;
		probability: number;
		logit: number;
	}>;
}

/**
 * Run ViT forward pass and capture all intermediate tensors
 * @param imagePixels Normalized image tensor [3, 224, 224] as Float32Array
 */
export function vitForward(imagePixels: Float32Array): VitOutput {
	const weights = initializeWeights();
	const {
		imageSize, patchSize, gridSize, numPatches, numTokens,
		hiddenSize, mlpSize, numLayers, numHeads, headDim, numClasses, classLabels
	} = vitConfig;

	const patchDim = patchSize * patchSize * 3;

	// =========================================================================
	// 1. PATCHIFY: Extract patches from image
	// =========================================================================
	// Image: [3, 224, 224] -> Patches: [196, 768]
	const patches = new Float32Array(numPatches * patchDim);

	for (let py = 0; py < gridSize; py++) {
		for (let px = 0; px < gridSize; px++) {
			const patchIdx = py * gridSize + px;
			const patchOffset = patchIdx * patchDim;

			// Extract patch pixels
			for (let c = 0; c < 3; c++) {
				for (let y = 0; y < patchSize; y++) {
					for (let x = 0; x < patchSize; x++) {
						const imgY = py * patchSize + y;
						const imgX = px * patchSize + x;
						const imgIdx = c * imageSize * imageSize + imgY * imageSize + imgX;
						const patchPixelIdx = c * patchSize * patchSize + y * patchSize + x;
						patches[patchOffset + patchPixelIdx] = imagePixels[imgIdx];
					}
				}
			}
		}
	}

	// =========================================================================
	// 2. PATCH EMBEDDING: Linear projection
	// =========================================================================
	// Patches: [196, 768] x Weight: [768, 192] -> [196, 192]
	let patchEmbeddings = matmul(patches, weights.patchEmbed, numPatches, patchDim, hiddenSize);
	patchEmbeddings = addBias(patchEmbeddings, weights.patchBias, numPatches, hiddenSize);

	// =========================================================================
	// 3. ADD CLS TOKEN AND POSITION EMBEDDINGS
	// =========================================================================
	// Combine CLS token + patch embeddings: [1, 192] + [196, 192] -> [197, 192]
	const tokensWithCls = new Float32Array(numTokens * hiddenSize);

	// Copy CLS token
	for (let h = 0; h < hiddenSize; h++) {
		tokensWithCls[h] = weights.clsToken[h];
	}

	// Copy patch embeddings
	for (let p = 0; p < numPatches; p++) {
		for (let h = 0; h < hiddenSize; h++) {
			tokensWithCls[(p + 1) * hiddenSize + h] = patchEmbeddings[p * hiddenSize + h];
		}
	}

	// Add position embeddings
	const inputEmbeddings = add(tokensWithCls, weights.posEmbed);

	// =========================================================================
	// 4. TRANSFORMER LAYERS
	// =========================================================================
	const layerOutputs: VitOutput['layerOutputs'] = [];
	let x = inputEmbeddings;

	for (let l = 0; l < numLayers; l++) {
		const layer = weights.layers[l];

		// ----- Pre-norm for attention -----
		const attnInput = layerNorm(x, layer.attnNormGamma, layer.attnNormBeta, numTokens, hiddenSize);

		// ----- QKV Projection -----
		// [197, 192] x [192, 576] -> [197, 576]
		let qkv = matmul(attnInput, layer.qkvWeight, numTokens, hiddenSize, 3 * hiddenSize);
		qkv = addBias(qkv, layer.qkvBias, numTokens, 3 * hiddenSize);

		// Split into Q, K, V
		const queryProj = new Float32Array(numTokens * hiddenSize);
		const keyProj = new Float32Array(numTokens * hiddenSize);
		const valueProj = new Float32Array(numTokens * hiddenSize);

		for (let t = 0; t < numTokens; t++) {
			for (let h = 0; h < hiddenSize; h++) {
				queryProj[t * hiddenSize + h] = qkv[t * 3 * hiddenSize + h];
				keyProj[t * hiddenSize + h] = qkv[t * 3 * hiddenSize + hiddenSize + h];
				valueProj[t * hiddenSize + h] = qkv[t * 3 * hiddenSize + 2 * hiddenSize + h];
			}
		}

		// ----- Multi-Head Attention -----
		// Reshape to [numHeads, numTokens, headDim] and compute attention
		const attentionWeights = new Float32Array(numHeads * numTokens * numTokens);
		const attnValues = new Float32Array(numTokens * hiddenSize);

		for (let head = 0; head < numHeads; head++) {
			const headOffset = head * headDim;

			// Compute attention scores: Q @ K^T / sqrt(headDim)
			const scale = 1 / Math.sqrt(headDim);

			for (let i = 0; i < numTokens; i++) {
				for (let j = 0; j < numTokens; j++) {
					let score = 0;
					for (let d = 0; d < headDim; d++) {
						score += queryProj[i * hiddenSize + headOffset + d] *
						         keyProj[j * hiddenSize + headOffset + d];
					}
					attentionWeights[head * numTokens * numTokens + i * numTokens + j] = score * scale;
				}
			}

			// Softmax per query
			for (let i = 0; i < numTokens; i++) {
				let maxVal = -Infinity;
				for (let j = 0; j < numTokens; j++) {
					maxVal = Math.max(maxVal, attentionWeights[head * numTokens * numTokens + i * numTokens + j]);
				}

				let sum = 0;
				for (let j = 0; j < numTokens; j++) {
					const exp = Math.exp(attentionWeights[head * numTokens * numTokens + i * numTokens + j] - maxVal);
					attentionWeights[head * numTokens * numTokens + i * numTokens + j] = exp;
					sum += exp;
				}

				for (let j = 0; j < numTokens; j++) {
					attentionWeights[head * numTokens * numTokens + i * numTokens + j] /= sum;
				}
			}

			// Apply attention to values
			for (let i = 0; i < numTokens; i++) {
				for (let d = 0; d < headDim; d++) {
					let val = 0;
					for (let j = 0; j < numTokens; j++) {
						val += attentionWeights[head * numTokens * numTokens + i * numTokens + j] *
						       valueProj[j * hiddenSize + headOffset + d];
					}
					attnValues[i * hiddenSize + headOffset + d] = val;
				}
			}
		}

		// ----- Output Projection -----
		let attentionOutput = matmul(attnValues, layer.attnOutWeight, numTokens, hiddenSize, hiddenSize);
		attentionOutput = addBias(attentionOutput, layer.attnOutBias, numTokens, hiddenSize);

		// ----- Residual Connection -----
		const afterAttn = add(x, attentionOutput);

		// ----- Pre-norm for MLP -----
		const mlpInput = layerNorm(afterAttn, layer.mlpNormGamma, layer.mlpNormBeta, numTokens, hiddenSize);

		// ----- MLP -----
		// FC1: [197, 192] x [192, 768] -> [197, 768]
		let mlpHidden = matmul(mlpInput, layer.mlpFc1Weight, numTokens, hiddenSize, mlpSize);
		mlpHidden = addBias(mlpHidden, layer.mlpFc1Bias, numTokens, mlpSize);
		mlpHidden = gelu(mlpHidden);

		// FC2: [197, 768] x [768, 192] -> [197, 192]
		let mlpOutput = matmul(mlpHidden, layer.mlpFc2Weight, numTokens, mlpSize, hiddenSize);
		mlpOutput = addBias(mlpOutput, layer.mlpFc2Bias, numTokens, hiddenSize);

		// ----- Residual Connection -----
		x = add(afterAttn, mlpOutput);

		// Store layer outputs
		layerOutputs.push({
			queryProj: queryProj.slice(),
			keyProj: keyProj.slice(),
			valueProj: valueProj.slice(),
			attentionWeights: attentionWeights.slice(),
			attentionOutput: attentionOutput.slice(),
			mlpHidden: mlpHidden.slice(),
			mlpOutput: mlpOutput.slice(),
			output: x.slice()
		});
	}

	// =========================================================================
	// 5. CLASSIFICATION HEAD
	// =========================================================================
	// Extract CLS token: [hiddenSize]
	const clsOutput = new Float32Array(hiddenSize);
	for (let h = 0; h < hiddenSize; h++) {
		clsOutput[h] = x[h];
	}

	// Final layer norm
	const clsNormed = layerNorm(
		clsOutput,
		weights.finalNormGamma,
		weights.finalNormBeta,
		1,
		hiddenSize
	);

	// Classification: [1, 192] x [192, 10] -> [1, 10]
	let logits = matmul(clsNormed, weights.headWeight, 1, hiddenSize, numClasses);
	logits = addBias(logits, weights.headBias, 1, numClasses);

	// Softmax for probabilities
	const probabilities = softmax(logits, 1, numClasses);

	// Create sorted predictions
	const predictions: VitOutput['predictions'] = [];
	for (let i = 0; i < numClasses; i++) {
		predictions.push({
			classIdx: i,
			className: classLabels[i],
			probability: probabilities[i],
			logit: logits[i]
		});
	}
	predictions.sort((a, b) => b.probability - a.probability);

	return {
		patchEmbeddings,
		positionEmbeddings: weights.posEmbed.slice(),
		inputEmbeddings,
		layerOutputs,
		clsOutput,
		logits,
		probabilities,
		predictions
	};
}

// =============================================================================
// IMAGE PREPROCESSING
// =============================================================================

/**
 * Load and preprocess image for ViT
 * - Resize to 224x224
 * - Normalize to [-1, 1] or ImageNet normalization
 * - Convert to [3, H, W] tensor format
 */
export async function preprocessImage(
	source: string | HTMLImageElement | HTMLCanvasElement
): Promise<{ pixels: Float32Array; canvas: HTMLCanvasElement }> {
	const { imageSize } = vitConfig;

	// Create canvas for preprocessing
	const canvas = document.createElement('canvas');
	canvas.width = imageSize;
	canvas.height = imageSize;
	const ctx = canvas.getContext('2d')!;

	// Load image if string
	let img: HTMLImageElement | HTMLCanvasElement;
	if (typeof source === 'string') {
		img = await new Promise<HTMLImageElement>((resolve, reject) => {
			const image = new Image();
			image.crossOrigin = 'anonymous';
			image.onload = () => resolve(image);
			image.onerror = reject;
			image.src = source;
		});
	} else {
		img = source;
	}

	// Draw and resize to 224x224 (center crop if needed)
	const srcAspect = img.width / img.height;
	let sx = 0, sy = 0, sw = img.width, sh = img.height;

	if (srcAspect > 1) {
		// Wider than tall - crop sides
		sw = img.height;
		sx = (img.width - sw) / 2;
	} else if (srcAspect < 1) {
		// Taller than wide - crop top/bottom
		sh = img.width;
		sy = (img.height - sh) / 2;
	}

	ctx.drawImage(img, sx, sy, sw, sh, 0, 0, imageSize, imageSize);

	// Get pixel data
	const imageData = ctx.getImageData(0, 0, imageSize, imageSize);
	const data = imageData.data;

	// Convert to [3, H, W] normalized tensor
	// Using simple [-1, 1] normalization
	const pixels = new Float32Array(3 * imageSize * imageSize);

	for (let y = 0; y < imageSize; y++) {
		for (let x = 0; x < imageSize; x++) {
			const pixelIdx = (y * imageSize + x) * 4;
			const r = data[pixelIdx] / 255 * 2 - 1;     // Normalize to [-1, 1]
			const g = data[pixelIdx + 1] / 255 * 2 - 1;
			const b = data[pixelIdx + 2] / 255 * 2 - 1;

			// Store in [C, H, W] format
			pixels[0 * imageSize * imageSize + y * imageSize + x] = r;
			pixels[1 * imageSize * imageSize + y * imageSize + x] = g;
			pixels[2 * imageSize * imageSize + y * imageSize + x] = b;
		}
	}

	return { pixels, canvas };
}

/**
 * Run full inference pipeline
 */
export async function runVitInference(imageSource: string): Promise<VitOutput> {
	const { pixels } = await preprocessImage(imageSource);
	return vitForward(pixels);
}

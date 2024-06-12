export function applyTemperatureToData(data: Prediction = [], temperature: number): Prediction {
	const adjustedLogits = data.map((d) => d.logit / temperature);

	const adjustedExps = adjustedLogits.map((d) => Math.exp(d));
	const sumExpValues = adjustedExps.reduce((sum, value) => sum + value, 0);

	const finalData = data.map((d, i) => ({
		...d,
		adjustedLogit: adjustedLogits[i],
		adjustedProbability: adjustedExps[i] / sumExpValues,
		adjustedExp: adjustedExps[i]
	}));

	return finalData;
}

export function sampleToken(data: Prediction) {
	const cumulativeProbabilities = [];
	let cumulativeSum = 0;

	for (const token of data) {
		cumulativeSum += token.probability;
		cumulativeProbabilities.push(cumulativeSum);
	}

	const randomValue = Math.random();
	for (let i = 0; i < cumulativeProbabilities.length; i++) {
		if (randomValue < cumulativeProbabilities[i]) {
			return data[i];
		}
	}

	return data[0];
}

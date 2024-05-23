export function applyTemperatureToData(data, temperature) {
		const adjustedLogits = data.map((d) => d.logit / temperature);

		const expValues = adjustedLogits.map((d) => Math.exp(d));
		const sumExpValues = expValues.reduce((sum, value) => sum + value, 0);

		const finalData = data.map((d, i) => ({
			...d,
			logit: adjustedLogits[i],
			probability: expValues[i] / sumExpValues
		}));

		return finalData;
	}

export function sampleTokenIndex(data) {
    let cumulativeProbabilities = [];
    let cumulativeSum = 0;

    for (let token of data) {
      cumulativeSum += token.probability;
      cumulativeProbabilities.push(cumulativeSum);
    }

    const randomValue = Math.random();
    for (let i = 0; i < cumulativeProbabilities.length; i++) {
      if (randomValue < cumulativeProbabilities[i]) {
        return i;
      }
    }
  }

export function sampleToken(data) {
    const index = sampleTokenIndex(data);
    return data[index].token;
  }
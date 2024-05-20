export const findArrayDepth = (arr: any) =>
	Array.isArray(arr) ? 1 + arr.reduce((max, item) => Math.max(max, findArrayDepth(item)), 0) : 0;

export const splitArray = (doubleArray: number[][], x: number) => {
	const splitArrays = doubleArray.map((subArray) => {
		const length = Math.ceil(subArray.length / x);
		return Array.from({ length: x }, (_, i) => subArray.slice(i * length, i * length + length));
	});

	return Array.from({ length: x }, (_, index) =>
		splitArrays.map((subArray) => subArray[index] || [])
	);
};

export const mask = (data) => {
	return data.map((array, index) => {
		let newArray = new Array(array.length).fill(null);
		for (let i = 0; i <= index && i < array.length; i++) {
			newArray[i] = array[i];
		}
		return newArray;
	});
};

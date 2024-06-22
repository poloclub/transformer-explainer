const CACHE_NAME = 'onnx-model-cache-v1';

async function fetchModelChunks(chunkUrls) {
	const cache = await caches.open(CACHE_NAME);
	const cachedResponses = await Promise.all(chunkUrls.map((url) => cache.match(url)));

	// add cache
	const fetchPromises = chunkUrls.map((url, index) => {
		if (!cachedResponses[index]) {
			// console.log(`Fetching and caching: ${url}`);
			return fetch(url).then((response) => {
				if (response.ok) {
					cache.put(url, response.clone());
					return response.arrayBuffer();
				} else {
					throw new Error(`Failed to fetch ${url}`);
				}
			});
		} else {
			// console.log(`Using cached version: ${url}`);
			return cachedResponses[index].arrayBuffer();
		}
	});

	const modelBuffers = await Promise.all(fetchPromises);
	return modelBuffers;
}

export async function fetchAndMergeChunks(urls) {
	const chunks = await fetchModelChunks(urls);
	const totalSize = chunks.reduce((acc, chunk) => acc + chunk.byteLength, 0);
	const mergedArray = new Uint8Array(totalSize);
	let offset = 0;
	for (const chunk of chunks) {
		mergedArray.set(new Uint8Array(chunk), offset);
		offset += chunk.byteLength;
	}
	return mergedArray.buffer;
}

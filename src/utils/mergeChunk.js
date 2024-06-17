async function fetchChunk(url) {
	const response = await fetch(url);
	if (!response.ok) {
		throw new Error(`Failed to fetch ${url}`);
	}
	return response.arrayBuffer();
}

export async function mergeChunks(urls) {
	const chunks = await Promise.all(urls.map((url) => fetchChunk(url)));
	const totalSize = chunks.reduce((acc, chunk) => acc + chunk.byteLength, 0);
	const mergedArray = new Uint8Array(totalSize);
	let offset = 0;
	for (const chunk of chunks) {
		mergedArray.set(new Uint8Array(chunk), offset);
		offset += chunk.byteLength;
	}
	return mergedArray.buffer;
}

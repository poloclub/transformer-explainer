import { readdir } from 'fs/promises';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { writeFile } from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = join(__filename, '..');

const directoryPath = join(__dirname, '../../static/params_output');
const baseUrl = '/params_output/';

const outputFilePath = join(__dirname, 'externalData.json');

// https://onnxruntime.ai/docs/tutorials/web/large-models.html#load-the-model-with-external-data-in-onnx-runtime-web
try {
	const files = await readdir(directoryPath);
	const fileData = files.map((file) => ({
		data: `${baseUrl}${file}`,
		path: `./${file}`
	}));
	await writeFile(outputFilePath, JSON.stringify(fileData, null, 2));
} catch (err) {
	console.error(err);
}

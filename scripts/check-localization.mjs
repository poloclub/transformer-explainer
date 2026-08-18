import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourceRoots = ['src/components', 'src/routes'];
const terminologySource = fs.readFileSync(
	path.join(root, 'src/locales/zh-CN/terminology.ts'),
	'utf8'
);
const allowedTerms = [...terminologySource.matchAll(/^\s*'([^']+)',?$/gm)]
	.map((match) => match[1])
	.sort((a, b) => b.length - a.length);

const allowedNames =
	/^(Aeree Cho|Grace C\. Kim|Alexander Karpekov|Alec Helbling|Jay Wang|Zijie J\. Wang|Seongmin Lee|Benjamin Hoover|Minsuk Kahng|Polo Chau|Duen Horng Chau|Georgia Institute of Technology)$/;

function walk(directory) {
	return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
		const fullPath = path.join(directory, entry.name);
		if (entry.isDirectory()) return walk(fullPath);
		if (entry.isFile() && entry.name.endsWith('.svelte') && !entry.name.endsWith('.svelte.bak')) {
			return [fullPath];
		}
		return [];
	});
}

function stripAllowedTerms(value) {
	let remaining = value;
	for (const term of allowedTerms) {
		const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
		remaining = remaining.replace(new RegExp(escapedTerm, 'gi'), '');
	}
	return remaining
		.replace(/https?:\/\/\S+/g, '')
		.replace(/&[a-z]+;/gi, '')
		.replace(/[\d\s.,:;!?()[\]{}"'“”‘’/\\+×·—–-]/g, '');
}

function shouldReport(value) {
	const text = value.replace(/\s+/g, ' ').trim();
	if (
		!/[A-Za-z]{2,}/.test(text) ||
		/[\u3400-\u9fff]/.test(text) ||
		allowedNames.test(text) ||
		/^\["Data", " visualization", " em", "powers", " users", " to"\]$/.test(text)
	) {
		return false;
	}
	return /[A-Za-z]{2,}/.test(stripAllowedTerms(text));
}

const findings = [];
for (const sourceRoot of sourceRoots) {
	for (const file of walk(path.join(root, sourceRoot))) {
		const relativePath = path.relative(root, file).replaceAll('\\', '/');
		const source = fs
			.readFileSync(file, 'utf8')
			.replace(/<!--[\s\S]*?-->/g, '')
			.replace(/<script[\s\S]*?<\/script>/g, '')
			.replace(/<style[\s\S]*?<\/style>/g, '');
		const candidatePatterns = [
			/(?:placeholder|title|aria-label|alt)="([^"]+)"/g,
			/>([^<>{}]+)</g
		];

		for (const pattern of candidatePatterns) {
			for (const match of source.matchAll(pattern)) {
				const candidate = match[1];
				if (shouldReport(candidate)) {
					const lineNumber = source.slice(0, match.index).split(/\r?\n/).length;
					findings.push(`${relativePath}:${lineNumber}  ${candidate.replace(/\s+/g, ' ').trim()}`);
				}
			}
		}
	}
}

if (findings.length > 0) {
	console.error('发现需要人工审核的纯英文界面文案：');
	console.error(findings.join('\n'));
	process.exitCode = 1;
} else {
	console.log(`汉化检查通过：已扫描 ${sourceRoots.join('、')}，未发现未审核的纯英文界面文案。`);
}

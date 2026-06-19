import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();

function read(path) {
	return readFileSync(join(root, path), 'utf8');
}

function assertIncludes(path, expected) {
	const content = read(path);
	if (!content.includes(expected)) {
		throw new Error(`${path} should include: ${expected}`);
	}
}

function assertExcludes(path, banned) {
	const content = read(path);
	if (content.includes(banned)) {
		throw new Error(`${path} should not include original English copy: ${banned}`);
	}
}

assertIncludes('src/app.html', '<html lang="zh-CN">');
assertIncludes('src/app.html', 'Transformer Explainer：可视化理解 LLM Transformer 模型');
assertExcludes('src/app.html', 'LLM Transformer Model Visually Explained');

assertIncludes('src/utils/i18n.ts', '多层感知机（MLP, Multi-Layer Perceptron）');
assertIncludes('src/utils/i18n.ts', '词元（Token）');
assertIncludes('src/utils/i18n.ts', '自注意力（Self-Attention）');

assertIncludes('src/components/InputForm.svelte', '生成');
assertIncludes('src/components/InputForm.svelte', '示例');
assertIncludes('src/components/InputForm.svelte', '输入你自己的英文提示词');
assertExcludes('src/components/InputForm.svelte', 'Test your own input text');
assertExcludes('src/components/InputForm.svelte', 'Generate');

assertIncludes('src/components/Embedding.svelte', 'Embedding');
assertIncludes('src/components/Embedding.svelte', 'Tokenization');
assertIncludes('src/components/Embedding.svelte', 'Token Embedding');
assertIncludes('src/components/Attention.svelte', '多头自注意力');
assertIncludes('src/components/LinearSoftmax.svelte', '输出概率');
assertIncludes('src/components/SubsequentBlocks.svelte', '个相同的');
assertIncludes('src/components/Operation.svelte', 'Layer Normalization');

const textbook = read('src/utils/textbookPages.ts');
for (const expected of [
	"title: '什么是 Transformer？'",
	"title: 'Transformer 如何工作？'",
	"title: 'Transformer 架构'",
	"title: 'Embedding'",
	"title: 'Token Embedding'",
	"title: 'Positional Encoding'",
	"title: '重复堆叠的 Transformer Blocks'",
	"title: '多头自注意力（Multi-Head Self-Attention）'",
	"title: 'Query、Key、Value'",
	"title: 'Multi-head'",
	"title: 'Masked Self-Attention'",
	"title: 'Attention 输出与拼接'",
	"title: 'MLP（Multi-Layer Perceptron）'",
	"title: '输出 Logit'",
	"title: '输出概率'",
	"title: 'Temperature'",
	"title: 'Sampling 策略'",
	"title: '残差连接（Residual Connection）'",
	"title: 'Layer Normalization'",
	"title: 'Dropout'"
]) {
	if (!textbook.includes(expected)) {
		throw new Error(`src/utils/textbookPages.ts should include: ${expected}`);
	}
}

assertExcludes('src/utils/textbookPages.ts', 'What is Transformer?');
assertExcludes('src/utils/textbookPages.ts', 'How Transformers Work?');
assertExcludes('src/utils/textbookPages.ts', 'Transformer Architecture');
assertExcludes('src/utils/textbookPages.ts', "Transformers aren't magic");
assertExcludes('src/utils/textbookPages.ts', 'What is the most probable next word');

for (const expected of [
	'<h1>什么是 Transformer？</h1>',
	'<h1>Transformer 架构</h1>',
	'<h2>Embedding</h2>',
	'<h2>Transformer Block</h2>',
	'<h3>Multi-Head Self-Attention</h3>',
	'<h3>MLP：Multi-Layer Perceptron</h3>',
	'<h2>输出概率</h2>',
	'<h2>辅助架构特性</h2>',
	'<h1>交互功能</h1>',
	'<h2>视频教程</h2>',
	'<h2>Transformer Explainer 是如何实现的？</h2>',
	'<h2>谁开发了 Transformer Explainer？</h2>'
]) {
	assertIncludes('src/components/article/Article.svelte', expected);
}

assertExcludes('src/components/article/Article.svelte', '<h1>What is a Transformer?</h1>');
assertExcludes('src/components/article/Article.svelte', '<h1>Interactive Features</h1>');
assertExcludes('src/components/article/Article.svelte', '<h2>Output Probabilities</h2>');
assertExcludes('src/components/article/Article.svelte', 'and even');
assertExcludes('src/components/article/Article.svelte', 'This expansion step allows');
assertExcludes('src/components/article/Article.svelte', 'Transformer Explainer was created by');

console.log('Localization checks passed.');

# Chinese Localization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Chinese-first version of Transformer Explainer with professional English terminology preserved where useful.

**Architecture:** Add a small static localization module for short reusable UI labels and glossary terms, while translating rich article/tutorial HTML in place to avoid risky Svelte restructuring. Add a lightweight Node-based localization check that grows with each task and guards against accidental regression to the original English UI copy.

**Tech Stack:** SvelteKit, Svelte 5, TypeScript, Node.js scripts, existing `~` alias from `svelte.config.js`.

---

## File Structure

- Modify `package.json` and `package-lock.json`: restore a buildable baseline by aligning Vite with `@sveltejs/vite-plugin-svelte`.
- Create `src/utils/i18n.ts`: Chinese UI strings and glossary constants for short labels reused by Svelte components.
- Create `scripts/check-localization.mjs`: static text assertions for required Chinese strings and banned original English strings.
- Modify `package.json`: add `localization:check`.
- Modify `src/app.html`: set `lang="zh-CN"` and Chinese title/meta descriptions.
- Modify core UI components:
  - `src/components/InputForm.svelte`
  - `src/components/Topbar.svelte`
  - `src/components/Header.svelte`
  - `src/components/Sampling.svelte`
  - `src/components/Temperature.svelte`
  - `src/components/Embedding.svelte`
  - `src/components/Attention.svelte`
  - `src/components/AttentionMatrix.svelte`
  - `src/components/BlockTransition.svelte`
  - `src/components/HeadStack.svelte`
  - `src/components/LinearSoftmax.svelte`
  - `src/components/Mlp.svelte`
  - `src/components/Operation.svelte`
  - `src/components/SubsequentBlocks.svelte`
  - selected `src/components/Popovers/*.svelte`
- Modify `src/utils/textbookPages.ts`: translate guided tutorial cards while preserving `id`, selectors, and analytics event names.
- Modify `src/components/article/Article.svelte`: translate long explanatory article while preserving links, formulas, component imports, classes, and IDs.

## Task 0: Restore Build Baseline

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`

- [ ] **Step 1: Verify the current build fails from dependency incompatibility**

Run: `PATH=/Users/jiangxu/.nvm/versions/node/v22.14.0/bin:$PATH npm run build`

Expected: FAIL with `Cannot read properties of undefined (reading 'config')` from `@sveltejs/vite-plugin-svelte`.

- [ ] **Step 2: Update Vite to the lowest compatible major range**

Run:

```bash
PATH=/Users/jiangxu/.nvm/versions/node/v22.14.0/bin:$PATH npm install vite@^6.3.0 --save-dev --legacy-peer-deps --registry=https://registry.npmjs.org
```

Expected: `package.json` changes `vite` from `^5.4.21` to `^6.3.0`, and `package-lock.json` resolves a Vite 6 release compatible with `@sveltejs/vite-plugin-svelte@6.2.4`.

- [ ] **Step 3: Verify package install consistency**

Run:

```bash
PATH=/Users/jiangxu/.nvm/versions/node/v22.14.0/bin:$PATH npm ci --legacy-peer-deps --registry=https://registry.npmjs.org
```

Expected: install completes successfully.

- [ ] **Step 4: Verify build baseline**

Run: `PATH=/Users/jiangxu/.nvm/versions/node/v22.14.0/bin:$PATH npm run build`

Expected: PASS or, if unrelated pre-existing Svelte/TypeScript errors remain, the Vite plugin `reading 'config'` crash must be gone and the new failure must be documented.

- [ ] **Step 5: Commit**

Run:

```bash
git add --sparse package.json package-lock.json
git commit -m "fix: align vite with svelte plugin"
```

## Task 1: Localization Guard And Metadata

**Files:**
- Create: `src/utils/i18n.ts`
- Create: `scripts/check-localization.mjs`
- Modify: `package.json`
- Modify: `src/app.html`

- [ ] **Step 1: Write the failing localization check**

Create `scripts/check-localization.mjs` with this content:

```js
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

console.log('Localization checks passed.');
```

- [ ] **Step 2: Run the check and verify it fails**

Run: `node scripts/check-localization.mjs`

Expected: FAIL with an error that `src/app.html` does not include `<html lang="zh-CN">` or that `src/utils/i18n.ts` does not exist.

- [ ] **Step 3: Add the localization module**

Create `src/utils/i18n.ts`:

```ts
export const zhCN = {
	app: {
		title: 'Transformer Explainer：可视化理解 LLM Transformer 模型',
		description:
			'一个交互式可视化工具，帮助你理解 GPT 等大语言模型（LLM）中的 Transformer 模型如何工作。'
	},
	controls: {
		examples: '示例',
		generate: '生成',
		inputPlaceholder: '输入你自己的英文提示词',
		mobileExampleOnly: '请先试试示例。自定义输入建议在桌面端使用。',
		modelDownloading: 'GPT-2 模型正在下载（600MB），你可以先试试示例。',
		wordLimit: (limit: number) => `最多可输入 ${limit} 个英文单词。`,
		temperature: 'Temperature',
		sampling: 'Sampling'
	},
	glossary: {
		token: '词元（Token）',
		selfAttention: '自注意力（Self-Attention）',
		multiHeadSelfAttention: '多头自注意力（Multi-Head Self-Attention）',
		mlp: '多层感知机（MLP, Multi-Layer Perceptron）',
		transformerBlock: 'Transformer Block',
		positionalEncoding: '位置编码（Positional Encoding）',
		tokenEmbedding: '词元嵌入（Token Embedding）',
		outputProbabilities: '输出概率（Output Probabilities）'
	}
} as const;
```

- [ ] **Step 4: Translate app metadata**

Change `src/app.html`:

```html
<html lang="zh-CN">
```

Use this title everywhere title content appears:

```html
Transformer Explainer：可视化理解 LLM Transformer 模型
```

Use this description everywhere description content appears:

```html
一个交互式可视化工具，帮助你理解 GPT 等大语言模型（LLM）中的 Transformer 模型如何工作。
```

- [ ] **Step 5: Add the npm script**

Modify `package.json` scripts:

```json
"localization:check": "node scripts/check-localization.mjs"
```

- [ ] **Step 6: Run the check and verify it passes**

Run: `npm run localization:check`

Expected: PASS with `Localization checks passed.`

- [ ] **Step 7: Commit**

Run:

```bash
git add --sparse src/utils/i18n.ts scripts/check-localization.mjs package.json src/app.html
git commit -m "test: add chinese localization guard"
```

## Task 2: Core UI And Visualization Labels

**Files:**
- Modify: `scripts/check-localization.mjs`
- Modify: core UI component files listed in File Structure

- [ ] **Step 1: Extend the failing check for core UI**

Append these assertions to `scripts/check-localization.mjs` before the final `console.log`:

```js
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
```

- [ ] **Step 2: Run the check and verify it fails**

Run: `npm run localization:check`

Expected: FAIL on `InputForm.svelte` or another core UI assertion because the old English labels are still present.

- [ ] **Step 3: Import reusable strings where it helps**

In `src/components/InputForm.svelte`, add:

```ts
import { zhCN } from '~/utils/i18n';
```

Replace visible strings:

```svelte
{zhCN.controls.examples}
placeholder={zhCN.controls.inputPlaceholder}
{zhCN.controls.generate}
{zhCN.controls.mobileExampleOnly}
{zhCN.controls.modelDownloading}
{zhCN.controls.wordLimit(wordLimit)}
```

- [ ] **Step 4: Translate compact component labels**

Use these exact label choices:

```text
Topbar logo: Transformer Explainer
Header link: Transformer Explainer
Temperature control label: Temperature
Sampling control label: Sampling
Embedding title: Embedding
Tokenization label: Tokenization
Token Embedding label: Token Embedding
Positional Encoding label: Positional Encoding
Multi-head Self Attention title: 多头自注意力
Subsequent blocks guide: {count} 个相同的 Transformer Blocks
Probabilities title: 输出概率
Tokens: Tokens
Scaled logits: 缩放后的 logits
Dot product: 点积（Dot Product）
Scaling · Mask: 缩放 · Mask
Softmax: Softmax
Normalization: 归一化（Normalization）
```

Keep `Q`, `K`, `V`, `Query`, `Key`, `Value`, `Out`, `Softmax`, `MLP`, `GeLU`, `Dropout`, `Layer Normalization`, and `Residual` where labels are too narrow or already standard technical labels.

- [ ] **Step 5: Run checks**

Run: `npm run localization:check`

Expected: PASS.

Run: `npm run check`

Expected: PASS with no Svelte or TypeScript errors.

- [ ] **Step 6: Commit**

Run:

```bash
git add --sparse scripts/check-localization.mjs src/components src/utils/i18n.ts
git commit -m "feat: localize core interface labels"
```

## Task 3: Guided Textbook Cards

**Files:**
- Modify: `scripts/check-localization.mjs`
- Modify: `src/utils/textbookPages.ts`

- [ ] **Step 1: Extend the failing check for textbook cards**

Append:

```js
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
```

- [ ] **Step 2: Run the check and verify it fails**

Run: `npm run localization:check`

Expected: FAIL on the first missing Chinese textbook title.

- [ ] **Step 3: Translate textbook titles and contents**

Translate each `title` exactly as listed in Step 1. Translate each `content` HTML string into Chinese while preserving:

```ts
id: 'existing-id'
on: () => {}
out: () => {}
complete: () => {}
highlightElements([...])
expandedBlock.set({ id: '...' })
window.dataLayer?.push(...)
```

Use these recurring terminology forms in the card bodies:

```text
Transformer
GPT-2（small）
词元（Token）
Tokenization
Token Embedding
Positional Encoding
Multi-Head Self-Attention
Query、Key、Value
Masked Self-Attention
Attention scores
Softmax
MLP（Multi-Layer Perceptron）
logits
Temperature
top-k
top-p
Residual Connection
Layer Normalization
Dropout
```

- [ ] **Step 4: Run checks**

Run: `npm run localization:check`

Expected: PASS.

Run: `npm run check`

Expected: PASS.

- [ ] **Step 5: Commit**

Run:

```bash
git add --sparse scripts/check-localization.mjs src/utils/textbookPages.ts
git commit -m "feat: localize guided textbook"
```

## Task 4: Long Article

**Files:**
- Modify: `scripts/check-localization.mjs`
- Modify: `src/components/article/Article.svelte`

- [ ] **Step 1: Extend the failing check for the long article**

Append:

```js
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
```

- [ ] **Step 2: Run the check and verify it fails**

Run: `npm run localization:check`

Expected: FAIL on `<h1>什么是 Transformer？</h1>`.

- [ ] **Step 3: Translate the article**

Translate visible prose, list items, headings, and captions in `Article.svelte`. Preserve all of these exactly:

```svelte
<script>
	import tailwindConfig from '../../../tailwind.config';
	import resolveConfig from 'tailwindcss/resolveConfig';
	import Katex from '~/utils/Katex.svelte';
</script>
```

Preserve all `href`, `target`, `title`, `id`, `data-click`, `class`, `Katex math={...}`, image paths, and code examples. Translate text around inline code and links. Keep library names, model names, author names, paper title `"Attention is All You Need"`, and project name `Transformer Explainer` in English.

- [ ] **Step 4: Run checks**

Run: `npm run localization:check`

Expected: PASS.

Run: `npm run check`

Expected: PASS.

- [ ] **Step 5: Commit**

Run:

```bash
git add --sparse scripts/check-localization.mjs src/components/article/Article.svelte
git commit -m "feat: localize explanatory article"
```

## Task 5: Final Verification

**Files:**
- No production file changes expected unless verification reveals a concrete issue.

- [ ] **Step 1: Run static localization check**

Run: `npm run localization:check`

Expected: PASS.

- [ ] **Step 2: Run Svelte/TypeScript check**

Run: `npm run check`

Expected: PASS.

- [ ] **Step 3: Run production build**

Run: `npm run build`

Expected: PASS and output written to `build/`.

- [ ] **Step 4: Start local dev server**

Run: `npm run dev -- --host 127.0.0.1`

Expected: Vite prints a local URL such as `http://127.0.0.1:5173/`.

- [ ] **Step 5: Browser smoke check**

Open the local URL and verify:

```text
The metadata title is Chinese.
The input controls show 示例 and 生成.
The tutorial card titles are Chinese.
The article headings are Chinese.
Narrow labels such as Q/K/V/MLP/Softmax remain readable.
No obvious text overlaps appear in the first viewport.
```

- [ ] **Step 6: Commit final fixes if any**

If Step 5 required fixes, run:

```bash
git add --sparse src scripts package.json
git commit -m "fix: polish chinese localization"
```

If no fixes were required, do not create an empty commit.

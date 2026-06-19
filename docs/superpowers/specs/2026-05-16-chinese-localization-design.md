# Transformer Explainer 中文汉化设计

## 背景

本项目是 `poloclub/transformer-explainer` 的 fork，当前页面文案以英文为主。目标是面向中文技术读者提供中文界面和中文讲解，同时保留关键技术术语的英文表达，避免翻译后失去专业语境或与模型可视化标签脱节。

仓库是 SvelteKit 应用。主要英文来源包括：

- `src/components/article/Article.svelte`：页面下方长文章正文。
- `src/utils/textbookPages.ts`：交互式教程卡片标题与内容。
- `src/components/*.svelte`：按钮、控件、图表短标签、popover 标签、提示语。
- `src/store/index.ts`：示例 prompt 文本。
- `src/app.html`：页面标题、meta 描述和分享文案。

## 用户需求

中文应自然、清楚，适合技术专业读者。专业术语可保留英文；缩写或重要术语首次出现时，需要给出英文全称或中英解释。例如 RAG 应写作「检索增强生成（Retrieval-Augmented Generation, RAG）」。

## 推荐方案

采用「中文静态汉化 + 术语英文保留」方案。

不实现完整语言切换系统。当前 fork 的目标是中文版本，完整 i18n 会增加额外运行时状态、切换 UI 和维护成本。也不完全原地硬改所有文案；短文案应尽量集中在中文文案文件或术语文件中，长文章和富文本教程可以在原组件/数据结构中翻译，以减少 Svelte 富文本重构风险。

## 翻译规则

1. UI 操作文案使用中文，例如「生成」「示例」「试试示例」「最多可输入 12 个英文单词」。
2. 专业术语保留英文或中英并列，例如「词元（Token）」「自注意力（Self-Attention）」「多层感知机（MLP, Multi-Layer Perceptron）」。
3. 图表中的极短标签优先保持可读和不换行。`Q`、`K`、`V`、`MLP`、`Softmax` 等短标签可保留英文；标题和教程正文给出中文解释。
4. 缩写首次出现时补充英文全称。之后可直接使用缩写或英文术语。
5. 链接、论文标题、模型名、作者名、库名保持原文。
6. 示例 prompt 暂时保留英文。GPT-2 tokenizer、缓存示例数据和模型输出都围绕英文 prompt 工作，直接改成中文会让演示行为和缓存数据不匹配。

## 实现范围

需要汉化：

- `src/app.html` 的页面标题和 meta 文案。
- `src/components/InputForm.svelte` 的按钮、占位符、helper 文案。
- `src/components/Topbar.svelte` 和 `src/components/Header.svelte` 的可见标题或链接文本。
- `src/components/Sampling.svelte`、`src/components/Temperature.svelte` 的控件标题和说明。
- 主要可视化组件中的阶段名、矩阵标签、popover 标题和公式辅助文字。
- `src/utils/textbookPages.ts` 中的交互式教程卡片。
- `src/components/article/Article.svelte` 中的长文章正文、标题、图注和功能说明。
- `src/store/index.ts` 中与示例相关的中文说明仅在不影响模型输入的前提下调整。

不需要汉化：

- 源代码变量名、CSS class、analytics event name、DOM selector、数据结构字段。
- 模型输出 token、用户输入 prompt、缓存数据文件 `src/constants/examples/*.js`。
- 外部链接标题、作者姓名、论文名和库名。

## 文件结构

新增 `src/lib/i18n/zh-CN.ts` 或类似位置，用于收纳短 UI 文案和术语常量。长文章 `Article.svelte` 与教程数据 `textbookPages.ts` 可以直接翻译现有 HTML 内容；若某些术语多次出现且容易不一致，再提取到小型 glossary 常量。

预期结构：

```text
src/lib/i18n/zh-CN.ts
src/lib/i18n/glossary.ts
```

如果项目现有别名不方便从 `src/lib` 引入，可改用 `src/utils/i18n.ts`，保持与现有 `~/utils/*` 引入风格一致。

## 测试与验证

1. 运行 `npm run check`，确保 Svelte 和 TypeScript 通过。
2. 运行 `npm run build`，确保静态构建通过。
3. 启动本地开发服务器，检查首页主要区域、教程卡片、长文章、popover 和移动端提示没有明显未翻译英文。
4. 用文本扫描辅助检查剩余英文文案。允许保留术语、代码名、链接、模型名、作者名、库名和 prompt。
5. 因当前 sparse checkout 未包含 `static/model-v2` 大模型分片，本地运行可能会在真实模型下载处不可用；验证时主要依赖缓存示例数据和构建检查。

## 风险

- 中文文案比英文更长，可能造成按钮、图表短标签或 popover 布局拥挤。短标签应保守处理，必要时保留英文。
- 长文章包含大量 HTML 和 KaTeX，翻译时必须保留标签结构和公式内容。
- 教程页的 `on/out/complete` 行为依赖 selector 和 page id，翻译不得修改这些 id 或 selector。
- 示例 prompt 与缓存数据耦合，若未来要中文 prompt，需要重新生成缓存示例或改模型演示策略。

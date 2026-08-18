import { get } from 'svelte/store';
import {
	expandedBlock,
	weightPopover,
	isBoundingBoxActive,
	textbookCurrentPageId,
	isExpandOrCollapseRunning,
	isFetchingModel,
	userId
} from '~/store';
import {
	highlightElements,
	removeHighlightFromElements,
	applyTransformerBoundingHeight,
	resetElementsHeight,
	highlightAttentionPath,
	removeAttentionPathHighlight,
	removeFingerFromElements
} from '~/utils/textbook';
import { drawResidualLine } from './animation';

export interface TextbookPage {
	id: string;
	title: string;
	content?: string;
	component?: any;
	timeoutId?: number;
	on: () => void;
	out: () => void;
	complete?: () => void;
}

const { drawLine, removeLine } = drawResidualLine();

export const textPages: TextbookPage[] = [
	{
		id: 'what-is-transformer',
		title: '什么是 Transformer？',
		content: `<p><strong>Transformer</strong> 是现代 AI 背后的核心架构，为 ChatGPT、Gemini 等模型提供基础。它在 2017 年被提出，彻底改变了 AI 处理信息的方式。同一套架构既可以用来在海量数据上进行训练，也可以在推理阶段用来生成输出。在这里，我们使用的是 GPT-2（small）模型，它比更新的大模型更简单，但非常适合作为入门来理解 Transformer 的基本原理。</p>
`,
		on: () => {},
		out: () => {}
	},
	{
		id: 'how-transformers-work',
		title: 'Transformer 是怎么工作的？',
		content: `<p>Transformer 会逐步生成文本，每一步都在回答一个问题：</p>
	<blockquote class="question">
		“在这段输入之后，<strong>下一个词元</strong>可能是什么？”
	</blockquote>
	<p>这里关注已经训练好的模型如何生成文本。当前底层模型是主要面向英文的 GPT-2 Small；你可以输入英文提示文本，或者选择一个示例，然后点击<strong>生成</strong>按钮。如果模型还没准备好，可以先切换内置<strong>示例</strong>。</p>`,
		on: () => {
			highlightElements(['.input-form']);
			if (get(isFetchingModel)) {
				highlightElements(['.input-form .select-button']);
			} else {
				highlightElements(['.input-form .generate-button']);
			}
		},
		out: () => {
			removeHighlightFromElements([
				'.input-form',
				'.input-form .select-button',
				'.input-form .generate-button'
			]);
		},
		complete: () => {
			removeFingerFromElements(['.input-form .select-button', '.input-form .generate-button']);
			if (get(textbookCurrentPageId) === 'how-transformers-work') {
				window.dataLayer?.push({
					user_id: get(userId),
					event: `textbook-complete`,
					page_id: 'how-transformers-work'
				});
			}
		}
	},
	{
		id: 'transformer-architecture',
		title: 'Transformer 架构总览',
		content:
			'<p>一个 Transformer 可以大致拆成三个主要部分：</p><div class="numbered-list"><div class="numbered-item"><span class="number-circle">1</span><div class="item-content"><strong>嵌入（Embeddings）</strong>：把文本转换成数字向量。</div></div><div class="numbered-item"><span class="number-circle">2</span><div class="item-content"><strong>Transformer 块（Transformer blocks）</strong>：通过自注意力在词元之间传递信息，并用 MLP 细化表示。</div></div><div class="numbered-item"><span class="number-circle">3</span><div class="item-content"><strong>概率（Probabilities）</strong>：计算每个候选词元作为下一词元的概率。</div></div></div>',
		on: () => {
			const selectors = [
				'.step.embedding',
				'.step.softmax',
				'.transformer-bounding',
				'.transformer-bounding-title'
			];
			highlightElements(selectors);
			applyTransformerBoundingHeight(['.softmax-bounding', '.embedding-bounding']);
		},
		out: () => {
			const selectors = [
				'.step.embedding',
				'.step.softmax',
				'.transformer-bounding',
				'.transformer-bounding-title'
			];
			removeHighlightFromElements(selectors);
			resetElementsHeight(['.softmax-bounding', '.embedding-bounding']);
		}
	},
	{
		id: 'embedding',
		title: '嵌入（Embedding）',
		content: `<p>在 Transformer 能使用文本之前，必须先把文本拆成更小的单元，并把每个单元表示成一串数字（向量）。这个过程就叫做 <strong>embedding（嵌入）</strong>，这个词既可以指「嵌入的过程」，也可以指「得到的那个向量」。</p><p>在这个工具里，每个向量都画成一个矩形，你可以把鼠标悬停其上查看维度大小。</p>`,
		on: () => {
			highlightElements(['.step.embedding .title']);
		},
		out: () => {
			removeHighlightFromElements(['.step.embedding .title']);
		},
		complete: () => {
			removeFingerFromElements(['.step.embedding .title']);
			if (get(textbookCurrentPageId) === 'embedding') {
				window.dataLayer?.push({
					user_id: get(userId),
					event: `textbook-complete`,
					page_id: 'embedding'
				});
			}
		}
	},
	{
		id: 'token-embedding',
		title: '词元嵌入（Token Embedding）',
		content: `<p><strong>词元化（Tokenization）</strong> 会把输入文本转换成词元序列，词元可能是完整单词、子词、标点或空格与文本的组合。GPT-2 Small 的词表大小为 50,257，每个词元都有唯一 ID。</p><p>在<strong>词元嵌入</strong>这一步，每个词元会从查找表中取得对应的 768 维向量。这些向量是在训练过程中学习得到的。</p>`,
		on: function () {
			const selectors = [
				'.token-column .column.token-string',
				'.token-column .column.token-embedding'
			];
			if (get(expandedBlock).id !== 'embedding') {
				expandedBlock.set({ id: 'embedding' });
				this.timeoutId = setTimeout(() => {
					highlightElements(selectors);
				}, 500);
			} else {
				highlightElements(selectors);
			}
		},
		out: function () {
			if (this.timeoutId) {
				clearTimeout(this.timeoutId);
				this.timeoutId = undefined;
			}
			const selectors = [
				'.token-column .column.token-string',
				'.token-column .column.token-embedding'
			];
			removeHighlightFromElements(selectors);
			if (get(textbookCurrentPageId) !== 'positional-encoding') expandedBlock.set({ id: null });
		}
	},
	{
		id: 'positional-encoding',
		title: '位置嵌入（Positional Embedding）',
		content: `<p>在自然语言中，词语的顺序非常重要。“位置编码”是向模型提供顺序信息的广义概念。<strong>GPT-2 具体使用可学习的位置嵌入</strong>：把每个位置对应的向量加到词元嵌入上，并在训练中更新这些向量。</p><p>其他模型可能采用正弦位置编码或 RoPE 等不同方法，但目标都是让模型利用序列中的顺序和距离。</p>`,
		on: function () {
			const selectors = [
				'.token-column .column.position-embedding',
				'.token-column .column.symbol'
			];
			if (get(expandedBlock).id !== 'embedding') {
				expandedBlock.set({ id: 'embedding' });
				this.timeoutId = setTimeout(() => {
					highlightElements(selectors);
				}, 500);
			} else {
				highlightElements(selectors);
			}
		},
		out: function () {
			if (this.timeoutId) {
				clearTimeout(this.timeoutId);
				this.timeoutId = undefined;
			}
			const selectors = [
				'.token-column .column.position-embedding',
				'.token-column .column.symbol'
			];
			removeHighlightFromElements(selectors);
			if (get(textbookCurrentPageId) !== 'token-embedding') expandedBlock.set({ id: null });
		}
	},
	{
		id: 'blocks',
		title: '重复叠加的 Transformer 块',
		content: `<p>一个 <strong>Transformer block</strong> 是模型中最核心的处理单元，它主要包含两部分：</p><ul><li><strong>Multi-head self-attention（多头自注意力）</strong> —— 让不同 token 之间互相传递信息。</li><li><strong>MLP</strong> —— 在注意力之后，对每个 token 的表示做进一步细化。</li></ul><p>模型会把很多这样的 block 一层层堆叠起来，使得 token 的表示在一层层的传递中不断变得更丰富。GPT-2（small）中一共有 12 个这样的 block。</p>`,
		on: function () {
			this.timeoutId = setTimeout(
				() => {
					highlightElements([
						'.transformer-bounding',
						'.step.transformer-blocks .guide',
						'.attention > .title',
						'.mlp > .title'
					]);
					highlightElements(['.transformer-bounding-title'], 'textbook-button-highlight');
					isBoundingBoxActive.set(true);
				},
				get(isExpandOrCollapseRunning) ? 500 : 0
			);
		},
		out: function () {
			if (this.timeoutId) {
				clearTimeout(this.timeoutId);
				this.timeoutId = undefined;
			}
			removeHighlightFromElements([
				'.transformer-bounding',
				'.step.transformer-blocks .guide',
				'.attention > .title',
				'.mlp > .title'
			]);
			removeHighlightFromElements(['.transformer-bounding-title'], 'textbook-button-highlight');
			isBoundingBoxActive.set(false);
		},
		complete: () => {
			removeFingerFromElements(['.transformer-bounding-title']);
			if (get(textbookCurrentPageId) === 'blocks') {
				window.dataLayer?.push({
					user_id: get(userId),
					event: `textbook-complete`,
					page_id: 'blocks'
				});
			}
		}
	},
	{
		id: 'self-attention',
		title: 'Multi-Head Self-Attention（多头自注意力）',
		content:
			'<p><strong>Self-attention（自注意力）</strong> 让模型能够判断：对当前这个 token 来说，输入序列中的哪些位置最重要，从而捕捉长距离依赖和复杂关系。</p><p>在 <strong>multi-head（多头）</strong> 形式下，模型会并行地运行多组注意力，每一头都会关注不同的模式或关系。</p>',
		on: () => {
			highlightElements(['.step.attention']);
		},
		out: () => {
			removeHighlightFromElements(['.step.attention']);
		}
	},
	{
		id: 'qkv',
		title: 'Query、Key、Value',
		content: `
	<p>为了计算 self-attention，每个 token 的 embedding 都会被转换成
  <span class="highlight">三种新的嵌入</span>：
  <span class="blue">Query（查询向量）</span>、
  <span class="red">Key（键向量）</span> 和
  <span class="green">Value（值向量）</span>。
  这些向量是通过对原始嵌入施加不同的权重矩阵和偏置得到的。这些参数都是在训练过程中学习得到的。</p>

<p>在完成转换后，<span class="blue">Query</span> 会和 <span class="red">Key</span> 做比较，以衡量「相关性」，而这份相关性又会用来对 <span class="green">Value</span> 做加权，从而得到最终的注意力输出。</p>
`,
		on: function () {
			this.timeoutId = setTimeout(
				() => {
					highlightElements(['g.path-group.qkv', '.step.qkv .qkv-column']);
				},
				get(isExpandOrCollapseRunning) ? 500 : 0
			);
		},
		out: function () {
			if (this.timeoutId) {
				clearTimeout(this.timeoutId);
				this.timeoutId = undefined;
			}
			removeHighlightFromElements(['g.path-group.qkv', '.step.qkv .qkv-column']);
			weightPopover.set(null);
		},
		complete: () => {
			removeFingerFromElements(['.step.qkv .qkv-column']);
			if (get(textbookCurrentPageId) === 'qkv') {
				window.dataLayer?.push({
					user_id: get(userId),
					event: `textbook-complete`,
					page_id: 'qkv'
				});
			}
		}
	},

	{
		id: 'multi-head',
		title: '多头（Multi-head）',
		content:
			'<p>在得到 <span class="blue">Q</span>、<span class="red">K</span>、<span class="green">V</span> 之后，模型会把它们拆成多个 <strong>heads（头）</strong>（在 GPT-2 small 中有 12 个头）。每个头只处理自己那部分较小的 <span class="blue">Q</span>/<span class="red">K</span>/<span class="green">V</span>，因此可以关注不同类型的模式——比如语法结构、语义关系或更长距离的依赖。</p><p>多个 heads 一起工作，可以让模型在同一层中并行地学习多种关系，使得整体表示更加丰富。</p>',
		on: () => {
			highlightAttentionPath();
			highlightElements(['.multi-head .head-title']);
		},
		out: () => {
			removeAttentionPathHighlight();
			removeHighlightFromElements(['.multi-head .head-title']);
		},
		complete: () => {
			removeFingerFromElements(['.multi-head .head-title']);
			if (get(textbookCurrentPageId) === 'multi-head') {
				window.dataLayer?.push({
					user_id: get(userId),
					event: `textbook-complete`,
					page_id: 'multi-head'
				});
			}
		}
	},
	{
		id: 'masked-self-attention',
		title: 'Masked Self-Attention（带掩码自注意力）',
		content: `<p>在每一个 head 里，模型会决定：当前这个 token 应该多关注其它哪些 token：</p><ul><li><strong>点积（Dot Product）</strong> —— 对应位置的 <span class="blue">Query</span> / <span class="red">Key</span> 分量相乘后求和，得到 <span class="purple">attention score（注意力分数）</span>。</li><li><strong>Mask（掩码）</strong> —— 对将来的 token 做遮挡，让模型在生成时看不到未来的内容，避免「作弊」。</li><li><strong>Softmax</strong> —— 把这些分数转成概率，每一行的和为 1，表示当前 token 对前面各个 token 的关注比例。</li></ul>`,
		on: () => {
			highlightAttentionPath();
			highlightElements(['.attention-matrix.attention-result']);
		},
		out: () => {
			removeAttentionPathHighlight();
			removeHighlightFromElements(['.attention-matrix.attention-result']);
			expandedBlock.set({ id: null });
		},
		complete: () => {
			removeFingerFromElements(['.attention-matrix.attention-result']);
			if (get(textbookCurrentPageId) === 'masked-self-attention') {
				window.dataLayer?.push({
					user_id: get(userId),
					event: `textbook-complete`,
					page_id: 'masked-self-attention'
				});
			}
		}
	},
	{
		id: 'output-concatenation',
		title: '注意力输出与拼接（Concatenation）',
		content:
			'<p>每一个 head 会把自己的 <span class="purple">注意力分数</span> 与 <span class="green">Value</span> 嵌入相乘，从而得到这一头的注意力输出 —— 也就是在「考虑上下文之后」对每个 token 的新表示。</p><p>在 GPT-2（small）中，一共有 12 头注意力，因此会得到 12 份输出，然后它们会被拼接（concat）在一起，并再映射回原本的维度大小（768 维）。</p>',
		on: function () {
			this.timeoutId = setTimeout(
				() => {
					highlightElements(['path.to-attention-out.value-to-out', '.attention .column.out']);
				},
				get(isExpandOrCollapseRunning) ? 500 : 0
			);
		},
		out: function () {
			if (this.timeoutId) {
				clearTimeout(this.timeoutId);
				this.timeoutId = undefined;
			}
			removeHighlightFromElements(['path.to-attention-out.value-to-out', '.attention .column.out']);
			weightPopover.set(null);
		},
		complete: () => {
			removeFingerFromElements(['.attention .column.out']);
			if (get(textbookCurrentPageId) === 'output-concatenation') {
				window.dataLayer?.push({
					user_id: get(userId),
					event: `textbook-complete`,
					page_id: 'output-concatenation'
				});
			}
		}
	},
	{
		id: 'mlp',
		title: 'MLP（多层感知机）',
		content:
			'<p>在注意力层输出之后，表示会进入一个 <strong>MLP</strong>，进一步细化每个词元的表示。线性层会通过学习到的权重和偏置改变向量的数值和维度，随后由非线性激活函数进行变换。</p><p>GPT-2 使用 <strong>GELU</strong> 激活函数，使网络能够表达线性变换之外的复杂模式。</p>',
		on: () => {
			highlightElements(['.step.mlp', '.operation-col.activation']);
		},
		out: () => {
			removeHighlightFromElements(['.step.mlp', '.operation-col.activation']);
		}
	},

	{
		id: 'output-logit',
		title: '输出 Logit',
		content: `<p>在所有 Transformer blocks 处理完之后，最后一个 token 的输出 embedding 已经汇集了前面所有 token 的上下文信息。接下来，这个向量会和最终的线性层的权重相乘。</p><p>这一步会生成一组 <strong>logits</strong> —— 一共 50,257 个数字，对应 GPT-2 词表中的每一个 token，用来表示「这个 token 作为下一个 token 的相对倾向（未归一化得分）」。</p>`,
		on: () => {
			highlightElements(['g.path-group.softmax', '.column.final']);
		},
		out: () => {
			removeHighlightFromElements(['g.path-group.softmax', '.column.final']);
			weightPopover.set(null);
		},
		complete: () => {
			removeFingerFromElements(['.column.final']);
			if (get(textbookCurrentPageId) === 'output-logit') {
				window.dataLayer?.push({
					user_id: get(userId),
					event: `textbook-complete`,
					page_id: 'output-logit'
				});
			}
		}
	},
	{
		id: 'output-probabilities',
		title: '输出概率（Probabilities）',
		content:
			'<p>Logits 本质上只是「原始分数」。为了让它们更容易理解，我们会把它们转换成 <strong>0 到 1 之间的概率</strong>，并且所有概率之和为 1。这样就能直观地看到：每个 token 作为下一个词的可能性有多大。</p><p>在实际生成时，我们不一定总是死板地选择概率最高的那个 token，而是可以使用不同的采样策略，在「稳定安全」和「多样有创意」之间做权衡。</p>',
		on: () => {
			highlightElements(['.step.softmax .title']);
		},
		out: () => {
			removeHighlightFromElements(['.step.softmax .title']);
		},
		complete: () => {
			removeFingerFromElements(['.step.softmax .title']);
			if (get(textbookCurrentPageId) === 'output-probabilities') {
				window.dataLayer?.push({
					user_id: get(userId),
					event: `textbook-complete`,
					page_id: 'output-probabilities'
				});
			}
		}
	},
	{
		id: 'temperature',
		title: '温度（Temperature）',
		content:
			'<p><strong>Temperature（温度）</strong> 通过对 logits 做缩放，来间接控制生成的随机性。在转换成概率之前，如果使用一个 <strong>较低的 temperature</strong>（例如 0.2），大的 logits 会被放得更大，小的会更小，从而更偏向少数几个最高分的 token，生成结果会更 <strong>可预测</strong>；而 <strong>较高的 temperature</strong>（比如 1.0 或更高）会把差距拉平，让原本不太可能的 token 也有机会被采样，从而使生成更 <strong>多样 / 有创意</strong>。</p>',
		on: function () {
			if (get(expandedBlock).id !== 'softmax') {
				expandedBlock.set({ id: 'softmax' });
				this.timeoutId = setTimeout(() => {
					highlightElements([
						'.formula-step.scaled',
						'.title-box.scaled',
						'.content-box.scaled',
						'.temperature-input'
					]);
				}, 500);
			} else {
				highlightElements([
					'.formula-step.scaled',
					'.title-box.scaled',
					'.content-box.scaled',
					'.temperature-input'
				]);
			}
		},
		out: function () {
			if (this.timeoutId) {
				clearTimeout(this.timeoutId);
				this.timeoutId = undefined;
			}
			removeHighlightFromElements([
				'.formula-step.scaled',
				'.title-box.scaled',
				'.temperature-input',
				'.content-box.scaled'
			]);
			if (!['temperature', 'sampling'].includes(get(textbookCurrentPageId)))
				expandedBlock.set({ id: null });
		},
		complete: () => {
			removeFingerFromElements(['.temperature-input']);
			if (get(textbookCurrentPageId) === 'temperature') {
				window.dataLayer?.push({
					user_id: get(userId),
					event: `textbook-complete`,
					page_id: 'temperature'
				});
			}
		}
	},
	{
		id: 'sampling',
		title: '采样策略（Sampling Strategy）',
		content:
			'<p>最后一步是决定输出哪个词元。贪心搜索总是选择概率最高的词元；<strong>Top-k</strong> 只保留概率最高的 k 个候选；<strong>Top-p</strong> 按概率从高到低排序，保留累计概率达到或超过阈值 p 的最小候选集合。</p><p>过滤其余候选后，系统会对保留候选的概率重新归一化，再按这一分布随机采样。</p>',
		on: function () {
			if (get(expandedBlock).id !== 'softmax') {
				expandedBlock.set({ id: 'softmax' });
				this.timeoutId = setTimeout(() => {
					highlightElements([
						'.formula-step.sampling',
						'.title-box.sampling',
						'.sampling-input',
						'.content-box.sampling'
					]);
				}, 500);
			} else {
				highlightElements([
					'.formula-step.sampling',
					'.title-box.sampling',
					'.sampling-input',
					'.content-box.sampling'
				]);
			}
		},
		out: function () {
			if (this.timeoutId) {
				clearTimeout(this.timeoutId);
				this.timeoutId = undefined;
			}
			removeHighlightFromElements([
				'.formula-step.sampling',
				'.title-box.sampling',
				'.sampling-input',
				'.content-box.sampling'
			]);
			if (!['temperature', 'sampling'].includes(get(textbookCurrentPageId)))
				expandedBlock.set({ id: null });
		},
		complete: () => {
			removeFingerFromElements(['.sampling-input']);
			if (get(textbookCurrentPageId) === 'sampling') {
				window.dataLayer?.push({
					user_id: get(userId),
					event: `textbook-complete`,
					page_id: 'sampling'
				});
			}
		}
	},
	{
		id: 'residual',
		title: '残差连接（Residual Connection）',
		content: `<p>Transformer 里还有一些用于增强性能的结构，它们不是理解大框架的「主角」，但在训练和稳定性上非常重要。<strong>Residual connection（残差连接）</strong> 就是其中之一：它会把一层的输入直接加到输出上，避免信息和梯度在很多层中逐渐消失。在 GPT-2 中，每个 block 内都会使用两次残差连接，以支持更深的堆叠。</p>`,
		on: function () {
			this.timeoutId = setTimeout(
				() => {
					highlightElements(['.operation-col.residual', '.residual-start']);
					drawLine();
				},
				get(isExpandOrCollapseRunning) ? 500 : 0
			);
		},
		out: function () {
			if (this.timeoutId) {
				clearTimeout(this.timeoutId);
				this.timeoutId = undefined;
			}
			removeHighlightFromElements(['.operation-col.residual', '.residual-start']);
			removeLine();
		}
	},
	{
		id: 'layer-normalization',
		title: '层归一化（Layer Normalization）',
		content: `<p><strong>层归一化</strong> 会沿特征维度标准化输入，再应用可学习的缩放和偏移参数。GPT-2 使用 Pre-LN 结构：每个 Transformer 块在自注意力前和 MLP 前各使用一次层归一化；全部 12 个块结束后，再在输出映射前使用一次最终层归一化。</p>`,
		on: () => {
			highlightElements(['.operation-col.ln']);
		},
		out: () => {
			removeHighlightFromElements(['.operation-col.ln']);
		}
	},
	{
		id: 'dropout',
		title: '随机失活（Dropout）',
		content: `<p>在训练阶段，<strong>dropout</strong> 会随机「掐掉」一部分连接，让模型不要过度依赖某几条特定路径，从而降低过拟合的风险，学到更具有泛化能力的特征。GPT-2 在训练时也会用到 dropout，不过在很多基于超大数据训练的新一代 LLM 中，由于数据足够多、过拟合不那么严重，它们往往可以不依赖 dropout。在推理阶段，dropout 始终是关闭的。</p>`,
		on: () => {
			highlightElements(['.operation-col.dropout']);
		},
		out: () => {
			removeHighlightFromElements(['.operation-col.dropout']);
		}
	}
	// {
	// 	id: 'final',
	// 	title: `Let's explore!`,
	// 	content: '',
	// 	on: () => {},
	// 	out: () => {}
	// }
];

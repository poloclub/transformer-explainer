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
		content: `<p><strong>Transformer</strong> 是现代 AI，尤其是大型语言模型（LLM, Large Language Model）的核心架构，支撑着 ChatGPT、Gemini 等模型。它在 2017 年被提出，显著改变了 AI 处理信息的方式。同一套架构既用于在海量数据上训练模型，也用于推理（inference）生成输出。这里使用的是 GPT-2（small）：它比新一代模型更简单，但很适合用来理解基础原理。</p>
`,
		on: () => {},
		out: () => {}
	},
	{
		id: 'how-transformers-work',
		title: 'Transformer 如何工作？',
		content: `<p>Transformer 并不是魔法；它会通过不断追问下面这个问题，一步一步生成文本：</p>
	<blockquote class="question">
		“在这段输入之后，最可能出现的下一个词是什么？”
	</blockquote>
	<p>这里会演示一个训练好的模型如何生成文本。你可以输入自己的英文文本，也可以使用示例，然后点击 <strong>生成</strong> 查看流程。如果模型还没有准备好，可以先切换另一个 <strong>示例</strong>。</p>`,
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
		title: 'Transformer 架构',
		content:
			'<p>Transformer 主要由三部分组成：</p><div class="numbered-list"><div class="numbered-item"><span class="number-circle">1</span><div class="item-content"><strong>Embeddings</strong> 将文本转换成数字表示。</div></div><div class="numbered-item"><span class="number-circle">2</span><div class="item-content"><strong>Transformer blocks</strong> 通过 Self-Attention 混合信息，再用 MLP（Multi-Layer Perceptron，多层感知机）进一步处理。</div></div><div class="numbered-item"><span class="number-circle">3</span><div class="item-content"><strong>Probabilities</strong> 表示每个候选下一个词元（Token）的可能性。</div></div></div>',
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
		title: 'Embedding',
		content: `<p>在 Transformer 处理文本之前，文本会先被拆成更小的单元，并把每个单元表示为一串数字，也就是向量（vector）。这个过程称为 <strong>embedding</strong>；这个词既可以指“转换过程”，也可以指转换后的向量本身。</p><p>在这个工具里，每个向量会显示成一个矩形；把鼠标悬停在上面可以查看它的尺寸。</p>`,
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
		title: 'Token Embedding',
		content: `<p><strong>Tokenization</strong> 会把输入文本切分成词元（Token）：它们可能是完整单词，也可能只是单词的一部分。GPT-2（small）的词表包含 50,257 个 token，每个 token 都有唯一的 ID。</p><p>在 <strong>token embedding</strong> 这一步，每个 token 都会从一个大型查找表中匹配到一个包含 768 个数字的向量。这些向量是在训练过程中学习出来的，用来尽可能表示对应 token 的语义。</p>`,
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
		title: 'Positional Encoding',
		content: `<p>在语言中，词序非常重要。<strong>Positional encoding</strong> 会为每个 token 加入它在序列中的位置信息。</p><p>GPT-2 的做法是把学习到的 positional embedding 加到 token embedding 上；更新的模型也可能使用其他方法，例如 RoPE（Rotary Position Embedding，旋转位置编码），通过旋转某些向量来编码位置。它们的目标都是帮助模型理解文本顺序。</p>`,
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
		title: '重复堆叠的 Transformer Blocks',
		content: `<p><strong>Transformer block</strong> 是模型中的主要处理单元。它包含两部分：</p><ul><li><strong>Multi-Head Self-Attention</strong>：让 token 之间共享信息</li><li><strong>MLP</strong>：进一步细化每个 token 的表示</li></ul><p>模型会堆叠多个 block，让 token 表示在逐层传递时变得更丰富。GPT-2（small）一共有 12 个这样的 block。</p>`,
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
		title: '多头自注意力（Multi-Head Self-Attention）',
		content:
			'<p><strong>Self-Attention</strong> 让模型判断输入中的哪些部分与当前 token 最相关。这可以帮助模型捕捉语义和关系，即使相关词之间相隔很远也可以关联起来。</p><p>在 <strong>multi-head</strong> 形式下，模型会并行运行多个 attention 过程，每个 head 关注文本中的不同模式。</p>',
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
	<p>为了执行 Self-Attention，每个 token 的 embedding 都会被转换成
  <span class="highlight">三个新的 embeddings</span>：
  <span class="blue">Query</span>、
  <span class="red">Key</span> 和
  <span class="green">Value</span>。
  这个转换会对每个 token embedding 应用不同的权重和偏置。这些参数（weights 和 biases）会在训练过程中被优化。</p>

<p>生成之后，<span class="blue">Queries</span> 会与 <span class="red">Keys</span> 比较来衡量相关性；这个相关性会进一步用于加权 <span class="green">Values</span>。</p>
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
		title: 'Multi-head',
		content:
			'<p>生成 <span class="blue">Q</span>、<span class="red">K</span> 和 <span class="green">V</span> embeddings 之后，模型会把它们拆分成多个 <strong>heads</strong>（GPT-2 small 中是 12 个）。每个 head 使用自己的一组更小的 <span class="blue">Q</span>/<span class="red">K</span>/<span class="green">V</span>，关注文本中的不同模式，例如语法、语义或长距离关联。</p><p>多个 heads 让模型可以并行学习多种关系，从而形成更丰富的理解。</p>',
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
		title: 'Masked Self-Attention',
		content: `<p>在每个 head 中，模型会决定每个 token 应该关注其他 token 的程度：</p><ul><li><strong>Dot Product</strong>：把 <span class="blue">Query</span>/<span class="red">Key</span> 向量中对应位置的数字相乘再求和，得到 <span class="purple">attention scores</span>。</li><li><strong>Mask</strong>：隐藏未来 token，避免模型提前“偷看”答案。</li><li><strong>Softmax</strong>：把 scores 转成概率，每一行加起来等于 1，表示当前 token 对前面 token 的关注分布。</li></ul>`,
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
		title: 'Attention 输出与拼接',
		content:
			'<p>每个 head 会<span class="highlight">将自己的 <span class="purple">attention scores</span> 与 <span class="green">Value</span> embeddings 相乘，生成 attention output</span>：这是每个 token 在考虑上下文之后得到的精炼表示。</p><p>GPT-2（small）会产生 12 组这样的输出，然后把它们拼接起来，形成一个原始尺寸的向量（768 个数字）。</p>',
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
		title: 'MLP（Multi-Layer Perceptron）',
		content:
			'<p>Attention output 会经过一个 <strong>MLP</strong> 来进一步优化 token 表示。Linear layer 会用学习到的权重和偏置改变 embedding 的数值与尺寸，随后非线性 activation 会决定每个值保留多少。</p><p>Activation 有很多类型；GPT-2 使用 <strong>GELU</strong>，它会让较小的值部分通过、较大的值充分通过，从而帮助模型同时捕捉细微模式和强模式。</p>',
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
		content: `<p>经过所有 Transformer blocks 之后，最后一个 token 的 output embedding 已经融合了前面所有 token 的上下文信息。最终层会把它与学习到的权重相乘。</p><p>这会产生 <strong>logits</strong>：一共 50,257 个数字，对应 GPT-2 词表中的每个 token，用来表示每个 token 接下来出现的可能性。</p>`,
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
		title: '输出概率',
		content:
			'<p>Logits 只是原始分数。为了更容易解释，我们会把它们转换成 0 到 1 之间的 <strong>probabilities</strong>，并且所有概率加起来等于 1。这样就可以看出每个 token 成为下一个词的可能性。</p><p>生成文本时不一定总是选择概率最高的 token；我们也可以使用不同的选择策略，在稳定性和创造性之间取得平衡。</p>',
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
		title: 'Temperature',
		content:
			'<p><strong>Temperature</strong> 会在 logits 转换为概率之前对它们进行缩放。<strong>较低的 temperature</strong>（例如 0.2）会让大的 logits 更大、小的 logits 更小，因此更偏向分数最高的 token，生成结果也更<strong>可预测</strong>。<strong>较高的 temperature</strong>（例如 1.0 或更高）会拉平差异，让原本可能性较低的 token 也更有竞争力，从而产生更<strong>有创造性</strong>的输出。</p>',
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
		title: 'Sampling 策略',
		content:
			'<p>最后，我们需要一种策略来选择下一个 token。常见策略包括：Greedy search 直接选择最高分的 token；<strong>Top-k</strong> 只保留概率最高的 k 个 token；<strong>top-p</strong> 则保留累计概率至少达到 p 的最小 token 集合，从一开始就过滤掉低概率候选。</p><p>随后 softmax 会把剩余 logits 转换成概率，并从允许的集合中随机采样一个 token。</p>',
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
		content: `<p>Transformer 还有一些辅助机制来提升模型性能。比如 <strong>residual connection</strong> 会把某一层的输入加回到它的输出上，避免信息在经过很多 block 后逐渐消失。在 GPT-2 中，每个 block 会使用两次 residual connection，从而更有效地训练更深的堆叠结构。</p>`,
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
		title: 'Layer Normalization',
		content: `<p><strong>Layer Normalization</strong> 会调整输入数字，让它们的均值和方差保持稳定，从而同时稳定训练与推理过程。这会让模型对初始权重不那么敏感，也能更有效地学习。在 GPT-2 中，它会出现在 self-attention 之前、MLP 之前，以及最终输出之前。</p>`,
		on: () => {
			highlightElements(['.operation-col.ln']);
		},
		out: () => {
			removeHighlightFromElements(['.operation-col.ln']);
		}
	},
	{
		id: 'dropout',
		title: 'Dropout',
		content: `<p>训练期间，<strong>dropout</strong> 会随机关闭某些数字之间的连接，避免模型过度拟合特定模式。这有助于模型学习更容易泛化的特征。GPT-2 使用了 dropout，但更新的 LLM 通常会跳过它，因为它们在巨大数据集上训练，过拟合问题相对更小。推理时，dropout 会被关闭。</p>`,
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

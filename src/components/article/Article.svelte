<script>
	import tailwindConfig from '../../../tailwind.config';
	import resolveConfig from 'tailwindcss/resolveConfig';
	import Katex from '~/utils/Katex.svelte';
</script>

<div id="description">
	<div class="article-section" data-click="article-intro">
		<h1>什么是 Transformer？</h1>

		<p>
			Transformer 是一种神经网络架构，它从根本上改变了人工智能（AI, Artificial
			Intelligence）的发展路径。Transformer 最早在 2017 年的重要论文
			<a
				href="https://dl.acm.org/doi/10.5555/3295222.3295349"
				title="ACM Digital Library"
				target="_blank">"Attention is All You Need"</a
			>
			中提出，此后逐渐成为深度学习模型的主流架构，支撑着 OpenAI 的 <strong>GPT</strong>、Meta 的
			<strong>Llama</strong>、Google 的 <strong>Gemini</strong>
			等文本生成模型。除了文本，Transformer 还被应用在
			<a
				href="https://huggingface.co/learn/audio-course/en/chapter3/introduction"
				title="Hugging Face"
				target="_blank">音频生成</a
			>,
			<a
				href="https://huggingface.co/learn/computer-vision-course/unit3/vision-transformers/vision-transformers-for-image-classification"
				title="Hugging Face"
				target="_blank">图像识别</a
			>,
			<a href="https://elifesciences.org/articles/82819" title="eLife">蛋白质结构预测</a>，甚至
			<a
				href="https://www.deeplearning.ai/the-batch/reinforcement-learning-plus-transformers-equals-efficiency/"
				title="Deep Learning AI"
				target="_blank">游戏智能体</a
			>等任务中，展现了跨领域的通用性。
		</p>
		<p>
			从根本上说，文本生成 Transformer 模型遵循 <strong>next-token prediction</strong
			>（下一个词元预测）的原则：给定用户输入的文本提示，接下来最可能出现的
			<em>下一个 token（一个词或词的一部分）</em>是什么？Transformer 的核心创新和能力来自
			self-attention 机制，它让模型可以处理完整序列，并比过去的架构更有效地捕捉长距离依赖关系。
		</p>
		<p>
			GPT-2 系列模型是文本生成 Transformer 的代表性例子。Transformer Explainer 使用的是
			<a href="https://huggingface.co/openai-community/gpt2" title="Hugging Face" target="_blank"
				>GPT-2</a
			>
			（small）模型，它拥有 1.24 亿参数。虽然它不是最新、也不是最强大的 Transformer 模型，但它和当前最先进模型共享许多相同的架构组件与基本原理，因此很适合作为理解基础概念的起点。
		</p>
	</div>

	<div class="article-section" data-click="article-overview">
		<h1>Transformer 架构</h1>

		<p>
			每个文本生成 Transformer 都包含下面 <strong>三个关键组件</strong>：
		</p>
		<ol>
			<li>
				<strong class="bold-purple">Embedding</strong>：文本输入会被切分成更小的单元，称为
				tokens；它们可以是完整词，也可以是子词。随后这些 tokens 会被转换成数值向量，也就是
				embeddings，用来表示词的语义。
			</li>
			<li>
				<strong class="bold-purple">Transformer Block</strong>
				是模型处理和变换输入数据的基本模块。每个 block 包含：
				<ul class="">
					<li>
						<strong>Attention Mechanism</strong>，也就是 Transformer block 的核心组件。它允许 tokens
						彼此“通信”，从而捕捉上下文信息和词语之间的关系。
					</li>
					<li>
						<strong>MLP（Multilayer Perceptron）Layer</strong>，一种对每个 token
						独立运行的前馈网络。Attention layer 的目标是在 tokens 之间路由信息，而 MLP
						的目标是细化每个 token 的表示。
					</li>
				</ul>
			</li>
			<li>
				<strong class="bold-purple">输出概率（Output Probabilities）</strong>：最后的 linear 和
				softmax layers 会把处理后的 embeddings 转换成概率，让模型预测序列中的下一个 token。
			</li>
		</ol>
	</div>

	<div class="article-section" id="embedding" data-click="article-embedding">
		<h2>Embedding</h2>
		<p>
			假设你想用 Transformer 模型生成文本，并输入这样一个 prompt：
			<code>“Data visualization empowers users to”</code
			>。这段输入需要先转换成模型能够理解和处理的格式，这就是 embedding
			发挥作用的地方：它会把文本转换成模型可使用的数值表示。要把 prompt 转成 embedding，我们需要
			1）对输入做 tokenization，2）获得 token embeddings，3）加入位置信息，最后 4）把 token 和
			position encodings 相加得到最终 embedding。下面逐步看这些步骤如何完成。
		</p>
		<div class="figure">
			<img src="./article_assets/embedding.png" width="65%" />
		</div>
		<div class="figure-caption">
			图 <span class="attention">1</span>。展开 Embedding layer 视图，展示输入 prompt
			如何被转换成向量表示。这个过程包括
			<span class="fig-numbering">(1)</span> Tokenization、(2) Token Embedding、(3) Positional Encoding
			和 (4) Final Embedding。
		</div>
		<div class="article-subsection">
			<h3>步骤 1：Tokenization</h3>
			<p>
				Tokenization 是把输入文本拆分成更小、更易处理的片段的过程，这些片段称为 tokens。Token
				可以是一个词，也可以是子词。单词 <code>"Data"</code>
				和 <code>"visualization"</code> 分别对应唯一 token，而单词
				<code>"empowers"</code>
				会被拆成两个 tokens。完整的 token 词表会在模型训练前确定：GPT-2 的词表包含
				<code>50,257</code> 个唯一 tokens。现在我们已经把输入文本拆成带有不同 ID 的 tokens，就可以从
				embeddings 中取得它们的向量表示。
			</p>
		</div>
		<div class="article-subsection" id="article-token-embedding">
			<h3>步骤 2：Token Embedding</h3>
			<p>
				GPT-2（small）会把词表中的每个 token 表示成一个 768 维向量；向量维度取决于具体模型。这些
				embedding vectors 存储在一个形状为 <code>(50,257, 768)</code>
				的矩阵中，约包含 3900 万个参数！这个大型矩阵让模型能够为每个 token 赋予语义含义：在语言中用法或意义相近的
				tokens 会在这个高维空间里更接近，而差异较大的 tokens 会相距更远。
			</p>
		</div>
		<div class="article-subsection" id="article-positional-embedding">
			<h3>步骤 3：Positional Encoding</h3>
			<p>
				Embedding layer 还会编码每个 token 在输入 prompt
				中的位置信息。不同模型会使用不同的位置编码方法。GPT-2 会从头训练自己的 positional encoding
				matrix，并把它直接纳入训练过程。
			</p>

			<!-- <div class="article-subsection-l2">
	<h4>Alternative Positional Encoding Approach <strong class='attention'>[POTENTIALLY COLLAPSIBLE]</strong></h4>
	<p>
	  Other models, like the original Transformer and BERT,
	  use sinusoidal functions for positional encoding.

	  This sinusoidal encoding is deterministic and designed to reflect
	  the absolute as well as the relative position of each token.
	</p>
	<p>
	  Each position in a sequence is assigned a unique mathematical
	  representation using a combination of sine and cosine functions.

	  For a given position, the sine function represents even dimensions,
	  and the cosine function represents odd dimensions within the positional encoding vector.

	  This periodic nature ensures that each position has a consistent encoding,
	  independent of the surrounding context.
	</p>

	<p>
	  Here’s how it works:
	</p>

	<span class='attention'>
	  SINUSOIDAL POSITIONAL ENCODING EQUATION
	</span>

	<ul>
	  <li>
		<strong>Sine Function</strong>: Used for even indices of the embedding vector.
	  </li>
	  <li>
		<strong>Cosine Function</strong>: Used for odd indices of the embedding vector.
	</ul>

	<p>
	  Hover over individual encoding values in the matrix above to
	  see how it's calculated using the sins and cosine functions.
	</p>
  </div> -->
		</div>
		<div class="article-subsection">
			<h3>步骤 4：Final Embedding</h3>
			<p>
				最后，我们把 token encodings 和 positional encodings 相加，得到最终 embedding
				表示。这个组合表示同时包含 token 的语义信息，以及它们在输入序列中的位置。
			</p>
		</div>
	</div>

	<div class="article-section" data-click="article-transformer-block">
		<h2>Transformer Block</h2>

		<p>
			Transformer 的核心处理发生在 Transformer block 中，它由 multi-head self-attention 和
			Multi-Layer Perceptron layer 组成。大多数模型会把多个这样的 blocks 按顺序堆叠起来。Token
			表示会从第一个 block 到最后一个 block 逐层演化，使模型能够逐渐建立对每个 token
			的复杂理解。这种分层方式会产生更高阶的输入表示。我们正在研究的 GPT-2（small）模型包含
			<code>12</code> 个这样的 blocks。
		</p>
	</div>

	<div class="article-section" id="self-attention" data-click="article-attention">
		<h3>Multi-Head Self-Attention</h3>
		<p>
			Self-attention 机制让模型能够捕捉序列中 tokens 之间的关系，使每个 token 的表示都会受到其他
			tokens 的影响。多个 attention heads 让模型可以从不同角度理解这些关系；例如，一个 head
			可能关注短距离语法关联，另一个 head 则追踪更宽泛的语义上下文。下面我们会一步步看 multi-head
			self-attention 是如何计算的。
		</p>
		<div class="article-subsection-l2">
			<h4>步骤 1：Query、Key 和 Value 矩阵</h4>

			<div class="figure pt-10">
				<img src="./article_assets/QKV.png" width="80%" />
				<div class="text-xs">
					<Katex
						displayMode
						math={`
		QKV_{ij} = ( \\sum_{d=1}^{768} \\text{Embedding}_{i,d} \\cdot \\text{Weights}_{d,j}) + \\text{Bias}_j
		`}
					/>
				</div>
			</div>
			<div class="figure-caption">
				图 <span class="attention">2</span>。从原始 embedding 中计算 Query、Key 和 Value 矩阵。
			</div>

			<p>
				每个 token 的 embedding vector 会被转换成三个向量：
				<span class="q-color">Query (Q)</span>、
				<span class="k-color">Key (K)</span> 和
				<span class="v-color">Value (V)</span>。这些向量通过输入 embedding matrix 与学习到的
				<span class="q-color">Q</span>、
				<span class="k-color">K</span> 和
				<span class="v-color">V</span> 权重矩阵相乘得到。可以用网页搜索来类比这些矩阵，帮助建立直觉：
			</p>
			<ul>
				<li>
					<strong class="q-color font-medium">Query (Q)</strong>
					就像你在搜索框里输入的搜索词。它代表你想要
					<em>“查找更多信息”</em>的 token。
				</li>
				<li>
					<strong class="k-color font-medium">Key (K)</strong> 就像搜索结果中每个网页的标题。它表示 query
					可以关注的候选 tokens。
				</li>
				<li>
					<strong class="v-color font-medium">Value (V)</strong> 就像网页中真正显示的内容。当合适的搜索词（Query）匹配到相关结果（Key）之后，我们想获得最相关页面的内容（Value）。
				</li>
			</ul>
			<p>
				利用这些 QKV 值，模型可以计算 attention scores，用来决定在生成预测时每个 token
				应该获得多少关注。
			</p>
		</div>
		<div class="article-subsection-l2">
			<h4>步骤 2：Multi-Head 拆分</h4>
			<p>
				<span class="q-color">Query</span>、<span class="k-color">Key</span> 和
				<span class="v-color">Value</span>
				vectors 会被拆分成多个 heads；以 GPT-2（small）为例，它们会被拆成
				<code>12</code> 个 heads。每个 head 独立处理 embeddings 的一部分，捕捉不同的语法和语义关系。这种设计让模型可以并行学习多样的语言特征，提升表示能力。
			</p>
		</div>
		<div class="article-subsection-l2">
			<h4>步骤 3：Masked Self-Attention</h4>
			<p>
				在每个 head 中，我们会执行 masked self-attention
				计算。这个机制让模型在生成序列时关注输入中的相关部分，同时避免访问未来 tokens。
			</p>

			<div class="figure">
				<img src="./article_assets/attention.png" width="80%" align="middle" />
			</div>
			<div class="figure-caption">
				图 <span class="attention">3</span>。使用 Query、Key 和 Value 矩阵计算 masked
				self-attention。
			</div>

			<ul>
				<li>
					<strong>Dot Product</strong>：
					<span class="q-color">Query</span>
					和 <span class="k-color">Key</span> 矩阵的点积会决定
					<strong>attention score</strong>，生成一个方阵，用来反映所有输入 tokens 之间的关系。
				</li>
				<li>
					<strong>Scaling · Mask</strong>：attention scores 会先被缩放，然后在 attention matrix
					的上三角区域应用 mask，防止模型访问未来
					tokens，并把这些位置设为负无穷。模型需要学会在不“偷看”未来的情况下预测下一个 token。
				</li>
				<li>
					<strong>Softmax · Dropout</strong>：经过 masking 和 scaling 之后，attention scores 会通过
					softmax 转换成概率，随后可选择用 dropout 做正则化。矩阵中每一行的和为 1，表示左侧其他
					tokens 与当前 token 的相关程度。
				</li>
			</ul>
		</div>
		<div class="article-subsection-l2">
			<h4>步骤 4：输出与拼接</h4>
			<p>
				模型会使用 masked self-attention scores，并将其与
				<span class="v-color">Value</span> 矩阵相乘，得到 self-attention 机制的
				<span class="purple-color">final output</span>
				。GPT-2 有 <code>12</code> 个 self-attention heads，每个 head 捕捉 tokens 之间不同类型的关系。这些
				heads 的输出会被拼接起来，再通过一个 linear projection。
			</p>
		</div>
	</div>

	<div class="article-section" id="article-activation" data-click="article-mlp">
		<h3>MLP：Multi-Layer Perceptron</h3>

		<div class="figure">
			<img src="./article_assets/mlp.png" width="70%" align="middle" />
		</div>
		<div class="figure-caption">
			图 <span class="attention">4</span>。使用 MLP layer 将 self-attention
			表示投影到更高维度，以增强模型的表示能力。
		</div>

		<p>
			多个 self-attention heads 捕捉输入 tokens 之间的多样关系后，拼接后的输出会进入 Multilayer
			Perceptron（MLP）layer，以增强模型的表示能力。MLP block 由两个 linear transformations
			组成，中间夹着一个
			<a
				href="https://en.wikipedia.org/wiki/Rectified_linear_unit#Gaussian-error_linear_unit_(GELU)"
				>GELU</a
			> activation function。
		</p>
		<p>
			第一个 linear transformation 会把输入维度扩大 4 倍，从 <code>768</code>
			变为
			<code>3072</code>。这个 expansion step 让模型可以把 token representations
			投影到更高维空间，从而捕捉在原始维度中可能看不到的更丰富、更复杂的模式。
		</p>
		<p>
			第二个 linear transformation 再把维度压回原始大小 <code>768</code>。这个 compression step
			会把表示带回可管理的尺寸，同时保留 expansion step 中引入的有用非线性变换。
		</p>
		<p>
			不同于会跨 tokens 整合信息的 self-attention 机制，MLP 会独立处理每个 token，只是把每个 token
			representation 从一个空间映射到另一个空间，从而提升整体模型能力。
		</p>
	</div>

	<div class="article-section" id="article-prob" data-click="article-prob">
		<h2>输出概率</h2>
		<p>
			输入经过所有 Transformer blocks 处理后，输出会进入最终 linear layer，为 token prediction
			做准备。这个 layer 会把最终表示投影到一个 <code>50,257</code> 维空间，其中词表中的每个 token
			都有一个对应数值，称为
			<code>logit</code>。任何 token
			都可能成为下一个词，因此这个过程让我们可以按“成为下一个词”的可能性对这些 tokens
			排序。随后我们应用 softmax function，把 logits 转换成总和为 1 的 probability
			distribution，从而可以根据概率采样下一个 token。
		</p>

		<div class="figure py-5">
			<img src="./article_assets/softmax.png" width="70%" />
		</div>
		<div class="figure-caption">
			图 <span class="attention">5</span>。词表中的每个 token 都会根据模型输出 logits
			得到一个概率。这些概率决定了每个 token 成为序列中下一个词的可能性。
		</div>

		<p id="article-temperature" data-click="article-temperature">
			最后一步是从这个分布中采样，生成下一个 token。<code>temperature</code>
			这个 hyperparameter 在这一过程中很关键。从数学上看，它是一个非常简单的操作：模型输出 logits 只需要除以
			<code>temperature</code>：
		</p>

		<ul>
			<li>
				<code>temperature = 1</code>：logits 除以 1，对 softmax 输出没有影响。
			</li>
			<li>
				<code>temperature &lt; 1</code>：较低的 temperature 会让 probability distribution
				更尖锐，使模型更自信、更确定，输出也更可预测。
			</li>
			<li>
				<code>temperature &gt; 1</code>：较高的 temperature 会让 probability distribution
				更平滑，使生成文本中有更多随机性，也就是一些人所说的模型<em>“创造力”</em>。
			</li>
		</ul>

		<p id="article-sampling" data-click="article-sampling">
			此外，采样过程还可以通过 <code>top-k</code> 和
			<code>top-p</code> 参数进一步细化：
		</p>
		<ul>
			<li>
				<code>top-k sampling</code>：把候选 tokens 限制在概率最高的前 k 个 token
				中，过滤掉可能性较低的选项。
			</li>
			<li>
				<code>top-p sampling</code>：选择累计概率超过阈值 p 的最小 token 集合，既确保主要由高概率
				tokens 参与生成，又保留一定多样性。
			</li>
		</ul>
		<p>
			通过调节 <code>temperature</code>、<code>top-k</code> 和
			<code>top-p</code>，你可以在确定性输出和多样性输出之间取得平衡，让模型行为更贴近具体需求。
		</p>
	</div>

	<div class="article-section" data-click="article-advanced-features">
		<h2>辅助架构特性</h2>

		<p>
			Transformer
			模型中还有几种辅助架构特性可以提升性能。它们对模型整体表现很重要，但对于理解架构核心概念来说，不如前面的组件关键。Layer
			Normalization、Dropout 和 Residual Connections 都是 Transformer
			模型中的重要组成部分，尤其是在训练阶段。Layer Normalization
			可以稳定训练并帮助模型更快收敛；Dropout 通过随机停用神经元来防止过拟合；Residual Connections
			则允许梯度更直接地流过网络，帮助缓解梯度消失问题。
		</p>
		<div class="article-subsection" id="article-ln">
			<h3>Layer Normalization</h3>

			<p>
				Layer Normalization 有助于稳定训练过程并改善收敛。它会沿特征维度对输入进行归一化，确保
				activations 的均值和方差保持一致。这种归一化可以缓解 internal covariate shift
				相关问题，让模型更有效地学习，并降低对初始权重的敏感性。在每个 Transformer block 中，Layer
				Normalization 会应用两次：一次在 self-attention 机制之前，一次在 MLP layer 之前。
			</p>
		</div>
		<div class="article-subsection" id="article-dropout">
			<h3>Dropout</h3>

			<p>
				Dropout 是一种 regularization
				技术，会在训练过程中随机把一部分模型权重设为零，用来防止神经网络过拟合。这会鼓励模型学习更稳健的特征，减少对特定神经元的依赖，从而帮助网络更好地泛化到未见过的新数据。在模型推理期间，dropout
				会被停用。这本质上意味着我们在使用训练得到的多个子网络的集成效果，从而带来更好的模型表现。
			</p>
		</div>
		<div class="article-subsection" id="article-residual">
			<h3>Residual Connections</h3>

			<p>
				Residual connections 最早在 2015 年的 ResNet
				模型中提出。这个架构创新让非常深的神经网络变得可训练，也由此改变了深度学习。简单来说，residual
				connections 是绕过一层或多层的捷径，会把某一层的输入加到它的输出上。这有助于缓解 vanishing
				gradient 问题，让堆叠多个 Transformer blocks 的深层网络更容易训练。在 GPT-2 中，每个
				Transformer block 内会使用两次 residual connections：一次在 MLP
				之前，一次在之后，从而确保梯度更容易流动，并让更早的层在反向传播中获得足够更新。
			</p>
		</div>
	</div>

	<div class="article-section" data-click="article-interactive-features">
		<h1>交互功能</h1>
		<p>
			Transformer Explainer 被设计成可交互的形式，方便你探索 Transformer
			的内部工作机制。下面是一些你可以直接尝试的交互功能：
		</p>

		<ul>
			<li>
				<strong>输入你自己的文本序列</strong>，观察模型如何处理它并预测下一个词。你可以探索
				attention weights、中间计算过程，以及最终输出概率的计算方式。
			</li>
			<li>
				<strong>使用 temperature slider</strong> 控制模型预测的随机性。通过改变 temperature 值，可以观察如何让模型输出更确定，或更有创造性。
			</li>
			<li>
				<strong>选择 top-k 和 top-p sampling methods</strong> 来调整推理期间的采样行为。试试不同取值，观察
				probability distribution 如何变化，以及它如何影响模型预测。
			</li>
			<li>
				<strong>与 attention maps 交互</strong>，查看模型如何关注输入序列中的不同
				tokens。将鼠标悬停在 tokens 上可以高亮它们的 attention
				weights，并探索模型如何捕捉上下文和词语关系。
			</li>
		</ul>
	</div>

	<div class="article-section" data-click="article-video">
		<h2>视频教程</h2>
		<div class="video-container">
			<iframe
				src="https://www.youtube.com/embed/ECR4oAwocjs"
				frameborder="0"
				allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
				allowfullscreen
			>
			</iframe>
		</div>
	</div>

	<div class="article-section" data-click="article-implementation">
		<h2>Transformer Explainer 是如何实现的？</h2>
		<p>
			Transformer Explainer 内置了一个直接在浏览器中运行的实时 GPT-2（small）模型。这个模型来自
			Andrej Karpathy 的
			<a href="https://github.com/karpathy/nanoGPT" title="Github" target="_blank"
				>nanoGPT project</a
			>
			中的 GPT PyTorch 实现，并已转换为
			<a href="https://onnxruntime.ai/" title="ONNX" target="_blank">ONNX Runtime</a>
			，以便在浏览器中流畅执行。界面使用 JavaScript 构建，并采用
			<a href="https://kit.svelte.dev/" title="Svelte" target="_blank">Svelte</a>
			作为前端框架，使用
			<a href="https://d3js.org/" title="D3" target="_blank">D3.js</a>
			创建动态可视化。数值会随着用户输入实时更新。
		</p>
	</div>

	<div class="article-section" data-click="article-credit">
		<h2>谁开发了 Transformer Explainer？</h2>
		<p>
			Transformer Explainer 由

			<a href="https://aereeeee.github.io/" target="_blank">Aeree Cho</a>,
			<a href="https://www.linkedin.com/in/chaeyeonggracekim/" target="_blank">Grace C. Kim</a>,
			<a href="https://alexkarpekov.com/" target="_blank">Alexander Karpekov</a>,
			<a href="https://alechelbling.com/" target="_blank">Alec Helbling</a>,
			<a href="https://zijie.wang/" target="_blank">Jay Wang</a>,
			<a href="https://seongmin.xyz/" target="_blank">Seongmin Lee</a>,
			<a href="https://bhoov.com/" target="_blank">Benjamin Hoover</a> 和
			<a href="https://poloclub.github.io/polochau/" target="_blank">Polo Chau</a>

			在 Georgia Institute of Technology 开发。
		</p>
	</div>
</div>

<style lang="scss">
	a {
		color: theme('colors.blue.500');

		&:hover {
			color: theme('colors.blue.700');
		}
	}

	.bold-purple {
		color: theme('colors.purple.700');
		font-weight: bold;
	}

	code {
		color: theme('colors.gray.500');
		background-color: theme('colors.gray.50');
		font-family: theme('fontFamily.mono');
	}

	.q-color {
		color: theme('colors.blue.400');
	}

	.k-color {
		color: theme('colors.red.400');
	}

	.v-color {
		color: theme('colors.green.400');
	}

	.purple-color {
		color: theme('colors.purple.500');
	}

	.article-section {
		padding-bottom: 2rem;
	}
	.architecture-section {
		padding-top: 1rem;
	}
	.video-container {
		position: relative;
		padding-bottom: 56.25%; /* 16:9 aspect ratio */
		height: 0;
		overflow: hidden;
		max-width: 100%;
		background: #000;
	}

	.video-container iframe {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
	}

	#description {
		padding-bottom: 3rem;
		margin-left: auto;
		margin-right: auto;
		max-width: 78ch;
	}

	#description h1 {
		color: theme('colors.purple.700');
		font-size: 2.2rem;
		font-weight: 300;
		padding-top: 1rem;
	}

	#description h2 {
		// color: #444;
		color: theme('colors.purple.700');
		font-size: 2rem;
		font-weight: 300;
		padding-top: 1rem;
	}

	#description h3 {
		color: theme('colors.gray.700');
		font-size: 1.6rem;
		font-weight: 200;
		padding-top: 1rem;
	}

	#description h4 {
		color: theme('colors.gray.700');
		font-size: 1.6rem;
		font-weight: 200;
		padding-top: 1rem;
	}

	#description p {
		margin: 1rem 0;
	}

	#description p img {
		vertical-align: middle;
	}

	#description .figure-caption {
		font-size: 0.8rem;
		margin-top: 0.5rem;
		text-align: center;
		margin-bottom: 2rem;
	}

	#description ol {
		margin-left: 3rem;
		list-style-type: decimal;
	}

	#description li {
		margin: 0.6rem 0;
	}

	#description p,
	#description div,
	#description li {
		color: theme('colors.gray.600');
		line-height: 1.6;
	}

	#description small {
		font-size: 0.8rem;
	}

	#description ol li img {
		vertical-align: middle;
	}

	#description .video-link {
		color: theme('colors.blue.600');
		cursor: pointer;
		font-weight: normal;
		text-decoration: none;
	}

	#description ul {
		list-style-type: disc;
		margin-left: 2.5rem;
		margin-bottom: 1rem;
	}

	#description a:hover,
	#description .video-link:hover {
		text-decoration: underline;
	}

	.figure,
	.video {
		width: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
	}
</style>

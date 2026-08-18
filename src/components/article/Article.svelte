<script>
	import Katex from '~/utils/Katex.svelte';
</script>

<div id="description">
	<div class="article-section" data-click="article-intro">
		<h1>什么是 Transformer？</h1>

		<p>
			Transformer 是一种神经网络架构，它从根本上改变了我们处理人工智能任务的方式。 Transformer
			最早在 2017 年那篇具有里程碑意义的论文
			<a
				href="https://dl.acm.org/doi/10.5555/3295222.3295349"
				title="ACM Digital Library"
				target="_blank">《Attention is All You Need》</a
			>
			中被提出，此后逐渐成为深度学习模型的主流架构，支撑了许多文本生成模型，例如 OpenAI 的
			<strong>GPT</strong>、Meta 的 <strong>Llama</strong>、以及 Google 的
			<strong>Gemini</strong>。 除了文本领域之外，Transformer 也被广泛应用于
			<a
				href="https://huggingface.co/learn/audio-course/en/chapter3/introduction"
				title="Hugging Face"
				target="_blank">音频生成</a
			>、
			<a
				href="https://huggingface.co/learn/computer-vision-course/unit3/vision-transformers/vision-transformers-for-image-classification"
				title="Hugging Face"
				target="_blank">图像识别</a
			>、
			<a href="https://elifesciences.org/articles/82819" title="eLife">蛋白质结构预测</a>，甚至
			<a
				href="https://www.deeplearning.ai/the-batch/reinforcement-learning-plus-transformers-equals-efficiency/"
				title="Deep Learning AI"
				target="_blank">博弈与游戏对局</a
			>等任务，展现出在众多领域中的强大通用性。
		</p>
		<p>
			从本质上看，自回归文本生成模型会反复进行<strong>“下一个词元预测”</strong>：
			给定用户输入的一段提示文本（prompt），模型要判断在这段输入之后，<em>下一个词元</em
			>可能是什么。 Transformer
			的核心创新与能力来自于自注意力（self-attention）机制，它允许模型在一次前向计算中同时处理整段序列，
			并且比以往的架构更有效地捕捉长距离依赖关系。
		</p>
		<p>
			GPT-2 系列模型是文本生成 Transformer 的一个代表性家族。 本 Transformer Explainer 使用的是
			<a href="https://huggingface.co/openai-community/gpt2" title="Hugging Face" target="_blank"
				>GPT-2</a
			>
			small 模型，它大约拥有 1.24 亿个参数。 虽然它并不是目前最新或最强大的 Transformer 模型，但在结构上与许多当前的前沿大模型共享大量组件与设计原则，
			因此非常适合作为理解 Transformer 基本原理的入门模型。 它主要使用英文语料训练，英文提示文本的效果更稳定。中文文本也能被分词器编码，
			但切分方式和生成能力不等同于面向中文训练的模型。本项目汉化的是操作界面和教学解释，底层模型仍是英文
			GPT-2 Small。
		</p>
	</div>

	<div class="article-section" data-click="article-overview">
		<h1>Transformer 的整体架构</h1>

		<p>
			每一个文本生成类 Transformer 大体上都由以下 <strong>三个关键组件</strong> 组成：
		</p>
		<ol>
			<li>
				<strong class="bold-purple">嵌入（Embedding）</strong>：将输入文本切分成更小的单元，称为
				token， token 可以是单词，也可以是子词（subword）。这些 token 会被转换为数值向量，称为
				embedding， 用于捕捉词语的语义含义。
			</li>
			<li>
				<strong class="bold-purple">Transformer 块（Transformer Block）</strong
				>：这是模型的基本构建单元，用来对输入表示进行处理和变换。 每个 block 内通常包含：
				<ul class="">
					<li>
						<strong>注意力机制（Attention Mechanism）</strong>：Transformer block 的核心组件。
						它允许不同 token 之间相互“交流”，从而捕捉上下文信息以及词与词之间的关系。
					</li>
					<li>
						<strong>多层感知机（MLP，Multi-Layer Perceptron）层</strong>：一个逐 token
						的前馈神经网络。 在注意力层负责在 token 之间路由信息之后，MLP 的目标是进一步精炼每个
						token 的表示。
					</li>
				</ul>
			</li>
			<li>
				<strong class="bold-purple">输出概率（Output Probabilities）</strong>： 最后的线性层与
				softmax 层会把处理后的 embedding 转换为概率分布， 模型据此对序列中下一个 token 进行预测。
			</li>
		</ol>
	</div>

	<div class="article-section" id="embedding" data-click="article-embedding">
		<h2>嵌入（Embedding）</h2>
		<p>
			假设你想用这个 Transformer 模型来生成文本，并输入界面中的示例提示：
			<code>Data visualization empowers users to</code>。
			这段输入首先需要被转换成一种模型可以理解并处理的形式。 这就是 embedding
			的作用：它会把文本转换成模型可操作的数值表示。 要将一个 prompt 变成
			embedding，通常要经过以下几步： 1）对输入进行分词（tokenization）；2）取得对应的 token
			embedding； 3）取得可学习的位置嵌入（positional
			embedding）；4）将词元嵌入与位置嵌入相加，得到最终的嵌入表示。
			下面我们逐步看看这些步骤是如何完成的。
		</p>
		<div class="figure">
			<img
				src="./article_assets/embedding.png"
				width="65%"
				alt="词元化、词元嵌入与位置嵌入相加的过程"
			/>
		</div>
		<div class="figure-caption">
			图 <span class="attention">1</span>：展开 Embedding 层的结构，展示输入 prompt
			如何被转换为向量表示。 这一过程包括 <span class="fig-numbering">(1)</span> 词元化（Tokenization）、(2)
			词元嵌入、(3) 位置嵌入，以及 (4) 最终嵌入。
		</div>
		<div class="article-subsection">
			<h3>步骤 1：词元化（Tokenization）</h3>
			<p>
				词元化是把输入文本转换为词元序列的过程。词元可能是完整单词、子词、标点或空格与文本的组合。
				项目实际使用的 GPT-2 分词器会把
				<code>Data visualization empowers users to</code> 切分为
				<code>["Data", " visualization", " em", "powers", " users", " to"]</code>， 对应词元 ID 为
				<code>[6601, 32704, 795, 30132, 2985, 284]</code>。 模型在训练之前会先确定一个固定的 token
				词表：GPT-2 的词表大小为
				<code>50,257</code> 个唯一 token。 当我们把输入文本拆分成带有各自 ID 的 token 后，就可以根据
				embedding 矩阵为它们取出向量表示。
			</p>
		</div>
		<div class="article-subsection" id="article-token-embedding">
			<h3>步骤 2：Token Embedding（词元嵌入向量）</h3>
			<p>
				GPT-2（small）为词表中的每个 token 分配了一个 768 维的向量； 具体维度取决于模型规模。
				所有这些 embedding 向量被存储在一个形状为 <code>(50,257, 768)</code> 的矩阵中， 总参数量大约为
				3900 万。 通过这张庞大的矩阵，模型可以为每个 token 赋予语义上的“位置”和含义。
			</p>
		</div>
		<div class="article-subsection" id="article-positional-embedding">
			<h3>步骤 3：位置嵌入（Positional Embedding）</h3>
			<p>
				嵌入层还会为每个词元加入它在提示文本中的位置信息。“位置编码”是这类方法的统称； GPT-2
				的具体实现使用可学习的位置嵌入矩阵，并在训练中更新其中的参数，
				使序列中不同位置的词元可以被区分开来。
			</p>

			<!-- 保留原来的注释块（说明其他位置编码方式），因为对页面展示没有影响 -->
		</div>
		<div class="article-subsection">
			<h3>步骤 4：Final Embedding（最终嵌入）</h3>
			<p>
				最后，将词元嵌入与位置嵌入相加，得到送入第一个 Transformer 块的表示。
				这一组合既包含词元信息，也包含它在序列中的位置信息。
			</p>
		</div>
	</div>

	<div class="article-section" data-click="article-transformer-block">
		<h2>Transformer 块（Transformer Block）</h2>

		<p>
			Transformer 的主要计算单元在于 Transformer 块（Transformer
			block），它由多头自注意力（self-attention）和一个 多层感知机（MLP，Multi-Layer
			Perceptron）层构成。 大多数模型会把多个这样的 block 顺序堆叠起来。 随着数据在一个个 block
			中向前传递，token 的表示会逐层演化： 从第一层到最后一层，模型逐渐构建起对每个 token
			更加复杂的高阶表示。 这种分层表示方式使模型能够对输入进行多层次理解。 我们当前展示的
			GPT-2（small）模型总共有 <code>12</code> 个这样的 block。
		</p>
	</div>

	<div class="article-section" id="self-attention" data-click="article-attention">
		<h3>多头自注意力（Multi-Head Self-Attention）</h3>
		<p>
			自注意力（self-attention）机制使模型能够在序列中关注与当前 token 相关的其他位置，
			从而捕捉复杂的关系与依赖。 下面我们分步骤看看 self-attention 是如何计算的。
		</p>
		<div class="article-subsection-l2">
			<h4>步骤 1：Query、Key 与 Value 矩阵</h4>

			<div class="figure pt-10">
				<img src="./article_assets/QKV.png" width="80%" alt="由输入嵌入计算查询、键和值矩阵" />
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
				图 <span class="attention">2</span>：从原始 embedding 计算得到 Query、Key 与 Value
				三个矩阵。
			</div>

			<p>
				每个 token 的 embedding 向量会被映射成三个向量：
				<span class="q-color">查询 Query（Q）</span>、
				<span class="k-color">键 Key（K）</span> 和
				<span class="v-color">值 Value（V）</span>。 这些向量是通过将输入 embedding 矩阵分别与
				Q、K、V 的参数矩阵相乘得到的。 你可以把它类比成一次网络搜索来直观理解这三者的含义：
			</p>
			<ul>
				<li>
					<strong class="q-color font-medium">查询 Query（Q）</strong> 就像是你在搜索框中输入的那行查询文本，
					它代表“当前这个 token 想要查找的信息”。
				</li>
				<li>
					<strong class="k-color font-medium">键 Key（K）</strong> 类似搜索结果中每个网页的标题， 代表“可以被关注的候选
					token”。
				</li>
				<li>
					<strong class="v-color font-medium">值 Value（V）</strong> 则对应网页的具体内容。 当我们找到哪些结果（键
					Key）与查询 Query 最匹配之后，就会去读取这些网页的内容（值 Value）。
				</li>
			</ul>
			<p>
				通过这些 Q、K、V 向量，模型可以计算出注意力分数（attention score），
				从而决定在生成预测时每个 token 应该关注序列中的哪些位置。
			</p>
		</div>
		<div class="article-subsection-l2">
			<h4>步骤 2：Multi-Head（多头拆分）</h4>
			<p>
				<span class="q-color">Query</span>、<span class="k-color">Key</span> 和
				<span class="v-color">Value</span>
				向量会被进一步拆分成多个 head。 以 GPT-2（small）为例，它一共有 <code>12</code> 个 attention
				head。 每一个 head 都会在自己的子空间里独立地处理 embedding， 从而捕捉不同层面的句法和语义关系。
				这种多头设计使模型能够并行学习多种不同类型的语言特征，提升表达能力。
			</p>
		</div>
		<div class="article-subsection-l2">
			<h4>步骤 3：带掩码的自注意力（Masked Self-Attention）</h4>
			<p>
				在每个 head 中，我们会执行 masked self-attention 的计算。
				这一机制允许模型在生成序列时关注输入中已经出现的部分， 同时通过掩码屏蔽掉“未来”的
				token，避免看到还未生成的内容。
			</p>

			<div class="figure">
				<img
					src="./article_assets/attention.png"
					width="80%"
					align="middle"
					alt="带因果掩码的自注意力计算流程"
				/>
			</div>
			<div class="figure-caption">
				图 <span class="attention">3</span>：利用 Query、Key 和 Value 矩阵计算带掩码的
				self-attention。
			</div>

			<ul>
				<li>
					<strong>注意力得分（Attention Score）</strong>：
					<span class="q-color">查询 Query</span> 与 <span class="k-color">键 Key</span> 矩阵的点积 会得到一个方阵，描述每个
					query 与每个 key 之间的匹配程度， 从而反映所有输入 token 之间的关系。
				</li>
				<li>
					<strong>掩码处理（Masking）</strong>：
					我们会对注意力矩阵的上三角部分施加一个掩码，把这些位置的值设置为负无穷，
					从而阻止模型访问未来的 token。 模型必须在不了解“未来”情况下学会预测下一个 token。
				</li>
				<li>
					<strong>Softmax 归一化（Softmax）</strong>： 在掩码之后，我们对 attention score 施加
					softmax，将其转换为概率。 softmax 会对每一行做归一化，使其和为 1，这一行就表示当前 token
					对它左侧所有 token 的关注程度分布。
				</li>
			</ul>
		</div>
		<div class="article-subsection-l2">
			<h4>步骤 4：输出与拼接（Output & Concatenation）</h4>
			<p>
				模型使用带掩码的 self-attention 得到的权重矩阵与
				<span class="v-color">Value</span> 矩阵相乘， 从而得到 self-attention 机制的
				<span class="purple-color">最终输出</span>。 GPT-2 拥有 <code>12</code> 个 self-attention head，每一个都捕捉不同的
				token 关系。 所有 head 的输出会被拼接（concatenate）在一起，并通过一个线性变换进行投影。
			</p>
		</div>
	</div>

	<div class="article-section" id="article-activation" data-click="article-mlp">
		<h3>MLP：多层感知机（Multi-Layer Perceptron）</h3>

		<div class="figure">
			<img
				src="./article_assets/mlp.png"
				width="70%"
				align="middle"
				alt="GPT-2 多层感知机的升维、激活与降维过程"
			/>
		</div>
		<div class="figure-caption">
			图 <span class="attention">4</span>：通过 MLP 层将 self-attention 的表示投射到更高维空间，
			以增强模型的表示能力。
		</div>

		<p>
			在多个 self-attention head 捕捉到输入 token 之间的多种关系之后， 它们的拼接输出会被送入
			Multilayer Perceptron（MLP）层，进一步增强模型的表达能力。 MLP block
			通常由两层线性变换和中间的 GELU 激活函数构成。 第一层线性变换会将向量维度从 <code>768</code>
			扩展到 <code>3072</code>（四倍）； 第二层线性变换则把维度再缩回
			<code>768</code>，以便后续层继续使用统一的表示维度。 与 self-attention 不同，MLP 对每个 token
			独立地进行处理， 更像是把 token 从一种表示空间映射到另一种更适合任务的空间。
		</p>
	</div>

	<div class="article-section" id="article-prob" data-click="article-prob">
		<h2>输出概率（Output Probabilities）</h2>
		<p>
			当输入序列依次通过所有 Transformer blocks 处理完成后，
			我们会将最后一层的输出送入最终的线性层，以便为 token 预测做准备。 这一线性层会把表示投射到一个 <code
				>50,257</code
			>
			维的空间， 词表中的每一个 token 都会对应一个数值，称为 <code>logit</code>。
			从理论上讲，任何一个 token 都可能成为下一个词， 因此我们可以简单地按这些 logit 的大小对 token
			排序， 来衡量它们成为“下一个词”的可能性。 随后，我们对这些 logit 施加
			softmax，将它们转换为和为 1 的概率分布， 接着就可以按照概率去采样下一个 token。
		</p>

		<div class="figure py-5">
			<img
				src="./article_assets/softmax.png"
				width="70%"
				alt="从 logit 经温度缩放和采样筛选得到词元概率"
			/>
		</div>
		<div class="figure-caption">
			图 <span class="attention">5</span>：词表中的每个 token 都会根据模型输出的
			logit（未归一化分数）被赋予一个概率。 这些概率共同决定了各个 token 作为“下一个词”的可能性。
		</div>

		<p id="article-temperature" data-click="article-temperature">
			最后一步，是从这个概率分布中采样下一个 token。 在这一过程中，超参数 <code>temperature</code
			>（温度）起着关键作用。 从数学上看，它的操作非常简单： 模型输出的未归一化分数（logits）会被
			<code>temperature</code> 除以：
		</p>

		<ul>
			<li>
				<code>temperature = 1</code>：用 1 去除 logits 不会改变 softmax 的输出结果。
			</li>
			<li>
				<code>temperature &lt; 1</code>：较小的温度会让概率分布更“尖锐”，
				模型会更自信、更偏向确定性的输出，生成结果更可预测。
			</li>
			<li>
				<code>temperature &gt; 1</code>：较大的温度会让概率分布更“平缓”，
				模型输出会带来更多随机性，有时会被描述为更具“创造力”。
			</li>
		</ul>

		<p id="article-sampling" data-click="article-sampling">
			此外，我们还可以通过设置 <code>top-k</code> 与 <code>top-p</code> 参数， 进一步控制采样过程的行为：
		</p>
		<ul>
			<li>
				<code>top-k sampling</code>：只保留概率最高的 k 个候选 token，
				把其余概率较小的候选全部过滤掉。
			</li>
			<li>
				<code>top-p sampling</code>：按概率从高到低排序，保留累计概率达到或超过阈值 p
				的最小候选集合。
			</li>
		</ul>
		<p>
			候选集合确定后，会把其余词元过滤掉，并对保留候选的概率重新归一化，再从中采样。 通过调节 <code
				>temperature</code
			>、<code>top-k</code> 与 <code>top-p</code>，
			我们可以在“确定性”与“多样性”之间找到平衡点，从而让模型的生成行为更符合具体应用需求。
		</p>
	</div>

	<div class="article-section" data-click="article-advanced-features">
		<h2>更高级的架构特性</h2>

		<p>
			Transformer 模型中还包含一些更高级的架构设计，用来进一步提升性能。
			虽然它们对整体效果非常重要，但对理解 Transformer 的核心思路来说并非第一优先级。 Layer
			Normalization、Dropout 和 Residual Connections 是其中极为关键的三个组件，
			特别是在模型训练阶段发挥着重要作用。 Layer Normalization 用来稳定训练，使模型更容易收敛；
			Dropout 通过随机“关闭”一部分神经元来防止过拟合； Residual Connections
			则为梯度提供了更直接的传播路径，缓解梯度消失问题。
		</p>
		<div class="article-subsection" id="article-ln">
			<h3>层归一化（Layer Normalization）</h3>

			<p>
				Layer Normalization 的作用是稳定训练过程并加速收敛。
				它通过在特征维度上对输入进行归一化，使激活值的均值和方差保持在一个较稳定的范围内。
				这种归一化有助于减轻内部协变量偏移（internal covariate shift）问题，
				从而使模型更高效地学习，并降低对初始权重的敏感性。 GPT-2 使用 Pre-LN 结构：每个 Transformer
				块在自注意力前和 MLP 前各执行一次层归一化；
				所有块处理完成后，还会在输出映射之前执行一次最终层归一化。
			</p>
		</div>
		<div class="article-subsection" id="article-dropout">
			<h3>Dropout 随机失活</h3>

			<p>
				Dropout 是一种常用的正则化技术，用于在训练过程中防止神经网络过拟合。
				它通过随机将一部分神经元的输出置零，迫使模型不能过度依赖某几个特定神经元，
				从而学习到更鲁棒、泛化性更好的特征。 在推理阶段（inference）中，Dropout 会被关闭。
				你可以把这理解为在训练时隐式地训练了许多子网络，推理时等价于在使用它们的“集成模型”，
				这往往能带来更好的性能。
			</p>
		</div>
		<div class="article-subsection" id="article-residual">
			<h3>残差连接（Residual Connections）</h3>

			<p>
				Residual Connections（残差连接）最早在 2015 年的 ResNet 模型中被提出。
				这一结构创新极大地推动了深度网络的发展，使得训练非常深的神经网络成为可能。
				简单来说，残差连接就是在层与层之间添加一条“捷径”， 把某一层的输入直接加到它的输出上。
				这能显著缓解深层网络中的梯度消失问题，让梯度更容易穿过多层网络传播。 在 GPT-2 中，每个
				Transformer block 内都会使用两次残差连接： 一次围绕 self-attention，一次围绕 MLP，
				从而保证梯度可以顺畅地回流到更前面的层，获得充分的更新。
			</p>
		</div>
	</div>

	<div class="article-section" data-click="article-interactive-features">
		<h1>交互特性</h1>
		<p>
			Transformer Explainer 被设计成一个高度交互式的可视化工具， 可以帮助你探索 Transformer
			内部的工作机制。 你可以在界面中尝试以下这些交互操作：
		</p>

		<ul>
			<li>
				<strong>输入你自己的文本序列</strong>，观察模型如何处理这段输入并预测下一个词。
				你可以查看注意力权重、中间计算结果，以及最终输出概率是如何得到的。
			</li>
			<li>
				<strong>使用温度（temperature）滑块</strong> 来控制模型生成结果的随机性。 通过调整温度，你可以体验从“几乎完全确定”到“更加发散、富有创造性”的不同输出风格。
			</li>
			<li>
				<strong>选择 top-k 和 top-p 采样方式</strong>，调节推理阶段的采样策略。
				你可以尝试不同的参数设置，观察概率分布如何变化，以及这如何影响模型的预测结果。
			</li>
			<li>
				<strong>与注意力可视化图进行交互</strong>，查看模型在输入序列中关注了哪些 token。
				将鼠标悬停在不同 token 上，可以高亮它们的注意力权重，
				从而帮助你理解模型是如何通过注意力来捕捉上下文和词语之间关系的。
			</li>
		</ul>
	</div>

	<div class="article-section" data-click="article-video">
		<h2>视频教程</h2>
		<div class="video-container">
			<iframe
				src="https://www.youtube.com/embed/ECR4oAwocjs"
				title="Transformer Explainer 视频教程"
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
			Transformer Explainer 在浏览器中直接运行一个实时的 GPT-2（small）模型。 该模型基于 Andrej
			Karpathy 的
			<a href="https://github.com/karpathy/nanoGPT" title="Github" target="_blank">nanoGPT 项目</a>
			中的 PyTorch 实现，并被转换为
			<a href="https://onnxruntime.ai/" title="ONNX" target="_blank">ONNX Runtime</a>
			格式以便在浏览器中高效推理。 前端界面使用 JavaScript 构建，采用
			<a href="https://kit.svelte.dev/" title="Svelte" target="_blank">Svelte</a>
			作为前端框架，并使用
			<a href="https://d3js.org/" title="D3" target="_blank">D3.js</a>
			来绘制动态可视化。 在你与界面交互、输入文本的过程中，相关的数值会被实时更新。
		</p>
	</div>

	<div class="article-section" data-click="article-credit">
		<h2>谁开发了 Transformer Explainer？</h2>
		<p>
			Transformer Explainer 由以下开发者共同完成：

			<a href="https://aereeeee.github.io/" target="_blank">Aeree Cho</a>、
			<a href="https://www.linkedin.com/in/chaeyeonggracekim/" target="_blank">Grace C. Kim</a>、
			<a href="https://alexkarpekov.com/" target="_blank">Alexander Karpekov</a>、
			<a href="https://alechelbling.com/" target="_blank">Alec Helbling</a>、
			<a href="https://zijie.wang/" target="_blank">Jay Wang</a>、
			<a href="https://seongmin.xyz/" target="_blank">Seongmin Lee</a>、
			<a href="https://bhoov.com/" target="_blank">Benjamin Hoover</a>，以及
			<a href="https://poloclub.github.io/polochau/" target="_blank">Polo Chau</a>， 他们都来自
			Georgia Institute of Technology（佐治亚理工学院）。
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
		padding-left: 1rem;
		padding-right: 1rem;
		margin-left: auto;
		margin-right: auto;
		width: 100%;
		max-width: 78ch;
		box-sizing: border-box;
		overflow-wrap: anywhere;
	}

	#description h1 {
		color: theme('colors.purple.700');
		font-size: 2.1rem;
		font-weight: 600;
		padding-top: 1rem;
		letter-spacing: 0.01em;
		line-height: 1.3;
	}

	#description h2 {
		color: theme('colors.purple.700');
		font-size: 1.9rem;
		font-weight: 600;
		padding-top: 1rem;
		letter-spacing: 0.01em;
		line-height: 1.35;
	}

	#description h3 {
		color: theme('colors.gray.700');
		font-size: 1.55rem;
		font-weight: 500;
		padding-top: 1rem;
		letter-spacing: 0.01em;
		line-height: 1.4;
	}

	#description h4 {
		color: theme('colors.gray.700');
		font-size: 1.45rem;
		font-weight: 500;
		padding-top: 1rem;
		letter-spacing: 0.01em;
		line-height: 1.4;
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
		margin-left: 2.4rem;
		list-style-type: decimal;
	}

	#description li {
		margin: 0.6rem 0;
	}

	#description p,
	#description div,
	#description li {
		color: theme('colors.gray.600');
		line-height: 1.7;
		letter-spacing: 0.01em;
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
		overflow-x: auto;
	}
</style>

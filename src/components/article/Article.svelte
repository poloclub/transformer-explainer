<script>
	import tailwindConfig from '../../../tailwind.config';
	import resolveConfig from 'tailwindcss/resolveConfig';
	import { base } from '$app/paths';

	// import Youtube from './Youtube.svelte';

	let softmaxEquation = `$$\\text{Softmax}(x_{i}) = \\frac{\\exp(x_i)}{\\sum_j \\exp(x_j)}$$`;
	let reluEquation = `$$\\text{ReLU}(x) = \\max(0,x)$$`;

	let currentPlayer;

	const { theme } = resolveConfig(tailwindConfig);
</script>

<div id="description">
	<div class="article-section">
		<h1>什么是 Transformer？</h1>

		<p>
			Transformer 首次出现在 2017 年的开创性论文
			<a
				href="https://dl.acm.org/doi/10.5555/3295222.3295349"
				title="ACM Digital Library"
				target="_blank">《Attention is All You Need》</a
			>
			中，此后已成为深度学习模型的首选架构，为 OpenAI
			的 <strong>GPT</strong>、Meta 的 <strong>Llama</strong> 和 Google 的
			<strong>Gemini</strong> 等文本生成模型提供支持。
			除了文本之外，Transformer 还应用于
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
			<a href="https://elifesciences.org/articles/82819" title="eLife"
				>蛋白质结构预测</a
			>，甚至
			<a
				href="https://www.deeplearning.ai/the-batch/reinforcement-learning-plus-transformers-equals-efficiency/"
				title="Deep Learning AI"
				target="_blank">游戏</a
			>中，展示了其在众多领域的多功能性。
		</p>
		<p>
			从根本上讲，文本生成 Transformer 模型的运行原理是<strong>下一个单词预测</strong>：给定用户的文本提示，
			紧随此输入之后的<em>最有可能的下一个单词</em>是什么？Transformer 的核心创新和强大之处在于它们使用了
			自注意力机制，这使得它们能够比以前的架构更有效地处理整个序列并捕获长距离依赖关系。
		</p>
		<p>
			GPT-2 系列模型是文本生成 Transformers 的杰出代表。Transformer Explainer 基于
			<a href="https://huggingface.co/openai-community/gpt2" title="Hugging Face" target="_blank"
				>GPT-2</a
			>
			(small)，该模型有 1.24 亿个参数。虽然它不是最新或最强大的 Transformer 模型，
			但它具有许多与当前最先进模型相同的架构组件和原理，使其成为理解基础知识的理想起点。
		</p>
	</div>

	<div class="article-section">
		<h1>Transformer 架构</h1>

		<p>
			每个文本生成 Transformer 都由以下<strong>三个关键组件</strong>组成：
		</p>
		<ol>
			<li>
				<strong class="bold-purple">嵌入（Embedding）</strong>：文本输入被划分为更小的单位，
				称为<strong>标记（token）</strong>，可以是单词或子单词。这些标记被转换成数值向量，称为<strong>嵌入（Embedding）</strong>，用于捕获单词的语义。
			</li>
			<li>
				<strong class="bold-purple">Transformer Block</strong> 是模型的基本构建块，用于处理和转换输入数据。
				每个块包括：
				<ul class="">
					<li>
						<strong>注意力机制（Attention Mechanism）</strong>，Transformer 模块的核心组件。它允许
						token 与其他 token 进行通信，从而捕获上下文信息和单词之间的关系。
					</li>
					<li>
						<strong>MLP 层（多层感知器 Multilayer Perceptron）</strong>, 
						一个独立对每个标记进行操作的前馈网络。注意层的目标是在标记之间路由
						信息，而 MLP 的目标是优化每个标记的表示。
					</li>
				</ul>
			</li>
			<li>
				<strong class="bold-purple">输出概率（Output Probabilities）</strong>：
				最后的线性层和 softmax 层将处理后的嵌入转换为概率，使模型能够对序列中的下一个标记做出预测。
			</li>
		</ol>

		<div class="architecture-section" id="embedding">
			<h2>嵌入</h2>
			<p>
				假设您想使用 Transformer 模型生成文本。您添加如下提示词（prompt）：<code>“Data visualization empowers users to”</code>。
				此输入需要转换为模型可以理解和处理的格式。这就是嵌入的作用所在：它将文本转换为模型可以使用的数字表示。要将提示转换为嵌入，
				我们需要 1) 对输入进行标记，2) 获取标记嵌入，3) 添加位置信息，最后 4) 将标记和位置编码相加以获得最终嵌入。
				让我们看看每个步骤是如何完成的。
			</p>
			<div class="figure">
				<img src="./article_assets/embedding.png" width="60%" height="60%" align="middle" />
			</div>
			<div class="figure-caption">
                图<span class="attention">1</span>，展开嵌入层视图，显示如何将输入提示转换为矢量表示。
				该过程涉及 <span class="fig-numbering">(1)</span>标记化(2)标记嵌入(3)位置编码和(4)最终嵌入
			</div>
			<div class="article-subsection">
				<h3>步骤1：标记化</h3>
				<p>
                    标记化（Tokenization）是将输入文本分解为更小、更易于管理的部分（称为标记）的过程。这些标记可以是单词或子单词。
					单词 <code>"Data"</code> 和 <code>“visualization”</code> 对应于唯一标记，而单词 <code>“empowers”</code> 则
					被拆分为两个标记。完整的标记词汇表是在训练模型之前确定的：GPT-2 的词汇表有 <code>50,257</code> 个唯一标记。
					现在我们将输入文本拆分为具有不同 ID 的标记，我们可以从嵌入中获取它们的向量表示。
				</p>
			</div>
			<div class="article-subsection" id="article-token-embedding">
				<h3>步骤2：Token 嵌入</h3>
				<p>
					GPT-2 Small 将词汇表中的每个标记表示为一个 768 维向量；向量的维度取决于模型。这些嵌入向量存储在形状为
					<code>(50,257, 768)</code> 的矩阵中，包含大约 3900 万个参数！这个广泛的矩阵允许模型为每个标记分配语义含义。
				</p>
			</div>
			<div class="article-subsection" id="article-positional-embedding">
				<h3>步骤3：位置编码</h3>
				<p>
					Embedding 层还对每个 token 在输入提示中的位置信息进行编码。不同的模型使用不同的方法进行位置编码。
					GPT-2 从头开始​​训练自己的位置编码矩阵，将其直接集成到训练过程中。
				</p>

				<!-- <div class="article-subsection-l2">
            <h4>替代位置编码方法<strong class='attention'>[可能折叠]</strong></h4>
            <p>
                其他模型（如原始 Transformer 和 BERT）使用正弦函数进行位置编码。
			    这种正弦编码是确定性的，旨在反映每个 token 的绝对位置和相对位置。
            </p>
            <p>
				使用正弦和余弦函数的组合为序列中的每个位置分配一个唯一的数学表示。

				对于给定位置，正弦函数表示位置编码向量中的偶数维度，余弦函数表示奇数维度。

				这种周期性确保每个位置都有一致的编码，与周围环境无关。
            </p>

            <p>
                工作原理如下：
            </p>

            <span class='attention'>
              正弦位置编码方程
            </span>

            <ul>
              <li>
                <strong>正弦函数</strong>：用于嵌入向量的偶数索引。
              </li>
              <li>
                <strong>余弦函数</strong>：用于嵌入向量的奇数索引。
            </ul>

            <p>
              将鼠标悬停在上面矩阵中的各个编码值上，以查看如何使用正弦和余弦函数计算它。
            </p>
          </div> -->
			</div>
			<div class="article-subsection">
				<h3>步骤4：最终嵌入</h3>
				<p>
					最后，我们将标记和位置编码相加以获得最终的嵌入表示。这种组合表示既捕获了标记的语义含义，也捕获了它们在输入序列中的位置。
				</p>
			</div>
		</div>

		<div class="architecture-section">
			<h2>Transformer 块</h2>

			<p>
				Transformer 处理的核心在于 Transformer 块，它由多头自注意力和多层感知器层组成。大多数模型由多个这样的块组成，
				这些块按顺序一个接一个地堆叠在一起。Token 表示通过层级演变，从第一个块到第 12 个块，使模型能够对每个 Token 建立复杂的理解。
				这种分层方法可以实现输入的高阶表示。
			</p>

			<div class="article-subsection" id="self-attention">
				<h3>多头自注意力</h3>
				<p>
					自注意力机制使模型能够专注于输入序列的相关部分，从而能够捕获数据中的复杂关系和依赖关系。
					让我们一步步看看这种自注意力是如何计算的。
				</p>
				<div class="article-subsection-l2">
					<h4>第一步：查询、键和值矩阵（Query, Key, and Value Matrices）</h4>

					<div class="figure">
						<img src="./article_assets/QKV.png" width="80%" align="middle" />
					</div>
					<div class="figure-caption">
						图<span class="attention">2</span>，根据原始嵌入计算查询、键和值矩阵
					</div>

					<p>
						每个 token 的嵌入向量被转换成三个向量：
						<span class="q-color">Query (Q)</span>、
						<span class="k-color">Key (K)</span>和
						<span class="v-color">Value (V)</span>。这些向量是通过将输入嵌入矩阵与学习到的权重矩阵相乘而得出的
						<span class="q-color">Q</span>、
						<span class="k-color">K</span>和
						<span class="v-color">V</span>。这里有一个网络搜索类比，可以帮助我们建立这些矩阵背后的一些直觉：
					</p>
					<ul>
						<li>
							<strong class="q-color font-medium">Query (Q)</strong> 是您在搜索引擎栏中输入的搜索文本。
							这是您想要<em>“查找更多信息”</em>的标记。
						</li>
						<li>
							<strong class="k-color font-medium">Key (K)</strong> 是搜索结果窗口中每个网页的标题。
							它表示查询可以关注的可能的标记。
						</li>
						<li>
							<strong class="v-color font-medium">Value (V)</strong>是网页显示的实际内容。
							当我们将适当的搜索词（Query）与相关结果（Key）匹配后，我们希望获得最相关页面的内容（Value）。
						</li>
					</ul>
					<p>
						通过使用这些 QKV 值，模型可以计算注意力分数，这决定了每个标记在生成预测时应该获得多少关注。
					</p>
				</div>
				<div class="article-subsection-l2">
					<h4>第二步：掩码自注意力机制</h4>
					<p>
						掩码自注意力机制（Masked Self-Attention）允许模型通过关注输入的相关部分来生成序列，同时阻止访问未来的标记。
					</p>

					<div class="figure">
						<img src="./article_assets/attention.png" width="80%" align="middle" />
					</div>
					<div class="figure-caption">
						图<span class="attention">3</span>，使用查询、键和值矩阵来计算掩蔽自注意力
					</div>

					<ul>
						<li>
							<strong>注意力分数</strong>：<span class="q-color">Query</span>和<span class="k-color">Key</span>
							矩阵的点积确定每个查询与每个键的对齐方式，从而产生一个反映所有输入标记之间关系的方阵。
						</li>
						<li>
							<strong>掩码</strong>：对注意力矩阵的上三角应用掩码，以防止模型访问未来的标记，并将这些值设置为负无穷大。
							模型需要学习如何在不“窥视”未来的情况下预测下一个标记。
						</li>
						<li>
							<strong>Softmax</strong>：经过掩码处理后，注意力得分通过 softmax 运算转换为概率，该运算取每个注意
							力得分的指数。矩阵的每一行总和为 1，并表示其左侧每个其他标记的相关性。
						</li>
					</ul>
				</div>
				<div class="article-subsection-l2">
					<h4>第三步：输出</h4>
					<p>
						该模型使用掩码后的自注意力得分，并将其与 <span class="v-color">Value</span> 矩阵相乘，
						以获得自注意力机制的 <span class="purple-color">最终输出</span>。GPT-2 有 <code>12</code> 个
						自注意力 heads，每个 head 捕获 token 之间的不同关系。这些 head 的输出被连接起来并通过线性投影（linear projection）。
					</p>
				</div>

				<div class="article-subsection" id="article-activation">
					<h3>多层感知器</h3>

					<div class="figure">
						<img src="./article_assets/mlp.png" width="70%" align="middle" />
					</div>
					<div class="figure-caption">
						图<span class="attention">4</span>，使用 MLP 层将自注意力表征投影到更高维度，以增强模型的表征能力
					</div>

					<p>
						在多个自注意力机制捕获输入 token 之间的不同关系后，连接的输出将通过多层感知器（MLP，Multi-Layer Perceptron）层，
						以增强模型的表示能力。MLP 块由两个线性变换组成，中间有一个 GELU 激活函数。
						第一个线性变换将输入的维数从 <code>768</code> 增加了四倍至 <code>3072</code>。
						第二个线性变换将维数降低回原始大小 <code>768</code>，确保后续层接收一致维度的输入。
						与自注意力机制不同，MLP 独立处理 token 并简单地将它们从一种表示映射到另一种表示。
					</p>
				</div>

				<div class="architecture-section" id="article-prob">
					<h2>输出概率</h2>
					<p>
						在输入经过所有 Transformer 块处理后，输出将通过最后的线性层，为标记预测做好准备。
						此层将最终表示投影到 <code>50,257</code> 维空间中，词汇表中的每个标记都有一个对应的值，
						称为 <code>logit</code>。任何标记都可以是下一个单词，因此此过程允许我们根据它们成为
						下一个单词的可能性对这些标记进行简单排序。然后，我们应用 softmax 函数将 logit 转换为
						总和为 1 的概率分布。这将使我们能够根据其可能性对下一个标记进行采样。
					</p>

					<div class="figure">
						<img src="./article_assets/softmax.png" width="60%" align="middle" />
					</div>
					<div class="figure-caption">
						图<span class="attention">5</span>，词汇表中的每个标记都根据模型的输出逻辑
						分配一个概率，这些概率决定了每个标记成为序列中下一个单词的可能性
					</div>

					<p id="article-temperature">
						最后一步是从该分布中采样来生成下一个标记。<code>temperature</code> 超参数在
						此过程中起着关键作用。从数学上讲，这是一个非常简单的操作：模型输出 logits 只
						需除以 <code>temperature</code>：
					</p>

					<ul>
						<li>
							<code>temperature = 1</code>：将 logits 除以 1 对 softmax 输出没有影响。
						</li>
						<li>
							<code>temperature &lt; 1</code>：较低的温度通过锐化概率分布使模型更加自信和确定，从而产生更可预测的输出。
						</li>
						<li>
							<code>temperature &gt; 1</code>：较高的温度会产生更柔和的概率分布，从而允许生成的文本具有更多的随机性 - 有些人称之为模型<em>“创造力”</em>。
						</li>
					</ul>

					<p>
						调节温度，看看如何在确定性和多样化输出之间取得平衡！
					</p>
				</div>

				<div class="architecture-section">
					<h2>高级架构功能</h2>

					<p>
						有几种高级架构功能可增强 Transformer 模型的性能。虽然它们对于模型的整体性能很重要，
						但对于理解架构的核心概念却不那么重要。层规范化、Dropout 和残差连接是 Transformer 
						模型中的关键组件，尤其是在训练阶段。层规范化可以稳定训练并帮助模型更快地收敛。
						Dropout 通过随机停用神经元来防止过度拟合。残差连接允许梯度直接流过网络并有助于防止梯度消失问题。
					</p>
					<div class="article-subsection" id="article-ln">
						<h3>层归一化</h3>

						<p>
							层归一化（Layer Normalization）有助于稳定训练过程并提高收敛性。它通过对特征之间的输入进行归一化来工作，
							确保激活的均值和方差一致。这种归一化有助于缓解与内部协变量偏移相关的问题，
							使模型能够更有效地学习并降低对初始权重的敏感度。每个 Transformer 块中都会
							应用两次层归一化，一次在自注意力机制之前，一次在 MLP 层之前。
						</p>
					</div>
					<div class="article-subsection" id="article-dropout">
						<h3>暂退法</h3>

						<p>
							暂退法（Dropout）是一种正则化技术，通过在训练期间随机将模型权重的一部分设置为零来防止神经网络过度拟合。
							这鼓励模型学习更稳健的特征并减少对特定神经元的依赖，帮助网络更好地推广到新的、未见过的数据。
							在模型推理期间，Dropout 被停用。这本质上意味着我们正在使用经过训练的子网络的集合，从而提高模型性能。
						</p>
					</div>
					<div class="article-subsection" id="article-residual">
						<h3>残差连接</h3>
						<p>
							残差连接（Residual Connections）于 2015 年首次在 ResNet 模型中引入。这种架构创新通过实现非常深的神经网络的训练，
							彻底改变了深度学习。本质上，残差连接是绕过一个或多个层的捷径，将层的输入添加到其输出中。
							这有助于缓解梯度消失问题，从而更容易训练堆叠在一起的多个 Transformer 块的深度网络。
							在 GPT-2 中，每个 Transformer 块内使用两次残差连接：一次在 MLP 之前，一次在 MLP 之后，
							以确保梯度更容易流动，并且较早的层在反向传播期间获得足够的更新。
						</p>
					</div>
				</div>

				<div class="article-section">
					<h1>互动功能</h1>
					<p>
						Transformer Explainer 是交互式的，可让您探索 Transformer 的内部工作原理。以下是您可以使用的一些交互式功能：
					</p>

					<ul>
						<li>
							<strong>输入您自己的文本序列</strong>，看看模型如何处理它并预测下一个单词。探索注意力权重、中间计算，
							并看看最终输出概率是如何计算的。
						</li>
						<li>
							<strong>使用温度滑块</strong>控制模型预测的随机性。探索如何通过更改温度值使模型输出更具确定性或更具创造性。
						</li>
						<li>
							<strong>与注意力图交互</strong>，查看模型如何关注输入序列中的不同标记。将鼠标悬停在标记上
							以突出显示其注意力权重，并探索模型如何捕获上下文和单词之间的关系。
						</li>
					</ul>
				</div>

				<div class="article-section">
					<h2>视频教程</h2>
					<div class="video-container">
						<!-- svelte-ignore a11y-missing-attribute -->
						<iframe
							src="https://www.youtube.com/embed/ECR4oAwocjs"
							frameborder="0"
							allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
							allowfullscreen
						>
						</iframe>
					</div>
				</div>

				<div class="article-section">
					<h2>Transformer Explainer 是如何构建的？</h2>
					<p>
					    Transformer Explainer 具有一个可直接在浏览器中运行的实时 GPT-2（小型）模型。
						该模型源自 Andrej Karpathy 的 
						<a href="https://github.com/karpathy/nanoGPT" title="Github" target="_blank"
							>nanoGPT 项目</a
						>
						PyTorch GPT 实现，并已转换为
						<a href="https://onnxruntime.ai/" title="ONNX" target="_blank">ONNX Runtime</a>
						实现浏览器内无缝执行。该界面使用 JavaScript 构建，借助
						<a href="https://kit.svelte.dev/" title="Svelte" target="_blank">Svelte</a>
						作为前端框架以及使用
						<a href="https://d3js.org/" title="D3" target="_blank">D3.js</a>
						创建动态可视化。数值根据用户输入实时更新。
					</p>
				</div>

				<div class="article-section">
					<h2>谁开发了 Transformer Explainer？</h2>
					<p>
						Transformer Explainer 的作者包括

						<a href="https://aereeeee.github.io/" target="_blank">Aeree Cho</a>，
						<a href="https://www.linkedin.com/in/chaeyeonggracekim/" target="_blank">Grace C. Kim</a
						>，
						<a href="https://alexkarpekov.com/" target="_blank">Alexander Karpekov</a>，
						<a href="https://alechelbling.com/" target="_blank">Alec Helbling</a>，
						<a href="https://zijie.wang/" target="_blank">Jay Wang</a>，
						<a href="https://seongmin.xyz/" target="_blank">Seongmin Lee</a>，
						<a href="https://bhoov.com/" target="_blank">Benjamin Hoover</a>，以及佐治亚理工学院的
						<a href="https://poloclub.github.io/polochau/" target="_blank">Polo Chau</a>。
					</p>
				</div>
			</div>
		</div>
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
		// font-size: 17px;
		// font-size: 15px;
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

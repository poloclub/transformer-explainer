<script>
	import tailwindConfig from '../../tailwind.config';
	import resolveConfig from 'tailwindcss/resolveConfig';
  // import Youtube from './Youtube.svelte';

	let softmaxEquation = `$$\\text{Softmax}(x_{i}) = \\frac{\\exp(x_i)}{\\sum_j \\exp(x_j)}$$`;
	let reluEquation = `$$\\text{ReLU}(x) = \\max(0,x)$$`;

  let currentPlayer;

  const { theme } = resolveConfig(tailwindConfig);
</script>

<style lang="scss">

  // ======== TEMPORARY MARGIN --> DELETE LATER ========
  body {
    margin-left: 50px;
  }
  // ======== TEMPORARY MARGIN --> DELETE LATER ========

  .attention {
    // color: white;
    background-color: theme('colors.red.200');
  }

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

	#description {
    margin-bottom: 60px;
    margin-left: auto;
    margin-right: auto;
    max-width: 78ch;
  }

  #description h1 {
    color: theme('colors.purple.700');
    font-size: 36px;
    font-weight: 300;
    margin-bottom: 12px;
    margin-top: 20px;
  }

  #description h2 {
    // color: #444;
    color: theme('colors.purple.700');
    font-size: 34px;
    font-weight: 150;
    margin-bottom: 12px;
    margin-top: 20px;
  }

  #description h3 {
    color: #444;
    font-size: 30px;
    font-weight: 200;
    margin-bottom: 12px;
    margin-top: 15px;
  }

  #description h4 {
    color: #444;
    font-size: 24px;
    font-weight: 200;
    margin-bottom: 8px;
    margin-top: 15px;
  }

  #description p {
    margin: 16px 0;
  }

  #description p img {
    vertical-align: middle;
  }

  #description .figure-caption {
    font-size: 13px;
    margin-top: 5px;
    text-align: center;
  }

  #description ol {
    margin-left: 40px;
    list-style-type: decimal;
  }

  #description li {
    margin-bottom: 10px;
    margin-top: 10px;
  }

  #description p,
  #description div,
  #description li {
    color: #555;
    // font-size: 17px;
    font-size: 15px;
    line-height: 1.6;
  }

  #description small {
    font-size: 12px;
  }

  #description ol li img {
    vertical-align: middle;
  }

  #description .video-link {
    color: #3273DC;
    cursor: pointer;
    font-weight: normal;
    text-decoration: none;
  }

  #description ul {
      list-style-type: disc;
      margin-left: 40px;
      margin-bottom: 15px;
  }

  #description a:hover,
  #description .video-link:hover {
    text-decoration: underline;
  }

  .figure, .video {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
</style>

<body>
  <div id="description">

    <div class="article-section">
      <h1>What is a Transformer?</h1>

      <p>
        Transformer is a neural network architecture that has fundamentally
        changed the approach to Artificial Intelligence.

        Transformer was first introduced in the seminal paper
        <a href="https://dl.acm.org/doi/10.5555/3295222.3295349" title="ACM Digital Library">"Attention is All You Need"</a>
        in 2017 and has since become the go-to architecture for deep learning models, powering
        text-generative models like OpenAI's <strong>GPT</strong>, Meta's <strong>Llama</strong>, and Google's <strong>Gemini</strong>.

        Originally designed for translating text between languages,
        today Transformer is used for a variety of tasks, including text summarization,
        question answering, and generating creative content like stories and code.

        Beyond text, Transformer is also applied in
        <a href="https://huggingface.co/learn/audio-course/en/chapter3/introduction" title='Hugging Face'>audio generation</a>,
        <a href="https://huggingface.co/learn/computer-vision-course/unit3/vision-transformers/vision-transformers-for-image-classification" title='Hugging Face'>image recognition</a>,
        <a href="https://elifesciences.org/articles/82819" title='eLife'>protein structure prediction</a>,
        and even <a href="https://www.deeplearning.ai/the-batch/reinforcement-learning-plus-transformers-equals-efficiency/" title='Deep Learning AI'>game playing</a>,
        demonstrating their versatility across numerous domains.
      </p>
      <p>
        Fundamentally, text-generative Transformer models operate on the
        principle of next-word prediction: given an input from the user
        (could be as short as a single word or as long as multiple paragraphs),
        what is the most probable next word that will follow this input?

        The core innovation and power of Transformers lie in their use of
        self-attention mechanism, which allows them to process entire sequences
        and capture long-range dependencies more effectively than previous
        architectures.

        This dynamic weighting of token relevance enables Transformer to
        understand context and semantics, all while processing massive amounts
        of text data in parallel.
      </p>
      <p>
        The <a href="https://huggingface.co/openai-community/gpt2" title='Hugging Face'>GPT-2 family of models</a>,
        developed by OpenAI, are prominent examples of
        text-generative Transformer.

        While GPT-2 is not the latest or most powerful Transformer model,
        it shares many of the same architectural components and principles found
        in the current state-of-the-art models making it an ideal starting point for understanding the basics.

        By interacting with the model, you can adjust inputs and the temperature
        hyperparameter, see real-time updates to the intermediate operations,
        and get a hands-on feel for how Transformer works, all inside of your browser.
      </p>

    </div>

    <div class="article-section">
      <h1>Transformer Architecture</h1>

      <p>
        Every text-generative Transformer consists of these three <strong>key components</strong>:
      </p>
      <ol>
        <li>
          <strong class='bold-purple'>Embedding</strong>: Text input is divided into smaller units called tokens,
          which can be words or subwords. These tokens are converted into numerical vectors called embeddings,
          which capture the semantic meaning of words.
        </li>
        <li>
          <strong class='bold-purple'>Transformer Block</strong> is the fundamental building block of the model
          that processes and transforms the input data.
          Each block includes:
          <ul class=''>
            <li>
              <strong>Attention Mechanism</strong>, the core component of the Transformer block.
              It allows tokens to communicate with other tokens,
              capturing contextual information and relationships between words.
            </li>
            <li>
              <strong>MLP (Multilayer Perceptron) Layer</strong>,
              a feed-forward network that operates on each token independently.
              While the goal of the attention layer is to route information between tokens,
              the goal of the MLP is to refine each token's representation.
            </li>
          </ul>
        </li>
        <li>
          <strong class='bold-purple'>Output Probabilities</strong>:
          The final linear and softmax layers transform the processed embeddings into probabilities,
          enabling the model to make predictions about the next token in a sequence.
        </li>
      </ol>

      <div class="architecture-section">
        <h2>Embedding</h2>
        <p>
          Let's say you want to generate text using a Transformer model.
          You add the prompt like this one: <code>“Data visualization empowers users to”</code>.
          This input needs to be converted into a format that the model can understand and process.
          That is where embedding comes in: it transforms the text into a numerical representation that the model can work with.
          To convert a prompt into embedding, we need to
          1) tokenize the input,
          2) obtain token embeddings and
          3) add positional information.
          Let’s see how each of these steps is done.
        </p>
        <div class="figure">
          <img src="static/article_assets/embedding.png" width=60% height=60% align="middle"/>
        </div>
        <div class="figure-caption">
          Figure <span class='attention'>X</span>. Expanding the Embedding layer view, showing how the input prompt is converted to a vector representation.
          The process involves 1) Tokenization, 2) Token Embedding, and 3) Positional Encoding.
        </div>
        <div class="article-subsection">
          <h3>Step 1: Tokenization</h3>
          <p>
            Tokenization is the process of breaking down the input text into smaller,
            more manageable pieces called tokens.

            These tokens can be a word or a subword: for example, the sample input above
            assigned the words “Data” and “visualization” to unique,
            separate tokens, while splitting the word “empowers” into two tokens.

            A vocabulary of tokens is decided before training the model:
            GPT-2's vocabulary has 50,257 unique tokens, each associated with an
            index from 0 to 50,256. Now that we split our input text into tokens
            with distinct IDs, we can obtain their vector representation from embeddings.
          </p>
        </div>
        <div class="article-subsection">
          <h3>Step 2. Token Embedding</h3>
          <p>
            GPT-2 represents each token in the vocabulary as a <span class='attention'>1024</span>-dimensional
            vector that is semantically meaningful; the dimension of the vector
            depends on the model.

            These embedding vectors are stored in a matrix of shape (50,257, <span class='attention'>1024</span>),
            containing approximately <span class='attention'>51</span> million parameters!

            This extensive matrix allows the model to assign semantic meaning to each token.
          </p>
        </div>
        <div class="article-subsection">
          <h3>Step 3. Positional Encoding</h3>
          <p>
            The embedding layer also encodes information about each token's
            position in a sequence into the positional information.

            Different models use various methods for positional encoding.

            GPT-2 trains its own positional encoding matrix from scratch,
            integrating it directly into the training process.
          </p>

          <div class="article-subsection-l2">
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
          </div>
        </div>
      </div>

      <div class="architecture-section">
        <h2>Transformer Block</h2>

        <p>
          The core of the Transformer's processing lies in the Transformer block,
          which comprises multi-head self-attention and a Multi-Layer Perceptron.

          Most models consist of multiple blocks that are stacked sequentially one after the other.

          The token representations evolve through layers — from the first block
          to the <span class='attention'>24th</span> block in GPT-2 <span class='attention'>Medium</span>
          — allowing the model to build up an intricate understanding of each token.

          This layered approach leads to higher-order representations of the input.
        </p>

        <div class="article-subsection">
          <h3>Multi-Head Self-Attention</h3>
          <p>
            The self-attention mechanism enables the model to focus on relevant
            parts of the input sequence, allowing it to capture complex
            relationships and dependencies within the data.

            Let’s look at how this self-attention is computed step-by-step.
          </p>
          <div class="article-subsection-l2">
            <h4>Step 1: Query, Key, and Value Matrices</h4>

            <p>
              Each token's embedding vector is transformed into three vectors:
              <span class='q-color'>Query (Q)</span>,
              <span class='k-color'>Key (K)</span>, and
              <span class='v-color'>Value (V)</span>.

              These vectors are derived by multiplying the input embedding matrix
              with learned weight matrices for
              <span class="q-color">Q</span>,
              <span class="k-color">K</span>, and
              <span class="v-color">V</span>.

              To understand the role of these represenattions, consider a web search analogy:
            </p>
            <ul>
              <li>
                <strong class="q-color font-medium">Query (Q)</strong>: The search text you type in, representing the token the model focuses on.
              </li>
              <li>
                <strong class="k-color font-medium">Key (K)</strong>: Titles of web pages compared against the query, representing possible tokens the query can attend to.
              </li>
              <li>
                <strong class="v-color font-medium">Value (V)</strong>: Actual content of web pages shown, representing the content of tokens based on the match between queries and keys.
              </li>
            </ul>
            <p>
              By using these QKV values, the model can calculate attention scores,
              which determine how much focus each token should receive when generating predictions.
            </p>
          </div>
          <div class="article-subsection-l2">
            <h4>Step 2: Masked Self-Attention</h4>
            <p>
              Masked self-attention allows the model to generate sequences
              by focusing on relevant parts of the input while preventing access to future tokens:
            </p>
            <ul>
              <li>
                <strong>Attention Score</strong>: The dot product <span class='attention'>QK^T</span> determines the alignment of each query with each key, producing a square matrix that reflects the relationship between all input tokens.
              </li>
              <li>
                <strong>Masking</strong>: A mask is applied to the upper triangle of the attention matrix to prevent the model from accessing future tokens, setting these values to negative infinity. The model needs to learn how to predict the next token without “peeking” into the future, since that is what it will ultimately be used for.
              </li>
              <li>
                <strong>Softmax</strong>: After masking, the attention score is converted into probability by the softmax operation which takes the exponent of each attention score. Each row of the matrix sums up to one and indicates the relevance of every other token to the left of it.
              </li>
            </ul>
          </div>
          <div class="article-subsection-l2">
            <h4>Step 3: Output</h4>
            <p>
              Using the final attention scores, the model computes a weighted value matrix V.
              The higher the attention score, the larger will be its output value.

              After self-attention operations are performed independently by each head,
              results are concatenated and passed through a simple linear projection.
            </p>
        </div>

        <div class="article-subsection">
          <h3>MLP: Multi-Layer Perceptron</h3>

          <p>
            After the multiple heads of self-attention capture the diverse relationships
            between the input tokens, the concatenated outputs are passed through
            the Multilayer Perceptron (MLP) layer to enhance the model's representational capacity.

            The MLP block consists of two linear transformations with a GELU activation function in between.

            The first linear transformation increases the dimensionality of the
            input four-fold (from <span class='attention'>1024 to 4096</span> in case of the GPT-2 <span class='attention'>Medium</span> model)
            and then applies GELU activation to introduce non-linearity.

            The second linear transformation reduces the dimensionality back to the original size,
            ensuring that the subsequent layers receive inputs of consistent dimensions.

            Note that the attention block allows the input tokens “talk” to each other
            and influence each other’s values.

            The MLP, on the other hand, processes tokens independently and
            simply maps them from one representation to another, richer one.
          </p>
        </div>

      <div class="architecture-section">
        <h2>Output Probabilities</h2>
        <p>
          After the input has been processed through all Transformer blocks,
          the output is passed through the final linear layer to prepare it for token prediction.

          This layer maps the vectors back to a space with dimensions equal to the
          model's vocabulary size (50,257 in our case).

          Importantly, only the output vector of the last token in the sequence
          is used for the next token prediction.

          The softmax function is then applied, converting the output logit vector
          into a probability distribution.

          Each probability represents the likelihood of a token being the next word.
        </p>
        <p>
          <span class="attention">SOFTMAX formula goes here</span>
        </p>
        <p>
          Sampling from the probability distribution generated by the softmax function
          involves selecting the next token based on its likelihood.

          The temperature hyperparameter plays a critical role in this process.

          Mathematically speaking, it is a very simple operation:
          model output logits are simply divided by the temperature parameter.

          When it equals to 1, it has no effect on the softmax outputs.

          A lower temperature makes the model more confident and deterministic
          by sharpening the probability distribution, leading to more predictable outputs.

          Conversely, a higher temperature creates a softer probability distribution,
          allowing for more randomness in the generated text – what some refer to as model “creativity”.

          Adjust the temperature and see how you can balance between deterministic and diverse outputs!
        </p>
      </div>

      <div class="architecture-section">
        <h2>Additional Design Elements</h2>

        <p>
          Layer Normalization, Dropout, and Residual Connections are crucial components in Transformer models,
          particularly during the training phase.

          Layer Normalization stabilizes training by normalizing activations,
          helping the model converge faster.

          Dropout prevents overfitting by randomly deactivating neurons,
          promoting robust feature learning.

          Residual Connections enable efficient training of deep networks by allowing
          gradients to flow directly through the network and help with the vanishing gradient problem.
        </p>
        <div class="article-subsection">
          <h3>Layer Normalization</h3>

          <p>
            Layer Normalization is a crucial component in Transformer models
            that stabilizes the training process and improves convergence.

            It works by normalizing the inputs across the features,
            ensuring that the mean and variance of the activations are consistent.

            This normalization helps mitigate issues related to internal covariate shift,
            allowing the model to learn more effectively and reducing the sensitivity to the initial weights.
          </p>
        </div>
        <div class="article-subsection">
          <h3>Dropout</h3>

          <p>
            Dropout is a regularization technique used to prevent overfitting in neural networks
            by randomly setting a fraction of activations to zero during training.

            This encourages the model to learn more robust features and reduces dependency
            on specific neurons, helping the network generalize better to new, unseen data.

            During model inference, dropout is deactivated, which is effectively equivalent
            to using an ensemble of the trained subnetworks.
          </p>
        </div>
        <div class="article-subsection">
          <h3>Residual Connections</h3>

          <p>
            Residual connections were first introduced in the ResNet model in 2015,
            revolutionizing deep learning by enabling the training of very deep neural networks.

            Essentially, these connections are shortcuts that bypass one or more layers,
            adding the input of a layer to its output, as shown in the formula above.

            This helps mitigate the vanishing gradient problem, making it easier to train deep networks.

            In GPT-2, residual connections are used twice within each Transformer block,
            once before the MLP and once after, ensuring that gradients flow more easily
            and earlier layers receive sufficient updates during backpropagation.
          </p>
      </div>

    </div>

    <div class="article-section">
      <h1>Interactive Features</h1>
      <p>
        Transformer Explainer is an interactive tool that uses a live instance of the
        GPT-2 model in the browser, allowing you to explore the Transformer architecture in depth.

        Below is the list of the interactive features you can play with.
      </p>

      <ul>
        <li>
          <strong>Input your own text sequence</strong> to see how the model processes it and predicts the next word. By analyzing the attention mechanisms and token interactions, you can understand how different parts of the text influence the model's predictions.
        </li>
        <li>
          <strong>Use the temperature slider</strong> to control the randomness of the model’s predictions. Lower temperatures result in more deterministic outputs, while higher temperatures allow for more creative variations. This feature helps you understand the balance between precision and “creativity” in language generation.
        </li>
        <li>
          <strong>Interact with attention maps</strong> to see how the model focuses on different tokens in the input sequence. Hover over tokens to highlight their attention weights and understand how the model captures context and relationships between words.
        </li>
      </ul>
    </div>

    <div class="article-section">
      <h1>Video Tutorial</h1>
      <span class='attention'>FUTURE_LINK_TO_YOUTUBE_TUTORIAL</span>
    </div>

    <div class="article-section">
      <h1>How is the Transformer Explainer implemented?</h1>
      <p>
        Transformer Explainer features a live GPT-2 <span class='attention'>Large</span> model running directly in the browser.

        This model is derived from the PyTorch implementation of GPT by Andrej Karpathy's
        <a href="https://github.com/karpathy/nanoGPT" title='Github'>nanoGPT project</a>
        and has been converted to <a href="https://onnxruntime.ai/" title='ONNX'>ONNX Runtime</a>
        for seamless in-browser execution.

        The interface is built using JavaScript, with <a href="https://kit.svelte.dev/" title='Svelte'>Svelte</a>
        as a front-end framework and <a href="http://D3.js" title='D3'>D3.js</a>
        for creating dynamic visualizations.

        Numerical values are updated live following the user input.
      </p>
    </div>

    <div class="article-section">
      <h1>Who developed the Transformer Explainer?</h1>
      <p>
        Transformer Explainer was created by

        <a href="https://aereeeee.github.io/">Aeree Cho</a>,
        <a href="https://www.linkedin.com/in/chaeyeonggracekim/">Grace C. Kim</a>,
        <a href="https://alexkarpekov.com/">Alexander Karpekov</a>,

        <a href="https://alechelbling.com/">Alec Helbling</a>,
        <a href="https://zijie.wang/">Jay Wang</a>,
        <a href="https://seongmin.xyz/">Seongmin Lee</a>,
        <a href="https://bhoov.com/">Benjamin Hoover</a>, and
        <a href="https://poloclub.github.io/polochau/">Polo Chau</a>

        at the Georgia Institute of Technology.
      </p>
  </div>
</body>

import{a as o,e as c,c as p,o as f,p as u,j as h,n,g as d}from"../chunks/scheduler.De5pAtWw.js";import{S as r,i as l,c as m,a as v,m as g,t as b,b as w,d as y}from"../chunks/index.Dr-Sk8No.js";import{r as k,t as T}from"../chunks/index.Cmkxsop-.js";function x(a){let e,s=`<div id="description" class="svelte-12uffcp"><div class="article-section svelte-12uffcp"><h1 class="svelte-12uffcp">What is a Transformer?</h1> <p class="svelte-12uffcp">Transformer is a neural network architecture that has fundamentally
        changed the approach to Artificial Intelligence.

        Transformer was first introduced in the seminal paper
        <a href="https://dl.acm.org/doi/10.5555/3295222.3295349" title="ACM Digital Library" target="_blank" class="svelte-12uffcp">&quot;Attention is All You Need&quot;</a>
        in 2017 and has since become the go-to architecture for deep learning models, powering
        text-generative models like OpenAI&#39;s <strong>GPT</strong>, Meta&#39;s <strong>Llama</strong>, and Google&#39;s <strong>Gemini</strong>.

        Beyond text, Transformer is also applied in
        <a href="https://huggingface.co/learn/audio-course/en/chapter3/introduction" title="Hugging Face" target="_blank" class="svelte-12uffcp">audio generation</a>,
        <a href="https://huggingface.co/learn/computer-vision-course/unit3/vision-transformers/vision-transformers-for-image-classification" title="Hugging Face" target="_blank" class="svelte-12uffcp">image recognition</a>,
        <a href="https://elifesciences.org/articles/82819" title="eLife" class="svelte-12uffcp">protein structure prediction</a>,
        and even <a href="https://www.deeplearning.ai/the-batch/reinforcement-learning-plus-transformers-equals-efficiency/" title="Deep Learning AI" target="_blank" class="svelte-12uffcp">game playing</a>,
        demonstrating their versatility across numerous domains.</p> <p class="svelte-12uffcp">Fundamentally, text-generative Transformer models operate on the
        principle of <strong>next-word prediction</strong>: given a text prompt from the user,
        what is the <em>most probable next word</em> that will follow this input?

        The core innovation and power of Transformers lie in their use of
        self-attention mechanism, which allows them to process entire sequences
        and capture long-range dependencies more effectively than previous
        architectures.</p> <p class="svelte-12uffcp">GPT-2 family of models are prominent examples of text-generative Transformers.

        Transformer Explainer is powered by the
        <a href="https://huggingface.co/openai-community/gpt2" title="Hugging Face" target="_blank" class="svelte-12uffcp">GPT-2</a>
        (small) model which has 124 million parameter.
        While it is not the latest or most powerful Transformer model,
        it shares many of the same architectural components and principles found
        in the current state-of-the-art models making it an ideal starting point for understanding the basics.</p></div> <div class="article-section svelte-12uffcp"><h1 class="svelte-12uffcp">Transformer Architecture</h1> <p class="svelte-12uffcp">Every text-generative Transformer consists of these three <strong>key components</strong>:</p> <ol class="svelte-12uffcp"><li class="svelte-12uffcp"><strong class="bold-purple svelte-12uffcp">Embedding</strong>: Text input is divided into smaller units called tokens,
          which can be words or subwords. These tokens are converted into numerical vectors called embeddings,
          which capture the semantic meaning of words.</li> <li class="svelte-12uffcp"><strong class="bold-purple svelte-12uffcp">Transformer Block</strong> is the fundamental building block of the model
          that processes and transforms the input data.
          Each block includes:
          <ul class=" svelte-12uffcp"><li class="svelte-12uffcp"><strong>Attention Mechanism</strong>, the core component of the Transformer block.
              It allows tokens to communicate with other tokens,
              capturing contextual information and relationships between words.</li> <li class="svelte-12uffcp"><strong>MLP (Multilayer Perceptron) Layer</strong>,
              a feed-forward network that operates on each token independently.
              While the goal of the attention layer is to route information between tokens,
              the goal of the MLP is to refine each token&#39;s representation.</li></ul></li> <li class="svelte-12uffcp"><strong class="bold-purple svelte-12uffcp">Output Probabilities</strong>:
          The final linear and softmax layers transform the processed embeddings into probabilities,
          enabling the model to make predictions about the next token in a sequence.</li></ol> <div class="architecture-section svelte-12uffcp"><h2 class="svelte-12uffcp">Embedding</h2> <p class="svelte-12uffcp">Let&#39;s say you want to generate text using a Transformer model.
          You add the prompt like this one: <code class="svelte-12uffcp">“Data visualization empowers users to”</code>.
          This input needs to be converted into a format that the model can understand and process.
          That is where embedding comes in: it transforms the text into a numerical representation that the model can work with.
          To convert a prompt into embedding, we need to
          1) tokenize the input,
          2) obtain token embeddings,
          3) add positional information, and finally
          4) add up token and position encodings to get the final embedding.
          Let’s see how each of these steps is done.</p> <div class="figure svelte-12uffcp"><img src="static/article_assets/embedding.png" width="60%" height="60%" align="middle" class="svelte-12uffcp"/></div> <div class="figure-caption svelte-12uffcp">Figure <span class="attention svelte-12uffcp">X</span>. Expanding the Embedding layer view, showing how the input prompt is converted to a vector representation.
          The process involves <span class="fig-numbering">(1)</span> Tokenization, (2) Token Embedding, (3) Positional Encoding, and (4) Final Embedding.</div> <div class="article-subsection svelte-12uffcp"><h3 class="svelte-12uffcp">Step 1: Tokenization</h3> <p class="svelte-12uffcp">Tokenization is the process of breaking down the input text into smaller,
            more manageable pieces called tokens.

            These tokens can be a word or a subword. The words <code class="svelte-12uffcp">&quot;Data&quot;</code>
            and <code class="svelte-12uffcp">&quot;vizualization&quot;</code> corresponds to unique tokens,
            while the word <code class="svelte-12uffcp">&quot;empowers&quot;</code> is split into two tokens.

            The full vocabulary of tokens is decided before training the model:
            GPT-2&#39;s vocabulary has <code class="svelte-12uffcp">50,257</code> unique tokens.

            Now that we split our input text into tokens with distinct IDs,
            we can obtain their vector representation from embeddings.</p></div> <div class="article-subsection svelte-12uffcp"><h3 class="svelte-12uffcp">Step 2. Token Embedding</h3> <p class="svelte-12uffcp">GPT-2 Small represents each token in the vocabulary as a 768-dimensional
            vector; the dimension of the vector
            depends on the model.

            These embedding vectors are stored in a matrix of shape <code class="svelte-12uffcp">(50,257, 768)</code>,
            containing approximately 39 million parameters!

            This extensive matrix allows the model to assign semantic meaning to each token.</p></div> <div class="article-subsection svelte-12uffcp"><h3 class="svelte-12uffcp">Step 3. Positional Encoding</h3> <p class="svelte-12uffcp">The embedding layer also encodes information about each token&#39;s
            position in the input prompt.

            Different models use various methods for positional encoding.

            GPT-2 trains its own positional encoding matrix from scratch,
            integrating it directly into the training process.</p></div> <div class="article-subsection svelte-12uffcp"><h3 class="svelte-12uffcp">Step 4. Final Embedding</h3> <p class="svelte-12uffcp">Finally, we sum the token and positional encodings to get the final embedding representation.

            This combined representation captures both the semantic meaning of the tokens
            and their position in the input sequence.</p></div></div> <div class="architecture-section svelte-12uffcp"><h2 class="svelte-12uffcp">Transformer Block</h2> <p class="svelte-12uffcp">The core of the Transformer&#39;s processing lies in the Transformer block,
          which comprises multi-head self-attention and a Multi-Layer Perceptron layers.

          Most models consist of multiple such blocks that are stacked sequentially one after the other.

          The token representations evolve through layers, from the first block
          to the 12th one, allowing the model to build up an intricate understanding of each token.

          This layered approach leads to higher-order representations of the input.</p> <div class="article-subsection svelte-12uffcp"><h3 class="svelte-12uffcp">Multi-Head Self-Attention</h3> <p class="svelte-12uffcp">The self-attention mechanism enables the model to focus on relevant
            parts of the input sequence, allowing it to capture complex
            relationships and dependencies within the data.

            Let’s look at how this self-attention is computed step-by-step.</p> <div class="article-subsection-l2 svelte-12uffcp"><h4 class="svelte-12uffcp">Step 1: Query, Key, and Value Matrices</h4> <div class="figure svelte-12uffcp"><img src="static/article_assets/QKV.png" width="80%" align="middle" class="svelte-12uffcp"/></div> <div class="figure-caption svelte-12uffcp">Figure <span class="attention svelte-12uffcp">X</span>. Computing Query, Key, and Value matrices from the original embedding.</div> <p class="svelte-12uffcp">Each token&#39;s embedding vector is transformed into three vectors:
              <span class="q-color svelte-12uffcp">Query (Q)</span>,
              <span class="k-color svelte-12uffcp">Key (K)</span>, and
              <span class="v-color svelte-12uffcp">Value (V)</span>.

              These vectors are derived by multiplying the input embedding matrix
              with learned weight matrices for
              <span class="q-color svelte-12uffcp">Q</span>,
              <span class="k-color svelte-12uffcp">K</span>, and
              <span class="v-color svelte-12uffcp">V</span>.

              Here&#39;s a web search analogy to help us build some intuition behind these matrices:</p> <ul class="svelte-12uffcp"><li class="svelte-12uffcp"><strong class="q-color font-medium svelte-12uffcp">Query (Q)</strong> is the search text you type in the search engine bar. This is the token you want to <em>&quot;find more information about&quot;</em>.</li> <li class="svelte-12uffcp"><strong class="k-color font-medium svelte-12uffcp">Key (K)</strong> is the title of each web page in the search resul window. It represents the possible tokens the query can attend to.</li> <li class="svelte-12uffcp"><strong class="v-color font-medium svelte-12uffcp">Value (V)</strong> is the actual content of web pages shown.
                Once we matched the appropriate search term (Query) with the relevant results (Keys), we want to get the content (Value)
                of the most relevant pages.</li></ul> <p class="svelte-12uffcp">By using these QKV values, the model can calculate attention scores,
              which determine how much focus each token should receive when generating predictions.</p></div> <div class="article-subsection-l2 svelte-12uffcp"><h4 class="svelte-12uffcp">Step 2: Masked Self-Attention</h4> <p class="svelte-12uffcp">Masked self-attention allows the model to generate sequences
              by focusing on relevant parts of the input while preventing access to future tokens.</p> <div class="figure svelte-12uffcp"><img src="static/article_assets/attention.png" width="80%" align="middle" class="svelte-12uffcp"/></div> <div class="figure-caption svelte-12uffcp">Figure <span class="attention svelte-12uffcp">X</span>. Using Query, Key, and Value matrices to calculate masked self-attention.</div> <ul class="svelte-12uffcp"><li class="svelte-12uffcp"><strong>Attention Score</strong>: The dot product of <span class="q-color svelte-12uffcp">Query</span>
                and <span class="k-color svelte-12uffcp">Key</span> matrices determines the alignment
                of each query with each key, producing a square matrix that reflects
                the relationship between all input tokens.</li> <li class="svelte-12uffcp"><strong>Masking</strong>:
                A mask is applied to the upper triangle of the attention matrix
                to prevent the model from accessing future tokens, setting these values to negative infinity.

                The model needs to learn how to predict the next token without “peeking” into the future.</li> <li class="svelte-12uffcp"><strong>Softmax</strong>:
                After masking, the attention score is converted into probability
                by the softmax operation which takes the exponent of each attention score.

                Each row of the matrix sums up to one and indicates the relevance of
                every other token to the left of it.</li></ul></div> <div class="article-subsection-l2 svelte-12uffcp"><h4 class="svelte-12uffcp">Step 3: Output</h4> <p class="svelte-12uffcp">The model uses the masked self-attention scores and multiplies them with the
              <span class="v-color svelte-12uffcp">Value</span> matrix to get the <span class="purple-color svelte-12uffcp">final output</span>
              of the self-attention mechanism.

              GPT-2 has <code class="svelte-12uffcp">12</code> self-attention heads, each capturing different
              relationships between tokens. The outputs of these heads are concatenated
              and passed through a linear projection.</p></div> <div class="article-subsection svelte-12uffcp"><h3 class="svelte-12uffcp">MLP: Multi-Layer Perceptron</h3> <div class="figure svelte-12uffcp"><img src="static/article_assets/mlp.png" width="70%" align="middle" class="svelte-12uffcp"/></div> <div class="figure-caption svelte-12uffcp">Figure <span class="attention svelte-12uffcp">X</span>. Using MLP layer to project
              the self-attention representations into higher dimensions to enhance the model&#39;s representational capacity.</div> <p class="svelte-12uffcp">After the multiple heads of self-attention capture the diverse relationships
            between the input tokens, the concatenated outputs are passed through
            the Multilayer Perceptron (MLP) layer to enhance the model&#39;s representational capacity.

            The MLP block consists of two linear transformations with a GELU activation function in between.

            The first linear transformation increases the dimensionality of the
            input four-fold from <code class="svelte-12uffcp">768</code> to <code class="svelte-12uffcp">3072</code>.

            The second linear transformation reduces the dimensionality back to
            the original size of <code class="svelte-12uffcp">768</code>,
            ensuring that the subsequent layers receive inputs of consistent dimensions.

            Unlile the self-attention mechanis, the MLP processes tokens independently and
            simply maps them from one representation to another.</p></div> <div class="architecture-section svelte-12uffcp"><h2 class="svelte-12uffcp">Output Probabilities</h2> <p class="svelte-12uffcp">After the input has been processed through all Transformer blocks,
          the output is passed through the final linear layer to prepare it for token prediction.

          This layer projects the final representations into a <code class="svelte-12uffcp">50,257</code>
          dimensional space, where every token in the vocabulary has a corresponding
          value called <code class="svelte-12uffcp">logit</code>. Any token can be the next word, so this
          process allows us to simply rank these tokens by their likelihood of
          being that next word.

          We then apply the softmax function to convert the logits into a probability distribution that sums to one.
          This will allow us to sample the next token based on its likelihood.</p> <div class="figure svelte-12uffcp"><img src="static/article_assets/softmax.png" width="60%" align="middle" class="svelte-12uffcp"/></div> <div class="figure-caption svelte-12uffcp">Figure <span class="attention svelte-12uffcp">X</span>. Each token in the vocabulary is assigned a probability based on the model&#39;s output logits.
          These probabilities determine the likelihood of each token being the next word in the sequence.</div> <p class="svelte-12uffcp">The final step is to generate the next token by sampling from this distribution

          The <code class="svelte-12uffcp">temperature</code> hyperparameter plays a critical role in this process.

          Mathematically speaking, it is a very simple operation:
          model output logits are simply divided by the <code class="svelte-12uffcp">temperature</code>:</p> <ul class="svelte-12uffcp"><li class="svelte-12uffcp"><code class="svelte-12uffcp">temperature = 1</code>: Dividing logits by one has no effect on the softmax outputs.</li> <li class="svelte-12uffcp"><code class="svelte-12uffcp">temperature &lt; 1</code>: Lower temperature makes the model more confident and deterministic
        by sharpening the probability distribution, leading to more predictable outputs.</li> <li class="svelte-12uffcp"><code class="svelte-12uffcp">temperature &gt; 1</code>: Higher temperature creates a softer probability distribution,
        allowing for more randomness in the generated text – what some refer to as model <em>“creativity”</em>.</li></ul> <p class="svelte-12uffcp">Adjust the temperature and see how you can balance between deterministic and diverse outputs!</p></div> <div class="architecture-section svelte-12uffcp"><h2 class="svelte-12uffcp">Advanced Architectural Features</h2> <p class="svelte-12uffcp">There are several advanced architectural features that enhance the performance of Transformer models.
          While important for the model&#39;s overall performance, they are not as important for understanding the core concepts of the architecture.

          Layer Normalization, Dropout, and Residual Connections are crucial components in Transformer models,
          particularly during the training phase.

          Layer Normalization stabilizes training and
          helps the model converge faster.

          Dropout prevents overfitting by randomly deactivating neurons.

          Residual Connections allows gradients to flow directly through the network and helps to prevent the vanishing gradient problem.</p> <div class="article-subsection svelte-12uffcp"><h3 class="svelte-12uffcp">Layer Normalization</h3> <p class="svelte-12uffcp">Layer Normalization helps to stabilize the training process and improves convergence.

            It works by normalizing the inputs across the features,
            ensuring that the mean and variance of the activations are consistent.

            This normalization helps mitigate issues related to internal covariate shift,
            allowing the model to learn more effectively and reducing the sensitivity to the initial weights.

            Layer Norm is applied twice in each Transformer block, once before the self-attention mechanism
            and once before the MLP layer.</p></div> <div class="article-subsection svelte-12uffcp"><h3 class="svelte-12uffcp">Dropout</h3> <p class="svelte-12uffcp">Dropout is a regularization technique used to prevent overfitting in neural networks
            by randomly setting a fraction of model wights to zero during training.

            This encourages the model to learn more robust features and reduces dependency
            on specific neurons, helping the network generalize better to new, unseen data.

            During model inference, dropout is deactivated.

            This essentially means that we are using an ensemble of the trained subnetworks,
            which leads to a better model performance.</p></div> <div class="article-subsection svelte-12uffcp"><h3 class="svelte-12uffcp">Residual Connections</h3> <p class="svelte-12uffcp">Residual connections were first introduced in the ResNet model in 2015.
            This architectural innovation revolutionized deep learning
            by enabling the training of very deep neural networks.

            Essentially, residual connections are shortcuts that bypass one or more layers,
            adding the input of a layer to its output.

            This helps mitigate the vanishing gradient problem, making it easier to train deep networks
            with multiple Transformer blocks stacked on top of each other.

            In GPT-2, residual connections are used twice within each Transformer block:
            once before the MLP and once after, ensuring that gradients flow more easily,
            and earlier layers receive sufficient updates during backpropagation.</p></div></div> <div class="article-section svelte-12uffcp"><h1 class="svelte-12uffcp">Interactive Features</h1> <p class="svelte-12uffcp">Transformer Explainer is built to be interactive and allow you to explore the inner workings of the Transformer.
        Here are some of the interactive features you can play with:</p> <ul class="svelte-12uffcp"><li class="svelte-12uffcp"><strong>Input your own text sequence</strong> to see how the model processes it and predicts the next word.

          Explore attention weights, intermediate computations, and see how the final output probabilities are calculated.</li> <li class="svelte-12uffcp"><strong>Use the temperature slider</strong> to control the randomness of the model’s predictions.

          Explore how you can make the model output more deterministic or more creative by changing the temperature value.</li> <li class="svelte-12uffcp"><strong>Interact with attention maps</strong> to see how the model
          focuses on different tokens in the input sequence.

          Hover over tokens to highlight their attention weights and
          explore how the model captures context and relationships between words.</li></ul></div> <div class="article-section svelte-12uffcp"><h1 class="svelte-12uffcp">Video Tutorial</h1> <span class="attention svelte-12uffcp">FUTURE_LINK_TO_YOUTUBE_TUTORIAL</span></div> <div class="article-section svelte-12uffcp"><h1 class="svelte-12uffcp">How is Transformer Explainer implemented?</h1> <p class="svelte-12uffcp">Transformer Explainer features a live GPT-2 (small) model running directly in the browser.

        This model is derived from the PyTorch implementation of GPT by Andrej Karpathy&#39;s
        <a href="https://github.com/karpathy/nanoGPT" title="Github" target="_blank" class="svelte-12uffcp">nanoGPT project</a>
        and has been converted to <a href="https://onnxruntime.ai/" title="ONNX" target="_blank" class="svelte-12uffcp">ONNX Runtime</a>
        for seamless in-browser execution.

        The interface is built using JavaScript, with <a href="https://kit.svelte.dev/" title="Svelte" target="_blank" class="svelte-12uffcp">Svelte</a>
        as a front-end framework and <a href="http://D3.js" title="D3" target="_blank" class="svelte-12uffcp">D3.js</a>
        for creating dynamic visualizations.

        Numerical values are updated live following the user input.</p></div> <div class="article-section svelte-12uffcp"><h1 class="svelte-12uffcp">Who developed the Transformer Explainer?</h1> <p class="svelte-12uffcp">Transformer Explainer was created by

        <a href="https://aereeeee.github.io/" target="_blank" class="svelte-12uffcp">Aeree Cho</a>,
        <a href="https://www.linkedin.com/in/chaeyeonggracekim/" target="_blank" class="svelte-12uffcp">Grace C. Kim</a>,
        <a href="https://alexkarpekov.com/" target="_blank" class="svelte-12uffcp">Alexander Karpekov</a>,
        <a href="https://alechelbling.com/" target="_blank" class="svelte-12uffcp">Alec Helbling</a>,
        <a href="https://zijie.wang/" target="_blank" class="svelte-12uffcp">Jay Wang</a>,
        <a href="https://seongmin.xyz/" target="_blank" class="svelte-12uffcp">Seongmin Lee</a>,
        <a href="https://bhoov.com/" target="_blank" class="svelte-12uffcp">Benjamin Hoover</a>, and
        <a href="https://poloclub.github.io/polochau/" target="_blank" class="svelte-12uffcp">Polo Chau</a>

        at the Georgia Institute of Technology.</p></div></div></div></div></div>`;return{c(){e=c("body"),e.innerHTML=s,this.h()},l(t){e=p(t,"BODY",{class:!0,"data-svelte-h":!0}),f(e)!=="svelte-1xbac1r"&&(e.innerHTML=s),this.h()},h(){u(e,"class","svelte-12uffcp")},m(t,i){h(t,e,i)},p:n,i:n,o:n,d(t){t&&d(e)}}}function _(a){return k(T),[]}class q extends r{constructor(e){super(),l(this,e,_,x,o,{})}}function P(a){let e,s;return e=new q({}),{c(){m(e.$$.fragment)},l(t){v(e.$$.fragment,t)},m(t,i){g(e,t,i),s=!0},p:n,i(t){s||(b(e.$$.fragment,t),s=!0)},o(t){w(e.$$.fragment,t),s=!1},d(t){y(e,t)}}}class M extends r{constructor(e){super(),l(this,e,null,P,o,{})}}export{M as component};

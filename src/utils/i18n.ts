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

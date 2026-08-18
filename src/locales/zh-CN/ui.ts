export const uiText = {
	input: {
		examples: '示例',
		placeholder: '输入一段英文提示文本',
		ariaLabel: 'GPT-2 英文提示文本',
		generate: '生成',
		tokenCountWaiting: '正在准备分词器…',
		tokenCount: (count: number, limit: number) => `${count} / ${limit} 个词元`,
		tokenLimitExceeded: (limit: number) => `已超过 ${limit} 个词元，请缩短输入后再生成。`,
		languageHint: '当前使用 GPT-2 Small，英文输入效果更稳定。',
		mobileHint: '移动端可体验内置示例；建议横屏或使用桌面端查看完整可视化。'
	},
	model: {
		preparing: '正在准备 GPT-2 Small…',
		downloading: '正在下载模型文件…',
		loadingCache: '正在读取已缓存的模型…',
		ready: '模型准备完成',
		error: '模型加载失败，请刷新后重试。',
		mobilePreview: '移动端使用预计算示例'
	},
	actions: {
		openTextbook: '打开教程',
		readMore: '了解更多'
	}
} as const;

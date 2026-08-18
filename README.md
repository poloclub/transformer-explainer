# Transformer Explainer 中文版

Transformer Explainer 中文版是在[原项目](https://github.com/poloclub/transformer-explainer)基础上维护的中文教学版本。它通过浏览器内运行的 GPT-2 Small 和交互式可视化，帮助中文读者理解词元化、嵌入、自注意力、MLP、采样等文本生成环节。

[MIT License](https://opensource.org/licenses/MIT)
[CHI 2026](https://dl.acm.org/doi/10.1145/3772318.3791725)

## 在线体验

- 中文版：[https://Jian1202.github.io/transformer-explainer-cn/](https://Jian1202.github.io/transformer-explainer-cn/)
- 英文原版：[https://poloclub.github.io/transformer-explainer/](https://poloclub.github.io/transformer-explainer/)

## 项目边界

- 汉化范围包括活动界面、交互提示、教程和长篇教学文章。
- 底层模型仍是主要面向英文的 GPT-2 Small，并未替换为中文生成模型。
- 中文文本可以由 GPT-2 分词器编码，但切分方式和生成效果不等同于中文模型；建议使用英文提示文本体验实时生成。
- 中文字符被拆为多个字节级词元时，单个词元的可视化可能显示为 `�`；这是英文 GPT-2 的分词和单词元解码限制，不代表页面文字编码错误，后续可考虑优化组合显示。
- 中文版包含词元计数、窄屏布局、部署路径等本地适配，与原版并非逐文件完全一致。
- 上游更新采用人工审核、选择性同步，避免自动同步覆盖本地化内容。



## 功能

- 在浏览器中运行 GPT-2 Small，并逐步展示下一词元预测过程。
- 查看词元嵌入、可学习的位置嵌入、Q/K/V、多头自注意力和 MLP。
- 调整温度以及 Top-k、Top-p 采样参数。
- 展开计算区域、权重弹窗和交互教程。
- 使用真实 GPT-2 分词结果限制输入长度并显示词元计数。

首次实时加载模型时需要下载约 600 MB 的分片文件；后续访问会优先读取浏览器缓存。移动端默认使用预计算示例，以避免自动下载完整模型，完整交互建议使用桌面浏览器。

## 本地运行

环境要求：

- Node.js 20 或更高版本
- npm 10 或更高版本

```bash
git clone https://github.com/Jian1202/transformer-explainer-cn.git
cd transformer-explainer-cn
npm ci
npm run dev
```

开发服务器默认为 [http://localhost:5173](http://localhost:5173)。

常用检查命令：

```bash
npm run check:localization
npm run check
npm run build
```

`npm run check:localization` 是只读扫描，不会自动改写源码。  
生产构建使用 `/transformer-explainer-cn` 基础路径，以适配 GitHub Pages。

## 目录说明

```text
src/
├── components/       # 可视化、教程、文章与交互组件
├── constants/        # 示例模型输出与视觉常量
├── locales/zh-CN/    # 短界面文案、动态提示和术语清单
├── routes/           # SvelteKit 页面与布局
├── store/            # 交互和模型状态
└── utils/            # 模型推理、采样、动画与教程逻辑
static/
├── article_assets/   # 教学文章配图
├── model-v2/         # GPT-2 ONNX 分片
└── preview/          # 分享预览图
```



## 上游维护

本仓库保留 `upstream` 合并关系。  
同步上游时会人工检查依赖、模型逻辑、教学事实、部署配置和中文文案，不采用定时自动同步工作流。  
若修改用户可见字符串，请同时运行汉化检查，并确认技术专名属于允许清单或已有人工审核上下文。

## 论文与原项目团队

正式论文：

[Transformer Explainer: Learning LLM Transformers with Interactive Visual Explanation and Experimentations](https://dl.acm.org/doi/10.1145/3772318.3791725), Proceedings of the 2026 CHI Conference on Human Factors in Computing Systems.

原项目由 Aeree Cho、Grace C. Kim、Alexander Karpekov、Seongmin Lee、Alec Helbling、Benjamin Hoover、Zijie J. Wang、Minsuk Kahng 和 Duen Horng Chau 等佐治亚理工学院研究者共同完成。  
请以[原仓库](https://github.com/poloclub/transformer-explainer)和正式论文中的署名为准。

```bibtex
@inproceedings{cho2026transformer,
  title={Transformer Explainer: Learning LLM Transformers with Interactive Visual Explanation and Experimentations},
  author={Cho, Aeree and Kim, Grace C. and Karpekov, Alexander and Lee, Seongmin and Helbling, Alec and Hoover, Benjamin and Wang, Zijie J. and Kahng, Minsuk and Chau, Duen Horng},
  booktitle={Proceedings of the 2026 CHI Conference on Human Factors in Computing Systems},
  pages={1--21},
  year={2026}
}
```



## 许可证与反馈

项目沿用原项目的 [MIT License](LICENSE)。

翻译、教学表述和中文版适配问题可在[中文版仓库](https://github.com/Jian1202/transformer-explainer-cn/issues)反馈；  
原版功能问题也可参考[上游 Issues](https://github.com/poloclub/transformer-explainer/issues)。

import { gsap } from 'gsap';
import resolveConfig from 'tailwindcss/resolveConfig';
import tailwindConfig from '../../tailwind.config';
import { tokens } from '~/store';
import {
	ATTENTION_HEAD_1,
	ATTENTION_HEAD_BACK,
	ATTENTION_OUT,
	EMBEDDING,
	LOGIT,
	MLP,
	TRANSFORMER_BLOCKS
} from '~/constants/opacity';
const { theme } = resolveConfig(tailwindConfig);

const generateGradientAnimation = (
	tl,
	gradStop: undefined | SVGPathElement | (SVGPathElement | undefined)[],
	options: GSAPTweenVars = {}
) => {
	const {
		color = 'rgba(255,255,255,0)',
		duration = 0.2,
		ease = 'power1.in',
		offset = { from: '0%', to: '100%' },
		position = '+=0',
		...restOptions
	} = options;

	const { from = '0%', to = '100%' } = offset;

	const initialColor = Array.isArray(gradStop)
		? gradStop.map((d) => d.getAttribute('stop-color'))
		: gradStop.getAttribute('stop-color');

	tl.fromTo(
		gradStop,
		{ attr: { offset: from, ['stop-color']: color } },
		{
			attr: {
				offset: to,
				['stop-color']: color
			},
			duration,
			ease,
			...restOptions
		},
		position
	).to(
		gradStop,
		{
			attr: {
				offset: to,
				['stop-color']: (i) => (Array.isArray(gradStop) ? initialColor[i] : initialColor)
			},
			duration,
			ease,
			...restOptions
		},
		'-=50%'
	);
};

const fadeOutColor = theme.colors.gray[100];
const nodeFadeOutOpacity = 0.2;

export const showFlowAnimation = async (tokenLength: number) => {
	return new Promise((resolve) => {
		const tl = gsap.timeline({ onComplete: resolve });

		const isNextTokenOnly = false;
		const duration = 0.02;

		// ============================
		// add token vector to embedding
		// ============================
		const tokenEmbedding = document.querySelectorAll(
			// isNextTokenOnly ? '.embedding .content .last' : '.embedding .content'
			'.embedding .content .last'
		);
		tl.fromTo(tokenEmbedding, { opacity: 0 }, { opacity: 1, duration });

		// ============================
		// draw qkv weight mul path
		// ============================

		// TODO resolve hard coding
		const embeddingLastPath = document.querySelectorAll('.sankey .embedding .last');
		tl.set(embeddingLastPath, { opacity: EMBEDDING });

		const qkvGradLast = document.querySelector('#gray-blue-last')?.querySelectorAll('stop')[1];
		generateGradientAnimation(tl, qkvGradLast, { duration: duration * 10 });

		// ============================
		// add qkv vector to attention
		// ============================
		const qkv = document.querySelectorAll(
			// isNextTokenOnly ? '.attention .column .vector.last' : '.attention .column .vector'
			'.attention .column .vector.last'
		);
		tl.fromTo(
			qkv,
			{
				opacity: 0
			},
			{ opacity: 1, duration }
		);

		// ============================
		// draw multi-head divided path
		// ============================

		const attentionLastPath = document.querySelectorAll('.sankey-top .attention .last');
		const attentionLastBackPath = document.querySelectorAll('.sankey-back .attention .last');
		const attentionOutPath = document.querySelectorAll('.sankey-top .attention .to-attention-out');

		tl.set(attentionLastPath, { opacity: ATTENTION_HEAD_1 });
		tl.set(attentionLastBackPath, { opacity: ATTENTION_HEAD_BACK });
		tl.set(attentionOutPath, { opacity: ATTENTION_OUT });

		const queryH1Grad = document.querySelector('#blue-blue-last')?.querySelectorAll('stop')[1];
		const keyH1Grad = document.querySelector('#red-red-last')?.querySelectorAll('stop')[1];
		const valueH1Grad = document.querySelector('#green-green-last')?.querySelectorAll('stop')[1];

		const queryGrad = document.querySelector('#blue-blue2-last')?.querySelectorAll('stop')[1];
		const keyGrad = document.querySelector('#red-red2-last')?.querySelectorAll('stop')[1];
		const valueGrad = document.querySelector('#green-green2-last')?.querySelectorAll('stop')[1];

		generateGradientAnimation(
			tl,
			[queryH1Grad, keyH1Grad, valueH1Grad, queryGrad, keyGrad, valueGrad],
			{
				// stagger: 0.2
				duration: duration * 10
			}
		);

		// ============================
		// add h1 qkv vector
		// ============================
		const qkvHead1 = document.querySelectorAll(
			// isNextTokenOnly
			// 	? '.attention .head-block .qkv .column .last'
			// 	: '.attention .head-block .qkv .column '
			'.attention .head-block .qkv .column .last'
		);
		tl.fromTo(
			qkvHead1,
			{
				opacity: 0
			},
			{ opacity: 1, duration }
		);

		// generateGradientAnimation(tl, [queryGrad, keyGrad, valueGrad], {
		// 	// stagger: 0.2
		// });

		// ============================
		// draw attention matrix mul path
		// add attention values
		// ============================
		const keyPaths = document.querySelectorAll('.sankey-top g.attention path.key-to-attention');
		const queryPaths = document.querySelectorAll('.sankey-top g.attention path.query-to-attention');
		const attentionMatrix = document.querySelector('.attention .attention-result');

		[...keyPaths, ...queryPaths].forEach((path) => {
			const length = path.getTotalLength();
			path.style.strokeDasharray = length;
			path.style.strokeDashoffset = length;
		});

		const QKDuration = 0.4;
		const stagger = Number((QKDuration / tokenLength).toFixed(2));

		tl.to(keyPaths, {
			strokeDashoffset: 0,
			stagger,
			duration: QKDuration,
			ease: 'power2.out'
		})
			.to(
				queryPaths,
				{
					strokeDashoffset: 0,
					stagger,
					duration: QKDuration,
					// ease: 'back.out(1.7)'
					ease: 'power2.out'
				},
				'<'
			)
			.from(
				attentionMatrix.querySelectorAll('svg circle'),
				{
					scale: 0,
					transformOrigin: '50% 50%',
					opacity: 0,
					delay: QKDuration / tokenLength,
					stagger: Number((QKDuration / Math.pow(tokenLength, 2)).toFixed(2)),
					ease: 'power2.out',
					// ease: 'back.out(1.7)',
					duration: QKDuration
				},
				'<'
			);

		// ============================
		// draw val and attention mul path
		// ============================
		const valueMulGrad = document.querySelector('#green-purple')?.querySelectorAll('stop')[1];

		const attentionMulrad = document
			.querySelector('#transparent-purple2')
			?.querySelectorAll('stop')[1];

		generateGradientAnimation(tl, [attentionMulrad, valueMulGrad], {
			color: fadeOutColor,
			position: '<50%'
		});

		// ============================
		// add output vector
		// ============================
		const outputHead1 = document.querySelectorAll(
			isNextTokenOnly
				? '.attention .head-block .head-out .column .last'
				: '.attention .head-block .head-out .column .cell'
		);
		const outputTitle = document.querySelector('.attention .head-block .head-out .title');
		tl.fromTo(
			[outputHead1, outputTitle],
			{
				opacity: (i, d) => {
					return d.classList.contains('last') ? 0 : nodeFadeOutOpacity;
				}
			},
			{ opacity: 1, duration }
		);

		// ============================
		// draw concat path
		// ============================
		const outputH1Grad = document.querySelector('#purple-purple')?.querySelectorAll('stop')[1];
		const outputGrad = document.querySelector('#transparent-purple')?.querySelectorAll('stop')[1];
		const outputH1GradLast = document
			.querySelector('#purple-purple-last')
			?.querySelectorAll('stop')[1];
		const outputGradLast = document
			.querySelector('#transparent-purple-last')
			?.querySelectorAll('stop')[1];

		tl.set([outputH1Grad, outputH1GradLast], { opacity: ATTENTION_HEAD_1 });
		tl.set([outputGrad, outputGradLast], { opacity: ATTENTION_HEAD_BACK });

		if (isNextTokenOnly) {
			generateGradientAnimation(tl, [outputH1GradLast, outputGradLast]);
		} else {
			generateGradientAnimation(tl, [outputH1Grad, outputGrad], { color: fadeOutColor });
			generateGradientAnimation(tl, [outputH1GradLast, outputGradLast], { position: '<' });
		}

		// ============================
		// add MLP input vector
		// ============================
		const mlpInputs = document.querySelectorAll(
			isNextTokenOnly ? '.mlp .first-layer .cell.last' : '.mlp .first-layer .cell'
		);

		tl.fromTo(
			mlpInputs,
			{
				opacity: (i, d) => {
					return d.classList.contains('last') ? 0 : nodeFadeOutOpacity;
				}
			},
			{ opacity: 1, duration }
		);

		// ============================
		// draw MLP first layer path
		// ============================

		const mlpLastPath = document.querySelectorAll('.sankey .mlp .last');
		tl.set(mlpLastPath, { opacity: MLP });

		const mlpInputPath = document.querySelector('#purple-indigo')?.querySelectorAll('stop')[1];
		const mlpInputPathLast = document
			.querySelector('#purple-indigo-last')
			?.querySelectorAll('stop')[1];

		// generateGradientAnimation(tl, mlpInputPath, { color: theme.colors.gray[200] });
		// generateGradientAnimation(
		// 	tl,
		// 	isNextTokenOnly ? mlpInputPathLast : [mlpInputPath, mlpInputPathLast]
		// );

		if (isNextTokenOnly) {
			generateGradientAnimation(tl, mlpInputPathLast);
		} else {
			generateGradientAnimation(tl, mlpInputPath, { color: fadeOutColor });
			generateGradientAnimation(tl, mlpInputPathLast, { position: '<' });
		}

		// ============================
		// add MLP first layer output vector
		// ============================
		const mlpProjections = document.querySelectorAll(
			isNextTokenOnly
				? '.mlp .second-layer .projections .cell.last'
				: '.mlp .second-layer .projections .cell'
		);
		tl.fromTo(
			mlpProjections,
			{
				opacity: (i, d) => {
					return d.classList.contains('last') ? 0 : nodeFadeOutOpacity;
				}
			},
			{ opacity: 1, duration }
		);

		// ============================
		// draw MLP output layer
		// ============================
		const mlpSecondPath = document.querySelector('#indigo-blue')?.querySelectorAll('stop')[1];
		const mlpSecondPathLast = document
			.querySelector('#indigo-blue-last')
			?.querySelectorAll('stop')[1];

		// generateGradientAnimation(tl, mlpSecondPath, { color: theme.colors.gray[200] });
		// generateGradientAnimation(
		// 	tl,
		// 	isNextTokenOnly ? mlpSecondPathLast : [mlpSecondPath, mlpSecondPathLast],
		// );

		if (isNextTokenOnly) {
			generateGradientAnimation(tl, mlpSecondPathLast);
		} else {
			generateGradientAnimation(tl, mlpSecondPath, { color: fadeOutColor });
			generateGradientAnimation(tl, mlpSecondPathLast, { position: '<' });
		}

		// ============================
		// add MLP output vector
		// ============================
		const mlpOutputs = document.querySelectorAll(
			isNextTokenOnly ? '.mlp .second-layer .ouputs .last' : '.mlp .second-layer .ouputs .cell'
		);
		tl.fromTo(
			mlpOutputs,
			{
				opacity: (i, d) => {
					return d.classList.contains('last') ? 0 : nodeFadeOutOpacity;
				}
			},
			{ opacity: 1, duration }
		);

		// ============================
		// show repetition of blocks
		// ============================
		const blockPath = document.querySelectorAll('.sankey .transformer-blocks .last');
		tl.set(blockPath, { opacity: TRANSFORMER_BLOCKS });

		const transformerBlocksStop1 = document
			.querySelector('#blue-white-blue')
			?.querySelectorAll('stop')[1];
		const transformerBlocksStop2 = document
			.querySelector('#blue-white-blue')
			?.querySelectorAll('stop')[3];
		const transformerBlocksStop1Last = document
			.querySelector('#blue-white-blue-last')
			?.querySelectorAll('stop')[1];
		const transformerBlocksStop2Last = document
			.querySelector('#blue-white-blue-last')
			?.querySelectorAll('stop')[3];

		const blockTl = gsap.timeline({
			// repeat: 2
		});

		if (isNextTokenOnly) {
			generateGradientAnimation(blockTl, transformerBlocksStop1Last, {
				duration: duration * 5,
				offset: { to: '50%' },
				ease: 'sine.inOut'
			});
			generateGradientAnimation(blockTl, transformerBlocksStop2Last, {
				duration: duration * 5,
				offset: { from: '50%' },
				ease: 'sine.inOut'
			});
		} else {
			generateGradientAnimation(blockTl, transformerBlocksStop1, {
				color: fadeOutColor,
				duration: duration * 5,
				offset: { to: '50%' },
				ease: 'sine.inOut'
			});
			generateGradientAnimation(blockTl, transformerBlocksStop1Last, {
				duration: duration * 5,
				offset: { to: '50%' },
				ease: 'sine.inOut',
				position: '<'
			});
			generateGradientAnimation(blockTl, transformerBlocksStop2, {
				duration: duration * 5,
				color: fadeOutColor,
				offset: { from: '50%' },
				ease: 'sine.inOut'
			});
			generateGradientAnimation(blockTl, transformerBlocksStop2Last, {
				duration: duration * 5,
				offset: { from: '50%' },
				ease: 'sine.inOut',
				position: '<'
			});
		}

		tl.add(blockTl);

		// ============================
		// add final output vector
		// ============================
		const finalOutput = document.querySelectorAll(
			isNextTokenOnly ? '.transformer-blocks .cell.last' : '.transformer-blocks .cell'
		);
		tl.fromTo(
			finalOutput,
			{
				opacity: (i, d) => {
					return d.classList.contains('last') ? 0 : nodeFadeOutOpacity;
				}
			},
			{ opacity: 1, duration }
		);

		// ============================
		// draw logit path
		// ============================

		const softmaxPath = document.querySelectorAll('.sankey .linear-softmax .last');
		tl.set(softmaxPath, { opacity: LOGIT });

		const logitPath = document.querySelector('#blue-gray')?.querySelectorAll('stop')[1];

		generateGradientAnimation(tl, logitPath, { offset: { to: `50%` } });

		// ============================
		// show top k tokens and probabilities
		// ============================
		const probabilities = document.querySelectorAll('.softmax .content');
		tl.fromTo(probabilities, { opacity: 0 }, { opacity: 1, duration });

		// ============================
		// sampling animation
		// ============================
		// await showSamplingAnimation();
	});
};

export const showSamplingAnimation = async () => {};

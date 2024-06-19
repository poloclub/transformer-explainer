import { gsap } from 'gsap';
import resolveConfig from 'tailwindcss/resolveConfig';
import tailwindConfig from '../../tailwind.config';
import { tokens } from '~/store';
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

export const showFlowAnimation = async (tokenLength: number) => {
	return new Promise((resolve) => {
		const tl = gsap.timeline({ onComplete: resolve });

		const isNextTokenOnly = false;
		const duration = 0.01;

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
		tl.set(embeddingLastPath, { opacity: 0.6 });

		const qkvGradLast = document.querySelector('#gray-blue-last')?.querySelectorAll('stop')[1];
		generateGradientAnimation(tl, qkvGradLast, { duration: duration * 1.5 });

		// ============================
		// add qkv vector to attention
		// ============================
		const qkv = document.querySelectorAll(
			// isNextTokenOnly ? '.attention .column .vector.last' : '.attention .column .vector'
			'.attention .column .vector.last'
		);
		tl.fromTo(qkv, { opacity: 0 }, { opacity: 1, duration });

		// ============================
		// draw multi-head divided path
		// ============================

		const attentionLastPath = document.querySelectorAll('.sankey-top .attention .last');
		const attentionLastBackPath = document.querySelectorAll('.sankey-back .attention .last');
		const attentionOutPath = document.querySelectorAll('.sankey-top .attention .to-attention-out');

		tl.set(attentionLastPath, { opacity: 1 });
		tl.set([attentionLastBackPath, attentionOutPath], { opacity: 0.4 });

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
		tl.fromTo(qkvHead1, { opacity: 0 }, { opacity: 1, duration });

		// generateGradientAnimation(tl, [queryGrad, keyGrad, valueGrad], {
		// 	// stagger: 0.2
		// });

		// ============================
		// draw attention matrix mul path
		// add attention values
		// ============================
		const keyPaths = document.querySelectorAll('.sankey g.attention path.key-to-attention');
		const queryPaths = document.querySelectorAll('.sankey g.attention path.query-to-attention');
		const outPaths = document.querySelectorAll('.sankey g.attention path.to-attention-out');
		const attentionMatrix = document.querySelector('.attention .attention-result');

		[...keyPaths, ...queryPaths].forEach((path) => {
			const length = path.getTotalLength();
			path.style.strokeDasharray = length;
			path.style.strokeDashoffset = length;
		});
		const QKDuration = 0.4;
		const stagger = Number((QKDuration / tokenLength).toFixed(2));

		tl.to(
			keyPaths,
			{
				strokeDashoffset: 0,
				stagger,
				duration: QKDuration,
				ease: 'power2.out'
			},
			'<+=50%'
		)
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

		generateGradientAnimation(tl, [attentionMulrad, valueMulGrad], {});

		// ============================
		// add output vector
		// ============================
		const outputHead1 = document.querySelectorAll(
			isNextTokenOnly
				? '.attention .head-block .head-out .column .last'
				: '.attention .head-block .head-out .column .cell'
		);
		tl.fromTo(outputHead1, { opacity: 0 }, { opacity: 1, duration });

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

		generateGradientAnimation(
			tl,
			isNextTokenOnly
				? [outputH1GradLast, outputGradLast]
				: [outputH1Grad, outputGrad, outputH1GradLast, outputGradLast],
			{
				// stagger: 0.2
			}
		);

		// ============================
		// add MLP input vector
		// ============================
		const mlpInputs = document.querySelectorAll(
			isNextTokenOnly ? '.mlp .first-layer .cell.last' : '.mlp .first-layer .cell'
		);
		tl.fromTo(mlpInputs, { opacity: 0 }, { opacity: 1, duration });

		// ============================
		// draw MLP first layer path
		// ============================

		const mlpLastPath = document.querySelectorAll('.sankey .mlp .last');
		tl.set(mlpLastPath, { opacity: 0.4 });

		const mlpInputPath = document.querySelector('#purple-indigo')?.querySelectorAll('stop')[1];
		const mlpInputPathLast = document
			.querySelector('#purple-indigo-last')
			?.querySelectorAll('stop')[1];

		// generateGradientAnimation(tl, mlpInputPath, { color: theme.colors.gray[200] });
		generateGradientAnimation(
			tl,
			isNextTokenOnly ? mlpInputPathLast : [mlpInputPath, mlpInputPathLast],
			{}
		);

		// ============================
		// add MLP first layer output vector
		// ============================
		const mlpProjections = document.querySelectorAll(
			isNextTokenOnly
				? '.mlp .second-layer .projections .cell.last'
				: '.mlp .second-layer .projections .cell'
		);
		tl.fromTo(mlpProjections, { opacity: 0 }, { opacity: 1, duration });

		// ============================
		// draw MLP output layer
		// ============================
		const mlpSecondPath = document.querySelector('#indigo-blue')?.querySelectorAll('stop')[1];
		const mlpSecondPathLast = document
			.querySelector('#indigo-blue-last')
			?.querySelectorAll('stop')[1];

		// generateGradientAnimation(tl, mlpSecondPath, { color: theme.colors.gray[200] });
		generateGradientAnimation(
			tl,
			isNextTokenOnly ? mlpSecondPathLast : [mlpSecondPath, mlpSecondPathLast],
			{}
		);

		// ============================
		// add MLP output vector
		// ============================
		const mlpOutputs = document.querySelectorAll(
			isNextTokenOnly ? '.mlp .second-layer .ouputs .last' : '.mlp .second-layer .ouputs .cell'
		);
		tl.fromTo(mlpOutputs, { opacity: 0 }, { opacity: 1, duration });

		// ============================
		// show repetition of blocks
		// ============================
		const blockPath = document.querySelectorAll('.sankey .transformer-blocks .last');
		tl.set(blockPath, { opacity: 0.6 });

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
		generateGradientAnimation(
			blockTl,
			isNextTokenOnly
				? transformerBlocksStop1
				: [transformerBlocksStop1, transformerBlocksStop1Last],
			{
				duration: 0.3,
				offset: { to: '50%' },
				ease: 'sine.inOut'
			}
		);
		generateGradientAnimation(
			blockTl,
			isNextTokenOnly
				? transformerBlocksStop2
				: [transformerBlocksStop2, transformerBlocksStop2Last],
			{
				duration: 0.3,
				offset: { from: '50%' },
				ease: 'sine.inOut'
			}
		);

		tl.add(blockTl);

		// ============================
		// add final output vector
		// ============================
		const finalOutput = document.querySelectorAll(
			isNextTokenOnly ? '.transformer-blocks .cell.last' : '.transformer-blocks .cell'
		);
		tl.fromTo(finalOutput, { opacity: 0 }, { opacity: 1, duration });

		// ============================
		// draw logit path
		// ============================

		const softmaxPath = document.querySelectorAll('.sankey .linear-softmax .last');
		tl.set(softmaxPath, { opacity: 0.6 });

		const logitPath = document.querySelector('#blue-gray')?.querySelectorAll('stop')[1];

		generateGradientAnimation(tl, logitPath, {});

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

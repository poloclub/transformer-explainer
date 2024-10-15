import { gsap } from 'gsap';
import resolveConfig from 'tailwindcss/resolveConfig';
import tailwindConfig from '../../tailwind.config';
import { isOnAnimation } from '~/store';
const { theme } = resolveConfig(tailwindConfig);

const getGradientStops = (className: string, stopIdx = 1) => {
	return Array.from(document.querySelectorAll(className)).map(
		(el) => el?.querySelectorAll('stop')[stopIdx]
	);
};
const generateGradientAnimation = (
	tl,
	gradStop: undefined | SVGStopElement | (SVGStopElement | undefined)[],
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

export const showFlowAnimation = async (tokenLength: number, isNextTokenOnly = true) => {
	return new Promise((resolve) => {
		const tl = gsap.timeline({
			onStart: () => {
				isOnAnimation.set(true);
			},
			onComplete: () => {
				isOnAnimation.set(false);
				resolve();
			}
		});
		const duration = 0.02;

		// ============================
		// add token vector to embedding
		// ============================
		const tokenEmbedding = document.querySelectorAll(
			isNextTokenOnly ? '.embedding .content .last' : '.embedding .content'
		);
		tl.fromTo(
			tokenEmbedding,
			{ opacity: 0 },
			{
				opacity: 1,
				duration: isNextTokenOnly ? duration : 0.2
			}
		);

		// ============================
		// draw embedding to qkv weight mul path
		// ============================
		const [embeddingToQKVGrad, embeddingToQKVGradLast] = getGradientStops('.gray-blue');
		generateGradientAnimation(
			tl,
			isNextTokenOnly ? embeddingToQKVGradLast : [embeddingToQKVGrad, embeddingToQKVGradLast],
			{
				duration: duration * 10
			}
		);

		// ============================
		// add qkv vector to attention
		// ============================
		const qkv = document.querySelectorAll(
			isNextTokenOnly ? '.attention .column .vector.last' : '.attention .column .vector'
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
		const [queryH1Grad, queryH1GradLast] = getGradientStops('.blue-blue');
		const [keyH1Grad, keyH1GradLast] = getGradientStops('.red-red');
		const [valueH1Grad, valueH1GradLast] = getGradientStops('.green-green');

		const [queryGrad, queryGradLast] = getGradientStops('.blue-blue2');
		const [keyGrad, keyGradLast] = getGradientStops('.red-red2');
		const [valueGrad, valueGradLast] = getGradientStops('.green-green2');

		if (isNextTokenOnly) {
			generateGradientAnimation(tl, [queryH1GradLast, keyH1GradLast, valueH1GradLast], {
				// stagger: 0.2
				duration: duration * 10
			});
			generateGradientAnimation(tl, [queryGradLast, keyGradLast, valueGradLast], {
				// stagger: 0.2,
				duration: duration * 10
			});
		} else {
			generateGradientAnimation(
				tl,
				[queryH1Grad, keyH1Grad, valueH1Grad, queryH1GradLast, keyH1GradLast, valueH1GradLast],
				{
					// stagger: 0.2
					duration: duration * 10
				}
			);
			generateGradientAnimation(
				tl,
				[queryGrad, keyGrad, valueGrad, queryGradLast, keyGradLast, valueGradLast],
				{
					// stagger: 0.2,
					duration: duration * 10
				}
			);
		}

		// ============================
		// add h1 qkv vector
		// ============================
		const qkvHead1 = document.querySelectorAll(
			isNextTokenOnly
				? '.attention .head-block .qkv .column .last'
				: '.attention .head-block .qkv .column'
		);
		tl.fromTo(
			qkvHead1,
			{
				opacity: 0
			},
			{ opacity: 1, duration }
		);

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
		const valueMulGrad = getGradientStops('.green-purple');
		const attentionMulrad = getGradientStops('.transparent-purple2');

		generateGradientAnimation(tl, [attentionMulrad, valueMulGrad].flat(), {
			color: isNextTokenOnly ? fadeOutColor : undefined,
			position: '<50%'
		});

		// ============================
		// add output vector
		// ============================
		const outputHead1 = document.querySelectorAll('.attention .head-block .head-out .column .cell');
		const outputTitle = document.querySelector('.attention .head-block .head-out .title');

		tl.fromTo(
			[outputHead1, outputTitle],
			{
				opacity: (i, d) => {
					if (isNextTokenOnly) {
						return d.classList.contains('last') ? 0 : nodeFadeOutOpacity;
					}
					return 0;
				}
			},
			{ opacity: 1, duration }
		);

		// ============================
		// draw concat path
		// ============================
		const [outputH1Grad, outputH1GradLast] = getGradientStops('.purple-purple');
		const [outputGrad, outputGradLast] = getGradientStops('.transparent-purple');

		if (isNextTokenOnly) {
			generateGradientAnimation(tl, [outputH1Grad, outputGrad], {
				color: fadeOutColor
			});
			generateGradientAnimation(tl, [outputH1GradLast, outputGradLast], { position: '<' });
		} else {
			generateGradientAnimation(tl, [outputH1Grad, outputGrad, outputH1GradLast, outputGradLast]);
		}

		// ============================
		// add MLP input vector
		// ============================
		const mlpInputs = document.querySelectorAll('.mlp .first-layer .cell');

		tl.fromTo(
			mlpInputs,
			{
				opacity: (i, d) => {
					if (isNextTokenOnly) {
						return d.classList.contains('last') ? 0 : nodeFadeOutOpacity;
					}
					return 0;
				}
			},
			{ opacity: 1, duration }
		);

		// ============================
		// draw MLP first layer path
		// ============================

		const [mlpInputPath, mlpInputPathLast] = getGradientStops('.purple-indigo');

		if (isNextTokenOnly) {
			generateGradientAnimation(tl, mlpInputPath, {
				color: fadeOutColor
			});
			generateGradientAnimation(tl, mlpInputPathLast, { position: '<' });
		} else {
			generateGradientAnimation(tl, [mlpInputPath, mlpInputPathLast]);
		}

		// ============================
		// add MLP first layer output vector
		// ============================
		const mlpProjections = document.querySelectorAll('.mlp .second-layer .projections .cell');
		tl.fromTo(
			mlpProjections,
			{
				opacity: (i, d) => {
					if (isNextTokenOnly) {
						return d.classList.contains('last') ? 0 : nodeFadeOutOpacity;
					}
					return 0;
				}
			},
			{ opacity: 1, duration }
		);

		// ============================
		// draw MLP output layer
		// ============================
		const [mlpSecondPath, mlpSecondPathLast] = getGradientStops('.indigo-blue');

		if (isNextTokenOnly) {
			generateGradientAnimation(tl, mlpSecondPath, {
				color: fadeOutColor
			});
			generateGradientAnimation(tl, mlpSecondPathLast, { position: '<' });
		} else {
			generateGradientAnimation(tl, [mlpSecondPath, mlpSecondPathLast]);
		}

		// ===========================
		// add MLP output vector
		// ============================
		const mlpOutputs = document.querySelectorAll('.mlp .second-layer .ouputs .cell');
		tl.fromTo(
			mlpOutputs,
			{
				opacity: (i, d) => {
					if (isNextTokenOnly) {
						return d.classList.contains('last') ? 0 : nodeFadeOutOpacity;
					}
					return 0;
				}
			},
			{ opacity: 1, duration }
		);

		// ============================
		// show repetition of blocks
		// ============================
		const [transformerBlocksStop1, transformerBlocksStop1Last] =
			getGradientStops('.blue-white-blue');
		const [transformerBlocksStop2, transformerBlocksStop2Last] = getGradientStops(
			'.blue-white-blue',
			3
		);

		const blockTl = gsap.timeline({
			// repeat: 2
		});

		if (isNextTokenOnly) {
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
		} else {
			generateGradientAnimation(blockTl, [transformerBlocksStop1, transformerBlocksStop1Last], {
				duration: duration * 5,
				offset: { to: '50%' },
				ease: 'sine.inOut'
			});
			generateGradientAnimation(blockTl, [transformerBlocksStop2, transformerBlocksStop2Last], {
				duration: duration * 5,
				offset: { from: '50%' },
				ease: 'sine.inOut'
			});
		}

		tl.add(blockTl);

		// ============================
		// add final output vector
		// ============================
		const finalOutput = document.querySelectorAll('.transformer-blocks .cell');
		tl.fromTo(
			finalOutput,
			{
				opacity: (i, d) => {
					if (isNextTokenOnly) {
						return d.classList.contains('last') ? 0 : nodeFadeOutOpacity;
					}
					return 0;
				}
			},
			{ opacity: 1, duration }
		);

		// ============================
		// draw logit path
		// ============================

		const logitPath = getGradientStops('.blue-gray');

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

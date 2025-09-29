/**
 * Highlight attention area
 */
export function highlightAttentionPath() {
	document
		.querySelectorAll('svg g.path-group')
		.forEach((el) => ((el as HTMLElement).style.opacity = '0.3'));
	document
		.querySelectorAll('svg g.path-group.attention')
		.forEach((el) => ((el as HTMLElement).style.opacity = '1'));
	document
		.querySelectorAll('div.step.softmax')
		.forEach((el) => ((el as HTMLElement).style.opacity = '0.3'));
	document
		.querySelectorAll('div.step.embedding')
		.forEach((el) => ((el as HTMLElement).style.opacity = '0.3'));
	document
		.querySelectorAll('div.step .column')
		.forEach((el) => ((el as HTMLElement).style.opacity = '0.3'));
	document
		.querySelectorAll('div.step.attention .column')
		.forEach((el) => ((el as HTMLElement).style.opacity = '1'));
	document
		.querySelectorAll('div.step.qkv .qkv-column')
		.forEach((el) => ((el as HTMLElement).style.opacity = '1'));
	document
		.querySelectorAll('div.step.mlp .column.initial')
		.forEach((el) => ((el as HTMLElement).style.opacity = '1'));
}

/**
 * Remove attention highlighting
 */
export function removeAttentionPathHighlight() {
	document
		.querySelectorAll('svg g.path-group')
		.forEach((el) => ((el as HTMLElement).style.opacity = '1'));
	document
		.querySelectorAll('div.step.softmax')
		.forEach((el) => ((el as HTMLElement).style.opacity = '1'));
	document
		.querySelectorAll('div.step.embedding')
		.forEach((el) => ((el as HTMLElement).style.opacity = '1'));
	document
		.querySelectorAll('div.step .column')
		.forEach((el) => ((el as HTMLElement).style.opacity = '1'));
	document
		.querySelectorAll('div.step .column.residual')
		.forEach((el) => ((el as HTMLElement).style.opacity = '0.5'));
}

/**
 * Highlight logit area
 */
export function highlightLogitPath() {
	document
		.querySelectorAll('svg g.path-group')
		.forEach((el) => ((el as HTMLElement).style.opacity = '0.3'));
	document
		.querySelectorAll('svg g.path-group.transformer-blocks')
		.forEach((el) => ((el as HTMLElement).style.opacity = '1'));
	document
		.querySelectorAll('svg g.path-group.softmax')
		.forEach((el) => ((el as HTMLElement).style.opacity = '1'));

	document
		.querySelectorAll('div.step > div')
		.forEach((el) => ((el as HTMLElement).style.opacity = '0.3'));
	document
		.querySelectorAll('div.step.softmax > div')
		.forEach((el) => ((el as HTMLElement).style.opacity = '1'));
	document
		.querySelectorAll('div.step.transformer-blocks > div')
		.forEach((el) => ((el as HTMLElement).style.opacity = '1'));
	document
		.querySelectorAll('.steps')
		.forEach((el) => ((el as HTMLElement).style.pointerEvents = 'none'));
}

/**
 * Highlight path
 */
export function highlightPath(value) {
	document
		.querySelectorAll('svg g.path-group')
		.forEach((el) => ((el as HTMLElement).style.opacity = '0.3'));
	document
		.querySelectorAll(`svg g.path-group.${value}`)
		.forEach((el) => ((el as HTMLElement).style.opacity = '1'));
	document
		.querySelectorAll('div.step > div')
		.forEach((el) => ((el as HTMLElement).style.opacity = '0.3'));
	document
		.querySelectorAll(`div.step.${value} > div`)
		.forEach((el) => ((el as HTMLElement).style.opacity = '1'));
	document
		.querySelectorAll('.steps')
		.forEach((el) => ((el as HTMLElement).style.pointerEvents = 'none'));

	if (value === 'mlpUp' || value === 'mlpDown') {
		document
			.querySelectorAll(`div.step.${value} .layer`)
			.forEach((el) => ((el as HTMLElement).style.opacity = '0.3'));
		document
			.querySelectorAll(`div.step.${value} .layer.${value}`)
			.forEach((el) => ((el as HTMLElement).style.opacity = '1'));
	}
}

/**
 * Remove path highlighting
 */
export function removePathHighlight() {
	document
		.querySelectorAll('svg g.path-group')
		.forEach((el) => ((el as HTMLElement).style.opacity = '1'));
	document
		.querySelectorAll('div.step > div')
		.forEach((el) => ((el as HTMLElement).style.opacity = '1'));
	document
		.querySelectorAll('div.step.mlp .layer')
		.forEach((el) => ((el as HTMLElement).style.opacity = '1'));
	document
		.querySelectorAll('.steps')
		.forEach((el) => ((el as HTMLElement).style.pointerEvents = 'auto'));
}

/**
 * Get transformer-bounding element height
 */
export function getTransformerBoundingHeight(): string {
	const transformerBounding = document.querySelector('.transformer-bounding');
	if (transformerBounding) {
		return getComputedStyle(transformerBounding).height;
	}
}

/**
 * Sync element height with transformer-bounding height
 */
export function syncWithTransformerBoundingHeight(selector: string) {
	const height = getTransformerBoundingHeight();
	const element = document.querySelector(selector) as HTMLElement;
	if (element) {
		element.style.height = height;
	}
}

/**
 * Highlight multiple elements by selectors
 */
export function highlightElements(selectors: string[], className = 'textbook-highlight') {
	selectors.forEach((selector) => {
		const elements = document.querySelectorAll(selector) as NodeListOf<HTMLElement>;
		elements.forEach((element) => {
			element.classList.remove('remove-finger');
			element.classList.add(className);
		});
	});
}

/**
 * Remove highlight from multiple elements by selectors
 */
export function removeHighlightFromElements(selectors: string[], className = 'textbook-highlight') {
	selectors.forEach((selector) => {
		const elements = document.querySelectorAll(selector) as NodeListOf<HTMLElement>;
		elements.forEach((element) => {
			element.classList.remove(className);
		});
	});
}

/**
 * Remove finger pointer
 */
export function removeFingerFromElements(selectors: string[]) {
	selectors.forEach((selector) => {
		const elements = document.querySelectorAll(selector) as NodeListOf<HTMLElement>;
		elements.forEach((element) => {
			element.classList.add('remove-finger');
		});
	});
}

/**
 * Apply transformer-bounding height to multiple elements
 */
export function applyTransformerBoundingHeight(selectors: string[]) {
	const height = getTransformerBoundingHeight();
	selectors.forEach((selector) => {
		const element = document.querySelector(selector) as HTMLElement;
		if (element) {
			element.style.height = height;
		}
	});
}

/**
 * Reset height to 100% for multiple elements
 */
export function resetElementsHeight(selectors: string[]) {
	selectors.forEach((selector) => {
		const element = document.querySelector(selector) as HTMLElement;
		if (element) {
			element.style.height = '100%';
		}
	});
}

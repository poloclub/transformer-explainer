export const ga = (name: string, params?: any) => {
	if (typeof gtag === 'undefined') return;
	gtag('event', name, params);
};

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	interface Window {
		dataLayer?: Array<Record<string, unknown>>;
	}

	const dataLayer: {
		push: (...items: unknown[]) => number;
	};

	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};

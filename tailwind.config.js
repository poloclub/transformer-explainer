import flowbitePlugin from 'flowbite/plugin';
/** @type {import('tailwindcss').Config} */
export default {
	content: [
		'./src/**/*.{html,js,svelte,ts}',
		'./node_modules/flowbite-svelte/**/*.{html,js,svelte,ts}'
	],

	plugins: [flowbitePlugin],

	// darkMode: 'class',

	theme: {
		extend: {
			screens: {
				sm: '',
				xs: ''
			},
			fontSize: {},
			colors: {}
		}
	}
};

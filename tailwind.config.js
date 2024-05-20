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
			colors: {
				//indigo-blue
				primary: {
					50: '#eef8ff',
					100: '#dcf1ff',
					200: '#b2e5ff',
					300: '#6dd2ff',
					400: '#20bbff',
					500: '#00a3ff',
					600: '#0081df',
					700: '#0066b4',
					800: '#005795',
					900: '#00477a',
					950: '#003057'
				},
				secondary: {
					50: '#fbf7eb',
					100: '#f5eccc',
					200: '#edd79b',
					300: '#e3bb61',
					400: '#d9a036',
					500: '#c98a29',
					600: '#ad6b21',
					700: '#8b4e1d',
					800: '#743f1f',
					900: '#633620',
					950: '#391b0f'
				},
				'tropical-blue': {
					50: '#f1f6fe',
					100: '#deebfc',
					200: '#b9d6f9',
					300: '#98c4f6',
					400: '#6aa7f0',
					500: '#4786eb',
					600: '#3168dd',
					700: '#2854cc',
					800: '#2744a5',
					900: '#253d83',
					950: '#1b2750'
				}
			}
		}
	}
};

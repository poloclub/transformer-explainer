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
				sky: {
					50: '#f0f9ff',
					100: '#e0f2fe',
					200: '#bae6fd',
					300: '#7dd3fc',
					400: '#38bdf8',
					500: '#0ea5e9',
					600: '#0284c7',
					700: '#0369a1',
					800: '#075985',
					900: '#0c4a6e',
					950: '#082f49'
				},
				cyan: {
					50: '#ecfeff',
					100: '#cffafe',
					200: '#a5f3fc',
					300: '#67e8f9',
					400: '#22d3ee',
					500: '#06b6d4',
					600: '#0891b2',
					700: '#0e7490',
					800: '#155e75',
					900: '#164e63',
					950: '#083344'
				}
			}
		}
	}
};

import type { ThemePalette } from '~/store/theme';

/**
 * Gradients used by the Sankey links. They are resolved against the active
 * theme, so the pale end of a link matches the canvas it is drawn on.
 */
export const gradientMapFor = (palette: ThemePalette) => {
	const { color, cell } = palette;

	return {
		'gray-blue': {
			0: color('gray', 200),
			100: color('blue', 200)
		},
		'transparent-blue': {
			0: { color: color('blue', 200), opacity: 0.5 },
			100: color('blue', 200)
		},
		'gray-transparent-blue': {
			0: color('gray', 200),
			60: { color: color('blue', 200), opacity: 0 },
			100: { color: color('blue', 200), opacity: 1 }
		},
		'blue-blue-transparent': {
			0: { color: color('blue', 200), opacity: 0.5 },
			60: { color: color('blue', 200), opacity: 1 },
			100: { color: color('blue', 200), opacity: 0 }
		},
		'indigo-blue-transparent': {
			0: { color: color('indigo', 200), opacity: 0 },
			40: { color: color('indigo', 200), opacity: 1 },
			100: color('blue', 200)
		},
		'purple-indigo': {
			0: color('purple', 200),
			100: color('indigo', 200)
		},
		'indigo-blue': {
			0: color('indigo', 200),
			100: color('blue', 200)
		},
		'blue-white': { 0: color('blue', 200), 100: cell },
		'red-white': { 0: color('red', 200), 100: cell },
		'green-white': { 0: color('green', 200), 100: cell },
		'red-purple': {
			90: color('red', 300),
			100: color('purple', 300)
		},
		'blue-purple': {
			0: color('blue', 300),
			100: color('purple', 300)
		},
		'green-purple': {
			0: color('green', 200),
			100: color('purple', 200)
		},
		'blue-gray': {
			0: color('blue', 200),
			50: color('gray', 200)
		},
		'blue-white-blue': {
			0: color('blue', 200),
			40: cell,
			60: cell,
			100: color('blue', 200)
		},
		'gray-white-blue': {
			0: color('gray', 200),
			50: cell,
			60: cell,
			100: { color: color('blue', 200), opacity: 0.7 }
		},
		'transparent-purple': {
			0: { color: color('purple', 100), opacity: 0 },
			100: { color: color('purple', 200), opacity: 1 }
		},
		'transparent-purple2': {
			0: { color: color('purple', 400), opacity: 0 },
			100: { color: color('purple', 200), opacity: 1 }
		},
		'blue-blue': {
			0: color('blue', 300),
			100: color('blue', 300)
		},
		'red-red': {
			0: color('red', 300),
			100: color('red', 300)
		},
		'green-green': {
			0: color('green', 300),
			100: color('green', 300)
		},
		'blue-blue2': {
			0: color('blue', 200),
			100: color('blue', 200)
		},
		'red-red2': {
			0: color('red', 200),
			100: color('red', 200)
		},
		'green-green2': {
			0: color('green', 200),
			100: color('green', 200)
		},
		'gray-gray': {
			0: color('gray', 200),
			100: color('gray', 200)
		},
		'purple-purple': {
			0: color('purple', 400),
			100: color('purple', 400)
		},
		blue: {
			0: color('blue', 200),
			100: color('blue', 200)
		}
	};
};

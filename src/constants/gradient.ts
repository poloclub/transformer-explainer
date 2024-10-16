import resolveConfig from 'tailwindcss/resolveConfig';
import tailwindConfig from '../../tailwind.config';
const { theme } = resolveConfig(tailwindConfig);

const defaultGradientBrightness = 200;
export const gradientMap = {
	'gray-blue': {
		0: theme.colors.gray[defaultGradientBrightness],
		100: theme.colors.blue[defaultGradientBrightness]
	},
	'purple-indigo': {
		0: theme.colors.purple[defaultGradientBrightness],
		100: theme.colors.indigo[defaultGradientBrightness]
	},
	'indigo-blue': {
		0: theme.colors.indigo[defaultGradientBrightness],
		100: theme.colors.blue[defaultGradientBrightness]
	},
	'blue-white': { 0: theme.colors.blue[defaultGradientBrightness], 100: theme.colors.white },
	'red-white': { 0: theme.colors.red[defaultGradientBrightness], 100: theme.colors.white },
	'green-white': { 0: theme.colors.green[defaultGradientBrightness], 100: theme.colors.white },
	'red-purple': {
		90: theme.colors.red[defaultGradientBrightness],
		100: theme.colors.purple[defaultGradientBrightness]
	},
	'blue-purple': {
		0: theme.colors.blue[defaultGradientBrightness],
		100: theme.colors.purple[defaultGradientBrightness]
	},
	'green-purple': {
		0: theme.colors.green[defaultGradientBrightness],
		100: theme.colors.purple[defaultGradientBrightness]
	},
	'blue-gray': {
		0: theme.colors.blue[defaultGradientBrightness],
		50: theme.colors.gray[defaultGradientBrightness]
	},
	'blue-white-blue': {
		0: theme.colors.blue[defaultGradientBrightness],
		40: theme.colors.white,
		60: theme.colors.white,
		100: theme.colors.blue[defaultGradientBrightness]
	},
	'transparent-purple': {
		0: { color: theme.colors.purple[100], opacity: 0 },
		// 70: { color: theme.colors.purple[100], opacity: 0.5 },
		100: { color: theme.colors.purple[200], opacity: 1 }
	},
	'transparent-purple2': {
		0: { color: theme.colors.purple[400], opacity: 0 },
		100: { color: theme.colors.purple[200], opacity: 1 }
	},
	'blue-blue': {
		0: theme.colors.blue[defaultGradientBrightness],
		100: theme.colors.blue[defaultGradientBrightness]
	},
	'red-red': {
		0: theme.colors.red[defaultGradientBrightness],
		100: theme.colors.red[defaultGradientBrightness]
	},
	'green-green': {
		0: theme.colors.green[defaultGradientBrightness],
		100: theme.colors.green[defaultGradientBrightness]
	},
	'blue-blue2': {
		0: theme.colors.blue[defaultGradientBrightness],
		100: theme.colors.blue[defaultGradientBrightness]
	},
	'red-red2': {
		0: theme.colors.red[defaultGradientBrightness],
		100: theme.colors.red[defaultGradientBrightness]
	},
	'green-green2': {
		0: theme.colors.green[defaultGradientBrightness],
		100: theme.colors.green[defaultGradientBrightness]
	},
	'gray-gray': {
		0: theme.colors.gray[defaultGradientBrightness],
		100: theme.colors.gray[defaultGradientBrightness]
	},
	'purple-purple': {
		0: theme.colors.purple[defaultGradientBrightness],
		100: theme.colors.purple[defaultGradientBrightness]
	}
};

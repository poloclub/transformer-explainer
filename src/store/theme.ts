import { derived, get, writable } from 'svelte/store';
import resolveConfig from 'tailwindcss/resolveConfig';
import tailwindConfig from '../../tailwind.config';

const { theme } = resolveConfig(tailwindConfig);

export type ThemeMode = 'light' | 'dark';

/** Shared with the bootstrap script in `src/app.html`. */
export const THEME_STORAGE_KEY = 'te-theme';

export const themeMode = writable<ThemeMode>('light');

export const isDark = derived(themeMode, ($themeMode) => $themeMode === 'dark');

export type PaletteHue = 'gray' | 'blue' | 'green' | 'indigo' | 'purple' | 'red';

/**
 * Shades used as the anchors of a data colour ramp, remapped for dark mode.
 *
 * A ramp that runs from a pale shade to a saturated one reads well on a light
 * canvas, but on a dark one its low end blends into the background. Shifting
 * those anchors keeps the ramp visible without touching its saturated end.
 */
const DARK_SHADE_SHIFT: Record<PaletteHue, Record<number, number>> = {
	gray: { 50: 950, 100: 900, 200: 700, 300: 600, 400: 500, 500: 400, 600: 300, 700: 200, 800: 100, 900: 50 },
	blue: { 100: 900, 200: 800, 300: 600, 400: 400, 500: 400, 600: 400, 700: 300 },
	green: { 100: 900, 200: 800, 300: 600, 400: 400, 500: 400, 600: 400, 700: 300 },
	indigo: { 100: 900, 200: 800, 300: 600, 400: 400, 500: 400, 600: 400, 700: 300 },
	purple: { 100: 900, 200: 800, 300: 600, 400: 400, 500: 400, 600: 400, 700: 300 },
	red: { 100: 900, 200: 800, 300: 600, 400: 400, 500: 400, 600: 400, 700: 300 }
};

export interface ThemePalette {
	dark: boolean;
	/** Rest state of a data cell, i.e. the colour a ramp interpolates away from. */
	cell: string;
	/** Resolves a Tailwind shade for the active theme. */
	color: (hue: PaletteHue, shade: number) => string;
}

const paletteFor = ($themeMode: ThemeMode): ThemePalette => {
	const dark = $themeMode === 'dark';
	const color = (hue: PaletteHue, shade: number) => {
		const shades: Record<string, string> = theme.colors[hue];
		const shifted = dark ? DARK_SHADE_SHIFT[hue][shade] : undefined;
		return shades[String(shifted ?? shade)];
	};

	return {
		dark,
		cell: dark ? theme.colors.gray[900] : theme.colors.white,
		color
	};
};

/**
 * Tailwind shades resolved for the active theme, for the places where colours
 * are handed to d3 and can therefore not go through a CSS variable.
 */
export const themePalette = derived(themeMode, paletteFor);

/** Accent for the token the model predicts, resolved for the active theme. */
export const predictedColor = derived(themePalette, ($themePalette) =>
	$themePalette.color('purple', 600)
);

const readStoredMode = (): ThemeMode | null => {
	try {
		const stored = localStorage.getItem(THEME_STORAGE_KEY);
		return stored === 'light' || stored === 'dark' ? stored : null;
	} catch {
		return null;
	}
};

const applyTheme = (mode: ThemeMode) => {
	const root = document.documentElement;
	root.classList.toggle('dark', mode === 'dark');
	root.style.colorScheme = mode;
};

export const setThemeMode = (mode: ThemeMode) => {
	themeMode.set(mode);
	try {
		localStorage.setItem(THEME_STORAGE_KEY, mode);
	} catch {
		// Storage can be unavailable, e.g. in private browsing. The theme still applies.
	}
};

export const toggleTheme = () => setThemeMode(get(themeMode) === 'dark' ? 'light' : 'dark');

let initialised = false;

/** Picks up the stored (or system) theme and keeps the document in sync with it. */
export const initTheme = () => {
	if (initialised) return;
	initialised = true;

	const systemPrefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
	themeMode.set(readStoredMode() ?? (systemPrefersDark ? 'dark' : 'light'));
	themeMode.subscribe(applyTheme);
};

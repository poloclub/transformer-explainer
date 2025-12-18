// src/store/index.ts
// VERBOSELY COMMENTED FOR DECISIONMAKING (sorry!)
//
// Purpose: central Svelte stores used across the app. This file previously
// accessed the browser global `navigator` at module import time which caused
// SSR (server-side rendering) failures because `navigator` is not defined in
// Node. The changes below make all device detection and other browser-only
// logic run only on the client by using SvelteKit's `browser` flag and by
// deferring initialization to run at runtime (not at module import time).
//
// I preserved the original store names and types, added detailed comments for
// every section and function, and kept the file SvelteKit-safe for SSR.

import { writable, derived, readable } from 'svelte/store';
import * as ort from 'onnxruntime-web';
import tailwindConfig from '../../tailwind.config';
import resolveConfig from 'tailwindcss/resolveConfig';
import { ex0 } from '~/constants/examples';
import { textPages } from '~/utils/textbookPages';

// SvelteKit-provided boolean that is true only in the browser (client-side).
// Using this avoid direct access to `window`, `document`, or `navigator` during SSR.
import { browser } from '$app/environment';

// Resolve Tailwind runtime config. This is used later to pick colors etc.
const { theme } = resolveConfig(tailwindConfig);

/* ============================================================================
   Simple UI and selection state stores
   ============================================================================ */

// Temporary and committed selection indices for attention heads and blocks
export const attentionHeadIdxTemp = writable(0);
export const attentionHeadIdx = writable(0);
export const blockIdxTemp = writable(0);
export const blockIdx = writable(0);
export const isOnBlockTransition = writable(false);

export const isOnAnimation = writable(false);

/* ============================================================================
   Textbook state management
   ============================================================================ */

// Current and previous indices and IDs for the "textbook" UI flow
export const textbookCurrentPage = writable<number>(0);
export const textbookPreviousPage = writable<number>(-1);
export const textbookCurrentPageId = writable<string>(textPages[0].id);
export const textbookPreviousPageId = writable<string>('');
export const isTextbookOpen = writable<boolean>(true);

/* ============================================================================
   Model lifecycle & input state
   ============================================================================ */

// Flags indicating model progress / loading
export const isModelRunning = writable(false);
export const isFetchingModel = writable(true);
export const isLoaded = writable(false);

// Example input strings used by the UI
export const inputTextExample = [
	'Data visualization empowers users to',
	'Artificial Intelligence is transforming the',
	'As the spaceship was approaching the',
	'On the deserted planet they discovered a',
	'IEEE VIS conference highlights the'
];

const initialExIdx = 0;
export const selectedExampleIdx = writable<number>(initialExIdx);

// ONNX model inference session (will be populated once the model is loaded in the browser)
export const modelSession = writable<ort.InferenceSession>();

/* ============================================================================
   Model outputs and metadata
   ============================================================================ */

// Stores holding current model outputs, predictions and token info.
// `ex0` is used as an initial placeholder model data object imported above.
export const modelData = writable<ModelData>(ex0);
export const predictedToken = writable<Probability>();
export const tokens = writable<string[]>(ex0?.tokens);
export const tokenIds = writable<number[]>(ex0?.tokenIds);

// Metadata for supported models. Kept as a plain object for quick lookup.
export const modelMetaMap: Record<string, ModelMetaData> = {
	gpt2: { layer_num: 12, attention_head_num: 12, dimension: 768, chunkTotal: 63 },
	'gpt2-medium': { layer_num: 24, attention_head_num: 16, dimension: 1024 },
	'gpt2-large': { layer_num: 36, attention_head_num: 20, dimension: 1280 }
};

/* ============================================================================
   UI selection & visualization stores
   ============================================================================ */

// Token selection / highlighting
export const highlightedToken = writable<HighlightedToken>({
	index: null,
	value: null,
	fix: false
});

export const highlightedHead = writable<HighlightedToken>({
	index: null,
	value: null,
	fix: false
});

// expanded block UI state
export const expandedBlock = writable<ExpandedBlock>({ id: null });
export const isExpandOrCollapseRunning = writable(false);

// User-provided input text (defaults to the first example)
export const inputText = writable(inputTextExample[initialExIdx]);
// export const tokens = derived(inputText, ($inputText) => $inputText.trim().split(' '));

// Selected model and derived metadata store
const initialSelectedModel = 'gpt2';
export const selectedModel = writable(initialSelectedModel);
export const modelMeta = derived(selectedModel, ($selectedModel) => modelMetaMap[$selectedModel]);

/* ============================================================================
   Sampling and generation settings
   ============================================================================ */
// Temperature setting
export const initialtTemperature = 0.8;
export const temperature = writable(initialtTemperature);

// Sampling
export const sampling = writable<Sampling>({ type: 'top-k', value: 5 });

/* ============================================================================
   Prediction visual state
   ============================================================================ */
export const highlightedIndex = writable(null);
export const finalTokenIndex = writable(null);

/* ============================================================================
   Styling / layout constants and stores
   ============================================================================ */
export const rootRem = 16;
export const minVectorHeight = 12;
export const maxVectorHeight = 30;
export const maxVectorScale = 3.4;

export const vectorHeight = writable(0);
export const headContentHeight = writable(0);
export const headGap = { x: 5, y: 8, scale: 0 };

export const isBoundingBoxActive = writable(false);

export const predictedColor = theme.colors.purple[600];

/* ============================================================================
   Interactivity stores for hover, tooltips and popovers
   ============================================================================ */
export const hoveredPath = writable();
export const hoveredMatrixCell = writable({ row: null, col: null });
export const weightPopover = writable();
export const tooltip = writable();

/* ============================================================================
   Device detection and isMobile store (SSR-safe)
   ============================================================================ */

/*
  Problem we are solving:
  - The original code called `navigator.userAgent` at module import time.
  - During SSR (when Vite/SvelteKit runs on Node) this throws:
      ReferenceError: navigator is not defined
  - Solution:
    1) Provide a pure function `detectDevice()` that assumes a browser context
       and returns a boolean or details about the device.
    2) Export an `isMobile` readable store that is initialized safely for SSR
       (server: false by default) and then updated on the client when
       available. The update is performed inside the readable's start function,
       which runs only in the environment that executes the store's subscribers.
    3) Use SvelteKit's `browser` flag to ensure no direct browser globals are
       accessed on the server.
*/

/**
 * Client-only device detection logic.
 *
 * Note: This function assumes it is executed in the browser. Callers must
 * ensure they run it only when `browser === true` or after checking
 * `typeof navigator !== 'undefined'`.
 *
 * We keep the detection logic compact: test the userAgent for common mobile
 * indicators. It returns a boolean indicating if the device looks like a
 * mobile device.
 */
function detectDevice(): boolean {
    // In the client this will be true. Do not call this at module import time
    // unless you guard with `browser`.
    const ua = navigator?.userAgent ?? '';
    return /android|iphone|ipad|ipod/i.test(ua.toLowerCase());
}

/*
  Exported `isMobile` store:
  - On the server: initial value is `false` (safe default).
  - On the client: the start function updates the value immediately using
    the `detectDevice()` helper. We also attach a `userAgent`-based fallback
    so that hydration matches the client as quickly as possible.
  - The start function returns a cleanup function in case listeners are added
    in the future. Currently there are no listeners, but this pattern keeps the
    store easy to extend (for example, to listen to 'resize' or 'orientationchange').
*/
export const isMobile = readable<boolean>(false, (set) => {
    // Only run detection and any DOM/browser interactions in the browser.
    if (browser) {
        // Immediately set to the detected value so the client store matches the
        // actual runtime environment.
        set(detectDevice());

        // If you later want to update when orientation or UA changes, add
        // listeners here and return a cleanup function. For now, no listeners.
    }

    // Return cleanup function (no-op currently).
    return () => {
        /* no cleanup required at present */
    };
});

/* ============================================================================
   User identification
   ============================================================================ */

// A simple user id store; it remains null until the app sets it (for analytics
// or user-scoped data). No browser-only logic here.
export const userId = writable<string | null>(null);

/* ============================================================================
   Notes and guidance for future contributors
   ============================================================================ */

/*
  - Keep any access to `window`, `navigator`, or `document` guarded by
    `if (browser) { ... }` or by checking `typeof window !== 'undefined'`.
  - Avoid running expensive or side-effectful code at module import time; prefer
    lazy initialization inside lifecycle hooks like `onMount` or inside store
    start functions that only run in the client.
  - The `isMobile` store intentionally uses a safe default on the server to
    prevent hydration mismatch errors during SSR. If you need server-provided
    device hints (for true server-side adaptation), pass them via endpoints or
    load functions rather than relying on `navigator` at import time.
*/




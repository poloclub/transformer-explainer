# KV Cache Explainer — Design Spec
**Date:** 2026-03-27
**Issue:** poloclub/transformer-explainer#63
**Status:** Approved

## Overview

Add a `/kv-cache` route to the existing `transformer-explainer` repo that demonstrates
the difference between prefill and decode phases, with an interactive KV cache visualization.
The original `/` route is completely untouched.

**URL:** `https://poloclub.github.io/transformer-explainer/kv-cache`

---

## Approach

Option 1 (chosen): Duplicate and modify. Copy the root page into `src/routes/kv-cache/`,
modify `AttentionMatrix.svelte` to accept a `decodeMode` prop, and build a new
`KVCacheTable.svelte` component. All shared components (Embedding, MLP, LinearSoftmax,
Sankey, stores) are imported as-is — no duplication of shared logic.

---

## File Changes

### New files

```
src/routes/kv-cache/
  +page.svelte            # Copy of root +page.svelte, modified for decode flow
  +page.ts                # Copy of root +page.ts

src/components/
  KVCacheTable.svelte     # Growing cache table: token × (K vector, V vector)

src/constants/examples/kv/
  ex0.js                  # Pre-computed prefill + decode steps (prompt: "Data visualization empowers users to")
  ex1.js                  # "Artificial Intelligence is transforming the"
  ex2.js                  # "As the spaceship was approaching the"
  ex3.js                  # "On the deserted planet they discovered a"
  ex4.js                  # "IEEE VIS conference highlights the"

src/store/kvcache.ts      # Decode-specific stores

scripts/
  generate_kv_examples.py # Offline script to generate example data from GPT-2 (not shipped)
```

### Modified files

```
src/components/AttentionMatrix.svelte   # Add decodeMode prop
svelte.config.js                        # Add /kv-cache to prerender entries
```

---

## Component Design

### `AttentionMatrix.svelte` — modified

New prop: `decodeMode: boolean` (default `false`).

- `decodeMode = false`: existing N×N behavior, no change.
- `decodeMode = true`:
  - Hides the N×N matrix.
  - Renders a **1×N attention strip** — one row for the current decode token's query
    attending to all N cached tokens.
  - Renders `<KVCacheTable>` below the strip.
  - Labels: "KV Cache" bracket spanning cached tokens (prompt + previously generated);
    "New" label on the current decode token.

### `KVCacheTable.svelte` — new

A table with one row per token seen so far. Three columns:
- **Token label** — token string
- **K vector** — rendered with existing `VectorCanvas`, red color scheme (matches existing K color)
- **V vector** — rendered with existing `VectorCanvas`, green color scheme (matches existing V color)

On each decode step advance, a new row animates in (GSAP tween, consistent with existing
expand/collapse animations). Prompt tokens pre-populate on the first decode step.

### `src/routes/kv-cache/+page.svelte` — new route

Same layout as root page. Differences:
- Passes `decodeMode={$isDecoding}` to `AttentionMatrix`.
- Adds **"← Prev / Next →"** step controls (shown only after prefill completes).
- Each step: advances `decodeStep` store, updates `kvCache`, `currentDecodeData`.
- Temperature and Sampling controls remain active.

---

## Data Model

### Example file format (`src/constants/examples/kv/ex0.js`)

```js
export default {
  // Prefill — identical format to existing src/constants/examples/ex0.js
  prefill: {
    prompt: "Data visualization empowers users to",
    tokens: ["Data", "▁visual", "ization", "▁empowers", "▁users", "▁to"],
    tokenIds: [...],
    logits: [...],      // (50257,) — first predicted token logits
    outputs: { ... }    // per-layer/head activations, same keys as existing examples
  },

  // Decode steps — one entry per generated token (up to ~5 steps)
  decodeSteps: [
    {
      inputToken: "▁visualize",
      tokenId: 15057,
      kvCache: {
        // K and V for all tokens seen so far (prompt + previous decode tokens)
        // shape per entry: [num_heads, head_dim] = [12, 64]
        keys:   [...],   // array of length num_tokens_so_far, each (12, 64)
        values: [...],   // same shape
      },
      attentionScores: [...],   // (1, num_tokens_so_far) — softmaxed scores
      logits: [...],            // (50257,) — next token logits
      outputs: { ... }          // per-layer activations for new token (same keys)
    },
    // ... up to ~5 steps
  ]
}
```

### Generation script (`scripts/generate_kv_examples.py`)

Offline Python script using HuggingFace `transformers`. Runs GPT-2 on each prompt,
extracts KV cache at each decode step using `past_key_values`, dumps JSON.
Not shipped with the app — run once to produce the example `.js` files.

---

## State Management

New file `src/store/kvcache.ts`. Does **not** modify `src/store/index.ts`.

```ts
export const decodeStep = writable<number>(0);
// 0 = prefill complete, 1+ = decode steps

export const kvCache = writable<{ token: string; keys: number[]; values: number[] }[]>([]);
// Grows by one row per step advance

export const isDecoding = derived(decodeStep, ($s) => $s > 0);

export const currentDecodeData = writable<DecodeStep | null>(null);
// Data for the currently displayed decode step

// Reuses existing attentionHeadIdx from src/store/index.ts for head selection
```

Existing stores (`attentionHeadIdx`, `blockIdx`, `temperature`, `sampling`,
`highlightedToken`, etc.) are imported and reused unchanged.

---

## User Flow

1. User navigates to `/kv-cache` — sees the familiar transformer layout with a note
   explaining KV cache mode.
2. Selects an example or types a prompt → hits **Generate**.
3. Prefill runs: existing N×N attention visualization shown (same as main page).
4. First token predicted → decode mode activates automatically:
   - Attention panel switches to 1×N strip + KVCacheTable.
   - KVCacheTable populates with all prompt tokens' K (blue) and V (green) vectors.
   - "KV Cache" bracket and "New" label appear.
5. User clicks **Next →** to step through decode:
   - New token row animates into KVCacheTable.
   - 1×N attention strip updates to show new token's attention scores.
   - Probabilities panel updates with next token predictions.
6. Temperature and sampling controls affect probabilities panel in real time.
7. Up to 5 decode steps supported in pre-computed examples.

---

## Out of Scope (follow-up PR)

- Live GPT-2 inference via ONNX (same approach as main page).
- Mobile support for decode mode (mirrors main page's mobile fallback).
- Textbook/article content specific to KV cache (can be added incrementally).

---

## Styling

Follows existing conventions exactly:
- Tailwind utility classes, existing CSS variables, SCSS variables from `variables.scss`.
- Colors: K vectors in `red-300`, V vectors in `green-300` (matches existing QKV color coding: Q=blue, K=red, V=green).
- Animations: GSAP tweens consistent with existing expand/collapse patterns.
- Font: Jersey 10 for display, system font for body — no changes.

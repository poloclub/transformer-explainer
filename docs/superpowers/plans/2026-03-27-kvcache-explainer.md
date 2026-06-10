# KV Cache Explainer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `/kv-cache` route to the transformer-explainer repo that visualizes the KV cache mechanism — prefill shows the existing N×N attention matrix, then decode steps show a growing KV cache table (K in red, V in green) and a 1×N attention strip.

**Architecture:** New SvelteKit route at `src/routes/kv-cache/` that copies the root page structure. `AttentionMatrix.svelte` gets an `isDecoding` reactive binding from a new `src/store/kvcache.ts` store that switches its rendering from N×N to 1×N + KVCacheTable. Pre-computed example data (5 prompts × ~5 decode steps each) is generated offline by a Python script and stored as JS modules.

**Tech Stack:** SvelteKit 2, Svelte 5, TypeScript, GSAP 3, D3 7, Tailwind CSS 3, Python 3 + HuggingFace `transformers` (offline data generation only)

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `scripts/generate_kv_examples.py` | Create | Offline: runs GPT-2, extracts KV cache + attention scores per decode step |
| `src/constants/examples/kv/ex0.js` – `ex4.js` | Create | Decode step data only (prefill reuses existing `ex0`–`ex4` which have full ONNX outputs) |
| `src/constants/examples/kv/index.js` | Create | Re-exports all 5 KV decode examples |
| `src/store/kvcache.ts` | Create | `decodeStep`, `kvCache`, `isDecoding`, `currentDecodeData`, `promptTokenCount` stores |
| `src/components/KVCacheTable.svelte` | Create | Animated growing table: token × K vector (red) × V vector (green) |
| `src/components/AttentionMatrix.svelte` | Modify | Import `isDecoding`; when true render 1×N strip + KVCacheTable instead of N×N |
| `src/routes/kv-cache/+page.ts` | Create | `export const prerender = true` |
| `src/routes/kv-cache/+page.svelte` | Create | Root page copy + decode step controls, KV example data loading |
| `svelte.config.js` | Modify | Add `/kv-cache` to prerender entries |

---

## Task 1: Python data generation script

**Files:**
- Create: `scripts/generate_kv_examples.py`

This runs offline (not part of the web app). It uses HuggingFace `transformers` to run GPT-2 on each of the 5 prompts, extracts KV cache and attention scores at each decode step, and writes JS module files.

- [ ] **Step 1: Install dependencies (run once)**

```bash
pip install torch transformers
```

- [ ] **Step 2: Create the script**

Create `scripts/generate_kv_examples.py`:

```python
"""
Generates KV cache example data for the kv-cache-explainer.
Run: python scripts/generate_kv_examples.py
Output: src/constants/examples/kv/ex{0..4}.js
"""

import torch
import json
import os
from transformers import GPT2Tokenizer, GPT2LMHeadModel

DECODE_STEPS = 5
OUTPUT_DIR = "src/constants/examples/kv"

PROMPTS = [
    "Data visualization empowers users to",
    "Artificial Intelligence is transforming the",
    "As the spaceship was approaching the",
    "On the deserted planet they discovered a",
    "IEEE VIS conference highlights the",
]

def extract_head_vectors(past_key_values, head_idx=0):
    """
    Extract K and V vectors for all tokens for a specific head.
    past_key_values: tuple of (key, value) per layer
    Returns: list of {token_idx: {keys: [64], values: [64]}} per layer (we use layer 0 for display)
    """
    # Use layer 0, head head_idx
    # key shape: [batch=1, num_heads=12, seq_len, head_dim=64]
    keys_all_heads = past_key_values[0][0][0]   # [12, seq_len, 64]
    values_all_heads = past_key_values[0][1][0] # [12, seq_len, 64]

    # Return all heads for head selector support
    # Shape: [12 heads, seq_len, 64]
    return {
        "keys": keys_all_heads.tolist(),    # [12, seq_len, 64]
        "values": values_all_heads.tolist() # [12, seq_len, 64]
    }

def extract_attention_scores(attentions, seq_len):
    """
    Extract 1xN attention scores for the last token from all layers and heads.
    attentions: tuple of [batch=1, num_heads=12, query_len, key_len] per layer
    Returns dict matching existing outputs format but with 1-row matrices.
    """
    outputs = {}
    for block_idx, layer_attn in enumerate(attentions):
        # layer_attn shape: [1, 12, query_len, key_len]
        for head_idx in range(12):
            # Last token's attention row → shape [1, key_len]
            scores = layer_attn[0, head_idx, -1, :].tolist()
            key = f"block_{block_idx}_attn_head_{head_idx}_attn_dropout"
            outputs[key] = {
                "data": [scores],  # [[score0, score1, ...]] — 1×N
                "dims": [1, len(scores)],
                "size": len(scores)
            }
    return outputs

def run_prefill(model, tokenizer, prompt):
    """Run prefill and return token info + model output with past_key_values."""
    inputs = tokenizer(prompt, return_tensors="pt")
    token_ids = inputs["input_ids"][0].tolist()
    tokens = [tokenizer.decode([tid]) for tid in token_ids]

    with torch.no_grad():
        output = model(
            **inputs,
            output_attentions=True,
            use_cache=True
        )

    logits = output.logits[0, -1, :].tolist()  # last token logits → [50257]
    past_key_values = output.past_key_values
    prompt_kv = extract_head_vectors(past_key_values)

    return {
        "tokens": tokens,
        "token_ids": token_ids,
        "logits": logits,
        "prompt_kv": prompt_kv,
        "past_key_values": past_key_values,
    }

def run_decode_step(model, tokenizer, token_id, past_key_values):
    """Run one decode step given a new token id and the current KV cache."""
    input_ids = torch.tensor([[token_id]])

    with torch.no_grad():
        output = model(
            input_ids=input_ids,
            past_key_values=past_key_values,
            output_attentions=True,
            use_cache=True
        )

    next_token_id = output.logits[0, -1, :].argmax().item()
    logits = output.logits[0, -1, :].tolist()
    new_past_key_values = output.past_key_values

    # KV cache now contains all tokens (prompt + all generated so far)
    kv_snapshot = extract_head_vectors(new_past_key_values)
    seq_len = new_past_key_values[0][0].shape[2]
    attention_outputs = extract_attention_scores(output.attentions, seq_len)

    return {
        "input_token": tokenizer.decode([token_id]),
        "input_token_id": token_id,
        "next_token_id": next_token_id,
        "logits": logits,
        "kv_snapshot": kv_snapshot,   # K,V for ALL tokens so far
        "attention_outputs": attention_outputs,
        "past_key_values": new_past_key_values,
    }

def build_example(model, tokenizer, prompt):
    """
    Build decode steps only. Prefill display reuses the existing ex0-ex4 ONNX examples
    which already have full intermediate activations. This script only needs to produce
    the decode step data (KV snapshots + attention scores + logits).
    """
    print(f"  Prefill: {prompt!r}")
    prefill = run_prefill(model, tokenizer, prompt)

    # First decode token = argmax of prefill logits
    first_token_id = int(torch.tensor(prefill["logits"]).argmax().item())
    past = prefill["past_key_values"]
    prompt_tokens = prefill["tokens"]

    decode_steps = []
    current_token_id = first_token_id

    for step in range(DECODE_STEPS):
        print(f"  Decode step {step + 1}: token_id={current_token_id} ({tokenizer.decode([current_token_id])!r})")
        result = run_decode_step(model, tokenizer, current_token_id, past)
        decode_steps.append({
            "inputToken": result["input_token"],
            "inputTokenId": result["input_token_id"],
            "kvSnapshot": result["kv_snapshot"],
            "attentionOutputs": result["attention_outputs"],
            "logits": result["logits"],
        })
        past = result["past_key_values"]
        current_token_id = result["next_token_id"]

    # Only return decode steps — prefill display is handled by existing ex0-ex4 ONNX data
    return {
        "promptTokens": prompt_tokens,
        "decodeSteps": decode_steps,
    }

def write_js(example, var_name, path):
    """Write example as a JS module."""
    data_json = json.dumps(example, separators=(',', ':'))
    js = f"export const {var_name} = {data_json};\n"
    with open(path, "w") as f:
        f.write(js)
    size_kb = os.path.getsize(path) / 1024
    print(f"  Written {path} ({size_kb:.1f} KB)")

def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    print("Loading GPT-2...")
    tokenizer = GPT2Tokenizer.from_pretrained("gpt2")
    model = GPT2LMHeadModel.from_pretrained("gpt2")
    model.eval()

    for i, prompt in enumerate(PROMPTS):
        print(f"\nExample {i}: {prompt!r}")
        example = build_example(model, tokenizer, prompt)
        var_name = f"kvEx{i}"
        path = os.path.join(OUTPUT_DIR, f"ex{i}.js")
        write_js(example, var_name, path)

    # Write index
    imports = "\n".join(f"import {{kvEx{i}}} from './ex{i}';" for i in range(5))
    exports = ", ".join(f"kvEx{i}" for i in range(5))
    index_js = f"{imports}\n\nexport {{ {exports} }};\n"
    with open(os.path.join(OUTPUT_DIR, "index.js"), "w") as f:
        f.write(index_js)
    print(f"\nWritten {OUTPUT_DIR}/index.js")
    print("\nDone.")

if __name__ == "__main__":
    main()
```

- [ ] **Step 3: Run the script from the repo root**

```bash
cd /path/to/transformer-explainer
python scripts/generate_kv_examples.py
```

Expected output:
```
Loading GPT-2...

Example 0: 'Data visualization empowers users to'
  Prefill: 'Data visualization empowers users to'
  Decode step 1: token_id=15057 (' visualize')
  Decode step 2: ...
  Written src/constants/examples/kv/ex0.js (XXX KB)
...
Written src/constants/examples/kv/index.js
Done.
```

- [ ] **Step 4: Verify the output structure**

```bash
node -e "
const {kvEx0} = require('./src/constants/examples/kv/ex0.js');
// Node won't parse ES modules — just check file exists and looks right
" 2>/dev/null || head -1 src/constants/examples/kv/ex0.js
```

Expected: first line starts with `export const kvEx0 = {`

- [ ] **Step 5: Commit**

```bash
git add scripts/generate_kv_examples.py src/constants/examples/kv/
git commit -m "feat: add KV cache example data and generation script"
```

---

## Task 2: KV cache store

**Files:**
- Create: `src/store/kvcache.ts`

- [ ] **Step 1: Create the store**

Create `src/store/kvcache.ts`:

```typescript
import { writable, derived } from 'svelte/store';

// Which decode step we're viewing. 0 = prefill complete, 1+ = decode steps.
export const decodeStep = writable<number>(0);

// Each entry is one token's K and V vectors for the currently selected head.
// Shape per entry: { token: string, keys: number[], values: number[] }
// keys/values are [head_dim=64] for the selected head.
export type KVCacheEntry = {
  token: string;
  keys: number[];    // length 64
  values: number[];  // length 64
};

export const kvCache = writable<KVCacheEntry[]>([]);

// True after first decode step is loaded
export const isDecoding = derived(decodeStep, ($s) => $s > 0);

// Full data for the currently displayed decode step
export type DecodeStepData = {
  inputToken: string;
  inputTokenId: number;
  kvSnapshot: {
    keys: number[][][];   // [12 heads, seq_len, 64]
    values: number[][][]; // [12 heads, seq_len, 64]
  };
  attentionOutputs: Record<string, { data: number[][]; dims: number[]; size: number }>;
  logits: number[];
};

export const currentDecodeData = writable<DecodeStepData | null>(null);

// How many entries in kvCache are prompt tokens (styled differently in KVCacheTable)
export const promptTokenCount = writable<number>(0);

// Reset all KV cache state (called when user changes example or re-runs prefill)
export function resetKVCache() {
  decodeStep.set(0);
  kvCache.set([]);
  currentDecodeData.set(null);
  promptTokenCount.set(0);
}
```

- [ ] **Step 2: Commit**

```bash
git add src/store/kvcache.ts
git commit -m "feat: add kvcache store for decode step state"
```

---

## Task 3: KVCacheTable component

**Files:**
- Create: `src/components/KVCacheTable.svelte`

This component renders the growing token × K/V table. Each row is a token. Columns are the token label, K vector (red VectorCanvas), and V vector (green VectorCanvas). New rows animate in with GSAP.

- [ ] **Step 1: Create the component**

Create `src/components/KVCacheTable.svelte`:

```svelte
<script lang="ts">
  import { kvCache, type KVCacheEntry } from '~/store/kvcache';
  import VectorCanvas from '~/components/common/VectorCanvas.svelte';
  import { gsap } from '~/utils/gsap';
  import { afterUpdate } from 'svelte';

  // Row elements for animation — indexed by cache length
  let rowEls: HTMLDivElement[] = [];
  let prevLength = 0;

  afterUpdate(() => {
    const currentLength = $kvCache.length;
    if (currentLength > prevLength) {
      // Animate the newly added row(s) in
      for (let i = prevLength; i < currentLength; i++) {
        const el = rowEls[i];
        if (el) {
          gsap.from(el, {
            opacity: 0,
            y: -8,
            duration: 0.4,
            ease: 'power2.out'
          });
        }
      }
    }
    prevLength = currentLength;
  });
</script>

<div class="kv-cache-table">
  <div class="kv-header">
    <span class="col-label token-col">Token</span>
    <span class="col-label k-col" style="color: var(--color-key)">K</span>
    <span class="col-label v-col" style="color: var(--color-value)">V</span>
  </div>

  {#each $kvCache as entry, i}
    <div
      class="kv-row"
      class:prompt-token={i < entry.promptCount}
      bind:this={rowEls[i]}
    >
      <span class="token-label">{entry.token}</span>
      <div class="vector-cell k-vector">
        <VectorCanvas data={entry.keys} colorScale="red" />
      </div>
      <div class="vector-cell v-vector">
        <VectorCanvas data={entry.values} colorScale="green" />
      </div>
    </div>
  {/each}

  {#if $kvCache.length === 0}
    <div class="empty-hint">KV cache will populate after prefill</div>
  {/if}
</div>

<style lang="scss">
  .kv-cache-table {
    display: flex;
    flex-direction: column;
    gap: 2px;
    font-size: 0.7rem;
    min-width: 12rem;
  }

  .kv-header {
    display: grid;
    grid-template-columns: 3rem 1fr 1fr;
    gap: 4px;
    padding-bottom: 4px;
    border-bottom: 1px solid theme('colors.gray.200');
    font-size: 0.65rem;
    font-weight: 600;
    color: theme('colors.gray.500');
  }

  .col-label {
    text-align: center;
  }

  .kv-row {
    display: grid;
    grid-template-columns: 3rem 1fr 1fr;
    gap: 4px;
    align-items: center;
    height: var(--vector-height, 16px);

    &.prompt-token {
      opacity: 0.7;
    }
  }

  .token-label {
    font-size: 0.65rem;
    color: theme('colors.gray.600');
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    text-align: right;
    padding-right: 4px;
  }

  .vector-cell {
    height: var(--vector-height, 16px);
    position: relative;
    overflow: hidden;
  }

  .empty-hint {
    color: theme('colors.gray.400');
    font-size: 0.65rem;
    text-align: center;
    padding: 0.5rem 0;
  }
</style>
```

> **Note:** `entry.promptCount` doesn't exist in `KVCacheEntry` yet — remove that line; we'll use a prop instead. Here's the corrected component — replace `class:prompt-token={i < entry.promptCount}` with `class:prompt-token={i < promptTokenCount}` and add `export let promptTokenCount: number = 0;` at the top of the script.

Corrected `src/components/KVCacheTable.svelte`:

```svelte
<script lang="ts">
  import { kvCache, promptTokenCount } from '~/store/kvcache';
  import VectorCanvas from '~/components/common/VectorCanvas.svelte';
  import { gsap } from '~/utils/gsap';
  import { afterUpdate } from 'svelte';

  let rowEls: (HTMLDivElement | undefined)[] = [];
  let prevLength = 0;

  afterUpdate(() => {
    const currentLength = $kvCache.length;
    if (currentLength > prevLength) {
      for (let i = prevLength; i < currentLength; i++) {
        const el = rowEls[i];
        if (el) {
          gsap.from(el, { opacity: 0, y: -8, duration: 0.4, ease: 'power2.out' });
        }
      }
    }
    prevLength = currentLength;
  });
</script>

<div class="kv-cache-table">
  <div class="kv-header">
    <span class="col-label">Token</span>
    <span class="col-label k-col">K</span>
    <span class="col-label v-col">V</span>
  </div>

  {#each $kvCache as entry, i}
    <div class="kv-row" class:prompt-token={i < $promptTokenCount} bind:this={rowEls[i]}>
      <span class="token-label">{entry.token}</span>
      <div class="vector-cell">
        <VectorCanvas data={entry.keys} colorScale="red" />
      </div>
      <div class="vector-cell">
        <VectorCanvas data={entry.values} colorScale="green" />
      </div>
    </div>
  {/each}

  {#if $kvCache.length === 0}
    <div class="empty-hint">KV cache populates after prefill</div>
  {/if}
</div>

<style lang="scss">
  .kv-cache-table {
    display: flex;
    flex-direction: column;
    gap: 2px;
    font-size: 0.7rem;
    min-width: 12rem;
  }
  .kv-header {
    display: grid;
    grid-template-columns: 3rem 1fr 1fr;
    gap: 4px;
    padding-bottom: 4px;
    border-bottom: 1px solid theme('colors.gray.200');
    font-size: 0.65rem;
    font-weight: 600;
    color: theme('colors.gray.500');
  }
  .k-col { color: theme('colors.red.400'); }
  .v-col { color: theme('colors.green.400'); }
  .col-label { text-align: center; }
  .kv-row {
    display: grid;
    grid-template-columns: 3rem 1fr 1fr;
    gap: 4px;
    align-items: center;
    height: var(--vector-height, 16px);
    &.prompt-token { opacity: 0.7; }
  }
  .token-label {
    font-size: 0.65rem;
    color: theme('colors.gray.600');
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    text-align: right;
    padding-right: 4px;
  }
  .vector-cell {
    height: var(--vector-height, 16px);
    position: relative;
    overflow: hidden;
  }
  .empty-hint {
    color: theme('colors.gray.400');
    font-size: 0.65rem;
    text-align: center;
    padding: 0.5rem 0;
  }
</style>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/KVCacheTable.svelte
git commit -m "feat: add KVCacheTable component for growing cache visualization"
```

---

## Task 4: Modify AttentionMatrix for decode mode

**Files:**
- Modify: `src/components/AttentionMatrix.svelte`

Add decode mode: import `isDecoding` and `currentDecodeData` from the kvcache store. When `$isDecoding` is true, render a 1×N attention strip and the KVCacheTable instead of the N×N matrix.

- [ ] **Step 1: Add imports to the existing script block**

In `src/components/AttentionMatrix.svelte`, after the last existing import line (currently line 28: `import { highlightAttentionPath, removeAttentionPathHighlight } from '~/utils/textbook';`), add:

```typescript
import { isDecoding, currentDecodeData } from '~/store/kvcache';
import KVCacheTable from '~/components/KVCacheTable.svelte';
import { tokens } from '~/store';
```

- [ ] **Step 2: Add decode-mode reactive data**

After the existing `$: softmaxed = ...` block (around line 43), add:

```typescript
// Decode mode: 1×N attention scores for the current decode token
$: decodeAttentionRow =
  $currentDecodeData?.attentionOutputs?.[
    `block_${$blockIdx}_attn_head_${$attentionHeadIdx}_attn_dropout`
  ]?.data ?? [[]];
```

- [ ] **Step 3: Wrap the existing template in a conditional**

In the template section of `AttentionMatrix.svelte`, find the outermost wrapper div (the one with `bind:this={expandableEl}`). Wrap the entire existing matrix HTML in `{#if !$isDecoding}...{/if}` and add an `{:else}` block for decode mode.

The structure should be:

```svelte
<div class="attention-matrix-wrapper" bind:this={expandableEl}>
  {#if !$isDecoding}
    <!-- === EXISTING N×N CONTENT — untouched === -->
    <!-- (all the existing HTML stays here, no changes) -->

  {:else}
    <!-- === DECODE MODE: 1×N strip + KVCacheTable === -->
    <div class="decode-mode flex flex-col gap-2">
      <div class="decode-strip-label text-xs text-gray-500">
        Attention (1 × {$tokens.length + ($decodeStep ?? 0)} — new token → cached tokens)
      </div>

      <!-- 1×N attention strip using existing Matrix component -->
      <div class="decode-attention-strip">
        <div class="kv-cache-bracket-label text-xs text-red-400">KV Cache ←</div>
        <Matrix
          data={decodeAttentionRow}
          showSize={false}
          cellHeight={cellSize}
          cellWidth={cellSize}
          rowGap={3}
          colGap={3}
          shape={'circle'}
          colorScale={qkColorScale}
          onMouseOverCell={onMouseOverCell}
          onMouseOutCell={onMouseOutCell}
          showTooltip={showTooltip}
        />
        <div class="new-token-label text-xs text-blue-400">← New</div>
      </div>

      <!-- Growing KV cache table (promptTokenCount set in kvcache store) -->
      <KVCacheTable />
    </div>
  {/if}
</div>
```

Also add `import { decodeStep } from '~/store/kvcache';` to the imports.

- [ ] **Step 4: Add decode mode styles**

In the `<style>` block of `AttentionMatrix.svelte`, add:

```scss
.decode-mode {
  padding: 0.5rem;
  min-width: 10rem;
}

.decode-attention-strip {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
}

.kv-cache-bracket-label,
.new-token-label {
  font-size: 0.6rem;
  line-height: 1;
}
```

- [ ] **Step 5: Commit**

```bash
git add src/components/AttentionMatrix.svelte
git commit -m "feat: add decode mode to AttentionMatrix (1xN strip + KVCacheTable)"
```

---

## Task 5: Create the kv-cache route

**Files:**
- Create: `src/routes/kv-cache/+page.ts`
- Create: `src/routes/kv-cache/+page.svelte`

The page is a copy of the root page with these differences:
1. Imports KV examples (`kvEx0`–`kvEx4`) instead of (`ex0`–`ex4`)
2. After `fakeRunWithCachedData` completes, activates decode mode controls
3. Adds `← Prev` / `Next →` buttons for stepping through decode
4. Has a header note explaining KV cache mode

- [ ] **Step 1: Create the page loader**

Create `src/routes/kv-cache/+page.ts`:

```typescript
export const prerender = true;
```

- [ ] **Step 2: Create the page**

Create `src/routes/kv-cache/+page.svelte`. Start from the root page and make these targeted changes:

```svelte
<script lang="ts">
  import {
    tokens,
    expandedBlock,
    vectorHeight,
    inputText,
    rootRem,
    sampling,
    maxVectorHeight,
    minVectorHeight,
    maxVectorScale,
    headContentHeight,
    temperature,
    modelData,
    modelSession,
    isFetchingModel,
    selectedExampleIdx,
    isMobile,
    isOnBlockTransition,
    blockIdx,
    isTextbookOpen,
    userId
  } from '~/store';
  import { PreTrainedTokenizer } from '@xenova/transformers';
  import Sankey from '~/components/Sankey.svelte';
  import Attention from '~/components/Attention.svelte';
  import SubsequentBlocks from '~/components/SubsequentBlocks.svelte';
  import LinearSoftmax from '~/components/LinearSoftmax.svelte';
  import Embedding from '~/components/Embedding.svelte';
  import Mlp from '~/components/Mlp.svelte';

  import { onMount } from 'svelte';
  import classNames from 'classnames';
  import { base } from '$app/paths';
  import * as ort from 'onnxruntime-web';

  import { adjustTemperature, fakeRunWithCachedData } from '~/utils/data';
  import WeightPopovers from '~/components/WeightPopovers.svelte';
  import { fade } from 'svelte/transition';
  import { AutoTokenizer } from '@xenova/transformers';
  import BlockTransition from '~/components/BlockTransition.svelte';
  import QKV from '~/components/QKV.svelte';
  import Textbook from '~/components/textbook/Textbook.svelte';

  // Existing examples for prefill display (have full ONNX intermediate outputs)
  import { ex0, ex1, ex2, ex3, ex4 } from '~/constants/examples';
  // KV decode-step data (decode steps only, generated by scripts/generate_kv_examples.py)
  import { kvEx0, kvEx1, kvEx2, kvEx3, kvEx4 } from '~/constants/examples/kv';
  import {
    decodeStep,
    kvCache,
    isDecoding,
    currentDecodeData,
    promptTokenCount,
    resetKVCache,
    type KVCacheEntry
  } from '~/store/kvcache';
  import { attentionHeadIdx } from '~/store';

  ort.env.wasm.wasmPaths = 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.23.0/dist/';
  ort.env.logLevel = 'error';

  let active = false;

  // Prefill examples (existing, full ONNX outputs)
  const prefillExamples = [ex0, ex1, ex2, ex3, ex4];
  // Decode step examples (KV-specific, decode steps only)
  const kvExamples = [kvEx0, kvEx1, kvEx2, kvEx3, kvEx4];

  $: currentPrefillExample = prefillExamples[$selectedExampleIdx];
  $: currentKVExample = kvExamples[$selectedExampleIdx];

  onMount(async () => {
    const gpt2Tokenizer = await AutoTokenizer.from_pretrained('Xenova/gpt2');
    active = true;
    const unsubscribe = subscribeInputs(gpt2Tokenizer);
    return unsubscribe;
  });

  const subscribeInputs = (tokenizer: PreTrainedTokenizer) => {
    const runPrefill = () => {
      resetKVCache();
      // Use existing ex0-ex4 for prefill — they have full ONNX intermediate activations
      const cachedData = prefillExamples[$selectedExampleIdx];
      promptTokenCount.set(cachedData.tokens.length);
      fakeRunWithCachedData({
        cachedData,
        tokenizer,
        temperature: $temperature,
        sampling: $sampling
      });
    };

    const unsubscribeInputText = inputText.subscribe(() => runPrefill());

    let initialTemperature = true;
    const unsubscribeTemperature = temperature.subscribe((value) => {
      if (initialTemperature) { initialTemperature = false; return; }
      if ($isDecoding && $currentDecodeData) {
        adjustTemperature({ tokenizer, logits: $currentDecodeData.logits, temperature: value, sampling: $sampling });
      } else {
        adjustTemperature({ tokenizer, logits: $modelData.logits, temperature: value, sampling: $sampling });
      }
    });

    let initialSampling = true;
    const unsubscribeSampling = sampling.subscribe((value) => {
      if (initialSampling) { initialSampling = false; return; }
      const logits = $isDecoding && $currentDecodeData ? $currentDecodeData.logits : $modelData.logits;
      adjustTemperature({ tokenizer, logits, temperature: $temperature, sampling: value });
    });

    return () => {
      unsubscribeInputText();
      unsubscribeTemperature();
      unsubscribeSampling();
    };
  };

  // Build KV cache entries for a given head from a kvSnapshot
  function buildCacheEntries(
    tokenList: string[],
    kvSnapshot: { keys: number[][][]; values: number[][][] },
    headIdx: number
  ): KVCacheEntry[] {
    return tokenList.map((token, i) => ({
      token,
      keys: kvSnapshot.keys[headIdx][i],
      values: kvSnapshot.values[headIdx][i]
    }));
  }

  function advanceDecodeStep() {
    const example = currentKVExample;
    const nextStep = $decodeStep + 1;
    if (nextStep > example.decodeSteps.length) return;

    const stepData = example.decodeSteps[nextStep - 1];
    decodeStep.set(nextStep);
    currentDecodeData.set(stepData);

    // Tokens shown: prompt tokens + all decode input tokens so far
    const promptTokens = example.promptTokens;
    const decodeTokens = example.decodeSteps
      .slice(0, nextStep)
      .map((s: { inputToken: string }) => s.inputToken);
    const allTokens = [...promptTokens, ...decodeTokens];
    tokens.set(allTokens);

    // Update KV cache entries for the currently selected head
    kvCache.set(
      buildCacheEntries(allTokens, stepData.kvSnapshot, $attentionHeadIdx)
    );

    // Update modelData outputs so AttentionMatrix decode strip has data
    modelData.update((md) => ({
      ...md,
      logits: stepData.logits,
      outputs: { ...md.outputs, ...stepData.attentionOutputs }
    }));
  }

  function retreatDecodeStep(tokenizer: PreTrainedTokenizer) {
    if ($decodeStep <= 0) return;
    const prevStep = $decodeStep - 1;

    if (prevStep === 0) {
      // Go back to prefill — use existing ex0-ex4 (full ONNX outputs)
      resetKVCache();
      const cachedData = currentPrefillExample;
      promptTokenCount.set(cachedData.tokens.length);
      fakeRunWithCachedData({ cachedData, tokenizer, temperature: $temperature, sampling: $sampling });
      return;
    }

    const stepData = currentKVExample.decodeSteps[prevStep - 1];
    decodeStep.set(prevStep);
    currentDecodeData.set(stepData);

    const promptTokens = currentKVExample.promptTokens;
    const decodeTokens = currentKVExample.decodeSteps
      .slice(0, prevStep)
      .map((s: { inputToken: string }) => s.inputToken);
    const allTokens = [...promptTokens, ...decodeTokens];
    tokens.set(allTokens);

    kvCache.set(
      buildCacheEntries(allTokens, stepData.kvSnapshot, $attentionHeadIdx)
    );

    modelData.update((md) => ({
      ...md,
      logits: stepData.logits,
      outputs: { ...md.outputs, ...stepData.attentionOutputs }
    }));
  }

  // Also update KV cache entries when attentionHeadIdx changes (head selector)
  $: if ($isDecoding && $currentDecodeData) {
    const promptTokens = currentKVExample.promptTokens;
    const decodeTokens = currentKVExample.decodeSteps
      .slice(0, $decodeStep)
      .map((s: { inputToken: string }) => s.inputToken);
    const allTokens = [...promptTokens, ...decodeTokens];
    kvCache.set(
      buildCacheEntries(allTokens, $currentDecodeData.kvSnapshot, $attentionHeadIdx)
    );
  }

  let tokenizer: PreTrainedTokenizer | null = null;
  onMount(async () => {
    tokenizer = await AutoTokenizer.from_pretrained('Xenova/gpt2');
  });

  // visual elements
  let vizHeight = 0;
  let titleHeight = rootRem * 5;

  const calculateVectorHeight = () => {
    const gaps = rootRem * 0.5 * ($tokens.length - 1);
    const vectorHeightVal = Math.min(
      Math.max((vizHeight - titleHeight - gaps) / $tokens.length / maxVectorScale, minVectorHeight),
      maxVectorHeight
    );
    vectorHeight.set(vectorHeightVal);
    headContentHeight.set(Math.max($tokens.length * vectorHeightVal * 3 + gaps, rootRem * 20));
  };

  $: if (vizHeight || $tokens.length) {
    calculateVectorHeight();
  }

  $: maxDecodeStep = currentKVExample?.decodeSteps?.length ?? 0;
</script>

<div
  class:active
  class="main-section h-full w-full"
  style={`--vector-height: ${$vectorHeight}px;--title-height: ${titleHeight}px;--content-height:${vizHeight - titleHeight}px;`}
>
  <!-- KV Cache mode banner -->
  <div class="kv-mode-banner text-xs text-purple-600 text-center py-1 bg-purple-50 border-b border-purple-100">
    KV Cache Mode — prefill shows N×N attention, decode steps show cached K/V + 1×N attention
    {#if $isDecoding}
      · Decode step {$decodeStep}/{maxDecodeStep}
    {/if}
  </div>

  {#if !!$expandedBlock.id}
    <div class={classNames('dim', `${$expandedBlock.id || ''}`)} transition:fade={{ duration: 100 }}></div>
    <div class={classNames('dim-partial left', `${$expandedBlock.id || ''}`)} transition:fade={{ duration: 100 }}></div>
    <div class={classNames('dim-partial right', `${$expandedBlock.id || ''}`)} transition:fade={{ duration: 100 }}></div>
  {/if}

  <div class="sankey opacity-1" class:attention={$expandedBlock.id === 'attention'}>
    <Sankey />
  </div>

  <div class="nodes resize-watch">
    <div class="steps" class:expanded={!!$expandedBlock.id} bind:offsetHeight={vizHeight}>
      <Embedding className="step" />
      <div class="blocks relative">
        <div class="block-steps main" class:initial={$blockIdx === 0}>
          <QKV className="step" />
          <Attention className="step" />
          <Mlp className="step" />
        </div>
        <div class="block-steps next" class:hide={!$isOnBlockTransition} class:initial={$blockIdx === 0}>
          <QKV className="step" />
          <Attention className="step" />
          <Mlp className="step" />
        </div>
        <div class="transition-watch" class:hide={!$isOnBlockTransition}></div>
      </div>
      <SubsequentBlocks className="step" />
      <LinearSoftmax className="step" />
    </div>

    <WeightPopovers />
    <BlockTransition />

    {#if !$isMobile}
      <Textbook showTextCard={$isTextbookOpen} />
    {/if}

    <!-- Decode step controls — shown after first token is generated -->
    {#if active}
      <div class="decode-controls" class:visible={true} transition:fade={{ duration: 200 }}>
        <button
          class="step-btn"
          disabled={$decodeStep <= 0}
          on:click={() => tokenizer && retreatDecodeStep(tokenizer)}
        >
          ← Prev
        </button>
        <span class="step-indicator">
          {#if $isDecoding}
            Decode {$decodeStep}/{maxDecodeStep}
          {:else}
            Prefill
          {/if}
        </span>
        <button
          class="step-btn"
          disabled={$decodeStep >= maxDecodeStep}
          on:click={advanceDecodeStep}
        >
          Next →
        </button>
      </div>
    {/if}
  </div>
</div>

<style lang="scss">
  .main-section {
    opacity: 0;
    &.active { opacity: 1; }
  }
  .kv-mode-banner {
    position: sticky;
    top: 0;
    z-index: $TOP_BAR_INDEX - 1;
  }
  .nodes {
    height: 100%;
    width: 100%;
    padding: 1rem 0 3rem 0;
    position: relative;
  }
  .steps {
    position: relative;
    width: 100%;
    height: 100%;
    display: grid;
    grid-template-columns: auto 3.5fr 0.5fr 0.5fr;
    &.expanded {
      :global(.step > .title) { padding-bottom: 3rem; }
    }
    .blocks {
      position: relative;
      width: 100%;
      height: 100%;
      .block-steps {
        height: 100%;
        width: 100%;
        position: absolute;
        display: grid;
        grid-template-columns: 0.5fr 2fr 1fr;
      }
      .block-steps.main {
        transform-origin: 3rem center;
        top: 0;
        left: 0;
      }
    }
  }
  .decode-controls {
    position: fixed;
    bottom: 1.5rem;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    gap: 0.75rem;
    background: white;
    border: 1px solid theme('colors.purple.200');
    border-radius: 2rem;
    padding: 0.4rem 1rem;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    z-index: $TOP_BAR_INDEX - 2;
  }
  .step-btn {
    font-size: 0.75rem;
    color: theme('colors.purple.600');
    background: none;
    border: none;
    cursor: pointer;
    padding: 0.2rem 0.4rem;
    border-radius: 0.25rem;
    &:disabled {
      color: theme('colors.gray.300');
      cursor: default;
    }
    &:not(:disabled):hover {
      background: theme('colors.purple.50');
    }
  }
  .step-indicator {
    font-size: 0.7rem;
    color: theme('colors.gray.500');
    min-width: 6rem;
    text-align: center;
  }
</style>
```

> **Note:** The `onMount` is called twice in the above — combine them into one. Final version:

Replace the two separate `onMount` calls with:

```typescript
onMount(async () => {
  tokenizer = await AutoTokenizer.from_pretrained('Xenova/gpt2');
  active = true;
  const unsubscribe = subscribeInputs(tokenizer);
  return unsubscribe;
});
```

And remove `let tokenizer` above onMount — move it inside the script with the others.

- [ ] **Step 3: Commit**

```bash
git add src/routes/kv-cache/
git commit -m "feat: add /kv-cache route with decode step controls"
```

---

## Task 6: Update svelte.config.js prerender entries

**Files:**
- Modify: `svelte.config.js`

- [ ] **Step 1: Add /kv-cache to prerender entries**

In `svelte.config.js`, change line 24 from:

```js
entries: ['/' /* other routes if needed */]
```

to:

```js
entries: ['/', '/kv-cache']
```

- [ ] **Step 2: Commit**

```bash
git add svelte.config.js
git commit -m "chore: add /kv-cache to prerender entries"
```

---

## Task 7: Manual verification

No automated tests exist in this repo. Verify by running the dev server.

- [ ] **Step 1: Install dependencies and start dev server**

```bash
npm install
npm run dev
```

Expected: server starts at `http://localhost:5173`

- [ ] **Step 2: Verify root page is unchanged**

Navigate to `http://localhost:5173/`. Confirm the original transformer explainer loads and functions exactly as before. Generate a token and confirm the N×N attention matrix appears as usual.

- [ ] **Step 3: Verify KV cache page loads**

Navigate to `http://localhost:5173/kv-cache`. Confirm:
- The purple banner "KV Cache Mode" is visible at the top
- The transformer visualization loads with the first example
- The prefill N×N attention matrix shows (same as root page)
- "Prev / Prefill / Next" controls appear at the bottom

- [ ] **Step 4: Verify decode step advance**

Click "Next →". Confirm:
- Banner updates to "Decode step 1/5"
- Attention panel switches to the 1×N attention strip
- KVCacheTable appears below the strip, populated with prompt tokens' K (red) and V (green) vectors
- Each subsequent "Next →" animates a new row into the KVCacheTable

- [ ] **Step 5: Verify "Prev" navigation**

Click "← Prev" from a decode step. Confirm:
- Stepping back to Decode step 1 from step 2 restores the correct state
- Stepping back to Prefill from step 1 shows the N×N matrix again and clears the KVCacheTable

- [ ] **Step 6: Verify temperature/sampling controls**

Change temperature slider while on a decode step. Confirm the Probabilities panel updates (top-k token probabilities change) without resetting the decode step.

- [ ] **Step 7: Verify head selector**

Change the attention head (0–11) while on a decode step. Confirm the KVCacheTable updates to show the K and V vectors for the newly selected head.

- [ ] **Step 8: Build and confirm prerender**

```bash
npm run build
```

Expected: build completes with no errors, and `build/kv-cache/index.html` exists.

```bash
ls build/kv-cache/
```

Expected output includes `index.html`.

---

## Task 8: Final commit and branch ready for PR

- [ ] **Step 1: Verify git log**

```bash
git log --oneline main..HEAD
```

Expected (6 commits):
```
<hash> chore: add /kv-cache to prerender entries
<hash> feat: add /kv-cache route with decode step controls
<hash> feat: add decode mode to AttentionMatrix (1xN strip + KVCacheTable)
<hash> feat: add KVCacheTable component for growing cache visualization
<hash> feat: add kvcache store for decode step state
<hash> feat: add KV cache example data and generation script
<hash> Add KV cache explainer design spec
```

- [ ] **Step 2: Push branch**

```bash
git push -u origin kv-cache-explainer
```

- [ ] **Step 3: Open PR referencing issue #63**

```bash
gh pr create \
  --repo poloclub/transformer-explainer \
  --title "feat: add /kv-cache route with KV cache visualization" \
  --body "$(cat <<'EOF'
## Summary
- Adds `/kv-cache` route at `poloclub.github.io/transformer-explainer/kv-cache`
- Prefill phase shows existing N×N attention matrix (unchanged behavior)
- Decode phase shows growing KV cache table (K in red, V in green per head) + 1×N attention strip
- Step-through controls (← Prev / Next →) to walk through 5 decode steps per example
- Temperature and sampling controls remain functional throughout
- Root page (`/`) is completely untouched

## How it works
Pre-computed example data generated offline via `scripts/generate_kv_examples.py` (GPT-2 + HuggingFace). `AttentionMatrix.svelte` gains a reactive decode mode driven by `src/store/kvcache.ts`. New `KVCacheTable.svelte` component uses existing `VectorCanvas` with GSAP row animations.

## Out of scope (follow-up)
Live GPT-2 inference for the kv-cache page (same ONNX approach as main page).

Closes #63

🤖 Generated with [Claude Code](https://claude.ai/claude-code)
EOF
)"
```

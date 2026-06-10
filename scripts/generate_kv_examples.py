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

def extract_head_vectors(past_key_values):
    # Use layer 0 only for KV snapshot display
    # New DynamicCache API: .layers[layer_idx].keys / .values shape [batch, heads, seq_len, head_dim]
    if hasattr(past_key_values, 'layers'):
        keys_all_heads = past_key_values.layers[0].keys[0]    # [12, seq_len, 64]
        values_all_heads = past_key_values.layers[0].values[0]
    elif hasattr(past_key_values, 'key_cache'):
        keys_all_heads = past_key_values.key_cache[0][0]
        values_all_heads = past_key_values.value_cache[0][0]
    else:
        keys_all_heads = past_key_values[0][0][0]   # [12, seq_len, 64]
        values_all_heads = past_key_values[0][1][0]
    return {
        "keys": keys_all_heads.tolist(),    # [12, seq_len, 64]
        "values": values_all_heads.tolist() # [12, seq_len, 64]
    }

def extract_attention_scores(attentions):
    # attentions: tuple of [batch=1, num_heads=12, query_len, key_len] per layer
    outputs = {}
    for block_idx, layer_attn in enumerate(attentions):
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
    inputs = tokenizer(prompt, return_tensors="pt")
    token_ids = inputs["input_ids"][0].tolist()
    tokens = [tokenizer.decode([tid]) for tid in token_ids]

    with torch.no_grad():
        output = model(**inputs, output_attentions=True, use_cache=True)

    logits = output.logits[0, -1, :].tolist()
    return {
        "tokens": tokens,
        "token_ids": token_ids,
        "logits": logits,
        "past_key_values": output.past_key_values,
    }

def extract_top_logits(logits_tensor, n=50):
    """Return top-N [tokenId, logit] pairs sorted by logit descending."""
    logits = logits_tensor.tolist()
    indexed = sorted(enumerate(logits), key=lambda x: -x[1])[:n]
    return [[int(i), round(v, 4)] for i, v in indexed]

def run_decode_step(model, tokenizer, token_id, past_key_values):
    input_ids = torch.tensor([[token_id]])
    with torch.no_grad():
        output = model(
            input_ids=input_ids,
            past_key_values=past_key_values,
            output_attentions=True,
            use_cache=True
        )
    next_token_id = int(output.logits[0, -1, :].argmax().item())
    new_past = output.past_key_values
    kv_snapshot = extract_head_vectors(new_past)
    attention_outputs = extract_attention_scores(output.attentions)
    top_logits = extract_top_logits(output.logits[0, -1, :])
    return {
        "input_token": tokenizer.decode([token_id]),
        "input_token_id": token_id,
        "next_token_id": next_token_id,
        "top_logits": top_logits,
        "kv_snapshot": kv_snapshot,
        "attention_outputs": attention_outputs,
        "past_key_values": new_past,
    }

def build_example(model, tokenizer, prompt):
    print(f"  Prefill: {prompt!r}")
    prefill = run_prefill(model, tokenizer, prompt)
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
            "topLogits": result["top_logits"],
        })
        past = result["past_key_values"]
        current_token_id = result["next_token_id"]

    return {
        "promptTokens": prompt_tokens,
        "decodeSteps": decode_steps,
    }

def write_js(example, var_name, path):
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
    # eager required so output_attentions=True works during decode (past_key_values) steps
    model = GPT2LMHeadModel.from_pretrained("gpt2", attn_implementation="eager")
    model.eval()

    for i, prompt in enumerate(PROMPTS):
        print(f"\nExample {i}: {prompt!r}")
        example = build_example(model, tokenizer, prompt)
        write_js(example, f"kvEx{i}", os.path.join(OUTPUT_DIR, f"ex{i}.js"))

    imports = "\n".join(f"import {{kvEx{i}}} from './ex{i}';" for i in range(5))
    exports = ", ".join(f"kvEx{i}" for i in range(5))
    index_js = f"{imports}\n\nexport {{ {exports} }};\n"
    with open(os.path.join(OUTPUT_DIR, "index.js"), "w") as f:
        f.write(index_js)
    print(f"\nWritten {OUTPUT_DIR}/index.js")
    print("\nDone.")

if __name__ == "__main__":
    main()

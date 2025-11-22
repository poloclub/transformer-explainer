import json
import os

# 코드 위치: C:\Users\munsi\wafer_map\transformer-explainer\src\data_generate\wafer_map.py
input_path  = r"C:\Program Files\MySQL\MySQL Workbench 8.0 CE\python\wafer_map\wafer_raw\wafer_bin.csv"
output_path = r"C:\wafer_runtime\wafer_bin.json"  # <- Git 바깥 런타임 폴더

records = []
with open(input_path, encoding="utf-8", errors="ignore") as f:
    for line in f:
        line = line.strip()
        if not line:
            continue
        if line.startswith("Lot#") or line.startswith("c0=") or line.startswith("~") or line.startswith("c0 "):
            continue

        parts = line.split()
        if len(parts) < 9:
            continue

        lot, wafer, row, col, wafsize, proc, fail_bin, err_bin, group = parts[:9]

        records.append({
            "lot": lot,
            "wafer": int(wafer),
            "row": int(row),
            "col": int(col),
            "wafsize": int(wafsize),
            "process": proc,
            "fail_bin": fail_bin,
            "error_bin": err_bin,
            "group": group,
        })

by_wafer = {}
for r in records:
    key = r["wafer"]
    by_wafer.setdefault(key, []).append(r)

result = []
for wafer_id, dies in by_wafer.items():
    rows = [d["row"] for d in dies]
    cols = [d["col"] for d in dies]
    result.append({
        "wafer": wafer_id,
        "lot": dies[0]["lot"],
        "wafsize": dies[0]["wafsize"],
        "row_min": min(rows),
        "row_max": max(rows),
        "col_min": min(cols),
        "col_max": max(cols),
        "dies": dies,
    })

with open(output_path, "w", encoding="utf-8") as f:
    json.dump(result, f, indent=2)

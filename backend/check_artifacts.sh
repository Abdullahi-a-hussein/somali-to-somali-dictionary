#!/usr/bin/env bash


# ---- config ----
chars=("ø", "ų")
# ---- input ----
search_path="${1:-.}"   # default to current directory if not provided

# ---- build grep args ----
args=()
for c in "${chars[@]}"; do
  args+=("-e" "$c")
done

# ---- run ----
grep -rlF "${args[@]}" "$search_path"
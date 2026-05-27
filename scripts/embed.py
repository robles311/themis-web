#!/usr/bin/env python3
"""Generate embedding for a single text query via stdin.
Usage: echo "text to embed" | python3 scripts/embed.py
Outputs a JSON array of floats on stdout.
"""
import sys, json
from fastembed import TextEmbedding

model = TextEmbedding('sentence-transformers/all-MiniLM-L6-v2')

text = sys.stdin.read().strip()
if not text:
    print(json.dumps([]))
    sys.exit(0)

emb = list(model.embed([text]))[0]
print(json.dumps([float(x) for x in emb]))

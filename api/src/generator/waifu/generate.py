# generate.py
import time
import torch
from torch import autocast
from pipeline import pipe

def generate(prompt: str, seed: int = 42):
    generator = torch.Generator("cuda").manual_seed(seed)

    start = time.perf_counter()
    with autocast("cuda"):
        out = pipe(prompt, guidance_scale=6, generator=generator)
    infer_time = time.perf_counter() - start

    return out.images[0], infer_time

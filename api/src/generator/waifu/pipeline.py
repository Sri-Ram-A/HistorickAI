# pipeline.py
import torch
from diffusers import StableDiffusionPipeline

DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

print("🔹 Loading Stable Diffusion pipeline...")

pipe = StableDiffusionPipeline.from_pretrained(
    "hakurei/waifu-diffusion",
    dtype=torch.float16,     # torch_dtype is deprecated
).to(DEVICE)

pipe.safety_checker = None  # optional, anime models trigger false positives
pipe.enable_attention_slicing()

print("✅ Pipeline loaded")

import torch
from torch import autocast
from diffusers import StableDiffusionPipeline

pipe = StableDiffusionPipeline.from_pretrained(
    'hakurei/waifu-diffusion',
    torch_dtype=torch.float32
).to('cuda')

prompt = "A realistic image of an palace"
with autocast("cuda"):
    from pprint import pprint
    output = pipe(prompt, guidance_scale=6)
    pprint(output.__dict__)
    # output = pipe(prompt, guidance_scale=6)["sample"][0]  
    
image = output["images"][0]
image.save("test.png")
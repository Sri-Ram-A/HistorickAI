# https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0

from diffusers import DiffusionPipeline
import torch

pipe = DiffusionPipeline.from_pretrained("stabilityai/stable-diffusion-xl-base-1.0", use_safetensors=True, variant="fp16")

# if using torch < 2.0
# pipe.enable_xformers_memory_efficient_attention()

prompt = "An astronaut riding a green horse"

images = pipe(prompt=prompt).images[0]

from pprint import pprint
pprint(images.__dict__)
images.save("test.png")
# 323598322
# 985570
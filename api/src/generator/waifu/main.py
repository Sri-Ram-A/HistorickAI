from generate import generate

prompts = [
    "An owl wearing spectacles",
    "A cyberpunk cat detective",
    "Anime girl reading a book in rain"
]

for p in prompts:
    img, t = generate(p)
    print(f"Inference time: {t:.2f}s")
    img.save(p.replace(" ", "_") + ".png")

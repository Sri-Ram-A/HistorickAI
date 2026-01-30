# https://medium.com/@rahultiwari065/unlocking-the-power-of-sentence-embeddings-with-all-minilm-l6-v2-7d6589a5f0aa

from sentence_transformers import SentenceTransformer, util

model = SentenceTransformer("all-MiniLM-L6-v2")

# List of sentences
sentences = ["This is an example sentence", "Each sentence is converted to an embedding"]

# Convert sentences to embeddings
embeddings = model.encode(sentences)

# Output the embeddings
print(embeddings)

def sentence_similarity(a: str, b: str) -> float:
    emb1 = model.encode(a, convert_to_tensor=True)
    emb2 = model.encode(b, convert_to_tensor=True)
    return util.cos_sim(emb1, emb2).item()

print(sentence_similarity(sentences[0],sentences[1]))

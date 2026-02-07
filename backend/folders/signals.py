# folders/signals.py
import os
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import File, Chunk
from docling.document_converter import DocumentConverter
from docling_core.transforms.chunker.hybrid_chunker import HybridChunker
from docling_core.transforms.chunker.tokenizer.huggingface import HuggingFaceTokenizer
from transformers import AutoTokenizer
from sentence_transformers import SentenceTransformer
from loguru import logger
from tqdm import tqdm
from pathlib import Path

HF_PATH = Path("hf_models")
SUPPORTED_EXTENSIONS = {".pdf", ".docx", ".txt", ".pptx"}
EMBED_MODEL_ID = "sentence-transformers/all-MiniLM-L6-v2"
MAX_TOKENS = 384

def load_or_download_model():
    """
    Load tokenizer + embedding model locally if available.
    Otherwise download once and cache.
    """
    if HF_PATH.exists() and any(HF_PATH.iterdir()):
        logger.info(f"Loading models from local cache → {HF_PATH}")
        tokenizer = AutoTokenizer.from_pretrained(str(HF_PATH))
        embedding_model = SentenceTransformer(str(HF_PATH))
    else:
        logger.warning("Local model not found. Downloading from HuggingFace hub...")

        tokenizer = AutoTokenizer.from_pretrained(EMBED_MODEL_ID,model_max_length=MAX_TOKENS)
        embedding_model = SentenceTransformer(EMBED_MODEL_ID)
        HF_PATH.mkdir(parents=True, exist_ok=True)
        logger.info(f"Saving models locally → {HF_PATH}")
        tokenizer.save_pretrained(str(HF_PATH))
        embedding_model.save_pretrained(str(HF_PATH))

    logger.info("Models ready")
    return tokenizer, embedding_model

tokenizer, embedding_model = load_or_download_model()
document_converter = DocumentConverter()
hybrid_chunker = HybridChunker(tokenizer=tokenizer,merge_peers=True,max_tokens=MAX_TOKENS)   # type: ignore
logger.info("Loaded Tokenizer and Embeddings Transformer")

def extract_meta(doc_meta):
    """
    Convert a DocMeta object into a plain dict suitable for JSON storage.
    """
    if not doc_meta:
        return None

    meta_dict = {
        "schema_name": getattr(doc_meta, "schema_name", None),
        "version": getattr(doc_meta, "version", None),
        "headings": getattr(doc_meta, "headings", None),
        "captions": getattr(doc_meta, "captions", None),
        "origin": {
            "mimetype": getattr(doc_meta.origin, "mimetype", None),
            "binary_hash": getattr(doc_meta.origin, "binary_hash", None),
            "filename": getattr(doc_meta.origin, "filename", None),
            "uri": getattr(doc_meta.origin, "uri", None),
        } if hasattr(doc_meta, "origin") else None,
        "doc_items": []
    }

    # Process each DocItem
    for item in getattr(doc_meta, "doc_items", []):
        item_dict = {
            "self_ref": getattr(item, "self_ref", None),
            "label": getattr(item.label, "name", str(item.label)) if getattr(item, "label", None) else None,
            "content_layer": getattr(item.content_layer, "name", str(item.content_layer)) if getattr(item, "content_layer", None) else None,
            "prov": [],
        }

        # Extract Provenance
        for p in getattr(item, "prov", []):
            bbox = getattr(p, "bbox", None)
            item_dict["prov"].append({
                "page_no": getattr(p, "page_no", None),
                "charspan": getattr(p, "charspan", None),
                "bbox": {
                    "l": getattr(bbox, "l", None),
                    "t": getattr(bbox, "t", None),
                    "r": getattr(bbox, "r", None),
                    "b": getattr(bbox, "b", None),
                    "coord_origin": getattr(bbox.coord_origin, "name", str(bbox.coord_origin)) if bbox else None,
                } if bbox else None
            })

        meta_dict["doc_items"].append(item_dict)

    return meta_dict

@receiver(post_save, sender=File)
def generate_tokenized_embeddings(sender, instance, created, **kwargs):
    if not created:
        return  # only run for new files
    
    # Check file extension
    _, ext = os.path.splitext(instance.file.name.lower())
    if ext not in SUPPORTED_EXTENSIONS:
        print(f"Skipping file {instance.file.name}: unsupported extension {ext}")
        return

    try:
        # Convert file to text
        result = document_converter.convert(instance.file.path)  # local file path from FileField
    except Exception as e:
        print(f"Failed to convert {instance.file.name}: {e}")
        return

    # Chunk the document
    chunks = hybrid_chunker.chunk(dl_doc=result.document)  # returns a list of DocItem objects (like your pprint)

    for chunk in tqdm(chunks):
        text = chunk.text
        meta = extract_meta(chunk.meta)
        embedding = embedding_model.encode(text).tolist()  # convert to list for JSON/vector storage

        # Save chunk
        Chunk.objects.create(
            file=instance,
            folder=instance.folder,  # denormalized
            text=text,
            embedding=embedding,
            metadata=meta
        )
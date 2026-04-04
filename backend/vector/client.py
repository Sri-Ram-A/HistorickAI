from loguru import logger
import time

import chromadb
from sentence_transformers import SentenceTransformer
from transformers import AutoTokenizer
from docling.document_converter import DocumentConverter
from docling_core.transforms.chunker.hybrid_chunker import HybridChunker


MAX_TOKENS = 384
EMBEDDING_MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"


class VectorStore:
    def __init__(self, chroma_path: str = ".") -> None:
        start = time.time()
        logger.info("Initializing VectorStore...")

        self._client = chromadb.PersistentClient(path=chroma_path)
        logger.info("Chroma client initialized")

        logger.info("Loading embedding model...")
        t0 = time.time()
        self._embedding_model = SentenceTransformer(EMBEDDING_MODEL_NAME)
        logger.info(f"Embedding model loaded in {time.time() - t0:.2f}s")

        logger.info("Loading tokenizer...")
        t0 = time.time()
        _tokenizer = AutoTokenizer.from_pretrained(
            EMBEDDING_MODEL_NAME,
            model_max_length=MAX_TOKENS,
        )
        logger.info(f"Tokenizer loaded in {time.time() - t0:.2f}s")

        logger.info("Initializing chunker...")
        self._chunker = HybridChunker(
            tokenizer=_tokenizer,
            merge_peers=True,
            max_tokens=MAX_TOKENS,
        )

        logger.info("Initializing document converter...")
        self._converter = DocumentConverter()

        logger.info(f"VectorStore initialized in {time.time() - start:.2f}s")

    def _get_collection(self, user_id: str):
        return self._client.get_or_create_collection(name=f"user_{user_id}")

    def process_and_index(self, *, file_path, file_id, user_id, folder_id):
        start = time.time()
        logger.info(f"Processing file {file_id}")

        result = self._converter.convert(file_path)
        logger.info("Document converted")

        chunks = list(self._chunker.chunk(dl_doc=result.document))
        logger.info(f"Chunked into {len(chunks)} chunks")

        texts, metadatas, ids = [], [], []

        for i, chunk in enumerate(chunks):
            text = chunk.text.strip()
            if not text:
                continue

            texts.append(text)
            ids.append(f"{file_id}_{i}")
            metadatas.append(
                {
                    "user_id": user_id,
                    "folder_id": folder_id,
                    "file_id": file_id,
                    "chunk_index": i,
                }
            )

        if not texts:
            logger.warning("No valid text chunks found")
            return 0

        logger.info("Generating embeddings...")
        t0 = time.time()
        embeddings = self._embedding_model.encode(
            texts, show_progress_bar=False
        ).tolist()
        logger.info(f"Embeddings generated in {time.time() - t0:.2f}s")

        collection = self._get_collection(user_id)

        logger.info("Storing in Chroma...")
        collection.add(
            documents=texts,
            metadatas=metadatas,
            ids=ids,
            embeddings=embeddings,
        )

        logger.info(f"Completed indexing in {time.time() - start:.2f}s")
        return len(texts)

    def delete_file_embeddings(self, *, user_id, file_id):
        logger.info(f"Deleting embeddings for file {file_id}")
        collection = self._get_collection(user_id)
        collection.delete(where={"file_id": file_id})

    def query(self, *, user_id, folder_id, query, k=5):
        logger.info(f"Querying for folder {folder_id}")
        collection = self._get_collection(user_id)
        return collection.query(
            query_texts=[query],
            n_results=k,
            where={"folder_id": folder_id},
        )


vector_store = VectorStore()

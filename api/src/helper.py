import cv2
from pathlib import Path
from sentence_transformers import SentenceTransformer, util
from loguru import logger

MODEL_NAME = "all-MiniLM-L6-v2"
similarity_model = SentenceTransformer(MODEL_NAME)
logger.info(f"Loaded Transformer Model : {MODEL_NAME}")

def extract_first_frame(video_path: Path, output_image: Path):
    cap = cv2.VideoCapture(str(video_path))
    success, frame = cap.read()
    cap.release()
    if not success:
        raise RuntimeError("Failed to extract first frame")
    cv2.imwrite(str(output_image), frame)

def sentence_similarity(a: str, b: str) -> float:
    emb1 = similarity_model.encode(a, convert_to_tensor=True)
    emb2 = similarity_model.encode(b, convert_to_tensor=True)
    return util.cos_sim(emb1, emb2).item()
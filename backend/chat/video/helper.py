import os
import requests
from PIL import Image
from serpapi import GoogleSearch
from typing import Tuple
import cv2
from pathlib import Path
from sentence_transformers import SentenceTransformer, util
from loguru import logger
import os
import requests
from io import BytesIO
from PIL import Image
from serpapi import GoogleSearch
from loguru import logger
from typing import Tuple
MODEL_NAME = "all-MiniLM-L6-v2"
similarity_model = SentenceTransformer(MODEL_NAME)
logger.info(f"Loaded Transformer Model : {MODEL_NAME}")

def search_google_image(query: str) -> list[str]:
    """Returns a list of image URLs for a given query."""
    params = {
        "engine": "google_images_light",
        "q": query,
        "api_key": os.getenv("IMAGE_SEARCH_API_KEY"),
    }

    search = GoogleSearch(params)
    results = search.get_dict()
    if "images_results" not in results:
        raise Exception("No images found")
    return [img["original"] for img in results["images_results"]]

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

from loguru import logger
import pyttsx3

def text_to_speech(query,file_path):
    engine = pyttsx3.init()
    voices = engine.getProperty("voices")
    for voice in voices:
        if "David" in voice.name:
            engine.setProperty("voice", voice.id)
    engine.setProperty("rate", 170)
    engine.setProperty("volume", 0.9)
    engine.save_to_file(query,file_path)
    engine.runAndWait()
    logger.info(f"Audio saved at : {file_path}")

import os
import requests
from loguru import logger

PEXELS_ENDPOINT = "https://api.pexels.com/videos/search?query={query}per_page=1&orientation=landscape"

def get_pexels_video(query: str,save_path:str)->bool:
    endpoint = PEXELS_ENDPOINT.format(query=query)
    headers = {"Authorization": os.getenv("PEXELS_API_KEY")}
    try:
        response = requests.get(endpoint, headers=headers)
        response.raise_for_status()
        json_data = response.json()
        if not json_data["videos"]:
            logger.error(f"Could not fetch video for query: {query}")
        video_link = json_data["videos"][0]["video_files"][0]["link"]
        response = requests.get(video_link)
        
        with open(save_path, "wb") as file:
            file.write(response.content)
        logger.debug(f'Got Pexels video for "{query}" at {save_path}')
        return True
    except requests.exceptions.RequestException as e:
        logger.error(f"Error fetching Pexels video for '{query}': {e}")
        return False

def download_and_save_image(
    urls: list[str],
    output_path: str,
    min_size: tuple[int, int] = (256, 256),
) -> Tuple[bool, str]:
    for url in urls:
        try:
            response = requests.get(
                url,
                timeout=10,
                headers={"User-Agent": "Mozilla/5.0"},
            )
            response.raise_for_status()

            image = Image.open(BytesIO(response.content))
            image.verify()
            image = Image.open(BytesIO(response.content))

            if image.width < min_size[0] or image.height < min_size[1]:
                continue

            os.makedirs(os.path.dirname(output_path), exist_ok=True)

            ext = (image.format or "JPEG").lower()
            final_path = f"{os.path.splitext(output_path)[0]}.{ext}"
            image.save(final_path)

            return True, final_path

        except Exception as e:
            logger.warning(f"Image URL failed, trying next: {e}")
            continue

    return False, ""


def get_google_image(query: str, output_path: str) -> Tuple[bool,str]:
    """High-level API: search + download + save"""
    urls = search_google_image(query)
    return download_and_save_image(urls, output_path)

if __name__ == "__main__":
    _,saved_path = get_google_image(
        query="Mahathma Gandhiji historical painting",
        output_path="images/mahathma_gandhiji",
    )

    print(f"Image saved at: {saved_path}")


def generate_story(query) -> str:
    file_path = r"C:\Users\SriRam.A\Documents\sr_proj\HistorickAI\api\src\demo.txt"
    content = query
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
    except FileNotFoundError:
        logger.error(f"Error: File '{file_path}' not found.")
    logger.debug(f"LLM Response : {content}")
    return content
   


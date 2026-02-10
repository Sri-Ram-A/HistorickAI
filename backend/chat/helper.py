# https://serpapi.com/google-images-light-api

import os
import requests
from PIL import Image
from serpapi import GoogleSearch
from loguru import logger
from typing import Tuple

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
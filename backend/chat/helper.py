# https://serpapi.com/google-images-light-api

import os
import serpapi

GOOGLE_SERP_SPI = os.getenv("GOOGLE_SERP_SPI")


def search_google_image(query: str) -> list[str]:
    """Returns a list of image URLs for a given query."""
    client = serpapi.Client(api_key=GOOGLE_SERP_SPI)
    params = {
        "engine": "google_images_light",
        "q": query,
        "api_key": os.getenv("IMAGE_SEARCH_API_KEY"),
    }

    results = client.search(params)
    if "images_results" not in results:
        raise Exception("No images found")
    return [img["original"] for img in results["images_results"]]

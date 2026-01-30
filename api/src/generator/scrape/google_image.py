# https://serpapi.com/google-images-light-api

import os
import requests
from io import BytesIO
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


# {
#     "search_metadata": {
#         "id": "697ca8556838631efa41ce70",
#         "status": "Success",
#         "json_endpoint": "https://serpapi.com/searches/95eed8ab0cbb79c7/697ca8556838631efa41ce70.json",
#         "created_at": "2026-01-30 12:47:17 UTC",
#         "processed_at": "2026-01-30 12:47:17 UTC",
#         "google_images_light_url": "https://www.google.com/search?q=Allaudin+Khilji&hl=en&gl=us&tbm=isch&biw=1764&bih=1031",
#         "raw_html_file": "https://serpapi.com/searches/ac83cdde0af64b14/697ca8556838631efa41ce70.html",
#         "prettify_html_file": "https://serpapi.com/searches/124375ad33d41f2e/697ca8556838631efa41ce70.prettify",
#         "total_time_taken": 0.48
#     },
#     "search_parameters": {
#         "engine": "google_images_light",
#         "q": "Allaudin Khilji",
#         "google_domain": "google.com",
#         "hl": "en",
#         "gl": "us",
#         "device": "desktop"
#     },
#     "search_information": {
#         "image_results_state": "Results for exact spelling"
#     },
#     "images_results": [
#         {
#             "position": 1,
#             "title": "The Ruthless Legacy of Alauddin Khilji: Most Feared Sultan of the ...",
#             "source": "Medium",
#             "link": "https://medium.com/chronicles-of-curiosity/the-ruthless-legacy-of-alauddin-khilji-most-feared-sultan-of-the-delhi-sultanate-89d26c881c02",
#             "raw_link": "https://medium.com/chronicles-of-curiosity/the-ruthless-legacy-of-alauddin-khilji-most-feared-sultan-of-the-delhi-sultanate-89d26c881c02",
#             "original": "https://miro.medium.com/v2/resize:fit:1400/1*nV5S_R05CX892jlAfyU-Bw.png",
#             "original_width": 1400,
#             "original_height": 933,
#             "thumbnail": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQnxTMQUQnO1ayW8C4efvwqGptklgIFU_t-dApz440PVjiu-HmG&s",
#             "serpapi_thumbnail": "https://serpapi.com/images/url/dTcbonicu5mVUVJSUGylr5-al1xUWVCSmqJbkpRnoJdeXJJYkpmsl5yfq5-Zm5ieWmxfaAuUsXL0S7F0Tw7MqwjxDQwNzPM3TKwMt3A2SU0rKy90LyjJzkn3dAuNL9FNcSyoMjExCAjLyizV9ch1VysGAJTUJtg",
#             "related_content_id": "aF9NTjA1TTNIaVlHTU1cIixcIjNqUUhWTllhRURrZVFN",
#             "serpapi_related_content_link": "https://serpapi.com/search.json?engine=google_images_related_content&gl=us&hl=en&q=Allaudin+Khilji&related_content_id=aF9NTjA1TTNIaVlHTU1cIixcIjNqUUhWTllhRURrZVFN"
#         }
#     ]
# }
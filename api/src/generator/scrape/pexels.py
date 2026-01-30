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
     
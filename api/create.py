import os
from loguru import logger
import json

import model
import schemas
import system_instructions
from video import VideoGenerator

os.makedirs("./videos", exist_ok=True)
os.makedirs("./audios", exist_ok=True)

def generate_video(query):
    videoGen=VideoGenerator()
    response=videoGen.generate_story(query=query)
    videoGen.text_to_speech(query=response.get("script") or response.get("story") or response.get("narration") or "Backend ran into some problem,No story Sorry")
    video_dict=videoGen.fetch_videos_concurrently(prompts=response.get("scenes",["Error","Not Found"]))
    video_paths = [
            video[next(iter(video))]
            for prompt, video in video_dict.items()
            if video and next(iter(video)) is not None
        ]
    if None in video_paths:
        video_paths.remove(None)
    videoGen.create_final_video(video_paths=video_paths)
    
    return response.get("script","")

def generate_story(query) -> dict:
    response = model.generate(schemas.Story, system_instructions.story_instruction, query)
    parsed = json.loads(response) #response : { story:str , scenes:list[str] }
    logger.info("Story and Scene generated ❤️")
    return parsed

def generate_timeline(query) -> dict:
    response = model.generate(list[schemas.TimelineEntry], system_instructions.timeline_instruction, query)
    parsed = json.loads(response) 
    logger.info("Timeline generated ❤️")
    return parsed

def generate_quiz(query) -> dict :
    response = model.generate(list[schemas.Quiz], system_instructions.quiz_instruction, query)
    parsed = json.loads(response) 
    logger.info("Quiz generated ❤️")
    return parsed


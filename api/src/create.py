import os
from loguru import logger
import json
import model
import schemas
import system_instructions

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


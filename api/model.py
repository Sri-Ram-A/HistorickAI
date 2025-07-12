from google import genai
from dotenv import load_dotenv
from loguru import logger
import os
load_dotenv() 

# To run this code you need to install the following dependencies:
# pip install google-genai
def generate(schema=None,system_instruction="No system instruction provided",contents="No query provided "):
    API_KEY=os.getenv("API_KEY")
    logger.success("Loaded API KEY succesfully✨")
    client = genai.Client(api_key=API_KEY)
    config={
        "response_mime_type": "application/json",
        "system_instruction":system_instruction
        }
    if(schema!=None): 
        config["response_schema"]=schema
    response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents=contents,
        config=config,
    )
    return response.text # <class 'str'>

def stream(contents="No query provided"):
    API_KEY=os.getenv("API_KEY")
    client = genai.Client(api_key=API_KEY)
    response = client.models.generate_content_stream(
        model="gemini-2.0-flash",
        contents=contents,
    )
    for chunk in response:
        print(chunk.text, end="")

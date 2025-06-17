from google import genai
from dotenv import load_dotenv
from loguru import logger
import os
load_dotenv() 

# To run this code you need to install the following dependencies:
# pip install google-genai
def generate(schema,system_instruction,contents):
    API_KEY=os.getenv("API_KEY")
    logger.success("Loaded API KEY succesfully✨")
    client = genai.Client(api_key=API_KEY)
    response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents=contents,
        config={
            "response_mime_type": "application/json",
            "response_schema": schema,
            "system_instruction":system_instruction
        },
    )
    return response.text #<class 'str'>
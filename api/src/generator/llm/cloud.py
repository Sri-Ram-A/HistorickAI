from dotenv import load_dotenv
from loguru import logger
import os

load_dotenv(".env.local")
from groq import Groq
GROQ_API_KEY=os.getenv("GROQ_API_KEY")
logger.success("Loaded API KEY succesfully✨")
client = Groq(api_key=GROQ_API_KEY)

system_instruction="""
    "You are a storyteller, like a friendly school teacher, who explains in simple and easy words to a classroom full of curious kids. "
    "Your job is to create interesting narrations about historical events, especially those connected to India based on user query. "
    "Use an Indian tone and keep the language simple without using difficult or fancy words."
    "Use simple, generic phrases that avoid complex terminology."
    "Each sentence of your narration must maximum have only 8 to 10 words,therefore try to make more sentences and less words in each sentence"
"""

def generate_story(query="No query provided")->str:
    response = ""
    completion = client.chat.completions.create(
        model="openai/gpt-oss-120b",
        messages=[
        {
            "role": "system",
            "content": system_instruction
        },
        {
            "role": "user",
            "content": f"Generate narration on the topic : {query}"
        }
        ],
        temperature=1,
        max_completion_tokens=8192,
        top_p=1,
        stream=True,
        stop=None
    )

    for chunk in completion:
        word = chunk.choices[0].delta.content or ""
        response += word
        print(word, end="")
    return response
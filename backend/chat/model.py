# from google import genai
from loguru import logger
import os
from groq import Groq
from rich import print as rich_print
from rich.pretty import Pretty
from rich.console import Console
from rich.syntax import Syntax

console = Console()
import json

API_KEY=os.getenv("GROQ_API_KEY")
logger.success("Loaded API KEY succesfully✨")
client = Groq(api_key=API_KEY)

def generate(schema=None,system_instruction="No system instruction provided",query="No query provided "):
    completion = client.chat.completions.create(
        model="openai/gpt-oss-120b",
        messages=[
        {
            "role": "system",
            "content": system_instruction
        },
        {
            "role": "user",
            "content": f"Strictly generate the json output in the given format : {schema} on the topic : {query}"
        }
        ],
        temperature=1,
        max_completion_tokens=8192,
        top_p=1,
        stream=False,
        response_format={"type": "json_object"},
        stop=None
    )
    response = completion.choices[0].message.content
    logger.debug("Model output:")
    try:
        data = json.loads(str(response))
        formatted = json.dumps(data, indent=2, ensure_ascii=False)
        console.print(Syntax(formatted, "json", theme="monokai"))
    except Exception:
        console.print(response)
    return response


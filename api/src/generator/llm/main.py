from loguru import logger

def generate_story(query) -> str:
    file_path = r"C:\Users\SriRam.A\Documents\sr_proj\HistorickAI\api\src\demo.txt"
    content = query
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
    except FileNotFoundError:
        logger.error(f"Error: File '{file_path}' not found.")
    logger.debug(f"LLM Response : {content}")
    return content
   


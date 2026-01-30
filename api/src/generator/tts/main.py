from loguru import logger
import pyttsx3

def text_to_speech(query,file_path):
    engine = pyttsx3.init()
    voices = engine.getProperty("voices")
    for voice in voices:
        if "David" in voice.name:
            engine.setProperty("voice", voice.id)
    engine.setProperty("rate", 170)
    engine.setProperty("volume", 0.9)
    engine.save_to_file(query,file_path)
    engine.runAndWait()
    logger.info(f"Audio saved at : {file_path}")
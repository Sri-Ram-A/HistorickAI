from concurrent.futures import ThreadPoolExecutor
import os
from loguru import logger
from collections import OrderedDict
import requests
import pyttsx3
from moviepy import VideoFileClip, concatenate_videoclips, AudioFileClip
import model
import schemas
import system_instructions
import json 

class VideoGenerator:
    
    def __init__(self):
        self.PEXELS_API_KEY=os.getenv("PEXELS_API_KEY")
        os.makedirs("./videos", exist_ok=True)
        os.makedirs("./audios", exist_ok=True)

    def generate_story(self,query) -> dict:
        response = model.generate(schemas.Story, system_instructions.story_instruction, query)
        parsed = json.loads(response) # response : { story:str , scenes:list[str] }
        logger.info("Story and Scene generated 📜")
        return parsed
    
    def get_pexels_video(self,query: str):
        endpoint = f"https://api.pexels.com/videos/search?query={query}&per_page=1&orientation=landscape"
        headers = {"Authorization": self.PEXELS_API_KEY}
        try:
            response = requests.get(endpoint, headers=headers)
            response.raise_for_status()
            json_data = response.json()
            if not json_data["videos"]:
                logger.error(f"Could not fetch video for query: {query}")
                return None
            video_link = json_data["videos"][0]["video_files"][0]["link"]
            response = requests.get(video_link)
            save_path = f'./videos/pexels_{query.replace(" ", "_")}.mp4'
            with open(save_path, "wb") as file:
                file.write(response.content)
            logger.info(f'📽️Got Pexels video for "{query}" at {save_path}')
            return save_path
        except requests.exceptions.RequestException as e:
            logger.error(f"Error fetching Pexels video for '{query}': {e}")
            return None
        
    def fetch_videos_concurrently(self,prompts:list) -> dict:
        pexels_prompts1 = prompts[::2]
        pexels_prompts2 = prompts[1::2]

        with ThreadPoolExecutor(max_workers=4) as executor:
            futures = {
                executor.submit(self.get_pexels_video, prompt): ("getPixabayVideo1", prompt)
                for prompt in pexels_prompts1
            }
            futures.update(
                {
                    executor.submit(self.get_pexels_video, prompt): ("getPexelsVideo2", prompt)
                    for prompt in pexels_prompts2
                }
            )

            results = OrderedDict()
            for future in futures:
                func_name, prompt = futures[future]
                try:
                    result = future.result()
                    if prompt not in results:
                        results[prompt] = {}
                    results[prompt][func_name] = result
                except Exception as e:
                    logger.error(f"Error in {func_name} for '{prompt}': {e}")
        logger.success("Fetched All Videos🌟")
        return OrderedDict((prompt, results.get(prompt, {})) for prompt in prompts)

    def text_to_speech(self,query):
        engine = pyttsx3.init()
        voices = engine.getProperty("voices")
        for voice in voices:
            if "David" in voice.name:
                engine.setProperty("voice", voice.id)
        engine.setProperty("rate", 170)
        engine.setProperty("volume", 0.9)
        engine.save_to_file(query, "./audios/text_to_speech.mp3")
        engine.runAndWait()
        logger.info("Audio generated successfully🎙️")

    def create_final_video(self,video_paths: list, target_width=1200, target_height=720, fps=30):
        logger.info(f"Starting video creation with {len(video_paths)} video clips")
        clips = []
        try:
            for video_path in video_paths:
                logger.debug(f"Processing video: {video_path}")
                clip = VideoFileClip(video_path)
                clip_duration = clip.duration
                logger.debug(f"Original clip duration: {clip_duration} seconds")
                end_time = min(clip_duration, 8)
                logger.debug(f"Trimming clip to {end_time} seconds")
                subclip = clip.subclipped(0, end_time)
                try:
                    logger.debug(f"Resizing clip to {target_width}x{target_height}")
                    resized_clip = subclip.resized(width=target_width, height=target_height)
                except AttributeError:
                    logger.debug("Using alternative resize method")
                    resized_clip = subclip.resized(newsize=(target_width, target_height))
                clips.append(resized_clip)
                logger.debug(f"Clip added to list. Total clips: {len(clips)}")

            logger.info(f"Concatenating {len(clips)} video clips")
            final_clip = concatenate_videoclips(clips, method="compose")
            logger.debug(f"Final clip duration before audio: {final_clip.duration} seconds")
            
            logger.info("Loading audio file")
            audio_clip = AudioFileClip("./audios/text_to_speech.mp3")
            audio_duration = audio_clip.duration
            logger.debug(f"Audio duration: {audio_duration} seconds")
            
            logger.info("Adding audio to video")
            final_clip = final_clip.with_audio(audio_clip)
            
            if final_clip.duration > audio_duration:
                logger.debug(f"Trimming video to match audio duration ({audio_duration}s)")
                final_clip = final_clip.subclipped(0, audio_duration)
            
            output_path = f"./videos/final_video.mp4"
            logger.info(f"Writing final video to: {output_path}")
            final_clip.write_videofile(output_path, codec="libx264", audio_codec="aac")

            logger.debug("Starting resource cleanup")
            final_clip.close()
            audio_clip.close()
            for clip in clips:
                clip.close()
            logger.debug("Resource cleanup completed")

            logger.success("Video generated successfully😄🙋‍♂️")
            logger.success(f"Final video created at {output_path}")
            return output_path
            
        except Exception as e:
            logger.error(f"Error in create_final_video: {str(e)}")
            logger.exception("Detailed traceback:")
            raise
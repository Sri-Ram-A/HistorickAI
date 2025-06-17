from concurrent.futures import ThreadPoolExecutor
import os
from loguru import logger
from collections import OrderedDict
import requests
from groq import Groq
import pyttsx3
from moviepy import VideoFileClip, concatenate_videoclips, AudioFileClip
import api.system_instructions as system_instructions


# Ensure the 'videos' directory exists
os.makedirs("./videos", exist_ok=True)

def generate_quiz(content:str):
    client = Groq(api_key=)
    
    messages_narration = [
        {"role": "system", "content": system_instructions.narration_prompt},
        {"role": "user", "content": content},
    ]
    response_narration = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=messages_narration,
        temperature=1,
        max_tokens=1024,
        top_p=1,
        stream=True,
        stop=None,
    )
    script = ""
    for chunk in response_narration:
        if chunk.choices[0].delta.content:
            script += str(chunk.choices[0].delta.content)

    bidx=script.find("[")
    eidx=script.rfind("]")
    print("Script generated is\n")
    print(script)
    script=script[bidx:eidx+1]
    print("*"*100)
    print("Preprocessed script is\n")
    print(script)
    print("*"*100)
    import json
    try:
        quiz_data = json.loads(script)
        if isinstance(quiz_data, list):
            print("✅ Quiz generated successfully:")
            print(json.dumps(quiz_data, indent=2))
            return quiz_data
        else:
            raise ValueError("Invalid JSON format: Expected a list")
    except json.JSONDecodeError:
        raise ValueError("Failed to parse JSON response from LLM")
 
def generate_timeline(content: str):
    client = Groq(api_key=)
    narration_prompt = """
    You are a code generator that creates Python code for a historical timeline.
    Your task is to output only a list of dictionaries compatible with the Timeline component in React. 
    Each dictionary should have a "title" field and a "content" field, which contains JSX in the form of a React component with an <Image> tag. 
    The content must include appropriate styling, images, and text. 
    Use only <h3> tags for content and <h2> tags for headings. 
    DO NOT GENERATE ANY CONVERSATIONAL TEXT
    Do not use Wikimedia for image sources.
    Here’s an example format for the timeline entries:

    [
        {
            "title": "2024",
            "content": (
                <div>
                    <h2 className="text-neutral-800 dark:text-neutral-200 text-lg md:text-xl font-semibold mb-4">Aceternity UI and Pro Launch</h2>
                    <h3 className="text-neutral-800 dark:text-neutral-200 text-xs md:text-sm font-normal mb-8">
                        Built and launched Aceternity UI and Aceternity UI Pro from scratch.
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <Image
                            src="https://assets.aceternity.com/templates/startup-1.webp"
                            alt="startup template"
                            width={500}
                            height={500}
                            className="rounded-lg object-cover"
                        />
                        <Image
                            src="https://assets.aceternity.com/templates/startup-2.webp"
                            alt="startup template"
                            width={500}
                            height={500}
                            className="rounded-lg object-cover"
                        />
                    </div>
                </div>
            ),
        },
        {
            "title": "Early 2023",
            "content": (
                <div>
                    <h2 className="text-neutral-800 dark:text-neutral-200 text-lg md:text-xl font-semibold mb-4">Lorem Ipsum Project</h2>
                    <h3 className="text-neutral-800 dark:text-neutral-200 text-xs md:text-sm font-normal mb-8">
                        Lorem ipsum is for people who are too lazy to write copy.
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <Image
                            src="https://assets.aceternity.com/pro/hero-sections.png"
                            alt="hero template"
                            width={500}
                            height={500}
                            className="rounded-lg object-cover"
                        />
                    </div>
                </div>
            ),
        },
    ]

    The list should not include any other information besides what’s necessary for generating this timeline. 
    Focus only on this specific structure and the necessary details.
    """
    messages_narration = [
        {"role": "system", "content": narration_prompt},
        {"role": "user", "content": content},
    ]
    response_narration = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=messages_narration,
        temperature=1,
        max_tokens=1024,
        top_p=1,
        stream=True,
        stop=None,
    )
    script = ""
    for chunk in response_narration:
        if chunk.choices[0].delta.content:
            script += str(chunk.choices[0].delta.content)

    bidx=script.find("[")
    eidx=script.rfind("]")
    print("Script generated is\n")
    print(script)
    script=script[bidx:eidx+1]
    script=script.replace("\n", "").replace("\\", "")
    print("*"*100)
    print("Preprocessed script is\n")
    print(script)
    print("*"*100)
    return script

def get_pexels_video(query: str):
    api_key =  # Replace with your actual API key
    endpoint = f"https://api.pexels.com/videos/search?query={query}&per_page=1&orientation=landscape"
    headers = {"Authorization": api_key}
    try:
        response = requests.get(endpoint, headers=headers)
        response.raise_for_status()
        json_data = response.json()
        if not json_data["videos"]:
            print(f"Could not fetch video for query: {query}")
            return None
        video_link = json_data["videos"][0]["video_files"][0]["link"]
        response = requests.get(video_link)
        save_path = f'./videos/pexels_{query.replace(" ", "_")}.mp4'
        with open(save_path, "wb") as file:
            file.write(response.content)
        print(f'Successfully saved Pexels video for "{query}" at {save_path}')
        return save_path
    except requests.exceptions.RequestException as e:
        print(f"Error fetching Pexels video for '{query}': {e}")
        return None

def give_timeline(content:str):
    client = Groq(api_key)
    narration_prompt = """
        You are an AI that generates structured data for historical timelines.  
        Your task is to return only a **list of dictionaries** in the following format, with NO extra text or explanations:  

        [
            {
                "title": "Early 2023",
                "heading": "India touches new horizon",
                "description": "India to become the richest country ....and ...",
                "image_source": "https://wiki.com",
                "alternative": "Indian flag"
            },
            {
                "title": "2024",
                "heading": "Technological Breakthrough",
                "description": "New AI advancements are shaping the future...",
                "image_source": "https://example.com/ai.jpg",
                "alternative": "AI robot"
            }
        ]

        Guidelines:  
        - **Only return structured JSON**.  
        - **Do NOT generate any JSX, HTML, or Python code**.  
        - Ensure each entry has **title, heading, description, image_source, and alternative** fields.  
        - Keep descriptions informative and concise.  

        Return only the JSON list with NO extra text.
    """
    messages_narration = [
        {"role": "system", "content": narration_prompt},
        {"role": "user", "content": content},
    ]
    response_narration = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=messages_narration,
        temperature=1,
        max_tokens=1024,
        top_p=1,
        stream=True,
        stop=None,
    )
    script = ""
    for chunk in response_narration:
        if chunk.choices[0].delta.content:
            script += str(chunk.choices[0].delta.content)

    bidx=script.find("[")
    eidx=script.rfind("]")
    print("Script generated is\n")
    print(script)
    script=script[bidx:eidx+1]
    print("*"*100)
    print("Preprocessed script is\n")
    print(script)
    print("*"*100)
    import json
    try:
        quiz_data = json.loads(script)
        if isinstance(quiz_data, list):
            print("✅ Quiz generated successfully:")
            print(json.dumps(quiz_data, indent=2))
            return quiz_data
        else:
            raise ValueError("Invalid JSON format: Expected a list")
    except json.JSONDecodeError:
        raise ValueError("Failed to parse JSON response from LLM")

def generate_narration(content: str) -> tuple[str, list]:
    client = Groq(api_key)
    if "generate video" not in content.lower():
        narration_prompt = (
            "You are  a friendly school teacher, who explains history in simple and easy words."
            "Generate only in English and be minimalistic"
        )
        messages_narration = [
            {"role": "system", "content": narration_prompt},
            {"role": "user", "content": content},
        ]
        response_narration = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=messages_narration,
            temperature=1,
            max_tokens=1024,
            top_p=1,
            stream=True,
            stop=None,
        )
        script = ""
        for chunk in response_narration:
            if chunk.choices[0].delta.content:
                script += str(chunk.choices[0].delta.content)
        return script
    else:
        narration_prompt = (
            "You are a storyteller, like a friendly school teacher, who explains history in simple and easy words so that even high school students can understand. "
            "Your job is to create interesting narrations about historical events, especially those connected to India based on user query. "
            "Use an Indian tone and keep the language simple without using difficult or fancy words."
            "Make the stories engaging, as if you are telling them to a classroom full of curious kids."
            "Generate a speech without any interrupts."
            "Please limit your words between 250 to 300"
            "Generate only in English"
        )
        messages_narration = [
            {"role": "system", "content": narration_prompt},
            {"role": "user", "content": content},
        ]
        response_narration = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=messages_narration,
            temperature=1,
            max_tokens=1024,
            top_p=1,
            stream=True,
            stop=None,
        )
        script = ""
        for chunk in response_narration:
            if chunk.choices[0].delta.content:
                script += str(chunk.choices[0].delta.content)
        list_prompt = (
            f"{script}\n\n"
            "Based on the following narration, create a comprehensive list of short"
            ",concise descriptions for the footage needed to visually represent the scene."
            "Make sure to include words like emperor,pyramid,etc which are coomon nouns"
            "Each description should consist of 2 to 3 words and be presented in a comma-separated format only."
            "Focus on capturing the essence of the visuals that would enhance the narration without summarizing it."
            "Use simple, generic phrases that avoid named entities or complex terminology."
            "Aim for variety by including multiple options in your descriptions."
            "Ensure that all terms are neutral and avoid any violent or graphic language, opting instead for softer alternatives."
            "Please provide only the list of descriptions without any additional commentary or conversational text."
        )
        messages_list = [
            {"role": "system", "content": list_prompt},
            {"role": "user", "content": script},
        ]
        response_list = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=messages_list,
            temperature=1,
            max_tokens=1024,
            top_p=1,
            stream=True,
            stop=None,
        )
        video_description_str = ""
        for chunk in response_list:
            if chunk.choices[0].delta.content:
                video_description_str += str(chunk.choices[0].delta.content)
        video_description_str = video_description_str.replace("\n", "")
        video_description_list = video_description_str.split(",")
        return script, video_description_list

def fetch_videos_concurrently(prompts) -> dict:
    pexels_prompts1 = prompts[::2]
    pexels_prompts2 = prompts[1::2]

    with ThreadPoolExecutor(max_workers=4) as executor:
        futures = {
            executor.submit(get_pexels_video, prompt): ("getPixabayVideo1", prompt)
            for prompt in pexels_prompts1
        }
        futures.update(
            {
                executor.submit(get_pexels_video, prompt): ("getPexelsVideo2", prompt)
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
                print(f"Error in {func_name} for '{prompt}': {e}")

    return OrderedDict((prompt, results.get(prompt, {})) for prompt in prompts)

def text_to_speech(query, audio_path="test_output.mp3"):
    engine = pyttsx3.init()
    voices = engine.getProperty("voices")
    for voice in voices:
        if "David" in voice.name:
            engine.setProperty("voice", voice.id)
    engine.setProperty("rate", 170)
    engine.setProperty("volume", 0.9)
    engine.save_to_file(query, audio_path)
    engine.runAndWait()
    print("Audio generated successfully\n")
    return audio_path

def create_final_video(
    video_paths: list, audio_path, target_width=1200, target_height=720, fps=30
):
    clips = []
    for video_path in video_paths:
        clip = VideoFileClip(video_path)
        clip_duration = clip.duration
        end_time = min(clip_duration, 5)
        subclip = clip.subclipped(0, end_time)
        try:
            resized_clip = subclip.resized(width=target_width, height=target_height)
        except AttributeError:
            resized_clip = subclip.resized(newsize=(target_width, target_height))
        clips.append(resized_clip)

    final_clip = concatenate_videoclips(clips, method="compose")
    audio_clip = AudioFileClip(audio_path)
    audio_duration = audio_clip.duration
    final_clip = final_clip.with_audio(audio_clip)
    if final_clip.duration > audio_duration:
        final_clip = final_clip.subclipped(0, audio_duration)
    output_path = f"./videos/finalVideo.mp4"
    final_clip.write_videofile(output_path, codec="libx264", audio_codec="aac")

    final_clip.close()
    audio_clip.close()
    for clip in clips:
        clip.close()

    print("Video generated successfully")
    return output_path

def send_video(query):
    script, video_description_list = generate_narration(query)
    print("*" * 140)
    print("Script generated successfully")
    print("*" * 140)
    print(script)
    print("*" * 140)
    print(video_description_list)
    print("*" * 140)
    audio_path = text_to_speech(script)
    print("Audio generated successfully")
    print("*" * 140)
    video_dict = fetch_videos_concurrently(video_description_list)
    video_paths = [
        video[next(iter(video))]
        for prompt, video in video_dict.items()
        if video and next(iter(video)) is not None
    ]
    if None in video_paths:
        video_paths.remove(None)
    print("Videos fetched successfully")
    print(video_paths)
    print("*" * 140)
    final_video_path = create_final_video(
        video_paths=video_paths, audio_path=audio_path
    )
    # import time
    # time.sleep(6)
    # final_video_path="./videos/allah.mp4"
    return final_video_path,script


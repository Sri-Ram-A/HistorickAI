from loguru import logger
from pathlib import Path
import nltk
import re
from nltk.tokenize import word_tokenize
nltk.download('punkt_tab')
nltk.download('averaged_perceptron_tagger_eng')
from typing import List, Dict
from tqdm import tqdm
from moviepy import (VideoFileClip,ImageClip,AudioFileClip,concatenate_videoclips,CompositeVideoClip,TextClip)

from moviepy.video.tools.subtitles import SubtitlesClip
from dotenv import load_dotenv
load_dotenv(".env.local")
from app import AUDIO_DIR,VIDEO_DIR,IMAGE_DIR
from generator.caption.main import generate_caption
from generator.scrape.google_image import get_google_image
from generator.scrape.pexels import get_pexels_video
from generator.llm.cloud import generate_story
# from generator.llm.main import generate_story
from generator.tts.main import text_to_speech
import helper
SIMILARITY_THRESHOLD = 0.2
THREADS = 6 # 4 was working fine
FONT_PATH = r"C:\Windows\Fonts\arial.ttf"

def build_visual_clip(media_path: Path,audio_path: Path,target_size=(1280, 720),) -> CompositeVideoClip:
    """Creates a visual clip (video or image) whose duration exactly matchesthe associated audio file."""
    target_width,target_height = target_size
    audio_clip = AudioFileClip(str(audio_path))
    audio_duration = audio_clip.duration
    logger.debug(f"Loaded audio: {audio_path} Audio duration: {audio_duration:.2f}s")

    if media_path.suffix.lower() in {".mp4", ".mov", ".webm"}:
        logger.debug(f"Using video media: {media_path}")
        clip = VideoFileClip(str(media_path))
        # Trim or loop to match audio duration
        if clip.duration >= audio_duration:
            clip = clip.subclipped(0, audio_duration)
        # else:
        #     clip = clip.loop(duration=audio_duration)
    else:
        logger.debug(f"Using image media: {media_path}")
        clip = ImageClip(str(media_path), duration=audio_duration)

    clip = clip.resized(width=target_width, height=target_height)
    clip = clip.with_audio(audio_clip)
    return clip

def generate_srt(sentences: List[str], audio_paths: List[Path], output_path: Path):
    """Generates an SRT file where each sentence is displayedfor the duration of its audio clip."""
    logger.info("Generating subtitles (SRT)")
    current_time = 0.0
    lines = []

    for idx, (sentence, audio_path) in enumerate(zip(sentences, audio_paths), start=1):
        audio = AudioFileClip(str(audio_path))
        duration = audio.duration
        start = current_time
        end = current_time + duration
        current_time = end
        def fmt(t):
            h = int(t // 3600)
            m = int((t % 3600) // 60)
            s = t % 60
            return f"{h:02}:{m:02}:{s:06.3f}".replace(".", ",")
        lines.append(f"{idx}\n{fmt(start)} --> {fmt(end)}\n{sentence}\n")
        audio.close()

    output_path.write_text("\n".join(lines), encoding="utf-8")
    logger.success(f"Subtitles written to {output_path}")

def create_final_video(
    sentence_data: List[Dict],
    output_path: Path,
    target_size=(1280, 720),
    fps=30,
):
    """Builds the final narrated video with subtitles.
    sentence_data item format:
    {
        "sentence": str,
        "audio_path": Path,
        "media_path": Path,   # video OR image
    }"""

    logger.info(f"Starting final video assembly with {len(sentence_data)} segments")
    clips = []
    audio_paths = []
    sentences = []

    for item in tqdm(sentence_data, desc="Building clips"):
        clip = build_visual_clip(
            media_path=Path(item["media_path"]),
            audio_path=Path(item["audio_path"]),
            target_size=target_size,
        )
        clips.append(clip)
        audio_paths.append(item["audio_path"])
        sentences.append(item["sentence"])

    logger.info("Concatenating visual clips")
    final_video = concatenate_videoclips(clips, method="compose")

    # ---------- SUBTITLES ----------
    srt_path = output_path.with_suffix(".srt")
    generate_srt(sentences, audio_paths, srt_path)

    logger.info("Rendering subtitles")
    def subtitle_generator(txt: str) -> TextClip:
        return TextClip(
            text=txt,
            font=FONT_PATH,          # MUST be a string path
            font_size=32,
            color="white",
            stroke_color="black",
            stroke_width=1,
            method="caption",
            bg_color="black",
            size=(int(final_video.w * 0.9), None),
            text_align="center",
        )
    subtitles = SubtitlesClip(
        subtitles=str(srt_path),
        make_textclip=subtitle_generator,
        encoding="utf-8",
    )

    subtitles = subtitles.with_position(("center", 0.9), relative=True)

    final_composite = CompositeVideoClip([final_video, subtitles])

    logger.info(f"Writing final video to {output_path}")
    final_composite.write_videofile(
        str(output_path),
        codec="libx264",
        threads = THREADS,
        fps=fps,
    )

    # ---------- CLEANUP ----------
    logger.debug("Cleaning up resources")
    for clip in clips:
        clip.close()
    final_video.close()
    final_composite.close()

    logger.success(f"Final video created successfully: {output_path}")

def generate_video(title:str,query: str):
    story: str = generate_story(query)
    sentences_list = [s.strip() for s in story.split('.') if s.strip()]
    sentences = tuple(enumerate(sentences_list))
    sentence_data = list()

    for idx, sentence in sentences:

        # ---------- AUDIO ----------
        safe_name = re.sub(r"[^\w]+", "_", sentence)
        audio_file_path = AUDIO_DIR / f"{idx}_{safe_name}.wav"

        text_to_speech(sentence, str(audio_file_path))

        # ---------- NLP ----------
        clean_sentence = re.sub(r"[^\w\s]", "", sentence)
        words = word_tokenize(clean_sentence)
        pos_tags = nltk.pos_tag(words)
        proper_nouns = [w for w, t in pos_tags if t == "NNP"]

        # ---------- VIDEO ----------
        video_file_path = VIDEO_DIR / f"{idx}_pexels_{query.replace(' ', '_')}.mp4"
        use_image = False
        if len(proper_nouns) > 3:
            logger.info(f"[{idx}] High proper-noun density → using image")
            use_image = True
        else:
            ok = get_pexels_video(sentence, str(video_file_path))
            if not ok or not video_file_path.exists():
                logger.warning(f"[{idx}] Video fetch failed → falling back to image")
                use_image = True
            else:    
                try:
                    frame_path = VIDEO_DIR / f"{idx}_frame.jpg"
                    helper.extract_first_frame(video_file_path, frame_path)

                    caption = generate_caption(frame_path)
                    similarity = helper.sentence_similarity(sentence, caption)

                    logger.info(f"[{idx}] Caption: {caption} | Similarity: {similarity:.3f}")
                    if similarity < SIMILARITY_THRESHOLD:
                        use_image = True
                except Exception as e:
                    logger.warning(f"[{idx}] Frame/caption failed → fallback to image: {e}")
                    use_image = True

        if use_image:
            image_base_path = IMAGE_DIR / f"{idx}_{safe_name}"
            ok, saved_image_path = get_google_image(sentence, str(image_base_path))

            if not ok or not saved_image_path or not Path(saved_image_path).exists():
                logger.error(f"[{idx}] Image fallback failed → skipping segment")
                continue   # 🔥 SKIP THIS SENTENCE ENTIRELY
            media_path = saved_image_path
        else:
            if not video_file_path.exists():
                logger.error(f"[{idx}] Video missing → skipping segment")
                continue
            media_path = video_file_path

        sentence_data.append({
            "sentence": sentence,
            "audio_path": audio_file_path,
            "media_path": media_path
        })

    from pprint import pprint
    pprint(sentence_data)
    create_final_video(
        sentence_data=sentence_data,
        output_path=VIDEO_DIR / f"final_video_{title}.mp4",
    )

if __name__ == "__main__":
    generate_video("IndianIndependence","Explain India's First fight for Independece")
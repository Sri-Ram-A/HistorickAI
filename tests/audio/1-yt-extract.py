# https://andsilvadrcc.medium.com/high-quality-audio-extraction-from-youtube-with-python-1ecb799bf9a3
# https://pypi.org/project/pytubefix/
import sys
import pytubefix
import ffmpeg
from datetime import datetime
from pytubefix.cli import on_progress
from pathlib import Path
# Get the YouTube video URL from command-line arguments
youtube_url = "https://youtu.be/qzq_-plz0bQ?si=F6WSXMvGCiJuxOG7"

# Specify the output file name for the audio
OUTPUT_DIR = Path("audios/")
OUTPUT_DIR.mkdir(exist_ok=True,parents=True)
timestamp = datetime.now().strftime('%Y%m%d%H%M%S')


# Create a YouTube object and fetch the stream URL
print('Downloading audio from youtube...')
yt = pytubefix.YouTube(youtube_url, on_progress_callback=on_progress)

print(type(yt))
print(dir(yt))
print(vars(yt))
print(yt.__dict__)

list(yt.streams)

print('Fetching audio stream...')
stream = yt.streams[0].url  # Get the first available stream (usually audio)

audio_stream = yt.streams.get_audio_only()
if audio_stream:
    audio_stream.download(filename=str(OUTPUT_DIR / timestamp))

print(yt.captions)
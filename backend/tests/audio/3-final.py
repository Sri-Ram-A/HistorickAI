from pytubefix import YouTube
from pathlib import Path

def youtube_to_audio(url: str, output_name: str, output_dir: str | Path= "audios") -> str:
    yt = YouTube(url)
    # pick best audio-only stream
    stream = (
        yt.streams
        .filter(only_audio=True)
        .order_by("abr")   # bitrate
        .desc()
        .first()
    )
    if stream is None:
        raise RuntimeError("No audio stream found")

    output_dir = Path(output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)
    file_path = output_dir / f"{output_name}.mp3"
    stream.download(
        output_path=str(output_dir),
        filename=file_path.name
    )

    return str(file_path.resolve())

audio_path = youtube_to_audio(
    url="https://youtu.be/qzq_-plz0bQ?si=F6WSXMvGCiJuxOG7",
    output_name="dashboard",
    output_dir="audios"
)

print(audio_path)

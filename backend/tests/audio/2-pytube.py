# https://pypi.org/project/pytube/ 
from pytube import YouTube
from pytube.cli import on_progress
url = "https://youtu.be/qzq_-plz0bQ?si=F6WSXMvGCiJuxOG7"
yt = YouTube(url=url, on_progress_callback=on_progress)
yt.streams \
.filter(progressive=True, file_extension='mp4')  \
.order_by('resolution') \
.desc() \
.first() \
.download()

# Below code works fine
# youtube-to-audio --url "https://youtu.be/qzq_-plz0bQ?si=F6WSXMvGCiJuxOG7" --output_name "dashboard" 
from docling.document_converter import DocumentConverter
source = r"C:\Users\SriRam.A\Documents\sr_proj\HistorickAI\backend\tests\audio\audios\dashboard.mp3"
converter = DocumentConverter()
doc = converter.convert(source).document
print(doc.export_to_markdown())
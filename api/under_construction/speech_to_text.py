from vosk import Model, KaldiRecognizer
import pyaudio
import os
import json
# https://youtu.be/3Mga7_8bYpw?feature=shared
base_path = os.path.dirname(os.path.abspath(__file__))
model_path = os.path.join(base_path, "vosk-model", "vosk-model-small-en-in-0.4")
if not os.path.exists(model_path):
    raise FileNotFoundError(f"Model not found at {model_path}")

model = Model(model_path)
recognizer = KaldiRecognizer(model, 16000)
mic = pyaudio.PyAudio()
stream = mic.open( format=pyaudio.paInt16, channels=1, rate=16000, input=True, frames_per_buffer=4096)

print("Speak now... (Press Ctrl+C to stop)")

try:
    while True:
        data = stream.read(4096)
        if len(data) == 0:
            break  # No data
        
        if recognizer.AcceptWaveform(data):
            result = json.loads(recognizer.Result())
            print("Final:", result["text"])
        else:
            partial = json.loads(recognizer.PartialResult())
            print("Partial:", partial["partial"], end="\r")  # Overwrite line

except KeyboardInterrupt:
    print("\nStopping...")
finally:
    stream.stop_stream()
    stream.close()
    mic.terminate()
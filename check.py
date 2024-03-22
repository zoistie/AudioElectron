import speech_recognition as sr
from os import path
import sys

def transcribe():
    AUDIO_FILE = path.join(path.dirname(path.realpath(__file__)), "audio.wav")

    r = sr.Recognizer()
    with sr.AudioFile(AUDIO_FILE) as source:
        audio = r.record(source)

    try:
        # Return the recognized text
        return r.recognize_sphinx(audio)
    except sr.UnknownValueError:
        return "Sphinx could not understand audio"
    except sr.RequestError as e:
        return f"Sphinx error; {e}"

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == 'transcribe':
        result = transcribe()
        print(result)  # Print the result for the Node.js script to capture

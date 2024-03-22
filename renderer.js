import { WavAudioEncoder } from './WavAudioEncoder.js';
// Get the necessary DOM elements
const startButton = document.getElementById('start');
const stopButton = document.getElementById('stop');
const audioElement = document.getElementById('audioElement');

let mediaRecorder; // MediaRecorder object to handle recording

const startRecording = async () => {
  console.log('Recording started');
  const chunks = [];
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  mediaRecorder = new MediaRecorder(stream);
  mediaRecorder.ondataavailable = (event) => {
    chunks.push(event.data);
  };
  mediaRecorder.onstop = () => {
    const blob = new Blob(chunks);
    const ac = new AudioContext();
    // Convert Blob to buffer
    blob
      .arrayBuffer()
      .then(async (buffer) => {
        const audioBuffer = await ac.decodeAudioData(buffer);
        const wav = new WavAudioEncoder({
          numberOfChannels: audioBuffer.numberOfChannels,
          sampleRate: ac.sampleRate,
        });
        wav.write(audioBuffer);
        const data = await wav.encode();
        await ac.close();

        const audioUrl = URL.createObjectURL(data);
        const audioElement = document.getElementById('audioElement');
        audioElement.src = audioUrl;
        window.sendAudioToMain.send(await data.arrayBuffer());
      })
      .catch((error) => {
        console.error('Error converting Blob to buffer:', error);
      });
  };
  mediaRecorder.start();
};

// Function to stop recording
const stopRecording = () => {
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop();
    console.log('Recording stopped');
  }
};

// Event listeners for start and stop buttons
startButton.addEventListener('click', startRecording);
stopButton.addEventListener('click', stopRecording);

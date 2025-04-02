let audioCtx;
let noiseSource, droneSource, filter, gainNode, reverb, reverbGain;
let isPlaying = false;

const startButton = document.getElementById("startButton");
const stopButton = document.getElementById("stopButton");
const reverbSlider = document.getElementById("reverbSlider");

startButton.addEventListener("click", startAudio);
stopButton.addEventListener("click", stopAudio);
reverbSlider.addEventListener("input", updateReverb);
document.addEventListener("mousemove", changeSound);

function initAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    console.log("Audio context initialized");
  }
}

async function startAudio() {
  initAudioContext(); // Ensure audio context is created
  if (isPlaying) return;
  isPlaying = true;

  console.log("Starting audio...");

  // Create master gain
  gainNode = audioCtx.createGain();
  gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);

  // Create filter
  filter = audioCtx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(800, audioCtx.currentTime);

  // Create reverb
  reverb = audioCtx.createConvolver();
  reverbGain = audioCtx.createGain();
  reverbGain.gain.setValueAtTime(
    parseFloat(reverbSlider.value),
    audioCtx.currentTime
  );

  await loadReverbImpulse(); // Load impulse response for reverb

  createNoise();
  createDrone();

  console.log("Audio started.");
}

function stopAudio() {
  if (!isPlaying) return;
  isPlaying = false;

  console.log("Stopping audio...");

  if (noiseSource) {
    noiseSource.stop();
    noiseSource.disconnect();
    noiseSource = null;
  }
  if (droneSource) {
    droneSource.stop();
    droneSource.disconnect();
    droneSource = null;
  }

  console.log("Audio stopped.");
}

function createNoise() {
  console.log("Creating noise...");

  const bufferSize = 2 * audioCtx.sampleRate;
  const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const output = noiseBuffer.getChannelData(0);

  for (let i = 0; i < bufferSize; i++) {
    output[i] = Math.random() * 2 - 1; // White noise
  }

  noiseSource = audioCtx.createBufferSource();
  noiseSource.buffer = noiseBuffer;
  noiseSource.loop = true;

  noiseSource.connect(filter);
  filter.connect(reverb);
  reverb.connect(reverbGain);
  reverbGain.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  noiseSource.start();
  console.log("Noise started.");
}

function createDrone() {
  console.log("Creating drone...");

  droneSource = audioCtx.createOscillator();
  droneSource.type = "sine";
  droneSource.frequency.setValueAtTime(100, audioCtx.currentTime);

  droneSource.connect(filter);
  filter.connect(reverb);
  reverb.connect(reverbGain);
  reverbGain.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  droneSource.start();
  console.log("Drone started.");
}

async function loadReverbImpulse() {
  try {
    console.log("Loading reverb impulse...");
    const response = await fetch("your-impulse-response.wav"); // Replace with actual impulse response
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
    reverb.buffer = audioBuffer;
    console.log("Reverb loaded.");
  } catch (error) {
    console.warn("Reverb impulse failed to load, using dry signal.");
  }
}

function updateReverb() {
  if (reverbGain) {
    reverbGain.gain.setValueAtTime(
      parseFloat(reverbSlider.value),
      audioCtx.currentTime
    );
  }
}

function changeSound(event) {
  if (filter) {
    let freq = 200 + (event.clientX / window.innerWidth) * 1000;
    filter.frequency.setValueAtTime(freq, audioCtx.currentTime);
    console.log(`Filter frequency changed: ${freq}`);
  }
}

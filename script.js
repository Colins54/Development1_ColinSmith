let audioCtx, oscillator, gainNode, convolver, reverbGain;
let isPlaying = false;

document.getElementById("start").addEventListener("click", () => {
  if (!isPlaying) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    oscillator = audioCtx.createOscillator();
    gainNode = audioCtx.createGain();
    convolver = audioCtx.createConvolver();
    reverbGain = audioCtx.createGain();

    // Set up sine wave
    oscillator.type = "sine";
    oscillator.frequency.value = 440;

    // Generate a simple impulse response for reverb
    function createReverbBuffer(audioCtx) {
      let length = audioCtx.sampleRate * 2;
      let impulse = audioCtx.createBuffer(2, length, audioCtx.sampleRate);
      for (let channel = 0; channel < 2; channel++) {
        let impulseData = impulse.getChannelData(channel);
        for (let i = 0; i < length; i++) {
          impulseData[i] = (Math.random() * 2 - 1) * (1 - i / length);
        }
      }
      return impulse;
    }

    convolver.buffer = createReverbBuffer(audioCtx);

    // Connect nodes
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    gainNode.connect(convolver);
    convolver.connect(reverbGain);
    reverbGain.connect(audioCtx.destination);

    // Start the oscillator
    oscillator.start();
    isPlaying = true;
  }
});

document.getElementById("stop").addEventListener("click", () => {
  if (isPlaying) {
    oscillator.stop();
    audioCtx.close();
    isPlaying = false;
  }
});

document.addEventListener("mousemove", (event) => {
  if (isPlaying) {
    let frequency = 100 + (event.clientY / window.innerHeight) * 900;
    oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime);

    // Change background color based on frequency
    const colors = [
      "#ff0000",
      "#ff7f00",
      "#ffff00",
      "#00ff00",
      "#0000ff",
      "#4b0082",
      "#9400d3",
    ];
    let index = Math.floor(((frequency - 100) / 900) * (colors.length - 1));
    document.body.style.backgroundColor = colors[index];
  }
});

document.getElementById("reverb").addEventListener("input", (event) => {
  if (isPlaying) {
    reverbGain.gain.value = event.target.value;
  }
});

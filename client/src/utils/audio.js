// Web Audio API Alarm Sound Synthesizer
let audioCtx = null;
let currentOscillator = null;
let currentGainNode = null;

export const playAlarmSound = () => {
  if (currentOscillator) return; // Already playing

  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  
  // Create Oscillator & Gain nodes
  currentOscillator = audioCtx.createOscillator();
  currentGainNode = audioCtx.createGain();

  currentOscillator.type = 'sine';
  currentOscillator.frequency.setValueAtTime(440, audioCtx.currentTime); // 440Hz (A4)
  
  // Progressive Volume Ramp-Up (starts soft at 0.05, increases to 0.5 over 10s)
  currentGainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
  currentGainNode.gain.exponentialRampToValueAtTime(0.5, audioCtx.currentTime + 10);

  // Beeping pulsing effect
  const lfo = audioCtx.createOscillator();
  lfo.frequency.value = 2; // 2Hz pulse rate
  const lfoGain = audioCtx.createGain();
  lfoGain.gain.value = 0.2;
  lfo.connect(lfoGain);

  currentOscillator.connect(currentGainNode);
  currentGainNode.connect(audioCtx.destination);

  currentOscillator.start();
};

export const stopAlarmSound = () => {
  if (currentOscillator) {
    try {
      currentOscillator.stop();
      currentOscillator.disconnect();
    } catch (e) {
      console.error('Error stopping oscillator:', e);
    }
    currentOscillator = null;
  }

  if (audioCtx) {
    try {
      audioCtx.close();
    } catch (e) {
      console.error('Error closing audio context:', e);
    }
    audioCtx = null;
  }
};

/* ==========================================================================
   AUDIO CONTROLLER & SYNTHESIZER (PROCEDURAL WEB AUDIO API)
   ========================================================================== */

let audioCtx = null;
let isAudioPlaying = false;
let oscNode1 = null;
let oscNode2 = null;
let gainNode = null;

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function playSound(type) {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    if (type === 'click') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(850, now);
      osc.frequency.exponentialRampToValueAtTime(420, now + 0.045);
      gain.gain.setValueAtTime(0.07, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.045);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.045);
    } else if (type === 'whoosh') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(260, now);
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.18);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.18);
    }
  } catch (e) {}
}

export function toggleAmbientAudio(btnElement) {
  playSound('click');

  if (!isAudioPlaying) {
    try {
      const ctx = getAudioContext();

      oscNode1 = ctx.createOscillator();
      oscNode2 = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      gainNode = ctx.createGain();

      oscNode1.type = 'sine';
      oscNode1.frequency.setValueAtTime(174, ctx.currentTime);

      oscNode2.type = 'triangle';
      oscNode2.frequency.setValueAtTime(261.63, ctx.currentTime);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(650, ctx.currentTime);

      gainNode.gain.setValueAtTime(0.001, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.045, ctx.currentTime + 1.2);

      oscNode1.connect(filter);
      oscNode2.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscNode1.start();
      oscNode2.start();

      isAudioPlaying = true;
      btnElement?.classList.add('playing');
    } catch (err) {
      console.warn('AudioContext error', err);
    }
  } else {
    if (gainNode && audioCtx) {
      gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.5);
      setTimeout(() => {
        try {
          oscNode1?.stop();
          oscNode2?.stop();
          oscNode1?.disconnect();
          oscNode2?.disconnect();
        } catch (e) {}
      }, 550);
    }
    isAudioPlaying = false;
    btnElement?.classList.remove('playing');
  }
}

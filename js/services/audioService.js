/**
 * Audio service
 * ---------------
 * Drives the small music-note toggle in the header. Two tiers, in order
 * of preference:
 *
 *  1. If EOLConfig.assets.themeMusic actually exists, loop that file.
 *     Drop a royalty-free/your-own track at that path and it's used
 *     automatically - no code change.
 *  2. Otherwise, fall back to a short *original* synthesized loop so the
 *     "background music" feature works out of the box. This is generated
 *     entirely in-browser with the Web Audio API (a simple square-wave
 *     arpeggio) - it does not reproduce any existing composition or
 *     recognizable system sound, intentionally: a real OS startup jingle
 *     is a copyrighted/trademarked asset, and this store's own branding
 *     is explicit about not being a Microsoft product.
 *
 * Browsers block audio autoplay until a user gesture, so playback only
 * ever starts from the toggle button's click handler - that click *is*
 * the gesture.
 */
const AudioService = (function () {
  let mediaEl = null;
  let audioCtx = null;
  let loopSource = null;
  let gainNode = null;
  let playing = false;
  let useFallbackSynth = false;

  function init() {
    if (mediaEl) return;
    mediaEl = new Audio();
    mediaEl.loop = true;
    mediaEl.preload = "none";
    mediaEl.src = EOLConfig.assets.themeMusic;
  }

  /** Renders ~2.4s of an original square-wave arpeggio into a loopable buffer. */
  async function buildFallbackLoopBuffer(ctx) {
    const notes = [523.25, 659.25, 783.99, 1046.5, 783.99, 659.25]; // C5 E5 G5 C6 G5 E5
    const noteDuration = 0.32;
    const total = notes.length * noteDuration;
    const offline = new OfflineAudioContext(1, Math.ceil(total * ctx.sampleRate), ctx.sampleRate);

    notes.forEach((freq, i) => {
      const start = i * noteDuration;
      const osc = offline.createOscillator();
      osc.type = "square";
      osc.frequency.value = freq;

      const env = offline.createGain();
      env.gain.setValueAtTime(0, start);
      env.gain.linearRampToValueAtTime(0.18, start + 0.02);
      env.gain.linearRampToValueAtTime(0.0001, start + noteDuration * 0.9);

      osc.connect(env);
      env.connect(offline.destination);
      osc.start(start);
      osc.stop(start + noteDuration);
    });

    return offline.startRendering();
  }

  async function startFallbackSynth() {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === "suspended") await audioCtx.resume();

    const buffer = await buildFallbackLoopBuffer(audioCtx);
    loopSource = audioCtx.createBufferSource();
    loopSource.buffer = buffer;
    loopSource.loop = true;

    gainNode = audioCtx.createGain();
    gainNode.gain.value = 0.5;

    loopSource.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    loopSource.start(0);
    useFallbackSynth = true;
  }

  function stopFallbackSynth() {
    if (loopSource) {
      try { loopSource.stop(); } catch (e) { /* already stopped */ }
      loopSource.disconnect();
      loopSource = null;
    }
    if (gainNode) {
      gainNode.disconnect();
      gainNode = null;
    }
  }

  async function play() {
    init();
    try {
      await mediaEl.play();
      useFallbackSynth = false;
    } catch (err) {
      // Missing/blocked file - fall back to the synthesized loop instead
      // of leaving the toggle silently doing nothing.
      await startFallbackSynth();
    }
    playing = true;
    try { localStorage.setItem(EOLConfig.storageKeys.audioEnabled, "1"); } catch (e) { /* ignore */ }
  }

  function pause() {
    if (mediaEl && !useFallbackSynth) mediaEl.pause();
    if (useFallbackSynth) stopFallbackSynth();
    playing = false;
    try { localStorage.setItem(EOLConfig.storageKeys.audioEnabled, "0"); } catch (e) { /* ignore */ }
  }

  async function toggle() {
    if (playing) pause();
    else await play();
    return playing;
  }

  function isEnabled() {
    return playing;
  }

  return { init, toggle, isEnabled };
})();

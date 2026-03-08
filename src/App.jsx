import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const clubLogoUrl =
  "https://media.licdn.com/dms/image/v2/D560BAQEHrjcv_BzAgA/company-logo_200_200/B56Zixe0DJHUAI-/0/1755324306327?e=2147483647&t=nHjmQJlRXZFIj2YJPlGFTWT4SQq94BMGoooTFleO7es&v=beta";

const easyImageModules = import.meta.glob("./assets/e*.png", {
  eager: true,
  import: "default"
});

export default function App() {
  const [mode, setMode] = useState("easy");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const stopShuffleSoundRef = useRef(null);
  const revealTimerRef = useRef(null);

  const startShuffleSound = () => {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) {
      return () => {};
    }

    const audioContext = new AudioContextClass();
    const masterGain = audioContext.createGain();
    masterGain.gain.setValueAtTime(1, audioContext.currentTime);
    masterGain.connect(audioContext.destination);

    let beatTimer = null;
    let isStopping = false;
    const startedAt = performance.now();
    const totalDurationMs = 7000;

    const playBeat = (frequency = 70, attack = 0.01, decay = 0.16, gainLevel = 0.18) => {
      if (isStopping) {
        return;
      }

      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(frequency, audioContext.currentTime);
      gain.gain.setValueAtTime(0.0001, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(gainLevel, audioContext.currentTime + attack);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + decay);

      osc.connect(gain);
      gain.connect(masterGain);

      osc.start();
      osc.stop(audioContext.currentTime + decay + 0.02);
    };

    const playHeartbeat = () => {
      if (isStopping) {
        return;
      }

      const elapsed = performance.now() - startedAt;
      const tension = Math.min(elapsed / totalDurationMs, 1);

      const firstFreq = 62 + tension * 28;
      const secondFreq = 70 + tension * 36;
      const firstGain = 0.14 + tension * 0.2;
      const secondGain = 0.12 + tension * 0.18;
      const firstDecay = 0.18 - tension * 0.05;
      const secondDecay = 0.14 - tension * 0.04;
      const lubDubGap = 170 - tension * 45;
      const cycleGap = 920 - tension * 360;

      // Lub-dub pattern with increasing intensity and tempo.
      playBeat(firstFreq, 0.009, firstDecay, firstGain);
      setTimeout(
        () => playBeat(secondFreq, 0.007, secondDecay, secondGain),
        lubDubGap
      );

      beatTimer = setTimeout(playHeartbeat, cycleGap);
    };

    playHeartbeat();

    return () => {
      if (isStopping) {
        return;
      }
      isStopping = true;

      if (beatTimer) {
        clearTimeout(beatTimer);
        beatTimer = null;
      }

      const now = audioContext.currentTime;
      masterGain.gain.cancelScheduledValues(now);
      masterGain.gain.setValueAtTime(masterGain.gain.value, now);
      masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);

      setTimeout(() => {
        audioContext.close();
      }, 320);
    };
  };

  useEffect(() => {
    return () => {
      if (revealTimerRef.current) {
        clearTimeout(revealTimerRef.current);
      }
      if (stopShuffleSoundRef.current) {
        stopShuffleSoundRef.current();
      }
    };
  }, []);

  const handleModeChange = (nextMode) => {
    setMode(nextMode);
    setImage(null);
    setLoading(false);

    if (revealTimerRef.current) {
      clearTimeout(revealTimerRef.current);
      revealTimerRef.current = null;
    }

    if (stopShuffleSoundRef.current) {
      stopShuffleSoundRef.current();
      stopShuffleSoundRef.current = null;
    }
  };

  const startGame = () => {
    setLoading(true);

    if (stopShuffleSoundRef.current) {
      stopShuffleSoundRef.current();
    }
    stopShuffleSoundRef.current = startShuffleSound();

    revealTimerRef.current = setTimeout(() => {
      let random = null;

      if (mode === "hard") {
        const randomNumber = Math.floor(Math.random() * 25) + 1;
        random = `/h${randomNumber}.png`;
      } else {
        const randomNumber = Math.floor(Math.random() * 20) + 1;
        random = easyImageModules[`./assets/e${randomNumber}.png`] ?? null;
      }

      setImage(random);
      setLoading(false);
      if (stopShuffleSoundRef.current) {
        stopShuffleSoundRef.current();
        stopShuffleSoundRef.current = null;
      }
      revealTimerRef.current = null;
    }, 7000);
  };

  return (
    <div className="page-wrap">
      <div className="orb orb-a" />
      <div className="orb orb-b" />

      <div className="container">
        <header className="hero">
          <p className="eyebrow">Vulcanzy 2026</p>
          <div className="title-row">
            <img className="club-logo" src={clubLogoUrl} alt="Coding Club logo" />
            <h1>Prompt Craft Challenge</h1>
          </div>
          <p className="subtitle">
            THE ART OF TALKING TO AI.
          </p>
        </header>

        <div className="mode-toggle">
          <button
            className={mode === "easy" ? "active" : ""}
            onClick={() => handleModeChange("easy")}
          >
            Easy Mode
          </button>

          <button
            className={mode === "hard" ? "active" : ""}
            onClick={() => handleModeChange("hard")}
          >
            Hard Mode
          </button>
        </div>

        <div className="meta-row">
          <span className="chip">Current: {mode}</span>
        </div>

        <div className="image-area">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loading"
                animate={{ rotate: 360, scale: [1, 1.08, 1] }}
                transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
                className="loading"
              >
                Shuffling...
              </motion.div>
            ) : image ? (
              <motion.img
                key={image}
                initial={{ opacity: 0, scale: 0.78, filter: "blur(12px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
                transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
                src={image}
                alt="challenge image"
              />
            ) : (
              <motion.p
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="placeholder"
              >
                Press Start to reveal your first image
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        <button className="start-btn" onClick={startGame} disabled={loading}>
          {loading ? "Loading..." : "Start Challenge"}
        </button>
      </div>
    </div>
  );
}

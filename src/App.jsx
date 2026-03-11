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
  const [imageNumber, setImageNumber] = useState(null);
  const [loading, setLoading] = useState(false);
  const revealTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (revealTimerRef.current) {
        clearTimeout(revealTimerRef.current);
      }
    };
  }, []);

  const handleModeChange = (nextMode) => {
    setMode(nextMode);
    setImage(null);
    setImageNumber(null);
    setLoading(false);

    if (revealTimerRef.current) {
      clearTimeout(revealTimerRef.current);
      revealTimerRef.current = null;
    }
  };

  const startGame = () => {
    setLoading(true);
    setImageNumber(null);

    revealTimerRef.current = setTimeout(() => {
      let random = null;
      let randomNumber = null;

      if (mode === "hard") {
        randomNumber = Math.floor(Math.random() * 25) + 1;
        random = `/h${randomNumber}.png`;
      } else {
        randomNumber = Math.floor(Math.random() * 20) + 1;
        random = easyImageModules[`./assets/e${randomNumber}.png`] ?? null;
      }

      setImage(random);
      setImageNumber(randomNumber);
      setLoading(false);
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
                className="shuffle-loader"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <div className="shuffle-track" aria-hidden="true">
                  {[0, 1, 2, 3, 4].map((item) => (
                    <motion.span
                      key={`shuffle-card-${item}`}
                      className="shuffle-card"
                      animate={{
                        y: ["115%", "0%", "-115%"],
                        opacity: [0, 1, 0],
                        scale: [0.86, 1, 0.86]
                      }}
                      transition={{
                        duration: 1.25,
                        repeat: Infinity,
                        ease: [0.33, 1, 0.68, 1],
                        delay: item * 0.16
                      }}
                    >
                      {mode === "hard" ? "H" : "E"}
                    </motion.span>
                  ))}
                </div>
                <p>Shuffling images...</p>
              </motion.div>
            ) : image ? (
              <motion.div
                key={image}
                className="image-frame"
                initial={{ opacity: 0, scale: 0.78, filter: "blur(12px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
                transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
              >
                <img src={image} alt="challenge image" />
                {imageNumber !== null ? (
                  <span className="image-number">#{imageNumber}</span>
                ) : null}
              </motion.div>
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

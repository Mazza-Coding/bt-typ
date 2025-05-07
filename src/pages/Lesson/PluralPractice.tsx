import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import styles from "./SpellingPractice.module.css"; // Reusing existing styles

// Type definitions
interface WordItem {
  singular: string;
  plural: string;
  english: string;
  audioSingularPath: string;
  audioPluralPath: string;
}

interface PluralPracticeProps {
  title?: string;
  words?: WordItem[];
  backPath?: string;
  backText?: string;
}

// Default words for Plural Practice
const defaultWords: WordItem[] = [
  {
    singular: "okno",
    plural: "okna",
    english: "window(s)",
    audioSingularPath: "/audio/lesson1/okno.mp3",
    audioPluralPath: "/audio/lesson1/okna.mp3",
  },
  {
    singular: "pióro",
    plural: "pióra",
    english: "pen(s)",
    audioSingularPath: "/audio/lesson1/pioro.mp3",
    audioPluralPath: "/audio/lesson1/piora.mp3",
  },
  {
    singular: "pudełko",
    plural: "pudełka",
    english: "box(es)",
    audioSingularPath: "/audio/lesson1/pudelko.mp3",
    audioPluralPath: "/audio/lesson1/pudelka.mp3",
  },
  {
    singular: "morze",
    plural: "morza",
    english: "sea(s)",
    audioSingularPath: "/audio/lesson1/morze.mp3",
    audioPluralPath: "/audio/lesson1/morza.mp3",
  },
  {
    singular: "pole",
    plural: "pola",
    english: "field(s)",
    audioSingularPath: "/audio/lesson1/pole.mp3",
    audioPluralPath: "/audio/lesson1/pola.mp3",
  },
  {
    singular: "dziecko",
    plural: "dzieci",
    english: "child(ren)",
    audioSingularPath: "/audio/lesson1/dziecko.mp3",
    audioPluralPath: "/audio/lesson1/dzieci.mp3",
  },
];

// Polish special characters for the keyboard
const specialCharacters = ["ą", "ć", "ę", "ł", "ń", "ó", "ś", "ź", "ż"];

const PluralPractice = (props: PluralPracticeProps) => {
  // Determine props
  const title = props.title || "Plural Practice: Neuter Nouns";
  const words = props.words || defaultWords;
  const backPath = props.backPath || "/lesson/1";
  const backText = props.backText || "← Back to lesson";

  // States for tracking practice progress
  const [currentIndex, setCurrentIndex] = useState(0);
  const [practiceWords, setPracticeWords] = useState<WordItem[]>([]);
  const [input, setInput] = useState("");
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [feedback, setFeedback] = useState("");
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [complete, setComplete] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const feedbackAudioRef = useRef<HTMLAudioElement | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const autoProgressTimerRef = useRef<number | null>(null);

  // Initialize practice with shuffled words
  useEffect(() => {
    const shuffled = [...words].sort(() => Math.random() - 0.5);
    setPracticeWords(shuffled);
  }, [words]);

  // Focus input field when current word changes
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }

    // Auto-play singular audio when a new word is presented
    if (practiceWords.length > 0 && currentIndex < practiceWords.length) {
      playAudio(
        `singular-${practiceWords[currentIndex].singular}`,
        practiceWords[currentIndex].audioSingularPath
      );
    }

    return () => {
      if (autoProgressTimerRef.current) {
        clearTimeout(autoProgressTimerRef.current);
        autoProgressTimerRef.current = null;
      }
    };
  }, [currentIndex, practiceWords.length]);

  // Clean up timers when component unmounts
  useEffect(() => {
    return () => {
      if (autoProgressTimerRef.current) {
        clearTimeout(autoProgressTimerRef.current);
      }
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const insertSpecialCharacter = (char: string) => {
    setInput((prev) => prev + char);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Normalize input and correct answer for comparison (lowercase, no punctuation)
    const normalizedInput = input.toLowerCase().trim();
    const normalizedAnswer = practiceWords[currentIndex].plural
      .toLowerCase()
      .trim();

    const correct = normalizedInput === normalizedAnswer;
    setIsCorrect(correct);
    setSubmitted(true);

    if (correct) {
      setFeedback(
        `Correct! The plural of "${practiceWords[currentIndex].singular}" is "${practiceWords[currentIndex].plural}".`
      );
      playFeedbackSound(true);

      // Play the plural audio when correct
      setTimeout(() => {
        playAudio(
          `plural-${practiceWords[currentIndex].plural}`,
          practiceWords[currentIndex].audioPluralPath
        );
      }, 1000);
    } else {
      setFeedback(
        `Not quite. The plural of "${practiceWords[currentIndex].singular}" is "${practiceWords[currentIndex].plural}".`
      );
      playFeedbackSound(false);

      // Play the correct plural audio after a delay
      setTimeout(() => {
        playAudio(
          `plural-${practiceWords[currentIndex].plural}`,
          practiceWords[currentIndex].audioPluralPath
        );
      }, 1000);
    }

    // Set timer to automatically progress after showing feedback
    autoProgressTimerRef.current = window.setTimeout(() => {
      goToNextWord();
    }, 3000); // 3 seconds delay before continuing
  };

  const goToNextWord = () => {
    // Clear any existing auto-progress timer
    if (autoProgressTimerRef.current) {
      clearTimeout(autoProgressTimerRef.current);
      autoProgressTimerRef.current = null;
    }

    setInput("");
    setIsCorrect(null);
    setFeedback("");
    setSubmitted(false);

    if (currentIndex < practiceWords.length - 1) {
      // Move to the next word
      setCurrentIndex(currentIndex + 1);
    } else {
      // All words completed
      setComplete(true);
    }
  };

  // Play audio function
  const playAudio = (wordId: string, audioPath: string) => {
    // Set the currently playing audio for the UI
    setPlayingAudio(wordId);

    // If we have an existing audio element, pause it
    if (audioRef.current) {
      audioRef.current.pause();
    }

    // Create a new audio element
    const audio = new Audio(audioPath);
    audioRef.current = audio;

    // For mobile compatibility: set attributes before playing
    audio.setAttribute("playsinline", "true");
    audio.volume = 1.0;

    // Play the audio and update state when finished
    const playPromise = audio.play();

    if (playPromise !== undefined) {
      playPromise.catch((error) => {
        console.error("Error playing audio:", error);
        // Try to resume audio context if suspended (common on iOS)
        if (typeof window !== "undefined" && window.AudioContext) {
          try {
            const audioContext = new (window.AudioContext ||
              (window as any).webkitAudioContext)();
            if (audioContext.state === "suspended") {
              audioContext.resume();
              // Try playing again after resuming context
              audio.play().catch((e) => {
                console.error("Second attempt error:", e);
                setTimeout(() => setPlayingAudio(null), 500);
              });
            } else {
              setTimeout(() => setPlayingAudio(null), 500);
            }
          } catch (e) {
            console.error("AudioContext error:", e);
            setTimeout(() => setPlayingAudio(null), 500);
          }
        } else {
          setTimeout(() => setPlayingAudio(null), 500);
        }
      });
    }

    audio.onended = () => {
      setPlayingAudio(null);
    };
  };

  // Play feedback sounds
  const playFeedbackSound = (isCorrect: boolean) => {
    // If there's already feedback audio playing, stop it
    if (feedbackAudioRef.current) {
      feedbackAudioRef.current.pause();
    }

    // Determine which feedback sound to play
    const audioPath = isCorrect
      ? "/audio/feedback/correct.mp3"
      : "/audio/feedback/wrong.mp3";

    // Create and play the feedback audio
    const audio = new Audio(audioPath);
    feedbackAudioRef.current = audio;

    // For mobile compatibility: set attributes before playing
    audio.setAttribute("playsinline", "true");
    audio.volume = 1.0;

    // Play the audio and handle errors
    const playPromise = audio.play();

    if (playPromise !== undefined) {
      playPromise.catch((error) => {
        console.error("Error playing feedback sound:", error);
        // Try to resume audio context if suspended (common on iOS)
        if (typeof window !== "undefined" && window.AudioContext) {
          try {
            const audioContext = new (window.AudioContext ||
              (window as any).webkitAudioContext)();
            if (audioContext.state === "suspended") {
              audioContext.resume();
              // Try playing again after resuming context
              audio.play().catch((e) => {
                console.error("Second attempt feedback error:", e);
              });
            }
          } catch (e) {
            console.error("AudioContext error in feedback:", e);
          }
        }
      });
    }
  };

  // Restart the exercise
  const restartExercise = () => {
    setCurrentIndex(0);
    setInput("");
    setIsCorrect(null);
    setFeedback("");
    setComplete(false);
    setSubmitted(false);

    const shuffled = [...words].sort(() => Math.random() - 0.5);
    setPracticeWords(shuffled);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Link to={backPath} className={styles.backButton}>
          {backText}
        </Link>
        <h1>{title}</h1>
        <p className={styles.instruction}>
          Type the plural form for each singular neuter noun shown.
        </p>
        <div className={styles.progress}>
          <div
            className={styles.progressBar}
            style={{
              width:
                practiceWords.length <= 1
                  ? `${currentIndex * 100}%` // 0% or 100%
                  : `${Math.min(
                      100,
                      (currentIndex / (practiceWords.length - 1)) * 100
                    )}%`,
            }}
          ></div>
        </div>
      </header>

      {complete ? (
        <div className={styles.completeScreen}>
          <h2>Practice Complete! 🎉</h2>
          <p>Great job mastering the plural forms of neuter nouns!</p>
          <div className={styles.actionButtons}>
            <button className={styles.primaryButton} onClick={restartExercise}>
              Practice Again
            </button>
            <Link to={backPath} className={styles.secondaryButton}>
              Return to Lesson
            </Link>
          </div>
        </div>
      ) : practiceWords.length > 0 ? (
        <div className={styles.practiceSection}>
          <div className={styles.wordCard}>
            <div className={styles.englishPrompt}>
              <span className={styles.englishLabel}>Singular:</span>
              <span className={styles.englishWord}>
                {practiceWords[currentIndex].singular}
              </span>
              <button
                className={styles.audioButton}
                onClick={() =>
                  playAudio(
                    `singular-${practiceWords[currentIndex].singular}`,
                    practiceWords[currentIndex].audioSingularPath
                  )
                }
                aria-label={`Listen to pronunciation of ${practiceWords[currentIndex].singular}`}
              >
                {playingAudio ===
                `singular-${practiceWords[currentIndex].singular}` ? (
                  <span className={styles.playingIcon}>🔊</span>
                ) : (
                  <span className={styles.playIcon}>🔈</span>
                )}
              </button>
            </div>

            <p
              className={styles.englishPrompt}
              style={{ marginTop: "0.5rem", fontSize: "0.9rem", color: "#666" }}
            >
              ({practiceWords[currentIndex].english})
            </p>

            <form onSubmit={handleSubmit} className={styles.inputForm}>
              <div className={styles.inputWrapper}>
                <span className={styles.polishLabel}>Plural:</span>
                <input
                  type="text"
                  value={input}
                  onChange={handleInputChange}
                  placeholder="Type the plural form"
                  className={styles.spellingInput}
                  ref={inputRef}
                  disabled={submitted}
                  autoFocus
                />
              </div>

              {!submitted && (
                <button
                  type="submit"
                  className={styles.checkButton}
                  disabled={!input.trim()}
                >
                  Check Answer
                </button>
              )}
            </form>

            <div className={styles.specialCharacters}>
              {specialCharacters.map((char) => (
                <button
                  key={char}
                  className={styles.charButton}
                  onClick={() => insertSpecialCharacter(char)}
                  disabled={submitted}
                >
                  {char}
                </button>
              ))}
            </div>

            {submitted && (
              <div
                className={
                  isCorrect ? styles.successFeedback : styles.errorFeedback
                }
              >
                <span className={styles.feedbackIcon}>
                  {isCorrect ? "✓" : "✗"}
                </span>
                {feedback}

                {/* Audio button for the plural form */}
                <button
                  className={styles.audioButton}
                  style={{ marginLeft: "0.5rem" }}
                  onClick={() =>
                    playAudio(
                      `plural-${practiceWords[currentIndex].plural}`,
                      practiceWords[currentIndex].audioPluralPath
                    )
                  }
                  aria-label={`Listen to pronunciation of ${practiceWords[currentIndex].plural}`}
                >
                  {playingAudio ===
                  `plural-${practiceWords[currentIndex].plural}` ? (
                    <span className={styles.playingIcon}>🔊</span>
                  ) : (
                    <span className={styles.playIcon}>🔈</span>
                  )}
                </button>
              </div>
            )}
          </div>

          <div className={styles.progressCounter}>
            <div className={styles.wordCount}>
              Word {currentIndex + 1} of {practiceWords.length}
            </div>
          </div>
        </div>
      ) : (
        <div className={styles.loading}>Loading practice...</div>
      )}
    </div>
  );
};

export default PluralPractice;

import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import styles from "./SpellingPractice.module.css";
// @ts-ignore
import { Howl } from "howler";

// Audio cache to prevent creating multiple instances of the same sound
const audioCache: { [key: string]: Howl } = {};

// Type definitions
interface WordItem {
  id: string;
  polish: string;
  english: string;
  audioPath: string;
}

interface SpellingPracticeProps {
  title?: string;
  words?: WordItem[];
  backPath?: string;
  backText?: string;
}

// Default words for Section 1 if no words are provided
const defaultWords: WordItem[] = [
  {
    id: "okno",
    polish: "okno",
    english: "window",
    audioPath: "/audio/lesson1/okno.mp3",
  },
  {
    id: "pioro",
    polish: "pióro",
    english: "pen",
    audioPath: "/audio/lesson1/pioro.mp3",
  },
  {
    id: "pudelko",
    polish: "pudełko",
    english: "box",
    audioPath: "/audio/lesson1/pudelko.mp3",
  },
  {
    id: "dziecko",
    polish: "dziecko",
    english: "child",
    audioPath: "/audio/lesson1/dziecko.mp3",
  },
  {
    id: "pole",
    polish: "pole",
    english: "field",
    audioPath: "/audio/lesson1/pole.mp3",
  },
  {
    id: "morze",
    polish: "morze",
    english: "sea",
    audioPath: "/audio/lesson1/morze.mp3",
  },
];

// Adjective words for Section 2
const adjectiveWords: WordItem[] = [
  {
    id: "nowe",
    polish: "nowe",
    english: "new",
    audioPath: "/audio/lesson1/nowe.mp3",
  },
  {
    id: "dobre",
    polish: "dobre",
    english: "good",
    audioPath: "/audio/lesson1/dobre.mp3",
  },
  {
    id: "glebokie",
    polish: "głębokie",
    english: "deep",
    audioPath: "/audio/lesson1/glebokie.mp3",
  },
  {
    id: "duze",
    polish: "duże",
    english: "big/large",
    audioPath: "/audio/lesson1/duze.mp3",
  },
  {
    id: "male",
    polish: "małe",
    english: "small",
    audioPath: "/audio/lesson1/male.mp3",
  },
  {
    id: "moje",
    polish: "moje",
    english: "my",
    audioPath: "/audio/lesson1/moje.mp3",
  },
];

// Demonstrative words for Section 4
const demonstrativeWords: WordItem[] = [
  {
    id: "to",
    polish: "to",
    english: "this (singular)",
    audioPath: "/audio/lesson1/to.mp3",
  },
  {
    id: "tamto",
    polish: "tamto",
    english: "that (singular)",
    audioPath: "/audio/lesson1/tamto.mp3",
  },
  {
    id: "jedno",
    polish: "jedno",
    english: "one (thing)",
    audioPath: "/audio/lesson1/jedno.mp3",
  },
  {
    id: "te",
    polish: "te",
    english: "these (plural)",
    audioPath: "/audio/lesson1/te.mp3",
  },
  {
    id: "tamte",
    polish: "tamte",
    english: "those (plural)",
    audioPath: "/audio/lesson1/tamte.mp3",
  },
];

// Number words for Section 5
const numberWords: WordItem[] = [
  {
    id: "jeden",
    polish: "jeden",
    english: "one (masc/neut.)",
    audioPath: "/audio/lesson1/jeden.mp3",
  },
  {
    id: "jedno",
    polish: "jedno",
    english: "one (neuter)",
    audioPath: "/audio/lesson1/jedno.mp3",
  },
  {
    id: "dwa",
    polish: "dwa",
    english: "two",
    audioPath: "/audio/lesson1/dwa.mp3",
  },
  {
    id: "trzy",
    polish: "trzy",
    english: "three",
    audioPath: "/audio/lesson1/trzy.mp3",
  },
  {
    id: "cztery",
    polish: "cztery",
    english: "four",
    audioPath: "/audio/lesson1/cztery.mp3",
  },
  {
    id: "dwoje",
    polish: "dwoje",
    english: "two (children)",
    audioPath: "/audio/lesson1/dwoje.mp3",
  },
  {
    id: "troje",
    polish: "troje",
    english: "three (children)",
    audioPath: "/audio/lesson1/troje.mp3",
  },
  {
    id: "czworo",
    polish: "czworo",
    english: "four (children)",
    audioPath: "/audio/lesson1/czworo.mp3",
  },
];

// Polish special characters for the keyboard
const specialCharacters = ["ą", "ć", "ę", "ł", "ń", "ó", "ś", "ź", "ż"];

const SpellingPractice = (props: SpellingPracticeProps) => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const practiceType = queryParams.get("type") || "section1";

  // Determine props based on practice type or direct props
  const title =
    props.title ||
    (practiceType === "section1"
      ? 'Spelling Practice: "It" Words'
      : practiceType === "section2"
      ? "Spelling Practice: Adjectives"
      : practiceType === "section4"
      ? "Spelling Practice: Demonstratives"
      : practiceType === "section5"
      ? "Spelling Practice: Numbers"
      : "Spelling Practice");

  // Use the appropriate word set based on the practice type
  const words =
    props.words ||
    (practiceType === "section1"
      ? defaultWords
      : practiceType === "section2"
      ? adjectiveWords
      : practiceType === "section4"
      ? demonstrativeWords
      : practiceType === "section5"
      ? numberWords
      : defaultWords);

  const backPath = props.backPath || "/lesson/1";
  const backText = props.backText || "← Back to lesson";

  // States for tracking practice progress
  const [level, setLevel] = useState(1); // 1: Full hint, 2: Partial hint, 3: No hint
  const [currentIndex, setCurrentIndex] = useState(0);
  const [practiceWords, setPracticeWords] = useState<WordItem[]>([]);
  const [input, setInput] = useState("");
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [feedback, setFeedback] = useState("");
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [complete, setComplete] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // @ts-ignore - These refs are kept for compatibility
  const audioRef = useRef<HTMLAudioElement | null>(null);
  // @ts-ignore - These refs are kept for compatibility
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

    // Auto-play audio when a new word is presented
    if (practiceWords.length > 0 && currentIndex < practiceWords.length) {
      playAudio(
        practiceWords[currentIndex].id,
        practiceWords[currentIndex].audioPath
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
    const normalizedAnswer = practiceWords[currentIndex].polish
      .toLowerCase()
      .trim();

    const correct = normalizedInput === normalizedAnswer;
    setIsCorrect(correct);
    setSubmitted(true);

    if (correct) {
      setFeedback(
        `Correct! "${practiceWords[currentIndex].polish}" means "${practiceWords[currentIndex].english}".`
      );
      playFeedbackSound(true);
    } else {
      setFeedback(
        `Not quite. The correct answer is "${practiceWords[currentIndex].polish}" for "${practiceWords[currentIndex].english}".`
      );
      playFeedbackSound(false);
    }

    // Set timer to automatically progress after showing feedback
    autoProgressTimerRef.current = window.setTimeout(() => {
      goToNextWord();
    }, 2500); // 2.5 seconds delay before continuing
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
      // Move to the next word in the current level
      setCurrentIndex(currentIndex + 1);
    } else {
      // End of all words in the current level
      if (level < 3) {
        // Move to the next level, shuffle words again
        setLevel(level + 1);
        setCurrentIndex(0);
        const shuffled = [...words].sort(() => Math.random() - 0.5);
        setPracticeWords(shuffled);
      } else {
        // All levels completed
        setComplete(true);
      }
    }
  };

  // Create a hint based on the current level
  const getHint = (word: string) => {
    if (level === 1) {
      // Level 1: Show full word
      return word;
    } else if (level === 2) {
      // Level 2: Show word with some letters missing (every other letter)
      return word
        .split("")
        .map((char, i) => (i % 2 === 0 ? char : "_"))
        .join("");
    } else {
      // Level 3: No hint
      return "";
    }
  };

  // Play audio function
  const playAudio = (wordId: string, audioPath: string) => {
    // Set the currently playing audio for the UI
    setPlayingAudio(wordId);

    // Stop any currently playing audio
    if (playingAudio && audioCache[playingAudio]) {
      audioCache[playingAudio].stop();
    }

    // Create or get cached Howl instance
    if (!audioCache[wordId]) {
      audioCache[wordId] = new Howl({
        src: [audioPath],
        volume: 1.0,
        preload: true,
        onend: () => {
          setPlayingAudio(null);
        },
        // @ts-ignore - id parameter is required by howler but not used
        onloaderror: (id, error) => {
          console.error("Error loading audio:", error);
          setPlayingAudio(null);
        },
        // @ts-ignore - id parameter is required by howler but not used
        onplayerror: (id, error) => {
          console.error("Error playing audio:", error);
          setPlayingAudio(null);

          // Try again after unlock event (helpful for mobile)
          audioCache[wordId].once("unlock", function () {
            audioCache[wordId].play();
          });
        },
      });
    }

    // Play the sound
    audioCache[wordId].play();
  };

  // Play feedback sounds
  const playFeedbackSound = (isCorrect: boolean) => {
    const soundKey = isCorrect ? "correct-feedback" : "wrong-feedback";

    // Create feedback sounds if they don't exist
    if (!audioCache[soundKey]) {
      const audioPath = isCorrect
        ? "/audio/feedback/correct.mp3"
        : "/audio/feedback/wrong.mp3";

      audioCache[soundKey] = new Howl({
        src: [audioPath],
        volume: 1.0,
        preload: true,
      });
    }

    // Play the feedback sound
    audioCache[soundKey].play();
  };

  // Restart the exercise
  const restartExercise = () => {
    setLevel(1);
    setCurrentIndex(0);
    setInput("");
    setIsCorrect(null);
    setFeedback("");
    setComplete(false);
    setSubmitted(false);

    const shuffled = [...words].sort(() => Math.random() - 0.5);
    setPracticeWords(shuffled);
  };

  const getLevelDescription = () => {
    switch (level) {
      case 1:
        return "Copy the Polish word";
      case 2:
        return "Fill in the missing letters";
      case 3:
        return "Type the Polish word from memory";
      default:
        return "Type the Polish word";
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Link to={backPath} className={styles.backButton}>
          {backText}
        </Link>
        <h1>{title}</h1>
        <p className={styles.instruction}>
          Type the Polish translation for each English word.
          {level === 1 && " Words are shown as a guide."}
          {level === 2 && " Some letters are hidden as a hint."}
          {level === 3 && " No hints - test your memory!"}
        </p>
        <div className={styles.progress}>
          <div
            className={styles.progressBar}
            style={{
              width: `${
                (level - 1) * 33.3 +
                (currentIndex / practiceWords.length) * 33.3
              }%`,
            }}
          ></div>
        </div>
        <div className={styles.levelIndicator}>
          <span className={level >= 1 ? styles.activeDot : styles.dot}></span>
          <span className={level >= 2 ? styles.activeDot : styles.dot}></span>
          <span className={level >= 3 ? styles.activeDot : styles.dot}></span>
          <span className={styles.levelText}>
            Level {level}: {getLevelDescription()}
          </span>
        </div>
      </header>

      {complete ? (
        <div className={styles.completeScreen}>
          <h2>Practice Complete! 🎉</h2>
          <p>Great job mastering the spelling of all the words!</p>
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
              <span className={styles.englishLabel}>English:</span>
              <span className={styles.englishWord}>
                {practiceWords[currentIndex].english}
              </span>
              <button
                className={styles.audioButton}
                onClick={() =>
                  playAudio(
                    practiceWords[currentIndex].id,
                    practiceWords[currentIndex].audioPath
                  )
                }
                aria-label={`Listen to pronunciation of ${practiceWords[currentIndex].polish}`}
              >
                {playingAudio === practiceWords[currentIndex].id ? (
                  <span className={styles.playingIcon}>🔊</span>
                ) : (
                  <span className={styles.playIcon}>🔈</span>
                )}
              </button>
            </div>

            {level < 3 && (
              <div className={styles.hintBox}>
                <span
                  className={level === 1 ? styles.fullHint : styles.partialHint}
                >
                  {getHint(practiceWords[currentIndex].polish)}
                </span>
              </div>
            )}

            <form onSubmit={handleSubmit} className={styles.inputForm}>
              <div className={styles.inputWrapper}>
                <span className={styles.polishLabel}>Polish:</span>
                <input
                  type="text"
                  value={input}
                  onChange={handleInputChange}
                  placeholder="Type the Polish word"
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

export default SpellingPractice;

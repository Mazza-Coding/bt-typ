import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import styles from "./MemoryRecall.module.css";
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

interface MemoryRecallProps {
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

const MemoryRecall = (props: MemoryRecallProps) => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const practiceType = queryParams.get("type") || "section1";

  // Determine props based on practice type or direct props
  const title =
    props.title ||
    (practiceType === "section1"
      ? 'Memory Recall Practice: "It" Words'
      : practiceType === "section2"
      ? "Memory Recall Practice: Adjectives"
      : practiceType === "section4"
      ? "Memory Recall Practice: Demonstratives"
      : practiceType === "section5"
      ? "Memory Recall Practice: Numbers"
      : "Memory Recall Practice");

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
  const [stage, setStage] = useState<"learn" | "recall">("learn");
  const [round, setRound] = useState(1);
  const [learnedWords, setLearnedWords] = useState<string[]>([]);
  const [currentWords, setCurrentWords] = useState<WordItem[]>([]);
  const [recallWords, setRecallWords] = useState<WordItem[]>([]);
  const [currentRecallIndex, setCurrentRecallIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [complete, setComplete] = useState(false);
  const [options, setOptions] = useState<WordItem[]>([]);
  // @ts-ignore - These refs are kept for compatibility
  const audioRef = useRef<HTMLAudioElement | null>(null);
  // @ts-ignore - These refs are kept for compatibility
  const feedbackAudioRef = useRef<HTMLAudioElement | null>(null);

  // Auto-continue timer
  const autoProgressTimerRef = useRef<number | null>(null);

  // Initialize practice with first set of words
  useEffect(() => {
    if (round === 1) {
      const firstTwoWords = words.slice(0, 2);
      setCurrentWords(firstTwoWords);
      setLearnedWords(firstTwoWords.map((word) => word.id));
    }
  }, [words]);

  // Automatically play audio when a new word is presented in recall mode
  useEffect(() => {
    if (stage === "recall" && recallWords.length > 0) {
      const currentWord = recallWords[currentRecallIndex];
      playAudio(currentWord.id, currentWord.audioPath);
    }

    // Clear any existing auto-progress timer when recall word changes
    return () => {
      if (autoProgressTimerRef.current) {
        clearTimeout(autoProgressTimerRef.current);
        autoProgressTimerRef.current = null;
      }
    };
  }, [currentRecallIndex, stage, recallWords.length]);

  // Clean up timers when component unmounts
  useEffect(() => {
    return () => {
      if (autoProgressTimerRef.current) {
        clearTimeout(autoProgressTimerRef.current);
      }
    };
  }, []);

  // Move to recall stage
  const startRecall = () => {
    const wordsToRecall = words.filter((word) =>
      learnedWords.includes(word.id)
    );

    // Shuffle words for recall
    const shuffledWords = [...wordsToRecall].sort(() => Math.random() - 0.5);
    setRecallWords(shuffledWords);
    setCurrentRecallIndex(0);
    setSelectedOption(null);
    setIsCorrect(null);
    generateOptions(shuffledWords[0]);
    setStage("recall");
  };

  // Generate multiple choice options
  const generateOptions = (_currentWord: WordItem) => {
    // Include all words as options
    const allOptions = [...words];

    // Shuffle the options
    const shuffledOptions = allOptions.sort(() => Math.random() - 0.5);

    setOptions(shuffledOptions);
  };

  // Move to next round
  const nextRound = () => {
    if (round * 2 >= words.length) {
      setComplete(true);
      return;
    }

    const nextWordIndex = round * 2;
    const newWords = words.slice(nextWordIndex, nextWordIndex + 2);
    const updatedLearnedWords = [
      ...learnedWords,
      ...newWords.map((word) => word.id),
    ];

    setCurrentWords(newWords);
    setLearnedWords(updatedLearnedWords);
    setRound(round + 1);
    setStage("learn");
  };

  // Handle option selection
  const handleOptionSelect = (optionId: string) => {
    setSelectedOption(optionId);
    const correct = optionId === recallWords[currentRecallIndex].id;
    setIsCorrect(correct);

    // Play feedback sound
    playFeedbackSound(correct);

    // Set timer to automatically progress after showing feedback
    autoProgressTimerRef.current = window.setTimeout(() => {
      nextRecallWord();
    }, 2000); // 2 seconds delay before continuing
  };

  // Go to next word in recall
  const nextRecallWord = () => {
    // Clear any existing auto-progress timer
    if (autoProgressTimerRef.current) {
      clearTimeout(autoProgressTimerRef.current);
      autoProgressTimerRef.current = null;
    }

    if (currentRecallIndex < recallWords.length - 1) {
      const nextIndex = currentRecallIndex + 1;
      setCurrentRecallIndex(nextIndex);
      setSelectedOption(null);
      setIsCorrect(null);
      generateOptions(recallWords[nextIndex]);
    } else {
      nextRound();
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
    setRound(1);
    setStage("learn");
    setLearnedWords([]);
    setComplete(false);

    const firstTwoWords = words.slice(0, 2);
    setCurrentWords(firstTwoWords);
    setLearnedWords(firstTwoWords.map((word) => word.id));
  };

  // Get option class name based on selection state
  const getOptionClassName = (optionId: string) => {
    if (!selectedOption) return styles.recallOption;

    if (optionId === recallWords[currentRecallIndex].id) {
      // This is the correct answer
      return selectedOption === optionId
        ? `${styles.recallOption} ${styles.correctOption}`
        : `${styles.recallOption} ${styles.correctOption} ${styles.unselected}`;
    } else {
      // This is an incorrect answer
      return selectedOption === optionId
        ? `${styles.recallOption} ${styles.incorrectOption}`
        : `${styles.recallOption} ${styles.unselected}`;
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
          {stage === "learn"
            ? "Study these words and their meanings. When you're ready, test your memory."
            : "Choose the correct meaning for each Polish word."}
        </p>
        <div className={styles.progress}>
          <div
            className={styles.progressBar}
            style={{ width: `${(learnedWords.length / words.length) * 100}%` }}
          ></div>
        </div>
      </header>

      {complete ? (
        <div className={styles.completeScreen}>
          <h2>Practice Complete! 🎉</h2>
          <p>Great job remembering all the words!</p>
          <div className={styles.actionButtons}>
            <button className={styles.primaryButton} onClick={restartExercise}>
              Practice Again
            </button>
            <Link to={backPath} className={styles.secondaryButton}>
              Return to Lesson
            </Link>
          </div>
        </div>
      ) : stage === "learn" ? (
        <div className={styles.learnSection}>
          <h2 className={styles.sectionTitle}>Learn These Words</h2>
          <div className={styles.wordCards}>
            {currentWords.map((word) => (
              <div key={word.id} className={styles.wordCard}>
                <div className={styles.polishWord}>{word.polish}</div>
                <button
                  className={styles.audioButton}
                  onClick={() => playAudio(word.id, word.audioPath)}
                  aria-label={`Listen to pronunciation of ${word.polish}`}
                >
                  {playingAudio === word.id ? (
                    <span className={styles.playingIcon}>🔊</span>
                  ) : (
                    <span className={styles.playIcon}>🔈</span>
                  )}
                </button>
                <div className={styles.englishWord}>{word.english}</div>
              </div>
            ))}
          </div>
          <div className={styles.actionButtons}>
            <button className={styles.primaryButton} onClick={startRecall}>
              I'm Ready to Recall
            </button>
          </div>
        </div>
      ) : (
        <div className={styles.recallSection}>
          <h2 className={styles.sectionTitle}>Test Your Memory</h2>
          <div className={styles.recallCard}>
            <div className={styles.recallPolishWord}>
              {recallWords[currentRecallIndex].polish}
              <button
                className={styles.audioButton}
                onClick={() =>
                  playAudio(
                    recallWords[currentRecallIndex].id,
                    recallWords[currentRecallIndex].audioPath
                  )
                }
                aria-label={`Listen to pronunciation of ${recallWords[currentRecallIndex].polish}`}
              >
                {playingAudio === recallWords[currentRecallIndex].id ? (
                  <span className={styles.playingIcon}>🔊</span>
                ) : (
                  <span className={styles.playIcon}>🔈</span>
                )}
              </button>
            </div>

            <div className={styles.recallQuestion}>
              What does this word mean?
            </div>

            <div className={styles.recallOptions}>
              {options.map((option) => (
                <button
                  key={option.id}
                  className={getOptionClassName(option.id)}
                  onClick={() => handleOptionSelect(option.id)}
                  disabled={!!selectedOption}
                >
                  {option.english}
                </button>
              ))}
            </div>

            {selectedOption && (
              <div className={styles.feedbackContainer}>
                {isCorrect ? (
                  <p className={styles.successFeedback}>
                    <span className={styles.feedbackIcon}>✓</span>
                    <strong>Correct!</strong>{" "}
                    {recallWords[currentRecallIndex].polish} means "
                    {recallWords[currentRecallIndex].english}".
                  </p>
                ) : (
                  <p className={styles.errorFeedback}>
                    <span className={styles.feedbackIcon}>✗</span>
                    <strong>Not quite.</strong>{" "}
                    {recallWords[currentRecallIndex].polish} means "
                    {recallWords[currentRecallIndex].english}".
                  </p>
                )}
              </div>
            )}
          </div>

          <div className={styles.recallProgress}>
            <div className={styles.recallCount}>
              Word {currentRecallIndex + 1} of {recallWords.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemoryRecall;

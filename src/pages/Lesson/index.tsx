import { useParams, Link } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import styles from "./Lesson.module.css";
// @ts-ignore
import { Howl, Howler } from "howler";

// Audio cache to prevent creating multiple instances of the same sound
const audioCache: { [key: string]: Howl } = {};

const Lesson = () => {
  const { id } = useParams<{ id: string }>();
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [showMiniAnswer, setShowMiniAnswer] = useState(false);
  const [showSpotAnswer, setShowSpotAnswer] = useState(false);
  const [showTranslateAnswer, setShowTranslateAnswer] = useState(false);
  const [showCountingAnswer, setShowCountingAnswer] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [selectedMiniOption, setSelectedMiniOption] = useState<string | null>(
    null
  );
  const [selectedSpotOption, setSelectedSpotOption] = useState<string | null>(
    null
  );
  const [selectedTranslateOption, setSelectedTranslateOption] = useState<
    string | null
  >(null);
  const [selectedCountingOption, setSelectedCountingOption] = useState<
    string | null
  >(null);
  const [navExpanded, setNavExpanded] = useState(false);

  // @ts-ignore - These refs are kept for compatibility
  const audioRef = useRef<HTMLAudioElement | null>(null);
  // @ts-ignore - These refs are kept for compatibility
  const feedbackAudioRef = useRef<HTMLAudioElement | null>(null);

  // Word data with pronunciation
  const words = [
    {
      id: "okno",
      polish: "okno",
      english: "window",
      audioPath: "/audio/lesson1/okno.mp3",
    },
    {
      id: "dziecko",
      polish: "dziecko",
      english: "child",
      audioPath: "/audio/lesson1/dziecko.mp3",
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
      id: "morze",
      polish: "morze",
      english: "sea",
      audioPath: "/audio/lesson1/morze.mp3",
    },
    {
      id: "pole",
      polish: "pole",
      english: "field",
      audioPath: "/audio/lesson1/pole.mp3",
    },
  ];

  // Examples for step 2
  const examples = [
    {
      id: "pioro-subject",
      polish: "To jest pióro.",
      english: "This is a pen.",
      role: "Subject (it)",
      situation: "Showing something",
      audioPath: "/audio/lesson1/to-jest-pioro.mp3",
    },
    {
      id: "pioro-object",
      polish: "Mam pióro.",
      english: "I have a pen.",
      role: "Object (it)",
      situation: "Having something",
      audioPath: "/audio/lesson1/mam-pioro.mp3",
    },
    {
      id: "pioro-vocative",
      polish: "Pióro!",
      english: "(Pen!)",
      role: "Vocative",
      situation: "Yelling or calling out",
      audioPath: "/audio/lesson1/pioro.mp3",
    },
  ];

  // Adjective examples for step 3
  const adjectiveExamples = [
    {
      id: "nowe-pioro",
      polish: "nowe pióro",
      english: "a new pen",
      audioPath: "/audio/lesson1/nowe-pioro.mp3",
    },
    {
      id: "dobre-dziecko",
      polish: "dobre dziecko",
      english: "a good child",
      audioPath: "/audio/lesson1/dobre-dziecko.mp3",
    },
    {
      id: "glebokie-morze",
      polish: "głębokie morze",
      english: "a deep sea",
      audioPath: "/audio/lesson1/glebokie-morze.mp3",
    },
    {
      id: "moje-okno",
      polish: "moje okno",
      english: "my window",
      audioPath: "/audio/lesson1/moje-okno.mp3",
    },
    {
      id: "duze-pole",
      polish: "duże pole",
      english: "a large field",
      audioPath: "/audio/lesson1/duze-pole.mp3",
    },
  ];

  // Demonstrative examples for step 4
  const demonstrativeExamples = [
    {
      id: "to-dziecko",
      polish: "to dziecko",
      english: "this child",
      audioPath: "/audio/lesson1/to-dziecko.mp3",
    },
    {
      id: "tamto-morze",
      polish: "tamto morze",
      english: "that sea",
      audioPath: "/audio/lesson1/tamto-morze.mp3",
    },
    {
      id: "jedno-pioro",
      polish: "jedno pióro",
      english: "one pen",
      audioPath: "/audio/lesson1/jedno-pioro.mp3",
    },
  ];

  // Plural examples for step 5
  const pluralExamples = [
    {
      singular: "okno",
      plural: "okna",
      english: "window/windows",
      audioPath: "/audio/lesson1/okna.mp3",
    },
    {
      singular: "pióro",
      plural: "pióra",
      english: "pen/pens",
      audioPath: "/audio/lesson1/piora.mp3",
    },
    {
      singular: "pudelko",
      plural: "pudełka",
      english: "box/boxes",
      audioPath: "/audio/lesson1/pudelka.mp3",
    },
    {
      singular: "morze",
      plural: "morza",
      english: "sea/seas",
      audioPath: "/audio/lesson1/morza.mp3",
    },
    {
      singular: "pole",
      plural: "pola",
      english: "field/fields",
      audioPath: "/audio/lesson1/pola.mp3",
    },
    {
      singular: "dziecko",
      plural: "dzieci",
      english: "child/children",
      audioPath: "/audio/lesson1/dzieci.mp3",
      isException: true,
    },
  ];

  // Adjective plural examples
  const adjectivePluralExamples = [
    {
      id: "nowe-okna",
      polish: "nowe okna",
      english: "new windows",
      audioPath: "/audio/lesson1/nowe-okna.mp3",
    },
    {
      id: "dobre-dzieci",
      polish: "dobre dzieci",
      english: "good children",
      audioPath: "/audio/lesson1/dobre-dzieci.mp3",
    },
    {
      id: "male-pudelka",
      polish: "małe pudełka",
      english: "small boxes",
      audioPath: "/audio/lesson1/male-pudelka.mp3",
    },
  ];

  // Spot the Match options
  const spotTheMatchOptions = [
    { id: "A", text: "nowy", isCorrect: false },
    { id: "B", text: "nowa", isCorrect: false },
    { id: "C", text: "nowe", isCorrect: true },
    { id: "D", text: "nowego", isCorrect: false },
  ];

  // Mini challenge options
  const miniChallengeOptions = [
    { id: "A", text: "Kocham morze", isCorrect: true },
    { id: "B", text: "Kocham morza", isCorrect: false },
    { id: "C", text: "Kocham morzem", isCorrect: false },
    { id: "D", text: "Kocham morzy", isCorrect: false },
  ];

  // Initialize feedback sounds once
  useEffect(() => {
    if (!audioCache["correct"]) {
      audioCache["correct"] = new Howl({
        src: ["/audio/feedback/correct.mp3"],
        volume: 1.0,
        preload: true,
        html5: true, // Enable HTML5 Audio to work better on mobile
        onend: () => {
          // Clear playing audio state when sound ends
          setPlayingAudio(null);
        },
        // @ts-ignore - id parameter is required by howler but not used
        onloaderror: (id, error) => {
          console.error("Error loading audio:", error);
        },
        // @ts-ignore - id parameter is required by howler but not used
        onplayerror: (id, error) => {
          console.error("Error playing audio:", error);
        },
      });
    }

    if (!audioCache["wrong"]) {
      audioCache["wrong"] = new Howl({
        src: ["/audio/feedback/wrong.mp3"],
        volume: 1.0,
        preload: true,
        html5: true, // Enable HTML5 Audio to work better on mobile
        onend: () => {
          // Clear playing audio state when sound ends
          setPlayingAudio(null);
        },
        // @ts-ignore - id parameter is required by howler but not used
        onloaderror: (id, error) => {
          console.error("Error loading audio:", error);
        },
        // @ts-ignore - id parameter is required by howler but not used
        onplayerror: (id, error) => {
          console.error("Error playing audio:", error);
        },
      });
    }

    // Clean up howler instances on unmount (optional but good practice)
    return () => {
      // No need to explicitly unload as Howler handles this
    };
  }, []);

  const playAudio = (wordId: string, audioPath: string) => {
    // Stop any currently playing audio
    if (playingAudio && audioCache[playingAudio]) {
      audioCache[playingAudio].stop();
    }

    // Set the currently playing audio for the UI
    setPlayingAudio(wordId);

    // Create or get the cached Howl instance
    if (!audioCache[wordId]) {
      audioCache[wordId] = new Howl({
        src: [audioPath],
        volume: 1.0,
        preload: true,
        html5: true, // Enable HTML5 Audio to work better on mobile
        onend: () => {
          // Clear playing audio state when sound ends
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

  const playFeedbackSound = (isCorrect: boolean) => {
    const soundKey = isCorrect ? "correct" : "wrong";

    // Create feedback sounds if they don't exist
    if (!audioCache[soundKey]) {
      audioCache[soundKey] = new Howl({
        src: [
          isCorrect
            ? "/audio/feedback/correct.mp3"
            : "/audio/feedback/wrong.mp3",
        ],
        volume: 1.0,
        preload: true,
        html5: true, // Enable HTML5 Audio to work better on mobile
        onplayerror: () => {
          console.error("Error playing feedback sound");

          // Try again after unlock event (helpful for mobile)
          audioCache[soundKey].once("unlock", function () {
            audioCache[soundKey].play();
          });
        },
      });
    }

    // Play the feedback sound
    audioCache[soundKey].play();
  };

  const toggleAnswer = () => {
    setShowAnswer(!showAnswer);
  };

  const toggleMiniAnswer = () => {
    setShowMiniAnswer(!showMiniAnswer);
  };

  const toggleSpotAnswer = () => {
    setShowSpotAnswer(!showSpotAnswer);
  };

  const toggleTranslateAnswer = () => {
    setShowTranslateAnswer(!showTranslateAnswer);
  };

  const toggleCountingAnswer = () => {
    setShowCountingAnswer(!showCountingAnswer);
  };

  const toggleNav = () => {
    setNavExpanded(!navExpanded);
  };

  const handleOptionSelect = (option: string) => {
    setSelectedOption(option);
    // Automatically show the answer after selecting an option
    setShowAnswer(true);

    // Play the appropriate feedback sound
    const isCorrect = option === "D";
    playFeedbackSound(isCorrect);
  };

  const handleMiniOptionSelect = (option: string) => {
    setSelectedMiniOption(option);
    // Automatically show the answer after selecting an option
    setShowMiniAnswer(true);

    // Play the appropriate feedback sound
    const isCorrect = option === "A";
    playFeedbackSound(isCorrect);
  };

  const handleSpotOptionSelect = (option: string) => {
    setSelectedSpotOption(option);
    // Automatically show the answer after selecting an option
    setShowSpotAnswer(true);

    // Play the appropriate feedback sound
    const isCorrect = option === "C";
    playFeedbackSound(isCorrect);
  };

  const handleTranslateOptionSelect = (option: string) => {
    setSelectedTranslateOption(option);
    // Automatically show the answer after selecting an option
    setShowTranslateAnswer(true);

    // Play the appropriate feedback sound
    const isCorrect = option === "A";
    playFeedbackSound(isCorrect);
  };

  const handleCountingOptionSelect = (option: string) => {
    setSelectedCountingOption(option);
    // Automatically show the answer after selecting an option
    setShowCountingAnswer(true);

    // Play the appropriate feedback sound
    const isCorrect = option === "B";
    playFeedbackSound(isCorrect);
  };

  const getOptionClassName = (option: string) => {
    if (!selectedOption) return styles.quizOption;

    if (option === "D") {
      // This is the correct answer
      return selectedOption === option
        ? `${styles.quizOption} ${styles.correctOption}`
        : `${styles.quizOption} ${styles.correctOption} ${styles.unselected}`;
    } else {
      // This is an incorrect answer
      return selectedOption === option
        ? `${styles.quizOption} ${styles.incorrectOption}`
        : `${styles.quizOption} ${styles.unselected}`;
    }
  };

  const getMiniOptionClassName = (option: string) => {
    if (!selectedMiniOption) return styles.quizOption;

    if (option === "A") {
      // This is the correct answer
      return selectedMiniOption === option
        ? `${styles.quizOption} ${styles.correctOption}`
        : `${styles.quizOption} ${styles.correctOption} ${styles.unselected}`;
    } else {
      // This is an incorrect answer
      return selectedMiniOption === option
        ? `${styles.quizOption} ${styles.incorrectOption}`
        : `${styles.quizOption} ${styles.unselected}`;
    }
  };

  const getSpotOptionClassName = (option: string) => {
    if (!selectedSpotOption) return styles.quizOption;

    if (option === "C") {
      // This is the correct answer
      return selectedSpotOption === option
        ? `${styles.quizOption} ${styles.correctOption}`
        : `${styles.quizOption} ${styles.correctOption} ${styles.unselected}`;
    } else {
      // This is an incorrect answer
      return selectedSpotOption === option
        ? `${styles.quizOption} ${styles.incorrectOption}`
        : `${styles.quizOption} ${styles.unselected}`;
    }
  };

  const getTranslateOptionClassName = (option: string) => {
    if (!selectedTranslateOption) return styles.quizOption;

    if (option === "A") {
      // This is the correct answer
      return selectedTranslateOption === option
        ? `${styles.quizOption} ${styles.correctOption}`
        : `${styles.quizOption} ${styles.correctOption} ${styles.unselected}`;
    } else {
      // This is an incorrect answer
      return selectedTranslateOption === option
        ? `${styles.quizOption} ${styles.incorrectOption}`
        : `${styles.quizOption} ${styles.unselected}`;
    }
  };

  const getCountingOptionClassName = (option: string) => {
    if (!selectedCountingOption) return styles.quizOption;

    if (option === "B") {
      // This is the correct answer
      return selectedCountingOption === option
        ? `${styles.quizOption} ${styles.correctOption}`
        : `${styles.quizOption} ${styles.correctOption} ${styles.unselected}`;
    } else {
      // This is an incorrect answer
      return selectedCountingOption === option
        ? `${styles.quizOption} ${styles.incorrectOption}`
        : `${styles.quizOption} ${styles.unselected}`;
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Link to="/" className={styles.backButton}>
          ← Back to lessons
        </Link>
        <h1>🧠 Lesson {id}: Talking About "It" Things in Polish</h1>
      </header>

      <div className={styles.navContainer}>
        <button
          className={styles.navToggle}
          onClick={toggleNav}
          aria-expanded={navExpanded}
        >
          <span className={styles.navIcon}>{navExpanded ? "✕" : "☰"}</span>
          <span className={styles.navText}>
            {navExpanded ? "Close Menu" : "Jump to Section"}
          </span>
        </button>

        {navExpanded && (
          <nav className={styles.navMenu}>
            <div className={styles.navSection}>
              <h3 className={styles.navSectionTitle}>Lesson Content</h3>
              <ul className={styles.navList}>
                <li>
                  <a
                    href="#step1"
                    onClick={() => setNavExpanded(false)}
                    className={styles.navLink}
                  >
                    Step 1: What makes a word an "it" word?
                  </a>
                </li>
                <li>
                  <a
                    href="#step2"
                    onClick={() => setNavExpanded(false)}
                    className={styles.navLink}
                  >
                    Step 2: One form, many roles
                  </a>
                </li>
                <li>
                  <a
                    href="#step3"
                    onClick={() => setNavExpanded(false)}
                    className={styles.navLink}
                  >
                    Step 3: Describing "it" things
                  </a>
                </li>
                <li>
                  <a
                    href="#step4"
                    onClick={() => setNavExpanded(false)}
                    className={styles.navLink}
                  >
                    Step 4: This & That – Small Shift
                  </a>
                </li>
                <li>
                  <a
                    href="#step5"
                    onClick={() => setNavExpanded(false)}
                    className={styles.navLink}
                  >
                    Step 5: Plural – What happens when there's more?
                  </a>
                </li>
                <li>
                  <a
                    href="#step6"
                    onClick={() => setNavExpanded(false)}
                    className={styles.navLink}
                  >
                    Step 6: Numbers — Let's Count "It"
                  </a>
                </li>
                <li>
                  <a
                    href="#recap"
                    onClick={() => setNavExpanded(false)}
                    className={styles.navLink}
                  >
                    Final Recap (Speed Mode)
                  </a>
                </li>
              </ul>
            </div>

            <div className={styles.navSection}>
              <h3 className={styles.navSectionTitle}>Practice Exercises</h3>
              <ul className={styles.navList}>
                <li>
                  <a
                    href="#practice"
                    onClick={() => setNavExpanded(false)}
                    className={styles.navLink}
                  >
                    Section 1: "It" Words (Neuter Nouns)
                  </a>
                </li>
                <li>
                  <a
                    href="#practice"
                    onClick={() => setNavExpanded(false)}
                    className={styles.navLink}
                  >
                    Section 2: Describing Things (Adjectives)
                  </a>
                </li>
                <li>
                  <a
                    href="#practice"
                    onClick={() => setNavExpanded(false)}
                    className={styles.navLink}
                  >
                    Section 3: Plural Forms (Neuter Nouns)
                  </a>
                </li>
                <li>
                  <a
                    href="#practice"
                    onClick={() => setNavExpanded(false)}
                    className={styles.navLink}
                  >
                    Section 4: This, That, and One (Demonstratives)
                  </a>
                </li>
                <li>
                  <a
                    href="#practice"
                    onClick={() => setNavExpanded(false)}
                    className={styles.navLink}
                  >
                    Section 5: Numbers
                  </a>
                </li>
              </ul>
            </div>
          </nav>
        )}
      </div>

      <div className={styles.content}>
        <section className={styles.lessonSection}>
          <p className={styles.intro}>
            Welcome! You're about to master a weirdly simple part of Polish:
            words for things that aren't "he" or "she." Think of these as "it"
            words — and Polish treats them in a super consistent way. Let's dive
            in. 👇
          </p>

          <h2 id="step1" className={styles.stepTitle}>
            🔍 Step 1: What makes a word an "it" word?
          </h2>
          <p>
            In Polish, if a word ends in -o or -e, it's usually treated like
            "it" — not "he" or "she".
          </p>

          <h2 className={styles.examplesTitle}>🧊 Examples of "it" words:</h2>
          <ul className={styles.examplesList}>
            {words.map((word) => (
              <li key={word.id}>
                <span className={styles.wordItem}>
                  <span className={styles.polishWord}>{word.polish}</span>
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
                </span>
                <span className={styles.englishWord}>– {word.english}</span>
              </li>
            ))}
          </ul>

          <p className={styles.memoryTip}>
            🧠 Think: If a word ends in -o or -e, it's neutral – not boy or
            girl. It's just a thing.
          </p>

          <div className={styles.quizSection}>
            <h2 className={styles.quizTitle}>✅ Quick Check</h2>
            <p className={styles.quizQuestion}>
              Which one of these is NOT an "it" word in Polish?
            </p>

            <div className={styles.quizOptions}>
              <button
                className={getOptionClassName("A")}
                onClick={() => handleOptionSelect("A")}
                disabled={!!selectedOption}
              >
                <span className={styles.optionLetter}>A.</span> pióro
              </button>
              <button
                className={getOptionClassName("B")}
                onClick={() => handleOptionSelect("B")}
                disabled={!!selectedOption}
              >
                <span className={styles.optionLetter}>B.</span> morze
              </button>
              <button
                className={getOptionClassName("C")}
                onClick={() => handleOptionSelect("C")}
                disabled={!!selectedOption}
              >
                <span className={styles.optionLetter}>C.</span> dziecko
              </button>
              <button
                className={getOptionClassName("D")}
                onClick={() => handleOptionSelect("D")}
                disabled={!!selectedOption}
              >
                <span className={styles.optionLetter}>D.</span> pies
              </button>
            </div>

            {!selectedOption && (
              <div className={styles.answerContainer}>
                <button
                  className={styles.answerToggle}
                  onClick={toggleAnswer}
                  aria-expanded={showAnswer}
                >
                  <span className={styles.answerIcon}>✅</span> Show Answer
                </button>

                {showAnswer && (
                  <div className={styles.answerContent}>
                    <p>
                      <strong>D. pies</strong> — it ends in a consonant and is
                      masculine.
                    </p>
                  </div>
                )}
              </div>
            )}

            {selectedOption && (
              <div className={styles.answerContent}>
                {selectedOption === "D" ? (
                  <p className={styles.successFeedback}>
                    <span className={styles.feedbackIcon}>✓</span>
                    <strong>Correct!</strong> Pies (dog) is masculine because it
                    ends in a consonant.
                  </p>
                ) : (
                  <p className={styles.errorFeedback}>
                    <span className={styles.feedbackIcon}>✗</span>
                    <strong>Not quite.</strong> The correct answer is D. pies —
                    it ends in a consonant and is masculine.
                  </p>
                )}
              </div>
            )}
          </div>

          <h2 id="step2" className={styles.stepTitle}>
            🔍 Step 2: One form, many roles
          </h2>
          <p>
            Let's say you're pointing to a pen, holding it, or shouting about
            it:
          </p>

          <div className={styles.tableContainer}>
            <table className={styles.examplesTable}>
              <thead>
                <tr>
                  <th>Situation</th>
                  <th>Sentence</th>
                  <th>Role</th>
                </tr>
              </thead>
              <tbody>
                {examples.map((example) => (
                  <tr key={example.id}>
                    <td>{example.situation}</td>
                    <td>
                      <span className={styles.polishSentence}>
                        {example.polish}
                        <button
                          className={styles.audioButton}
                          onClick={() =>
                            playAudio(example.id, example.audioPath)
                          }
                          aria-label={`Listen to pronunciation of ${example.polish}`}
                        >
                          {playingAudio === example.id ? (
                            <span className={styles.playingIcon}>🔊</span>
                          ) : (
                            <span className={styles.playIcon}>🔈</span>
                          )}
                        </button>
                      </span>
                      <span className={styles.englishSentence}>
                        {example.english}
                      </span>
                    </td>
                    <td>{example.role}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className={styles.noteText}>Surprise: the word doesn't change!</p>

          <p className={styles.memoryTip}>
            🧠 With "it" words, Polish is chill — same form for different uses.
          </p>

          <div className={styles.quizSection}>
            <h2 className={styles.quizTitle}>🧠 Mini Challenge</h2>
            <p className={styles.quizQuestion}>
              How would you say: "I love the sea"?
            </p>

            <div className={styles.quizOptions}>
              {miniChallengeOptions.map((option) => (
                <button
                  key={option.id}
                  className={getMiniOptionClassName(option.id)}
                  onClick={() => handleMiniOptionSelect(option.id)}
                  disabled={!!selectedMiniOption}
                >
                  <span className={styles.optionLetter}>{option.id}.</span>{" "}
                  {option.text}
                </button>
              ))}
            </div>

            {!selectedMiniOption && (
              <div className={styles.answerContainer}>
                <button
                  className={styles.answerToggle}
                  onClick={toggleMiniAnswer}
                  aria-expanded={showMiniAnswer}
                >
                  <span className={styles.answerIcon}>✅</span> Show Answer
                </button>

                {showMiniAnswer && (
                  <div className={styles.answerContent}>
                    <p>
                      <strong>A. Kocham morze</strong> — "morze" is the "it"
                      word, and it stays the same.
                    </p>
                  </div>
                )}
              </div>
            )}

            {selectedMiniOption && (
              <div className={styles.answerContent}>
                {selectedMiniOption === "A" ? (
                  <p className={styles.successFeedback}>
                    <span className={styles.feedbackIcon}>✓</span>
                    <strong>Correct!</strong> "Morze" is the "it" word, and it
                    stays the same.
                  </p>
                ) : (
                  <p className={styles.errorFeedback}>
                    <span className={styles.feedbackIcon}>✗</span>
                    <strong>Not quite.</strong> The correct answer is A. Kocham
                    morze — "morze" is the "it" word, and it stays the same.
                  </p>
                )}
              </div>
            )}
          </div>

          <h2 id="step3" className={styles.stepTitle}>
            🎨 Step 3: Describing "it" things
          </h2>
          <p>In English: "a new pen."</p>
          <p>In Polish: adjectives like "new" change to match the noun.</p>
          <p>
            For "it" nouns (those ending in -o or -e), adjectives usually end in
            -e.
          </p>

          <div className={styles.tableContainer}>
            <table className={styles.examplesTable}>
              <thead>
                <tr>
                  <th>Polish</th>
                  <th>English</th>
                </tr>
              </thead>
              <tbody>
                {adjectiveExamples.map((example) => (
                  <tr key={example.id}>
                    <td>
                      <span className={styles.polishSentence}>
                        {example.polish}
                        <button
                          className={styles.audioButton}
                          onClick={() =>
                            playAudio(example.id, example.audioPath)
                          }
                          aria-label={`Listen to pronunciation of ${example.polish}`}
                        >
                          {playingAudio === example.id ? (
                            <span className={styles.playingIcon}>🔊</span>
                          ) : (
                            <span className={styles.playIcon}>🔈</span>
                          )}
                        </button>
                      </span>
                    </td>
                    <td>{example.english}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className={styles.memoryTip}>
            🧠 Adjective for "it" → ends in -e. Just match that sound.
          </p>

          <div className={styles.quizSection}>
            <h2 className={styles.quizTitle}>👁️ Spot the Match</h2>
            <p className={styles.quizQuestion}>Which adjective matches best?</p>
            <p className={styles.quizSubQuestion}>___ pudełko (a box)</p>

            <div className={styles.quizOptions}>
              {spotTheMatchOptions.map((option) => (
                <button
                  key={option.id}
                  className={getSpotOptionClassName(option.id)}
                  onClick={() => handleSpotOptionSelect(option.id)}
                  disabled={!!selectedSpotOption}
                >
                  <span className={styles.optionLetter}>{option.id}.</span>{" "}
                  {option.text}
                </button>
              ))}
            </div>

            {!selectedSpotOption && (
              <div className={styles.answerContainer}>
                <button
                  className={styles.answerToggle}
                  onClick={toggleSpotAnswer}
                  aria-expanded={showSpotAnswer}
                >
                  <span className={styles.answerIcon}>✅</span> Show Answer
                </button>

                {showSpotAnswer && (
                  <div className={styles.answerContent}>
                    <p>
                      <strong>C. nowe</strong> — "pudełko" is an "it" word, so
                      the adjective ends in -e.
                    </p>
                  </div>
                )}
              </div>
            )}

            {selectedSpotOption && (
              <div className={styles.answerContent}>
                {selectedSpotOption === "C" ? (
                  <p className={styles.successFeedback}>
                    <span className={styles.feedbackIcon}>✓</span>
                    <strong>Correct!</strong> "Pudełko" is an "it" word, so the
                    adjective ends in -e.
                  </p>
                ) : (
                  <p className={styles.errorFeedback}>
                    <span className={styles.feedbackIcon}>✗</span>
                    <strong>Not quite.</strong> The correct answer is C. nowe —
                    "pudełko" is an "it" word, so the adjective ends in -e.
                  </p>
                )}
              </div>
            )}
          </div>

          <h2 id="step4" className={styles.stepTitle}>
            💬 Step 4: This & That – Small Shift
          </h2>
          <p>Usually, adjectives use -e for "it" things.</p>
          <p>But "this" and "that" use a slightly different shape: -o</p>

          <div className={styles.simpleWordList}>
            <div className={styles.simpleWordItem}>
              <span className={styles.polishWord}>to</span>
              <span className={styles.englishWord}>– this</span>
            </div>
            <div className={styles.simpleWordItem}>
              <span className={styles.polishWord}>tamto</span>
              <span className={styles.englishWord}>– that over there</span>
            </div>
            <div className={styles.simpleWordItem}>
              <span className={styles.polishWord}>jedno</span>
              <span className={styles.englishWord}>– one (thing)</span>
            </div>
          </div>

          <h3 className={styles.subheading}>Examples:</h3>
          <div className={styles.tableContainer}>
            <table className={styles.examplesTable}>
              <tbody>
                {demonstrativeExamples.map((example) => (
                  <tr key={example.id}>
                    <td>
                      <span className={styles.polishSentence}>
                        {example.polish}
                        <button
                          className={styles.audioButton}
                          onClick={() =>
                            playAudio(example.id, example.audioPath)
                          }
                          aria-label={`Listen to pronunciation of ${example.polish}`}
                        >
                          {playingAudio === example.id ? (
                            <span className={styles.playingIcon}>🔊</span>
                          ) : (
                            <span className={styles.playIcon}>🔈</span>
                          )}
                        </button>
                      </span>
                    </td>
                    <td>{example.english}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className={styles.memoryTip}>
            🧠 Tip: "this," "that," and "one" = -o, not -e.
          </p>

          <h2 id="step5" className={styles.stepTitle}>
            🔁 Step 5: Plural – What happens when there's more?
          </h2>
          <p>
            Polish loves patterns. To make most "it" words plural, just swap the
            ending:
          </p>

          <div className={styles.tableContainer}>
            <table className={styles.examplesTable}>
              <thead>
                <tr>
                  <th>Singular</th>
                  <th>Plural</th>
                  <th>Meaning</th>
                </tr>
              </thead>
              <tbody>
                {pluralExamples.map((example) => (
                  <tr
                    key={example.singular}
                    className={example.isException ? styles.exceptionRow : ""}
                  >
                    <td>
                      <span className={styles.polishWord}>
                        {example.singular}
                      </span>
                    </td>
                    <td>
                      <span className={styles.polishSentence}>
                        {example.plural}
                        <button
                          className={styles.audioButton}
                          onClick={() =>
                            playAudio(
                              `plural-${example.singular}`,
                              example.audioPath
                            )
                          }
                          aria-label={`Listen to pronunciation of ${example.plural}`}
                        >
                          {playingAudio === `plural-${example.singular}` ? (
                            <span className={styles.playingIcon}>🔊</span>
                          ) : (
                            <span className={styles.playIcon}>🔈</span>
                          )}
                        </button>
                      </span>
                    </td>
                    <td>{example.english}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className={styles.noteText}>
            Exception alert: dziecko (child) → dzieci (children)
          </p>

          <h3 className={styles.subheading}>Adjectives also follow along:</h3>
          <div className={styles.tableContainer}>
            <table className={styles.examplesTable}>
              <tbody>
                {adjectivePluralExamples.map((example) => (
                  <tr key={example.id}>
                    <td>
                      <span className={styles.polishSentence}>
                        {example.polish}
                        <button
                          className={styles.audioButton}
                          onClick={() =>
                            playAudio(example.id, example.audioPath)
                          }
                          aria-label={`Listen to pronunciation of ${example.polish}`}
                        >
                          {playingAudio === example.id ? (
                            <span className={styles.playingIcon}>🔊</span>
                          ) : (
                            <span className={styles.playIcon}>🔈</span>
                          )}
                        </button>
                      </span>
                    </td>
                    <td>{example.english}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className={styles.memoryTip}>
            🧠 Plural "it" = ends in -a, and adjectives stay in -e.
          </p>

          <div className={styles.quizSection}>
            <h2 className={styles.quizTitle}>🔁 Try This!</h2>
            <p className={styles.quizQuestion}>Translate:</p>
            <p className={styles.quizSubQuestion}>"These new pens" → ?</p>

            <div className={styles.quizOptions}>
              <button
                className={getTranslateOptionClassName("A")}
                onClick={() => handleTranslateOptionSelect("A")}
                disabled={!!selectedTranslateOption}
              >
                <span className={styles.optionLetter}>A.</span> Te nowe pióra
              </button>
              <button
                className={getTranslateOptionClassName("B")}
                onClick={() => handleTranslateOptionSelect("B")}
                disabled={!!selectedTranslateOption}
              >
                <span className={styles.optionLetter}>B.</span> Te nowi pióra
              </button>
              <button
                className={getTranslateOptionClassName("C")}
                onClick={() => handleTranslateOptionSelect("C")}
                disabled={!!selectedTranslateOption}
              >
                <span className={styles.optionLetter}>C.</span> Te nowe pióry
              </button>
              <button
                className={getTranslateOptionClassName("D")}
                onClick={() => handleTranslateOptionSelect("D")}
                disabled={!!selectedTranslateOption}
              >
                <span className={styles.optionLetter}>D.</span> To nowe pióra
              </button>
            </div>

            {!selectedTranslateOption && (
              <div className={styles.answerContainer}>
                <button
                  className={styles.answerToggle}
                  onClick={toggleTranslateAnswer}
                  aria-expanded={showTranslateAnswer}
                >
                  <span className={styles.answerIcon}>✅</span> Show Answer
                </button>

                {showTranslateAnswer && (
                  <div className={styles.answerContent}>
                    <p>
                      <strong>A. Te nowe pióra</strong> – "pens" = pióra
                      (plural), adjective = nowe, "these" = te.
                    </p>
                  </div>
                )}
              </div>
            )}

            {selectedTranslateOption && (
              <div className={styles.answerContent}>
                {selectedTranslateOption === "A" ? (
                  <p className={styles.successFeedback}>
                    <span className={styles.feedbackIcon}>✓</span>
                    <strong>Correct!</strong> "pens" = pióra (plural), adjective
                    = nowe, "these" = te.
                  </p>
                ) : (
                  <p className={styles.errorFeedback}>
                    <span className={styles.feedbackIcon}>✗</span>
                    <strong>Not quite.</strong> The correct answer is A. Te nowe
                    pióra – "pens" = pióra (plural), adjective = nowe, "these" =
                    te.
                  </p>
                )}
              </div>
            )}
          </div>

          <h2 id="step6" className={styles.stepTitle}>
            👶 Step 6: Numbers — Let's Count "It"
          </h2>
          <p>When you count regular "it" things, use normal numbers:</p>

          <div className={styles.simpleWordList}>
            <div className={styles.simpleWordItem}>
              <span className={styles.polishWord}>dwa pióra</span>
              <button
                className={styles.audioButton}
                onClick={() =>
                  playAudio("dwa-piora", "/audio/lesson1/dwa-piora.mp3")
                }
                aria-label={`Listen to pronunciation of dwa pióra`}
              >
                {playingAudio === "dwa-piora" ? (
                  <span className={styles.playingIcon}>🔊</span>
                ) : (
                  <span className={styles.playIcon}>🔈</span>
                )}
              </button>
              <span className={styles.englishWord}>– two pens</span>
            </div>
            <div className={styles.simpleWordItem}>
              <span className={styles.polishWord}>trzy pudełka</span>
              <button
                className={styles.audioButton}
                onClick={() =>
                  playAudio("trzy-pudelka", "/audio/lesson1/trzy-pudelka.mp3")
                }
                aria-label={`Listen to pronunciation of trzy pudełka`}
              >
                {playingAudio === "trzy-pudelka" ? (
                  <span className={styles.playingIcon}>🔊</span>
                ) : (
                  <span className={styles.playIcon}>🔈</span>
                )}
              </button>
              <span className={styles.englishWord}>– three boxes</span>
            </div>
            <div className={styles.simpleWordItem}>
              <span className={styles.polishWord}>cztery okna</span>
              <button
                className={styles.audioButton}
                onClick={() =>
                  playAudio("cztery-okna", "/audio/lesson1/cztery-okna.mp3")
                }
                aria-label={`Listen to pronunciation of cztery okna`}
              >
                {playingAudio === "cztery-okna" ? (
                  <span className={styles.playingIcon}>🔊</span>
                ) : (
                  <span className={styles.playIcon}>🔈</span>
                )}
              </button>
              <span className={styles.englishWord}>– four windows</span>
            </div>
          </div>

          <p>
            BUT — for children, Polish uses a special kind of number to talk
            about a group (especially mixed boys/girls):
          </p>

          <div className={styles.simpleWordList}>
            <div className={styles.simpleWordItem}>
              <span className={styles.polishWord}>dwoje dzieci</span>
              <button
                className={styles.audioButton}
                onClick={() =>
                  playAudio("dwoje-dzieci", "/audio/lesson1/dwoje-dzieci.mp3")
                }
                aria-label={`Listen to pronunciation of dwoje dzieci`}
              >
                {playingAudio === "dwoje-dzieci" ? (
                  <span className={styles.playingIcon}>🔊</span>
                ) : (
                  <span className={styles.playIcon}>🔈</span>
                )}
              </button>
              <span className={styles.englishWord}>– two children</span>
            </div>
            <div className={styles.simpleWordItem}>
              <span className={styles.polishWord}>troje dzieci</span>
              <button
                className={styles.audioButton}
                onClick={() =>
                  playAudio("troje-dzieci", "/audio/lesson1/troje-dzieci.mp3")
                }
                aria-label={`Listen to pronunciation of troje dzieci`}
              >
                {playingAudio === "troje-dzieci" ? (
                  <span className={styles.playingIcon}>🔊</span>
                ) : (
                  <span className={styles.playIcon}>🔈</span>
                )}
              </button>
              <span className={styles.englishWord}>– three children</span>
            </div>
            <div className={styles.simpleWordItem}>
              <span className={styles.polishWord}>czworo dzieci</span>
              <button
                className={styles.audioButton}
                onClick={() =>
                  playAudio("czworo-dzieci", "/audio/lesson1/czworo-dzieci.mp3")
                }
                aria-label={`Listen to pronunciation of czworo dzieci`}
              >
                {playingAudio === "czworo-dzieci" ? (
                  <span className={styles.playingIcon}>🔊</span>
                ) : (
                  <span className={styles.playIcon}>🔈</span>
                )}
              </button>
              <span className={styles.englishWord}>– four children</span>
            </div>
          </div>

          <p className={styles.memoryTip}>
            🧠 Rule: Only dzieci uses these soft, groupy numbers. For everything
            else, just use normal numbers (dwa, trzy, cztery).
          </p>

          <div className={styles.quizSection}>
            <h2 className={styles.quizTitle}>🧠 Quick Check</h2>
            <p className={styles.quizQuestion}>Which is correct?</p>

            <div className={styles.quizOptions}>
              <button
                className={getCountingOptionClassName("A")}
                onClick={() => handleCountingOptionSelect("A")}
                disabled={!!selectedCountingOption}
              >
                <span className={styles.optionLetter}>A.</span> Mam trzy dzieci
              </button>
              <button
                className={getCountingOptionClassName("B")}
                onClick={() => handleCountingOptionSelect("B")}
                disabled={!!selectedCountingOption}
              >
                <span className={styles.optionLetter}>B.</span> Mam troje dzieci
              </button>
              <button
                className={getCountingOptionClassName("C")}
                onClick={() => handleCountingOptionSelect("C")}
                disabled={!!selectedCountingOption}
              >
                <span className={styles.optionLetter}>C.</span> Mam trzy dziecko
              </button>
              <button
                className={getCountingOptionClassName("D")}
                onClick={() => handleCountingOptionSelect("D")}
                disabled={!!selectedCountingOption}
              >
                <span className={styles.optionLetter}>D.</span> Mam troje
                dziecko
              </button>
            </div>

            {!selectedCountingOption && (
              <div className={styles.answerContainer}>
                <button
                  className={styles.answerToggle}
                  onClick={toggleCountingAnswer}
                  aria-expanded={showCountingAnswer}
                >
                  <span className={styles.answerIcon}>✅</span> Show Answer
                </button>

                {showCountingAnswer && (
                  <div className={styles.answerContent}>
                    <p>
                      <strong>B. Mam troje dzieci</strong> — correct collective
                      number + plural.
                    </p>
                  </div>
                )}
              </div>
            )}

            {selectedCountingOption && (
              <div className={styles.answerContent}>
                {selectedCountingOption === "B" ? (
                  <p className={styles.successFeedback}>
                    <span className={styles.feedbackIcon}>✓</span>
                    <strong>Correct!</strong> Troje is the collective number
                    form used with dzieci (plural).
                  </p>
                ) : (
                  <p className={styles.errorFeedback}>
                    <span className={styles.feedbackIcon}>✗</span>
                    <strong>Not quite.</strong> The correct answer is B. Mam
                    troje dzieci — correct collective number + plural.
                  </p>
                )}
              </div>
            )}
          </div>

          <div className={styles.recapSection}>
            <h2 id="recap" className={styles.stepTitle}>
              🔁 Final Recap (Speed Mode)
            </h2>
            <ul className={styles.recapList}>
              <li>If it ends in -o or -e, it's an "it" word.</li>
              <li>Adjectives end in -e: nowe pióro, dobre dziecko.</li>
              <li>"This"/"that"/"one" use to, tamto, jedno.</li>
              <li>Plural: -o/-e → -a (okno → okna)</li>
              <li>Plural adjectives: still -e</li>
              <li>For "dzieci" (children): use dwoje/troje/czworo</li>
            </ul>
          </div>

          <div id="practice" className={styles.practiceFooter}>
            <h2 className={styles.practiceTitle}>Practice Exercises</h2>

            <div className={styles.practiceSection}>
              <h3 className={styles.practiceSectionTitle}>
                🧊 SECTION 1: "It" Words (Neuter Nouns)
              </h3>
              <div className={styles.practiceButtons}>
                <Link
                  to="/lesson/practice/memory-recall"
                  className={styles.practiceButton}
                >
                  <span className={styles.practiceIcon}>🧠</span>
                  <span className={styles.practiceButtonText}>
                    Memory Recall
                  </span>
                </Link>
                <Link
                  to="/lesson/practice/spelling-practice"
                  className={styles.practiceButton}
                >
                  <span className={styles.practiceIcon}>✍️</span>
                  <span className={styles.practiceButtonText}>
                    Spelling Practice
                  </span>
                </Link>
              </div>
            </div>

            <div className={styles.practiceSection}>
              <h3 className={styles.practiceSectionTitle}>
                🧠 SECTION 2: Describing Things (Adjectives - Singular)
              </h3>
              <div className={styles.practiceButtons}>
                <Link
                  to="/lesson/practice/memory-recall?type=section2"
                  className={styles.practiceButton}
                >
                  <span className={styles.practiceIcon}>🧠</span>
                  <span className={styles.practiceButtonText}>
                    Memory Recall
                  </span>
                </Link>
                <Link
                  to="/lesson/practice/spelling-practice?type=section2"
                  className={styles.practiceButton}
                >
                  <span className={styles.practiceIcon}>✍️</span>
                  <span className={styles.practiceButtonText}>
                    Spelling Practice
                  </span>
                </Link>
              </div>
            </div>

            <div className={styles.practiceSection}>
              <h3 className={styles.practiceSectionTitle}>
                🔁 SECTION 3: Plural Forms (Neuter Nouns)
              </h3>
              <div className={styles.practiceButtons}>
                <Link
                  to="/lesson/practice/plural-practice"
                  className={styles.practiceButton}
                >
                  <span className={styles.practiceIcon}>🔄</span>
                  <span className={styles.practiceButtonText}>
                    Plural Practice
                  </span>
                </Link>
              </div>
            </div>

            <div className={styles.practiceSection}>
              <h3 className={styles.practiceSectionTitle}>
                👉 SECTION 4: This, That, and One (Demonstratives)
              </h3>
              <div className={styles.practiceButtons}>
                <Link
                  to="/lesson/practice/memory-recall?type=section4"
                  className={styles.practiceButton}
                >
                  <span className={styles.practiceIcon}>🧠</span>
                  <span className={styles.practiceButtonText}>
                    Memory Recall
                  </span>
                </Link>
                <Link
                  to="/lesson/practice/spelling-practice?type=section4"
                  className={styles.practiceButton}
                >
                  <span className={styles.practiceIcon}>✍️</span>
                  <span className={styles.practiceButtonText}>
                    Spelling Practice
                  </span>
                </Link>
              </div>
            </div>

            <div className={styles.practiceSection}>
              <h3 className={styles.practiceSectionTitle}>
                🔢 SECTION 5: Numbers
              </h3>
              <div className={styles.practiceButtons}>
                <Link
                  to="/lesson/practice/memory-recall?type=section5"
                  className={styles.practiceButton}
                >
                  <span className={styles.practiceIcon}>🧠</span>
                  <span className={styles.practiceButtonText}>
                    Memory Recall
                  </span>
                </Link>
                <Link
                  to="/lesson/practice/spelling-practice?type=section5"
                  className={styles.practiceButton}
                >
                  <span className={styles.practiceIcon}>✍️</span>
                  <span className={styles.practiceButtonText}>
                    Spelling Practice
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Lesson;

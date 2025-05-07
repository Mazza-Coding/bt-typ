import { useState } from "react";
import { Link } from "react-router-dom";
import type { Lesson } from "../../types/lesson";
import styles from "./Home.module.css";

const Home = () => {
  const [searchTerm, setSearchTerm] = useState("");

  // Mock data for the lessons
  const lessons: Lesson[] = [
    {
      id: "1",
      emoji: "🧠",
      title: 'Lesson 1: Talking About "It" Things in Polish',
    },
  ];

  const filteredLessons = lessons.filter((lesson) =>
    lesson.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Zaba</h1>
        <p>Learn Polish with ease</p>
      </header>

      <div className={styles.search}>
        <input
          type="text"
          placeholder="Search lessons..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      <div className={styles.lessonGrid}>
        {filteredLessons.map((lesson) => (
          <Link
            to={`/lesson/${lesson.id}`}
            key={lesson.id}
            className={styles.lessonCard}
          >
            <div className={styles.emoji}>{lesson.emoji}</div>
            <h3>{lesson.title}</h3>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Home;

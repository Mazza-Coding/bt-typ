import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Lesson from "./pages/Lesson";
import MemoryRecall from "./pages/Lesson/MemoryRecall";
import SpellingPractice from "./pages/Lesson/SpellingPractice";
import PluralPractice from "./pages/Lesson/PluralPractice";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/lesson/:id" element={<Lesson />} />
        <Route
          path="/lesson/practice/memory-recall"
          element={<MemoryRecall />}
        />
        <Route
          path="/lesson/practice/spelling-practice"
          element={<SpellingPractice />}
        />
        <Route
          path="/lesson/practice/plural-practice"
          element={<PluralPractice />}
        />
      </Routes>
    </Router>
  );
};

export default App;

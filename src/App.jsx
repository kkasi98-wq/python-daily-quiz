import { useState, useCallback } from 'react';
import StartScreen from './components/StartScreen';
import QuestionScreen from './components/QuestionScreen';
import CompletionScreen from './components/CompletionScreen';
import { loadStats, saveSessionResult } from './utils/storage';
import { selectQuestions } from './utils/quiz';
import allQuestions from './data/questions.json';

export default function App() {
  const [screen, setScreen] = useState('start');
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [sessionResults, setSessionResults] = useState([]);
  const [stats, setStats] = useState(loadStats);

  const startQuiz = useCallback((overrideQuestions = null) => {
    const qs = overrideQuestions ?? selectQuestions(allQuestions, stats);
    setQuestions(qs);
    setCurrentIdx(0);
    setSessionResults([]);
    setScreen('quiz');
  }, [stats]);

  const handleAnswer = useCallback((result) => {
    const newResults = [...sessionResults, result];
    setSessionResults(newResults);
    if (currentIdx + 1 >= questions.length) {
      const newStats = saveSessionResult(newResults);
      setStats(newStats);
      setScreen('completion');
    } else {
      setCurrentIdx(i => i + 1);
    }
  }, [sessionResults, currentIdx, questions.length]);

  const retryWrong = useCallback(() => {
    const wrongQuestions = sessionResults
      .filter(r => !r.isCorrect)
      .map(r => r.question);
    if (wrongQuestions.length > 0) {
      startQuiz(wrongQuestions);
    }
  }, [sessionResults, startQuiz]);

  const goHome = useCallback(() => {
    setStats(loadStats());
    setScreen('start');
  }, []);

  if (screen === 'start') {
    return <StartScreen stats={stats} onStart={() => startQuiz()} />;
  }
  if (screen === 'quiz') {
    return (
      <QuestionScreen
        question={questions[currentIdx]}
        index={currentIdx}
        total={questions.length}
        onAnswer={handleAnswer}
      />
    );
  }
  return (
    <CompletionScreen
      results={sessionResults}
      onRetryWrong={retryWrong}
      onHome={goHome}
    />
  );
}

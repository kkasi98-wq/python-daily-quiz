import { useState, useCallback } from 'react';
import UserSelectScreen from './components/UserSelectScreen';
import StartScreen from './components/StartScreen';
import QuestionScreen from './components/QuestionScreen';
import CompletionScreen from './components/CompletionScreen';
import { loadStats, saveSessionResult } from './utils/storage';
import { selectQuestions } from './utils/quiz';
import allQuestions from './data/questions.json';

export default function App() {
  const [screen, setScreen] = useState('userSelect');
  const [currentUser, setCurrentUser] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [sessionResults, setSessionResults] = useState([]);
  const [stats, setStats] = useState(null);

  const handleSelectUser = useCallback((user) => {
    setCurrentUser(user);
    setStats(loadStats(user.id));
    setScreen('start');
  }, []);

  const goToUserSelect = useCallback(() => {
    setCurrentUser(null);
    setStats(null);
    setScreen('userSelect');
  }, []);

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
      const newStats = saveSessionResult(newResults, currentUser.id);
      setStats(newStats);
      setScreen('completion');
    } else {
      setCurrentIdx(i => i + 1);
    }
  }, [sessionResults, currentIdx, questions.length, currentUser]);

  const retryWrong = useCallback(() => {
    const wrongQuestions = sessionResults
      .filter(r => !r.isCorrect)
      .map(r => r.question);
    if (wrongQuestions.length > 0) startQuiz(wrongQuestions);
  }, [sessionResults, startQuiz]);

  const goHome = useCallback(() => {
    setStats(loadStats(currentUser.id));
    setScreen('start');
  }, [currentUser]);

  if (screen === 'userSelect') {
    return <UserSelectScreen onSelect={handleSelectUser} />;
  }
  if (screen === 'start') {
    return (
      <StartScreen
        stats={stats}
        user={currentUser}
        onStart={() => startQuiz()}
        onChangeUser={goToUserSelect}
      />
    );
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
      user={currentUser}
      onRetryWrong={retryWrong}
      onHome={goHome}
    />
  );
}

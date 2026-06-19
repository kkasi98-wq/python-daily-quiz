const KEY = 'pythonQuizStats';

const DEFAULT_STATS = {
  totalAnswered: 0,
  totalCorrect: 0,
  streak: 0,
  lastStudyDate: null,
  categoryStats: {
    variable:    { correct: 0, total: 0 },
    loop:        { correct: 0, total: 0 },
    conditional: { correct: 0, total: 0 },
    datatype:    { correct: 0, total: 0 },
    list:        { correct: 0, total: 0 },
    simulation:  { correct: 0, total: 0 },
    dictionary:  { correct: 0, total: 0 },
  },
  questionHistory: {},
};

export function loadStats() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return structuredClone(DEFAULT_STATS);
    const parsed = JSON.parse(raw);
    // Ensure all keys exist (backward compat)
    return { ...structuredClone(DEFAULT_STATS), ...parsed };
  } catch {
    return structuredClone(DEFAULT_STATS);
  }
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function yesterdayStr() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

export function saveSessionResult(results) {
  const stats = loadStats();
  const today = todayStr();

  // Update streak
  if (stats.lastStudyDate === today) {
    // Already studied today, streak unchanged
  } else if (stats.lastStudyDate === yesterdayStr()) {
    stats.streak += 1;
  } else {
    stats.streak = 1;
  }
  stats.lastStudyDate = today;

  // Update totals
  results.forEach(({ question, isCorrect }) => {
    stats.totalAnswered += 1;
    if (isCorrect) stats.totalCorrect += 1;

    const cat = question.category;
    if (stats.categoryStats[cat]) {
      stats.categoryStats[cat].total += 1;
      if (isCorrect) stats.categoryStats[cat].correct += 1;
    }

    const qid = question.id;
    if (!stats.questionHistory[qid]) {
      stats.questionHistory[qid] = { correct: 0, total: 0 };
    }
    stats.questionHistory[qid].total += 1;
    if (isCorrect) stats.questionHistory[qid].correct += 1;
  });

  localStorage.setItem(KEY, JSON.stringify(stats));
  return stats;
}

export function resetStats() {
  localStorage.removeItem(KEY);
  return structuredClone(DEFAULT_STATS);
}

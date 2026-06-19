const makeKey = (userId) => `pythonQuizStats_${userId}`;

// 구버전 단일 키 제거 (기록 리셋)
try { localStorage.removeItem('pythonQuizStats'); } catch {}

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

export function loadStats(userId) {
  try {
    const raw = localStorage.getItem(makeKey(userId));
    if (!raw) return structuredClone(DEFAULT_STATS);
    return { ...structuredClone(DEFAULT_STATS), ...JSON.parse(raw) };
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

export function saveSessionResult(results, userId) {
  const stats = loadStats(userId);
  const today = todayStr();

  if (stats.lastStudyDate === today) {
    // 오늘 이미 학습함 — streak 유지
  } else if (stats.lastStudyDate === yesterdayStr()) {
    stats.streak += 1;
  } else {
    stats.streak = 1;
  }
  stats.lastStudyDate = today;

  results.forEach(({ question, isCorrect }) => {
    stats.totalAnswered += 1;
    if (isCorrect) stats.totalCorrect += 1;

    const cat = question.category;
    if (stats.categoryStats[cat]) {
      stats.categoryStats[cat].total += 1;
      if (isCorrect) stats.categoryStats[cat].correct += 1;
    }

    const qid = question.id;
    if (!stats.questionHistory[qid]) stats.questionHistory[qid] = { correct: 0, total: 0 };
    stats.questionHistory[qid].total += 1;
    if (isCorrect) stats.questionHistory[qid].correct += 1;
  });

  localStorage.setItem(makeKey(userId), JSON.stringify(stats));
  return stats;
}

export function resetStats(userId) {
  localStorage.removeItem(makeKey(userId));
  return structuredClone(DEFAULT_STATS);
}

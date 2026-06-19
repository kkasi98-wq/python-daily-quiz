function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function randomInt(min, max) {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function questionWeight(question, history) {
  const h = history[question.id];
  if (!h || h.total === 0) return 2;
  // Higher weight for questions answered wrong more often
  const wrongRate = 1 - h.correct / h.total;
  return 1 + wrongRate * 3;
}

function weightedPick(pool, count, history) {
  if (pool.length === 0) return [];
  const available = [...pool];
  const picked = [];
  const take = Math.min(count, available.length);
  for (let k = 0; k < take; k++) {
    const weights = available.map(q => questionWeight(q, history));
    const total = weights.reduce((s, w) => s + w, 0);
    let rand = Math.random() * total;
    let idx = 0;
    for (let i = 0; i < weights.length; i++) {
      rand -= weights[i];
      if (rand <= 0) { idx = i; break; }
    }
    picked.push(available[idx]);
    available.splice(idx, 1);
  }
  return picked;
}

export function selectQuestions(allQuestions, stats) {
  const history = stats?.questionHistory ?? {};
  const byCategory = {};
  allQuestions.forEach(q => {
    if (!byCategory[q.category]) byCategory[q.category] = [];
    byCategory[q.category].push(q);
  });

  // Target: variable 3-4, loop 3-4, dictionary 1 (고정), rest distributed
  const varCount = randomInt(3, 4);
  const loopCount = randomInt(3, 4);
  const dictCount = 1;
  const remaining = 10 - varCount - loopCount - dictCount;

  const others = ['conditional', 'datatype', 'list', 'simulation'];
  const otherCounts = [0, 0, 0, 0];
  for (let i = 0; i < remaining; i++) {
    otherCounts[i % others.length] += 1;
  }
  // Shuffle so the extra doesn't always go to the same category
  const shuffledOthers = shuffle(others.map((cat, i) => ({ cat, count: otherCounts[i] })));

  const selected = [
    ...weightedPick(byCategory['variable'] ?? [], varCount, history),
    ...weightedPick(byCategory['loop'] ?? [], loopCount, history),
    ...weightedPick(byCategory['dictionary'] ?? [], dictCount, history),
    ...shuffledOthers.flatMap(({ cat, count }) =>
      weightedPick(byCategory[cat] ?? [], count, history)
    ),
  ];

  return shuffle(selected);
}

export function checkAnswer(userAnswer, question) {
  if (question.type === 'multiple_choice') {
    return userAnswer.trim() === question.answer.trim();
  }
  // short_answer: trim + lowercase + normalize whitespace
  const normalize = s => s.trim().toLowerCase().replace(/\s+/g, ' ');
  return normalize(userAnswer) === normalize(question.answer);
}

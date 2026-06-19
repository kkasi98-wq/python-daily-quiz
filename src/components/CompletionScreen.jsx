import { useState } from 'react';

const CATEGORY_LABELS = {
  variable:    '변수',
  loop:        '반복문',
  conditional: '조건문',
  datatype:    '자료형',
  list:        '리스트',
  simulation:  '시뮬레이션',
  dictionary:  '딕셔너리',
};

const CATEGORY_COLORS = {
  variable:    '#6366F1',
  loop:        '#8B5CF6',
  conditional: '#EC4899',
  datatype:    '#F59E0B',
  list:        '#10B981',
  simulation:  '#3B82F6',
  dictionary:  '#14B8A6',
};

function CodeBlockPrint({ code }) {
  return (
    <pre className="print-code">
      {code.split('\n').map((line, i) => (
        <div key={i}>
          <span className="print-linenum">{i + 1}</span>
          {line}
        </div>
      ))}
    </pre>
  );
}

function buildCatMap(results) {
  const catMap = {};
  results.forEach(r => {
    const cat = r.question.category;
    if (!catMap[cat]) catMap[cat] = { correct: 0, total: 0 };
    catMap[cat].total += 1;
    if (r.isCorrect) catMap[cat].correct += 1;
  });
  return catMap;
}

function PrintView({ results, label }) {
  const correctCount = results.filter(r => r.isCorrect).length;
  const total = results.length;
  const pct = Math.round((correctCount / total) * 100);
  const catMap = buildCatMap(results);
  const today = new Date().toLocaleDateString('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric', weekday: 'long',
  });

  return (
    <>
      <div className="print-header">
        <h1 className="print-main-title">🐍 파이썬 학습 결과</h1>
        {label && <p className="print-label">{label}</p>}
        <p className="print-date">{today}</p>
        <p className="print-score">
          정답 {correctCount} / {total} 문제 &nbsp;|&nbsp; 정답률 {pct}%
        </p>
      </div>

      <table className="print-cat-table">
        <thead>
          <tr><th>영역</th><th>정답</th><th>전체</th><th>정답률</th></tr>
        </thead>
        <tbody>
          {Object.entries(catMap).map(([cat, { correct, total: t }]) => (
            <tr key={cat}>
              <td>{CATEGORY_LABELS[cat]}</td>
              <td>{correct}</td>
              <td>{t}</td>
              <td>{t > 0 ? Math.round((correct / t) * 100) : 0}%</td>
            </tr>
          ))}
        </tbody>
      </table>

      <hr className="print-divider" />

      {results.map((r, idx) => (
        <div key={r.question.id + idx} className="print-question">
          <div className="print-q-header">
            <span className="print-q-num">문제 {idx + 1}</span>
            <span className="print-q-cat">[{CATEGORY_LABELS[r.question.category]}]</span>
            <span className={`print-q-result ${r.isCorrect ? 'print-correct' : 'print-wrong'}`}>
              {r.isCorrect ? '⭕ 정답' : '❌ 오답'}
            </span>
          </div>
          <p className="print-q-title">{r.question.title}</p>
          {r.question.code && <CodeBlockPrint code={r.question.code} />}
          {r.question.type === 'multiple_choice' && (
            <ul className="print-choices">
              {r.question.choices.map((c, ci) => (
                <li
                  key={ci}
                  className={
                    c === r.question.answer ? 'print-choice-correct' :
                    c === r.userAnswer ? 'print-choice-wrong' : ''
                  }
                >
                  {'①②③④⑤'[ci]} {c}
                </li>
              ))}
            </ul>
          )}
          <div className="print-answer-line">
            내 답: <strong>{r.userAnswer || '(미응답)'}</strong>
            &nbsp;&nbsp; 정답: <strong className="green">{r.question.answer}</strong>
          </div>
          <div className="print-explanation">
            <strong>📝 단계별 풀이</strong>
            <ol>
              {r.question.explanation_steps.map((s, i) => <li key={i}>{s}</li>)}
            </ol>
            {r.question.concept_tip && (
              <p className="print-tip">💡 {r.question.concept_tip}</p>
            )}
          </div>
        </div>
      ))}
    </>
  );
}

export default function CompletionScreen({ results, primaryResults, onRetryWrong, onHome }) {
  const [expandedIdx, setExpandedIdx] = useState(null);
  // printMode: 'current' | 'primary'
  const [printMode, setPrintMode] = useState('current');

  const wrongResults = results.filter(r => !r.isCorrect);
  const correctCount = results.filter(r => r.isCorrect).length;
  const total = results.length;
  const pct = Math.round((correctCount / total) * 100);
  const catMap = buildCatMap(results);
  const isRetrySession = primaryResults != null;

  const today = new Date().toLocaleDateString('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric', weekday: 'long',
  });

  function handlePrint(mode) {
    setPrintMode(mode);
    // React가 렌더링을 마친 뒤 프린트 다이얼로그 열기
    requestAnimationFrame(() => requestAnimationFrame(() => window.print()));
  }

  return (
    <>
      {/* ── 화면 콘텐츠 (인쇄 시 숨김) ── */}
      <div className="container no-print">
        <div className="card completion-hero">
          <div className="completion-emoji">
            {pct >= 80 ? '🎉' : pct >= 60 ? '👍' : '💪'}
          </div>
          <h1 className="completion-title">
            {isRetrySession ? '오답 재풀이 완료!' : '오늘 학습 완료!'}
          </h1>
          <p className="completion-date">{today}</p>
          <div className="score-display">
            <span className="score-num">{correctCount}</span>
            <span className="score-sep"> / </span>
            <span className="score-total">{total}</span>
            <span className="score-pct"> ({pct}%)</span>
          </div>
          <p className="score-message">
            {pct >= 90 ? '완벽해요! 최고예요 🌟' :
             pct >= 70 ? '잘 했어요! 조금만 더 💪' :
             '틀린 문제를 꼭 복습해요 📖'}
          </p>
        </div>

        {/* 영역별 결과 */}
        {Object.keys(catMap).length > 0 && (
          <div className="card">
            <h2 className="section-title">영역별 결과</h2>
            {Object.entries(catMap).map(([cat, { correct, total: t }]) => (
              <div key={cat} className="cat-result-row">
                <span
                  className="cat-badge"
                  style={{ background: CATEGORY_COLORS[cat] + '22', color: CATEGORY_COLORS[cat] }}
                >
                  {CATEGORY_LABELS[cat]}
                </span>
                <div className="cat-dots">
                  {Array.from({ length: t }).map((_, i) => (
                    <span key={i} className={`cat-dot ${i < correct ? 'hit' : 'miss'}`} />
                  ))}
                </div>
                <span className="cat-fraction">{correct}/{t}</span>
              </div>
            ))}
          </div>
        )}

        {/* 버튼 */}
        <div className="action-buttons">
          {/* 재풀이 세션이면 두 PDF 버튼, 아니면 하나 */}
          {isRetrySession ? (
            <>
              <button className="btn-pdf" onClick={() => handlePrint('primary')}>
                🖨️ 전체 세션 PDF 저장 ({primaryResults.length}문제)
              </button>
              <button className="btn-pdf-secondary" onClick={() => handlePrint('current')}>
                🖨️ 오답 재풀이 PDF 저장 ({results.length}문제)
              </button>
            </>
          ) : (
            <button className="btn-pdf" onClick={() => handlePrint('current')}>
              🖨️ 결과 PDF 저장
            </button>
          )}
          {wrongResults.length > 0 && (
            <button className="btn-retry" onClick={onRetryWrong}>
              🔄 오답만 다시 풀기 ({wrongResults.length}문제)
            </button>
          )}
          <button className="btn-home" onClick={onHome}>
            🏠 홈으로
          </button>
        </div>

        {/* 틀린 문제 다시 보기 */}
        {wrongResults.length > 0 && (
          <div className="card">
            <h2 className="section-title">틀린 문제 다시 보기</h2>
            {wrongResults.map((r, idx) => (
              <div key={r.question.id} className="review-item">
                <button
                  className="review-toggle"
                  onClick={() => setExpandedIdx(expandedIdx === idx ? null : idx)}
                >
                  <span className="review-num">Q{results.indexOf(r) + 1}</span>
                  <span className="review-title">{r.question.title}</span>
                  <span className="review-chevron">{expandedIdx === idx ? '▲' : '▼'}</span>
                </button>
                {expandedIdx === idx && (
                  <div className="review-body">
                    {r.question.code && <CodeBlockPrint code={r.question.code} />}
                    <p className="review-myanswer">내 답: <strong>{r.userAnswer || '(미응답)'}</strong></p>
                    <p className="review-correct">정답: <strong className="green">{r.question.answer}</strong></p>
                    <ol className="steps">
                      {r.question.explanation_steps.map((s, i) => (
                        <li key={i} className="step">{s}</li>
                      ))}
                    </ol>
                    {r.question.concept_tip && (
                      <div className="concept-tip">
                        <span className="tip-icon">💡</span>
                        <span className="tip-text">{r.question.concept_tip}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── 인쇄 전용 뷰 (printMode에 따라 다른 결과 출력) ── */}
      <div className="print-only">
        {printMode === 'primary' && primaryResults ? (
          <PrintView
            results={primaryResults}
            label="전체 세션 결과"
          />
        ) : (
          <PrintView
            results={results}
            label={isRetrySession ? '오답 재풀이 결과' : null}
          />
        )}
      </div>
    </>
  );
}

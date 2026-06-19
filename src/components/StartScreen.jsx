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

function StatBar({ label, correct, total, color }) {
  const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
  return (
    <div className="stat-row">
      <span className="stat-label">{label}</span>
      <div className="stat-track">
        <div
          className="stat-fill"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      <span className="stat-pct">{total > 0 ? `${pct}%` : '-'}</span>
    </div>
  );
}

export default function StartScreen({ stats, user, onStart, onChangeUser }) {
  const { totalAnswered, totalCorrect, streak, categoryStats } = stats;
  const overallPct = totalAnswered > 0
    ? Math.round((totalCorrect / totalAnswered) * 100)
    : null;

  return (
    <div className="container">
      {/* 현재 유저 표시 */}
      <div className="user-header">
        <span className="user-header-emoji">{user.emoji}</span>
        <span className="user-header-name">{user.label}의 학습</span>
        <button className="user-header-btn" onClick={onChangeUser}>
          사용자 바꾸기
        </button>
      </div>

      <div className="hero-card">
        <div className="hero-emoji">🐍</div>
        <h1 className="hero-title">파이썬 매일 학습</h1>
        <p className="hero-sub">매일 10문제 · 중간고사 완벽 대비</p>
        <button className="btn-start" onClick={onStart}>
          오늘의 학습 시작 →
        </button>
      </div>

      {totalAnswered > 0 ? (
        <>
          <div className="card">
            <h2 className="section-title">내 학습 기록</h2>
            <div className="stat-grid">
              <div className="stat-box">
                <div className="stat-num">{totalAnswered}</div>
                <div className="stat-desc">총 푼 문제</div>
              </div>
              <div className="stat-box">
                <div className="stat-num">{overallPct}%</div>
                <div className="stat-desc">전체 정답률</div>
              </div>
              <div className="stat-box">
                <div className="stat-num">{streak}일 🔥</div>
                <div className="stat-desc">연속 학습</div>
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="section-title">영역별 정답률</h2>
            <div className="stat-bars">
              {Object.entries(categoryStats).map(([cat, { correct, total }]) => (
                <StatBar
                  key={cat}
                  label={CATEGORY_LABELS[cat]}
                  correct={correct}
                  total={total}
                  color={CATEGORY_COLORS[cat]}
                />
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="card welcome-card">
          <p className="welcome-text">
            아직 학습 기록이 없습니다.<br />
            오늘부터 시작해 보세요! 💪
          </p>
          <ul className="welcome-tips">
            <li>매일 10문제 · 변수와 반복문 집중 출제</li>
            <li>채점 후 단계별 풀이 제공</li>
            <li>완료 후 결과 PDF 저장 가능</li>
          </ul>
        </div>
      )}
    </div>
  );
}

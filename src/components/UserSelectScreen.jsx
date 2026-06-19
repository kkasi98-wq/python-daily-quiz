import { loadStats } from '../utils/storage';

export const USERS = [
  { id: 'daughter', label: '딸',  emoji: '👧', color: '#EC4899' },
  { id: 'mom',      label: '엄마', emoji: '👩', color: '#8B5CF6' },
  { id: 'dad',      label: '아빠', emoji: '👨', color: '#3B82F6' },
];

function UserCard({ user, onSelect }) {
  const stats = loadStats(user.id);
  const hasHistory = stats.totalAnswered > 0;
  const pct = hasHistory
    ? Math.round((stats.totalCorrect / stats.totalAnswered) * 100)
    : null;

  return (
    <button
      className="user-card"
      style={{ '--user-color': user.color }}
      onClick={() => onSelect(user)}
    >
      <span className="user-card-emoji">{user.emoji}</span>
      <div className="user-card-info">
        <span className="user-card-name">{user.label}</span>
        <span className="user-card-stats">
          {hasHistory
            ? `${stats.totalAnswered}문제 · 정답률 ${pct}% · ${stats.streak}일 🔥`
            : '아직 기록 없음'}
        </span>
      </div>
      <span className="user-card-arrow">→</span>
    </button>
  );
}

export default function UserSelectScreen({ onSelect }) {
  return (
    <div className="container">
      <div className="user-select-hero">
        <div className="user-select-snake">🐍</div>
        <h1 className="user-select-title">파이썬 매일 학습</h1>
        <p className="user-select-sub">누가 학습할까요?</p>
      </div>
      <div className="user-cards">
        {USERS.map(user => (
          <UserCard key={user.id} user={user} onSelect={onSelect} />
        ))}
      </div>
    </div>
  );
}

import { useState } from 'react';
import { checkAnswer } from '../utils/quiz';

const CHOICE_LABELS = ['①', '②', '③', '④', '⑤'];

const CATEGORY_LABELS = {
  variable:    '변수',
  loop:        '반복문',
  conditional: '조건문',
  datatype:    '자료형',
  list:        '리스트',
  simulation:  '시뮬레이션',
  dictionary:  '딕셔너리',
};

const DIFFICULTY_LABELS = {
  easy:   '쉬움',
  medium: '보통',
  hard:   '어려움',
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

function CodeBlock({ code }) {
  const lines = code.split('\n');
  return (
    <pre className="code-block" aria-label="코드">
      {lines.map((line, i) => (
        <div key={i} className="code-line">
          <span className="line-num">{i + 1}</span>
          <span className="line-content">{line}</span>
        </div>
      ))}
    </pre>
  );
}

export default function QuestionScreen({ question, index, total, onAnswer }) {
  const [selected, setSelected] = useState(null);   // MC: string, SA: string input
  const [inputVal, setInputVal] = useState('');
  const [graded, setGraded] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const isMultipleChoice = question.type === 'multiple_choice';
  const userAnswer = isMultipleChoice ? selected : inputVal;
  const canGrade = isMultipleChoice ? selected !== null : inputVal.trim() !== '';

  function handleGrade() {
    const correct = checkAnswer(userAnswer, question);
    setIsCorrect(correct);
    setGraded(true);
  }

  function handleNext() {
    onAnswer({ question, userAnswer, isCorrect });
    setSelected(null);
    setInputVal('');
    setGraded(false);
    setIsCorrect(false);
  }

  const catColor = CATEGORY_COLORS[question.category] ?? '#64748B';

  return (
    <div className="container">
      {/* Progress bar */}
      <div className="progress-header">
        <div className="progress-meta">
          <span
            className="badge"
            style={{ background: catColor + '22', color: catColor, border: `1.5px solid ${catColor}55` }}
          >
            {CATEGORY_LABELS[question.category]}
          </span>
          <span className="difficulty-label">{DIFFICULTY_LABELS[question.difficulty]}</span>
          <span className="progress-count">{index + 1} / {total}</span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${((index) / total) * 100}%` }} />
        </div>
        <div className="progress-dots">
          {Array.from({ length: total }).map((_, i) => (
            <span key={i} className={`dot ${i < index ? 'done' : i === index ? 'current' : ''}`} />
          ))}
        </div>
      </div>

      <div className="card question-card">
        <p className="question-title">{question.title}</p>
        {question.code && <CodeBlock code={question.code} />}

        {/* Choices */}
        {isMultipleChoice ? (
          <div className="choices">
            {question.choices.map((choice, ci) => {
              let cls = 'choice-btn';
              if (graded) {
                if (choice === question.answer) cls += ' correct';
                else if (choice === selected) cls += ' wrong';
              } else if (choice === selected) {
                cls += ' selected';
              }
              return (
                <button
                  key={ci}
                  className={cls}
                  disabled={graded}
                  onClick={() => !graded && setSelected(choice)}
                >
                  <span className="choice-label">{CHOICE_LABELS[ci]}</span>
                  <span className="choice-text">{choice}</span>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="sa-input-area">
            <input
              className="sa-input"
              type="text"
              placeholder="답을 입력하세요"
              value={inputVal}
              onChange={e => !graded && setInputVal(e.target.value)}
              disabled={graded}
              onKeyDown={e => e.key === 'Enter' && canGrade && !graded && handleGrade()}
            />
          </div>
        )}

        {/* Grade button */}
        {!graded && (
          <button
            className="btn-primary"
            onClick={handleGrade}
            disabled={!canGrade}
          >
            채점하기
          </button>
        )}
      </div>

      {/* Result panel */}
      {graded && (
        <div className={`result-card ${isCorrect ? 'result-correct' : 'result-wrong'}`}>
          <div className="result-icon">{isCorrect ? '⭕' : '❌'}</div>
          <div className="result-verdict">{isCorrect ? '정답입니다!' : '틀렸습니다'}</div>

          {!isCorrect && (
            <div className="correct-answer-box">
              <span className="correct-label">정답:</span>
              <span className="correct-value">{question.answer}</span>
            </div>
          )}
          {!isCorrect && !isMultipleChoice && (
            <div className="my-answer-box">
              <span className="correct-label">내 답:</span>
              <span className="my-value">{userAnswer}</span>
            </div>
          )}

          <div className="explanation">
            <div className="explanation-title">📝 단계별 풀이</div>
            <ol className="steps">
              {question.explanation_steps.map((step, i) => (
                <li key={i} className="step">{step}</li>
              ))}
            </ol>
          </div>

          {question.concept_tip && (
            <div className="concept-tip">
              <span className="tip-icon">💡</span>
              <span className="tip-text">{question.concept_tip}</span>
            </div>
          )}

          <button className="btn-next" onClick={handleNext}>
            {index + 1 < 10 ? '다음 문제 →' : '결과 보기 →'}
          </button>
        </div>
      )}
    </div>
  );
}

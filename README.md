# 파이썬 매일 학습 🐍

하나고 1학년 파이썬 기말고사 대비 **자가학습 웹사이트**.  
매일 10문제 풀고, 채점·풀이 확인 후, 결과를 PDF로 저장한다.

---

## 1. 로컬 실행 방법

```bash
# 의존성 설치 (최초 1회)
npm install

# 개발 서버 실행
npm run dev
# → http://localhost:5173 열면 됨
```

---

## 2. Vercel 배포 방법 (단계별)

> 아빠 계정에 GitHub 레포가 없어도 Vercel CLI로 직접 배포할 수 있다.

### 방법 A — Vercel CLI (권장)

```bash
# Vercel CLI 전역 설치
npm i -g vercel

# 처음 배포
vercel

# 이후 배포 (프로덕션)
vercel --prod
```

CLI가 물어보는 설정:
- Framework Preset: **Vite**
- Build Command: `npm run build`
- Output Directory: `dist`

### 방법 B — GitHub + Vercel 대시보드

1. 이 폴더를 GitHub 레포에 올린다.
2. [vercel.com](https://vercel.com) → **Add New Project** → GitHub 레포 선택.
3. Framework: **Vite** 자동 감지됨.
4. **Deploy** 클릭 → 완료.

이후 `main` 브랜치에 push할 때마다 자동 재배포된다.

---

## 3. 문제 추가 방법 (`questions.json` 편집)

파일 경로: `src/data/questions.json`

각 문제 구조:

```json
{
  "id": "var_016",
  "category": "variable",
  "type": "multiple_choice",
  "difficulty": "medium",
  "title": "다음 코드의 실행 결과는?",
  "code": "x = 3\nx **= 2\nprint(x)",
  "choices": ["6", "8", "9", "32", "에러"],
  "answer": "9",
  "explanation_steps": [
    "x = 3",
    "x **= 2 → x = 3 ** 2 = 9",
    "print(9)"
  ],
  "concept_tip": "** 는 거듭제곱 연산자."
}
```

### 필드 설명

| 필드 | 값 | 설명 |
|---|---|---|
| `id` | 문자열 | 고유한 ID (겹치면 안 됨) |
| `category` | `variable` \| `loop` \| `conditional` \| `datatype` \| `list` \| `simulation` | 출제 영역 |
| `type` | `multiple_choice` \| `short_answer` | 객관식/주관식 |
| `difficulty` | `easy` \| `medium` \| `hard` | 난이도 |
| `title` | 문자열 | 문제 지문 |
| `code` | 문자열 (줄바꿈: `\n`) | 코드 (없으면 `""`) |
| `choices` | 배열 (MC: 2~5개, SA: `[]`) | 객관식 보기 |
| `answer` | 문자열 | 정답 (MC: choices 중 하나와 정확히 일치해야 함) |
| `explanation_steps` | 문자열 배열 | 단계별 풀이 |
| `concept_tip` | 문자열 | 개념 팁 |

> **중요**: `answer`는 `choices` 배열의 값 중 하나와 **완전히 동일한 문자열**이어야 한다.

---

## 4. 폴더 구조

```
PrjPythonExam/
├── index.html              # HTML 진입점
├── package.json
├── vite.config.js
├── README.md
└── src/
    ├── main.jsx            # React 진입점
    ├── App.jsx             # 화면 상태 관리 (시작→문제→완료)
    ├── index.css           # 전체 스타일 + 인쇄 CSS
    ├── data/
    │   └── questions.json  # 문제은행 (60문제)
    ├── utils/
    │   ├── storage.js      # localStorage 읽기/쓰기
    │   └── quiz.js         # 문제 선택 로직 + 채점
    └── components/
        ├── StartScreen.jsx     # 홈 화면 (통계·시작 버튼)
        ├── QuestionScreen.jsx  # 문제 화면 (채점·풀이)
        └── CompletionScreen.jsx # 완료 화면 (결과·PDF·오답복습)
```

---

## 5. PDF 방식 선택 이유

**`window.print()` + `@media print` CSS 방식을 선택**했다.

- jsPDF는 한글 폰트를 base64로 직접 임베드해야 한다. 임베드하지 않으면 한글이 모두 빈칸(□□□)으로 깨진다. 폰트 파일 크기가 수 MB에 달해 번들이 무거워지고, 폰트 라이선스도 별도로 확인해야 한다.
- `window.print()`는 브라우저가 이미 시스템 폰트(맑은 고딕, 나눔고딕 등)를 사용해 렌더링한 화면을 그대로 PDF로 내보내므로 **한글이 절대 깨지지 않는다**.
- 사용자는 인쇄 대화상자에서 **"PDF로 저장"** 을 선택하면 된다 (Chrome/Edge/Safari 모두 지원).

---

## 6. localStorage 한계

- **기기·브라우저가 바뀌면 누적 기록이 초기화된다.** 학교 컴퓨터 vs 집 컴퓨터 간 공유 불가.
- 브라우저 설정에서 "사이트 데이터 삭제" 시 기록 삭제됨.
- 보완책: 매 세션 후 PDF를 저장해 두면 오프라인 영구 기록으로 활용 가능.

---

## 7. 출제 비중

| 영역 | 매 세션 목표 문제 수 | 이유 |
|---|---|---|
| 변수 | 3~4문제 | 딸이 복합대입·자료형 취약 |
| 반복문 | 3~4문제 | 딸이 range·break/continue 취약 |
| 조건문·자료형·리스트·시뮬레이션 | 나머지 2~4문제 | 골고루 |

틀린 문제는 다음 세션에서 가중치가 높아져 다시 출제될 가능성이 높아진다.

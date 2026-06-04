# 🌡️ 마음 온도 - 감정 일기장 서비스

하루 한 줄의 일기를 작성하면 AI가 감정을 분석하고 월별 통계를 시각화해주는 웹 기반 감정 일기장 서비스입니다.

## ✨ 주요 기능

### 1. **AI 감정 분석**
- OpenAI GPT API를 활용한 실시간 감정 분석
- 5가지 감정 분류: 기쁨, 평온, 우울, 분노, 불안
- 0~100 온도 스케일로 긍정/부정 정도 수치화

### 2. **데이터 저장 및 관리**
- 브라우저 Local Storage를 활용한 로컬 데이터 저장
- 새로고침해도 모든 데이터 유지
- 기록 삭제 기능

### 3. **월별 통계 시각화**
- Chart.js를 활용한 부드러운 도넛 차트
- 월별 감정 분포 한눈에 파악
- 실시간 통계 업데이트

### 4. **우아한 UI/UX**
- Biomorphic 디자인: 모든 요소가 둥근 알약(Pill) 형태
- Soft Drop Shadow: 부드러운 그림자로 자연스러운 레이아웃
- 반응형 디자인: 모바일, 태블릿, 데스크톱 모두 지원

## 🎨 디자인 특징

- **배경색**: rgb(245, 237, 227) - 따뜻한 베이지 톤
- **색상 팔레트**: 파스텔 톤의 그라디언트
- **요소 형태**: 모서리가 완전히 둥근 알약 형태 (border-radius: 50px 이상)
- **그림자**: 선(Border) 대신 부드러운 드롭 섀도우 사용

## 🚀 시작하기

### 1. 프로젝트 설정
```bash
# 프로젝트 폴더로 이동
cd "c:\Users\user\Desktop\마음 온도"

# 서버 실행
npm start
```

### 2. 브라우저 접속
```
http://localhost:3000
```

### 3. Google Gemini API 키 입력 (2가지 방법)

**방법 1: .env.local 파일 편집 (권장)**
1. `.env.local` 파일 열기
2. `GEMINI_API_KEY=` 뒤에 API 키 붙여넣기
3. 파일 저장
4. 브라우저 새로고침

**방법 2: 프롬프트 입력**
- 처음 접속 시 또는 헤더의 상태 표시를 클릭하면 API 키 입력 프롬프트
- [Google AI Studio](https://aistudio.google.com/app/apikey)에서 API 키 발급
- 프롬프트에 붙여넣기

## 📋 사용 방법

1. **일기 작성**: 화면 중앙의 텍스트 입력창에 오늘 하루를 한 줄로 표현
2. **분석 요청**: 원형의 '기록' 버튼 클릭
3. **결과 확인**: AI가 분석한 감정과 온도 점수 확인
4. **통계 확인**: 화면 하단의 차트에서 월별 감정 분포 확인

## 🛠 기술 스택

### Frontend
- **HTML5**: 시맨틱 마크업
- **CSS3**: Flexbox, Grid, 애니메이션
- **JavaScript**: Vanilla JS (프레임워크 없음)
- **Chart.js**: 데이터 시각화

### Backend
- **Node.js**: HTTP 서버
- **Google Gemini API**: 감정 분석 (무료 API)

### Storage
- **Local Storage**: 브라우저 로컬 저장

## 📁 파일 구조

```
마음 온도/
├── index.html           # HTML 마크업
├── style.css            # 스타일링 (Biomorphic Design)
├── app.js               # JavaScript 로직
├── server.mjs           # Node.js 서버
├── package.json         # 프로젝트 설정
└── README.md            # 이 파일
```

## 🔄 데이터 흐름

```
일기 입력
    ↓
AI 감정 분석 (OpenAI API)
    ↓
분석 결과 표시
    ↓
Local Storage에 저장
    ↓
차트 업데이트
    ↓
UI 갱신
```

## 💾 Local Storage 데이터 구조

```javascript
{
  "diaryEntries": [
    {
      "id": 1717428000000,
      "text": "오늘 날씨가 정말 좋아서 기분이 좋다",
      "emotion": "joy",
      "temperature": 85,
      "description": "긍정적이고 밝은 기분이 드러납니다",
      "date": "2024-06-04T10:30:00.000Z",
      "month": "2024-06"
    }
  ]
}
```

## 🎯 감정 분류

| 감정 | 이모지 | 설명 |
|------|--------|------|
| 기쁨 | 😊 | 긍정적이고 밝은 감정 |
| 평온 | 😌 | 차분하고 안정적인 감정 |
| 우울 | 😢 | 슬프고 무거운 감정 |
| 분노 | 😠 | 화난 상태 |
| 불안 | 😰 | 불안하고 초조한 감정 |

## ⚙️ 환경 설정

### Google Gemini API 키
- [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)에서 발급
- `.env.local` 파일에 `GEMINI_API_KEY=키값` 형식으로 입력 (권장)
- 또는 처음 실행 시 프롬프트에 입력
- **무료 한도**: 월 60회 요청 무료

### 권장 사양
- Node.js 14 이상
- 최신 버전의 Chrome, Firefox, Safari, Edge 브라우저
- 인터넷 연결 필수 (Gemini API 호출)

## 🔐 보안 주의사항

⚠️ **중요**: API 키가 Local Storage에 평문으로 저장됩니다. 
- 공용 기기에서 사용하지 마세요
- API 키 노출 시 즉시 재생성하세요
- 프로덕션 환경에서는 백엔드에서 API 호출을 처리하세요

## 🐛 문제 해결

### "API 오류" 메시지가 표시됨
- API 키가 올바른지 확인하세요
- OpenAI API 잔액/한도를 확인하세요
- 브라우저 콘솔에서 에러 메시지 확인

### 차트가 표시되지 않음
- 최소 1개 이상의 일기 기록이 필요합니다
- Local Storage가 활성화되어 있는지 확인하세요

### 데이터가 저장되지 않음
- 브라우저의 Local Storage 용량 확인
- 개인정보 보호 모드(시크릿 모드)에서는 작동하지 않습니다

## 📈 향후 개선 예정

- [ ] 데이터베이스 연동 (MongoDB, Firebase 등)
- [ ] 사용자 계정 시스템
- [ ] 고급 통계 분석 (감정 추이, 예측)
- [ ] 음성 일기 입력
- [ ] PWA 지원 (오프라인 작동)
- [ ] 다크 모드
- [ ] 소셜 공유 기능

## 📄 라이선스

MIT License

## 👨‍💻 개발자

마음 온도 개발팀

---

**함께 만드는 감정의 기록, 마음 온도**

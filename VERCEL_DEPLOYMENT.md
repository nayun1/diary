# Vercel 배포 가이드

## 🚀 5분 안에 배포하기

### 1단계: GitHub에 푸시
```bash
cd "c:\Users\user\Desktop\마음 온도"
git add .
git commit -m "Add Vercel deployment configuration"
git push origin main
```

### 2단계: Vercel 계정 만들기
1. https://vercel.com 방문
2. GitHub으로 가입 (권장)
3. 이메일 인증

### 3단계: 프로젝트 배포
1. Vercel 대시보드에서 **"Add New"** → **"Project"** 클릭
2. GitHub 저장소 선택 (`nayun1/mind-temperature` 또는 저장소명)
3. **Import** 클릭
4. 환경 변수 설정:
   - **변수명**: `GEMINI_API_KEY`
   - **값**: Google Gemini API 키 붙여넣기
5. **Deploy** 클릭

### 4단계: 완료! 🎉
- 배포 완료 후 제공되는 URL로 접속
- 예: `https://your-project.vercel.app`

---

## 📋 배포 후 확인사항

- ✅ 홈페이지 접속 가능
- ✅ 기록 버튼 클릭 후 일기 작성 가능
- ✅ 감정 분석 정상 작동
- ✅ 달력, 분석, 검색 등 모든 페이지 작동

## 🔄 배포 후 코드 수정시

1. 로컬에서 코드 수정
2. Git 커밋 및 푸시
```bash
git add .
git commit -m "Fix: 수정 내용"
git push origin main
```
3. Vercel이 자동으로 재배포

## 🆘 문제 해결

### 배포 실패
- Vercel 대시보드에서 "Deployments" 탭 확인
- 빌드 로그에서 오류 확인

### API 키 오류
- Vercel 프로젝트 설정에서 환경 변수 재확인
- `GEMINI_API_KEY` 정확히 입력했는지 확인

### 정적 파일 로드 안 됨
- `vercel.json`에서 라우팅 규칙 확인

---

## 📚 유용한 링크

- Vercel 대시보드: https://vercel.com/dashboard
- Vercel 문서: https://vercel.com/docs
- Google Gemini API: https://aistudio.google.com

즐거운 배포 되세요! 🌡️✨

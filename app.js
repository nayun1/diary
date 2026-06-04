// ==================== 설정 ==================== 
const CONFIG = {
    GEMINI_API_KEY: '', // .env.local에서 로드됨
    emotions: {
        joy: { emoji: '😊', name: '기쁨', color: '#FFB347' },
        calm: { emoji: '😌', name: '평온', color: '#87CEEB' },
        sadness: { emoji: '😢', name: '우울', color: '#6495ED' },
        anger: { emoji: '😠', name: '분노', color: '#FF6B6B' },
        anxiety: { emoji: '😰', name: '불안', color: '#FF69B4' }
    }
};

// ==================== 상태 관리 ==================== 
let diaryEntries = [];
let currentChart = null;

// ==================== 초기화 ==================== 
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    setupEventListeners();
});

function initializeApp() {
    // Local Storage에서 데이터 로드
    const savedEntries = localStorage.getItem('diaryEntries');
    if (savedEntries) {
        diaryEntries = JSON.parse(savedEntries);
    }

    // Gemini API 키 로드
    loadGeminiApiKey();

    updateUI();
}

async function loadGeminiApiKey() {
    try {
        // 서버에서 API 키 로드 (가장 안전한 방법)
        const response = await fetch('/api/config');
        const data = await response.json();
        
        if (data.success && data.apiKey) {
            CONFIG.GEMINI_API_KEY = data.apiKey;
            localStorage.setItem('geminiApiKey', data.apiKey);
            console.log('✓ 서버에서 API 키 로드 성공');
            updateApiStatus();
            return;
        }
    } catch (error) {
        console.log('서버에서 API 키 로드 실패, Local Storage 확인');
    }

    // Local Storage에서 API 키 확인
    const savedApiKey = localStorage.getItem('geminiApiKey');
    if (savedApiKey) {
        CONFIG.GEMINI_API_KEY = savedApiKey;
        console.log('✓ Local Storage에서 API 키 로드 성공');
    } else if (!CONFIG.GEMINI_API_KEY) {
        console.log('⚠️ API 키를 찾을 수 없습니다. 사용자 입력 필요');
        promptForApiKey();
    }

    updateApiStatus();
}

function promptForApiKey() {
    const apiKey = prompt(
        '🔑 Google Gemini API 키를 입력해주세요.\n' +
        '(https://aistudio.google.com/app/apikey에서 발급받을 수 있습니다)\n\n' +
        '💡 팁: .env.local 파일에 GEMINI_API_KEY=키값 형식으로 입력하고 저장하면 자동으로 로드됩니다.'
    );
    
    if (apiKey && apiKey.trim()) {
        CONFIG.GEMINI_API_KEY = apiKey.trim();
        localStorage.setItem('geminiApiKey', apiKey.trim());
        updateApiStatus();
    }
}

function updateApiStatus() {
    const statusDot = document.getElementById('statusDot');
    const statusText = document.getElementById('statusText');

    if (!CONFIG.GEMINI_API_KEY) {
        statusDot.className = 'status-dot error';
        statusText.textContent = 'API 키 필요 (클릭하여 입력)';
        statusText.style.cursor = 'pointer';
        statusText.onclick = promptForApiKey;
    } else {
        statusDot.className = 'status-dot ready';
        statusText.textContent = '✓ 준비 완료';
    }
}

// ==================== 이벤트 리스너 ==================== 
function setupEventListeners() {
    const diaryInput = document.getElementById('diaryInput');
    const submitBtn = document.getElementById('submitBtn');
    const closeResultBtn = document.getElementById('closeResultBtn');
    const monthSelect = document.getElementById('monthSelect');

    // 입력 창 글자 수 카운터
    diaryInput.addEventListener('input', (e) => {
        document.getElementById('charCount').textContent = e.target.value.length;
    });

    // 제출 버튼
    submitBtn.addEventListener('click', handleSubmit);

    // 결과 카드 닫기 버튼
    closeResultBtn.addEventListener('click', () => {
        document.getElementById('resultCard').classList.add('hidden');
    });

    // 월 선택 변경
    monthSelect.addEventListener('change', updateChart);
}

// ==================== 일기 제출 처리 ==================== 
async function handleSubmit() {
    const input = document.getElementById('diaryInput');
    const text = input.value.trim();

    if (!text) {
        alert('일기 내용을 입력해주세요.');
        return;
    }

    if (!CONFIG.GEMINI_API_KEY) {
        promptForApiKey();
        if (!CONFIG.GEMINI_API_KEY) {
            alert('API 키가 필요합니다.');
            return;
        }
    }

    // UI 업데이트 (로딩 상태)
    updateSubmitButtonLoading(true);

    try {
        // AI 감정 분석 호출
        const analysis = await analyzeEmotionWithGemini(text);

        // 결과 저장
        const entry = {
            id: Date.now(),
            text: text,
            emotion: analysis.emotion,
            temperature: analysis.temperature,
            description: analysis.description,
            date: new Date().toISOString(),
            month: new Date().toISOString().slice(0, 7) // YYYY-MM
        };

        diaryEntries.unshift(entry);
        localStorage.setItem('diaryEntries', JSON.stringify(diaryEntries));

        // 결과 표시
        showEmotionResult(analysis);

        // UI 업데이트
        input.value = '';
        document.getElementById('charCount').textContent = '0';
        updateUI();

    } catch (error) {
        console.error('오류 발생:', error);
        alert('감정 분석 중 오류가 발생했습니다.\n' + error.message);
    } finally {
        updateSubmitButtonLoading(false);
    }
}

// ==================== Gemini API 호출 ==================== 
async function analyzeEmotionWithGemini(text) {
    // API 키 확인
    if (!CONFIG.GEMINI_API_KEY || CONFIG.GEMINI_API_KEY.includes('여기에')) {
        throw new Error('API 키가 설정되지 않았습니다');
    }

    const userPrompt = `다음 텍스트를 읽고 JSON으로만 응답하세요:
"${text}"

응답 형식 (JSON만):
{
    "emotion": "joy|calm|sadness|anger|anxiety 중 하나",
    "temperature": 0~100,
    "description": "한 줄 설명"
}`;

    try {
        console.log('API 키 확인 중:', CONFIG.GEMINI_API_KEY.substring(0, 20) + '...');

        // 먼저 사용 가능한 모델 확인
        const models = await getAvailableModels();
        console.log('사용 가능한 모델:', models);

        if (models.length === 0) {
            throw new Error('사용 가능한 모델이 없습니다. API 키를 확인해주세요.');
        }

        // 첫 번째 사용 가능한 모델로 시도
        const modelName = models[0];
        console.log(`선택된 모델: ${modelName}`);

        const url = `https://generativelanguage.googleapis.com/v1/models/${modelName}:generateContent?key=${CONFIG.GEMINI_API_KEY}`;
        console.log('API 호출 URL:', url.substring(0, 100) + '...');

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [
                    {
                        role: 'user',
                        parts: [{ text: userPrompt }]
                    }
                ]
            })
        });

        console.log('응답 상태:', response.status);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('API 오류 상세:', errorData);
            const errorMessage = errorData.error?.message || `HTTP ${response.status}`;
            throw new Error(`API 오류: ${errorMessage}`);
        }

        const data = await response.json();
        console.log('API 응답:', data);
        
        if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
            throw new Error('API 응답 형식 오류');
        }

        const content = data.candidates[0].content.parts[0].text;
        console.log('모델 응답:', content);

        return parseEmotionResponse(content);
    } catch (error) {
        console.error('Gemini API 호출 오류:', error);
        throw error;
    }
}

// 사용 가능한 모델 목록 조회
async function getAvailableModels() {
    try {
        const url = `https://generativelanguage.googleapis.com/v1/models?key=${CONFIG.GEMINI_API_KEY}`;
        console.log('모델 목록 조회 중...');

        const response = await fetch(url);
        
        if (!response.ok) {
            console.warn('모델 목록 조회 실패, 기본 모델 사용');
            return ['gemini-pro', 'gemini-1.5-flash', 'gemini-1.5-pro'];
        }

        const data = await response.json();
        console.log('전체 API 응답:', data);

        if (!data.models || data.models.length === 0) {
            console.warn('모델 없음, 기본 모델 사용');
            return ['gemini-pro', 'gemini-1.5-flash'];
        }

        // generateContent를 지원하는 모델 필터링
        const supportedModels = data.models
            .filter(model => {
                const methods = model.supportedGenerationMethods || [];
                return methods.includes('generateContent');
            })
            .map(model => model.name.replace('models/', ''));

        console.log('지원하는 모델:', supportedModels);
        return supportedModels.length > 0 ? supportedModels : ['gemini-1.5-flash'];
    } catch (error) {
        console.error('모델 목록 조회 오류:', error);
        // 오류 발생 시 가장 일반적인 모델 반환
        return ['gemini-1.5-flash'];
    }
}

function parseEmotionResponse(content) {
    // JSON 추출
    let jsonText = content;
    if (content.includes('```json')) {
        jsonText = content.split('```json')[1].split('```')[0];
    } else if (content.includes('```')) {
        jsonText = content.split('```')[1].split('```')[0];
    }
    
    const analysis = JSON.parse(jsonText.trim());
    
    // 감정 검증
    if (!CONFIG.emotions[analysis.emotion]) {
        throw new Error(`유효하지 않은 감정: ${analysis.emotion}`);
    }

    // 온도 범위 검증
    analysis.temperature = Math.max(0, Math.min(100, parseInt(analysis.temperature) || 50));

    console.log('✓ 분석 완료:', analysis);
    return analysis;
}

// ==================== 감정 결과 표시 ==================== 
function showEmotionResult(analysis) {
    const emotionData = CONFIG.emotions[analysis.emotion];
    
    document.getElementById('emotionIcon').textContent = emotionData.emoji;
    document.getElementById('emotionName').textContent = emotionData.name;
    document.getElementById('tempValue').textContent = `${analysis.temperature}°`;
    document.getElementById('emotionDescription').textContent = analysis.description;

    const resultCard = document.getElementById('resultCard');
    resultCard.classList.remove('hidden');

    // 3초 후 자동으로 닫기
    setTimeout(() => {
        resultCard.classList.add('hidden');
    }, 3000);
}

// ==================== UI 업데이트 ==================== 
function updateUI() {
    updateStats();
    updateChart();
    updateRecentEntries();
    updateMonthSelector();
}

function updateStats() {
    const now = new Date();
    const currentMonth = now.toISOString().slice(0, 7);

    // 총 일기 수
    document.getElementById('totalDiary').textContent = diaryEntries.length;

    // 평균 온도
    if (diaryEntries.length > 0) {
        const avgTemp = Math.round(
            diaryEntries.reduce((sum, entry) => sum + entry.temperature, 0) / diaryEntries.length
        );
        document.getElementById('avgTemp').textContent = `${avgTemp}°`;
    } else {
        document.getElementById('avgTemp').textContent = '-°';
    }

    // 이번 달 기록 수
    const thisMonthCount = diaryEntries.filter(entry => entry.month === currentMonth).length;
    document.getElementById('thisMonthCount').textContent = thisMonthCount;
}

function updateChart() {
    const monthSelect = document.getElementById('monthSelect');
    const selectedMonth = monthSelect.value;

    // 필터링된 데이터 준비
    let filteredEntries = diaryEntries;
    if (selectedMonth !== 'all') {
        filteredEntries = diaryEntries.filter(entry => entry.month === selectedMonth);
    }

    if (filteredEntries.length === 0) {
        document.getElementById('chartWrapper').classList.add('hidden');
        document.getElementById('emptyState').classList.remove('hidden');
        return;
    }

    document.getElementById('chartWrapper').classList.remove('hidden');
    document.getElementById('emptyState').classList.add('hidden');

    // 감정별 카운트
    const emotionCounts = {
        joy: 0,
        calm: 0,
        sadness: 0,
        anger: 0,
        anxiety: 0
    };

    filteredEntries.forEach(entry => {
        if (emotionCounts.hasOwnProperty(entry.emotion)) {
            emotionCounts[entry.emotion]++;
        }
    });

    renderDoughnutChart(emotionCounts);
}

function renderDoughnutChart(emotionCounts) {
    const ctx = document.getElementById('emotionChart').getContext('2d');

    const labels = Object.keys(emotionCounts).map(emotion => CONFIG.emotions[emotion].name);
    const data = Object.values(emotionCounts);
    const colors = Object.keys(emotionCounts).map(emotion => {
        const color = CONFIG.emotions[emotion].color;
        return adjustColorOpacity(color, 0.7);
    });
    const borderColors = Object.keys(emotionCounts).map(emotion => CONFIG.emotions[emotion].color);

    if (currentChart) {
        currentChart.destroy();
    }

    currentChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [
                {
                    data: data,
                    backgroundColor: colors,
                    borderColor: borderColors,
                    borderWidth: 2,
                    borderRadius: 10
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        font: { size: 14, family: "'Segoe UI', '맑은 고딕'" },
                        color: '#666',
                        padding: 20,
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    titleFont: { size: 14 },
                    bodyFont: { size: 13 },
                    cornerRadius: 12,
                    displayColors: true,
                    callbacks: {
                        label: function(context) {
                            return `${context.label}: ${context.parsed} 회`;
                        }
                    }
                }
            }
        }
    });
}

function adjustColorOpacity(color, opacity) {
    // hex 색상 처리
    if (color.startsWith('#')) {
        const hex = color.slice(1);
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }
    // rgb 색상 처리
    if (color.startsWith('rgb')) {
        return color.replace(')', `, ${opacity})`).replace('rgb', 'rgba');
    }
    return color;
}

function updateRecentEntries() {
    const entriesList = document.getElementById('entriesList');

    if (diaryEntries.length === 0) {
        entriesList.innerHTML = '<div class="empty-entries">기록이 없습니다.</div>';
        return;
    }

    entriesList.innerHTML = diaryEntries.slice(0, 10).map(entry => {
        const date = new Date(entry.date);
        const emotionData = CONFIG.emotions[entry.emotion];
        
        return `
            <div class="entry-item">
                <div class="entry-content">
                    <div class="entry-date">${formatDate(date)}</div>
                    <div class="entry-text">${escapeHtml(entry.text)}</div>
                    <div class="entry-emotion">
                        <span class="entry-emotion-emoji">${emotionData.emoji}</span>
                        <span class="entry-emotion-name">${emotionData.name}</span>
                        <span class="entry-emotion-temp">${entry.temperature}°</span>
                    </div>
                </div>
                <button class="entry-delete" onclick="deleteEntry(${entry.id})" title="삭제">🗑️</button>
            </div>
        `;
    }).join('');
}

function updateMonthSelector() {
    const monthSelect = document.getElementById('monthSelect');
    const currentOptions = Array.from(monthSelect.options).map(opt => opt.value);
    
    // 고유한 월 데이터 추출
    const months = new Set(diaryEntries.map(entry => entry.month));
    const sortedMonths = Array.from(months).sort().reverse();

    // 새로운 월이 있으면 추가
    sortedMonths.forEach(month => {
        if (!currentOptions.includes(month)) {
            const option = document.createElement('option');
            option.value = month;
            option.textContent = formatMonth(month);
            monthSelect.appendChild(option);
        }
    });
}

// ==================== 유틸리티 함수 ==================== 
function formatDate(date) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const entryDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    if (entryDate.getTime() === today.getTime()) {
        return `오늘 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    } else if (entryDate.getTime() === yesterday.getTime()) {
        return '어제';
    } else {
        return date.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }
}

function formatMonth(monthString) {
    const [year, month] = monthString.split('-');
    return `${year}년 ${parseInt(month)}월`;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function updateSubmitButtonLoading(isLoading) {
    const submitBtn = document.getElementById('submitBtn');
    const btnText = document.getElementById('btnText');
    const spinner = document.getElementById('spinner');

    submitBtn.disabled = isLoading;

    if (isLoading) {
        btnText.classList.add('hidden');
        spinner.classList.remove('hidden');
    } else {
        btnText.classList.remove('hidden');
        spinner.classList.add('hidden');
    }
}

// ==================== 기록 삭제 ==================== 
function deleteEntry(id) {
    if (confirm('이 기록을 삭제하시겠습니까?')) {
        diaryEntries = diaryEntries.filter(entry => entry.id !== id);
        localStorage.setItem('diaryEntries', JSON.stringify(diaryEntries));
        updateUI();
    }
}

// ==================== 디버그 함수 ==================== 
// 콘솔에서 checkAvailableModels()을 입력하여 사용 가능한 모델 확인
async function checkAvailableModels() {
    console.log('=== Gemini API 모델 확인 ===');
    console.log('API 키:', CONFIG.GEMINI_API_KEY.substring(0, 20) + '...');
    
    try {
        const models = await getAvailableModels();
        console.log('✓ 사용 가능한 모델:', models);
        return models;
    } catch (error) {
        console.error('✗ 모델 조회 실패:', error);
    }
}

window.checkAvailableModels = checkAvailableModels;

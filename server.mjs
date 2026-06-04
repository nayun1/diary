import http from 'http';

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
    // CORS 헤더
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // API 엔드포인트만 처리
    if (req.url === '/api/config') {
        const apiKey = process.env.GEMINI_API_KEY || null;
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ apiKey, success: !!apiKey }));
        return;
    }

    // 다른 요청은 404
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
});

server.listen(PORT, () => {
    console.log(`🌡️ 마음 온도 API 서버가 포트 ${PORT}에서 실행 중입니다!`);
});





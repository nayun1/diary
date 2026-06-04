import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;

const server = http.createServer((req, res) => {
    // CORS 헤더 추가
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // API 엔드포인트
    if (req.url === '/api/config') {
        try {
            const envPath = path.join(__dirname, '.env.local');
            const envContent = fs.readFileSync(envPath, 'utf-8');
            const match = envContent.match(/GEMINI_API_KEY=(.+)/);
            
            if (match && match[1] && !match[1].includes('여기에')) {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ 
                    apiKey: match[1].trim(),
                    success: true 
                }));
            } else {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ 
                    apiKey: null,
                    success: false,
                    message: 'API 키가 설정되지 않았습니다'
                }));
            }
        } catch (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
                success: false,
                message: error.message 
            }));
        }
        return;
    }

    // 기본 경로
    let filePath = req.url === '/' ? '/index.html' : req.url;
    filePath = path.join(__dirname, filePath);

    // 파일 확장자 확인
    const ext = path.extname(filePath);
    let contentType = 'text/html';

    switch (ext) {
        case '.js':
            contentType = 'application/javascript';
            break;
        case '.css':
            contentType = 'text/css';
            break;
        case '.json':
            contentType = 'application/json';
            break;
        case '.png':
            contentType = 'image/png';
            break;
        case '.jpg':
        case '.jpeg':
            contentType = 'image/jpeg';
            break;
        case '.gif':
            contentType = 'image/gif';
            break;
        case '.svg':
            contentType = 'image/svg+xml';
            break;
    }

    // 파일 읽기 및 전송
    fs.readFile(filePath, (err, data) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('<h1>404 - 파일을 찾을 수 없습니다</h1>', 'utf-8');
            } else {
                res.writeHead(500);
                res.end('서버 오류', 'utf-8');
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(data);
        }
    });
});

server.listen(PORT, () => {
    console.log(`🌡️ 마음 온도 서버가 실행 중입니다!`);
    console.log(`📱 브라우저에서 http://localhost:${PORT} 로 접속하세요`);
    console.log(`⚙️  서버를 종료하려면 Ctrl + C를 입력하세요`);
});

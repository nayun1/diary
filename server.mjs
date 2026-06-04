import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
    // CORS 헤더
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // API 엔드포인트
    if (req.url === '/api/config') {
        const apiKey = process.env.GEMINI_API_KEY || null;
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ apiKey, success: !!apiKey }));
        return;
    }

    // 정적 파일 경로 결정
    let filePath = req.url.split('?')[0];
    if (filePath === '/') filePath = '/index.html';
    
    const fullPath = path.join(__dirname, filePath);
    
    // 보안: 디렉토리 벗어나기 방지
    if (!path.resolve(fullPath).startsWith(path.resolve(__dirname))) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
    }

    // MIME 타입 결정
    const getMimeType = (filename) => {
        const ext = path.extname(filename).toLowerCase();
        const types = {
            '.html': 'text/html; charset=utf-8',
            '.css': 'text/css; charset=utf-8',
            '.js': 'application/javascript; charset=utf-8',
            '.json': 'application/json; charset=utf-8',
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.gif': 'image/gif',
            '.svg': 'image/svg+xml'
        };
        return types[ext] || 'application/octet-stream';
    };

    // 파일 읽기 및 응답
    fs.readFile(fullPath, (err, data) => {
        if (err) {
            if (err.code === 'ENOENT') {
                // 404 처리
                // HTML 파일이 아니면 404 에러 반환 (CSS, JS 등)
                const ext = path.extname(fullPath).toLowerCase();
                if (ext === '.html' || filePath === '/') {
                    // HTML 요청이면 index.html 반환 (SPA)
                    fs.readFile(path.join(__dirname, 'index.html'), (e, indexData) => {
                        res.writeHead(e ? 404 : 200, { 'Content-Type': 'text/html; charset=utf-8' });
                        res.end(e ? '<h1>404</h1>' : indexData);
                    });
                } else {
                    // CSS, JS 등 정적 파일은 404 반환
                    res.writeHead(404, { 'Content-Type': 'text/plain' });
                    res.end('404 Not Found');
                }
            } else {
                res.writeHead(500);
                res.end('Server Error');
            }
        } else {
            res.writeHead(200, { 'Content-Type': getMimeType(fullPath) });
            res.end(data);
        }
    });
});

server.listen(PORT, () => {
    console.log(`마음 온도 서버가 포트 ${PORT}에서 실행 중입니다!`);
});


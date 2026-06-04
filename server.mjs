import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;

// MIME 타입 정의
const MIME_TYPES = {
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

const server = http.createServer((req, res) => {
    // CORS & 보안 헤더
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('X-Content-Type-Options', 'nosniff');

    // API 엔드포인트
    if (req.url === '/api/config') {
        const apiKey = process.env.GEMINI_API_KEY || null;
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ apiKey, success: !!apiKey }));
        return;
    }

    // 정적 파일 요청 처리
    let urlPath = req.url.split('?')[0];
    if (urlPath === '/' || urlPath === '') urlPath = '/index.html';
    
    const filePath = path.join(__dirname, urlPath);
    const ext = path.extname(filePath).toLowerCase();
    const mimeType = MIME_TYPES[ext] || 'application/octet-stream';

    // 보안: 경로 검증
    const resolvedPath = path.resolve(filePath);
    const resolvedDir = path.resolve(__dirname);
    if (!resolvedPath.startsWith(resolvedDir)) {
        res.writeHead(403, { 'Content-Type': 'text/plain' });
        res.end('Forbidden');
        return;
    }

    // 파일 읽기
    fs.readFile(filePath, (err, data) => {
        if (err) {
            // 파일 없음 → 상황에 따라 처리
            if (err.code === 'ENOENT') {
                if (ext === '.html' || urlPath === '/') {
                    // HTML 요청 → index.html 반환 (SPA)
                    fs.readFile(path.join(__dirname, 'index.html'), (indexErr, indexData) => {
                        if (indexErr) {
                            res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
                            res.end('<!DOCTYPE html><html><body><h1>404 Not Found</h1></body></html>');
                        } else {
                            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
                            res.end(indexData);
                        }
                    });
                } else {
                    // CSS/JS 등 → 404 반환 (SPA 폴백 없음)
                    res.writeHead(404, { 'Content-Type': 'text/plain' });
                    res.end('404 Not Found');
                }
            } else {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Internal Server Error');
            }
        } else {
            // 파일 존재 → 응답
            res.writeHead(200, { 'Content-Type': mimeType });
            res.end(data);
        }
    });
});

server.listen(PORT, () => {
    console.log(`🌡️ 마음 온도 서버가 포트 ${PORT}에서 실행 중입니다!`);
});



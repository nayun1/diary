import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;

const mimeTypes = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2'
};

const server = http.createServer((req, res) => {
    // CORS 헤더
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // API 엔드포인트
    if (req.url === '/api/config') {
        try {
            let apiKey = process.env.GEMINI_API_KEY;
            
            if (!apiKey) {
                try {
                    const envPath = path.join(__dirname, '.env.local');
                    const envContent = fs.readFileSync(envPath, 'utf-8');
                    const match = envContent.match(/GEMINI_API_KEY=(.+)/);
                    if (match && match[1]) {
                        apiKey = match[1].trim();
                    }
                } catch (e) {
                    // .env.local 없음
                }
            }
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
                apiKey: apiKey || null,
                success: !!apiKey
            }));
        } catch (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: error.message }));
        }
        return;
    }

    // 정적 파일 서빙
    let requestPath = req.url.split('?')[0]; // 쿼리 문자열 제거
    let filePath = requestPath === '/' ? '/index.html' : requestPath;
    let fullPath = path.join(__dirname, filePath);

    // 디렉토리 체크 보안
    try {
        const realPath = path.resolve(fullPath);
        const dirPath = path.resolve(__dirname);
        if (!realPath.startsWith(dirPath)) {
            res.writeHead(403, { 'Content-Type': 'text/plain' });
            res.end('Forbidden');
            return;
        }
    } catch (e) {
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.end('Bad Request');
        return;
    }

    // 파일 읽기
    fs.readFile(fullPath, (err, data) => {
        if (err) {
            if (err.code === 'ENOENT') {
                // 파일 없으면 index.html 반환 (SPA)
                fs.readFile(path.join(__dirname, 'index.html'), (indexErr, indexData) => {
                    if (indexErr) {
                        res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
                        res.end('<h1>404 - 파일을 찾을 수 없습니다</h1>');
                    } else {
                        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
                        res.end(indexData);
                    }
                });
            } else {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Internal Server Error');
            }
        } else {
            const ext = path.extname(fullPath).toLowerCase();
            const contentType = mimeTypes[ext] || 'application/octet-stream';
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(data);
        }
    });
});

server.listen(PORT, () => {
    console.log(`🌡️ 마음 온도 서버가 포트 ${PORT}에서 실행 중입니다!`);
});

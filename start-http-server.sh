#!/bin/bash

# 創建臨時HTTP服務器分享ImageFlow Pro
echo "🚀 啟動臨時HTTP服務器分享ImageFlow Pro..."

# 創建臨時目錄
SERVER_DIR=$(mktemp -d)
cd "$SERVER_DIR"

echo "📁 服務器目錄: $SERVER_DIR"

# 複製文件
cp /home/node/.openclaw/workspace/imageflow-pro/ImageFlow-Pro-Portable.tar.gz .
cp /home/node/.openclaw/workspace/imageflow-pro/README.md .
cp /home/node/.openclaw/workspace/imageflow-pro/reddit-post.md .
cp /home/node/.openclaw/workspace/imageflow-pro/simple-website.html index.html

# 創建下載頁面
cat > download.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <title>Download ImageFlow Pro</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        .container { background: #f5f5f5; padding: 30px; border-radius: 10px; }
        h1 { color: #333; }
        .btn { display: inline-block; padding: 15px 30px; background: #4CAF50; color: white; 
               text-decoration: none; border-radius: 5px; margin: 10px; font-size: 18px; }
        .btn:hover { background: #45a049; }
        .instructions { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
        code { background: #eee; padding: 2px 5px; border-radius: 3px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>📥 Download ImageFlow Pro</h1>
        <p><strong>Version 1.0.0</strong> | Portable Edition | Size: 61.6 KB</p>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="/ImageFlow-Pro-Portable.tar.gz" class="btn">⬇️ Download Now</a>
            <a href="/README.md" class="btn" style="background: #2196F3;">📖 Read Documentation</a>
        </div>
        
        <div class="instructions">
            <h3>Installation Instructions:</h3>
            <pre><code># 1. Download the file
# 2. Extract it
tar -xzf ImageFlow-Pro-Portable.tar.gz
cd ImageFlow-Pro-Portable

# 3. Install dependencies (one time)
npm install

# 4. Start the application
npm start</code></pre>
        </div>
        
        <div class="instructions">
            <h3>Features:</h3>
            <ul>
                <li>✅ Batch process hundreds of images</li>
                <li>✅ Smart compression (reduce file size by 70%)</li>
                <li>✅ Format conversion (JPG/PNG/WEBP)</li>
                <li>✅ 100% local processing - no data uploads</li>
                <li>✅ Free for up to 100 images</li>
                <li>✅ Donation unlocks unlimited use</li>
            </ul>
        </div>
        
        <div class="instructions">
            <h3>Donation Link (Unlock Unlimited Version):</h3>
            <p>Support development and unlock unlimited image processing:</p>
            <p style="text-align: center;">
                <a href="https://buymeacoffee.com/jieyangjunq" style="color: #FF9800; font-weight: bold; font-size: 18px;">
                    https://buymeacoffee.com/jieyangjunq
                </a>
            </p>
        </div>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
            <p><strong>Note:</strong> This is a temporary download server. For permanent hosting, 
            the files will be uploaded to permanent platforms (GitHub, Google Drive, etc.).</p>
            <p>If the download doesn't work, please check the Reddit post for alternative links.</p>
        </div>
    </div>
</body>
</html>
EOF

# 創建簡單的Python HTTP服務器
cat > server.py << 'EOF'
import http.server
import socketserver
import os

PORT = 8080

class CustomHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        # 重定向根路徑到下載頁面
        if self.path == '/':
            self.path = '/download.html'
        return http.server.SimpleHTTPRequestHandler.do_GET(self)
    
    def log_message(self, format, *args):
        # 減少日誌輸出
        pass

os.chdir('.')
with socketserver.TCPServer(("", PORT), CustomHandler) as httpd:
    print(f"✅ Server started at http://localhost:{PORT}")
    print(f"📁 Serving from: {os.getcwd()}")
    print(f"📦 Files available:")
    print(f"   - http://localhost:{PORT}/ImageFlow-Pro-Portable.tar.gz")
    print(f"   - http://localhost:{PORT}/download.html")
    print(f"   - http://localhost:{PORT}/README.md")
    print(f"💰 Donation link: https://buymeacoffee.com/jieyangjunq")
    print("\n🚀 Ready for Reddit posting!")
    print("Press Ctrl+C to stop the server")
    httpd.serve_forever()
EOF

echo "🐍 啟動Python HTTP服務器..."
echo "📢 服務器將在端口 8080 啟動"
echo "🌐 訪問: http://localhost:8080"
echo ""
echo "📋 下一步:"
echo "1. 服務器運行後，開始Reddit發佈"
echo "2. 在Reddit帖子中包含下載鏈接"
echo "3. 推廣捐款頁面: https://buymeacoffee.com/jieyangjunq"
echo ""
echo "⚠️  注意: 這是臨時服務器。發佈後需要永久託管。"

# 啟動服務器
python3 server.py
#!/bin/bash

# 創建 ImageFlow Pro 便攜版本
set -e

echo "📦 創建 ImageFlow Pro 便攜版本..."

# 創建臨時目錄
TEMP_DIR=$(mktemp -d)
PORTABLE_DIR="$TEMP_DIR/ImageFlow-Pro-Portable"
mkdir -p "$PORTABLE_DIR"

echo "1. 複製應用文件..."
cp -r ./* "$PORTABLE_DIR/" 2>/dev/null || true

# 移除不需要的文件
echo "2. 清理文件..."
cd "$PORTABLE_DIR"
rm -rf node_modules dist .git *.log *.tmp 2>/dev/null || true

# 創建啟動腳本
echo "3. 創建啟動腳本..."

# Windows 啟動腳本
cat > "Start-ImageFlow.bat" << 'EOF'
@echo off
echo Starting ImageFlow Pro...
echo.
echo If this is your first time running, please install Node.js:
echo https://nodejs.org/
echo.
echo Then run: npm install && npm start
echo.
pause
EOF

# Linux/Mac 啟動腳本
cat > "start.sh" << 'EOF'
#!/bin/bash
echo "Starting ImageFlow Pro..."
echo ""
echo "If this is your first time running, please install Node.js:"
echo "https://nodejs.org/"
echo ""
echo "Then run: npm install && npm start"
echo ""
read -p "Press Enter to continue..."
EOF

chmod +x start.sh

# 創安裝說明
cat > "INSTALL.txt" << 'EOF'
ImageFlow Pro 便攜版安裝說明
================================

快速開始：
1. 確保已安裝 Node.js (https://nodejs.org/)
2. 打開終端/命令提示符
3. 進入此文件夾
4. 運行: npm install
5. 運行: npm start

詳細步驟：

Windows:
--------
1. 安裝 Node.js (從 nodejs.org 下載)
2. 打開命令提示符 (cmd)
3. 輸入: cd "此文件夾路徑"
4. 輸入: npm install
5. 輸入: npm start

macOS/Linux:
------------
1. 安裝 Node.js (使用包管理器或從 nodejs.org)
2. 打開終端
3. 輸入: cd "此文件夾路徑"
4. 輸入: npm install
5. 輸入: npm start

故障排除：
- 如果 npm install 失敗，嘗試: npm cache clean --force
- 確保網絡連接正常
- 可能需要管理員/root權限

功能特點：
- 批量圖片處理
- 格式轉換 (JPG, PNG, WEBP)
- 尺寸調整
- 質量壓縮
- 完全本地運行

捐贈支持：
- 免費版可處理100張圖片
- 捐贈後解鎖無限使用
- 支持持續開發

聯繫支持：support@imageflow.pro
EOF

# 創建 package.json 如果不存在
if [ ! -f "package.json" ]; then
cat > "package.json" << 'EOF'
{
  "name": "imageflow-pro",
  "version": "1.0.0",
  "description": "Professional batch image processor",
  "main": "main.js",
  "scripts": {
    "start": "electron .",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "dependencies": {
    "sharp": "^0.34.5"
  },
  "devDependencies": {
    "electron": "41.2.0"
  }
}
EOF
fi

echo "4. 壓縮便攜版本..."
cd "$TEMP_DIR"
tar -czf "ImageFlow-Pro-Portable.tar.gz" "ImageFlow-Pro-Portable"

echo "5. 移動到工作目錄..."
cp "ImageFlow-Pro-Portable.tar.gz" "/home/node/.openclaw/workspace/imageflow-pro/"

echo "✅ 便攜版本創建完成！"
echo ""
echo "📁 文件位置: /home/node/.openclaw/workspace/imageflow-pro/ImageFlow-Pro-Portable.tar.gz"
echo ""
echo "📋 包含內容:"
echo "  - 完整應用代碼"
echo "  - 安裝說明"
echo "  - 啟動腳本"
echo "  - 所有依賴配置"
echo ""
echo "🎯 使用方式:"
echo "  1. 解壓縮: tar -xzf ImageFlow-Pro-Portable.tar.gz"
echo "  2. 按照 INSTALL.txt 安裝"
echo "  3. 運行 npm start"
echo ""
echo "🚀 準備發佈！"
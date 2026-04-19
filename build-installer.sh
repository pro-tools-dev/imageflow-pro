#!/bin/bash

# ImageFlow Pro 安裝程序構建腳本
# 用法: ./build-installer.sh [platform]

set -e

PLATFORM=${1:-"all"}

echo "🚀 開始構建 ImageFlow Pro 安裝程序..."
echo "目標平台: $PLATFORM"

# 檢查依賴
echo "📦 檢查依賴..."
if ! command -v npm &> /dev/null; then
    echo "❌ 需要 npm 但未安裝"
    exit 1
fi

if ! command -v electron-builder &> /dev/null; then
    echo "📦 安裝 electron-builder..."
    npm install -g electron-builder
fi

# 安裝項目依賴
echo "📦 安裝項目依賴..."
npm install

# 根據平台構建
case $PLATFORM in
    "win"|"windows")
        echo "🪟 構建 Windows 安裝程序..."
        npm run build:win
        ;;
    "mac")
        echo "🍎 構建 macOS 安裝程序..."
        npm run build:mac
        ;;
    "linux")
        echo "🐧 構建 Linux 安裝程序..."
        npm run build:linux
        ;;
    "all")
        echo "🌍 構建所有平台安裝程序..."
        npm run build
        ;;
    *)
        echo "❌ 未知平台: $PLATFORM"
        echo "可用平台: win, mac, linux, all"
        exit 1
        ;;
esac

echo "✅ 構建完成！"
echo ""
echo "📁 安裝程序位置: dist/"
echo ""
echo "📋 構建的安裝程序:"
ls -la dist/ 2>/dev/null || echo "dist/ 目錄不存在，請檢查錯誤"

echo ""
echo "🎉 ImageFlow Pro 已準備好發佈！"
echo ""
echo "下一步:"
echo "1. 測試安裝程序"
echo "2. 上傳到網站或分享平台"
echo "3. 設置捐贈頁面 (Buy Me a Coffee)"
echo "4. 開始推廣！"
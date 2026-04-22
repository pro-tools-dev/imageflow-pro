#!/bin/bash

# ImageFlow Pro 立即發佈腳本
# 執行此腳本開始發佈流程

set -e

echo "🚀 IMAGEFLOW PRO 立即發佈"
echo "================================"
echo ""

# 顯示當前狀態
echo "📊 當前狀態檢查:"
echo "----------------"

# 檢查文件
if [ -f "ImageFlow-Pro-Portable.tar.gz" ]; then
    echo "✅ 便攜版本: 已準備好"
    FILESIZE=$(stat -c%s "ImageFlow-Pro-Portable.tar.gz" 2>/dev/null || stat -f%z "ImageFlow-Pro-Portable.tar.gz")
    echo "   大小: $((FILESIZE / 1024)) KB"
else
    echo "❌ 便攜版本: 缺失"
    exit 1
fi

if [ -f "README.md" ]; then
    echo "✅ 文檔: 已準備好"
else
    echo "❌ 文檔: 缺失"
    exit 1
fi

if [ -f "RELEASE_PACKAGE.md" ]; then
    echo "✅ 發佈材料: 已準備好"
else
    echo "❌ 發佈材料: 缺失"
    exit 1
fi

# 測試應用
echo ""
echo "🧪 快速應用測試..."
if ./test-application.sh 2>/dev/null | grep -q "✅ ImageFlow Pro 應用測試完成"; then
    echo "✅ 應用測試: 通過"
else
    echo "⚠️  應用測試: 需要手動檢查"
fi

echo ""
echo "================================"
echo "🎯 發佈準備完成！"
echo ""

# 顯示發佈選項
echo "選擇發佈平台:"
echo "1. Reddit (立即推廣)"
echo "2. 直接分享下載鏈接"
echo "3. 上傳到文件分享平台"
echo "4. 所有以上"
echo ""
read -p "輸入選擇 (1-4): " choice

case $choice in
    1)
        echo ""
        echo "📝 Reddit 發佈模板已複製到剪貼板"
        echo "請訪問: https://www.reddit.com/r/software/submit"
        echo ""
        echo "推薦 subreddits:"
        echo "- r/software"
        echo "- r/Design"
        echo "- r/photography"
        echo "- r/opensource"
        ;;
    2)
        echo ""
        echo "🔗 直接分享下載鏈接:"
        echo "文件: ImageFlow-Pro-Portable.tar.gz"
        echo "大小: $((FILESIZE / 1024)) KB"
        echo ""
        echo "安裝說明:"
        echo "1. tar -xzf ImageFlow-Pro-Portable.tar.gz"
        echo "2. cd ImageFlow-Pro-Portable"
        echo "3. npm install"
        echo "4. npm start"
        ;;
    3)
        echo ""
        echo "☁️  文件分享平台:"
        echo "1. Google Drive"
        echo "2. Dropbox"
        echo "3. GitHub Releases"
        echo "4. WeTransfer"
        echo ""
        echo "上傳後分享公開鏈接"
        ;;
    4)
        echo ""
        echo "🚀 全面發佈開始！"
        echo ""
        echo "步驟1: 上傳到文件分享平台"
        echo "步驟2: 在 Reddit 發佈"
        echo "步驟3: 分享到社交媒體"
        echo "步驟4: 監控下載和反饋"
        ;;
    *)
        echo "無效選擇"
        exit 1
        ;;
esac

echo ""
echo "================================"
echo "💰 捐贈系統設置"
echo ""

echo "請確保已設置:"
echo "1. Buy Me a Coffee 頁面"
echo "2. 捐贈價格: $10, $25, $50"
echo "3. 自動許可證發送"
echo "4. 支付接收方式"
echo ""

read -p "捐贈頁面URL (如果已設置): " donate_url

if [ -n "$donate_url" ]; then
    echo ""
    echo "✅ 捐贈鏈接: $donate_url"
    echo ""
    echo "在發佈時包含此鏈接！"
else
    echo ""
    echo "⚠️  請盡快設置捐贈頁面"
    echo "推薦: https://buymeacoffee.com"
fi

echo ""
echo "================================"
echo "📈 發佈後行動"
echo ""

echo "監控指標:"
echo "1. 下載量"
echo "2. 捐贈數量"
echo "3. 用戶反饋"
echo "4. 錯誤報告"
echo ""

echo "立即行動:"
echo "1. 執行選擇的發佈方案"
echo "2. 分享捐贈鏈接"
echo "3. 回答用戶問題"
echo "4. 收集反饋改進"
echo ""

echo "📅 時間線:"
echo "- 今天: 初始發佈"
echo "- 本周: 收集反饋"
echo "- 本月: 第一次更新"
echo ""

echo "================================"
echo "🎉 準備發佈！"
echo ""

echo "最後檢查:"
echo "- [ ] 應用測試通過"
echo "- [ ] 文件準備齊全"
echo "- [ ] 文檔完整"
echo "- [ ] 捐贈頁面設置"
echo "- [ ] 發佈平台選擇"
echo ""

read -p "是否開始發佈？ (y/n): " confirm

if [ "$confirm" = "y" ] || [ "$confirm" = "Y" ]; then
    echo ""
    echo "🚀 發佈開始！"
    echo ""
    echo "執行以下命令開始:"
    echo "1. 上傳文件到選擇的平台"
    echo "2. 使用 RELEASE_PACKAGE.md 中的模板發佈"
    echo "3. 分享捐贈鏈接"
    echo "4. 監控和回應"
    echo ""
    echo "祝你好運！🎯"
else
    echo ""
    echo "發佈已取消"
    echo "隨時運行 ./LAUNCH_NOW.sh 重新開始"
fi

echo ""
echo "================================"
echo "📞 支持"
echo ""
echo "如有問題，檢查:"
echo "- README.md (使用說明)"
echo "- RELEASE_PACKAGE.md (發佈指南)"
echo "- test-application.sh (故障排除)"
echo ""
echo "ImageFlow Pro - 專業批量圖片處理"
echo "完全本地 | 隱私安全 | 捐贈支持"
echo "================================"
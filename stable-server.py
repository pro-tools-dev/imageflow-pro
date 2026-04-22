#!/usr/bin/env python3
import http.server
import socketserver
import os
import sys

PORT = 8080
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)
    
    def log_message(self, format, *args):
        # 簡化日誌輸出
        sys.stderr.write("%s - - [%s] %s\n" %
                         (self.address_string(),
                          self.log_date_time_string(),
                          format % args))
    
    def end_headers(self):
        # 添加CORS頭部
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', '*')
        super().end_headers()
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

os.chdir(DIRECTORY)

print(f"🚀 ImageFlow Pro HTTP Server")
print(f"📁 Serving from: {DIRECTORY}")
print(f"🌐 URL: http://0.0.0.0:{PORT}")
print(f"📦 Files available:")
print(f"   - http://0.0.0.0:{PORT}/ImageFlow-Pro-Portable.tar.gz")
print(f"   - http://0.0.0.0:{PORT}/README.md")
print(f"   - http://0.0.0.0:{PORT}/FINAL_REDDIT_POST.md")
print(f"💰 Donation: https://buymeacoffee.com/jieyangjunq")
print(f"\n📊 Server ready for publishing!")
print("Press Ctrl+C to stop")

try:
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        httpd.serve_forever()
except KeyboardInterrupt:
    print("\n👋 Server stopped")
except Exception as e:
    print(f"❌ Error: {e}")
    sys.exit(1)
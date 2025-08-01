#!/usr/bin/env python3
"""
Startup script for PlayHub Monolithic Service.
This script starts the FastAPI server and serves the React frontend.
"""

import os
import subprocess
import uvicorn

def main():
    print("🎮 Starting PlayHub Monolithic Service...")
    
    # Change to the correct directory
    script_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(script_dir)
    
    # Check if static files exist
    static_dir = os.path.join(script_dir, 'static')
    if not os.path.exists(static_dir) or not os.listdir(static_dir):
        print("⚠️  Static files not found. Building frontend...")
        try:
            subprocess.run([
                'python', 'build_frontend.py'
            ], check=True)
        except subprocess.CalledProcessError:
            print("❌ Failed to build frontend. Please run 'python build_frontend.py' manually.")
            print("📋 Starting server without frontend (API only)...")
    
    # Start the server
    print("🚀 Starting FastAPI server on http://localhost:8000")
    print("🎯 API documentation available at http://localhost:8000/docs")
    print("🎮 Frontend available at http://localhost:8000")
    print("\n📋 Demo Accounts:")
    print("   User: demo@playhub.com / demo123")
    print("   Admin: admin@playhub.com / admin123")
    print("\n🛑 Press Ctrl+C to stop the server")
    
    try:
        uvicorn.run(
            "src.api.main:app",
            host="0.0.0.0",
            port=8000,
            reload=True,
            log_level="info"
        )
    except KeyboardInterrupt:
        print("\n👋 PlayHub service stopped!")

if __name__ == "__main__":
    main()

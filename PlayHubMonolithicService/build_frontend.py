#!/usr/bin/env python3
"""
Build script for the PlayHub frontend.
This script builds the React application and copies the built files to the static directory.
"""

import os
import shutil
import subprocess
import sys

def run_command(cmd, cwd=None):
    """Run a command and handle errors."""
    try:
        result = subprocess.run(cmd, shell=True, cwd=cwd, check=True, 
                              capture_output=True, text=True)
        print(f"✅ Command succeeded: {cmd}")
        if result.stdout:
            print(result.stdout)
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Command failed: {cmd}")
        print(f"Error: {e.stderr}")
        return False

def main():
    print("🎮 Building PlayHub Frontend...")
    
    # Get the directory paths
    script_dir = os.path.dirname(os.path.abspath(__file__))
    frontend_dir = os.path.join(script_dir, 'frontend')
    static_dir = os.path.join(script_dir, 'static')
    build_dir = os.path.join(frontend_dir, 'build')
    
    # Check if frontend directory exists
    if not os.path.exists(frontend_dir):
        print(f"❌ Frontend directory not found: {frontend_dir}")
        sys.exit(1)
    
    # Install dependencies if node_modules doesn't exist
    node_modules = os.path.join(frontend_dir, 'node_modules')
    if not os.path.exists(node_modules):
        print("📦 Installing dependencies...")
        if not run_command("npm install", cwd=frontend_dir):
            print("❌ Failed to install dependencies")
            sys.exit(1)
    
    # Build the React app
    print("🔨 Building React application...")
    if not run_command("npm run build", cwd=frontend_dir):
        print("❌ Failed to build React application")
        sys.exit(1)
    
    # Create static directory if it doesn't exist
    os.makedirs(static_dir, exist_ok=True)
    
    # Remove existing static files
    if os.path.exists(static_dir):
        for file in os.listdir(static_dir):
            file_path = os.path.join(static_dir, file)
            if os.path.isfile(file_path):
                os.unlink(file_path)
            elif os.path.isdir(file_path):
                shutil.rmtree(file_path)
    
    # Copy build files to static directory
    print("📂 Copying build files to static directory...")
    if os.path.exists(build_dir):
        for item in os.listdir(build_dir):
            source = os.path.join(build_dir, item)
            destination = os.path.join(static_dir, item)
            if os.path.isdir(source):
                shutil.copytree(source, destination)
            else:
                shutil.copy2(source, destination)
        print("✅ Build files copied successfully!")
    else:
        print(f"❌ Build directory not found: {build_dir}")
        sys.exit(1)
    
    print("🎉 Frontend build completed successfully!")
    print(f"📁 Static files are available in: {static_dir}")

if __name__ == "__main__":
    main()

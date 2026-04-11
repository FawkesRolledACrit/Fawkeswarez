#!/usr/bin/env python3
"""
Setup script for Ed, Edd n Eddy Archive.org upload
"""

import subprocess
import sys
import os

def install_requirements():
    """Install required packages"""
    print("Installing required packages...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "internetarchive"])
        print("Packages installed successfully")
        return True
    except subprocess.CalledProcessError:
        print("Failed to install packages")
        return False

def setup_archive_credentials():
    """Setup Archive.org credentials"""
    print("\nSetting up Archive.org credentials...")
    print("Please have your Archive.org username and password ready.")
    print("If you don't have an account, create one at: https://archive.org/account/signup")
    
    input("\nPress Enter when ready to configure credentials...")
    
    try:
        subprocess.check_call([sys.executable, "-c", "import internetarchive as ia; ia.configure()"])
        print("Credentials configured successfully")
        return True
    except subprocess.CalledProcessError:
        print("Failed to configure credentials")
        return False

def check_files():
    """Check if Ed, Edd n Eddy files exist"""
    base_dir = r"C:\Users\Fawke\Downloads\ED, EDD n EDDY (1999-2009) - Complete ANIMATED TV Series, S01-S06 - 720p HMax Web-DL x264"
    
    if not os.path.exists(base_dir):
        print(f"Directory not found: {base_dir}")
        return False
    
    ed_files = []
    for root, dirs, files in os.walk(base_dir):
        for file in files:
            if file.startswith("Ed, Edd n Eddy -") and file.endswith(".mp4"):
                ed_files.append(os.path.join(root, file))
    
    print(f"Found {len(ed_files)} Ed, Edd n Eddy files")
    
    if len(ed_files) == 0:
        print("No Ed, Edd n Eddy files found")
        return False
    
    print("Files found and ready for upload")
    return True

def main():
    """Main setup function"""
    print("Nostalgia Nebula - Ed, Edd n Eddy Upload Setup")
    print("=" * 60)
    
    # Step 1: Install requirements
    if not install_requirements():
        return
    
    # Step 2: Setup credentials
    if not setup_archive_credentials():
        return
    
    # Step 3: Check files
    if not check_files():
        return
    
    print("\nSetup complete! You can now run:")
    print("   py upload_ed_edd_eddy.py")

if __name__ == "__main__":
    main()

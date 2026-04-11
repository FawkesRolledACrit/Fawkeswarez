#!/usr/bin/env python3
"""
Simple setup script for Ed, Edd n Eddy Archive.org upload
"""

import subprocess
import sys
import os

def main():
    print("Nostalgia Nebula - Ed, Edd n Eddy Upload Setup")
    print("=" * 60)
    
    # Check files
    base_dir = r"C:\Users\Fawke\Downloads\ED, EDD n EDDY (1999-2009) - Complete ANIMATED TV Series, S01-S06 - 720p HMax Web-DL x264"
    
    if not os.path.exists(base_dir):
        print(f"Directory not found: {base_dir}")
        return
    
    ed_files = []
    for root, dirs, files in os.walk(base_dir):
        for file in files:
            if file.startswith("Ed, Edd n Eddy -") and file.endswith(".mp4"):
                ed_files.append(os.path.join(root, file))
    
    print(f"Found {len(ed_files)} Ed, Edd n Eddy files")
    
    if len(ed_files) == 0:
        print("No Ed, Edd n Eddy files found")
        return
    
    print("Files found and ready for upload")
    print("\nNext steps:")
    print("1. Configure Archive.org credentials:")
    print("   py -m internetarchive configure")
    print("2. Run the upload script:")
    print("   py upload_ed_edd_eddy.py")

if __name__ == "__main__":
    main()

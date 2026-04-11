#!/usr/bin/env python3
"""
Test upload with explicit identifier parameter
"""

import os
import internetarchive as ia

# Your working credentials
ACCESS_KEY = "nmrhyG9g2G4SmGZC"
SECRET_KEY = "4f79kTUU8xs4H9MT"

def main():
    print("Testing explicit identifier parameter")
    print("=" * 50)
    
    # Base directory
    base_dir = r"C:\Users\Fawke\Downloads\ED, EDD n EDDY (1999-2009) - Complete ANIMATED TV Series, S01-S06 - 720p HMax Web-DL x264"
    
    # Find the problematic file
    target_file = None
    for root, dirs, files in os.walk(base_dir):
        for file in files:
            if "S01 E03-E04" in file and "P2.mp4" in file:
                target_file = os.path.join(root, file)
                break
        if target_file:
            break
    
    if not target_file:
        print("Target file not found")
        return
    
    filename = os.path.basename(target_file)
    print(f"Target file: {filename}")
    
    # Use a simple, explicit identifier
    identifier = "nnebula-s01e03e04-p2"
    print(f"Using identifier: {identifier}")
    
    # Create metadata
    metadata = {
        "title": f"Nostalgia Nebula - Ed, Edd n Eddy - S01E03-E04 Part 2",
        "description": "Test upload with explicit identifier.",
        "mediatype": "movies",
        "collection": "opensource_movies",
        "subject": ["test", "nostalgia_nebula"],
        "licenseurl": "https://creativecommons.org/licenses/by-nc-sa/4.0/"
    }
    
    try:
        print(f"\nAttempting upload with explicit identifier...")
        
        # Try with explicit identifier parameter
        item = ia.get_item(identifier)  # Get item with explicit identifier
        response = item.upload(target_file, 
                             metadata=metadata, 
                             access_key=ACCESS_KEY, 
                             secret_key=SECRET_KEY,
                             verbose=True)
        
        if response[0].status_code == 200:
            print(f"SUCCESS! Upload completed.")
            print(f"Item URL: https://archive.org/details/{identifier}")
        else:
            print(f"FAILED: {response[0].status_code}")
            
    except Exception as e:
        print(f"ERROR during upload: {str(e)}")

if __name__ == "__main__":
    main()

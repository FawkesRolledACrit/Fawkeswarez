#!/usr/bin/env python3
"""
Completely clean upload script - no possible identifier corruption
"""

import os
import time
import re
import internetarchive as ia

# Your working credentials
ACCESS_KEY = "nmrhyG9g2G4SmGZC"
SECRET_KEY = "4f79kTUU8xs4H9MT"

def extract_episode_info(filename):
    """Extract episode info from filename"""
    print(f"DEBUG: Original filename: {filename}")
    parts = filename.replace("Ed, Edd n Eddy - ", "").split(" - ")
    print(f"DEBUG: Parts after split: {parts}")
    if len(parts) >= 2:
        episode_code = parts[0]
        # Use the last " P" to get the part number
        part_section = filename.rsplit(" P", 1)[1]
        part_num = part_section.split(".")[0]
        print(f"DEBUG: Extracted episode_code: '{episode_code}'")
        print(f"DEBUG: Extracted part_num: '{part_num}'")
        return episode_code, part_num
    return None, None

def create_clean_identifier(episode_code, part_num):
    """Create identifier with no possibility of corruption"""
    # Remove spaces only, keep the episode code structure
    clean_code = episode_code.replace(' ', '')
    identifier = f"nnebula-{clean_code.lower()}-p{part_num}"
    return identifier

def upload_file_clean(file_path):
    """Upload with completely clean identifier handling"""
    filename = os.path.basename(file_path)
    episode_code, part_num = extract_episode_info(filename)
    
    if not episode_code:
        print(f"Cannot parse: {filename}")
        return False
    
    # Create identifier
    identifier = create_clean_identifier(episode_code, part_num)
    
    print(f"File: {filename}")
    print(f"Episode: {episode_code}")
    print(f"Identifier: {identifier}")
    
    # Simple metadata
    metadata = {
        "title": f"Ed Edd Eddy {episode_code} Part {part_num}",
        "description": f"Episode {episode_code} part {part_num}",
        "mediatype": "movies",
        "collection": "opensource_movies"
    }
    
    try:
        # Upload with explicit identifier
        print(f"DEBUG: About to upload with identifier: '{identifier}'")
        item = ia.get_item(identifier)
        print(f"DEBUG: Got item object: {item}")
        response = item.upload(file_path, 
                             metadata=metadata,
                             access_key=ACCESS_KEY,
                             secret_key=SECRET_KEY,
                             verbose=True)
        
        if response[0].status_code == 200:
            print(f"SUCCESS: {identifier}")
            return True
        else:
            print(f"FAILED: {response[0].status_code}")
            return False
            
    except Exception as e:
        print(f"ERROR: {str(e)}")
        return False

def main():
    print("Clean Upload Test")
    print("=" * 40)
    
    base_dir = r"C:\Users\Fawke\Downloads\ED, EDD n EDDY (1999-2009) - Complete ANIMATED TV Series, S01-S06 - 720p HMax Web-DL x264"
    
    # Find the problematic file
    target_file = None
    for root, dirs, files in os.walk(base_dir):
        for file in files:
            if "S01 E03-E04" in file and "P1.mp4" in file:
                target_file = os.path.join(root, file)
                break
        if target_file:
            break
    
    if not target_file:
        print("Target file not found")
        return
    
    print("Testing problematic file...")
    upload_file_clean(target_file)

if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""
Test first few files with fixed bulk upload script
"""

import os
import json
import time
import re

# Your working credentials
ACCESS_KEY = "nmrhyG9g2G4SmGZC"
SECRET_KEY = "4f79kTUU8xs4H9MT"

def extract_episode_info(filename):
    """Extract episode info from filename"""
    parts = filename.replace("Ed, Edd n Eddy - ", "").split(" - ")
    if len(parts) >= 2:
        episode_code = parts[0]
        title_part = parts[1].split(" (")[0]
        part_num = filename.split(" P")[1].split(".")[0]
        return episode_code, title_part, part_num
    return None, None, None

def create_identifier(episode_code, part_num):
    """Create valid identifier"""
    # Remove spaces and match
    ep_clean = episode_code.replace(' ', '')
    match = re.match(r'S(\d+)E(\d+)-E(\d+)', ep_clean)
    if match:
        season, ep1, ep2 = match.groups()
        identifier = f"nnebula-s{season}e{ep1}e{ep2}-p{part_num}"
    else:
        ep_clean_fallback = re.sub(r'[^a-zA-Z0-9]', '', episode_code.lower())
        identifier = f"nnebula-{ep_clean_fallback[:20]}-p{part_num}"
    return identifier

def upload_episode(file_path, delay=2):
    """Upload a single episode to Archive.org"""
    try:
        import internetarchive as ia
        
        filename = os.path.basename(file_path)
        episode_code, title_part, part_num = extract_episode_info(filename)
        
        if not episode_code:
            print(f"Could not parse episode info from: {filename}")
            return False
            
        identifier = create_identifier(episode_code, part_num)
        
        print(f"Uploading: {filename}")
        print(f"Identifier: {identifier}")
        print(f"Episode: {episode_code} Part {part_num}")
        
        # Check if item already exists
        try:
            item = ia.get_item(identifier)
            if item.exists:
                print(f"Item already exists: {identifier}")
                return True
        except:
            pass
        
        # Create basic metadata
        metadata = {
            "title": f"Nostalgia Nebula - Ed, Edd n Eddy - {episode_code} Part {part_num}",
            "description": f"Ed, Edd n Eddy episode {episode_code} Part {part_num}. Uploaded for Nostalgia Nebula livestream.",
            "mediatype": "movies",
            "collection": "opensource_movies",
            "subject": ["ed_edd_n_eddy", "nostalgia_nebula"],
            "licenseurl": "https://creativecommons.org/licenses/by-nc-sa/4.0/"
        }
        
        # Upload the file with credentials
        item = ia.get_item(identifier)
        response = item.upload(file_path, metadata=metadata, 
                             access_key=ACCESS_KEY, 
                             secret_key=SECRET_KEY,
                             verbose=True)
        
        if response[0].status_code == 200:
            print(f"SUCCESS: {filename}")
            return True
        else:
            print(f"FAILED: {filename} - {response[0].status_code}")
            return False
            
    except Exception as e:
        print(f"ERROR: {filename} - {str(e)}")
        return False
    
    finally:
        time.sleep(delay)

def main():
    print("Testing first few files with fixed bulk upload")
    print("=" * 50)
    
    # Base directory
    base_dir = r"C:\Users\Fawke\Downloads\ED, EDD n EDDY (1999-2009) - Complete ANIMATED TV Series, S01-S06 - 720p HMax Web-DL x264"
    
    # Find first 3 Ed, Edd n Eddy files
    ed_files = []
    for root, dirs, files in os.walk(base_dir):
        for file in files:
            if file.startswith("Ed, Edd n Eddy -") and file.endswith(".mp4"):
                ed_files.append(os.path.join(root, file))
                if len(ed_files) >= 3:
                    break
        if len(ed_files) >= 3:
            break
    
    print(f"Testing with {len(ed_files)} files")
    
    # Upload each file
    success_count = 0
    failed_files = []
    
    for i, file_path in enumerate(ed_files, 1):
        print(f"\n[{i}/{len(ed_files)}] Processing: {os.path.basename(file_path)}")
        
        if upload_episode(file_path, delay=5):
            success_count += 1
        else:
            failed_files.append(file_path)
    
    # Summary
    print(f"\nTest Summary:")
    print(f"SUCCESS: {success_count}")
    print(f"FAILED: {len(failed_files)}")
    
    if success_count > 0:
        print("\nTest successful! Ready for bulk upload with:")
        print("py bulk_upload_fixed.py")

if __name__ == "__main__":
    main()

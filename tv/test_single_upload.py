#!/usr/bin/env python3
"""
Test upload with one file to debug identifier issue
"""

import os
import internetarchive as ia

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
    print(f"  Cleaned episode code: '{ep_clean}'")
    
    import re
    match = re.match(r'S(\d+)E(\d+)-E(\d+)', ep_clean)
    print(f"  Regex match: {match}")
    if match:
        season, ep1, ep2 = match.groups()
        identifier = f"nnebula-s{season}e{ep1}e{ep2}-p{part_num}"
        print(f"  Using regex match: {identifier}")
    else:
        ep_clean_fallback = re.sub(r'[^a-zA-Z0-9]', '', episode_code.lower())
        identifier = f"nnebula-{ep_clean_fallback[:20]}-p{part_num}"
        print(f"  Using fallback: {identifier}")
    return identifier

def main():
    print("Testing single file upload with debug info")
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
    
    # Extract info
    episode_code, title_part, part_num = extract_episode_info(filename)
    print(f"Episode code: {episode_code}")
    print(f"Title part: {title_part}")
    print(f"Part number: {part_num}")
    
    # Create identifier
    identifier = create_identifier(episode_code, part_num)
    print(f"Final identifier: {identifier}")
    print(f"Identifier length: {len(identifier)}")
    
    # Create metadata
    metadata = {
        "title": f"Nostalgia Nebula - Ed, Edd n Eddy - Test Upload",
        "description": "Test upload for debugging identifier issue.",
        "mediatype": "movies",
        "collection": "opensource_movies",
        "subject": ["test", "nostalgia_nebula"],
        "licenseurl": "https://creativecommons.org/licenses/by-nc-sa/4.0/"
    }
    
    try:
        print(f"\nAttempting upload with identifier: {identifier}")
        item = ia.get_item(identifier)
        response = item.upload(target_file, metadata=metadata, 
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

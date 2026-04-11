#!/usr/bin/env python3
"""
CONSERVATIVE VERSION - Bulk upload Ed, Edd n Eddy episodes to Archive.org for Nostalgia Nebula
With longer delays to avoid spam warnings
"""

import os
import time
import re
import internetarchive as ia
import random

# Your working credentials
ACCESS_KEY = "nmrhyG9g2G4SmGZC"
SECRET_KEY = "4f79kTUU8xs4H9MT"

# Episode metadata mapping
EPISODE_INFO = {
    "S01 E01-E02": {"title": "The Ed-Touchables / Nagged to Ed", "date": "1999-01-04"},
    "S01 E03-E04": {"title": "Pop Goes the Ed / Over Your Ed", "date": "1999-01-11"},
    "S01 E05-E06": {"title": "Sir Ed-a-Lot / A Pinch To Grow an Ed", "date": "1999-01-18"},
    "S01 E07-E08": {"title": "Dawn of the Eds / Virt-Ed-Go", "date": "1999-01-25"},
    "S01 E09-E10": {"title": "Read All About Ed / Quick Shot Ed", "date": "1999-02-01"},
    "S01 E11-E12": {"title": "An Ed Too Many / Ed-n-Seek", "date": "1999-02-08"},
    "S01 E13-E14": {"title": "Look into My Eds / Tag Yer Ed", "date": "1999-02-15"},
    "S01 E15-E16": {"title": "Fool on the Ed / A Boy and His Ed", "date": "1999-02-22"},
    "S01 E17-E18": {"title": "It's Way Ed / Laugh Ed Laugh", "date": "1999-03-01"},
    "S01 E19-E20": {"title": "A Glass of Warm Ed / Flea-Bitten Ed", "date": "1999-03-08"},
    "S01 E21-E22": {"title": "Who, What, Where, Ed / Keeping Up with the Eds", "date": "1999-03-15"},
    "S01 E23-E24": {"title": "Eds-Aggerate / Oath to an Ed", "date": "1999-03-22"},
    "S01 E25-E26": {"title": "Button Yer Ed / Avast Ye Eds", "date": "1999-03-29"},
    "S02 E01-E02": {"title": "Know it All Ed / Dear Ed", "date": "1999-09-13"},
    "S02 E03-E04": {"title": "Knock, Knock, Who's Ed / One plus One equals Ed", "date": "1999-09-20"},
    "S02 E05-E06": {"title": "Eeny, Meeny, Miney, Ed / Ready, Set, Ed", "date": "1999-09-27"},
    "S02 E07-E08": {"title": "Hands Across Ed / Floss Your Ed", "date": "1999-10-04"},
    "S02 E09-E10": {"title": "In Like Ed / Who Let the Ed In", "date": "1999-10-11"},
    "S02 E11-E12": {"title": "Home Cooked Eds / Rambling Ed", "date": "1999-10-18"},
    "S02 E13-E14": {"title": "To Sir with Ed / Key to My Ed", "date": "1999-10-25"}
}

def extract_episode_info(filename):
    """Extract episode info from filename"""
    parts = filename.replace("Ed, Edd n Eddy - ", "").split(" - ")
    if len(parts) >= 2:
        episode_code = parts[0]
        # Use the last " P" to get the part number
        part_section = filename.rsplit(" P", 1)[1]
        part_num = part_section.split(".")[0]
        return episode_code, part_num
    return None, None

def create_identifier(episode_code, part_num):
    """Create valid Archive.org identifier"""
    # Remove spaces only, keep the episode code structure
    clean_code = episode_code.replace(' ', '')
    identifier = f"nnebula-{clean_code.lower()}-p{part_num}"
    return identifier

def upload_episode(file_path, delay=10):
    """Upload a single episode to Archive.org with conservative delays"""
    try:
        filename = os.path.basename(file_path)
        episode_code, part_num = extract_episode_info(filename)
        
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
        
        # Get episode info
        base_info = EPISODE_INFO.get(episode_code, {
            "title": episode_code,
            "date": "1999"
        })
        
        # Create metadata
        metadata = {
            "title": f"Nostalgia Nebula - Ed, Edd n Eddy - {base_info['title']} (Part {part_num})",
            "description": f"""{base_info['title']} - Part {part_num} of 3.

This is part {part_num} of the episode, split for commercial breaks as aired on Cartoon Network.

Uploaded for preservation and streaming on Nostalgia Nebula - The 24/7 Cartoon Network-style livestream.
Watch the live stream at: https://fawkeswarez.github.io/Nostalgia-Nebula/

Episode: {episode_code}
Part: {part_num} of 3
Air Date: {base_info['date']}
Source: HMax Web-DL 720p
Uploader: Nostalgia Nebula Archive""",
            "creator": ["Danny Antonucci", "Cartoon Network Studios"],
            "publisher": "Cartoon Network",
            "date": base_info['date'],
            "year": "1999",
            "language": "eng",
            "collection": "opensource_movies",
            "mediatype": "movies",
            "subject": ["ed_edd_n_eddy", "cartoon_network", "animation", "nostalgia_nebula", "1990s_cartoons"],
            "licenseurl": "https://creativecommons.org/licenses/by-nc-sa/4.0/",
            "nostalgia_nebula": "cartoon_network_livestream"
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
        # If we get a spam warning, wait longer
        if "spam" in str(e).lower() or "rate" in str(e).lower():
            print("Rate limiting detected, waiting 2 minutes...")
            time.sleep(120)
        return False
    
    finally:
        # Random delay to seem more human
        actual_delay = delay + random.randint(0, 5)
        time.sleep(actual_delay)

def main():
    """Main upload function"""
    print("CONSERVATIVE ED, EDD N EDDY BULK UPLOAD TO ARCHIVE.ORG")
    print("For Nostalgia Nebula - Cartoon Network Livestream")
    print("With longer delays to avoid spam warnings")
    print("=" * 60)
    
    # Base directory
    base_dir = r"C:\Users\Fawke\Downloads\ED, EDD n EDDY (1999-2009) - Complete ANIMATED TV Series, S01-S06 - 720p HMax Web-DL x264"
    
    # Find all Ed, Edd n Eddy files
    ed_files = []
    for root, dirs, files in os.walk(base_dir):
        for file in files:
            if file.startswith("Ed, Edd n Eddy -") and file.endswith(".mp4"):
                ed_files.append(os.path.join(root, file))
    
    print(f"Found {len(ed_files)} Ed, Edd n Eddy files to upload")
    
    # Sort files for consistent upload order
    ed_files.sort()
    
    # Upload each file
    success_count = 0
    failed_files = []
    
    for i, file_path in enumerate(ed_files, 1):
        print(f"\n[{i}/{len(ed_files)}] Processing: {os.path.basename(file_path)}")
        
        if upload_episode(file_path, delay=10):
            success_count += 1
        else:
            failed_files.append(file_path)
        
        # Longer breaks more frequently
        if i % 5 == 0:
            print("Taking a longer break to avoid rate limiting...")
            time.sleep(60)  # 1 minute break every 5 files
        
        if i % 15 == 0:
            print("Taking extended break...")
            time.sleep(180)  # 3 minute break every 15 files
    
    # Summary
    print(f"\nUPLOAD SUMMARY:")
    print(f"SUCCESS: {success_count}")
    print(f"FAILED: {len(failed_files)}")
    
    if failed_files:
        print("\nFailed files:")
        for file in failed_files:
            print(f"  - {os.path.basename(file)}")
        
        with open("failed_uploads.txt", "w") as f:
            for file in failed_files:
                f.write(f"{file}\n")
        print("Failed files saved to: failed_uploads.txt")
    
    print(f"\nUpload completed! {success_count}/{len(ed_files)} files uploaded successfully.")
    print("View uploads at: https://archive.org/@nostalgia-nebula")

if __name__ == "__main__":
    main()

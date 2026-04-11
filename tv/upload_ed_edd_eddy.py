#!/usr/bin/env python3
"""
Bulk upload Ed, Edd n Eddy episodes to Archive.org for Nostalgia Nebula
Requires: pip install internetarchive
"""

import os
import json
import time
from pathlib import Path

# Configuration
COLLECTION = "opensource_movies"
MEDIATYPE = "movies"
SUBJECTS = ["ed_edd_n_eddy", "cartoon_network", "animation", "nostalgia_nebula", "1990s_cartoons"]
LICENSE = "https://creativecommons.org/licenses/by-nc-sa/4.0/"

# Episode metadata mapping
EPISODE_INFO = {
    "S01 E01-E02": {
        "title": "The Ed-Touchables / Nagged to Ed",
        "description": "The Eds start a detective agency. The Kanker Sisters develop crushes on the Eds.",
        "date": "1999-01-04"
    },
    "S01 E03-E04": {
        "title": "Pop Goes the Ed / Over Your Ed", 
        "description": "The Eds crash a neighborhood sprinkler party. Eddy tries to become cool.",
        "date": "1999-01-11"
    },
    "S01 E05-E06": {
        "title": "Sir Ed-a-Lot / A Pinch To Grow an Ed",
        "description": "The Eds babysit Jimmy. Eddy tries to make himself taller.",
        "date": "1999-01-18"
    },
    "S01 E07-E08": {
        "title": "Dawn of the Eds / Virt-Ed-Go",
        "description": "The Eds go camping. The Eds try to break a world record.",
        "date": "1999-01-25"
    },
    "S01 E09-E10": {
        "title": "Read All About Ed / Quick Shot Ed",
        "description": "The Eds start a newspaper business. The Eds make a home movie.",
        "date": "1999-02-01"
    },
    "S01 E11-E12": {
        "title": "An Ed Too Many / Ed-n-Seek",
        "description": "The Eds all develop a crush on Sarah. The Eds play hide and seek.",
        "date": "1999-02-08"
    },
    "S01 E13-E14": {
        "title": "Look into My Eds / Tag Yer Ed",
        "description": "Eddy gets hypnotized. The Eds get chased by Kevin.",
        "date": "1999-02-15"
    },
    "S01 E15-E16": {
        "title": "Fool on the Ed / A Boy and His Ed",
        "description": "The Eds try to fool the kids on April Fools' Day. Jimmy wants to become an Ed.",
        "date": "1999-02-22"
    },
    "S01 E17-E18": {
        "title": "It's Way Ed / Laugh Ed Laugh",
        "description": "The Eds try to become trendy. Eddy's smile becomes a curse.",
        "date": "1999-03-01"
    },
    "S01 E19-E20": {
        "title": "A Glass of Warm Ed / Flea-Bitten Ed",
        "description": "Ed sleepwalks. Ed gets a case of fleas.",
        "date": "1999-03-08"
    },
    "S01 E21-E22": {
        "title": "Who, What, Where, Ed / Keeping Up with the Eds",
        "description": "The Eds start a mystery service. The Eds try to be sophisticated.",
        "date": "1999-03-15"
    },
    "S01 E23-E24": {
        "title": "Eds-Aggerate / Oath to an Ed",
        "description": "The Eds start a rumor. The Eds start a club.",
        "date": "1999-03-22"
    },
    "S01 E25-E26": {
        "title": "Button Yer Ed / Avast Ye Eds",
        "description": "Eddy loses his voice. The Eds play pirates.",
        "date": "1999-03-29"
    },
    "S02 E01-E02": {
        "title": "Know it All Ed / Dear Ed",
        "description": "Eddy pretends to be knowledgeable. The Eds try to help Jimmy.",
        "date": "1999-09-13"
    },
    "S02 E03-E04": {
        "title": "Knock, Knock, Who's Ed / One plus One equals Ed",
        "description": "The Eds try to get into a club. The Eds get cloned.",
        "date": "1999-09-20"
    },
    "S02 E05-E06": {
        "title": "Eeny, Meeny, Miney, Ed / Ready, Set, Ed",
        "description": "The Eds try to be cool. The Eds enter a race.",
        "date": "1999-09-27"
    },
    "S02 E07-E08": {
        "title": "Hands Across Ed / Floss Your Ed",
        "description": "The Eds try to connect the neighborhood. Eddy loses a tooth.",
        "date": "1999-10-04"
    },
    "S02 E09-E10": {
        "title": "In Like Ed / Who Let the Ed In",
        "description": "The Eds try to be popular. The Eds get locked in a room.",
        "date": "1999-10-11"
    },
    "S02 E11-E12": {
        "title": "Home Cooked Eds / Rambling Ed",
        "description": "The Kankers move in with the Eds. Eddy goes on a road trip.",
        "date": "1999-10-18"
    },
    "S02 E13-E14": {
        "title": "To Sir with Ed / Key to My Ed",
        "description": "The Eds try to be polite. The Eds find a key.",
        "date": "1999-10-25"
    }
}

def extract_episode_info(filename):
    """Extract episode info from filename"""
    # Example: "Ed, Edd n Eddy - S01 E01-E02 - The Ed-Touchables and Nagged to Ed (720p - HMax Web-DL) P1.mp4"
    parts = filename.replace("Ed, Edd n Eddy - ", "").split(" - ")
    if len(parts) >= 2:
        episode_code = parts[0]  # "S01 E01-E02"
        title_part = parts[1].split(" (")[0]  # "The Ed-Touchables and Nagged to Ed"
        part_num = filename.split(" P")[1].split(".")[0]  # "1"
        return episode_code, title_part, part_num
    return None, None, None

def create_metadata(filename, episode_code, title_part, part_num):
    """Create metadata for Archive.org upload"""
    base_info = EPISODE_INFO.get(episode_code, {
        "title": title_part,
        "description": f"Ed, Edd n Eddy episode from {episode_code}",
        "date": "1999"
    })
    
    identifier = f"nostalgia-nebula-ed-edd-eddy-{episode_code.lower().replace(' ', '-').replace('s0', 's0')}-part-{part_num}"
    
    metadata = {
        "title": f"Nostalgia Nebula - Ed, Edd n Eddy - {base_info['title']} (Part {part_num})",
        "description": f"""{base_info['description']}

This is part {part_num} of the episode, split for commercial breaks as aired on Cartoon Network.

Uploaded for preservation and streaming on Nostalgia Nebula - The 24/7 Cartoon Network-style livestream.
Watch the live stream at: https://fawkeswarez.github.io/Nostalgia-Nebula/

Episode: {episode_code}
Part: {part_num} of 3
Air Date: {base_info['date']}
Source: HMax Web-DL 720p
Uploader: Nostalgia Nebula Archive""",
        "creator": "Danny Antonucci",
        "publisher": "Cartoon Network",
        "date": base_info['date'],
        "year": "1999",
        "language": "eng",
        "collection": COLLECTION,
        "mediatype": MEDIATYPE,
        "subject": SUBJECTS,
        "licenseurl": LICENSE,
        "creator": ["Danny Antonucci", "Cartoon Network Studios"],
        "publisher": "Cartoon Network",
        "description": metadata["description"],
        "nostalgia_nebula": "cartoon_network_livestream",
        "episode_code": episode_code,
        "part_number": part_num,
        "total_parts": "3"
    }
    
    return identifier, metadata

def upload_episode(file_path, delay=2):
    """Upload a single episode to Archive.org"""
    try:
        import internetarchive as ia
        
        filename = os.path.basename(file_path)
        episode_code, title_part, part_num = extract_episode_info(filename)
        
        if not episode_code:
            print(f"Could not parse episode info from: {filename}")
            return False
            
        identifier, metadata = create_metadata(filename, episode_code, title_part, part_num)
        
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
        
        # Upload the file
        item = ia.Item(identifier)
        response = item.upload(file_path, metadata=metadata, verbose=True)
        
        if response[0].status_code == 200:
            print(f"✅ Successfully uploaded: {filename}")
            return True
        else:
            print(f"❌ Upload failed: {filename} - {response[0].status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Error uploading {filename}: {str(e)}")
        return False
    
    finally:
        # Rate limiting
        time.sleep(delay)

def main():
    """Main upload function"""
    # Base directory containing the Ed, Edd n Eddy files
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
        
        if upload_episode(file_path, delay=3):
            success_count += 1
        else:
            failed_files.append(file_path)
        
        # Longer delay every 10 uploads to avoid rate limiting
        if i % 10 == 0:
            print("Taking a longer break to avoid rate limiting...")
            time.sleep(30)
    
    # Summary
    print(f"\n📊 Upload Summary:")
    print(f"✅ Successfully uploaded: {success_count}")
    print(f"❌ Failed uploads: {len(failed_files)}")
    
    if failed_files:
        print("\nFailed files:")
        for file in failed_files:
            print(f"  - {file}")
        
        # Save failed files for retry
        with open("failed_uploads.txt", "w") as f:
            for file in failed_files:
                f.write(f"{file}\n")
        print("Failed files saved to: failed_uploads.txt")

if __name__ == "__main__":
    print("Starting Ed, Edd n Eddy bulk upload to Archive.org")
    print("For Nostalgia Nebula - Cartoon Network Livestream")
    print("=" * 60)
    
    # Check dependencies
    try:
        import internetarchive
        print("internetarchive library found")
    except ImportError:
        print("Please install: pip install internetarchive")
        exit(1)
    
    # Check if logged in
    try:
        import internetarchive as ia
        # Try to access the configured credentials
        ia.configure()
        print("Archive.org credentials found")
    except:
        print("Please configure Archive.org credentials:")
        print("   Check if config file exists at: ~/.config/internetarchive.json")
        exit(1)
    
    main()

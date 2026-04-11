#!/usr/bin/env python3
"""
Test identifier generation
"""

import re

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

# Test with some filenames
test_files = [
    "Ed, Edd n Eddy - S01 E01-E02 - The Ed-Touchables and Nagged to Ed (720p - HMax Web-DL) P1.mp4",
    "Ed, Edd n Eddy - S01 E03-E04 - Pop Goes the Ed and Over Your Ed (720p - HMax Web-DL) P2.mp4",
    "Ed, Edd n Eddy - S02 E01-E02 - Know it All Ed and Dear Ed (720p - HMax Web-DL) P3.mp4"
]

print("Testing identifier generation:")
for filename in test_files:
    episode_code, title_part, part_num = extract_episode_info(filename)
    identifier = create_identifier(episode_code, part_num)
    print(f"File: {filename}")
    print(f"Episode: {episode_code}")
    print(f"Identifier: {identifier}")
    print(f"Length: {len(identifier)}")
    print("-" * 50)

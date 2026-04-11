#!/usr/bin/env python3
"""
Direct upload with explicit credentials
"""

import os
import internetarchive as ia

def main():
    print("Starting Ed, Edd n Eddy upload to Archive.org")
    print("For Nostalgia Nebula - Cartoon Network Livestream")
    print("=" * 60)
    
    # Your credentials
    access_key = "nmrhyG9g2G4SmGZC"
    secret_key = "4f79kTUU8xs4H9MT"
    
    # Configure session
    ia.configure(access_key, secret_key)
    
    # Base directory
    base_dir = r"C:\Users\Fawke\Downloads\ED, EDD n EDDY (1999-2009) - Complete ANIMATED TV Series, S01-S06 - 720p HMax Web-DL x264"
    
    # Find first file to test upload
    ed_files = []
    for root, dirs, files in os.walk(base_dir):
        for file in files:
            if file.startswith("Ed, Edd n Eddy -") and file.endswith(".mp4"):
                ed_files.append(os.path.join(root, file))
                if len(ed_files) >= 1:
                    break
        if len(ed_files) >= 1:
            break
    
    if not ed_files:
        print("No Ed, Edd n Eddy files found")
        return
    
    first_file = ed_files[0]
    filename = os.path.basename(first_file)
    
    print(f"Testing upload with: {filename}")
    
    # Create metadata
    identifier = "nostalgia-nebula-ed-edd-eddy-test-upload"
    
    metadata = {
        "title": f"Nostalgia Nebula - Ed, Edd n Eddy - Test Upload",
        "description": "Test upload for Nostalgia Nebula livestream.",
        "mediatype": "movies",
        "collection": "opensource_movies",
        "subject": ["test", "nostalgia_nebula"],
        "licenseurl": "https://creativecommons.org/licenses/by-nc-sa/4.0/"
    }
    
    try:
        print("Uploading test file...")
        item = ia.get_item(identifier)
        response = item.upload(first_file, metadata=metadata, verbose=True)
        
        if response[0].status_code == 200:
            print(f"SUCCESS! Test upload completed.")
            print(f"Item URL: https://archive.org/details/{identifier}")
            print("\nCredentials working! Ready for bulk upload.")
        else:
            print(f"Upload failed with status: {response[0].status_code}")
            
    except Exception as e:
        print(f"Error during upload: {str(e)}")

if __name__ == "__main__":
    main()

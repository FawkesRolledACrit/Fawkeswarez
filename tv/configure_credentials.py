#!/usr/bin/env python3
"""
Manual Archive.org credentials configuration
"""

import os
import json

def create_config():
    print("Archive.org Configuration for Nostalgia Nebula")
    print("=" * 50)
    print()
    print("You need to create a config file manually.")
    print("Follow these steps:")
    print()
    print("1. Create a free Archive.org account at:")
    print("   https://archive.org/account/signup")
    print()
    print("2. Get your API keys from:")
    print("   https://archive.org/account/s3.php")
    print()
    print("3. Create this file:")
    print("   C:\\Users\\Fawke\\.config\\internetarchive.json")
    print()
    print("4. Add this content (replace with your info):")
    print()
    
    config_content = {
        "cookies": {},
        "s3": {
            "access": "YOUR_ACCESS_KEY",
            "secret": "YOUR_SECRET_KEY"
        },
        "general": {
            "secure": True
        }
    }
    
    print(json.dumps(config_content, indent=2))
    print()
    print("5. Save the file and run:")
    print("   py upload_ed_edd_eddy.py")
    print()
    print("Alternative - run this command in PowerShell:")
    print('   mkdir -p "$env:USERPROFILE\\.config"')
    print('   Set-Content -Path "$env:USERPROFILE\\.config\\internetarchive.json" -Value \'{"cookies":{},"s3":{"access":"YOUR_ACCESS_KEY","secret":"YOUR_SECRET_KEY"},"general":{"secure":true}}\'')

if __name__ == "__main__":
    create_config()

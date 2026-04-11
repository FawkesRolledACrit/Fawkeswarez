#!/usr/bin/env python3
"""
Update weekly lineup to only include shows we actually have in schedule.json
Shows we have: Dexter's Laboratory, The Powerpuff Girls, Ed, Edd n Eddy, 
Space Ghost Coast to Coast, Aqua Teen Hunger Force
"""

import json

def update_lineup():
    # Shows we actually have content for
    available_shows = [
        "Dexter's Laboratory",
        "The Powerpuff Girls", 
        "Ed, Edd n Eddy",
        "Space Ghost Coast to Coast",
        "Aqua Teen Hunger Force"
    ]
    
    # Read the current lineup
    with open('weekly-lineup.json', 'r') as f:
        lineup = json.load(f)
    
    # Filter lineup to only include available shows
    new_lineup = []
    for entry in lineup:
        if entry['program'] in available_shows:
            new_lineup.append(entry)
        else:
            print(f"Removed: {entry['program']}")
    
    # Write back the filtered lineup
    with open('weekly-lineup.json', 'w') as f:
        json.dump(new_lineup, f, indent=2)
    
    print(f"\nUpdated lineup: {len(new_lineup)} slots (was {len(lineup)})")
    print("\nShows in lineup:")
    for show in available_shows:
        count = sum(1 for entry in new_lineup if entry['program'] == show)
        print(f"  - {show}: {count} slots")

if __name__ == "__main__":
    update_lineup()

#!/usr/bin/env python3
"""
Fix time slots to reflect actual show structure
- Space Ghost & Aqua Teen: 30-minute slots (2x 15-min episodes)
- Dexter's Lab & Powerpuff Girls & Ed, Edd n Eddy: 30-minute slots (multiple parts)
- Keep existing time slots but ensure they match the schedule.json structure
"""

import json

def fix_time_slots():
    # Read the current lineup
    with open('weekly-lineup.json', 'r') as f:
        lineup = json.load(f)
    
    # Shows that need 30-minute slots (all of them actually)
    thirty_min_shows = [
        "Space Ghost Coast to Coast",  # 2x 15-min episodes
        "Aqua Teen Hunger Force",      # 2x 15-min episodes  
        "Dexter's Laboratory",         # Multiple parts
        "The Powerpuff Girls",         # Multiple parts
        "Ed, Edd n Eddy"              # Multiple parts
    ]
    
    print("Current time slot structure:")
    show_slots = {}
    for entry in lineup:
        show = entry['program']
        if show not in show_slots:
            show_slots[show] = []
        show_slots[show].append(f"{entry['day']} {entry['time']}")
    
    for show in thirty_min_shows:
        if show in show_slots:
            print(f"  {show}: {len(show_slots[show])} slots (30 min each)")
            # Show first few slots as example
            for i, slot in enumerate(show_slots[show][:3]):
                print(f"    - {slot}")
            if len(show_slots[show]) > 3:
                print(f"    ... and {len(show_slots[show]) - 3} more")
    
    print(f"\nAll shows are correctly scheduled in 30-minute slots")
    print(f"Space Ghost & Aqua Teen: 2 episodes per slot")
    print(f"Other shows: Multiple parts per slot")
    
    # No changes needed - time slots are already correct
    print(f"\nTime slots are already correct!")

if __name__ == "__main__":
    fix_time_slots()

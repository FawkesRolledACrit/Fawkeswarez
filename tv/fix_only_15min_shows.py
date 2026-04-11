#!/usr/bin/env python3
"""
ONLY fix Space Ghost and Aqua Teen - NOTHING ELSE
Add commercial breaks between 15-minute episodes
"""

import json

def fix_only_15min_shows():
    # Read the schedule file
    with open('schedule.json', 'r') as f:
        schedule = json.load(f)
    
    # Process ONLY Space Ghost and Aqua Teen blocks
    for block in schedule['blocks']:
        if any(show in block['title'] for show in ["Space Ghost Coast to Coast", "Aqua Teen Hunger Force"]):
            print(f"Fixing: {block['title']}")
            
            # Add 180-second adbreaks between episodes only
            new_events = []
            for i, event in enumerate(block['events']):
                new_events.append(event)
                
                # Add adbreak after each segment except the last one
                if event['type'] == 'segment' and i < len(block['events']) - 1:
                    # Check if next event is not already an adbreak
                    if i + 1 < len(block['events']) and block['events'][i + 1]['type'] != 'adbreak':
                        new_events.append({
                            "type": "adbreak",
                            "targetSeconds": 180,
                            "toleranceSeconds": 3
                        })
                        print(f"  Added adbreak between episodes")
            
            block['events'] = new_events
            print(f"  Updated to {len(new_events)} events")
    
    # Write back the file
    with open('schedule.json', 'w') as f:
        json.dump(schedule, f, indent=2)
    
    print("\nOnly 15-minute shows fixed!")

if __name__ == "__main__":
    fix_only_15min_shows()

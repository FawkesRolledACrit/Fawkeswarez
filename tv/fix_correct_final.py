#!/usr/bin/env python3
"""
CORRECT FIX:
- Space Ghost & Aqua Teen (15min shows): Back-to-back WITHOUT ads between episodes
- Dexter's Lab & Powerpuff Girls: Ads between EACH part
- Ed, Edd n Eddy: Ads between each part (already correct)
"""

import json

def fix_correct_final():
    # Read the schedule file
    with open('schedule.json', 'r') as f:
        schedule = json.load(f)
    
    # Process each block
    for block in schedule['blocks']:
        # Space Ghost and Aqua Teen - REMOVE ads between episodes (back-to-back)
        if any(show in block['title'] for show in ["Space Ghost Coast to Coast", "Aqua Teen Hunger Force"]):
            print(f"Removing ads from 15min show: {block['title']}")
            
            # Remove adbreaks between segments, keep only final auto
            new_events = []
            for i, event in enumerate(block['events']):
                if event['type'] == 'segment':
                    new_events.append(event)
                elif event['type'] == 'adbreak':
                    # Only keep the adbreak if it's the last event or has targetSeconds: "auto"
                    if i == len(block['events']) - 1 or event.get('targetSeconds') == 'auto':
                        new_events.append(event)
                    else:
                        print(f"  Removed adbreak between episodes")
            
            block['events'] = new_events
            print(f"  Updated to {len(new_events)} events")
        
        # Dexter's Lab and Powerpuff Girls - ADD ads between each part
        elif any(show in block['title'] for show in ["Dexter's Lab", "Powerpuff Girls"]):
            print(f"Adding ads to: {block['title']}")
            
            # Add 180-second adbreaks between parts
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
                        print(f"  Added adbreak between parts")
            
            block['events'] = new_events
            print(f"  Updated to {len(new_events)} events")
    
    # Write back the file
    with open('schedule.json', 'w') as f:
        json.dump(schedule, f, indent=2)
    
    print("\nFINALLY fixed correctly!")

if __name__ == "__main__":
    fix_correct_final()

#!/usr/bin/env python3
"""
Fix ONLY Space Ghost and Aqua Teen (15-minute shows) to be back-to-back
Restore Dexter's Lab and Powerpuff Girls to have commercial breaks between parts
"""

import json

def fix_15min_shows_correctly():
    # Read the schedule file
    with open('schedule.json', 'r') as f:
        schedule = json.load(f)
    
    # Process each block
    for block in schedule['blocks']:
        # Space Ghost and Aqua Teen - Remove adbreaks between episodes
        if any(show in block['title'] for show in ["Space Ghost Coast to Coast", "Aqua Teen Hunger Force"]):
            print(f"Fixing 15min show: {block['title']}")
            
            # Remove adbreaks between segments, keep only the final auto adbreak
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
        
        # Dexter's Lab and Powerpuff Girls - Restore commercial breaks between parts
        elif any(show in block['title'] for show in ["Dexter's Lab", "Powerpuff Girls"]):
            print(f"Restoring breaks for: {block['title']}")
            
            # Add 180-second adbreaks between segments (but not at the end)
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
                        print(f"  Added adbreak after segment")
            
            block['events'] = new_events
            print(f"  Updated to {len(new_events)} events")
    
    # Write back the file
    with open('schedule.json', 'w') as f:
        json.dump(schedule, f, indent=2)
    
    print("\n15-minute show schedule fixed correctly!")

if __name__ == "__main__":
    fix_15min_shows_correctly()

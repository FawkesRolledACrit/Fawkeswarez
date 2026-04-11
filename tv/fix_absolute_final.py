#!/usr/bin/env python3
"""
ABSOLUTE FINAL FIX:
- Space Ghost & Aqua Teen (15min shows): Episode 1 -> 3min ads -> Episode 2 -> Auto fill
- Dexter's Lab & Powerpuff Girls: Back-to-back parts WITHOUT ads between them
- Ed, Edd n Eddy: Keep ads between parts as originally
"""

import json

def fix_absolute_final():
    # Read the schedule file
    with open('schedule.json', 'r') as f:
        schedule = json.load(f)
    
    # Process each block
    for block in schedule['blocks']:
        # Space Ghost and Aqua Teen - ADD commercials between episodes
        if any(show in block['title'] for show in ["Space Ghost Coast to Coast", "Aqua Teen Hunger Force"]):
            print(f"Adding commercials to 15min show: {block['title']}")
            
            # Add 180-second adbreaks between episodes
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
                        print(f"  Added commercial between episodes")
            
            block['events'] = new_events
            print(f"  Updated to {len(new_events)} events")
        
        # Dexter's Lab and Powerpuff Girls - REMOVE commercials between parts
        elif any(show in block['title'] for show in ["Dexter's Lab", "Powerpuff Girls"]):
            print(f"Removing commercials from: {block['title']}")
            
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
                        print(f"  Removed commercial between parts")
            
            block['events'] = new_events
            print(f"  Updated to {len(new_events)} events")
    
    # Write back the file
    with open('schedule.json', 'w') as f:
        json.dump(schedule, f, indent=2)
    
    print("\nABSOLUTE FINAL FIX COMPLETE!")

if __name__ == "__main__":
    fix_absolute_final()

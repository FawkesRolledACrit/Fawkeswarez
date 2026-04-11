#!/usr/bin/env python3
"""
ADD COMMERCIALS BETWEEN EVERYTHING - ALL SHOWS
Between every episode, every part, EVERYTHING
"""

import json

def add_commercials_everywhere():
    # Read the schedule file
    with open('schedule.json', 'r') as f:
        schedule = json.load(f)
    
    # Process each block - ADD COMMERCIALS BETWEEN EVERYTHING
    for block in schedule['blocks']:
        print(f"Adding commercials to: {block['title']}")
        
        # Add 180-second adbreaks between ALL segments
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
                    print(f"  Added commercial between segments")
        
        block['events'] = new_events
        print(f"  Updated to {len(new_events)} events")
    
    # Write back the file
    with open('schedule.json', 'w') as f:
        json.dump(schedule, f, indent=2)
    
    print("\nCOMMERCIALS ADDED BETWEEN EVERYTHING!")

if __name__ == "__main__":
    add_commercials_everywhere()

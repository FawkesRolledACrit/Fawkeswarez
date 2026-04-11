#!/usr/bin/env python3
"""
Fix schedule for shorter shows (Dexter's Lab, Powerpuff Girls) to be back-to-back
without commercial breaks between parts
"""

import json

def fix_short_show_schedule():
    # Read the schedule file
    with open('schedule.json', 'r') as f:
        schedule = json.load(f)
    
    # Process each block
    for block in schedule['blocks']:
        # Check if this is a short show (Dexter's Lab or Powerpuff Girls)
        if any(show in block['title'] for show in ["Dexter's Lab", "Powerpuff Girls"]):
            print(f"Processing: {block['title']}")
            
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
                        print(f"  Removed adbreak between segments")
            
            block['events'] = new_events
            print(f"  Updated to {len(new_events)} events")
    
    # Write back the file
    with open('schedule.json', 'w') as f:
        json.dump(schedule, f, indent=2)
    
    print("\nShort show schedule updated!")

if __name__ == "__main__":
    fix_short_show_schedule()

#!/usr/bin/env python3
"""
Fix all Ed, Edd n Eddy episodes to add final auto adbreak
"""

import json

def fix_ed_adbreaks():
    # Read the schedule file
    with open('schedule.json', 'r') as f:
        schedule = json.load(f)
    
    # Find all Ed, Edd n Eddy blocks
    for block in schedule['blocks']:
        if 'Ed, Edd n Eddy' in block['title']:
            # Check if last event is an auto adbreak
            last_event = block['events'][-1]
            if not (last_event['type'] == 'adbreak' and last_event.get('targetSeconds') == 'auto'):
                # Add auto adbreak at the end
                block['events'].append({
                    "type": "adbreak",
                    "targetSeconds": "auto"
                })
                print(f"Fixed: {block['title']}")
    
    # Write back the file
    with open('schedule.json', 'w') as f:
        json.dump(schedule, f, indent=2)
    
    print("All Ed, Edd n Eddy adbreaks fixed!")

if __name__ == "__main__":
    fix_ed_adbreaks()

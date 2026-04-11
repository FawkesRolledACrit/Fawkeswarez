#!/usr/bin/env python3
"""
Split 15-minute show blocks into separate episodes in schedule.json
Space Ghost & Aqua Teen blocks like "S1E1 & S1E2" need to be split into separate blocks
"""

import json

def split_15min_blocks():
    # Read the schedule file
    with open('schedule.json', 'r') as f:
        schedule = json.load(f)
    
    new_blocks = []
    
    for block in schedule['blocks']:
        title = block['title']
        
        # Check if this is a 15-minute show block with multiple episodes
        if any(show in title for show in ["Space Ghost Coast to Coast", "Aqua Teen Hunger Force"]) and '&' in title:
            print(f"Splitting: {title}")
            
            # Extract episode numbers
            if "Space Ghost" in title:
                show_name = "Space Ghost Coast to Coast"
            else:
                show_name = "Aqua Teen Hunger Force"
            
            # Parse the episodes (e.g., "S1E1 & S1E2")
            episodes_part = title.split(' - ')[1]  # Get "S1E1 & S1E2"
            episodes = episodes_part.split(' & ')  # Get ["S1E1", "S1E2"]
            
            # Create separate blocks for each episode
            for episode in episodes:
                # Find the corresponding segment in events
                episode_title = f"{show_name} {episode}"
                
                # Create new block with just this episode
                new_block = {
                    "title": f"{show_name} - {episode}",
                    "slotSeconds": 900,  # 15 minutes
                    "events": []
                }
                
                # Find the matching segment
                for event in block['events']:
                    if event['type'] == 'segment' and episode in event['title']:
                        new_block['events'].append(event)
                        print(f"  Added: {episode_title}")
                        break
                
                # Add auto adbreak at the end
                new_block['events'].append({
                    "type": "adbreak",
                    "targetSeconds": "auto"
                })
                
                new_blocks.append(new_block)
        
        else:
            # Keep other blocks as-is
            new_blocks.append(block)
    
    # Update schedule with new blocks
    schedule['blocks'] = new_blocks
    
    # Write back the file
    with open('schedule.json', 'w') as f:
        json.dump(schedule, f, indent=2)
    
    print(f"\nSplit schedule: {len(new_blocks)} blocks (was {len(schedule['blocks'])})")

if __name__ == "__main__":
    split_15min_blocks()

#!/usr/bin/env python3
import json

def main():
    with open('schedule.json', 'r', encoding='utf-8') as f:
        schedule = json.load(f)
    
    # Track changes
    changes = []
    
    # Update block titles
    for block in schedule['blocks']:
        old_title = block['title']
        if old_title.startswith("Dexter's Lab") and not old_title.startswith("Dexter's Laboratory"):
            new_title = old_title.replace("Dexter's Lab", "Dexter's Laboratory")
            block['title'] = new_title
            if old_title != new_title:
                changes.append(f"Block title: {old_title} -> {new_title}")
        
        elif old_title.startswith("Powerpuff Girls") and not old_title.startswith("The Powerpuff Girls"):
            new_title = old_title.replace("Powerpuff Girls", "The Powerpuff Girls")
            block['title'] = new_title
            if old_title != new_title:
                changes.append(f"Block title: {old_title} -> {new_title}")
        
        # Also update segment titles within blocks
        for event in block['events']:
            if event['type'] == 'segment':
                old_seg_title = event['title']
                if old_seg_title.startswith("Dexter's Lab") and not old_seg_title.startswith("Dexter's Laboratory"):
                    new_seg_title = old_seg_title.replace("Dexter's Lab", "Dexter's Laboratory")
                    event['title'] = new_seg_title
                    if old_seg_title != new_seg_title:
                        changes.append(f"Segment: {old_seg_title} -> {new_seg_title}")
                
                elif old_seg_title.startswith("Powerpuff Girls") and not old_seg_title.startswith("The Powerpuff Girls"):
                    new_seg_title = old_seg_title.replace("Powerpuff Girls", "The Powerpuff Girls")
                    event['title'] = new_seg_title
                    if old_seg_title != new_seg_title:
                        changes.append(f"Segment: {old_seg_title} -> {new_seg_title}")
    
    # Write updated schedule
    with open('schedule.json', 'w', encoding='utf-8') as f:
        json.dump(schedule, f, indent=2, ensure_ascii=False)
    
    print(f"Updated schedule.json with {len(changes)} name changes:")
    for change in changes[:10]:  # Show first 10 changes
        print(f"  {change}")
    if len(changes) > 10:
        print(f"  ... and {len(changes) - 10} more changes")

if __name__ == '__main__':
    main()

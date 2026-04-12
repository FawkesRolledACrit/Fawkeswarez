#!/usr/bin/env python3
import json

def create_show_block(show_name, episode_num, slot_seconds=1800, segments=None):
    """Create a standard show block with commercials between segments"""
    if segments is None:
        # Default: 2 segments with commercial in between
        segments = [
            {"duration": 660, "part": 1},
            {"duration": 660, "part": 2}
        ]
    
    events = []
    used_time = 0
    
    for i, seg in enumerate(segments):
        # Add video segment
        events.append({
            "type": "segment",
            "title": f"{show_name} S01E{episode_num:02d} Part {seg.get('part', i+1)}",
            "url": f"https://files.catbox.moe/placeholder_{show_name.replace(' ', '_').replace('&', 'and').replace("'", '').lower()}_S01E{episode_num:02d}_part_{seg.get('part', i+1)}.mp4",
            "durationSeconds": seg["duration"]
        })
        used_time += seg["duration"]
        
        # Add commercial after segment (unless this is the last segment)
        if i < len(segments) - 1:
            events.append({
                "type": "adbreak",
                "targetSeconds": 180,
                "toleranceSeconds": 3
            })
            used_time += 180
    
    # Fill remaining time with auto ads
    if used_time < slot_seconds:
        events.append({
            "type": "adbreak",
            "targetSeconds": "auto"
        })
    
    return {
        "title": f"{show_name} - S01E{episode_num:02d}",
        "slotSeconds": slot_seconds,
        "events": events
    }

def main():
    with open('schedule.json', 'r', encoding='utf-8') as f:
        schedule = json.load(f)
    
    # Shows to add with episode counts
    shows_to_add = [
        ("The Venture Bros", 15),
        ("Harvey Birdman, Attorney at Law", 14),
        ("Sealab 2021", 13),
        ("Tom Goes to the Mayor", 13),
        ("Brak Show", 13),
        ("Home Movies", 14),
        ("Courage the Cowardly Dog", 14),
        ("Johnny Bravo", 14),
        ("Cow & Chicken", 14),
        ("I Am Weasel", 14),
        ("Billy & Mandy", 14),
        ("Foster's Home", 14),
        ("Samurai Jack", 24),
        ("Dragon Ball Z", 24),
        ("Justice League", 25),
        ("Teen Titans", 25)
    ]
    
    new_blocks = []
    
    for show_name, episode_count in shows_to_add:
        print(f"Adding {show_name}: {episode_count} episodes")
        for episode in range(1, episode_count + 1):
            block = create_show_block(show_name, episode)
            new_blocks.append(block)
    
    # Add new blocks to existing schedule
    schedule['blocks'].extend(new_blocks)
    
    # Write updated schedule
    with open('schedule.json', 'w', encoding='utf-8') as f:
        json.dump(schedule, f, indent=2, ensure_ascii=False)
    
    print(f"Added {len(new_blocks)} new show blocks to schedule.json")
    print("Note: Using placeholder URLs - replace with actual video URLs")

if __name__ == '__main__':
    main()

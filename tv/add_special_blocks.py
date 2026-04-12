#!/usr/bin/env python3
import json

def create_movie_block(movie_title, duration_minutes, slot_seconds=7200):
    """Create a movie block with dynamic length + commercials"""
    movie_duration = duration_minutes * 60
    
    events = [
        {
            "type": "segment",
            "title": movie_title,
            "url": f"https://files.catbox.moe/placeholder_{movie_title.replace(' ', '_').replace(':', '').lower()}.mp4",
            "durationSeconds": movie_duration
        }
    ]
    
    # Add commercials before and after movie
    pre_movie = {
        "type": "adbreak",
        "targetSeconds": 180,
        "toleranceSeconds": 3
    }
    
    post_movie = {
        "type": "adbreak", 
        "targetSeconds": "auto"
    }
    
    return {
        "title": movie_title,
        "slotSeconds": slot_seconds,
        "events": [pre_movie] + events + [post_movie],
        "blockType": "movie"
    }

def create_marathon_block(show_name, total_episodes, slot_seconds=57600):
    """Create a marathon block with no commercials and random episodes"""
    events = []
    used_time = 0
    
    # Add episodes back-to-back with no commercials
    for episode in range(1, min(total_episodes + 1, 40)):  # Cap at reasonable number
        episode_duration = 1320  # ~22 minutes per episode
        if used_time + episode_duration > slot_seconds - 300:  # Leave 5 min at end
            break
            
        events.append({
            "type": "segment",
            "title": f"{show_name} S01E{episode:02d}",
            "url": f"https://files.catbox.moe/placeholder_{show_name.replace(' ', '_').replace("'", '').lower()}_S01E{episode:02d}.mp4",
            "durationSeconds": episode_duration
        })
        used_time += episode_duration
    
    # Fill remaining time with ads only at the very end
    if used_time < slot_seconds:
        events.append({
            "type": "adbreak",
            "targetSeconds": "auto"
        })
    
    return {
        "title": f"{show_name} Marathon",
        "slotSeconds": slot_seconds,
        "events": events,
        "blockType": "marathon"
    }

def create_paid_programming_block(slot_seconds=10800):
    """Create a paid programming block"""
    events = [
        {
            "type": "segment",
            "title": "Paid Programming",
            "url": "https://files.catbox.moe/placeholder_paid_programming.mp4",
            "durationSeconds": slot_seconds
        }
    ]
    
    return {
        "title": "Paid Programming",
        "slotSeconds": slot_seconds,
        "events": events,
        "blockType": "paid"
    }

def main():
    with open('schedule.json', 'r', encoding='utf-8') as f:
        schedule = json.load(f)
    
    new_blocks = []
    
    # Add movie blocks for Nostalgia Night (2 movies per night)
    movies = [
        ("The Last Action Hero", 130),
        ("Space Jam", 87),
        ("Men in Black", 97),
        ("The Mask", 101),
        ("Back to the Future", 116)
    ]
    
    for movie_title, duration in movies:
        block = create_movie_block(movie_title, duration)
        new_blocks.append(block)
    
    # Add Boondocks Marathon block
    marathon_block = create_marathon_block("Boondocks", 55)  # Boondocks has 55 episodes
    new_blocks.append(marathon_block)
    
    # Add Paid Programming block
    paid_block = create_paid_programming_block()
    new_blocks.append(paid_block)
    
    # Add new blocks to existing schedule
    schedule['blocks'].extend(new_blocks)
    
    # Write updated schedule
    with open('schedule.json', 'w', encoding='utf-8') as f:
        json.dump(schedule, f, indent=2, ensure_ascii=False)
    
    print(f"Added {len(new_blocks)} special blocks to schedule.json:")
    print(f"- {len(movies)} movie blocks")
    print(f"- 1 marathon block") 
    print(f"- 1 paid programming block")
    print("Note: Using placeholder URLs - replace with actual video URLs")

if __name__ == '__main__':
    main()

#!/usr/bin/env python3
"""
Fix 15-minute shows to have 15-minute slots instead of 30-minute slots
Space Ghost & Aqua Teen need 15-minute slots, not 30-minute slots
"""

import json

def fix_15min_slots():
    # Read the current lineup
    with open('weekly-lineup.json', 'r') as f:
        lineup = json.load(f)
    
    # 15-minute shows that need 15-minute slots
    fifteen_min_shows = [
        "Space Ghost Coast to Coast",
        "Aqua Teen Hunger Force"
    ]
    
    # 30-minute shows that keep 30-minute slots
    thirty_min_shows = [
        "Dexter's Laboratory",
        "The Powerpuff Girls", 
        "Ed, Edd n Eddy"
    ]
    
    new_lineup = []
    
    for entry in lineup:
        show = entry['program']
        day = entry['day']
        time = entry['time']
        
        if show in fifteen_min_shows:
            # Split 30-minute slot into two 15-minute slots
            hour, minute = time.split(':')
            minute = int(minute.replace(' AM', '').replace(' PM', ''))
            period = ' AM' if ' AM' in time else ' PM'
            
            # First 15-minute slot (original time)
            new_lineup.append({
                "time": time,
                "day": day,
                "program": show
            })
            
            # Second 15-minute slot (15 minutes later)
            new_minute = minute + 15
            new_hour = int(hour)
            if new_minute >= 60:
                new_minute -= 60
                new_hour += 1
                if new_hour == 12:
                    period = ' PM' if period == ' AM' else ' AM'
                elif new_hour > 12:
                    new_hour -= 12
            
            new_time = f"{new_hour}:{new_minute:02d}{period}"
            new_lineup.append({
                "time": new_time,
                "day": day,
                "program": show
            })
            
            print(f"Split {show} {day} {time} -> {time} + {new_time}")
            
        else:
            # Keep 30-minute shows as-is
            new_lineup.append(entry)
    
    # Sort by day and time
    days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    def time_key(entry):
        time_str = entry['time'].replace(' AM', '').replace(' PM', '')
        hour, minute = map(int, time_str.split(':'))
        if ' PM' in entry['time'] and hour != 12:
            hour += 12
        return (days.index(entry['day']), hour, minute)
    
    new_lineup.sort(key=time_key)
    
    # Write back the updated lineup
    with open('weekly-lineup.json', 'w') as f:
        json.dump(new_lineup, f, indent=2)
    
    print(f"\nUpdated lineup: {len(new_lineup)} slots (was {len(lineup)})")
    
    # Count slots per show
    show_counts = {}
    for entry in new_lineup:
        show = entry['program']
        show_counts[show] = show_counts.get(show, 0) + 1
    
    print("\nNew slot counts:")
    for show in fifteen_min_shows + thirty_min_shows:
        count = show_counts.get(show, 0)
        slot_type = "15-min" if show in fifteen_min_shows else "30-min"
        print(f"  - {show}: {count} {slot_type} slots")

if __name__ == "__main__":
    fix_15min_slots()

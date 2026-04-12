#!/usr/bin/env python3
import json
import re

def time_to_minutes(t):
    m = re.match(r'^(\d{1,2}):(\d{2})\s*(AM|PM)$', t.strip())
    if not m:
        raise ValueError(f"Invalid time format: {t}")
    h = int(m.group(1))
    mi = int(m.group(2))
    ampm = m.group(3).upper()
    h = 0 if h == 12 else h
    if ampm == 'PM':
        h += 12
    return h * 60 + mi

def minutes_to_time(m):
    h = m // 60
    mi = m % 60
    ampm = 'AM' if h < 12 else 'PM'
    h = h if h <= 12 else h - 12
    h = 12 if h == 0 else h
    return f"{h}:{mi:02d} {ampm}"

def main():
    with open('weekly-lineup.json', 'r', encoding='utf-8') as f:
        lineup = json.load(f)

    # Add marathon entries at 6:00 AM and 10:00 PM Saturday
    marathon_start = {
        "time": "6:00 AM",
        "day": "Saturday",
        "program": "Boondocks Marathon"
    }
    
    marathon_end = {
        "time": "10:00 PM",
        "day": "Saturday",
        "program": "Home Movies"  # Keep existing program at 10 PM
    }

    # Check if these already exist
    existing_times = {(e['day'], e['time']) for e in lineup}
    
    if ('Saturday', '6:00 AM') not in existing_times:
        lineup.append(marathon_start)
        print("Added 6:00 AM Saturday Boondocks Marathon")
    else:
        print("6:00 AM Saturday already exists")

    if ('Saturday', '10:00 PM') not in existing_times:
        lineup.append(marathon_end)
        print("Added 10:00 PM Saturday entry")
    else:
        print("10:00 PM Saturday already exists")

    # Sort and write
    # Define day order and time order for sorting
    day_order = {'Monday': 0, 'Tuesday': 1, 'Wednesday': 2, 'Thursday': 3, 'Friday': 4, 'Saturday': 5, 'Sunday': 6}
    
    def sort_key(entry):
        return (day_order.get(entry['day'], 99), time_to_minutes(entry['time']))
    
    lineup.sort(key=sort_key)

    with open('weekly-lineup.json', 'w', encoding='utf-8') as f:
        json.dump(lineup, f, indent=2, ensure_ascii=False)

    print("Updated lineup with marathon boundary slots")

if __name__ == '__main__':
    main()

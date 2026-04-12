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

    # Group by day
    by_day = {}
    for entry in lineup:
        day = entry['day']
        if day not in by_day:
            by_day[day] = []
        minutes = time_to_minutes(entry['time'])
        by_day[day].append((minutes, entry))

    # Fix Saturday: ensure Boondocks Marathon runs 6:00 AM to 10:00 PM continuously
    if 'Saturday' in by_day:
        saturday = by_day['Saturday']
        # Remove anything between 6:00 AM and 10:00 PM except keep 6:00 AM and 10:00 PM entries
        new_saturday = []
        for minutes, entry in saturday:
            time_str = entry['time']
            if minutes == time_to_minutes('6:00 AM'):
                # Ensure this is Boondocks Marathon
                entry['program'] = 'Boondocks Marathon'
                new_saturday.append((minutes, entry))
            elif minutes == time_to_minutes('10:00 PM'):
                # Keep whatever is at 10:00 PM (should be Home Movies)
                new_saturday.append((minutes, entry))
            elif minutes < time_to_minutes('6:00 AM') or minutes > time_to_minutes('10:00 PM'):
                # Keep early morning and late night slots
                new_saturday.append((minutes, entry))
            # Else: skip entries that fall within the marathon window
        by_day['Saturday'] = new_saturday

    # Fix Sunday: ensure Nostalgia Night Preshow 1:00 PM-3:00 PM and Nostalgia Night 3:00 PM-11:00 PM
    if 'Sunday' in by_day:
        sunday = by_day['Sunday']
        new_sunday = []
        for minutes, entry in sunday:
            time_str = entry['time']
            if time_to_minutes('1:00 PM') <= minutes < time_to_minutes('3:00 PM'):
                entry['program'] = 'Nostalgia Night Preshow'
                new_sunday.append((minutes, entry))
            elif time_to_minutes('3:00 PM') <= minutes < time_to_minutes('11:00 PM'):
                entry['program'] = 'Nostalgia Night'
                new_sunday.append((minutes, entry))
            else:
                # Keep other slots unchanged
                new_sunday.append((minutes, entry))
        by_day['Sunday'] = new_sunday

    # Flatten back to list
    new_lineup = []
    for day in ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']:
        if day in by_day:
            for minutes, entry in sorted(by_day[day]):
                new_lineup.append(entry)

    # Write out
    with open('weekly-lineup.json', 'w', encoding='utf-8') as f:
        json.dump(new_lineup, f, indent=2, ensure_ascii=False)

    print("Updated weekly-lineup.json with corrected weekend boundaries")

if __name__ == '__main__':
    main()

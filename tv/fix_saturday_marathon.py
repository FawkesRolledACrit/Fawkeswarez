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

    # Filter to keep only entries we want
    new_lineup = []
    marathon_start_min = time_to_minutes('6:00 AM')
    marathon_end_min = time_to_minutes('10:00 PM')

    for entry in lineup:
        day = entry['day']
        entry_min = time_to_minutes(entry['time'])

        if day == 'Saturday':
            # Keep early morning slots before marathon
            if entry_min < marathon_start_min:
                new_lineup.append(entry)
            # Keep the marathon start slot
            elif entry_min == marathon_start_min:
                entry['program'] = 'Boondocks Marathon'
                new_lineup.append(entry)
            # Keep the slot right after marathon ends (10:00 PM)
            elif entry_min == marathon_end_min:
                new_lineup.append(entry)
            # Keep late night slots after 10:00 PM
            elif entry_min > marathon_end_min:
                new_lineup.append(entry)
            # Skip anything that falls within 6:00 AM - 10:00 PM (except 6:00 AM itself)
        else:
            # Keep all non-Saturday entries as-is
            new_lineup.append(entry)

    # Write out
    with open('weekly-lineup.json', 'w', encoding='utf-8') as f:
        json.dump(new_lineup, f, indent=2, ensure_ascii=False)

    print("Fixed Saturday marathon to only show at 6:00 AM start with gap until 10:00 PM")

if __name__ == '__main__':
    main()

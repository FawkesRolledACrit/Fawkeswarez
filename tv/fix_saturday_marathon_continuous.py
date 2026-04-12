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

    # Build new lineup
    new_lineup = []
    marathon_start_min = time_to_minutes('6:00 AM')
    marathon_end_min = time_to_minutes('10:00 PM')  # 22:00

    for entry in lineup:
        day = entry['day']
        entry_min = time_to_minutes(entry['time'])

        if day == 'Saturday':
            # Keep early morning slots before marathon
            if entry_min < marathon_start_min:
                new_lineup.append(entry)
            # Skip anything within marathon window (6:00 AM up to but not including 10:00 PM)
            elif marathon_start_min <= entry_min < marathon_end_min:
                continue
            # Keep 10:00 PM and after
            else:
                new_lineup.append(entry)
        else:
            # Keep all non-Saturday entries
            new_lineup.append(entry)

    # Verify by printing Saturday slots
    saturday_slots = [e for e in new_lineup if e['day'] == 'Saturday']
    saturday_slots.sort(key=lambda e: time_to_minutes(e['time']))
    print("Saturday slots after fix:")
    for slot in saturday_slots:
        print(f"  {slot['time']} {slot['program']}")

    # Write out
    with open('weekly-lineup.json', 'w', encoding='utf-8') as f:
        json.dump(new_lineup, f, indent=2, ensure_ascii=False)

    print("Removed all Saturday slots between 6:00 AM and 10:00 PM to create continuous marathon block")

if __name__ == '__main__':
    main()

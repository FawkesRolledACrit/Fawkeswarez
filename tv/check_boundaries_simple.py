#!/usr/bin/env python3
import json
from collections import defaultdict
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

def main():
    with open('weekly-lineup.json', 'r', encoding='utf-8') as f:
        lineup = json.load(f)

    by_day = defaultdict(list)
    for entry in lineup:
        by_day[entry['day']].append((time_to_minutes(entry['time']), entry['time'], entry['program']))

    for day in ['Saturday', 'Sunday', 'Monday']:
        arr = sorted(by_day[day])
        print(f"{day}: {len(arr)} slots")
        
        if day == 'Saturday':
            marathon = [s for s in arr if 'Boondocks' in s[2]]
            print(f"  Boondocks Marathon: {marathon[0][1]} - {marathon[-1][1]}" if marathon else "  NOT FOUND")
        
        if day == 'Sunday':
            pre = [s for s in arr if 'Preshow' in s[2]]
            night = [s for s in arr if 'Nostalgia Night' in s[2] and 'Preshow' not in s[2]]
            print(f"  Preshow: {pre[0][1]} - {pre[-1][1]}" if pre else "  NOT FOUND")
            print(f"  Nostalgia Night: {night[0][1]} - {night[-1][1]}" if night else "  NOT FOUND")
        
        if day == 'Monday':
            paid = [s for s in arr if 'Paid Programming' in s[2]]
            print(f"  Paid Programming: {paid[0][1]} - {paid[-1][1]}" if paid else "  NOT FOUND")

if __name__ == '__main__':
    main()

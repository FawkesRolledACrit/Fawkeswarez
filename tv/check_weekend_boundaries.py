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

    by_day = defaultdict(list)
    for entry in lineup:
        day = entry['day']
        minutes = time_to_minutes(entry['time'])
        by_day[day].append((minutes, entry['time'], entry['program']))

    for day in ['Monday', 'Saturday', 'Sunday']:
        slots = sorted(by_day[day])
        print(f"\n{day} ({len(slots)} slots):")
        
        # Find Paid Programming on Monday
        if day == 'Monday':
            paid = [s for s in slots if 'Paid Programming' in s[2]]
            if paid:
                start = paid[0][0]
                end = paid[-1][0] + 15  # assume 15-min slots for now
                print(f"  Paid Programming: {paid[0][1]} - {minutes_to_time(end)}")
        
        # Find Boondocks Marathon on Saturday
        if day == 'Saturday':
            marathon = [s for s in slots if 'Boondocks Marathon' in s[2]]
            if marathon:
                print(f"  Boondocks Marathon: {marathon[0][1]} - {marathon[-1][1]} (last slot)")
            else:
                print("  No Boondocks Marathon found")
        
        # Find Nostalgia Night blocks on Sunday
        if day == 'Sunday':
            pre = [s for s in slots if 'Nostalgia Night Preshow' in s[2]]
            night = [s for s in slots if 'Nostalgia Night' in s[2] and 'Preshow' not in s[2]]
            if pre:
                print(f"  Nostalgia Night Preshow: {pre[0][1]} - {pre[-1][1]}")
            if night:
                print(f"  Nostalgia Night: {night[0][1]} - {night[-1][1]}")
        
        # Show first/last few slots for context
        print("  First 5 slots:")
        for i, (minutes, time_str, program) in enumerate(slots[:5]):
            print(f"    {time_str} {program}")
        if len(slots) > 5:
            print("  Last 5 slots:")
            for minutes, time_str, program in slots[-5:]:
                print(f"    {time_str} {program}")

        # Check for gaps
        gaps = []
        for i in range(len(slots) - 1):
            current_end = slots[i][0] + 15  # assume 15 min
            next_start = slots[i + 1][0]
            if next_start > current_end:
                gaps.append((current_end, next_start))
        if gaps:
            print(f"  Gaps found: {len(gaps)}")
            for gap_start, gap_end in gaps[:3]:
                print(f"    {minutes_to_time(gap_start)} - {minutes_to_time(gap_end)}")

if __name__ == '__main__':
    main()

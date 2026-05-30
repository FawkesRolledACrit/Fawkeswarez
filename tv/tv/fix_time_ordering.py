#!/usr/bin/env python3
import json

def fix_time_ordering():
    """Fix the time ordering so AM/PM don't mix"""
    
    with open('weekly-lineup.json', 'r', encoding='utf-8') as f:
        lineup = json.load(f)
    
    print("=== FIXING TIME ORDERING ===")
    
    # Function to convert time to minutes for proper sorting
    def time_to_minutes(time_str):
        parts = time_str.split()
        if len(parts) < 2:
            return 0
        
        time_part = parts[0]
        ampm = parts[1].upper()
        
        if ':' in time_part:
            hour, minute = map(int, time_part.split(':'))
        else:
            hour = int(time_part)
            minute = 0
        
        # Convert to 24-hour
        if ampm == 'PM' and hour != 12:
            hour += 12
        elif ampm == 'AM' and hour == 12:
            hour = 0
        
        return hour * 60 + minute
    
    # Sort lineup properly by day and time
    days_order = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    
    # Group by day first
    by_day = {}
    for slot in lineup:
        day = slot['day']
        if day not in by_day:
            by_day[day] = []
        by_day[day].append(slot)
    
    # Sort each day's slots by time
    sorted_lineup = []
    for day in days_order:
        if day in by_day:
            day_slots = sorted(by_day[day], key=lambda x: time_to_minutes(x['time']))
            sorted_lineup.extend(day_slots)
    
    # Save fixed lineup
    with open('weekly-lineup.json', 'w', encoding='utf-8') as f:
        json.dump(sorted_lineup, f, indent=2)
    
    print(f"Fixed time ordering for {len(sorted_lineup)} slots")
    
    # Show Monday as example
    monday_slots = [slot for slot in sorted_lineup if slot['day'] == 'Monday']
    print("\n=== MONDAY SCHEDULE (Fixed) ===")
    for slot in monday_slots[:20]:  # First 20 slots
        print(f"  {slot['time']} - {slot['program']}")

if __name__ == '__main__':
    fix_time_ordering()

#!/usr/bin/env python3
import json

def verify_all_days():
    """Verify all days have correct time ordering"""
    
    with open('weekly-lineup.json', 'r', encoding='utf-8') as f:
        lineup = json.load(f)
    
    print("=== VERIFYING ALL DAYS ===")
    
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
    
    days_order = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    
    all_good = True
    
    for day in days_order:
        day_slots = [slot for slot in lineup if slot['day'] == day]
        
        print(f"\n=== {day.upper()} ({len(day_slots)} slots) ===")
        
        # Check time ordering
        previous_time = -1
        issues = []
        
        for i, slot in enumerate(day_slots):
            current_time = time_to_minutes(slot['time'])
            
            if current_time < previous_time:
                issues.append(f"Time goes backward: {slot['time']} after previous slot")
            
            previous_time = current_time
            
            # Show first few and last few slots
            if i < 5 or i >= len(day_slots) - 5:
                print(f"  {slot['time']} - {slot['program']}")
            elif i == 5:
                print(f"  ... ({len(day_slots) - 10} more slots) ...")
        
        if issues:
            print(f"  X ISSUES FOUND: {len(issues)}")
            for issue in issues:
                print(f"    {issue}")
            all_good = False
        else:
            print(f"  OK Time ordering correct")
    
    # Check for duplicates
    print(f"\n=== DUPLICATE CHECK ===")
    seen_slots = set()
    duplicates = []
    
    for slot in lineup:
        slot_key = f"{slot['day']}_{slot['time']}_{slot['program']}"
        if slot_key in seen_slots:
            duplicates.append(slot)
        seen_slots.add(slot_key)
    
    if duplicates:
        print(f"X Found {len(duplicates)} duplicates:")
        for dup in duplicates:
            print(f"  {dup['day']} {dup['time']} {dup['program']}")
        all_good = False
    else:
        print("OK No duplicates found")
    
    # Summary
    print(f"\n=== SUMMARY ===")
    print(f"Total slots: {len(lineup)}")
    
    from collections import Counter
    program_counts = Counter(slot['program'] for slot in lineup)
    print(f"Programs: {len(program_counts)}")
    
    if all_good:
        print("OK All days verified successfully!")
    else:
        print("X Issues found - needs fixing")
    
    return all_good

if __name__ == '__main__':
    verify_all_days()

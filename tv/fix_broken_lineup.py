#!/usr/bin/env python3
import json

def fix_broken_lineup():
    """Fix the broken lineup with duplicates and wrong times"""
    
    # Load current lineup
    with open('weekly-lineup.json', 'r', encoding='utf-8') as f:
        lineup = json.load(f)
    
    print("=== FIXING BROKEN LINEUP ===")
    
    # Remove duplicates and fix issues
    seen_slots = set()
    fixed_lineup = []
    
    for slot in lineup:
        # Create unique key
        slot_key = f"{slot['day']}_{slot['time']}_{slot['program']}"
        
        # Skip duplicates
        if slot_key in seen_slots:
            print(f"Removing duplicate: {slot['day']} {slot['time']} {slot['program']}")
            continue
        
        # Fix time format (13:00 PM -> 1:00 PM)
        time_parts = slot['time'].split()
        if len(time_parts) >= 2:
            time_str = time_parts[0]
            ampm = time_parts[1]
            
            if ':' in time_str:
                hour_min = time_str.split(':')
                hour = int(hour_min[0])
                minute = int(hour_min[1])
                
                # Fix 13:00 PM format
                if hour >= 13:
                    hour -= 12
                    if ampm == 'PM':
                        ampm = 'PM'
                    else:
                        ampm = 'AM'
                
                slot['time'] = f"{hour}:{minute:02d} {ampm}"
        
        seen_slots.add(slot_key)
        fixed_lineup.append(slot)
    
    # Sort lineup properly
    days_order = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    fixed_lineup.sort(key=lambda x: (days_order.index(x['day']), 
                                  int(x['time'].split(':')[0]) * 60 + int(x['time'].split(':')[1].split()[0])))
    
    # Save fixed lineup
    with open('weekly-lineup.json', 'w', encoding='utf-8') as f:
        json.dump(fixed_lineup, f, indent=2)
    
    print(f"Fixed lineup: {len(lineup)} -> {len(fixed_lineup)} slots")
    
    # Show summary
    from collections import Counter
    program_counts = Counter(slot['program'] for slot in fixed_lineup)
    
    print("\n=== PROGRAM COUNTS ===")
    for program, count in sorted(program_counts.items()):
        print(f"{program}: {count}")

if __name__ == '__main__':
    fix_broken_lineup()

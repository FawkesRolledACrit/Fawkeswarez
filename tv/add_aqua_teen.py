#!/usr/bin/env python3
"""
Add Aqua Teen Hunger Force episodes to schedule.json
"""

import json

# Aqua Teen Hunger Force episodes data
aqua_teen_episodes = [
    # Season 1
    ("S1E1", "https://files.catbox.moe/zbxld3.mp4"),
    ("S1E2", "https://files.catbox.moe/ixmr3x.mp4"),
    ("S1E3", "https://files.catbox.moe/tf7b1p.mp4"),
    ("S1E4", "https://files.catbox.moe/mb3anp.mp4"),
    ("S1E5", "https://files.catbox.moe/8g0bx8.mp4"),
    ("S1E6", "https://files.catbox.moe/rfg60l.mp4"),
    ("S1E7", "https://files.catbox.moe/djt5so.mp4"),
    ("S1E8", "https://files.catbox.moe/yaixfx.mp4"),
    ("S1E9", "https://files.catbox.moe/2ixyu5.mp4"),
    ("S1E10", "https://files.catbox.moe/ffqrq2.mp4"),
    ("S1E11", "https://files.catbox.moe/wbkun7.mp4"),
    ("S1E12", "https://files.catbox.moe/79sjv2.mp4"),
    ("S1E13", "https://files.catbox.moe/4una8c.mp4"),
    ("S1E14", "https://files.catbox.moe/1n6rle.mp4"),
    ("S1E15", "https://files.catbox.moe/6b5935.mp4"),
    ("S1E16", "https://files.catbox.moe/djjmpu.mp4"),
    ("S1E17", "https://files.catbox.moe/wc28rj.mp4"),
    ("S1E18", "https://files.catbox.moe/0xdkik.mp4"),
    # Season 2
    ("S2E1", "https://files.catbox.moe/mval14.mp4"),
    ("S2E2", "https://files.catbox.moe/i0h5jf.mp4"),
    ("S2E3", "https://files.catbox.moe/591159.mp4"),
    ("S2E4", "https://files.catbox.moe/6pcysi.mp4"),
    ("S2E5", "https://files.catbox.moe/wn3ksa.mp4"),
    ("S2E6", "https://files.catbox.moe/16yygg.mp4"),
    ("S2E7", "https://files.catbox.moe/yw1av6.mp4"),
    ("S2E8", "https://files.catbox.moe/w4pi1z.mp4"),
    ("S2E9", "https://files.catbox.moe/m2x9ov.mp4"),
    ("S2E10", "https://files.catbox.moe/w2c885.mp4"),
    ("S2E11", "https://files.catbox.moe/ryr35g.mp4"),
    ("S2E12", "https://files.catbox.moe/muzy83.mp4"),
    ("S2E13", "https://files.catbox.moe/vmhv3z.mp4"),
    ("S2E14", "https://files.catbox.moe/c4o4ne.mp4"),
    ("S2E15", "https://files.catbox.moe/to9vuy.mp4"),
    ("S2E16", "https://files.catbox.moe/n2bvt1.mp4"),
    ("S2E17", "https://files.catbox.moe/4l913q.mp4"),
    ("S2E18", "https://files.catbox.moe/8gyq1b.mp4"),
    ("S2E19", "https://files.catbox.moe/n16w3c.mp4"),
    ("S2E20", "https://files.catbox.moe/qv57op.mp4"),
    ("S2E21", "https://files.catbox.moe/4znw06.mp4"),
    ("S2E22", "https://files.catbox.moe/3ivftm.mp4"),
    ("S2E23", "https://files.catbox.moe/n1i987.mp4"),
    ("S2E24", "https://files.catbox.moe/rhopp0.mp4"),
    # Season 3
    ("S3E1", "https://files.catbox.moe/zzvslz.mp4"),
    ("S3E2", "https://files.catbox.moe/4v09o2.mp4"),
    ("S3E3", "https://files.catbox.moe/dwwncr.mp4"),
    ("S3E4", "https://files.catbox.moe/zev3x8.mp4"),
    ("S3E5", "https://files.catbox.moe/0qzpfc.mp4"),
    ("S3E6", "https://files.catbox.moe/4nayp4.mp4"),
    ("S3E7", "https://files.catbox.moe/116fpv.mp4"),
    ("S3E8", "https://files.catbox.moe/d2436a.mp4"),
    ("S3E9", "https://files.catbox.moe/qzjmba.mp4"),
    ("S3E10", "https://files.catbox.moe/v2cvi3.mp4"),
    ("S3E11", "https://files.catbox.moe/dnjuek.mp4"),
    ("S3E12", "https://files.catbox.moe/goxn36.mp4"),
    ("S3E13", "https://files.catbox.moe/xrklsj.mp4")
]

def add_aqua_teen():
    # Read the schedule file
    with open('schedule.json', 'r') as f:
        schedule = json.load(f)
    
    # Create Aqua Teen blocks (2 episodes per slot)
    block_counter = 1
    for i in range(0, len(aqua_teen_episodes), 2):
        ep1_code, ep1_url = aqua_teen_episodes[i]
        
        # Check if we have a second episode
        if i + 1 < len(aqua_teen_episodes):
            ep2_code, ep2_url = aqua_teen_episodes[i + 1]
            block_title = f"Aqua Teen Hunger Force - {ep1_code} & {ep2_code}"
            
            # Create block with 2 episodes
            block = {
                "title": block_title,
                "slotSeconds": 1800,
                "events": [
                    {
                        "type": "segment",
                        "title": f"Aqua Teen Hunger Force {ep1_code}",
                        "url": ep1_url,
                        "durationSeconds": 660  # 11 minutes
                    },
                    {
                        "type": "adbreak",
                        "targetSeconds": 180,
                        "toleranceSeconds": 3
                    },
                    {
                        "type": "segment",
                        "title": f"Aqua Teen Hunger Force {ep2_code}",
                        "url": ep2_url,
                        "durationSeconds": 660  # 11 minutes
                    },
                    {
                        "type": "adbreak",
                        "targetSeconds": "auto"
                    }
                ]
            }
        else:
            # Single episode (odd number)
            block_title = f"Aqua Teen Hunger Force - {ep1_code}"
            block = {
                "title": block_title,
                "slotSeconds": 1800,
                "events": [
                    {
                        "type": "segment",
                        "title": f"Aqua Teen Hunger Force {ep1_code}",
                        "url": ep1_url,
                        "durationSeconds": 660  # 11 minutes
                    },
                    {
                        "type": "adbreak",
                        "targetSeconds": "auto"
                    }
                ]
            }
        
        schedule['blocks'].append(block)
        print(f"Added block {block_counter}: {block_title}")
        block_counter += 1
    
    # Write back the file
    with open('schedule.json', 'w') as f:
        json.dump(schedule, f, indent=2)
    
    print(f"\nAdded {block_counter-1} Aqua Teen blocks to schedule!")
    print(f"Total episodes: {len(aqua_teen_episodes)}")

if __name__ == "__main__":
    add_aqua_teen()

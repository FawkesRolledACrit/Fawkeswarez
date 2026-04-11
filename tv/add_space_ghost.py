#!/usr/bin/env python3
"""
Add Space Ghost Coast to Coast episodes to schedule.json
"""

import json

# Space Ghost episodes data
space_ghost_episodes = [
    # Season 1
    ("S1E1", "https://files.catbox.moe/rvxs7m.mkv"),
    ("S1E2", "https://files.catbox.moe/goqyml.mkv"),
    ("S1E3", "https://files.catbox.moe/tyv931.mkv"),
    ("S1E4", "https://files.catbox.moe/98ej9f.mkv"),
    ("S1E5", "https://files.catbox.moe/rps76n.mkv"),
    ("S1E6", "https://files.catbox.moe/lgc7t2.mkv"),
    ("S1E7", "https://files.catbox.moe/puys1b.mkv"),
    ("S1E8", "https://files.catbox.moe/huk3bg.mkv"),
    ("S1E9", "https://files.catbox.moe/22y22u.mkv"),
    ("S1E10", "https://files.catbox.moe/t1v29p.mkv"),
    # Season 2
    ("S2E1", "https://files.catbox.moe/unmawu.mkv"),
    ("S2E2", "https://files.catbox.moe/yuoi05.mkv"),
    ("S2E3", "https://files.catbox.moe/f7zu85.mkv"),
    ("S2E4", "https://files.catbox.moe/9w2j38.mkv"),
    ("S2E5", "https://files.catbox.moe/nkxxqn.mkv"),
    ("S2E6", "https://files.catbox.moe/0b98q1.mkv"),
    ("S2E7", "https://files.catbox.moe/7dz77e.mkv"),
    ("S2E8", "https://files.catbox.moe/4ajlyy.mkv"),
    ("S2E9", "https://files.catbox.moe/g78yqx.mkv"),
    # Season 3
    ("S3E1", "https://files.catbox.moe/7sivtc.mkv"),
    ("S3E2", "https://files.catbox.moe/zlxp1m.mkv"),
    ("S3E3", "https://files.catbox.moe/rzeipt.mkv"),
    ("S3E4", "https://files.catbox.moe/gs2vg5.mkv"),
    ("S3E5", "https://files.catbox.moe/4lgmfa.mkv"),
    ("S3E6", "https://files.catbox.moe/tg1n4q.mkv"),
    ("S3E7", "https://files.catbox.moe/q4oggo.mkv"),
    ("S3E8", "https://files.catbox.moe/bpzyxk.mkv"),
    ("S3E9", "https://files.catbox.moe/rmhm3o.mkv"),
    ("S3E10", "https://files.catbox.moe/6185nc.mkv"),
    ("S3E11", "https://files.catbox.moe/fw1j5s.mkv"),
    ("S3E12", "https://files.catbox.moe/5g84xv.mkv"),
    ("S3E13", "https://files.catbox.moe/l5sd34.mkv"),
    ("S3E14", "https://files.catbox.moe/6d6eky.mkv"),
    ("S3E15", "https://files.catbox.moe/j9wbwd.mkv"),
    # Season 4
    ("S4E1", "https://files.catbox.moe/nuepvy.mkv"),
    ("S4E2", "https://files.catbox.moe/cthdmt.mkv"),
    ("S4E3", "https://files.catbox.moe/0j3a4l.mkv"),
    ("S4E4", "https://files.catbox.moe/vz27ej.mkv"),
    ("S4E5", "https://files.catbox.moe/770xwh.mkv"),
    ("S4E6", "https://files.catbox.moe/m3a6da.mkv"),
    ("S4E7", "https://files.catbox.moe/sic5jh.mkv"),
    ("S4E8", "https://files.catbox.moe/xd2c11.mkv"),
    ("S4E9", "https://files.catbox.moe/btdwh0.mkv"),
    ("S4E10", "https://files.catbox.moe/a8nudt.mkv"),
    ("S4E11", "https://files.catbox.moe/l0nj6o.mkv"),
    ("S4E12", "https://files.catbox.moe/r3i658.mkv"),
    ("S4E13", "https://files.catbox.moe/5x00ue.mkv"),
    ("S4E14", "https://files.catbox.moe/7mg4op.mkv"),
    ("S4E15", "https://files.catbox.moe/sxv4kb.mkv"),
    ("S4E16", "https://files.catbox.moe/wsjy8f.mkv"),
    ("S4E17", "https://files.catbox.moe/cl3wul.mkv"),
    ("S4E18", "https://files.catbox.moe/it41lk.mkv"),
    ("S4E19", "https://files.catbox.moe/b2h99p.mkv"),
    ("S4E20", "https://files.catbox.moe/q2mbh2.mkv"),
    ("S4E21", "https://files.catbox.moe/wnx2d8.mkv"),
    ("S4E22", "https://files.catbox.moe/0wetss.mkv"),
    ("S4E23", "https://files.catbox.moe/gl7yqi.mkv"),
    ("S4E24", "https://files.catbox.moe/stcltc.mkv"),
    ("S4E25", "https://files.catbox.moe/6o5973.mkv")
]

def add_space_ghost():
    # Read the schedule file
    with open('schedule.json', 'r') as f:
        schedule = json.load(f)
    
    # Create Space Ghost blocks (2 episodes per slot)
    block_counter = 1
    for i in range(0, len(space_ghost_episodes), 2):
        ep1_code, ep1_url = space_ghost_episodes[i]
        
        # Check if we have a second episode
        if i + 1 < len(space_ghost_episodes):
            ep2_code, ep2_url = space_ghost_episodes[i + 1]
            block_title = f"Space Ghost Coast to Coast - {ep1_code} & {ep2_code}"
            
            # Create block with 2 episodes
            block = {
                "title": block_title,
                "slotSeconds": 1800,
                "events": [
                    {
                        "type": "segment",
                        "title": f"Space Ghost Coast to Coast {ep1_code}",
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
                        "title": f"Space Ghost Coast to Coast {ep2_code}",
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
            block_title = f"Space Ghost Coast to Coast - {ep1_code}"
            block = {
                "title": block_title,
                "slotSeconds": 1800,
                "events": [
                    {
                        "type": "segment",
                        "title": f"Space Ghost Coast to Coast {ep1_code}",
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
    
    print(f"\nAdded {block_counter-1} Space Ghost blocks to schedule!")
    print(f"Total episodes: {len(space_ghost_episodes)}")

if __name__ == "__main__":
    add_space_ghost()

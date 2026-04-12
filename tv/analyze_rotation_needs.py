#!/usr/bin/env python3

import json
import re
from collections import defaultdict

SExxExx_RE = re.compile(r"S(\d{1,2})E(\d{1,3})", re.IGNORECASE)


def normalize_season_episode(code: str) -> str:
    m = SExxExx_RE.search(code or "")
    if not m:
        return ""
    s = int(m.group(1))
    e = int(m.group(2))
    return f"S{s:02d}E{e:02d}"


def parse_block_episode_id(block_title: str) -> str:
    return normalize_season_episode(block_title)


def schedule_episode_counts(schedule_path: str):
    with open(schedule_path, "r", encoding="utf-8") as f:
        schedule = json.load(f)

    # Count episodes by show, combining parts inside the block into one episode.
    # Assumption: each schedule block represents one logical airing slot for a show.
    # For segmented shows (Dexter/PPG/Ed), the block is already one episode.
    show_to_episode_ids = defaultdict(set)
    show_to_blocks = defaultdict(int)

    for block in schedule.get("blocks", []):
        title = str(block.get("title", ""))
        if " - " in title:
            show = title.split(" - ", 1)[0].strip()
        else:
            # Fallback: try to infer show name from first segment title
            show = ""
            for ev in block.get("events", []):
                if ev.get("type") == "segment" and ev.get("title"):
                    show = str(ev["title"]).split(" S", 1)[0].strip()
                    break
            show = show or title.strip() or "(unknown)"

        show_to_blocks[show] += 1

        ep_id = parse_block_episode_id(title)
        if ep_id:
            show_to_episode_ids[show].add(ep_id)
        else:
            # If no SxxExx in block title, try segment titles
            for ev in block.get("events", []):
                if ev.get("type") == "segment":
                    seg_title = str(ev.get("title", ""))
                    ep_id = normalize_season_episode(seg_title)
                    if ep_id:
                        show_to_episode_ids[show].add(ep_id)
                        break

    show_counts = {show: len(eps) for show, eps in show_to_episode_ids.items()}
    return show_counts, show_to_episode_ids, show_to_blocks


def parse_time_to_minutes(time_str: str) -> int | None:
    s = (time_str or "").strip()
    m = re.match(r"^(\d{1,2}):(\d{2})\s*(AM|PM)$", s, re.IGNORECASE)
    if not m:
        return None
    hh = int(m.group(1))
    mm = int(m.group(2))
    ap = m.group(3).upper()
    if hh == 12:
        hh = 0
    if ap == "PM":
        hh += 12
    return hh * 60 + mm


def weekly_slot_counts(lineup_path: str):
    with open(lineup_path, "r", encoding="utf-8") as f:
        lineup = json.load(f)

    by_day = defaultdict(list)
    for item in lineup:
        day = str(item.get("day", "")).strip()
        time = str(item.get("time", "")).strip()
        program = str(item.get("program", "")).strip()
        if not day or not time or not program:
            continue
        start = parse_time_to_minutes(time)
        if start is None:
            continue
        by_day[day].append((start, program, time))

    program_total_slots = defaultdict(int)
    program_slot_minutes_hist = defaultdict(lambda: defaultdict(int))

    for day, entries in by_day.items():
        entries.sort(key=lambda x: x[0])
        for i, (start, program, time) in enumerate(entries):
            next_start = entries[i + 1][0] if i + 1 < len(entries) else 24 * 60
            dur = max(1, next_start - start)
            program_total_slots[program] += 1
            program_slot_minutes_hist[program][dur] += 1

    return program_total_slots, program_slot_minutes_hist


def main():
    schedule_path = "schedule.json"
    lineup_path = "weekly-lineup.json"

    show_episode_counts, show_episode_ids, show_block_counts = schedule_episode_counts(schedule_path)
    program_total_slots, program_slot_minutes_hist = weekly_slot_counts(lineup_path)

    # Map weekly programs to schedule shows by simple exact match first.
    # schedule show names are from block titles "<show> - ..."
    schedule_shows = set(show_episode_counts.keys())

    print("=== Episodes available in schedule.json (parts combined) ===")
    for show in sorted(schedule_shows):
        print(f"- {show}: {show_episode_counts.get(show, 0)} episodes ({show_block_counts.get(show, 0)} blocks)")

    print("\n=== Weekly lineup slot counts (weekly-lineup.json) ===")
    for program in sorted(program_total_slots.keys()):
        hist = program_slot_minutes_hist[program]
        hist_str = ", ".join([f"{mins}m×{count}" for mins, count in sorted(hist.items())])
        print(f"- {program}: {program_total_slots[program]} slots ({hist_str})")

    # Compute needs
    print("\n=== Missing shows (in lineup but no episodes in schedule.json) ===")
    missing = []
    for program in sorted(program_total_slots.keys()):
        if program not in schedule_shows:
            missing.append(program)
            print(f"- {program}: 0 episodes available, {program_total_slots[program]} weekly slots")
    if not missing:
        print("(none)")

    print("\n=== Episode shortfall for clean weekly rotation (no repeats within the week) ===")
    # Target: at least one unique episode per weekly slot for that show.
    for program in sorted(program_total_slots.keys()):
        if program not in schedule_shows:
            continue
        need = program_total_slots[program] - show_episode_counts.get(program, 0)
        if need > 0:
            print(f"- {program}: have {show_episode_counts.get(program, 0)}, slots {program_total_slots[program]} -> need {need} more episodes")

    print("\n=== Suggested minimum episode targets ===")
    for program in sorted(program_total_slots.keys()):
        slots = program_total_slots[program]
        have = show_episode_counts.get(program, 0)
        if program in schedule_shows:
            print(f"- {program}: target >= {slots} episodes (have {have})")
        else:
            print(f"- {program}: target >= {slots} episodes (have 0)")


if __name__ == "__main__":
    main()

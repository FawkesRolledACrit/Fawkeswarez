(async () => {
    const statusEl = document.getElementById('tv-status');
    const sourceEl = document.getElementById('tv-source');
    const video = document.getElementById('tv-player');

    const muteBtn = document.getElementById('tv-mute');

    let ads = null;
    let schedule = null;
    let currentBlockIndex = -1;
    let currentQueueIndex = -1;
    let currentItemUrl = null;
    let hls = null;
    let syncInterval = null;
    let lastSyncTime = 0;
    let isInternalSync = false;
    let lastExpectedTime = 0;
    let lastExpectedTitle = '';

    function setStatus(text) {
        statusEl.textContent = text;
    }

    function setSource(text) {
        sourceEl.textContent = text;
    }

    function cleanupHls() {
        if (hls) {
            try {
                hls.destroy();
            } catch (_) {
                // ignore
            }
            hls = null;
        }
    }

    function inferTypeFromUrl(url) {
        const lowered = String(url || '').toLowerCase();
        if (lowered.includes('.m3u8')) return 'hls';
        if (lowered.includes('.mp4')) return 'mp4';
        if (lowered.includes('.webm')) return 'webm';
        return 'unknown';
    }

    function once(target, eventName, timeoutMs = 8000) {
        return new Promise((resolve, reject) => {
            let done = false;
            const onEvent = () => {
                if (done) return;
                done = true;
                cleanup();
                resolve();
            };
            const onTimeout = () => {
                if (done) return;
                done = true;
                cleanup();
                reject(new Error(`Timed out waiting for ${eventName}`));
            };
            const cleanup = () => {
                clearTimeout(t);
                target.removeEventListener(eventName, onEvent);
            };
            const t = setTimeout(onTimeout, timeoutMs);
            target.addEventListener(eventName, onEvent, { once: true });
        });
    }

    function clampSeek(seconds) {
        if (!Number.isFinite(seconds)) return 0;
        if (seconds < 0) return 0;
        return seconds;
    }

    function formatTime(seconds) {
        if (!Number.isFinite(seconds)) return '--:--';
        const s = Math.max(0, Math.floor(seconds));
        const m = Math.floor(s / 60);
        const r = s % 60;
        return `${m}:${String(r).padStart(2, '0')}`;
    }

    async function enforceSeek(expectedTimeSeconds) {
        // Some hosts/browsers will ignore the first seek and jump to 0.
        // Retry a few times until we're close enough or we give up.
        const deadline = Date.now() + 6000;
        const tolerance = 1.5;
        const expected = clampSeek(expectedTimeSeconds);

        while (Date.now() < deadline) {
            if (!Number.isFinite(video.currentTime)) {
                await new Promise(r => setTimeout(r, 150));
                continue;
            }

            const diff = Math.abs(video.currentTime - expected);
            if (diff <= tolerance) return true;

            // Only try to seek when the media element reports some data.
            if (video.readyState >= 2) {
                try {
                    isInternalSync = true;
                    video.currentTime = expected;
                } catch (_) {
                    // ignore
                }
            }

            await new Promise(r => setTimeout(r, 200));
        }

        return false;
    }

    const BLOCK_MS = 30 * 60 * 1000;

    async function loadAds() {
        const res = await fetch('./ads.json', { cache: 'no-store' });
        if (!res.ok) {
            throw new Error(`Failed to load ads.json (HTTP ${res.status})`);
        }
        return res.json();
    }

    async function loadSchedule() {
        const res = await fetch('./schedule.json', { cache: 'no-store' });
        if (!res.ok) {
            throw new Error(`Failed to load schedule.json (HTTP ${res.status})`);
        }
        return res.json();
    }

    function fillAdBreak(targetSeconds, toleranceSeconds = 3, seed = null) {
        if (!ads?.items?.length) return [];
        
        const validAds = ads.items.filter(ad => ad.durationSeconds !== null && ad.durationSeconds > 0);
        if (validAds.length === 0) return [];
        
        const selected = [];
        let totalDuration = 0;
        
        // Use seeded random for consistent ad selection across all viewers
        const rng = seed ? new SeededRandom(seed) : Math;
        const shuffled = [...validAds].sort(() => rng.random() - 0.5);
        
        for (const ad of shuffled) {
            if (totalDuration + ad.durationSeconds <= targetSeconds + toleranceSeconds) {
                selected.push({
                    type: 'ad',
                    url: ad.url,
                    title: `Commercial`,
                    durationSeconds: ad.durationSeconds
                });
                totalDuration += ad.durationSeconds;
                
                if (totalDuration >= targetSeconds - toleranceSeconds) {
                    break;
                }
            }
        }
        
        return selected;
    }

    // Simple seeded random number generator for consistent ad selection
    class SeededRandom {
        constructor(seed) {
            this.seed = seed;
        }
        
        random() {
            this.seed = (this.seed * 9301 + 49297) % 233280;
            return this.seed / 233280;
        }
    }

    function buildPlayQueue(blockIndex) {
        if (!schedule?.blocks?.length) return [];
        
        const queue = [];
        const block = schedule.blocks[0]; // Always use first block for now
        let blockUsedTime = 0;
        
        for (let i = 0; i < block.events.length; i++) {
            const event = block.events[i];
            
            if (event.type === 'segment') {
                const segmentDuration = Number.isFinite(event.durationSeconds) ? event.durationSeconds : 600;
                queue.push({
                    type: 'segment',
                    url: event.url,
                    title: event.title,
                    durationSeconds: segmentDuration
                });
                blockUsedTime += segmentDuration;
            } else if (event.type === 'adbreak') {
                let targetDuration;
                
                if (event.targetSeconds === 'auto') {
                    targetDuration = Math.max(60, block.slotSeconds - blockUsedTime);
                } else {
                    targetDuration = event.targetSeconds;
                }
                
                const tolerance = event.toleranceSeconds || 3;
                // Use block index and event index as seed for consistent ad selection
                const seed = blockIndex * 1000 + i;
                const selectedAds = fillAdBreak(targetDuration, tolerance, seed);
                
                queue.push(...selectedAds);
                blockUsedTime += selectedAds.reduce((sum, ad) => sum + ad.durationSeconds, 0);
            }
        }
        
        return queue;
    }

    function getCurrentScheduleTime() {
        // Use epoch-based boundaries so all viewers share the same block boundaries.
        const nowMs = Date.now();
        const currentBlockIndex = Math.floor(nowMs / BLOCK_MS);
        const blockStartMs = currentBlockIndex * BLOCK_MS;
        const blockElapsedMs = nowMs - blockStartMs;
        return {
            nowMs,
            currentBlockIndex,
            blockStartMs,
            blockElapsedMs
        };
    }

    function calculateCurrentQueueIndex(elapsedMs, playQueue) {
        if (!playQueue.length) return 0;
        
        const blockElapsed = elapsedMs % (30 * 60 * 1000);
        let accumulatedTime = 0;
        
        for (let i = 0; i < playQueue.length; i++) {
            const itemDuration = playQueue[i].durationSeconds || 30;
            if (accumulatedTime + (itemDuration * 1000) > blockElapsed) {
                return i;
            }
            accumulatedTime += itemDuration * 1000;
        }
        
        return playQueue.length - 1;
    }

    async function loadAndPlayVideo(url, title, seekToTime = null) {
        cleanupHls();

        if (!url || url.includes('REPLACE_ME')) {
            setStatus(`Schedule loaded, but the URL for "${title}" is not set yet.`);
            setSource('Update tv/schedule.json with real video URLs');
            video.removeAttribute('src');
            video.load();
            return false;
        }

        const desiredSeek = clampSeek(seekToTime ?? 0);
        lastExpectedTime = desiredSeek;
        lastExpectedTitle = title;

        setStatus(`Loading: ${title}`);
        setSource(url);

        isInternalSync = true;
        const type = inferTypeFromUrl(url);

        if (type === 'hls') {
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = url;
            } else if (window.Hls?.isSupported?.()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(url);
                hls.attachMedia(video);
            } else {
                isInternalSync = false;
                setStatus('HLS not supported in this browser. Try Chrome/Edge or use MP4 files for testing.');
                return false;
            }
        } else {
            video.src = url;
        }

        try {
            // Wait until we can seek reliably; otherwise browsers often start at 0.
            await once(video, 'loadedmetadata');

            if (desiredSeek > 0 && Number.isFinite(video.duration) && desiredSeek < video.duration) {
                try {
                    video.currentTime = desiredSeek;
                } catch (_) {
                    // ignore
                }
                // Some browsers require a canplay after setting currentTime.
                try {
                    await once(video, 'seeked', 3000);
                } catch (_) {
                    // ignore
                }
            }

            await video.play();

            // Enforce seek after playback begins too; some hosts ignore initial seek.
            if (desiredSeek > 0) {
                const ok = await enforceSeek(desiredSeek);
                if (!ok) {
                    setStatus(`Now Playing: ${title} (expected ${formatTime(desiredSeek)}; got ${formatTime(video.currentTime)} - source may not support seeking)`);
                } else {
                    setStatus(`Now Playing: ${title} (${formatTime(video.currentTime)})`);
                }
            } else {
                setStatus(`Now Playing: ${title}`);
            }
            return true;
        } catch (err) {
            setStatus(`Loaded: ${title} (autoplay blocked)`);
            return false;
        } finally {
            // Keep this true only during the initial load/seek/play window.
            setTimeout(() => {
                isInternalSync = false;
            }, 250);
        }
    }

    function syncWithSchedule() {
        const now = Date.now();
        
        // Throttle syncs to once per second maximum
        if (now - lastSyncTime < 1000) {
            return;
        }
        lastSyncTime = now;

        const { currentBlockIndex: newBlockIndex, blockElapsedMs } = getCurrentScheduleTime();
        const playQueue = buildPlayQueue(newBlockIndex);
        if (!playQueue.length) return;

        const targetIndex = calculateCurrentQueueIndex(blockElapsedMs, playQueue);
        let accumulatedTimeMs = 0;
        for (let i = 0; i < targetIndex; i++) {
            accumulatedTimeMs += (playQueue[i].durationSeconds || 30) * 1000;
        }
        const expectedTime = clampSeek((blockElapsedMs - accumulatedTimeMs) / 1000);
        const targetItem = playQueue[targetIndex];
        lastExpectedTime = expectedTime;
        lastExpectedTitle = targetItem.title;

        const shouldReload =
            newBlockIndex !== currentBlockIndex ||
            targetIndex !== currentQueueIndex ||
            (currentItemUrl && targetItem.url !== currentItemUrl) ||
            (!currentItemUrl && targetItem.url);

        // Update indices first so the next tick doesn't immediately re-trigger.
        currentBlockIndex = newBlockIndex;
        currentQueueIndex = targetIndex;

        if (shouldReload) {
            currentItemUrl = targetItem.url;
            void loadAndPlayVideo(targetItem.url, targetItem.title, expectedTime);
            return;
        }

        // Same item: only correct drift.
        if (Number.isFinite(video.currentTime)) {
            const drift = Math.abs(video.currentTime - expectedTime);
            if (drift > 2) {
                try {
                    isInternalSync = true;
                    video.currentTime = expectedTime;
                } catch (_) {
                    // ignore
                } finally {
                    setTimeout(() => {
                        isInternalSync = false;
                    }, 250);
                }
            }

            // Update status so you can see whether it's actually syncing.
            if (drift <= 8) {
                setStatus(`Live: ${targetItem.title} (expected ${formatTime(expectedTime)}; actual ${formatTime(video.currentTime)})`);
            }
        }
    }

    // Prevent user interaction with video
    video.addEventListener('play', (e) => {
        if (e.target !== video) return;
        // Allow autoplay but prevent manual play
    });
    
    video.addEventListener('pause', (e) => {
        if (e.target !== video) return;
        // Prevent pausing - resume immediately
        if (isInternalSync) return;
        setTimeout(() => video.play().catch(() => {}), 100);
    });
    
    video.addEventListener('seeking', (e) => {
        if (e.target !== video) return;
        // Prevent manual seeking - sync back to schedule
        if (isInternalSync) return;
        setTimeout(() => syncWithSchedule(), 100);
    });
    
    video.addEventListener('ratechange', (e) => {
        if (e.target !== video) return;
        // Prevent speed changes
        video.playbackRate = 1;
    });
    
    video.addEventListener('volumechange', (e) => {
        if (e.target !== video) return;
        // Allow volume changes but sync with mute button
        if (muteBtn) {
            muteBtn.textContent = video.muted ? '🔊 UNMUTE' : '🔇 MUTE';
        }
    });

    muteBtn?.addEventListener('click', () => {
        video.muted = !video.muted;
        muteBtn.textContent = video.muted ? '🔊 UNMUTE' : '🔇 MUTE';
    });

    try {
        [ads, schedule] = await Promise.all([loadAds(), loadSchedule()]);
        
        // Start schedule sync
        setStatus('Syncing with live broadcast…');
        syncWithSchedule();
        
        // Sync every 2 seconds to maintain tight timing
        syncInterval = setInterval(() => {
            syncWithSchedule();
        }, 2000);
        
    } catch (e) {
        setStatus(`Error: ${e?.message || e}`);
        setSource('—');
    }
})();

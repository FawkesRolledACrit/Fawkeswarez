(async () => {
    const statusEl = document.getElementById('tv-status');
    const sourceEl = document.getElementById('tv-source');
    const video = document.getElementById('tv-player');

    const muteBtn = document.getElementById('tv-mute');

    let ads = null;
    let schedule = null;
    let playQueue = [];
    let scheduleStartTime = null;
    let currentQueueIndex = 0;
    let hls = null;

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

    function buildPlayQueue(blockStartTime) {
        if (!schedule?.blocks?.length) return [];
        
        const queue = [];
        
        for (const block of schedule.blocks) {
            let blockUsedTime = 0;
            
            for (let i = 0; i < block.events.length; i++) {
                const event = block.events[i];
                
                if (event.type === 'segment') {
                    queue.push({
                        type: 'segment',
                        url: event.url,
                        title: event.title,
                        durationSeconds: 0 // We'll estimate this
                    });
                    blockUsedTime += 0; // We don't know segment durations yet
                } else if (event.type === 'adbreak') {
                    let targetDuration;
                    
                    if (event.targetSeconds === 'auto') {
                        targetDuration = Math.max(60, block.slotSeconds - blockUsedTime);
                    } else {
                        targetDuration = event.targetSeconds;
                    }
                    
                    const tolerance = event.toleranceSeconds || 3;
                    // Use block start time as seed for consistent ad selection
                    const seed = Math.floor(blockStartTime / 1000) + i;
                    const selectedAds = fillAdBreak(targetDuration, tolerance, seed);
                    
                    queue.push(...selectedAds);
                    blockUsedTime += selectedAds.reduce((sum, ad) => sum + ad.durationSeconds, 0);
                }
            }
        }
        
        return queue;
    }

    function getCurrentScheduleTime() {
        // Schedule starts at a fixed time (e.g., midnight)
        const scheduleStart = new Date();
        scheduleStart.setHours(0, 0, 0, 0); // Start at midnight today
        
        const now = new Date();
        const elapsedMs = now - scheduleStart;
        
        return {
            scheduleStart,
            elapsedMs,
            currentBlockIndex: Math.floor(elapsedMs / (30 * 60 * 1000)) % schedule.blocks.length // 30-minute blocks
        };
    }

    function calculateCurrentQueueIndex(elapsedMs, playQueue) {
        if (!playQueue.length) return 0;
        
        let accumulatedTime = 0;
        for (let i = 0; i < playQueue.length; i++) {
            const itemDuration = playQueue[i].durationSeconds || 30; // Default 30s for unknown durations
            if (accumulatedTime + (itemDuration * 1000) > elapsedMs % (30 * 60 * 1000)) {
                return i;
            }
            accumulatedTime += itemDuration * 1000;
        }
        
        return playQueue.length - 1;
    }

    async function playQueueItem(index, seekToTime = null) {
        if (!playQueue.length) {
            setStatus('No play queue items found.');
            return;
        }

        currentQueueIndex = ((index % playQueue.length) + playQueue.length) % playQueue.length;
        const item = playQueue[currentQueueIndex];

        const url = item?.url;
        const title = item?.title || `Item ${currentQueueIndex + 1}`;
        const type = inferTypeFromUrl(url);

        cleanupHls();

        if (!url || url.includes('REPLACE_ME')) {
            setStatus(`Schedule loaded, but the URL for "${title}" is not set yet.`);
            setSource('Update tv/schedule.json with real video URLs');
            video.removeAttribute('src');
            video.load();
            return;
        }

        setStatus(`Loading: ${title}`);
        setSource(url);

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
                setStatus('HLS not supported in this browser. Try Chrome/Edge or use MP4 files for testing.');
                return;
            }
        } else {
            video.src = url;
        }

        try {
            await video.play();
            
            // Seek to the correct position if specified
            if (seekToTime !== null && !isNaN(seekToTime)) {
                video.currentTime = seekToTime;
            }
            
            setStatus(`Now Playing: ${title}`);
        } catch (err) {
            setStatus(`Loaded: ${title} (press PLAY if autoplay is blocked)`);
        }
    }

    function playNext() {
        // In scheduled mode, we don't manually advance - we sync with schedule
        syncWithSchedule();
    }

    function syncWithSchedule() {
        const { elapsedMs, currentBlockIndex } = getCurrentScheduleTime();
        const blockStartTime = currentBlockIndex * 30 * 60 * 1000;
        
        // Rebuild queue for current block to get consistent ad selection
        playQueue = buildPlayQueue(blockStartTime);
        
        // Calculate where we should be in the current block
        const blockElapsed = elapsedMs % (30 * 60 * 1000);
        const targetIndex = calculateCurrentQueueIndex(blockElapsed, playQueue);
        
        // Calculate seek time within current item
        let accumulatedTime = 0;
        let seekTime = 0;
        
        for (let i = 0; i < targetIndex; i++) {
            accumulatedTime += (playQueue[i].durationSeconds || 30) * 1000;
        }
        
        seekTime = (blockElapsed - accumulatedTime) / 1000;
        
        if (targetIndex !== currentQueueIndex || Math.abs(seekTime) > 5) {
            void playQueueItem(targetIndex, Math.max(0, seekTime));
        }
    }

    video.addEventListener('ended', () => {
        // In scheduled mode, sync with schedule instead of just advancing
        setTimeout(() => syncWithSchedule(), 100);
    });

    
    muteBtn?.addEventListener('click', () => {
        video.muted = !video.muted;
        muteBtn.textContent = video.muted ? '🔊 UNMUTE' : '🔇 MUTE';
    });

    try {
        [ads, schedule] = await Promise.all([loadAds(), loadSchedule()]);
        
        // Start schedule sync
        setStatus('Syncing with broadcast schedule…');
        syncWithSchedule();
        
        // Sync every 5 seconds to maintain timing
        setInterval(() => {
            syncWithSchedule();
        }, 5000);
        
    } catch (e) {
        setStatus(`Error: ${e?.message || e}`);
        setSource('—');
    }
})();

(async () => {
    const statusEl = document.getElementById('tv-status');
    const sourceEl = document.getElementById('tv-source');
    const video = document.getElementById('tv-player');

    const muteBtn = document.getElementById('tv-mute');

    let ads = null;
    let schedule = null;
    let currentBlockIndex = -1;
    let currentQueueIndex = -1;
    let hls = null;
    let syncInterval = null;
    let lastSyncTime = 0;

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

    function buildPlayQueue(blockIndex) {
        if (!schedule?.blocks?.length) return [];
        
        const queue = [];
        const block = schedule.blocks[0]; // Always use first block for now
        let blockUsedTime = 0;
        
        for (let i = 0; i < block.events.length; i++) {
            const event = block.events[i];
            
            if (event.type === 'segment') {
                queue.push({
                    type: 'segment',
                    url: event.url,
                    title: event.title,
                    durationSeconds: 876 // Approximate duration for Dexter episode
                });
                blockUsedTime += 876;
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
        // Schedule starts at a fixed time (e.g., midnight)
        const scheduleStart = new Date();
        scheduleStart.setHours(0, 0, 0, 0); // Start at midnight today
        
        const now = new Date();
        const elapsedMs = now - scheduleStart;
        
        return {
            scheduleStart,
            elapsedMs,
            currentBlockIndex: Math.floor(elapsedMs / (30 * 60 * 1000)) // 30-minute blocks
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

        setStatus(`Loading: ${title}`);
        setSource(url);

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
                setStatus('HLS not supported in this browser. Try Chrome/Edge or use MP4 files for testing.');
                return false;
            }
        } else {
            video.src = url;
        }

        try {
            await video.play();
            
            // Seek to the correct position if specified
            if (seekToTime !== null && !isNaN(seekToTime) && seekToTime > 0) {
                video.currentTime = seekToTime;
            }
            
            setStatus(`Now Playing: ${title}`);
            return true;
        } catch (err) {
            setStatus(`Loaded: ${title} (waiting for autoplay...)`);
            return false;
        }
    }

    function syncWithSchedule() {
        const now = Date.now();
        
        // Throttle syncs to once per second maximum
        if (now - lastSyncTime < 1000) {
            return;
        }
        lastSyncTime = now;
        
        const { elapsedMs, currentBlockIndex: newBlockIndex } = getCurrentScheduleTime();
        
        // Check if we need to load a new block
        if (newBlockIndex !== currentBlockIndex) {
            currentBlockIndex = newBlockIndex;
            const playQueue = buildPlayQueue(currentBlockIndex);
            
            if (playQueue.length > 0) {
                const targetIndex = calculateCurrentQueueIndex(elapsedMs, playQueue);
                const item = playQueue[targetIndex];
                
                // Calculate seek time within current item
                const blockElapsed = elapsedMs % (30 * 60 * 1000);
                let accumulatedTime = 0;
                
                for (let i = 0; i < targetIndex; i++) {
                    accumulatedTime += (playQueue[i].durationSeconds || 30) * 1000;
                }
                
                const seekTime = (blockElapsed - accumulatedTime) / 1000;
                
                void loadAndPlayVideo(item.url, item.title, Math.max(0, seekTime));
            }
        } else {
            // Just sync the current video's time if needed
            const blockElapsed = elapsedMs % (30 * 60 * 1000);
            const playQueue = buildPlayQueue(currentBlockIndex);
            const targetIndex = calculateCurrentQueueIndex(blockElapsed, playQueue);
            
            if (targetIndex !== currentQueueIndex) {
                // We're in a different item, reload
                const item = playQueue[targetIndex];
                let accumulatedTime = 0;
                
                for (let i = 0; i < targetIndex; i++) {
                    accumulatedTime += (playQueue[i].durationSeconds || 30) * 1000;
                }
                
                const seekTime = (blockElapsed - accumulatedTime) / 1000;
                void loadAndPlayVideo(item.url, item.title, Math.max(0, seekTime));
            } else {
                // Same item, just adjust time if needed
                let accumulatedTime = 0;
                
                for (let i = 0; i < targetIndex; i++) {
                    accumulatedTime += (playQueue[i].durationSeconds || 30) * 1000;
                }
                
                const expectedTime = (blockElapsed - accumulatedTime) / 1000;
                const currentTimeDiff = Math.abs(video.currentTime - expectedTime);
                
                // Only seek if we're off by more than 2 seconds to avoid constant seeking
                if (currentTimeDiff > 2) {
                    video.currentTime = Math.max(0, expectedTime);
                }
            }
        }
        
        currentQueueIndex = calculateCurrentQueueIndex(elapsedMs % (30 * 60 * 1000), buildPlayQueue(currentBlockIndex));
    }

    // Prevent user interaction with video
    video.addEventListener('play', (e) => {
        if (e.target !== video) return;
        // Allow autoplay but prevent manual play
    });
    
    video.addEventListener('pause', (e) => {
        if (e.target !== video) return;
        // Prevent pausing - resume immediately
        setTimeout(() => video.play().catch(() => {}), 100);
    });
    
    video.addEventListener('seeking', (e) => {
        if (e.target !== video) return;
        // Prevent manual seeking - sync back to schedule
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

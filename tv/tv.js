(async () => {
    const statusEl = document.getElementById('tv-status');
    const sourceEl = document.getElementById('tv-source');
    const containerEl = document.getElementById('tv-container');
    const tuneBtn = document.getElementById('tv-tune');
    const muteBtn = document.getElementById('tv-mute');

    let ads = null;
    let schedule = null;
    let currentBlockIndex = -1;
    let currentQueueIndex = -1;
    let currentItemUrl = null;
    let hls = null;
    let hasTunedIn = false;
    let video = null;

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

    function formatTime(seconds) {
        if (!Number.isFinite(seconds)) return '--:--';
        const s = Math.max(0, Math.floor(seconds));
        const m = Math.floor(s / 60);
        const r = s % 60;
        return `${m}:${String(r).padStart(2, '0')}`;
    }

    function clampSeek(seconds) {
        if (!Number.isFinite(seconds)) return 0;
        if (seconds < 0) return 0;
        return seconds;
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
        
        const blockElapsed = elapsedMs % BLOCK_MS;
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

    function createVideoElement() {
        // Create video element dynamically
        video = document.createElement('video');
        video.id = 'tv-player';
        video.playsinline = true;
        video.preload = 'auto';
        video.style.cssText = 'width:100%; height:540px; background:#000; border:none; outline:none;';
        video.setAttribute('disablepictureinpicture', '');
        video.setAttribute('controlslist', 'nodownload nofullscreen nomute');
        
        // Replace container with video
        containerEl.innerHTML = '';
        containerEl.appendChild(video);
        
        // Add event listeners
        video.addEventListener('pause', (e) => {
            if (e.target !== video) return;
            if (hasTunedIn) {
                setTimeout(() => {
                    if (hasTunedIn) {
                        video.play().catch(() => {});
                    }
                }, 100);
            }
        });

        video.addEventListener('seeking', (e) => {
            if (e.target !== video) return;
            if (hasTunedIn) {
                setTimeout(() => syncWithSchedule(), 100);
            }
        });

        video.addEventListener('ratechange', (e) => {
            if (e.target !== video) return;
            video.playbackRate = 1;
        });

        video.addEventListener('volumechange', (e) => {
            if (e.target !== video) return;
            if (muteBtn) {
                muteBtn.textContent = video.muted ? '🔊 UNMUTE' : '🔇 MUTE';
            }
        });
    }

    async function prepareVideo(url, title, seekToTime = null) {
        if (!video) {
            createVideoElement();
        }

        cleanupHls();

        if (!url || url.includes('REPLACE_ME')) {
            setStatus(`Schedule loaded, but the URL for "${title}" is not set yet.`);
            setSource('Update tv/schedule.json with real video URLs');
            return false;
        }

        const desiredSeek = clampSeek(seekToTime ?? 0);

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

        // Wait for metadata to be available
        return new Promise((resolve) => {
            const onLoadedMetadata = () => {
                video.removeEventListener('loadedmetadata', onLoadedMetadata);
                
                // Seek to the correct position if specified
                if (desiredSeek > 0 && Number.isFinite(video.duration) && desiredSeek < video.duration) {
                    try {
                        video.currentTime = desiredSeek;
                        if (!hasTunedIn) {
                            setStatus(`Ready: ${title} (${formatTime(video.currentTime)}) - press TUNE IN`);
                        }
                    } catch (_) {
                        if (!hasTunedIn) {
                            setStatus(`Ready: ${title} (seek failed) - press TUNE IN`);
                        }
                    }
                } else {
                    if (!hasTunedIn) {
                        setStatus(`Ready: ${title} - press TUNE IN`);
                    }
                }
                
                resolve(true);
            };
            
            video.addEventListener('loadedmetadata', onLoadedMetadata);
            
            // Fallback timeout
            setTimeout(() => {
                video.removeEventListener('loadedmetadata', onLoadedMetadata);
                if (!hasTunedIn) {
                    setStatus(`Ready: ${title} - press TUNE IN`);
                }
                resolve(true);
            }, 5000);
        });
    }

    function syncWithSchedule() {
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

        const shouldReload =
            newBlockIndex !== currentBlockIndex ||
            targetIndex !== currentQueueIndex ||
            (currentItemUrl && targetItem.url !== currentItemUrl) ||
            (!currentItemUrl && targetItem.url);

        // Update indices
        currentBlockIndex = newBlockIndex;
        currentQueueIndex = targetIndex;

        if (shouldReload) {
            currentItemUrl = targetItem.url;
            void prepareVideo(targetItem.url, targetItem.title, expectedTime);
        } else {
            // Update status with current time
            if (hasTunedIn && video && Number.isFinite(video.currentTime)) {
                setStatus(`Live: ${targetItem.title} (expected ${formatTime(expectedTime)}; actual ${formatTime(video.currentTime)})`);
            } else if (!hasTunedIn) {
                setStatus(`Ready: ${targetItem.title} (expected ${formatTime(expectedTime)}; actual ${formatTime(video?.currentTime || 0)}) - press TUNE IN`);
            }
        }
    }

    muteBtn?.addEventListener('click', () => {
        if (video) {
            video.muted = !video.muted;
            muteBtn.textContent = video.muted ? '🔊 UNMUTE' : '🔇 MUTE';
        }
    });

    tuneBtn?.addEventListener('click', async () => {
        if (hasTunedIn) return;
        hasTunedIn = true;
        tuneBtn.textContent = '📡 TUNED';
        
        // First sync to get the correct video for current time
        syncWithSchedule();
        
        // Wait a bit for video to be created
        await new Promise(r => setTimeout(r, 100));
        
        // Start playback
        try {
            if (video) {
                await video.play();
                setStatus(`Now Playing: ${currentItemUrl ? 'Live Stream' : 'Loading...'}`);
            }
        } catch (err) {
            setStatus(`Playback failed - click TUNE IN again`);
        }
        
        // Start syncing every 2 seconds
        setInterval(() => {
            syncWithSchedule();
        }, 2000);
    });

    try {
        [ads, schedule] = await Promise.all([loadAds(), loadSchedule()]);
        
        setStatus('Ready to tune in…');
        // Don't sync yet - wait for TUNE IN to be clicked
        // syncWithSchedule();
        
    } catch (e) {
        setStatus(`Error: ${e?.message || e}`);
        setSource('—');
    }
})();

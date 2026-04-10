(async () => {
    const statusEl = document.getElementById('tv-status');
    const sourceEl = document.getElementById('tv-source');
    const video = document.getElementById('tv-player');

    const playBtn = document.getElementById('tv-play');
    const pauseBtn = document.getElementById('tv-pause');
    const nextBtn = document.getElementById('tv-next');
    const muteBtn = document.getElementById('tv-mute');

    let ads = null;
    let schedule = null;
    let playQueue = [];
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

    function fillAdBreak(targetSeconds, toleranceSeconds = 3) {
        if (!ads?.items?.length) return [];
        
        const validAds = ads.items.filter(ad => ad.durationSeconds !== null && ad.durationSeconds > 0);
        if (validAds.length === 0) return [];
        
        const selected = [];
        let totalDuration = 0;
        const shuffled = [...validAds].sort(() => Math.random() - 0.5);
        
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

    function buildPlayQueue() {
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
                        title: event.title
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
                    const selectedAds = fillAdBreak(targetDuration, tolerance);
                    
                    queue.push(...selectedAds);
                    blockUsedTime += selectedAds.reduce((sum, ad) => sum + ad.durationSeconds, 0);
                }
            }
        }
        
        return queue;
    }

    async function playQueueItem(index) {
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
            setStatus(`Now Playing: ${title}`);
        } catch (err) {
            setStatus(`Loaded: ${title} (press PLAY if autoplay is blocked)`);
        }
    }

    function playNext() {
        void playQueueItem(currentQueueIndex + 1);
    }

    video.addEventListener('ended', () => {
        playNext();
    });

    playBtn?.addEventListener('click', () => {
        void video.play();
    });

    pauseBtn?.addEventListener('click', () => {
        video.pause();
    });

    nextBtn?.addEventListener('click', () => {
        playNext();
    });

    muteBtn?.addEventListener('click', () => {
        video.muted = !video.muted;
        muteBtn.textContent = video.muted ? '🔊 UNMUTE' : '🔇 MUTE';
    });

    try {
        [ads, schedule] = await Promise.all([loadAds(), loadSchedule()]);
        playQueue = buildPlayQueue();
        currentQueueIndex = 0;

        if (playQueue.length === 0) {
            setStatus('No playable items found in schedule.');
        } else {
            setStatus('Schedule loaded. Starting…');
            await playQueueItem(currentQueueIndex);
        }
    } catch (e) {
        setStatus(`Error: ${e?.message || e}`);
        setSource('—');
    }
})();

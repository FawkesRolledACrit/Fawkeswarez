(async () => {
    const statusEl = document.getElementById('tv-status');
    const sourceEl = document.getElementById('tv-source');
    const video = document.getElementById('tv-player');

    const playBtn = document.getElementById('tv-play');
    const pauseBtn = document.getElementById('tv-pause');
    const nextBtn = document.getElementById('tv-next');
    const muteBtn = document.getElementById('tv-mute');

    let playlist = null;
    let currentIndex = 0;
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

    async function loadPlaylist() {
        const res = await fetch('./playlist.json', { cache: 'no-store' });
        if (!res.ok) {
            throw new Error(`Failed to load playlist.json (HTTP ${res.status})`);
        }
        return res.json();
    }

    async function playItem(index) {
        if (!playlist?.items?.length) {
            setStatus('No playlist items found.');
            return;
        }

        currentIndex = ((index % playlist.items.length) + playlist.items.length) % playlist.items.length;
        const item = playlist.items[currentIndex];

        const url = item?.url;
        const title = item?.title || `Item ${currentIndex + 1}`;
        const explicitType = item?.type;
        const type = explicitType || inferTypeFromUrl(url);

        cleanupHls();

        if (!url || url.includes('REPLACE_ME')) {
            setStatus(`Playlist loaded, but the URL for "${title}" is not set yet.`);
            setSource('Update tv/playlist.json with a real Catbox URL');
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
        void playItem(currentIndex + 1);
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
        playlist = await loadPlaylist();
        currentIndex = Number.isFinite(playlist?.startIndex) ? playlist.startIndex : 0;

        if (playlist?.autoplay === false) {
            setStatus('Playlist loaded. Press PLAY.');
        } else {
            setStatus('Playlist loaded. Starting…');
        }

        await playItem(currentIndex);
    } catch (e) {
        setStatus(`Error: ${e?.message || e}`);
        setSource('—');
    }
})();

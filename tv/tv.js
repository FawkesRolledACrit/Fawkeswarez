/**
 * Fawkesware TV - Proper Live Streaming Implementation
 * NO AUTOPLAY - EVER. Video element only created after explicit user interaction.
 */

class LiveStreamPlayer {
    constructor() {
        console.log('LiveStreamPlayer constructor');
        // Use a monotonic clock anchored to wall time to avoid schedule jumps
        // if the system clock changes (NTP/timezone adjustments, etc.).
        this._wallClockBaseMs = Date.now();
        this._monoBaseMs = performance.now();

        this.container = document.getElementById('tv-container');
        this.video = null;
        this.hls = null;
        this.tuneBtn = document.getElementById('tune-btn');
        this.muteBtn = document.getElementById('mute-btn');
        this.fullscreenBtn = document.getElementById('fullscreen-btn');
        this.lineupBtn = document.getElementById('lineup-btn');
        this.statusText = document.getElementById('status-text');
        this.currentProgramEl = document.getElementById('current-program');
        this.scheduleTimeEl = document.getElementById('schedule-time');
        
        console.log('Elements found:', {
            container: !!this.container,
            tuneBtn: !!this.tuneBtn,
            muteBtn: !!this.muteBtn,
            fullscreenBtn: !!this.fullscreenBtn,
            lineupBtn: !!this.lineupBtn,
            statusText: !!this.statusText,
            currentProgramEl: !!this.currentProgramEl,
            scheduleTimeEl: !!this.scheduleTimeEl
        });
        
        this.hasTunedIn = false;
        this.ads = null;
        this.schedule = null;
        this.syncInterval = null;
        this.currentItemUrl = null;
        this.desiredMuted = true;
        this.loadSeq = 0;

        this.weeklyLineup = null;
        this.weeklySlotsByDay = null;
        
        // Schedule constants
        this.BLOCK_DURATION = 30 * 60 * 1000; // 30 minutes
        
        this.init();
    }

    nowMs() {
        return this._wallClockBaseMs + (performance.now() - this._monoBaseMs);
    }
    
    async init() {
        console.log('Initializing LiveStreamPlayer');
        
        // Wait a tick to ensure DOM is ready
        await new Promise(resolve => setTimeout(resolve, 0));
        
        // NO video element creation here
        // NO autoplay prevention needed because there's no video
        
        // Load schedule data
        try {
            await this.loadScheduleData();
            this.updateStatus('Ready to tune in...');
            this.startScheduleUpdates();
        } catch (error) {
            this.updateStatus(`Error loading schedule: ${error.message}`);
        }
        
        // Setup event listeners
        this.setupEventListeners();
    }
    
    async loadScheduleData() {
        const [adsResponse, scheduleResponse, weeklyResponse] = await Promise.all([
            fetch('./ads.json', { cache: 'no-store' }),
            fetch('./schedule.json', { cache: 'no-store' }),
            fetch('./weekly-lineup.json', { cache: 'no-store' }).catch(() => null)
        ]);
        
        if (!adsResponse.ok || !scheduleResponse.ok) {
            throw new Error('Failed to load schedule data');
        }
        
        this.ads = await adsResponse.json();
        this.schedule = await scheduleResponse.json();

        if (weeklyResponse && weeklyResponse.ok) {
            this.weeklyLineup = await weeklyResponse.json();
            this.weeklySlotsByDay = this.buildWeeklySlots(this.weeklyLineup);
        }
    }

    parseTimeToMinutes(timeStr) {
        // Handles "6:00 AM", "12:00 PM", "10:30 PM"
        const s = (timeStr || '').trim();
        const m = s.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
        if (!m) return null;
        let hh = parseInt(m[1], 10);
        const mm = parseInt(m[2], 10);
        const ampm = m[3].toUpperCase();
        if (hh === 12) hh = 0;
        if (ampm === 'PM') hh += 12;
        return hh * 60 + mm;
    }

    getDayName(dateObj) {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        return days[dateObj.getDay()];
    }

    buildWeeklySlots(lineupItems) {
        // Expand the weekly template into 30-minute slots per day.
        // Any gaps become OFF AIR.
        const byDay = {};
        for (const item of lineupItems || []) {
            if (!item?.day || !item?.time || !item?.program) continue;
            const day = String(item.day).trim();
            const startMin = this.parseTimeToMinutes(item.time);
            if (startMin == null) continue;
            if (!byDay[day]) byDay[day] = [];
            byDay[day].push({ startMin, program: String(item.program).trim() });
        }

        const out = {};
        for (const [day, entries] of Object.entries(byDay)) {
            const sorted = entries.sort((a, b) => a.startMin - b.startMin);
            const slots = [];
            for (let i = 0; i < sorted.length; i++) {
                const cur = sorted[i];
                const nextStart = (i + 1 < sorted.length) ? sorted[i + 1].startMin : 24 * 60;
                const duration = Math.max(0, nextStart - cur.startMin);
                const slotCount = Math.floor(duration / 30);
                for (let k = 0; k < slotCount; k++) {
                    slots.push({
                        startMin: cur.startMin + (k * 30),
                        endMin: cur.startMin + ((k + 1) * 30),
                        program: cur.program
                    });
                }
            }
            out[day] = slots;
        }
        return out;
    }

    getWeeklySlotForNow() {
        if (!this.weeklySlotsByDay) return null;
        const d = new Date(this.nowMs());
        const dayName = this.getDayName(d);
        const mins = d.getHours() * 60 + d.getMinutes();
        const slots = this.weeklySlotsByDay[dayName] || [];
        // Find the slot where mins is within [start,end)
        for (const s of slots) {
            if (mins >= s.startMin && mins < s.endMin) {
                return { ...s, dayName, mins };
            }
        }
        return { program: null, startMin: Math.floor(mins / 30) * 30, endMin: Math.floor(mins / 30) * 30 + 30, dayName, mins };
    }

    goOffAir(title) {
        this.currentItemUrl = null;
        if (this.hls) {
            this.hls.destroy();
            this.hls = null;
        }
        if (this.video) {
            try { this.video.pause(); } catch {}
            try {
                this.video.removeAttribute('src');
                this.video.load();
            } catch {}
        }
        this.updateStatus(title || 'OFF AIR');
    }
    
    setupEventListeners() {
        console.log('Setting up event listeners');
        console.log('Tune button:', this.tuneBtn);
        console.log('Mute button:', this.muteBtn);
        console.log('Fullscreen button:', this.fullscreenBtn);
        if (this.tuneBtn) {
            this.tuneBtn.addEventListener('click', () => this.tuneIn());
            console.log('Tune button listener added');
        }
        
        if (this.muteBtn) {
            this.muteBtn.addEventListener('click', () => this.toggleMute());
            console.log('Mute button listener added');
        }

        if (this.fullscreenBtn) {
            this.fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());
            console.log('Fullscreen button listener added');
        }

        if (this.lineupBtn) {
            this.lineupBtn.addEventListener('click', () => window.open('./guide.html', '_blank'));
            console.log('Lineup button listener added');
        }

        // Keep button label in sync
        document.addEventListener('fullscreenchange', () => this.updateFullscreenButton());
        document.addEventListener('webkitfullscreenchange', () => this.updateFullscreenButton());
    }
    
    isFullscreen() {
        return !!(
            document.fullscreenElement ||
            document.webkitFullscreenElement ||
            document.mozFullScreenElement ||
            document.msFullscreenElement
        );
    }

    updateFullscreenButton() {
        if (!this.fullscreenBtn) return;
        this.fullscreenBtn.textContent = this.isFullscreen() ? '🗗 EXIT FULLSCREEN' : '⛶ FULLSCREEN';
    }

    async toggleFullscreen() {
        const target = this.container || this.video;
        if (!target) return;

        // iOS Safari best-effort: only the <video> can enter fullscreen.
        if (this.video && typeof this.video.webkitEnterFullscreen === 'function') {
            try {
                // If we're already in fullscreen via standard API, exit that first.
                if (this.isFullscreen()) {
                    await this.exitFullscreen();
                }
                this.video.webkitEnterFullscreen();
                return;
            } catch {
                // fall through to standard API
            }
        }

        if (this.isFullscreen()) {
            await this.exitFullscreen();
            return;
        }

        await this.enterFullscreen(target);
    }

    async enterFullscreen(el) {
        try {
            if (el.requestFullscreen) {
                await el.requestFullscreen();
            } else if (el.webkitRequestFullscreen) {
                await el.webkitRequestFullscreen();
            } else if (el.mozRequestFullScreen) {
                await el.mozRequestFullScreen();
            } else if (el.msRequestFullscreen) {
                await el.msRequestFullscreen();
            }
        } finally {
            this.updateFullscreenButton();
        }
    }

    async exitFullscreen() {
        try {
            if (document.exitFullscreen) {
                await document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                await document.webkitExitFullscreen();
            } else if (document.mozCancelFullScreen) {
                await document.mozCancelFullScreen();
            } else if (document.msExitFullscreen) {
                await document.msExitFullscreen();
            }
        } finally {
            this.updateFullscreenButton();
        }
    }
    
    async tuneIn() {
        console.log('Tune in button clicked');
        if (this.hasTunedIn) {
            console.log('Already tuned in');
            return;
        }
        
        this.hasTunedIn = true;
        this.tuneBtn.textContent = '📡 TUNED';
        this.updateStatus('Tuning in...');

        // We have a user gesture now, so default to audio ON.
        // If the browser blocks unmuted playback, startPlayback() will fall back to muted.
        this.desiredMuted = false;
        this.muteBtn.textContent = this.desiredMuted ? '🔊 UNMUTE' : '🔇 MUTE';
        
        // Create video element ONLY NOW
        this.createVideoElement();
        
        // Get current schedule position
        const { currentUrl, currentTime, currentTitle } = this.getCurrentSchedulePosition();
        console.log('Schedule position:', { currentUrl, currentTime, currentTitle });

        if (currentUrl && currentUrl !== 'REPLACE_ME') {
            await this.loadVideo(currentUrl, currentTime, currentTitle);
            await this.startPlayback();
        } else {
            // OFF AIR or not-yet-assigned programming: show black screen.
            this.goOffAir(currentTitle || 'OFF AIR');
        }
        
        // Start sync interval
        this.startSyncInterval();
    }
    
    createVideoElement() {
        console.log('Creating video element');

        // Reuse the existing video element in the DOM if present.
        // (Prevents multiple <video> elements stacking inside the container.)
        const existing = document.getElementById('tv-player');
        if (existing) {
            this.video = existing;
        } else {
            // Create video element dynamically
            this.video = document.createElement('video');
            this.video.id = 'tv-player';
            this.video.preload = 'none';
            this.container.appendChild(this.video);
        }

        this.video.preload = 'none';
        this.video.playsInline = true;
        this.video.muted = !!this.desiredMuted;
        this.video.controls = false; // No controls
        this.video.setAttribute('playsinline', '');

        // Style: center the video and fit fully inside the frame.
        // (Some ads are 4:3 / odd sizes; contain keeps them centered.)
        this.video.style.cssText = `
            position: absolute;
            inset: 0;
            width: 100%;
            height: 100%;
            object-fit: contain;
            object-position: center;
            background: #000;
            display: block;
        `;
        
        console.log('Video element created:', this.video);
        console.log('Container:', this.container);

        console.log('Video attached to container');
        
        // Show video, hide placeholder
        this.container.classList.add('active');
        console.log('Container class set to active');
        
        // Add minimal event listeners
        this.video.addEventListener('error', (e) => {
            console.error('Video element error:', e);
            this.updateStatus(`Video error: ${e.message || 'Unknown error'}`);
        });
        
        this.video.addEventListener('loadstart', () => {
            console.log('Video loadstart event');
        });
        
        this.video.addEventListener('canplay', () => {
            console.log('Video canplay event');
        });
        
        this.video.addEventListener('pause', () => {
            console.log('Video paused');
            if (this.hasTunedIn) {
                // Auto-resume if user hasn't explicitly paused
                setTimeout(() => {
                    if (this.hasTunedIn && this.video.paused) {
                        this.video.play().catch(() => {});
                    }
                }, 100);
            }
        });
    }
    
    async loadVideo(url, seekTime, title) {
        const seq = ++this.loadSeq;
        console.log('loadVideo called:', { url, seekTime, title, seq });
        this.updateStatus(`Loading: ${title}`);

        if (!this.video) {
            console.error('Video element not found!');
            this.updateStatus('Error: Video element not found');
            return;
        }

        // Apply user mute preference consistently.
        this.video.muted = !!this.desiredMuted;
        this.video.volume = 1;

        // Abort any in-flight loads cleanly.
        try { this.video.pause(); } catch {}
        try {
            this.video.removeAttribute('src');
            this.video.load();
        } catch {}

        // Clean up previous HLS instance
        if (this.hls) {
            this.hls.destroy();
            this.hls = null;
        }

        // Ensure UI is in "active" state.
        this.container.classList.add('active');

        const isHLS = url.includes('.m3u8');
        console.log('Video type:', isHLS ? 'HLS' : 'Direct');
        
        if (isHLS && Hls.isSupported()) {
            console.log('Using HLS.js');
            this.hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true,
                maxBufferLength: 30,
                maxMaxBufferLength: 600
            });
            
            this.hls.loadSource(url);
            this.hls.attachMedia(this.video);
            
            this.hls.on(Hls.Events.ERROR, (event, data) => {
                console.error('HLS error:', data);
                this.updateStatus(`HLS Error: ${data.details}`);
            });
            
            return new Promise((resolve) => {
                this.hls.on(Hls.Events.MANIFEST_PARSED, () => {
                    if (seq !== this.loadSeq) return;
                    console.log('HLS manifest parsed');
                    if (seekTime > 0) {
                        this.video.currentTime = seekTime;
                    }
                    resolve();
                });
            });
        } else if (isHLS && this.video.canPlayType('application/vnd.apple.mpegurl')) {
            // Safari native HLS - ONLY for actual HLS files
            console.log('Using Safari native HLS');
            this.video.src = url;
            
            return new Promise((resolve) => {
                this.video.addEventListener('loadedmetadata', () => {
                    if (seq !== this.loadSeq) return;
                    console.log('Metadata loaded (Safari HLS)');
                    if (seekTime > 0) {
                        this.video.currentTime = seekTime;
                    }
                    resolve();
                }, { once: true });
                
                this.video.addEventListener('error', (e) => {
                    if (seq !== this.loadSeq) return;
                    console.error('Video error (Safari HLS):', e);
                    this.updateStatus('Video error loading HLS');
                    resolve();
                }, { once: true });
            });
        } else {
            // Direct MP4/WebM - for all non-HLS files
            console.log('Using direct MP4/WebM');

            const tryLoad = (srcUrl, attempt) => {
                if (seq !== this.loadSeq) return Promise.resolve();
                this.video.src = srcUrl;
                this.video.load();

                return new Promise((resolve) => {
                    let settled = false;
                    const finish = () => {
                        if (settled) return;
                        settled = true;
                        resolve();
                    };

                    const onLoadedMetadata = () => {
                        if (settled || seq !== this.loadSeq) return;
                        console.log('Metadata loaded (MP4/WebM)');

                        const proceed = () => {
                            if (settled || seq !== this.loadSeq) return;
                            if (!(seekTime > 0)) {
                                finish();
                                return;
                            }

                            console.log('Seeking to:', seekTime);
                            try { this.video.currentTime = seekTime; } catch { finish(); return; }
                            this.video.addEventListener('seeked', () => {
                                if (seq !== this.loadSeq) return;
                                console.log('Seek completed');
                                finish();
                            }, { once: true });
                        };

                        if (this.video.readyState >= 2) {
                            proceed();
                        } else {
                            this.video.addEventListener('loadeddata', proceed, { once: true });
                        }
                    };

                    const onCanPlay = () => {
                        if (settled || seq !== this.loadSeq) return;
                        // If metadata never fired but canplay did, proceed.
                        console.log('Canplay reached (MP4/WebM)');
                        finish();
                    };

                    const onError = (e) => {
                        if (settled || seq !== this.loadSeq) return;
                        console.error('Video error (MP4/WebM):', e);
                        this.updateStatus('Video error loading file');
                        finish();
                    };

                    this.video.addEventListener('loadedmetadata', onLoadedMetadata, { once: true });
                    this.video.addEventListener('canplay', onCanPlay, { once: true });
                    this.video.addEventListener('error', onError, { once: true });

                    // Stall timeout + one retry with cache-bust.
                    setTimeout(() => {
                        if (settled || seq !== this.loadSeq) return;
                        if (attempt >= 2) {
                            console.log('Timeout waiting for readiness');
                            this.updateStatus('Video loading timeout');
                            finish();
                            return;
                        }

                        console.log('Stalled loading, retrying with cache-bust');
                        this.updateStatus('Retrying load...');
                        const cacheBustUrl = srcUrl + (srcUrl.includes('?') ? '&' : '?') + 'cb=' + Date.now();
                        tryLoad(cacheBustUrl, attempt + 1).then(finish);
                    }, 5000);
                });
            };

            return tryLoad(url, 1);
        }
    }
    
    async startPlayback() {
        try {
            // Ensure the current mute preference is applied right before play().
            this.video.muted = !!this.desiredMuted;
            this.video.volume = 1;
            await this.video.play();
            this.updateStatus('Broadcast active');
        } catch (error) {
            // Common case: browser blocks unmuted playback even after gesture.
            if (!this.desiredMuted) {
                try {
                    this.desiredMuted = true;
                    this.video.muted = true;
                    this.muteBtn.textContent = '🔊 UNMUTE';
                    await this.video.play();
                    this.updateStatus('Broadcast active (muted)');
                    return;
                } catch {
                    // fall through
                }
            }
            this.updateStatus(`Playback failed: ${error.message}`);
        }
    }
    
    getCurrentSchedulePosition() {
        if (!this.schedule?.blocks?.length) {
            return { currentUrl: null, currentTime: 0, currentTitle: 'No Schedule' };
        }

        const now = this.nowMs();
        const globalBlockIndex = Math.floor(now / this.BLOCK_DURATION);
        const blockStart = globalBlockIndex * this.BLOCK_DURATION;
        const blockElapsed = now - blockStart;

        // Weekly lineup mode: determine what show is supposed to be on NOW.
        const weeklySlot = this.getWeeklySlotForNow();
        const program = weeklySlot?.program;

        if (!program) {
            return { currentUrl: null, currentTime: 0, currentTitle: 'OFF AIR', queue: [] };
        }

        // Only Dexter is wired up for now. Everything else is intentionally OFF AIR.
        if (program !== "Dexter's Laboratory") {
            return { currentUrl: null, currentTime: 0, currentTitle: `${program} (No Video Yet)`, queue: [] };
        }

        const queue = this.buildQueue(globalBlockIndex);
        const position = this.getQueuePosition(blockElapsed, queue);
        return {
            currentUrl: queue[position.index]?.url || null,
            currentTime: position.time,
            currentTitle: queue[position.index]?.title || program,
            queue
        };
    }
    
    buildQueue(blockIndex) {
        const queue = [];
        const blocks = this.schedule?.blocks || [];
        if (!blocks.length) return queue;

        // Date-based rotation: schedule.startDate at 00:00 maps to blocks[0].
        // Then every 30-minute slot advances to the next episode, looping forever.
        let startBlockIndex = 0;
        if (this.schedule?.startDate) {
            const startMs = Date.parse(this.schedule.startDate + 'T00:00:00');
            if (!Number.isNaN(startMs)) {
                startBlockIndex = Math.floor(startMs / this.BLOCK_DURATION);
            }
        }

        const rel = blockIndex - startBlockIndex;
        const episodeIndex = ((rel % blocks.length) + blocks.length) % blocks.length;
        const block = blocks[episodeIndex];
        let usedTime = 0;
        
        for (const event of block.events) {
            if (event.type === 'segment') {
                queue.push({
                    type: 'segment',
                    url: event.url,
                    title: event.title,
                    duration: event.durationSeconds || 600
                });
                usedTime += event.durationSeconds || 600;
            } else if (event.type === 'adbreak') {
                const remaining = block.slotSeconds - usedTime;
                if (event.targetSeconds === 'auto' && remaining <= 0) {
                    continue;
                }
                const ads = this.fillAdBreak(
                    event.targetSeconds === 'auto' 
                        ? remaining
                        : event.targetSeconds,
                    event.toleranceSeconds || 3,
                    blockIndex * 1000 + queue.length
                );
                queue.push(...ads);
                usedTime += ads.reduce((sum, ad) => sum + ad.duration, 0);
            }
        }
        
        return queue;
    }
    
    fillAdBreak(targetSeconds, tolerance, seed) {
        if (!this.ads?.items?.length) return [];
        
        const validAds = this.ads.items.filter(ad => ad.durationSeconds > 0);
        const selected = [];
        let total = 0;
        
        // Simple seeded random for consistency
        const rng = this.seededRandom(seed);
        const shuffled = [...validAds].sort(() => rng() - 0.5);
        
        for (const ad of shuffled) {
            if (total + ad.durationSeconds <= targetSeconds + tolerance) {
                selected.push({
                    type: 'ad',
                    url: ad.url,
                    title: 'Commercial',
                    duration: ad.durationSeconds
                });
                total += ad.durationSeconds;
                
                if (total >= targetSeconds - tolerance) break;
            }
        }
        
        return selected;
    }
    
    seededRandom(seed) {
        let value = seed;
        return () => {
            value = (value * 9301 + 49297) % 233280;
            return value / 233280;
        };
    }
    
    getQueuePosition(elapsedMs, queue) {
        let accumulated = 0;
        
        for (let i = 0; i < queue.length; i++) {
            const itemDuration = queue[i].duration * 1000;
            if (accumulated + itemDuration > elapsedMs) {
                return {
                    index: i,
                    time: (elapsedMs - accumulated) / 1000
                };
            }
            accumulated += itemDuration;
        }
        
        return { index: queue.length - 1, time: queue[queue.length - 1]?.duration || 0 };
    }
    
    startSyncInterval() {
        // Sync every 2 seconds to maintain schedule
        this.syncInterval = setInterval(() => {
            this.syncWithSchedule();
        }, 2000);
    }
    
    syncWithSchedule() {
        if (!this.hasTunedIn || !this.video) return;
        
        const { currentUrl, currentTime, currentTitle } = this.getCurrentSchedulePosition();
        const expectedTime = currentTime;
        const actualTime = this.video.currentTime;

        // Display schedule time as "time into current 30-min block" (stable / monotonic)
        const blockElapsedSeconds = (this.nowMs() % this.BLOCK_DURATION) / 1000;

        // OFF AIR / no content assigned
        if (!currentUrl) {
            if (this.currentItemUrl !== null) {
                console.log('Switching to OFF AIR');
                this.currentItemUrl = null;
                this.goOffAir(currentTitle || 'OFF AIR');
            }
            this.currentProgramEl.textContent = currentTitle;
            this.scheduleTimeEl.textContent = this.formatTime(blockElapsedSeconds);
            return;
        }

        // Check if we need to switch videos
        if (currentUrl !== this.currentItemUrl) {
            console.log('Switching to new video:', currentUrl);
            this.currentItemUrl = currentUrl;
            this.loadVideo(currentUrl, expectedTime, currentTitle).then(() => {
                this.startPlayback();
            });
            return;
        }

        // Update UI
        this.currentProgramEl.textContent = currentTitle;
        this.scheduleTimeEl.textContent = this.formatTime(blockElapsedSeconds);
        
        // Correct drift if significant (but not during playback)
        const drift = Math.abs(actualTime - expectedTime);
        if (drift > 5 && !this.video.paused) {
            console.log('Correcting drift:', { actualTime, expectedTime, drift });
            try {
                this.video.currentTime = expectedTime;
            } catch (e) {
                // Ignore seek errors
            }
        }
        
        // Update status
        if (drift <= 2) {
            this.updateStatus(`Live: ${currentTitle}`);
        }
    }
    
    startScheduleUpdates() {
        console.log('Starting schedule updates');
        // Update schedule info every second even before tuning in
        setInterval(() => {
            const position = this.getCurrentSchedulePosition();
            // Keep console noise down during normal playback.
            // console.log('Schedule position:', position);
            
            if (this.currentProgramEl) {
                this.currentProgramEl.textContent = position.currentTitle;
            } else {
                console.log('currentProgramEl not found');
            }
            
            const now = this.nowMs();
            const blockElapsedSeconds = (now % this.BLOCK_DURATION) / 1000;
            const timeStr = this.formatTime(blockElapsedSeconds);
            
            if (this.scheduleTimeEl) {
                this.scheduleTimeEl.textContent = timeStr;
            } else {
                console.log('scheduleTimeEl not found');
            }
        }, 1000);
    }
    
    toggleMute() {
        // Allow toggling label before tune-in (preference), but apply only when video exists.
        this.desiredMuted = !this.desiredMuted;
        if (this.video) {
            this.video.muted = !!this.desiredMuted;
            this.video.volume = 1;
        }
        this.muteBtn.textContent = this.desiredMuted ? '🔊 UNMUTE' : '🔇 MUTE';
    }
    
    updateStatus(text) {
        if (this.statusText) {
            this.statusText.textContent = text;
        } else {
            console.log('Status text element not found:', text);
        }
    }
    
    formatTime(seconds) {
        if (!Number.isFinite(seconds)) return '--:--';
        const s = Math.max(0, Math.floor(seconds));
        const m = Math.floor(s / 60);
        const r = s % 60;
        return `${m}:${String(r).padStart(2, '0')}`;
    }
}

// Initialize ONLY when page is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    new LiveStreamPlayer();
});

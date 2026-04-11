/**
 * Fawkesware TV - Proper Live Streaming Implementation
 * NO AUTOPLAY - EVER. Video element only created after explicit user interaction.
 */

class LiveStreamPlayer {
    constructor() {
        console.log('LiveStreamPlayer constructor v2.0');
        
        // Force reload if page is using old cached version
        if (!window.location.search.includes('force_refresh=')) {
            const lastVersion = localStorage.getItem('tvPlayerVersion');
            const currentVersion = '2.0';
            if (lastVersion !== currentVersion) {
                localStorage.setItem('tvPlayerVersion', currentVersion);
                console.log('New version detected, forcing refresh...');
                window.location.href = window.location.pathname + '?force_refresh=' + Date.now();
                return;
            }
        }
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
        this.currentBlockEl = document.getElementById('current-block');
        this.scheduleTimeEl = document.getElementById('schedule-time');
        this.streamStatusEl = document.getElementById('stream-status');
        this.nextUpEl = document.getElementById('next-up');
        
        console.log('Elements found:', {
            container: !!this.container,
            tuneBtn: !!this.tuneBtn,
            muteBtn: !!this.muteBtn,
            fullscreenBtn: !!this.fullscreenBtn,
            lineupBtn: !!this.lineupBtn,
            statusText: !!this.statusText,
            currentProgramEl: !!this.currentProgramEl,
            currentBlockEl: !!this.currentBlockEl,
            scheduleTimeEl: !!this.scheduleTimeEl,
            streamStatusEl: !!this.streamStatusEl,
            nextUpEl: !!this.nextUpEl
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
        console.log('Hls.js available:', typeof Hls !== 'undefined');
        console.log('Tune button:', this.tuneBtn);
        console.log('Mute button:', this.muteBtn);
        console.log('Fullscreen button:', this.fullscreenBtn);
        console.log('Lineup button:', this.lineupBtn);
        
        if (this.tuneBtn) {
            this.tuneBtn.addEventListener('click', () => {
                console.log('Tune button clicked!');
                this.tuneIn();
            });
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
            this.lineupBtn.addEventListener('click', () => {
                console.log('Lineup button clicked!');
                window.open('./guide.html', '_blank');
            });
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

        // Check if this program has videos available in schedule.json
        const programSearchTerms = this.getProgramSearchTerms(program);
        const hasProgramVideos = this.schedule.blocks.some(block => 
            programSearchTerms.some(term => block.title.toLowerCase().includes(term.toLowerCase()))
        );
        
        if (!hasProgramVideos) {
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

        // Get current program from weekly lineup
        const weeklySlot = this.getWeeklySlotForNow();
        const program = weeklySlot?.program;
        if (!program) return queue;

        // Filter blocks to only include episodes for the current program
        const programSearchTerms = this.getProgramSearchTerms(program);
        const programBlocks = blocks.filter(block => {
            const blockTitle = block.title.toLowerCase();
            return programSearchTerms.some(term => blockTitle.includes(term.toLowerCase()));
        });

        if (!programBlocks.length) return queue;

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
        const episodeIndex = ((rel % programBlocks.length) + programBlocks.length) % programBlocks.length;
        const block = programBlocks[episodeIndex];
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
    
    getCurrentBlockInfo() {
        const weeklySlot = this.getWeeklySlotForNow();
        if (!weeklySlot) return null;
        
        // Get episode information for shows that have it
        const program = weeklySlot.program;
        if (["Dexter's Laboratory", "The Powerpuff Girls"].includes(program)) {
            const now = new Date();
            const timeStr = weeklySlot.time;
            const episodeData = this.getEpisodeForDate(now, timeStr, program);
            
            let episodeText = '';
            if (program === "Dexter's Laboratory" || program === "The Powerpuff Girls") {
                episodeText = `Season ${episodeData.season.toString().padStart(2, '0')} Episode ${episodeData.episode.toString().padStart(2, '0')}`;
            } else {
                episodeText = `Episode ${episodeData.episode}`;
            }
            
            return {
                time: timeStr,
                episode: episodeText,
                program: program
            };
        }
        
        return {
            time: weeklySlot.time,
            program: program
        };
    }
    
    getEpisodeForDate(date, timeStr, program) {
        // Parse the time to get total 30-minute slots since anchor date
        const [hours, minutes] = timeStr.split(':').map(Number);
        const slotDate = new Date(date);
        slotDate.setHours(hours, minutes, 0, 0);
        
        const anchorDate = new Date('2026-04-01T00:00:00');
        const totalSlots = Math.floor((slotDate - anchorDate) / (30 * 60 * 1000));
        
        // Special handling for Dexter's Laboratory
        if (program === "Dexter's Laboratory") {
            const episodeCount = 20;
            const episodeIndex = totalSlots % episodeCount;
            const episodeNum = episodeIndex + 1;
            
            let season, episode;
            if (episodeNum <= 13) {
                season = 1;
                episode = episodeNum;
            } else {
                season = 2;
                episode = episodeNum - 13;
            }
            
            return { episode, season };
        }
        
        // Special handling for Powerpuff Girls
        if (program === "The Powerpuff Girls") {
            const episodeCount = 20;
            const offset = 100;
            const adjustedSlots = totalSlots + offset;
            const episodeIndex = adjustedSlots % episodeCount;
            const episodeNum = episodeIndex + 1;
            
            let season, episode;
            if (episodeNum <= 13) {
                season = 1;
                episode = episodeNum;
            } else {
                season = 2;
                episode = episodeNum - 13;
            }
            
            return { episode, season };
        }
        
        // Different episode counts for other shows
        let episodeCount;
        if (["The Powerpuff Girls", "Ed, Edd n Eddy", "Johnny Bravo"].includes(program)) {
            episodeCount = 20;
        } else {
            episodeCount = 15;
        }
        
        const programOffsets = {
            "Dexter's Laboratory": 0,
            "The Powerpuff Girls": 100,
            "Ed, Edd n Eddy": 200,
            "Johnny Bravo": 300,
            "Courage the Cowardly Dog": 400,
            "Cow and Chicken": 500,
            "I Am Weasel": 600,
            "Tom and Jerry": 700
        };
        
        const offset = programOffsets[program] || 0;
        const adjustedSlots = totalSlots + offset;
        const episodeIndex = adjustedSlots % episodeCount;
        
        return { episode: episodeIndex + 1, season: 1 };
    }
    
    getProgramSearchTerms(program) {
        // Return multiple search terms for each program to handle variations in naming
        const searchTerms = {
            "Dexter's Laboratory": ["dexter", "dexter's laboratory"],
            "The Powerpuff Girls": ["powerpuff", "powerpuff girls"],
            "Ed, Edd n Eddy": ["ed", "ed, edd n eddy", "ed edd n eddy"],
            "Johnny Bravo": ["johnny", "johnny bravo"],
            "Courage the Cowardly Dog": ["courage", "courage the cowardly dog"],
            "Cow and Chicken": ["cow", "cow and chicken"],
            "I Am Weasel": ["weasel", "i am weasel"],
            "Tom and Jerry": ["tom", "tom and jerry"],
            "The Venture Bros": ["venture", "venture bros"],
            "Harvey Birdman, Attorney at Law": ["harvey", "harvey birdman"],
            "Tom Goes to the Mayor": ["tom goes", "tom goes to the mayor"],
            "Brak Show": ["brak", "brak show"],
            "Home Movies": ["home", "home movies"],
            "Aqua Teen Hunger Force": ["aqua", "aqua teen", "athf"],
            "Sealab 2021": ["sealab", "sealab 2021"]
        };
        
        return searchTerms[program] || [program.toLowerCase()];
    }
    
    getNextUp() {
        // Get the next show in the schedule
        const now = new Date();
        const currentDay = now.getDay(); // 0 = Sunday, 6 = Saturday
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        
        // Find current time slot
        const timeSlots = ['12:00 AM', '12:30 AM', '1:00 AM', '1:30 AM', '2:00 AM', '2:30 AM', '3:00 AM', '3:30 AM',
                          '4:00 AM', '4:30 AM', '5:00 AM', '5:30 AM', '6:00 AM', '6:30 AM', '7:00 AM', '7:30 AM',
                          '8:00 AM', '8:30 AM', '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
                          '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM',
                          '4:00 PM', '4:30 PM', '5:00 PM', '5:30 PM', '6:00 PM', '6:30 PM', '7:00 PM', '7:30 PM',
                          '8:00 PM', '8:30 PM', '9:00 PM', '9:30 PM', '10:00 PM', '10:30 PM', '11:00 PM', '11:30 PM'];
        
        // Find current slot index
        const currentTimeStr = `${currentHour % 12 || 12}:${currentMinute.toString().padStart(2, '0')} ${currentHour >= 12 ? 'PM' : 'AM'}`;
        let currentSlotIndex = timeSlots.findIndex(slot => slot === currentTimeStr);
        
        if (currentSlotIndex === -1) {
            // Find the next slot
            currentSlotIndex = timeSlots.findIndex((slot, index) => {
                const [slotTime, period] = slot.split(' ');
                const [slotHour, slotMin] = slotTime.split(':').map(Number);
                const slotHour24 = period === 'PM' && slotHour !== 12 ? slotHour + 12 : (period === 'AM' && slotHour === 12 ? 0 : slotHour);
                const currentSlotTime = new Date(now);
                currentSlotTime.setHours(slotHour24, slotMin, 0, 0);
                return currentSlotTime > now;
            });
        }
        
        // Get next slot
        const nextSlotIndex = (currentSlotIndex + 1) % timeSlots.length;
        const nextTime = timeSlots[nextSlotIndex];
        
        // Get the lineup for the current day (or next day if we've wrapped around)
        let targetDay = currentDay;
        if (nextSlotIndex === 0) {
            targetDay = (currentDay + 1) % 7;
        }
        
        const dayName = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][targetDay];
        
        if (this.weeklySlotsByDay && this.weeklySlotsByDay[dayName]) {
            const nextSlot = this.weeklySlotsByDay[dayName].find(slot => slot.time === nextTime);
            if (nextSlot) {
                let nextUpText = `${nextSlot.time} - ${nextSlot.program}`;
                
                // Add episode info if available
                if (["Dexter's Laboratory", "The Powerpuff Girls"].includes(nextSlot.program)) {
                    const episodeData = this.getEpisodeForDate(now, nextSlot.time, nextSlot.program);
                    if (nextSlot.program === "Dexter's Laboratory" || nextSlot.program === "The Powerpuff Girls") {
                        nextUpText += ` (S${episodeData.season.toString().padStart(2, '0')}E${episodeData.episode.toString().padStart(2, '0')})`;
                    }
                }
                
                return nextUpText;
            }
        }
        
        return `${nextTime} - OFF AIR`;
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
            
            // Update current block and next up
            const weeklySlot = this.getWeeklySlotForNow();
            if (this.currentBlockEl) {
                this.currentBlockEl.textContent = weeklySlot ? `${weeklySlot.time} - ${weeklySlot.program}` : 'OFF AIR';
            }
            if (this.nextUpEl) {
                this.nextUpEl.textContent = this.getNextUp();
            }
            
            // Update stream status for OFF AIR
            if (this.streamStatusEl) {
                let streamStatus = 'OFF AIR';
                if (weeklySlot?.program) {
                    streamStatus = `⏸️ SCHEDULED • ${weeklySlot.time}`;
                }
                this.streamStatusEl.textContent = streamStatus;
            }
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
        
        // Get current block information and update enhanced status
        const currentBlock = this.getCurrentBlockInfo();
        const weeklySlot = this.getWeeklySlotForNow();
        
        // Update current block
        if (this.currentBlockEl) {
            let blockText = 'LIVE';
            if (weeklySlot) {
                blockText = `${weeklySlot.time} - ${weeklySlot.program}`;
                if (currentBlock?.episode) {
                    blockText += ` • ${currentBlock.episode}`;
                }
            }
            this.currentBlockEl.textContent = blockText;
        }
        
        // Update next up
        if (this.nextUpEl) {
            this.nextUpEl.textContent = this.getNextUp();
        }
        
        // Update stream status with detailed information
        if (this.streamStatusEl) {
            let streamStatus = '📡 LIVE';
            if (currentBlock) {
                streamStatus += ` • ${currentBlock.time}`;
                if (currentBlock.episode) {
                    streamStatus += ` • ${currentBlock.episode}`;
                }
            }
            this.streamStatusEl.textContent = streamStatus;
        }
        
        // Update status with more context
        if (drift <= 2) {
            let statusText = `🔴 LIVE: ${currentTitle}`;
            if (currentBlock?.episode) {
                statusText += ` • ${currentBlock.episode}`;
            }
            this.updateStatus(statusText);
        }
    }
    
    startSyncInterval() {
        // Sync every 2 seconds to maintain schedule
        this.syncInterval = setInterval(() => {
            this.syncWithSchedule();
        }, 2000);
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
            
            // Update current block and next up for non-tuned viewers
            const weeklySlot = this.getWeeklySlotForNow();
            if (this.currentBlockEl) {
                this.currentBlockEl.textContent = weeklySlot ? `${weeklySlot.time} - ${weeklySlot.program}` : 'OFF AIR';
            }
            if (this.nextUpEl) {
                this.nextUpEl.textContent = this.getNextUp();
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

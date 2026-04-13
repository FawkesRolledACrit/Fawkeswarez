console.log('TV.JS LOADED v2.4 -', Date.now());

/**
 * Fawkesware TV - Proper Live Streaming Implementation
 * NO AUTOPLAY - EVER. Video element only created after explicit user interaction.
 */

class LiveStreamPlayer {
    constructor() {
        console.log('LiveStreamPlayer constructor v2.4');
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

        this.recentAdUrls = [];
        this.RECENT_AD_MEMORY = 30;
        
        // Schedule constants
        this.BLOCK_DURATION = 30 * 60 * 1000; // 30 minutes
        
        this.init();
    }

    ensureHlsScriptLoaded() {
        if (typeof Hls !== 'undefined') return Promise.resolve(true);
        if (this._hlsLoadPromise) return this._hlsLoadPromise;

        this._hlsLoadPromise = new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/hls.js/1.4.12/hls.min.js';
            script.async = true;
            script.onload = () => resolve(typeof Hls !== 'undefined');
            script.onerror = () => resolve(false);
            document.head.appendChild(script);
        });

        return this._hlsLoadPromise;
    }

    nowMs() {
        return this._wallClockBaseMs + (performance.now() - this._monoBaseMs);
    }
    
    async init() {
        console.log('Initializing LiveStreamPlayer');
        
        // Wait a tick to ensure DOM is ready
        await new Promise(resolve => setTimeout(resolve, 0));
        console.log('DOM ready, checking elements...');
        
        // NO video element creation here
        // NO autoplay prevention needed because there's no video
        
        // Load schedule data
        try {
            console.log('Loading schedule data...');
            await this.loadScheduleData();
            console.log('Schedule data loaded');
            this.updateStatus('Ready to tune in...');
            this.startScheduleUpdates();
            console.log('Schedule updates started');
        } catch (error) {
            console.error('Error loading schedule:', error);
            this.updateStatus(`Error loading schedule: ${error.message}`);
        }
        
        // Setup event listeners
        console.log('Setting up event listeners...');
        this.setupEventListeners();
        console.log('Initialization complete');
    }
    
    async loadScheduleData() {
        const [adsResponse, scheduleResponse, weeklyResponse] = await Promise.all([
            fetch('./ads.json', { cache: 'no-store' }),
            fetch('./schedule.json', { cache: 'no-store' }),
            fetch('./weekly-lineup-v2.json', { cache: 'no-store' })
                .catch(() => fetch('./weekly-lineup.json', { cache: 'no-store' }))
                .catch(() => null)
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
        // Convert the weekly template into time windows per day.
        // IMPORTANT: we do NOT force everything into 30-minute slots.
        // If weekly-lineup.json has 15-minute entries (e.g. 1:30 then 1:45),
        // those must remain 15-minute slots.
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
                const endMin = Math.max(cur.startMin, nextStart);
                slots.push({
                    startMin: cur.startMin,
                    endMin,
                    program: cur.program,
                    time: this.minutesToTime(cur.startMin)
                });
            }
            out[day] = slots;
        }
        return out;
    }

    getSlotDurationMs(weeklySlot) {
        const durationMin = Math.max(1, (weeklySlot?.endMin ?? 0) - (weeklySlot?.startMin ?? 0));
        return durationMin * 60 * 1000;
    }

    getSlotStartMsForNow(weeklySlot) {
        const now = new Date(this.nowMs());
        const slotStart = new Date(now);
        slotStart.setHours(0, 0, 0, 0);
        slotStart.setMinutes(weeklySlot.startMin);
        return slotStart.getTime();
    }

    getDayIndexFromName(dayName) {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        return days.indexOf(dayName);
    }

    getProgramOccurrencesForDay(program, dayName) {
        if (!this.weeklySlotsByDay || !dayName) return [];
        const slots = this.weeklySlotsByDay[dayName] || [];
        return slots
            .filter(s => s?.program === program)
            .map(s => s.startMin)
            .sort((a, b) => a - b);
    }

    getProgramWeeklyCount(program) {
        if (!this.weeklySlotsByDay || !program) return 0;
        let total = 0;
        for (const dayName of Object.keys(this.weeklySlotsByDay)) {
            total += this.getProgramOccurrencesForDay(program, dayName).length;
        }
        return total;
    }

    getProgramOccurrenceIndex(program, weeklySlot, slotStartMs, scheduleStartMs) {
        if (!program || !weeklySlot || !Number.isFinite(slotStartMs) || !Number.isFinite(scheduleStartMs)) return 0;
        if (!this.weeklySlotsByDay) return 0;

        // Count how many times this program's slot has occurred since scheduleStartMs (exclusive),
        // up to this slot (exclusive). This makes episode progression chronological per airing.
        const slotStart = new Date(slotStartMs);
        const slotDayStart = new Date(slotStart);
        slotDayStart.setHours(0, 0, 0, 0);

        const scheduleStart = new Date(scheduleStartMs);
        const scheduleDayStart = new Date(scheduleStart);
        scheduleDayStart.setHours(0, 0, 0, 0);

        const MS_PER_DAY = 24 * 60 * 60 * 1000;
        const daysDiff = Math.floor((slotDayStart.getTime() - scheduleDayStart.getTime()) / MS_PER_DAY);
        if (daysDiff < 0) return 0;

        const weeklyCount = this.getProgramWeeklyCount(program);
        if (weeklyCount <= 0) return 0;

        // Whole weeks between the anchor day and current day.
        const wholeWeeks = Math.floor(daysDiff / 7);
        let total = wholeWeeks * weeklyCount;

        // Remaining days in the partial week.
        const remDays = daysDiff % 7;
        for (let i = 0; i < remDays; i++) {
            const d = new Date(scheduleDayStart.getTime() + ((wholeWeeks * 7 + i) * MS_PER_DAY));
            const dayName = this.getDayName(d);
            total += this.getProgramOccurrencesForDay(program, dayName).length;
        }

        // Current day: count occurrences strictly before this slot start.
        const currentDayName = this.getDayName(slotStart);
        const starts = this.getProgramOccurrencesForDay(program, currentDayName);
        for (const sMin of starts) {
            if (sMin < weeklySlot.startMin) total += 1;
        }

        return total;
    }

    minutesToTime(minutes) {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        const period = hours >= 12 ? 'PM' : 'AM';
        const displayHours = hours === 0 ? 12 : (hours > 12 ? hours - 12 : hours);
        return `${displayHours}:${mins.toString().padStart(2, '0')} ${period}`;
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
                return { ...s, dayName, mins, time: this.minutesToTime(s.startMin) };
            }
        }
        const slotStartMin = Math.floor(mins / 30) * 30;
        return { program: null, startMin: slotStartMin, endMin: slotStartMin + 30, dayName, mins, time: this.minutesToTime(slotStartMin) };
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
                const cacheBust = Date.now() + '_' + Math.random().toString(36).substr(2, 9);
                window.location.href = './guide-v4.html?t=' + cacheBust;
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
        console.log('Tune in called');
        if (this.hasTunedIn) {
            console.log('Already tuned in');
            return;
        }
        
        this.hasTunedIn = true;
        this.tuneInTime = this.nowMs(); // Record when user tuned in
        this.tuneBtn.textContent = '📡 TUNED';
        this.updateStatus('Tuning in...');

        // We have a user gesture now, so default to audio ON.
        // If the browser blocks unmuted playback, startPlayback() will fall back to muted.
        this.desiredMuted = false;

        // Create video element and start playback
        this.createVideoElement();
        this.startSyncInterval();
        this.syncWithSchedule();
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
                if (this.video.ended) return;
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

        if (isHLS && typeof Hls === 'undefined') {
            const loaded = await this.ensureHlsScriptLoaded();
            console.log('Hls.js loaded dynamically:', loaded);
        }

        if (isHLS && typeof Hls !== 'undefined' && Hls.isSupported()) {
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
            if (isHLS) {
                this.updateStatus('HLS not supported in this browser (and HLS.js is blocked).');
                return;
            }
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

        // Weekly lineup determines what show is on NOW.
        const weeklySlot = this.getWeeklySlotForNow();
        const program = weeklySlot?.program;

        if (!program) {
            return { currentUrl: null, currentTime: 0, currentTitle: 'OFF AIR', queue: [] };
        }

        const slotStartMs = this.getSlotStartMsForNow(weeklySlot);
        const blockElapsedMs = this.nowMs() - slotStartMs;

        const queue = this.buildQueue(weeklySlot, slotStartMs);
        const position = this.getQueuePosition(blockElapsedMs, queue);
        const currentItem = queue[position.index] || null;

        return {
            currentUrl: currentItem?.url || null,
            currentTime: position.time,
            currentTitle: currentItem?.title || program,
            currentItem,
            queue
        };
    }

    buildQueue(weeklySlot, slotStartMs) {
        const queue = [];

        const blocks = this.schedule?.blocks || [];
        if (!blocks.length) return queue;

        const program = weeklySlot?.program;
        if (!program) return queue;

        const programSearchTerms = this.getProgramSearchTerms(program);
        const programBlocks = blocks.filter(block => {
            const blockTitle = String(block.title || '').toLowerCase();
            return !block.blockType && programSearchTerms.some(term => blockTitle.includes(String(term).toLowerCase()));
        });

        if (!programBlocks.length) return queue;

        // Episode progression based on how many times the program appears in weekly lineup since schedule start.
        const startDate = this.schedule?.startDate;
        const scheduleStartMs = startDate ? Date.parse(String(startDate) + 'T00:00:00') : NaN;
        const occ = this.getProgramOccurrenceIndex(program, weeklySlot, slotStartMs, scheduleStartMs);
        const episodeIndex = ((occ % programBlocks.length) + programBlocks.length) % programBlocks.length;
        const block = programBlocks[episodeIndex];

        let usedTime = 0;
        for (const event of block.events || []) {
            if (event.type === 'segment') {
                queue.push({
                    type: 'segment',
                    url: event.url,
                    title: event.title,
                    duration: event.durationSeconds || 600
                });
                usedTime += event.durationSeconds || 600;
            } else if (event.type === 'adbreak') {
                const remaining = (block.slotSeconds || 0) - usedTime;
                if (event.targetSeconds === 'auto' && remaining <= 0) {
                    continue;
                }
                const targetSeconds = event.targetSeconds === 'auto'
                    ? remaining
                    : event.targetSeconds;

                const seedBase = Math.floor((slotStartMs || this.nowMs()) / 1000);
                const ads = this.fillAdBreak(
                    targetSeconds,
                    event.toleranceSeconds || 3,
                    seedBase + queue.length
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
        const usedUrls = new Set();
        let total = 0;
        
        // Simple seeded random for consistency
        const rng = this.seededRandom(seed);

        const recentSet = new Set(this.recentAdUrls);
        const fresh = validAds.filter(ad => ad?.url && !recentSet.has(ad.url));
        const stale = validAds.filter(ad => ad?.url && recentSet.has(ad.url));

        const shuffleWithSeed = (arr) => {
            const withScore = arr.map(ad => ({ ad, score: rng() }));
            withScore.sort((a, b) => a.score - b.score);
            return withScore.map(x => x.ad);
        };

        const shuffled = [...shuffleWithSeed(fresh), ...shuffleWithSeed(stale)];
        
        for (const ad of shuffled) {
            if (!ad?.url) continue;
            if (usedUrls.has(ad.url)) continue;
            if (total + ad.durationSeconds <= targetSeconds + tolerance) {
                selected.push({
                    type: 'ad',
                    url: ad.url,
                    title: 'Commercial',
                    duration: ad.durationSeconds
                });
                usedUrls.add(ad.url);
                total += ad.durationSeconds;
                
                if (total >= targetSeconds - tolerance) break;
            }
        }

        if (selected.length) {
            this.recentAdUrls.push(...selected.map(x => x.url));
            if (this.recentAdUrls.length > this.RECENT_AD_MEMORY) {
                this.recentAdUrls = this.recentAdUrls.slice(-this.RECENT_AD_MEMORY);
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
        if (!queue?.length) {
            return { index: 0, time: 0 };
        }
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
    
    getBlockName(hour) {
        // Cartoon Network-style block names
        if (hour >= 6 && hour < 10) {
            return "MORNING MAYHEM"; // 6am-10am
        } else if (hour >= 10 && hour < 14) {
            return "MIDDAY MADNESS"; // 10am-2pm
        } else if (hour >= 14 && hour < 18) {
            return "AFTERNOON ACTION"; // 2pm-6pm
        } else if (hour >= 18 && hour < 22) {
            return "PRIME TIME POWER"; // 6pm-10pm
        } else {
            return "ADULT SWIM"; // 10pm-6am
        }
    }

    getCurrentBlockInfo() {
        const weeklySlot = this.getWeeklySlotForNow();
        if (!weeklySlot) return null;

        const nowMs = this.nowMs();
        const blockName = this.getBlockName(new Date(nowMs).getHours());
        const slotStartMs = this.getSlotStartMsForNow(weeklySlot);
        const slotElapsedSeconds = Math.max(0, (nowMs - slotStartMs) / 1000);

        return {
            time: weeklySlot.time,
            program: weeklySlot.program,
            blockName,
            slotElapsedSeconds
        };
    }
    
    getEpisodeForDate(date, timeStr, program) {
        // Parse the time to get total slots since anchor date.
        // For Space Ghost + Aqua Teen, weekly-lineup can contain 15-minute slots.
        // If we used 30-minute math here, 1:30 and 1:45 would show the same episode.
        const m = String(timeStr || '').trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
        if (!m) return { episode: 1, season: 1 };
        let hour = parseInt(m[1], 10);
        const minute = parseInt(m[2], 10);
        const ampm = m[3].toUpperCase();
        if (hour === 12) hour = 0;
        if (ampm === 'PM') hour += 12;

        const slotDate = new Date(date);
        slotDate.setHours(hour, minute, 0, 0);
        
        const anchorDate = new Date('2026-04-01T00:00:00');
        const slotMinutes = (["Space Ghost Coast to Coast", "Aqua Teen Hunger Force"].includes(program)) ? 15 : 30;
        const totalSlots = Math.floor((slotDate - anchorDate) / (slotMinutes * 60 * 1000));
        
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
            "Foster's Home": ["foster", "foster's home", "fosters home"],
            "Cow and Chicken": ["cow", "cow and chicken"],
            "I Am Weasel": ["weasel", "i am weasel"],
            "Tom and Jerry": ["tom", "tom and jerry"],
            "The Venture Bros": ["venture", "venture bros"],
            "Harvey Birdman, Attorney at Law": ["harvey", "harvey birdman"],
            "Tom Goes to the Mayor": ["tom goes", "tom goes to the mayor"],
            "Brak Show": ["brak", "brak show"],
            "Home Movies": ["home", "home movies"],
            "Aqua Teen Hunger Force": ["aqua", "aqua teen", "athf"],
            "Sealab 2021": ["sealab", "sealab 2021"],
            "Boondocks Marathon": ["boondocks", "the boondocks", "boondocks marathon"],
            "King of the Hill": ["king", "king of the hill", "koth"],
            "Family Guy": ["family", "family guy", "fg"],
            "12 Oz. Mouse": ["12 oz", "12 oz mouse", "oz mouse"],
            "Codename: Kids Next Door": ["codename", "kids next door", "knd", "codename kids next door"],
            "Cowboy Bebop": ["cowboy", "cowboy bebop", "bebop"],
            "Movie Night": ["movie night"],
            "Movie Preshow": ["movie preshow"],
            "TBD": ["tbd"],
            "Weekend Boon": ["weekend boon"]
        };
        
        return searchTerms[program] || [program.toLowerCase()];
    }
    
    getNextUp() {
        const weeklySlot = this.getWeeklySlotForNow();
        if (!weeklySlot || !this.weeklySlotsByDay) return 'TBD';

        const now = new Date(this.nowMs());
        const dayName = this.getDayName(now);
        const slots = this.weeklySlotsByDay[dayName] || [];
        if (!slots.length) return 'TBD';

        const idx = slots.findIndex(s => s.startMin === weeklySlot.startMin && s.endMin === weeklySlot.endMin && s.program === weeklySlot.program);
        let next = null;

        if (idx >= 0 && idx + 1 < slots.length) {
            next = slots[idx + 1];
        } else {
            const tomorrow = new Date(now);
            tomorrow.setDate(now.getDate() + 1);
            const nextDayName = this.getDayName(tomorrow);
            const nextDaySlots = this.weeklySlotsByDay[nextDayName] || [];
            next = nextDaySlots[0] || null;
        }

        if (!next) return 'TBD';
        return `${next.time} - ${next.program}`;
    }
    
    startSyncInterval() {
        // Sync every 2 seconds to maintain schedule
        this.syncInterval = setInterval(() => {
            this.syncWithSchedule();
        }, 2000);
    }
    
    syncWithSchedule() {
        if (!this.hasTunedIn || !this.video) return;
        
        const { currentUrl, currentTime, currentTitle, currentItem } = this.getCurrentSchedulePosition();
        const expectedTime = currentTime;
        const actualTime = this.video.currentTime;

        // Display schedule time as "time into current weekly slot"
        const weeklySlot = this.getWeeklySlotForNow();
        const slotStartMs = weeklySlot ? this.getSlotStartMsForNow(weeklySlot) : this.nowMs();
        const blockElapsedSeconds = Math.max(0, (this.nowMs() - slotStartMs) / 1000);

        // OFF AIR / no content assigned
        if (!currentUrl) {
            if (this.currentItemUrl !== null) {
                console.log('Switching to OFF AIR');
                this.currentItemUrl = null;
                this.goOffAir(currentTitle || 'OFF AIR');
            }
            
            // Update status to show what's actually happening
            if (currentTitle && currentTitle.includes('(No Video Yet)')) {
                this.updateStatus(`📺 ${currentTitle}`);
            } else {
                this.updateStatus(`📴 OFF AIR`);
            }
            
            this.currentProgramEl.textContent = currentTitle;
            this.scheduleTimeEl.textContent = this.formatTime(blockElapsedSeconds);
            
            // Use unified status display
            this.updateStatusDisplay();
            return;
        }

        // Check if we need to switch videos
        if (currentUrl !== this.currentItemUrl) {
            // If something is already playing and hasn't ended, don't cut it off early.
            // We'll naturally resync on the next interval after it ends (or if we fall OFF AIR).
            if (this.currentItemUrl && !this.video.paused && !this.video.ended) {
                const remaining = (Number.isFinite(this.video.duration) ? (this.video.duration - actualTime) : null);
                if (remaining === null || remaining > 0.25) {
                    return;
                }
            }
            console.log('Switching to new video:', currentUrl);
            this.currentItemUrl = currentUrl;
            this.currentItemType = currentItem?.type || null;
            this.currentItemPlannedDuration = currentItem?.duration || null;
            this.loadVideo(currentUrl, expectedTime, currentTitle).then(() => {
                this.startPlayback();
            });
            return;
        }

        // Correct drift if significant (but not during playback)
        const drift = Math.abs(actualTime - expectedTime);
        // Avoid seeking during ads; it can cause the player to jump within/over commercials.
        if (drift > 5 && !this.video.paused && this.currentItemType !== 'ad') {
            console.log('Correcting drift:', { actualTime, expectedTime, drift });
            try {
                this.video.currentTime = expectedTime;
            } catch (e) {
                // Ignore seek errors
            }
        }
        
        // Use unified status display
        this.updateStatusDisplay();
        
        // Update status with more context
        if (drift <= 2) {
            let statusText = `🔴 LIVE: ${currentTitle}`;
            this.updateStatus(statusText);
        }
    }
    
    startScheduleUpdates() {
        console.log('Starting schedule updates');
        // Update schedule info every 2 seconds to match sync interval
        this.scheduleUpdateInterval = setInterval(() => {
            this.updateStatusDisplay();
        }, 2000);
    }

    toggleMute() {
        // Allow toggling label before tune-in (preference), but apply only when video exists.
        this.desiredMuted = !this.desiredMuted;
        if (this.video) {
            this.video.muted = !!this.desiredMuted;
            this.video.volume = 1;
        }
        if (this.muteBtn) {
            this.muteBtn.textContent = this.desiredMuted ? '🔊 UNMUTE' : '🔇 MUTE';
        }
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

    getStreamUptime() {
        if (!this.hasTunedIn) return '0:00';

        const uptimeMs = this.nowMs() - this.tuneInTime;
        const uptimeSeconds = Math.floor(uptimeMs / 1000);
        const hours = Math.floor(uptimeSeconds / 3600);
        const minutes = Math.floor((uptimeSeconds % 3600) / 60);

        if (hours > 0) {
            return `${hours}:${String(minutes).padStart(2, '0')}`;
        }
        return `0:${String(minutes).padStart(2, '0')}`;
    }
    
    updateStatusDisplay() {
        const nowMs = this.nowMs();
        const weeklySlot = this.getWeeklySlotForNow();
        const currentBlock = this.getCurrentBlockInfo();
        const blockName = this.getBlockName(new Date(nowMs).getHours());
        
        // Update current block - CONSISTENT FORMAT
        if (this.currentBlockEl) {
            if (weeklySlot && currentBlock?.blockName) {
                this.currentBlockEl.textContent = `${currentBlock.blockName} • ${weeklySlot.time} - ${weeklySlot.program}`;
            } else {
                this.currentBlockEl.textContent = 'OFF AIR';
            }
        }
        
        // Update current program
        if (this.currentProgramEl) {
            const { currentTitle } = this.getCurrentSchedulePosition();
            this.currentProgramEl.textContent = currentTitle || 'OFF AIR';
        }
        
        // Update schedule time
        if (this.scheduleTimeEl) {
            const s = currentBlock?.slotElapsedSeconds;
            this.scheduleTimeEl.textContent = this.formatTime(s);
        }
        
        // Update next up
        if (this.nextUpEl) {
            this.nextUpEl.textContent = this.getNextUp();
        }
        
        // Update stream status with REAL data
        if (this.streamStatusEl) {
            const now = new Date();
            const localTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
            
            if (this.hasTunedIn) {
                // USER HAS TUNED IN - SHOW AS LIVE
                const uptime = this.getStreamUptime();
                
                // Check if actually playing video or just showing schedule
                const { currentUrl } = this.getCurrentSchedulePosition();
                if (currentUrl && this.video && !this.video.paused) {
                    this.streamStatusEl.textContent = `🔴 LIVE • ${localTime} • Uptime: ${uptime}`;
                } else {
                    this.streamStatusEl.textContent = `🟡 SCHEDULED • ${localTime} • Uptime: ${uptime}`;
                }
            } else {
                // NOT TUNED IN
                this.streamStatusEl.textContent = `📴 OFF AIR • ${localTime}`;
            }
        }
    }
}

// Initialize immediately or when DOM is ready
function initializePlayer() {
    console.log('Initializing player - DOM ready:', document.readyState);
    try {
        const player = new LiveStreamPlayer();
        console.log('LiveStreamPlayer created successfully');
    } catch (error) {
        console.error('Error creating LiveStreamPlayer:', error);
    }
}

if (document.readyState === 'loading') {
    console.log('DOM still loading, waiting for DOMContentLoaded...');
    document.addEventListener('DOMContentLoaded', initializePlayer);
} else {
    console.log('DOM already loaded, initializing immediately...');
    initializePlayer();
}

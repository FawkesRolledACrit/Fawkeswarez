/**
 * Fawkesware TV - Proper Live Streaming Implementation
 * NO AUTOPLAY - EVER. Video element only created after explicit user interaction.
 */

class LiveStreamPlayer {
    constructor() {
        console.log('LiveStreamPlayer constructor');
        this.container = document.getElementById('tv-container');
        this.video = null;
        this.hls = null;
        this.tuneBtn = document.getElementById('tune-btn');
        this.muteBtn = document.getElementById('mute-btn');
        this.statusText = document.getElementById('status-text');
        this.currentProgramEl = document.getElementById('current-program');
        this.scheduleTimeEl = document.getElementById('schedule-time');
        
        console.log('Elements found:', {
            container: !!this.container,
            tuneBtn: !!this.tuneBtn,
            muteBtn: !!this.muteBtn,
            statusText: !!this.statusText,
            currentProgramEl: !!this.currentProgramEl,
            scheduleTimeEl: !!this.scheduleTimeEl
        });
        
        this.hasTunedIn = false;
        this.ads = null;
        this.schedule = null;
        this.syncInterval = null;
        
        // Schedule constants
        this.BLOCK_DURATION = 30 * 60 * 1000; // 30 minutes
        
        this.init();
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
        const [adsResponse, scheduleResponse] = await Promise.all([
            fetch('./ads.json', { cache: 'no-store' }),
            fetch('./schedule.json', { cache: 'no-store' })
        ]);
        
        if (!adsResponse.ok || !scheduleResponse.ok) {
            throw new Error('Failed to load schedule data');
        }
        
        this.ads = await adsResponse.json();
        this.schedule = await scheduleResponse.json();
    }
    
    setupEventListeners() {
        console.log('Setting up event listeners');
        console.log('Tune button:', this.tuneBtn);
        console.log('Mute button:', this.muteBtn);
        
        if (this.tuneBtn) {
            this.tuneBtn.addEventListener('click', () => this.tuneIn());
            console.log('Tune button listener added');
        }
        
        if (this.muteBtn) {
            this.muteBtn.addEventListener('click', () => this.toggleMute());
            console.log('Mute button listener added');
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
        
        // Create video element ONLY NOW
        this.createVideoElement();
        
        // Get current schedule position
        const { currentUrl, currentTime, currentTitle } = this.getCurrentSchedulePosition();
        console.log('Schedule position:', { currentUrl, currentTime, currentTitle });
        
        if (currentUrl && currentUrl !== 'REPLACE_ME') {
            await this.loadVideo(currentUrl, currentTime, currentTitle);
            await this.startPlayback();
        } else {
            this.updateStatus('No valid video URL in schedule');
        }
        
        // Start sync interval
        this.startSyncInterval();
    }
    
    createVideoElement() {
        console.log('Creating video element');
        
        // Create video element dynamically
        this.video = document.createElement('video');
        this.video.id = 'tv-player';
        this.video.preload = 'none';
        this.video.playsInline = true;
        this.video.muted = true; // Start muted
        this.video.controls = false; // No controls
        
        // Style to fill container
        this.video.style.cssText = `
            width: 100%;
            height: 100%;
            object-fit: cover;
            background: #000;
            display: block;
        `;
        
        console.log('Video element created:', this.video);
        console.log('Container:', this.container);
        
        // Add to container
        this.container.appendChild(this.video);
        console.log('Video appended to container');
        
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
        console.log('loadVideo called:', { url, seekTime, title });
        this.updateStatus(`Loading: ${title}`);
        
        if (!this.video) {
            console.error('Video element not found!');
            this.updateStatus('Error: Video element not found');
            return;
        }
        
        // Clean up previous HLS instance
        if (this.hls) {
            this.hls.destroy();
            this.hls = null;
        }
        
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
                    console.log('HLS manifest parsed');
                    if (seekTime > 0) {
                        this.video.currentTime = seekTime;
                    }
                    resolve();
                });
            });
        } else if (this.video.canPlayType('application/vnd.apple.mpegurl')) {
            // Safari native HLS
            console.log('Using Safari native HLS');
            this.video.src = url;
            
            return new Promise((resolve) => {
                this.video.addEventListener('loadedmetadata', () => {
                    console.log('Metadata loaded (Safari HLS)');
                    if (seekTime > 0) {
                        this.video.currentTime = seekTime;
                    }
                    resolve();
                }, { once: true });
                
                this.video.addEventListener('error', (e) => {
                    console.error('Video error (Safari HLS):', e);
                    this.updateStatus('Video error loading HLS');
                }, { once: true });
            });
        } else {
            // Direct MP4/WebM
            console.log('Using direct MP4/WebM');
            this.video.src = url;
            
            return new Promise((resolve) => {
                this.video.addEventListener('loadedmetadata', () => {
                    console.log('Metadata loaded (MP4/WebM)');
                    if (seekTime > 0) {
                        this.video.currentTime = seekTime;
                    }
                    resolve();
                }, { once: true });
                
                this.video.addEventListener('error', (e) => {
                    console.error('Video error (MP4/WebM):', e);
                    this.updateStatus('Video error loading file');
                }, { once: true });
            });
        }
    }
    
    async startPlayback() {
        try {
            await this.video.play();
            this.updateStatus('Broadcast active');
        } catch (error) {
            this.updateStatus(`Playback failed: ${error.message}`);
        }
    }
    
    getCurrentSchedulePosition() {
        if (!this.schedule?.blocks?.length) {
            return { currentUrl: null, currentTime: 0, currentTitle: 'No Schedule' };
        }
        
        const now = Date.now();
        const blockIndex = Math.floor(now / this.BLOCK_DURATION);
        const blockStart = blockIndex * this.BLOCK_DURATION;
        const blockElapsed = now - blockStart;
        
        // Build queue for current block
        const queue = this.buildQueue(blockIndex);
        const position = this.getQueuePosition(blockElapsed, queue);
        
        return {
            currentUrl: queue[position.index]?.url || null,
            currentTime: position.time,
            currentTitle: queue[position.index]?.title || 'Unknown',
            queue: queue
        };
    }
    
    buildQueue(blockIndex) {
        const queue = [];
        const block = this.schedule.blocks[0]; // Use first block for now
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
                const ads = this.fillAdBreak(
                    event.targetSeconds === 'auto' 
                        ? Math.max(60, block.slotSeconds - usedTime)
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
        
        const { currentTime, currentTitle } = this.getCurrentSchedulePosition();
        const expectedTime = currentTime;
        const actualTime = this.video.currentTime;
        
        // Update UI
        this.currentProgramEl.textContent = currentTitle;
        this.scheduleTimeEl.textContent = this.formatTime(expectedTime);
        
        // Correct drift if significant
        const drift = Math.abs(actualTime - expectedTime);
        if (drift > 3) {
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
            console.log('Schedule position:', position);
            
            if (this.currentProgramEl) {
                this.currentProgramEl.textContent = position.currentTitle;
            } else {
                console.log('currentProgramEl not found');
            }
            
            const now = Date.now();
            const blockElapsed = now % this.BLOCK_DURATION;
            const timeStr = this.formatTime(blockElapsed / 1000);
            
            if (this.scheduleTimeEl) {
                this.scheduleTimeEl.textContent = timeStr;
            } else {
                console.log('scheduleTimeEl not found');
            }
        }, 1000);
    }
    
    toggleMute() {
        if (!this.video) return;
        
        this.video.muted = !this.video.muted;
        this.muteBtn.textContent = this.video.muted ? '🔊 UNMUTE' : '🔇 MUTE';
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

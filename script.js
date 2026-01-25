// Y2K GAME DEV PORTFOLIO - INTERACTIVE JAVASCRIPT

// Global variables
const COUNTER_NAMESPACE = 'fawkeswaregames-portfolio-x7s9';
const COUNTER_KEY = 'visitors';
const COUNTER_INIT_URL = `https://api.countapi.xyz/create?namespace=${COUNTER_NAMESPACE}&key=${COUNTER_KEY}&value=0`;
const COUNTER_HIT_URL = `https://api.countapi.xyz/hit/${COUNTER_NAMESPACE}/${COUNTER_KEY}`;
let currentSection = 'home';
let hitCounter = 0;
let connectedDrives = [];
let gameData = {
    alpha: {
        title: 'Esoteric Order of Delivery',
        subtitle: 'Atmospheric, anxiety-based horror delivery sim',
        overview: 'Kayla runs midnight pizza routes in a failing van while wrestling with an overactive imagination and crushing anxiety.',
        hook: 'Keep the busted vehicle alive, deliver every pie in under 30 minutes, and stop Kayla from spiraling long enough to finish the shift.',
        pillars: [
            {
                title: 'Ambient dread over jump scares',
                description: 'Lovecraftian tension through weather, lighting, and audio — the horror feels psychological, never literal.'
            },
            {
                title: 'Dual-management gameplay',
                description: 'Repair, refuel, and bandage the van while micromanaging Kayla’s anxiety before it overwhelms her.'
            },
            {
                title: 'Arcade-era progression',
                description: 'No true fail state. Chase high scores, achievements, and side stories like a PS2 oddity you rented in 2003.'
            }
        ],
        highlights: [
            'Night routes stitch together neon storefronts, back alleys, and roadside shops where you buy repair gear and coping tools.',
            'Vehicle wear, weather, and darkness dynamically influence handling, repair frequency, and Kayla’s anxiety curve.',
            'Side quests, worldbuilding vignettes, and mini activities stretch each shift far beyond A-to-B deliveries.'
        ],
        loops: [
            {
                title: 'Van upkeep loop',
                bullets: [
                    'Monitor fuel, radiator temp, lighting, and overall mechanical health mid-route.',
                    'Stop at garages and roadside vendors for duct tape, bulbs, coolant, and improvised fixes.',
                    'Step out to repair critical systems before they strand you in hostile darkness.'
                ]
            },
            {
                title: 'Kayla anxiety loop',
                bullets: [
                    'Every second away from the van, distance from safety, and lack of light stacks anxiety.',
                    'Unexplained roadside events and environmental oddities spike stress — maybe the monsters are in her head.',
                    'Stabilize her with disposable vapes, hot tea, and calming lofi stations on the radio.'
                ]
            },
            {
                title: 'Delivery cadence',
                bullets: [
                    'Each order demands arrival in under 30 minutes to keep streaks alive.',
                    'Route choices juggle shortcuts, vehicle strain, and Kayla’s mental state.',
                    'Score multipliers and combo chains feed achievements and long-term progression.'
                ]
            }
        ],
        calmTools: ['Disposable vapes', 'Thermos of calming tea', 'Lofi / ambient radio playlists'],
        anxietyFactors: [
            'Time spent outside the van',
            'Distance from perceived safety',
            'Total darkness or rolling blackouts',
            'Odd roadside occurrences that may or may not be real',
            'Weather spikes and mechanical breakdowns'
        ],
        inspirations: {
            driving: ['Easy Delivery Co.', 'Jalopy', 'Crazy Taxi', 'The Simpsons: Hit & Run', 'Early 3D GTA'],
            horror: ['Lovecraftian fiction about self-made monsters', 'Psychological horror focused on anxiety and obsession']
        },
        development: {
            progress: '35%',
            status: 'Solo dev · 4 months in',
            release: 'TBA',
            platforms: ['PC (target)']
        },
        deliveryWindow: '30 minutes or less per order',
        noFailNote: 'There is no traditional fail state — the “end game” lives in perfect runs, achievements, and unraveling side stories.'
    },
    silentroad: {
        title: 'The Silent Road',
        subtitle: 'Dark fantasy tabletop RPG',
        overview: 'Players take on the role of Gloomstalkers—travelers who navigate a world steeped in whispers, omens, and the mysterious Penumbral Arts.',
        hook: 'Chart your Path, master Penumbral Arts, and survive the Gloom in a narrative-driven RPG where every choice shapes your journey.',
        pillars: [
            {
                title: 'Path-based character system',
                description: 'Choose from five distinct Paths, each with a major skill and customizable Penumbral Arts, defining your approach to the world.'
            },
            {
                title: 'Penumbral Arts magic system',
                description: 'Master four mystical arts—Warfare, Observation, Social, Adaptability, Reverence—each with unique abilities that progress with your Rank.'
            },
            {
                title: 'Narrative-first conflict',
                description: 'Combat uses Wounds and Ranks rather than hit points, emphasizing storytelling and tactical decisions over attrition.'
            }
        ],
        highlights: [
            'Five unique Paths: Soiled Hands, Muted Sibilance, Sanguine Boot, Tranquil Countenance, and Penetrating Iris.',
            'Dynamic ability progression system where powers evolve as you advance in Rank (from Rank 5 to Rank 1).',
            'Gloomtide Surge Points and Conviction mechanics reward strategic play and character moments.',
            'Armament system with melee and ranged specializations, each with distinct tactical abilities.',
            'Character creator with integrated rulebook viewer for seamless play experience.'
        ],
        loops: [
            {
                title: 'Character progression loop',
                bullets: [
                    'Advance through Ranks from 5 to 1, gaining enhanced abilities and higher Wound thresholds.',
                    'Choose and develop Penumbral Arts alongside your Path\'s major skill.',
                    'Acquire new abilities and improve existing ones through experience and narrative milestones.'
                ]
            },
            {
                title: 'Conflict resolution loop',
                bullets: [
                    'Engage in tactical Conflicts using Action Dice and skill checks.',
                    'Manage Wounds and utilize Gloomtide Surge Points for dramatic moments.',
                    'Leverage Path-specific abilities and Penumbral Arts to overcome challenges.'
                ]
            },
            {
                title: 'Narrative exploration loop',
                bullets: [
                    'Navigate the world as a Gloomstalker, uncovering secrets and facing supernatural threats.',
                    'Interact with the environment through Observation, Social interaction, and Adaptability.',
                    'Shape the story through choices and character development.'
                ]
            }
        ],
        mechanics: [
            'Rank-based progression (5 to 1) with ability scaling',
            'Wound system instead of traditional hit points',
            'Action Dice pool for task resolution',
            'Gloomtide Surge Points for special abilities',
            'Conviction points for narrative influence',
            'Penumbral Arts: Warfare, Observation, Social, Adaptability, Reverence'
        ],
        inspirations: {
            narrative: ['Dark fantasy literature', 'Gothic horror', 'Mythic journeys', 'Supernatural mysteries'],
            mechanical: ['Narrative-focused RPGs', 'Tactical storytelling games', 'Character-driven systems']
        },
        development: {
            progress: '100%',
            status: 'Alpha Release · Complete and playable',
            release: 'Available Now',
            platforms: ['Web-based character creator', 'Digital rulebook']
        },
        features: [
            'Fully playable alpha with complete ruleset',
            'Interactive character creator with integrated rulebook',
            'Five distinct character Paths with unique abilities',
            'Comprehensive ability and progression systems',
            'Ready for playtesting and group sessions'
        ],
        note: 'Currently on hiatus for E.O.D. development but fully playable and ready for playtesting.'
    }
};

// Initialize the website
document.addEventListener('DOMContentLoaded', function() {
    initializeWebsite();
    startAnimations();
    updateHitCounter();
    loadSavedData();
});

// Website initialization
function initializeWebsite() {
    console.log('🎮 GAME DEV PORTFOLIO INITIALIZED 🎮');
    
    // Add keyboard navigation
    document.addEventListener('keydown', handleKeyPress);
    
    // Add mouse trail effect
    createMouseTrail();
    
    // Initialize progress bars
    animateProgressBars();
    
    // Add sound effects (if needed)
    initializeSoundEffects();
}

// Section navigation
function showSection(sectionId) {
    // Hide all sections
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => {
        section.classList.remove('active');
    });
    
    // Show selected section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
        currentSection = sectionId;
        
        // Add entrance animation
        targetSection.style.animation = 'none';
        setTimeout(() => {
            targetSection.style.animation = 'fadeIn 0.5s';
        }, 10);
        
        // Update active nav button
        updateNavButtons(sectionId);
        
        // Section-specific initialization
        initializeSection(sectionId);
    }
    
    // Play navigation sound effect
    playSound('navigate');
}

// Update navigation buttons
function updateNavButtons(activeSection) {
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(btn => {
        btn.style.background = 'linear-gradient(45deg, #FF00FF, #00FFFF)';
        btn.style.transform = 'scale(1)';
    });
    
    // Highlight active button
    const activeBtn = Array.from(navButtons).find(btn => 
        btn.textContent.toLowerCase().includes(activeSection)
    );
    if (activeBtn) {
        activeBtn.style.background = 'linear-gradient(45deg, #00FFFF, #FFFF00)';
        activeBtn.style.transform = 'scale(1.1)';
    }
}

// Initialize section-specific features
function initializeSection(sectionId) {
    switch(sectionId) {
        case 'home':
            animateWelcomeBox();
            break;
        case 'games':
            animateGameCards();
            break;
        case 'progress':
            animateProgressBars();
            break;
        case 'storage':
            updateStorageStats();
            break;
        case 'about':
            animateProfileCard();
            break;
    }
}

// Keyboard navigation
function handleKeyPress(event) {
    const key = event.key.toLowerCase();
    
    // Number keys for navigation
    if (key >= '1' && key <= '5') {
        const sections = ['home', 'games', 'progress', 'storage', 'about'];
        const index = parseInt(key) - 1;
        if (sections[index]) {
            showSection(sections[index]);
        }
    }
    
    // Arrow key navigation
    if (key === 'arrowleft' || key === 'arrowright') {
        const sections = ['home', 'games', 'progress', 'storage', 'about'];
        const currentIndex = sections.indexOf(currentSection);
        let newIndex;
        
        if (key === 'arrowleft') {
            newIndex = currentIndex > 0 ? currentIndex - 1 : sections.length - 1;
        } else {
            newIndex = currentIndex < sections.length - 1 ? currentIndex + 1 : 0;
        }
        
        showSection(sections[newIndex]);
    }
    
    // ESC to close modal
    if (key === 'escape') {
        closeModal();
    }
}

// Game details modal
function viewGame(gameId) {
    const game = gameData[gameId];
    if (!game) return;

    const modal = document.getElementById('game-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');

    const pillarsMarkup = (game.pillars || []).map(pillar => `
        <div class="pillar-card">
            <h4>${pillar.title}</h4>
            <p>${pillar.description}</p>
        </div>
    `).join('');

    const loopsMarkup = (game.loops || []).map(loop => `
        <div class="system-card">
            <h5>${loop.title}</h5>
            <ul>
                ${loop.bullets.map(point => `<li>${point}</li>`).join('')}
            </ul>
        </div>
    `).join('');

    const calmToolsMarkup = (game.calmTools || []).map(tool => `<span class="chip">${tool}</span>`).join('');
    const anxietyMarkup = (game.anxietyFactors || []).map(factor => `<li>${factor}</li>`).join('');
    const highlightMarkup = (game.highlights || []).map(item => `<li>${item}</li>`).join('');

    const drivingChips = (game.inspirations?.driving || []).map(item => `<span class="chip">${item}</span>`).join('');
    const horrorChips = (game.inspirations?.horror || []).map(item => `<span class="chip">${item}</span>`).join('');
    const narrativeChips = (game.inspirations?.narrative || []).map(item => `<span class="chip">${item}</span>`).join('');
    const mechanicalChips = (game.inspirations?.mechanical || []).map(item => `<span class="chip">${item}</span>`).join('');
    const platformChips = (game.development?.platforms || game.platforms || []).map(item => `<span class="chip">${item}</span>`).join('');

    modalTitle.textContent = game.title;

    modalBody.innerHTML = `
        <div class="game-details">
            ${game.subtitle ? `<p class="game-subtitle">${game.subtitle}</p>` : ''}
            ${game.overview ? `<p class="game-overview">${game.overview}</p>` : ''}
            ${game.hook ? `<div class="highlight-callout">${game.hook}</div>` : ''}

            ${pillarsMarkup ? `<div class="pillars-grid">${pillarsMarkup}</div>` : ''}

            ${highlightMarkup ? `
                <div class="system-block">
                    <h4>Why it hits different</h4>
                    <ul class="dot-list">${highlightMarkup}</ul>
                </div>
            ` : ''}

            ${loopsMarkup ? `
                <div class="system-block">
                    <h4>Core loops</h4>
                    <div class="system-grid">${loopsMarkup}</div>
                </div>
            ` : ''}

            ${game.mechanics ? `
                <div class="system-block">
                    <h4>Key mechanics</h4>
                    <div class="chip-row">${game.mechanics.map(mech => `<span class="chip">${mech}</span>`).join('')}</div>
                </div>
            ` : ''}

            ${game.calmTools || game.anxietyFactors ? `
                <div class="system-block split">
                    <div class="split-card">
                        <h5>${game.calmTools ? 'Keep Kayla grounded' : 'Features'}</h5>
                        <div class="chip-row">${calmToolsMarkup || (game.features || []).map(f => `<span class="chip">${f}</span>`).join('') || '<span class="chip muted">TBD</span>'}</div>
                    </div>
                    <div class="split-card">
                        <h5>${game.anxietyFactors ? 'Stress inputs' : 'Status'}</h5>
                        ${anxietyMarkup ? `<ul class="dot-list">${anxietyMarkup}</ul>` : `<p class="game-overview">${game.development?.status || 'In development'}</p>`}
                    </div>
                </div>
            ` : ''}

            <div class="system-block">
                <h4>Influences</h4>
                <div class="inspiration-list">
                    ${drivingChips || narrativeChips ? `
                        <div>
                            <span class="info-label">${drivingChips ? 'Driving DNA' : 'Narrative DNA'}</span>
                            <div class="chip-row">${drivingChips || narrativeChips || '<span class="chip muted">TBA</span>'}</div>
                        </div>
                    ` : ''}
                    ${horrorChips || mechanicalChips ? `
                        <div>
                            <span class="info-label">${horrorChips ? 'Psych horror lens' : 'Mechanical DNA'}</span>
                            <div class="chip-row">${horrorChips || mechanicalChips || '<span class="chip muted">TBA</span>'}</div>
                        </div>
                    ` : ''}
                </div>
            </div>

            <div class="detail-grid compact">
                <div class="info-item">
                    <span class="info-label">Progress</span>
                    <span class="info-value">${game.development?.progress || game.progress || '—'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Status</span>
                    <span class="info-value">${game.development?.status || game.status || '—'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Release</span>
                    <span class="info-value">${game.development?.release || game.release || '—'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Platforms</span>
                    <div class="chip-row">${platformChips || '<span class="chip muted">TBA</span>'}</div>
                </div>
                ${game.deliveryWindow ? `
                <div class="info-item">
                    <span class="info-label">Delivery promise</span>
                    <span class="info-value">${game.deliveryWindow}</span>
                </div>
                ` : ''}
            </div>

            ${game.noFailNote || game.note ? `<p class="note">${game.noFailNote || game.note}</p>` : ''}
        </div>
    `;

    modal.style.display = 'block';
    playSound('open');
}

// Close modal
function closeModal() {
    const modal = document.getElementById('game-modal');
    modal.style.display = 'none';
    playSound('close');
}

// Hit counter fetch + animation
function updateHitCounter() {
    const counterElement = document.getElementById('counter');
    if (!counterElement) return;

    sanitizeVisitorCache();
    fetchVisitorCount()
        .then((count) => {
            hitCounter = count;
            animateCounter(counterElement, count);
        })
        .catch((error) => {
            console.error('Visitor counter error:', error);
            const fallbackCount = getFallbackCount();
            hitCounter = fallbackCount;
            animateCounter(counterElement, fallbackCount);
        });
}

async function fetchVisitorCount() {
    await ensureCounterInitialized();
    const response = await fetch(COUNTER_HIT_URL, { cache: 'no-store' });
    if (!response.ok) {
        throw new Error(`Counter request failed: ${response.status}`);
    }

    const data = await response.json();
    if (typeof data.value !== 'number') {
        throw new Error('Invalid counter response');
    }

    localStorage.setItem('visitorCount', data.value);
    return data.value;
}

function getFallbackCount() {
    const stored = parseInt(localStorage.getItem('visitorCount'), 10);
    const base = Number.isFinite(stored) ? stored : hitCounter;
    const nextValue = base > 0 ? base + 1 : 1;
    localStorage.setItem('visitorCount', nextValue);
    return nextValue;
}

async function ensureCounterInitialized() {
    const namespaceKey = localStorage.getItem('counterNamespace');
    if (localStorage.getItem('counterInitialized') && namespaceKey === COUNTER_NAMESPACE) return;
    try {
        await fetch(COUNTER_INIT_URL, { cache: 'no-store' });
        localStorage.setItem('counterInitialized', 'true');
        localStorage.setItem('counterNamespace', COUNTER_NAMESPACE);
    } catch (error) {
        console.warn('Counter init warning:', error);
    }
}

function sanitizeVisitorCache() {
    const namespaceKey = localStorage.getItem('counterNamespace');
    if (namespaceKey && namespaceKey !== COUNTER_NAMESPACE) {
        localStorage.removeItem('visitorCount');
        localStorage.removeItem('counterInitialized');
    }

    const stored = parseInt(localStorage.getItem('visitorCount'), 10);
    if (!Number.isFinite(stored) || stored > 500) {
        localStorage.removeItem('visitorCount');
    }
}

function animateCounter(element, target) {
    const current = parseInt(element.dataset.count || element.textContent.replace(/,/g, ''), 10) || 0;
    const range = target - current;
    const duration = Math.min(2000, Math.max(600, Math.abs(range) * 25));
    let startTime;

    function step(timestamp) {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);
        const value = Math.round(current + range * progress);

        element.textContent = value.toLocaleString();
        element.dataset.count = value;

        if (progress < 1) {
            requestAnimationFrame(step);
        } else {
            element.style.textShadow = '0 0 12px #FF00FF';
            setTimeout(() => {
                element.style.textShadow = '';
            }, 600);
        }
    }

    requestAnimationFrame(step);
}

// Mouse trail effect
function createMouseTrail() {
    let mouseTrail = [];
    const maxTrailLength = 10;
    
    document.addEventListener('mousemove', (e) => {
        if (mouseTrail.length >= maxTrailLength) {
            const oldTrail = mouseTrail.shift();
            if (oldTrail) oldTrail.remove();
        }
        
        const trail = document.createElement('div');
        trail.className = 'mouse-trail';
        trail.style.position = 'fixed';
        trail.style.left = e.clientX + 'px';
        trail.style.top = e.clientY + 'px';
        trail.style.width = '8px';
        trail.style.height = '8px';
        trail.style.background = 'linear-gradient(45deg, #FF00FF, #00FFFF)';
        trail.style.borderRadius = '50%';
        trail.style.pointerEvents = 'none';
        trail.style.zIndex = '9999';
        trail.style.animation = 'fadeOut 1s forwards';
        
        document.body.appendChild(trail);
        mouseTrail.push(trail);
        
        setTimeout(() => {
            trail.remove();
            mouseTrail = mouseTrail.filter(t => t !== trail);
        }, 1000);
    });
}

// Progress bar animations
function animateProgressBars() {
    const progressFills = document.querySelectorAll('.progress-fill');
    progressFills.forEach((fill, index) => {
        const width = fill.style.width;
        fill.style.width = '0%';
        
        setTimeout(() => {
            fill.style.width = width;
        }, 500 + (index * 200));
    });
}

// Game cards animation
function animateGameCards() {
    const cards = document.querySelectorAll('.game-card');
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(50px)';
        
        setTimeout(() => {
            card.style.transition = 'all 0.5s';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, 200 + (index * 150));
    });
}

// Welcome box animation
function animateWelcomeBox() {
    const welcomeBox = document.querySelector('.welcome-box');
    if (welcomeBox) {
        welcomeBox.style.animation = 'pulse 2s infinite';
    }
}

// Profile card animation
function animateProfileCard() {
    const avatar = document.querySelector('.avatar');
    if (avatar) {
        avatar.style.animation = 'rotate 3s ease-in-out infinite';
    }
}

// Google Drive integration
function connectGoogleDrive() {
    // In a real implementation, this would use Google Drive API
    // For demo purposes, we'll simulate the connection
    
    const driveStatus = document.getElementById('drive-status');
    const button = event.target;
    
    button.disabled = true;
    button.textContent = '🔄 CONNECTING...';
    
    setTimeout(() => {
        // Simulate successful connection
        const driveId = 'drive_' + Date.now();
        const driveName = `Google Drive ${connectedDrives.length + 1}`;
        
        connectedDrives.push({
            id: driveId,
            name: driveName,
            files: Math.floor(Math.random() * 100) + 10,
            size: Math.floor(Math.random() * 1000) + 100
        });
        
        updateDriveList();
        updateStorageStats();
        
        driveStatus.innerHTML = `<span style="color: #0F0;">✅ Connected: ${driveName}</span>`;
        button.disabled = false;
        button.textContent = '🔗 CONNECT DRIVE';
        
        playSound('success');
        showNotification('Drive connected successfully!', 'success');
    }, 2000);
}

// Update drive list display
function updateDriveList() {
    const drivesContainer = document.getElementById('connected-drives');
    if (!drivesContainer) return;
    
    drivesContainer.innerHTML = connectedDrives.map(drive => `
        <div class="drive-item">
            <h4>📁 ${drive.name}</h4>
            <p>Files: ${drive.files}</p>
            <p>Size: ${drive.size} MB</p>
            <button class="y2k-button" onclick="disconnectDrive('${drive.id}')">❌ DISCONNECT</button>
        </div>
    `).join('');
}

// Disconnect drive
function disconnectDrive(driveId) {
    connectedDrives = connectedDrives.filter(drive => drive.id !== driveId);
    updateDriveList();
    updateStorageStats();
    showNotification('Drive disconnected', 'info');
}

// Update storage statistics
function updateStorageStats() {
    const totalFilesElement = document.getElementById('total-files');
    const totalSizeElement = document.getElementById('total-size');
    const drivesCountElement = document.getElementById('drives-count');
    
    const totalFiles = connectedDrives.reduce((sum, drive) => sum + drive.files, 0);
    const totalSize = connectedDrives.reduce((sum, drive) => sum + drive.size, 0);
    
    if (totalFilesElement) totalFilesElement.textContent = totalFiles;
    if (totalSizeElement) totalSizeElement.textContent = `${totalSize} MB`;
    if (drivesCountElement) drivesCountElement.textContent = connectedDrives.length;
}

// Sound effects (placeholder)
function initializeSoundEffects() {
    // In a real implementation, you would load actual sound files
    console.log('🔊 Sound effects initialized');
}

function playSound(type) {
    // Placeholder for sound effects
    console.log(`🔊 Playing sound: ${type}`);
    
    // Create visual feedback for sound
    const body = document.body;
    body.style.border = '2px solid #FF00FF';
    setTimeout(() => {
        body.style.border = '';
    }, 100);
}

// Notification system
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? 'linear-gradient(45deg, #0F0, #00FF00)' : 'linear-gradient(45deg, #FF00FF, #00FFFF)'};
        color: #000;
        padding: 15px 20px;
        border: 2px solid #0F0;
        font-weight: bold;
        z-index: 10000;
        animation: slideIn 0.3s, slideOut 0.3s 2.7s;
        animation-fill-mode: forwards;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Start animations
function startAnimations() {
    // Add CSS animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeOut {
            from { opacity: 1; transform: scale(1); }
            to { opacity: 0; transform: scale(0.5); }
        }
        
        @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
        }
        
        @keyframes rotate {
            0%, 100% { transform: rotate(0deg); }
            50% { transform: rotate(5deg); }
        }
        
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
        
        .game-details .info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 10px;
            margin: 20px 0;
        }
        
        .game-details .info-item {
            background: #111;
            padding: 10px;
            border: 1px solid #0F0;
            text-align: center;
        }
        
        .game-details .info-label {
            display: block;
            color: #FFFF00;
            font-size: 0.9rem;
            margin-bottom: 5px;
        }
        
        .game-details .info-value {
            color: #FF00FF;
            font-weight: bold;
        }
        
        .game-details .platform-tags {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            margin: 15px 0;
        }
        
        .game-details .platform-tag {
            background: linear-gradient(45deg, #FF00FF, #00FFFF);
            color: #000;
            padding: 5px 10px;
            border: 1px solid #0F0;
            font-size: 0.8rem;
            font-weight: bold;
        }
        
        .game-details .modal-actions {
            display: flex;
            gap: 10px;
            justify-content: center;
            margin-top: 20px;
            flex-wrap: wrap;
        }
        
        .game-details ul {
            list-style: none;
            padding: 0;
        }
        
        .game-details li {
            background: #111;
            margin: 5px 0;
            padding: 8px;
            border-left: 3px solid #00FFFF;
            color: #0F0;
        }
    `;
    document.head.appendChild(style);
}

// Save data to localStorage
function saveData() {
    const data = {
        connectedDrives: connectedDrives,
        lastVisit: new Date().toISOString()
    };
    localStorage.setItem('gamePortfolioData', JSON.stringify(data));
}

// Load saved data
function loadSavedData() {
    const savedData = localStorage.getItem('gamePortfolioData');
    if (savedData) {
        try {
            const data = JSON.parse(savedData);
            if (data.hitCounter) {
                delete data.hitCounter;
                localStorage.setItem('gamePortfolioData', JSON.stringify(data));
            }
            if (data.connectedDrives) connectedDrives = data.connectedDrives;
            
            updateDriveList();
            updateStorageStats();
            
            console.log('📂 Saved data loaded successfully');
        } catch (error) {
            console.error('❌ Error loading saved data:', error);
        }
    }
}

// Auto-save data
setInterval(saveData, 30000); // Save every 30 seconds

// Save data before page unload
window.addEventListener('beforeunload', saveData);

// Add some easter eggs
document.addEventListener('keydown', (e) => {
    // Konami code
    const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    
    if (!window.konamiSequence) window.konamiSequence = [];
    
    if (e.key === konamiCode[window.konamiSequence.length]) {
        window.konamiSequence.push(e.key);
        
        if (window.konamiSequence.length === konamiCode.length) {
            activateEasterEgg();
            window.konamiSequence = [];
        }
    } else {
        window.konamiSequence = [];
    }
});

// Easter egg activation
function activateEasterEgg() {
    document.body.style.animation = 'rainbow 2s infinite';
    showNotification('🌈 KONAMI CODE ACTIVATED! 🌈', 'success');
    
    setTimeout(() => {
        document.body.style.animation = '';
    }, 5000);
}

// Add rainbow animation
const rainbowStyle = document.createElement('style');
rainbowStyle.textContent = `
    @keyframes rainbow {
        0% { filter: hue-rotate(0deg); }
        100% { filter: hue-rotate(360deg); }
    }
`;
document.head.appendChild(rainbowStyle);

console.log('🎮 Y2K Game Dev Portfolio - Ready for action! 🎮');

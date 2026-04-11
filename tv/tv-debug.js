// Debug version to check episode calculation

const BLOCK_DURATION = 30 * 60 * 1000; // 30 minutes

function debugEpisodeCalculation() {
    const today = new Date('2026-04-10T06:00:00');
    const startDate = '2026-04-01';
    
    console.log('Today:', today);
    console.log('Start date:', startDate);
    
    // Method 1: guide.html style
    function getDexterEpisodeForDate(date, timeStr) {
        const april1 = new Date(2026, 3, 1, 0, 0, 0);
        
        const timeMatch = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
        if (!timeMatch) return 1;
        
        let hour = parseInt(timeMatch[1], 10);
        const minute = parseInt(timeMatch[2], 10);
        const ampm = timeMatch[3].toUpperCase();
        
        if (hour === 12) hour = 0;
        if (ampm === 'PM') hour += 12;
        
        const slotDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), hour, minute, 0);
        
        const msDiff = slotDate - april1;
        const totalSlots = Math.floor(msDiff / (1000 * 60 * 30));
        
        const episodeIndex = totalSlots % 11;
        
        return episodeIndex + 1;
    }
    
    // Method 2: tv.js style
    function buildQueueEpisode(blockIndex) {
        const blocks = 11;
        
        let startBlockIndex = 0;
        const startMs = Date.parse(startDate + 'T00:00:00');
        if (!Number.isNaN(startMs)) {
            startBlockIndex = Math.floor(startMs / BLOCK_DURATION);
        }
        
        const rel = blockIndex - startBlockIndex;
        const episodeIndex = ((rel % blocks) + blocks) % blocks;
        
        return episodeIndex + 1;
    }
    
    // Test both methods
    const times = ['6:00 AM', '6:30 AM'];
    
    times.forEach(timeStr => {
        const episode1 = getDexterEpisodeForDate(today, timeStr);
        
        // Calculate blockIndex for tv.js method
        const timeMatch = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
        let hour = parseInt(timeMatch[1], 10);
        const minute = parseInt(timeMatch[2], 10);
        const ampm = timeMatch[3].toUpperCase();
        
        if (hour === 12) hour = 0;
        if (ampm === 'PM') hour += 12;
        
        const slotDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), hour, minute, 0);
        const globalBlockIndex = Math.floor(slotDate.getTime() / BLOCK_DURATION);
        const episode2 = buildQueueEpisode(globalBlockIndex);
        
        console.log(`\n${timeStr}:`);
        console.log(`  Guide method: Episode ${episode1}`);
        console.log(`  TV method: Episode ${episode2}`);
        console.log(`  Slot date: ${slotDate}`);
        console.log(`  Global block index: ${globalBlockIndex}`);
        console.log(`  Start block index: ${Math.floor(Date.parse(startDate + 'T00:00:00') / BLOCK_DURATION)}`);
    });
}

debugEpisodeCalculation();

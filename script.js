// Add this at the beginning of your script.js
document.addEventListener('DOMContentLoaded', function() {
    // Set up navigation
    document.querySelectorAll('nav a, .quick-actions button').forEach(element => {
        element.addEventListener('click', function(e) {
            e.preventDefault();
            const sectionId = this.getAttribute('href')?.substring(1) || 
                             this.getAttribute('data-section');
            showSection(sectionId);
        });
    });

    // Set up mood slider
    const moodSlider = document.getElementById('mood-slider');
    const moodDescription = document.getElementById('mood-description');
    
    if (moodSlider) {
        moodSlider.addEventListener('input', function() {
            const value = parseInt(this.value);
            moodDescription.textContent = getMoodText(value);
        });
    }

    // Show initial section based on URL hash or default to home
    const initialSection = window.location.hash.substring(1) || 'home';
    showSection(initialSection);

    // Theme toggle functionality
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = themeToggle.querySelector('.theme-icon');
    
    // Check for saved theme preference or default to light
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
    
    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
    });
});

// Remove all user-related code and simplify to core functionality
let moodData = JSON.parse(localStorage.getItem('moodData')) || [];

// Show different sections
function showSection(sectionId) {
    if (!sectionId) return;
    
    // Hide all sections
    document.querySelectorAll('section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show target section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
        // Update URL hash without scrolling
        history.pushState(null, '', `#${sectionId}`);
    }
}

// Track mood
function trackMood() {
    const moodSlider = document.getElementById('mood-slider');
    const moodNotes = document.getElementById('mood-notes');
    const timestamp = new Date();
    const moodEntry = {
        mood: getMoodText(parseInt(moodSlider.value)),
        notes: moodNotes.value,
        timestamp: timestamp.toISOString(),
        id: Date.now()
    };
    
    // Save to localStorage
    const moods = JSON.parse(localStorage.getItem('moods') || '[]');
    moods.push(moodEntry);
    localStorage.setItem('moods', JSON.stringify(moods));
    
    // Clear the form
    moodNotes.value = '';
    
    // Show confirmation
    alert('Mood tracked successfully!');
}

function getMoodText(value) {
    const moods = ['terrible', 'bad', 'okay', 'good', 'great'];
    return moods[value - 1];
}

// Breathing exercise patterns
const breathingPatterns = {
    anxious: {
        name: "4-7-8 Breathing",
        description: "This calming pattern helps reduce anxiety and promote relaxation",
        inhale: 4,
        hold: 7,
        exhale: 8,
        color: "#64b5f6"
    },
    angry: {
        name: "Cooling Breath",
        description: "This technique helps cool down anger and restore balance",
        inhale: 4,
        hold: 4,
        exhale: 6,
        color: "#ef5350"
    },
    stressed: {
        name: "Box Breathing",
        description: "Equal-timed breathing to reduce stress and improve focus",
        inhale: 4,
        hold: 4,
        exhale: 4,
        color: "#81c784"
    },
    sad: {
        name: "Energizing Breath",
        description: "Uplifting breathing pattern to help with low mood",
        inhale: 5,
        hold: 0,
        exhale: 4,
        color: "#7986cb"
    },
    overwhelmed: {
        name: "Grounding Breath",
        description: "Simple pattern to help you feel more grounded and present",
        inhale: 3,
        hold: 2,
        exhale: 5,
        color: "#9575cd"
    },
    calm: {
        name: "Deep Relaxation",
        description: "Gentle breathing to maintain and deepen calm",
        inhale: 6,
        hold: 0,
        exhale: 6,
        color: "#4db6ac"
    }
};

function handleEmotionChange() {
    const emotion = document.getElementById('emotion-select').value;
    if (!emotion) return;

    const pattern = breathingPatterns[emotion];
    const container = document.getElementById('breathing-content');
    const description = document.getElementById('exercise-description');

    description.innerHTML = `
        <div class="pattern-info">
            <h3>${pattern.name}</h3>
            <p>${pattern.description}</p>
            <button class="next-step-btn" onclick="showBreathingCircle('${emotion}')">
                Begin Exercise
                <span class="arrow">→</span>
            </button>
        </div>
    `;

    container.innerHTML = '';
}

function showBreathingCircle(emotion) {
    const pattern = breathingPatterns[emotion];
    const container = document.getElementById('breathing-content');
    
    container.innerHTML = `
        <div class="breathing-exercise">
            <div class="breathing-visual">
                <div class="breathing-circle" style="--pattern-color: ${pattern.color}">
                    <div class="breathing-indicator"></div>
                </div>
                <div class="breathing-guide-circle"></div>
            </div>
            <div class="breathing-text">Get ready...</div>
            <div class="breathing-stats">
                <div>Inhale: ${pattern.inhale}s</div>
                ${pattern.hold ? `<div>Hold: ${pattern.hold}s</div>` : ''}
                <div>Exhale: ${pattern.exhale}s</div>
            </div>
            <button class="start-breathing-btn">Start Exercise</button>
            <div class="session-timer">Session: <span>00:00</span></div>
        </div>
    `;

    document.querySelector('.start-breathing-btn').addEventListener('click', () => {
        runBreathingCycle(pattern);
    });
}

function runBreathingCycle(pattern) {
    const circle = document.querySelector('.breathing-circle');
    const text = document.querySelector('.breathing-text');
    const startBtn = document.querySelector('.start-breathing-btn');
    startBtn.style.display = 'none';

    let sessionTime = 0;
    const sessionTimer = document.querySelector('.session-timer span');
    const sessionInterval = setInterval(() => {
        sessionTime++;
        const minutes = Math.floor(sessionTime / 60).toString().padStart(2, '0');
        const seconds = (sessionTime % 60).toString().padStart(2, '0');
        sessionTimer.textContent = `${minutes}:${seconds}`;
    }, 1000);

    // Add end session button
    const endSessionBtn = document.createElement('button');
    endSessionBtn.className = 'end-session-btn';
    endSessionBtn.textContent = 'End Session';
    document.querySelector('.breathing-exercise').appendChild(endSessionBtn);

    // Fix end session handler
    endSessionBtn.addEventListener('click', () => {
        clearInterval(sessionInterval);
        
        // Get current emotion from pattern
        const currentEmotion = Object.entries(breathingPatterns).find(([_, p]) => p === pattern)[0];
        
        // Save session to history
        const history = JSON.parse(localStorage.getItem('breathingHistory') || '[]');
        const session = {
            emotion: currentEmotion,
            patternName: pattern.name,
            timestamp: new Date().toISOString(),
            duration: sessionTime
        };
        
        history.unshift(session); // Add to beginning of array
        localStorage.setItem('breathingHistory', JSON.stringify(history));
        
        // Update history immediately
        updateBreathingHistory();
        
        // Reset the exercise view
        handleEmotionChange();
        document.getElementById('emotion-select').value = '';
    });

    function breathingCycle() {
        // Inhale
        text.textContent = 'Inhale...';
        circle.classList.add('inhale');
        navigator.vibrate(200);
        
        setTimeout(() => {
            if (pattern.hold) {
                // Hold
                text.textContent = 'Hold...';
                circle.classList.add('hold');
                navigator.vibrate(100);
                
                setTimeout(() => {
                    // Exhale
                    text.textContent = 'Exhale...';
                    circle.classList.add('exhale');
                    navigator.vibrate([50, 50, 50]);
                    
                    setTimeout(() => {
                        circle.classList.remove('inhale', 'hold', 'exhale');
                        breathingCycle();
                    }, pattern.exhale * 1000);
                }, pattern.hold * 1000);
            } else {
                // Exhale
                text.textContent = 'Exhale...';
                circle.classList.add('exhale');
                navigator.vibrate([50, 50, 50]);
                
                setTimeout(() => {
                    circle.classList.remove('inhale', 'hold', 'exhale');
                    breathingCycle();
                }, pattern.exhale * 1000);
            }
        }, pattern.inhale * 1000);
    }

    breathingCycle();
}

// Add these new functions
function switchBreathingTab(tab) {
    document.querySelectorAll('.breathing-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    
    document.getElementById(`breathing-${tab}-tab`).classList.add('active');
    document.querySelector(`.tab-btn[onclick*="${tab}"]`).classList.add('active');
    
    if (tab === 'history') {
        updateBreathingHistory();
    }
}

function updateBreathingHistory() {
    const entries = JSON.parse(localStorage.getItem('breathingHistory') || '[]');
    const container = document.getElementById('breathing-entries');
    
    if (entries.length === 0) {
        container.innerHTML = '<div class="no-history">No breathing sessions recorded yet.</div>';
        return;
    }
    
    container.innerHTML = entries.reverse().map(entry => `
        <div class="history-entry">
            <div class="history-header">
                <span class="history-emotion">${entry.emotion}</span>
                <span class="history-date">${formatDate(entry.timestamp)}</span>
            </div>
            <div class="history-details">
                <div class="history-pattern">
                    <strong>${entry.patternName}</strong>
                </div>
                <div class="history-duration">
                    Duration: ${formatDuration(entry.duration)}
                </div>
            </div>
        </div>
    `).join('');
}

function formatDuration(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// Add this function for formatting dates in the history
function formatDate(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    // If less than 24 hours ago, show relative time
    if (diff < 24 * 60 * 60 * 1000) {
        if (diff < 60 * 60 * 1000) {
            const minutes = Math.floor(diff / (60 * 1000));
            return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
        } else {
            const hours = Math.floor(diff / (60 * 60 * 1000));
            return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
        }
    }
    
    // Otherwise show the date
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
    });
}

function updateThemeIcon(theme) {
    const toggleThumb = document.querySelector('.toggle-thumb');
    const toggleTrack = document.querySelector('.toggle-track');
    
    if (theme === 'dark') {
        toggleThumb.style.transform = 'translateX(28px)';
        toggleTrack.style.background = '#2d2d2d';
    } else {
        toggleThumb.style.transform = 'translateX(0)';
        toggleTrack.style.background = '#4a90e2';
    }
}
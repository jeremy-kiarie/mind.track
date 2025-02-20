// Remove all user-related code and simplify to core functionality
let moodData = JSON.parse(localStorage.getItem('moodData')) || [];

// Show different sections
function showSection(sectionId) {
    if (!sectionId) return;
    
    // Remove 'active' class from all sections
    document.querySelectorAll('section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Add 'active' class to target section
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
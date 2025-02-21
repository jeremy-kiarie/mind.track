// Add this at the beginning of your script.js
document.addEventListener('DOMContentLoaded', function() {
    // Show loading screen for 2 seconds
    setTimeout(() => {
        const loadingScreen = document.querySelector('.loading-screen');
        loadingScreen.classList.add('fade-out');
        
        // Remove loading screen from DOM after fade out
        setTimeout(() => {
            loadingScreen.remove();
        }, 500);
    }, 2000);

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
    moods.unshift(moodEntry); // Add to beginning of array
    localStorage.setItem('moods', JSON.stringify(moods));
    
    // Update the display
    updateMoodHistory();
    
    // Clear the form
    moodNotes.value = '';
    
    // Show confirmation
    showConfirmation('Mood tracked successfully!');
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

function updateMoodHistory() {
    const moodEntries = document.getElementById('mood-entries');
    const moods = JSON.parse(localStorage.getItem('moods') || '[]');
    
    if (moods.length === 0) {
        moodEntries.innerHTML = '<div class="no-entries">No mood entries yet</div>';
        return;
    }
    
    moodEntries.innerHTML = moods.map(entry => `
        <div class="mood-entry">
            <div class="mood-entry-header">
                <span class="mood-emoji">${getMoodEmoji(entry.mood)}</span>
                <span class="mood-text">${entry.mood}</span>
                <span class="mood-time">${formatDate(entry.timestamp)}</span>
            </div>
            ${entry.notes ? `
                <div class="mood-notes">
                    <p>${entry.notes}</p>
                </div>
            ` : ''}
            <button onclick="deleteMoodEntry(${entry.id})" class="delete-mood-btn">
                Delete
            </button>
        </div>
    `).join('');
}

function getMoodEmoji(mood) {
    const emojis = {
        'terrible': '😢',
        'bad': '😔',
        'okay': '😐',
        'good': '🙂',
        'great': '😊'
    };
    return emojis[mood] || '😐';
}

function deleteMoodEntry(id) {
    const moods = JSON.parse(localStorage.getItem('moods') || '[]');
    const updatedMoods = moods.filter(entry => entry.id !== id);
    localStorage.setItem('moods', JSON.stringify(updatedMoods));
    updateMoodHistory();
}

function showConfirmation(message) {
    const confirmation = document.createElement('div');
    confirmation.className = 'confirmation-toast';
    confirmation.textContent = message;
    document.body.appendChild(confirmation);
    
    setTimeout(() => {
        confirmation.classList.add('show');
        setTimeout(() => {
            confirmation.classList.remove('show');
            setTimeout(() => confirmation.remove(), 300);
        }, 2000);
    }, 100);
}

// Assessment Data
const assessments = {
    anxiety: {
        title: "Anxiety Assessment (GAD-7)",
        description: "Over the last 2 weeks, how often have you been bothered by the following problems?",
        questions: [
            "Feeling nervous, anxious, or on edge",
            "Not being able to stop or control worrying",
            "Worrying too much about different things",
            "Trouble relaxing",
            "Being so restless that it's hard to sit still",
            "Becoming easily annoyed or irritable",
            "Feeling afraid as if something awful might happen"
        ],
        options: [
            { text: "Not at all", value: 0 },
            { text: "Several days", value: 1 },
            { text: "More than half the days", value: 2 },
            { text: "Nearly every day", value: 3 }
        ],
        getResult: (score) => {
            if (score >= 15) return { level: "Severe anxiety", recommendation: "Please consider seeking professional help immediately." };
            if (score >= 10) return { level: "Moderate anxiety", recommendation: "Consider consulting a mental health professional." };
            if (score >= 5) return { level: "Mild anxiety", recommendation: "Monitor your symptoms and practice self-care." };
            return { level: "Minimal anxiety", recommendation: "Continue maintaining your mental well-being." };
        }
    },
    depression: {
        title: "Depression Screening (PHQ-9)",
        description: "Over the last 2 weeks, how often have you been bothered by the following problems?",
        questions: [
            "Little interest or pleasure in doing things",
            "Feeling down, depressed, or hopeless",
            "Trouble falling/staying asleep, sleeping too much",
            "Feeling tired or having little energy",
            "Poor appetite or overeating",
            "Feeling bad about yourself or that you're a failure",
            "Trouble concentrating on things",
            "Moving or speaking slowly/being fidgety or restless",
            "Thoughts that you would be better off dead or of hurting yourself"
        ],
        options: [
            { text: "Not at all", value: 0 },
            { text: "Several days", value: 1 },
            { text: "More than half the days", value: 2 },
            { text: "Nearly every day", value: 3 }
        ],
        getResult: (score) => {
            if (score >= 20) return { level: "Severe depression", recommendation: "Please seek professional help immediately." };
            if (score >= 15) return { level: "Moderately severe depression", recommendation: "Strongly consider consulting a mental health professional." };
            if (score >= 10) return { level: "Moderate depression", recommendation: "Consider speaking with a mental health professional." };
            if (score >= 5) return { level: "Mild depression", recommendation: "Monitor your mood and practice self-care." };
            return { level: "Minimal depression", recommendation: "Continue maintaining your mental well-being." };
        }
    },
    stress: {
        title: "Stress Level Check (PSS-10)",
        description: "In the last month, how often have you...",
        questions: [
            "Been upset because of something that happened unexpectedly?",
            "Felt that you were unable to control the important things in your life?",
            "Felt nervous and stressed?",
            "Felt confident about your ability to handle personal problems?",
            "Felt that things were going your way?",
            "Found that you could not cope with all the things you had to do?",
            "Been able to control irritations in your life?",
            "Felt that you were on top of things?",
            "Been angered because of things that happened outside of your control?",
            "Felt difficulties were piling up so high that you could not overcome them?"
        ],
        options: [
            { text: "Never", value: 0 },
            { text: "Almost Never", value: 1 },
            { text: "Sometimes", value: 2 },
            { text: "Fairly Often", value: 3 },
            { text: "Very Often", value: 4 }
        ],
        getResult: (score) => {
            if (score >= 27) return { level: "High stress", recommendation: "Consider seeking professional support to manage stress." };
            if (score >= 14) return { level: "Moderate stress", recommendation: "Practice stress management techniques and monitor your stress levels." };
            return { level: "Low stress", recommendation: "Continue your current stress management practices." };
        }
    },
    wellbeing: {
        title: "Well-being Index (WHO-5)",
        description: "Over the last 2 weeks...",
        questions: [
            "I have felt cheerful and in good spirits",
            "I have felt calm and relaxed",
            "I have felt active and vigorous",
            "I woke up feeling fresh and rested",
            "My daily life has been filled with things that interest me"
        ],
        options: [
            { text: "At no time", value: 0 },
            { text: "Some of the time", value: 1 },
            { text: "Less than half the time", value: 2 },
            { text: "More than half the time", value: 3 },
            { text: "Most of the time", value: 4 },
            { text: "All the time", value: 5 }
        ],
        getResult: (score) => {
            const percentage = (score / 25) * 100;
            if (percentage <= 28) return { level: "Low well-being", recommendation: "Consider seeking professional support to improve your well-being." };
            if (percentage <= 50) return { level: "Moderate well-being", recommendation: "Consider ways to enhance your daily well-being." };
            return { level: "Good well-being", recommendation: "Continue maintaining your positive well-being practices." };
        }
    }
};

function startAssessment(type) {
    const assessment = assessments[type];
    const modal = document.getElementById('assessment-modal');
    const title = document.getElementById('assessment-title');
    const description = document.getElementById('assessment-description');
    const questions = document.getElementById('assessment-questions');
    
    title.textContent = assessment.title;
    description.textContent = assessment.description;
    
    questions.innerHTML = assessment.questions.map((question, index) => `
        <div class="question-container">
            <p class="question-text">${index + 1}. ${question}</p>
            <div class="options-container">
                ${assessment.options.map(option => `
                    <label class="option-label">
                        <input type="radio" name="q${index}" value="${option.value}" required>
                        ${option.text}
                    </label>
                `).join('')}
            </div>
        </div>
    `).join('');
    
    modal.style.display = 'block';
    document.getElementById('assessment-result').style.display = 'none';
    
    // Set up form submission
    const form = document.getElementById('assessment-form');
    form.onsubmit = (e) => {
        e.preventDefault();
        submitAssessment(type);
    };
}

function submitAssessment(type) {
    const assessment = assessments[type];
    const form = document.getElementById('assessment-form');
    const result = document.getElementById('assessment-result');
    const resultContent = document.getElementById('result-content');
    const recommendations = document.getElementById('result-recommendations');
    
    // Calculate score
    let score = 0;
    assessment.questions.forEach((_, index) => {
        const selected = form.querySelector(`input[name="q${index}"]:checked`);
        if (selected) {
            score += parseInt(selected.value);
        }
    });
    
    // Get result based on score
    const assessmentResult = assessment.getResult(score);
    
    // Display result
    resultContent.innerHTML = `
        <p>Your score: ${score}</p>
        <p>Level: ${assessmentResult.level}</p>
    `;
    recommendations.innerHTML = `
        <h4>Recommendations:</h4>
        <p>${assessmentResult.recommendation}</p>
    `;
    
    form.style.display = 'none';
    result.style.display = 'block';
}

function closeAssessment() {
    const modal = document.getElementById('assessment-modal');
    const form = document.getElementById('assessment-form');
    modal.style.display = 'none';
    form.style.display = 'block';
}

// Close modal when clicking the X or outside the modal
document.querySelector('.close-modal').onclick = closeAssessment;
window.onclick = (event) => {
    const modal = document.getElementById('assessment-modal');
    if (event.target === modal) {
        closeAssessment();
    }
};
// Store user data
let moodData = JSON.parse(localStorage.getItem('moodData')) || [];
let journalEntries = JSON.parse(localStorage.getItem('journalEntries')) || [];

// Simple AI responses based on keywords
const aiResponses = {
    anxiety: [
        "I understand you're feeling anxious. Let's try some deep breathing exercises together.",
        "Anxiety can be overwhelming. Would you like to talk about what's triggering these feelings?",
        "Sometimes focusing on the present moment can help with anxiety. What do you see around you right now?"
    ],
    depression: [
        "I hear that you're feeling down. Remember that it's okay to not be okay, and seeking help is brave.",
        "Depression can make everything feel heavy. What's one small thing you could do for yourself today?",
        "You're not alone in this. Would you like to talk more about what you're experiencing?"
    ],
    stress: [
        "Stress can be overwhelming. Let's try to break down what's bothering you.",
        "When we're stressed, it helps to focus on what we can control. What's one thing you could address today?",
        "Taking breaks is important when dealing with stress. Have you had a moment to rest today?"
    ],
    default: [
        "I'm here to listen and support you. Would you like to tell me more?",
        "How long have you been feeling this way?",
        "What would help you feel better right now?"
    ]
};

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

// Update mood chart
function updateMoodChart() {
    const chartContainer = document.getElementById('mood-chart');
    chartContainer.innerHTML = '<h3>Your Mood History</h3>';
    
    const lastSevenDays = moodData.slice(-7);
    const chart = document.createElement('div');
    chart.className = 'mood-history';
    
    // Fill in missing days with empty slots
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        const entry = lastSevenDays.find(e => e.date === dateStr);
        const day = document.createElement('div');
        day.className = 'mood-day';
        
        if (entry) {
            day.innerHTML = `
                <div class="mood-emoji">${getEmoji(entry.mood)}</div>
                <div class="mood-date">${date.toLocaleDateString('en-US', { weekday: 'short' })}</div>
            `;
        } else {
            day.innerHTML = `
                <div class="mood-emoji">📝</div>
                <div class="mood-date">${date.toLocaleDateString('en-US', { weekday: 'short' })}</div>
            `;
        }
        chart.appendChild(day);
    }
    
    chartContainer.appendChild(chart);
}

function getEmoji(mood) {
    const emojis = {
        great: '😊',
        good: '🙂',
        okay: '😐',
        bad: '😔',
        terrible: '😢'
    };
    return emojis[mood] || '😐';
}

// AI Chat functionality
function sendMessage() {
    const input = document.getElementById('user-input');
    const message = input.value.trim();
    if (!message) return;

    addMessageToChat('user', message);
    const response = getAIResponse(message);
    addMessageToChat('ai', response);
    
    input.value = '';
}

function addMessageToChat(sender, message) {
    const chatMessages = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;
    messageDiv.innerHTML = `
        <div class="message-content">
            <strong>${sender === 'user' ? 'You' : 'AI Counselor'}:</strong>
            <p>${message}</p>
        </div>
    `;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function getAIResponse(message) {
    const lowercaseMessage = message.toLowerCase();
    let responses = aiResponses.default;
    
    for (const [keyword, responseArray] of Object.entries(aiResponses)) {
        if (lowercaseMessage.includes(keyword)) {
            responses = responseArray;
            break;
        }
    }
    
    // Randomly select one response from the appropriate array
    return responses[Math.floor(Math.random() * responses.length)];
}

// Handle navigation through URL hash changes
window.addEventListener('hashchange', function() {
    const hash = window.location.hash.slice(1) || 'home';
    showSection(hash);
});

// Update the initialization code
document.addEventListener('DOMContentLoaded', () => {
    // Handle initial hash in URL
    const initialHash = window.location.hash.slice(1) || 'home';
    showSection(initialHash);
    updateMoodChart();
    updateJournalEntries();
    document.querySelector('.date-stamp').textContent = new Date().toLocaleDateString();

    // Add click handlers for nav links
    document.querySelectorAll('nav a').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const sectionId = this.getAttribute('href').slice(1);
            showSection(sectionId);
        });
    });

    // Add click handlers for quick action buttons
    document.querySelectorAll('.quick-actions button').forEach(button => {
        button.addEventListener('click', function() {
            const sectionId = this.getAttribute('data-section');
            showSection(sectionId);
        });
    });

    // Add click handler for book cover
    const bookCover = document.querySelector('.book-cover');
    if (bookCover) {
        bookCover.innerHTML += '<div class="open-prompt">Click to Open</div>';
        bookCover.addEventListener('click', openJournal);
    }

    // Add close button inside the book
    const bookContent = document.querySelector('.book-content');
    if (bookContent) {
        const closeButton = document.createElement('button');
        closeButton.className = 'close-journal-btn';
        closeButton.innerHTML = '×';
        closeButton.addEventListener('click', closeJournal);
        bookContent.appendChild(closeButton);
    }

    // Check authentication status on page load
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        showSection('home');
    } else {
        showSection('auth');
    }
});

// Update the journal functionality
let currentUser = null;

let currentStep = 1;

function nextStep(step) {
    if (!validateStep(currentStep)) {
        return;
    }

    const currentStepEl = document.getElementById(`step-${currentStep}`);
    const nextStepEl = document.getElementById(`step-${step}`);
    
    currentStepEl.classList.remove('active');
    currentStepEl.style.display = 'none';
    
    nextStepEl.style.display = 'block';
    setTimeout(() => {
        nextStepEl.classList.add('active');
    }, 10);
    
    currentStep = step;
    updateProgress();
}

function prevStep(step) {
    const currentStepEl = document.getElementById(`step-${currentStep}`);
    const prevStepEl = document.getElementById(`step-${step}`);
    
    currentStepEl.classList.remove('active');
    currentStepEl.style.display = 'none';
    
    prevStepEl.style.display = 'block';
    setTimeout(() => {
        prevStepEl.classList.add('active');
    }, 10);
    
    currentStep = step;
    updateProgress();
}

function updateProgress() {
    const steps = document.querySelectorAll('.progress-step');
    const lines = document.querySelectorAll('.progress-line');
    
    steps.forEach((step, index) => {
        const stepNum = parseInt(step.dataset.step);
        if (stepNum < currentStep) {
            step.classList.add('completed');
            step.classList.remove('active');
            if (lines[index]) lines[index].style.background = '#4caf50';
        } else if (stepNum === currentStep) {
            step.classList.add('active');
            step.classList.remove('completed');
            if (lines[index]) lines[index].style.background = '#e0e0e0';
        } else {
            step.classList.remove('active', 'completed');
            if (lines[index]) lines[index].style.background = '#e0e0e0';
        }
    });
}

// Add form validation
function validateStep(step) {
    const errorElement = document.getElementById('register-error');
    errorElement.textContent = '';
    
    switch(step) {
        case 1:
            const password = document.getElementById('reg-password').value;
            if (password.length < 8) {
                errorElement.textContent = 'Password must be at least 8 characters long';
                return false;
            }
            break;
            
        case 2:
            // Optional validation for health information
            break;
            
        case 3:
            const emergencyPhone = document.getElementById('emergency-phone').value;
            if (emergencyPhone && !isValidPhone(emergencyPhone)) {
                errorElement.textContent = 'Please enter a valid emergency contact phone number';
                return false;
            }
            break;
    }
    return true;
}

function isValidPhone(phone) {
    const phoneRegex = /^\+?[\d\s-]{10,}$/;
    return phoneRegex.test(phone);
}

async function handleRegister(event) {
    event.preventDefault();
    const errorElement = document.getElementById('register-error');

    // Collect all form data
    const formData = {
        username: document.getElementById('reg-username').value,
        email: document.getElementById('reg-email').value,
        password: document.getElementById('reg-password').value,
        security_word: document.getElementById('reg-security-word').value,
        mental_health_conditions: Array.from(document.querySelectorAll('input[name="conditions"]:checked'))
            .map(cb => cb.value).join(','),
        support_type: document.getElementById('support-type').value,
        comfort_activities: document.getElementById('comfort-activities').value,
        triggers: document.getElementById('triggers').value,
        coping_strategies: document.getElementById('coping-strategies').value,
        emergency_contact_name: document.getElementById('emergency-name').value,
        emergency_contact_phone: document.getElementById('emergency-phone').value,
        therapist_name: document.getElementById('therapist-name').value,
        therapist_phone: document.getElementById('therapist-phone').value
    };

    try {
        const response = await fetch('http://localhost:5000/api/auth', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                action: 'register',
                ...formData
            })
        });

        const data = await response.json();
        if (data.success) {
            alert('Registration successful! Please login.');
            showLoginForm();
        } else {
            errorElement.textContent = data.message;
        }
    } catch (error) {
        errorElement.textContent = 'An error occurred. Please try again.';
    }
}

async function register(username, email, password) {
    try {
        const response = await fetch('http://localhost:5000/api/auth', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                action: 'register',
                username,
                email,
                password
            })
        });
        
        const data = await response.json();
        if (data.success) {
            alert('Registration successful! Please login.');
            showLoginForm();
        } else {
            alert('Registration failed: ' + data.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Registration failed. Please try again.');
    }
}

async function login(email, password) {
    try {
        const response = await fetch('http://localhost:5000/api/auth', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                action: 'login',
                email,
                password
            })
        });
        
        const data = await response.json();
        if (data.success) {
            currentUser = {
                id: data.user_id,
                username: data.username
            };
            localStorage.setItem('user', JSON.stringify(currentUser));
            showSection('home');
        } else {
            alert('Login failed: ' + data.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Login failed. Please try again.');
    }
}

async function saveJournalEntry() {
    if (!currentUser) {
        alert('Please login to save entries');
        return;
    }

    const title = document.getElementById('entry-title').value.trim();
    const content = document.getElementById('journal-entry').value.trim();
    const tags = document.getElementById('entry-tags').value;

    if (!content) {
        alert('Please write something in your journal entry');
        return;
    }

    try {
        const response = await fetch('http://localhost:5000/api/journal', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                user_id: currentUser.id,
                title: title || 'Untitled Entry',
                content,
                tags,
                mood: getCurrentMood()
            })
        });
        
        const data = await response.json();
        if (data.success) {
            updateJournalEntries();
            clearEntryForm();
            showSaveConfirmation();
        } else {
            alert('Failed to save entry: ' + data.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to save entry. Please try again.');
    }
}

function getCurrentMood() {
    const moods = JSON.parse(localStorage.getItem('moods') || '[]');
    if (moods.length === 0) return null;
    return moods[0].mood; // Get the most recent mood
}

async function updateJournalEntries() {
    if (!currentUser) return;

    try {
        const response = await fetch(`http://localhost:5000/api/journal?user_id=${currentUser.id}`);
        const data = await response.json();
        
        if (data.success) {
            const entriesContainer = document.getElementById('journal-entries');
            if (data.entries.length === 0) {
                entriesContainer.innerHTML = '<p class="no-entries">No entries yet. Start writing!</p>';
                return;
            }

            entriesContainer.innerHTML = data.entries.map(entry => `
                <div class="journal-entry" data-id="${entry.id}">
                    <div class="entry-header">
                        <h3>${entry.title}</h3>
                        <div class="entry-actions">
                            <button onclick="editJournalEntry(${entry.id})" class="edit-btn">Edit</button>
                            <button onclick="deleteJournalEntry(${entry.id})" class="delete-btn">Delete</button>
                        </div>
                    </div>
                    <div class="entry-meta">
                        <span class="entry-date">${formatDate(entry.created_at)}</span>
                        ${entry.mood ? `<span class="entry-mood">${getEmoji(entry.mood)}</span>` : ''}
                    </div>
                    <div class="entry-content">${formatContent(entry.content)}</div>
                    ${entry.tags ? `
                        <div class="entry-tags">
                            ${entry.tags.split(',').map(tag => `<span class="tag">#${tag.trim()}</span>`).join(' ')}
                        </div>
                    ` : ''}
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

function formatContent(content) {
    // Convert line breaks to <br> tags and escape HTML
    return content
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\n/g, '<br>');
}

function editJournalEntry(id) {
    const entries = JSON.parse(localStorage.getItem('journalEntries') || '[]');
    const entry = entries.find(e => e.id === id);
    
    if (entry) {
        document.getElementById('entry-title').value = entry.title;
        document.getElementById('journal-entry').value = entry.content;
        document.getElementById('entry-tags').value = entry.tags.join(', ');
        
        // Store the entry being edited
        localStorage.setItem('editingEntry', JSON.stringify(entry));
        
        // Scroll to the entry form
        document.querySelector('.new-entry-page').scrollIntoView({ behavior: 'smooth' });
    }
}

function deleteJournalEntry(id) {
    if (confirm('Are you sure you want to delete this entry?')) {
        const entries = JSON.parse(localStorage.getItem('journalEntries') || '[]');
        const updatedEntries = entries.filter(entry => entry.id !== id);
        localStorage.setItem('journalEntries', JSON.stringify(updatedEntries));
        updateJournalEntries();
    }
}

function clearEntryForm() {
    document.getElementById('entry-title').value = '';
    document.getElementById('journal-entry').value = '';
    document.getElementById('entry-tags').value = '';
    localStorage.removeItem('editingEntry');
}

function showSaveConfirmation() {
    const confirmation = document.createElement('div');
    confirmation.className = 'save-confirmation';
    confirmation.textContent = 'Journal entry saved!';
    
    document.querySelector('.book-container').appendChild(confirmation);
    
    setTimeout(() => {
        confirmation.remove();
    }, 2000);
}

// Add keyboard support for chat
document.getElementById('user-input').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

// Update mood description when slider moves
document.getElementById('mood-slider').addEventListener('input', function() {
    const descriptions = ['Terrible', 'Bad', 'Okay', 'Good', 'Great'];
    const value = parseInt(this.value);
    document.getElementById('mood-description').textContent = descriptions[value - 1];
});

function getMoodFromSlider() {
    const value = parseInt(document.getElementById('mood-slider').value);
    const moods = ['terrible', 'bad', 'okay', 'good', 'great'];
    return moods[value - 1];
}

function getMoodText(value) {
    const moods = ['terrible', 'bad', 'okay', 'good', 'great'];
    return moods[value - 1];
}

// Add these new visualization functions
function createMoodChart(type) {
    const moods = JSON.parse(localStorage.getItem('moods') || '[]');
    const moodCounts = {
        great: 0,
        good: 0,
        okay: 0,
        bad: 0,
        terrible: 0
    };
    
    moods.forEach(entry => {
        moodCounts[entry.mood]++;
    });

    const chartContainer = document.getElementById('mood-chart');
    chartContainer.innerHTML = `
        <div class="chart-controls">
            <button onclick="createMoodChart('pie')" class="${type === 'pie' ? 'active' : ''}">Pie Chart</button>
            <button onclick="createMoodChart('bar')" class="${type === 'bar' ? 'active' : ''}">Bar Graph</button>
            <button onclick="createMoodChart('stats')" class="${type === 'stats' ? 'active' : ''}">Statistics</button>
        </div>
        <div id="chart-display"></div>
    `;

    const display = document.getElementById('chart-display');

    switch(type) {
        case 'pie':
            createPieChart(moodCounts, display);
            break;
        case 'bar':
            createBarGraph(moodCounts, display);
            break;
        case 'stats':
            createMoodStats(moodCounts, display);
            break;
    }
}

function createPieChart(moodCounts, container) {
    const total = Object.values(moodCounts).reduce((a, b) => a + b, 0);
    let cumulativePercentage = 0;
    
    const colors = {
        great: '#44cc44',
        good: '#99cc00',
        okay: '#ffdd00',
        bad: '#ff9900',
        terrible: '#ff4444'
    };

    const svg = `
        <svg viewBox="0 0 100 100" class="pie-chart">
            ${Object.entries(moodCounts).map(([mood, count]) => {
                const percentage = (count / total) * 100;
                const [startX, startY] = getCoordinatesForPercent(cumulativePercentage);
                cumulativePercentage += percentage;
                const [endX, endY] = getCoordinatesForPercent(cumulativePercentage);
                const largeArcFlag = percentage > 50 ? 1 : 0;
                
                return `
                    <path
                        d="M 50 50 L ${startX} ${startY} A 50 50 0 ${largeArcFlag} 1 ${endX} ${endY} Z"
                        fill="${colors[mood]}"
                    >
                        <title>${mood}: ${count} (${percentage.toFixed(1)}%)</title>
                    </path>
                `;
            }).join('')}
        </svg>
        <div class="chart-legend">
            ${Object.entries(moodCounts).map(([mood, count]) => `
                <div class="legend-item">
                    <span class="legend-color" style="background: ${colors[mood]}"></span>
                    <span>${mood}: ${count}</span>
                </div>
            `).join('')}
        </div>
    `;
    
    container.innerHTML = svg;
}

function createBarGraph(moodCounts, container) {
    const maxCount = Math.max(...Object.values(moodCounts));
    const colors = {
        great: '#44cc44',
        good: '#99cc00',
        okay: '#ffdd00',
        bad: '#ff9900',
        terrible: '#ff4444'
    };

    const bars = Object.entries(moodCounts).map(([mood, count]) => `
        <div class="bar-container">
            <div class="bar" style="height: ${(count / maxCount) * 200}px; background-color: ${colors[mood]}">
                <span class="bar-value">${count}</span>
            </div>
            <div class="bar-label">${mood}</div>
        </div>
    `).join('');

    container.innerHTML = `<div class="bar-graph">${bars}</div>`;
}

function createMoodStats(moodCounts, container) {
    const total = Object.values(moodCounts).reduce((a, b) => a + b, 0);
    const stats = Object.entries(moodCounts).map(([mood, count]) => {
        const percentage = ((count / total) * 100).toFixed(1);
        return `
            <div class="mood-stat">
                <div class="mood-stat-header">
                    <span class="mood-emoji">${getEmoji(mood)}</span>
                    <span class="mood-name">${mood}</span>
                </div>
                <div class="mood-stat-bar">
                    <div class="mood-stat-fill" style="width: ${percentage}%"></div>
                </div>
                <div class="mood-stat-numbers">
                    <span class="mood-count">${count}</span>
                    <span class="mood-percentage">${percentage}%</span>
                </div>
            </div>
        `;
    }).join('');

    container.innerHTML = `
        <div class="mood-stats">
            <div class="total-entries">Total Entries: ${total}</div>
            ${stats}
        </div>
    `;
}

function getCoordinatesForPercent(percent) {
    const x = Math.cos(2 * Math.PI * percent);
    const y = Math.sin(2 * Math.PI * percent);
    return [50 + (x * 50), 50 + (y * 50)];
}

// Enhance AI responses with more complex patterns and context awareness
const aiContext = {
    previousMessages: [],
    userMoodHistory: [],
    sessionStartTime: Date.now()
};

function getEnhancedAIResponse(message) {
    // Store message in context
    aiContext.previousMessages.push({
        type: 'user',
        content: message,
        timestamp: Date.now()
    });

    // Get recent mood data
    const recentMoods = JSON.parse(localStorage.getItem('moods') || '[]')
        .slice(0, 5);
    aiContext.userMoodHistory = recentMoods;

    // Analyze message for patterns
    const analysis = analyzeMessage(message);
    
    // Generate contextual response
    const response = generateContextualResponse(analysis);

    // Store AI response in context
    aiContext.previousMessages.push({
        type: 'ai',
        content: response,
        timestamp: Date.now()
    });

    return response;
}

function analyzeMessage(message) {
    const analysis = {
        sentiment: analyzeSentiment(message),
        keywords: extractKeywords(message),
        urgency: assessUrgency(message),
        topic: identifyTopic(message)
    };
    return analysis;
}

// Add these helper functions for message analysis
function analyzeSentiment(message) {
    const positiveWords = ['happy', 'good', 'great', 'better', 'wonderful', 'excited'];
    const negativeWords = ['sad', 'bad', 'terrible', 'worse', 'awful', 'depressed'];
    
    const words = message.toLowerCase().split(' ');
    let score = 0;
    
    words.forEach(word => {
        if (positiveWords.includes(word)) score++;
        if (negativeWords.includes(word)) score--;
    });
    
    return score;
}

function extractKeywords(message) {
    const commonWords = ['the', 'is', 'at', 'which', 'on', 'and'];
    return message.toLowerCase()
        .split(' ')
        .filter(word => !commonWords.includes(word));
}

function assessUrgency(message) {
    const urgentPhrases = ['help', 'emergency', 'crisis', 'suicide', 'hurt myself'];
    return urgentPhrases.some(phrase => message.toLowerCase().includes(phrase));
}

function identifyTopic(message) {
    const topics = {
        anxiety: ['anxious', 'worried', 'nervous', 'panic'],
        depression: ['depressed', 'sad', 'hopeless', 'empty'],
        stress: ['stressed', 'overwhelmed', 'pressure', 'burnout'],
        relationships: ['friend', 'family', 'partner', 'relationship'],
        work: ['job', 'work', 'career', 'boss'],
        health: ['sleep', 'eating', 'exercise', 'health']
    };

    for (const [topic, keywords] of Object.entries(topics)) {
        if (keywords.some(keyword => message.toLowerCase().includes(keyword))) {
            return topic;
        }
    }
    return 'general';
}

// Add these new functions for journal interaction
function openJournal() {
    const book = document.querySelector('.book');
    const bookCover = document.querySelector('.book-cover');
    
    book.style.transform = 'translateX(50%)';
    bookCover.style.transform = 'rotateY(-180deg)';
}

function closeJournal() {
    const book = document.querySelector('.book');
    const bookCover = document.querySelector('.book-cover');
    
    book.style.transform = 'translateX(0)';
    bookCover.style.transform = 'rotateY(0)';
}

function showLoginForm() {
    document.getElementById('register-form').style.display = 'none';
    document.getElementById('login-form').style.display = 'block';
}

function showRegisterForm() {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('register-form').style.display = 'block';
}

async function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const securityWord = document.getElementById('security-word').value;
    const errorElement = document.getElementById('login-error');

    try {
        const response = await fetch('http://localhost:5000/api/auth', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                action: 'login',
                email,
                password,
                security_word: securityWord || null
            })
        });

        const data = await response.json();
        if (data.success) {
            currentUser = {
                id: data.user_id,
                username: data.username
            };
            localStorage.setItem('user', JSON.stringify(currentUser));
            showSection('home');
        } else {
            errorElement.textContent = data.message;
            if (data.locked) {
                document.getElementById('security-word-group').style.display = 'block';
            }
        }
    } catch (error) {
        errorElement.textContent = 'An error occurred. Please try again.';
    }
}

function getBreathingPattern(mood) {
    // Different patterns based on mood
    const patterns = {
        terrible: { inhale: 4, hold: 7, exhale: 8 }, // 4-7-8 for anxiety/stress
        bad: { inhale: 4, hold: 4, exhale: 4 }, // Box breathing
        okay: { inhale: 4, hold: 0, exhale: 4 }, // Basic balanced breathing
        good: { inhale: 5, hold: 0, exhale: 5 }, // Relaxed breathing
        great: { inhale: 6, hold: 0, exhale: 6 } // Deep relaxation
    };
    return patterns[mood] || patterns.okay;
}

function startBreathingExercise(mood) {
    const pattern = getBreathingPattern(mood);
    const container = document.getElementById('chat-messages');
    container.innerHTML = `
        <div class="breathing-exercise">
            <div class="mood-indicator">Current Mood: ${mood}</div>
            <div class="breathing-circle"></div>
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

    // Add event listener to start button
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
        navigator.vibrate(200); // Short vibration for inhale start
        
        setTimeout(() => {
            if (pattern.hold) {
                // Hold
                text.textContent = 'Hold...';
                circle.classList.add('hold');
                navigator.vibrate(100); // Quick pulse for hold
                
                setTimeout(() => {
                    // Exhale
                    text.textContent = 'Exhale...';
                    circle.classList.add('exhale');
                    navigator.vibrate([50, 50, 50]); // Triple pulse for exhale
                    
                    setTimeout(() => {
                        circle.classList.remove('inhale', 'hold', 'exhale');
                        breathingCycle(); // Repeat
                    }, pattern.exhale * 1000);
                }, pattern.hold * 1000);
            } else {
                // Exhale (no hold)
                text.textContent = 'Exhale...';
                circle.classList.add('exhale');
                navigator.vibrate([50, 50, 50]); // Triple pulse for exhale
                
                setTimeout(() => {
                    circle.classList.remove('inhale', 'hold', 'exhale');
                    breathingCycle(); // Repeat
                }, pattern.exhale * 1000);
            }
        }, pattern.inhale * 1000);
    }

    breathingCycle(); // Start the cycle
}

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

    // Clear the breathing circle container until user clicks next
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

    // Add event listener to start button
    document.querySelector('.start-breathing-btn').addEventListener('click', () => {
        runBreathingCycle(pattern);
    });
}
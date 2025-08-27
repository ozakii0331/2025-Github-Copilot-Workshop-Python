let timer;
let isRunning = false;
let settings = {
    workMinutes: 25,
    shortBreakMinutes: 5,
    longBreakMinutes: 15,
    cycleCount: 4
};
let state = 'work'; // 'work', 'shortBreak', 'longBreak'
let cycle = 0; // 現在のサイクル数
let timeLeft = settings.workMinutes * 60;
let totalTime = settings.workMinutes * 60;
// 履歴・進捗用
let pomodoroCount = 0;
let focusSeconds = 0;

const timerDisplay = document.getElementById('timer-display');
const startBtn = document.getElementById('start-btn');
const resetBtn = document.getElementById('reset-btn');
const progressCircle = document.getElementById('progress-circle');
const stateLabel = document.getElementById('state-label');
const pomodoroCountElem = document.getElementById('pomodoro-count');
const focusTimeElem = document.getElementById('focus-time');
const historyListElem = document.getElementById('history-list');

function getTodayStr() {
    const now = new Date();
    return now.getFullYear() + '-' + String(now.getMonth()+1).padStart(2,'0') + '-' + String(now.getDate()).padStart(2,'0');
}

function loadHistory() {
    const raw = localStorage.getItem('pomodoroHistory');
    if (!raw) return {};
    try {
        return JSON.parse(raw);
    } catch {
        return {};
    }
}

function saveHistory(history) {
    localStorage.setItem('pomodoroHistory', JSON.stringify(history));
}

function addHistorySession(minutes) {
    const today = getTodayStr();
    const history = loadHistory();
    if (!history[today]) {
        history[today] = { count: 0, focus: 0 };
    }
    history[today].count += 1;
    history[today].focus += minutes;
    saveHistory(history);
}

function updateHistoryUI() {
    const history = loadHistory();
    const days = Object.keys(history).sort().reverse();
    historyListElem.innerHTML = '';
    days.forEach(day => {
        const item = document.createElement('li');
        item.innerHTML = `<span>${day}</span><span>${history[day].count}回 / ${history[day].focus}分</span>`;
        historyListElem.appendChild(item);
    });
}
const settingsForm = document.getElementById('settings-form');
const workInput = document.getElementById('work-minutes');
const shortBreakInput = document.getElementById('short-break-minutes');
const longBreakInput = document.getElementById('long-break-minutes');
const cycleInput = document.getElementById('cycle-count');
const settingsResetBtn = document.getElementById('settings-reset-btn');

function saveSettings() {
    settings.workMinutes = parseInt(workInput.value, 10);
    settings.shortBreakMinutes = parseInt(shortBreakInput.value, 10);
    settings.longBreakMinutes = parseInt(longBreakInput.value, 10);
    settings.cycleCount = parseInt(cycleInput.value, 10);
    localStorage.setItem('pomodoroSettings', JSON.stringify(settings));
}

function loadSettings() {
    const saved = localStorage.getItem('pomodoroSettings');
    if (saved) {
        try {
            const obj = JSON.parse(saved);
            if (typeof obj.workMinutes === 'number') settings.workMinutes = obj.workMinutes;
            if (typeof obj.shortBreakMinutes === 'number') settings.shortBreakMinutes = obj.shortBreakMinutes;
            if (typeof obj.longBreakMinutes === 'number') settings.longBreakMinutes = obj.longBreakMinutes;
            if (typeof obj.cycleCount === 'number') settings.cycleCount = obj.cycleCount;
        } catch {}
    }
    workInput.value = settings.workMinutes;
    shortBreakInput.value = settings.shortBreakMinutes;
    longBreakInput.value = settings.longBreakMinutes;
    cycleInput.value = settings.cycleCount;
}

function applySettings() {
    state = 'work';
    cycle = 0;
    totalTime = settings.workMinutes * 60;
    timeLeft = totalTime;
    updateDisplay();
    updateStateLabel();
}

function updateDisplay() {
    const min = String(Math.floor(timeLeft / 60)).padStart(2, '0');
    const sec = String(timeLeft % 60).padStart(2, '0');
    timerDisplay.textContent = `${min}:${sec}`;
    updateCircle();
}

function updateStateLabel() {
    if (state === 'work') {
        stateLabel.textContent = '作業中';
    } else if (state === 'shortBreak') {
        stateLabel.textContent = '短い休憩';
    } else if (state === 'longBreak') {
        stateLabel.textContent = '長い休憩';
    }
}

function updateCircle() {
    const percent = 1 - (timeLeft / totalTime);
    const r = 80;
    const c = 2 * Math.PI * r;
    progressCircle.setAttribute('stroke-dasharray', c);
    progressCircle.setAttribute('stroke-dashoffset', c * (1 - percent));
}

function updateProgress() {
    startBtn.textContent = '開始';
    // 状態遷移
    const today = getTodayStr();
    const history = loadHistory();
    pomodoroCount = history[today]?.count || 0;
    focusSeconds = (history[today]?.focus || 0) * 60;
    pomodoroCountElem.textContent = pomodoroCount;
    const h = Math.floor(focusSeconds / 3600);
    const m = Math.floor((focusSeconds % 3600) / 60);
    let text = '';
    if (h > 0) text += `${h}時間`;
    if (m > 0) text += `${m}分`;
    if (text === '') text = '0分';
    focusTimeElem.textContent = text;
    updateHistoryUI();
}

function tick() {
    if (timeLeft > 0) {
        timeLeft--;
        updateDisplay();
    } else {
        clearInterval(timer);
        isRunning = false;
        // 状態遷移
        if (state === 'work') {
            cycle++;
            // 履歴保存
            addHistorySession(settings.workMinutes);
            updateProgress();
            if (cycle < settings.cycleCount) {
                // 短い休憩へ
                state = 'shortBreak';
                totalTime = settings.shortBreakMinutes * 60;
                timeLeft = totalTime;
                updateStateLabel();
                updateDisplay();
                setTimeout(() => {
                    timer = setInterval(tick, 1000);
                    isRunning = true;
                }, 1000);
                alert('作業終了！休憩しましょう');
            } else {
                // 長い休憩へ
                state = 'longBreak';
                totalTime = settings.longBreakMinutes * 60;
                timeLeft = totalTime;
                updateStateLabel();
                updateDisplay();
                setTimeout(() => {
                    timer = setInterval(tick, 1000);
                    isRunning = true;
                }, 1000);
                alert('サイクル完了！長い休憩です');
                cycle = 0; // サイクルリセット
            }
        } else if (state === 'shortBreak') {
            // 作業へ
            state = 'work';
            totalTime = settings.workMinutes * 60;
            timeLeft = totalTime;
            updateStateLabel();
            updateDisplay();
            setTimeout(() => {
                timer = setInterval(tick, 1000);
                isRunning = true;
            }, 1000);
            alert('休憩終了！作業に戻りましょう');
        } else if (state === 'longBreak') {
            // 作業へ
            state = 'work';
            totalTime = settings.workMinutes * 60;
            timeLeft = totalTime;
            updateStateLabel();
            updateDisplay();
            setTimeout(() => {
                timer = setInterval(tick, 1000);
                isRunning = true;
            }, 1000);
            alert('長い休憩終了！作業に戻りましょう');
        }
    }
}

startBtn.onclick = function() {
    if (!isRunning) {
        timer = setInterval(tick, 1000);
        isRunning = true;
        startBtn.textContent = '一時停止';
        updateStateLabel();
    } else {
        clearInterval(timer);
        isRunning = false;
        startBtn.textContent = '開始';
    }
};
startBtn.textContent = '開始';

resetBtn.onclick = function() {
    clearInterval(timer);
    if (state === 'work') {
        totalTime = settings.workMinutes * 60;
    } else if (state === 'shortBreak') {
        totalTime = settings.shortBreakMinutes * 60;
    } else if (state === 'longBreak') {
        totalTime = settings.longBreakMinutes * 60;
    }
    timeLeft = totalTime;
    updateDisplay();
    isRunning = false;
    updateStateLabel();
    startBtn.textContent = '開始';
};

settingsForm.onsubmit = function(e) {
    e.preventDefault();
    saveSettings();
    applySettings();
    isRunning = false;
    clearInterval(timer);
};

settingsResetBtn.onclick = function() {
    workInput.value = 25;
    function tick() {
        if (timeLeft > 0) {
            timeLeft--;
            updateDisplay();
        } else {
            clearInterval(timer);
            isRunning = false;
            startBtn.textContent = '開始';
            // 状態遷移
            if (state === 'work') {
                cycle++;
                // 履歴保存
                addHistorySession(settings.workMinutes);
                updateProgress();
                if (cycle < settings.cycleCount) {
                    // 短い休憩へ
                    state = 'shortBreak';
                    totalTime = settings.shortBreakMinutes * 60;
                    timeLeft = totalTime;
                    updateStateLabel();
                    updateDisplay();
                    setTimeout(() => {
                        timer = setInterval(tick, 1000);
                        isRunning = true;
                        startBtn.textContent = '一時停止';
                    }, 1000);
                    alert('作業終了！休憩しましょう');
                } else {
                    // 長い休憩へ
                    state = 'longBreak';
                    totalTime = settings.longBreakMinutes * 60;
                    timeLeft = totalTime;
                    updateStateLabel();
                    updateDisplay();
                    setTimeout(() => {
                        timer = setInterval(tick, 1000);
                        isRunning = true;
                        startBtn.textContent = '一時停止';
                    }, 1000);
                    alert('サイクル完了！長い休憩です');
                    cycle = 0; // サイクルリセット
                }
            } else if (state === 'shortBreak') {
                // 作業へ
                state = 'work';
                totalTime = settings.workMinutes * 60;
                timeLeft = totalTime;
                updateStateLabel();
                updateDisplay();
                setTimeout(() => {
                    timer = setInterval(tick, 1000);
                    isRunning = true;
                    startBtn.textContent = '一時停止';
                }, 1000);
                alert('休憩終了！作業に戻りましょう');
            } else if (state === 'longBreak') {
                // 作業へ
                state = 'work';
                totalTime = settings.workMinutes * 60;
                timeLeft = totalTime;
                updateStateLabel();
                updateDisplay();
                setTimeout(() => {
                    timer = setInterval(tick, 1000);
                    isRunning = true;
                    startBtn.textContent = '一時停止';
                }, 1000);
                alert('長い休憩終了！作業に戻りましょう');
            }
        }
    }
}

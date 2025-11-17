// Weather app
const apiKey = "25d97c5287fc918958f621e52feeef37";
const apiUrl = "https://api.openweathermap.org/data/2.5/weather?&units=metric";

// Fetch and display weather for a city. If `city` is not provided,
// the function reads the value from the search input (`#weather-input`).
async function checkWeather(city) {
  const cityName = (city || document.getElementById('weather-input').value || '').trim();
  if (!cityName) {
    alert('Please enter a city name');
    return;
  }

  try {
    const response = await fetch(apiUrl + `&q=${encodeURIComponent(cityName)}` + `&appid=${apiKey}`);
    if (!response.ok) {
      throw new Error('City not found or API error');
    }
    const data = await response.json();

  
    document.getElementById('weather-value').innerText = Math.round(data.main.temp);

   
    const condition = data.weather[0].main;
    const conditionImg = document.getElementById('condition');
    switch (condition) {
      case 'Clear':
        conditionImg.src = './images/Sun.svg';
        break;
      case 'Clouds':
        conditionImg.src = './images/Cloud.svg';
        break;
      case 'Rain':
      case 'Drizzle':
        conditionImg.src = './images/CloudRain.svg';
        break;
      case 'Thunderstorm':
        conditionImg.src = './images/thunder.svg';
        break;
      case 'Snow':
        conditionImg.src = './images/snow.svg';
        break;
      case 'Mist':
      case 'Fog':
        conditionImg.src = './images/fog.svg';
        break;
      default:
        conditionImg.src = './images/Sun.svg';
    }

    document.getElementById('weather-city').innerText = data.name;
  } catch (err) {
    console.error(err);
    alert('Could not fetch weather: ' + err.message);
  }
}


const searchWeatherBtn = document.getElementById('search-weather-button');
if (searchWeatherBtn) searchWeatherBtn.addEventListener('click', () => checkWeather());

const weatherInput = document.getElementById('weather-input');
if (weatherInput) {
  weatherInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') checkWeather();
  });
}

const refreshBtn = document.getElementById("refresh-button");


const refreshIcon = document.querySelector('#refresh-button .refresh-icon');
function setLoading(isLoading) {
  if (searchWeatherBtn) searchWeatherBtn.disabled = isLoading;
  if (refreshBtn) refreshBtn.disabled = isLoading;
  if (refreshIcon) {
    if (isLoading) refreshIcon.classList.add('loading');
    else refreshIcon.classList.remove('loading');
  }
}

if (refreshBtn) {
  refreshBtn.addEventListener('click', () => {
    
    const displayedCity = (document.getElementById('weather-city')?.innerText || '').trim();
    const inputCity = (document.getElementById('weather-input')?.value || '').trim();
    const cityToRefresh = displayedCity || inputCity;
    if (!cityToRefresh) {
      alert('No city to refresh. Enter a city first.');
      return;
    }
    checkWeather(cityToRefresh);
  });
}

const originalCheckWeather = checkWeather;
checkWeather = async function(city) {
  try {
    setLoading(true);
    await originalCheckWeather(city);
  } finally {
    setLoading(false);
  }
};


function updateNavClock() {
  const hoursEl = document.getElementById('time-hours');
  const dayEl = document.getElementById('time-day');
  const monthEl = document.getElementById('time-month');
  const dateEl = document.getElementById('time-date');
  if (!hoursEl && !dayEl && !monthEl && !dateEl) return;

  const now = new Date();
  const hours = now.getHours();
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const hours12 = hours % 12 || 12;
  if (hoursEl) hoursEl.innerText = `${hours12}:${minutes} ${ampm}`;

  const dayNames = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
  const monthNames = ['january','february','march','april','may','june','july','august','september','october','november','december'];
  if (dayEl) dayEl.innerText = dayNames[now.getDay()];
  if (monthEl) monthEl.innerText = monthNames[now.getMonth()];
  if (dateEl) dateEl.innerText = String(now.getDate());
}

// start the nav clock (update every second so minutes change promptly)
updateNavClock();
setInterval(updateNavClock, 1000);


const taskInput = document.getElementById('to-do-list-input');
const addtaskBtn = document.getElementById('to-do-list-add-task-button');
const taskList = document.getElementById('to-do-list-lists-container');

function createTaskElement(text) {
  const li = document.createElement('li');
  li.classList.add('unchecked');

  const section = document.createElement('section');

  const toggleBtn = document.createElement('button');
  toggleBtn.className = 'todo-toggle';
  const toggleImg = document.createElement('img');
  toggleImg.src = './images/unchecked.svg';
  toggleImg.alt = 'toggle';
  toggleBtn.appendChild(toggleImg);

  const p = document.createElement('p');
  p.textContent = text;

  section.appendChild(toggleBtn);
  section.appendChild(p);

  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'todo-delete';
  const delImg = document.createElement('img');
  delImg.src = './images/X.svg';
  delImg.alt = 'delete';
  deleteBtn.appendChild(delImg);

  li.appendChild(section);
  li.appendChild(deleteBtn);
  return li;
}


function saveTasks() {
  if (!taskList) return;
  const arr = Array.from(taskList.querySelectorAll('li')).map(li => ({
    text: li.querySelector('p')?.textContent || '',
    checked: li.classList.contains('checked')
  }));
  try {
    localStorage.setItem('luma_tasks', JSON.stringify(arr));
  } catch (e) {
    console.error('Could not save tasks', e);
  }
}

function loadTasks() {
  if (!taskList) return false;
  const raw = localStorage.getItem('luma_tasks');
  if (!raw) return false;
  try {
    const arr = JSON.parse(raw);
    taskList.innerHTML = '';
    arr.forEach(t => {
      const li = createTaskElement(t.text || '');
      if (t.checked) {
        li.classList.remove('unchecked');
        li.classList.add('checked');
        const img = li.querySelector('button.todo-toggle img');
        if (img) img.src = './images/checked.svg';
      }
      taskList.appendChild(li);
    });
    return true;
  } catch (e) {
    console.error('Could not load tasks', e);
    return false;
  }
}

// try to load persisted tasks first; if none exist, we'll keep static HTML
const _didLoad = loadTasks();

if (taskList) {
  Array.from(taskList.querySelectorAll('li')).forEach(li => {
    const sec = li.querySelector('section');
    if (sec) {
      const firstBtn = sec.querySelector('button');
      if (firstBtn) firstBtn.classList.add('todo-toggle');
    }
    const del = li.querySelector('button[id="to-do-list-delete-task-button"]') || li.querySelector('button:last-of-type');
    if (del) {
      del.classList.add('todo-delete');

      if (del.id) del.removeAttribute('id');
    }
    if (!li.classList.contains('checked') && !li.classList.contains('unchecked')) li.classList.add('unchecked');
    const img = li.querySelector('button.todo-toggle img');
    if (img) img.src = li.classList.contains('checked') ? './images/checked.svg' : './images/unchecked.svg';
  });
}

if (addtaskBtn && taskList && taskInput) {
  addtaskBtn.addEventListener('click', () => {
    const text = (taskInput.value || '').trim();
    if (!text) {
      alert("The input cannot be empty.");
      return;
    }
    const li = createTaskElement(text);
    taskList.appendChild(li);
    taskInput.value = '';
    saveTasks();
  });

  taskInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') addtaskBtn.click();
  });


  taskList.addEventListener('click', (e) => {
    const toggle = e.target.closest('button.todo-toggle');
    if (toggle) {
      const li = toggle.closest('li');
      if (!li) return;
      li.classList.toggle('checked');
      li.classList.toggle('unchecked');
      const img = toggle.querySelector('img');
      if (img) img.src = li.classList.contains('checked') ? './images/checked.svg' : './images/unchecked.svg';
      saveTasks();
      return;
    }

    const del = e.target.closest('button.todo-delete');
    if (del) {
      const li = del.closest('li');
      if (li) li.remove();
      saveTasks();
    }
  });
  if (!_didLoad) saveTasks();
}

//Pomodoro Timer 

const SESSIONS_KEY = 'luma_sessions';
function saveSessions(arr) {
  try {
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(arr || []));
  } catch (e) {
    console.error('Could not save sessions', e);
  }
}

function loadSessions() {
  try {
    const raw = localStorage.getItem(SESSIONS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) || [];
  } catch (e) {
    console.error('Could not load sessions', e);
    return [];
  }
}

function recordSession(seconds) {
  try {
    const sessions = loadSessions();
    sessions.push({ ts: Date.now(), seconds: Math.max(0, Math.floor(Number(seconds) || 0)) });
    saveSessions(sessions);
    updateTotalsDisplay();
  } catch (e) {
    console.error('Could not record session', e);
  }
}

function startOfToday() {
  const d = new Date(); d.setHours(0,0,0,0); return d.getTime();
}

function startOfWeek() {
  const d = new Date();
  // week starting Monday
  const day = d.getDay(); 
  const diff = (day + 6) % 7; 
  d.setDate(d.getDate() - diff);
  d.setHours(0,0,0,0);
  return d.getTime();
}

function startOfMonth() {
  const d = new Date(); d.setDate(1); d.setHours(0,0,0,0); return d.getTime();
}

function formatTotalSeconds(sec) {
  sec = Math.max(0, Math.floor(Number(sec) || 0));
  const hrs = Math.floor(sec / 3600);
  const mins = Math.floor((sec % 3600) / 60);
  if (hrs > 0) return `${hrs} hrs ${mins} mins`;
  return `${mins} mins`;
}

function updateTotalsDisplay() {
  const sessions = loadSessions();
  const now = Date.now();
  const todayStart = startOfToday();
  const weekStart = startOfWeek();
  const monthStart = startOfMonth();
  let today = 0, week = 0, month = 0;
  sessions.forEach(s => {
    if (!s || !s.ts) return;
    const ts = Number(s.ts) || 0;
    const seconds = Number(s.seconds) || 0;
    if (ts >= todayStart) today += seconds;
    if (ts >= weekStart) week += seconds;
    if (ts >= monthStart) month += seconds;
  });
  const elToday = document.getElementById('total-time-today');
  const elWeek = document.getElementById('total-time-this-week');
  const elMonth = document.getElementById('total-time-this-month');
  if (elToday) elToday.innerText = formatTotalSeconds(today);
  if (elWeek) elWeek.innerText = formatTotalSeconds(week);
  if (elMonth) elMonth.innerText = formatTotalSeconds(month);
}

updateTotalsDisplay();


(() => {
  const timerNextBox = document.querySelector('.timer-next-box');
  const nextTimeEl = document.getElementById('timer-next-time');
  const timerCurrentEl = document.getElementById('timer-current-time');
  const incBtn = document.getElementById('timer-next-time-increase');
  const decBtn = document.getElementById('timer-next-time-decrease');
  const controlImgs = document.querySelectorAll('#timer-card .timer-control-buttons img');
  const resetBtn = controlImgs[0];
  const playBtn = controlImgs[1];
  const skipBtn = controlImgs[2];

  if (!nextTimeEl || !timerCurrentEl || !timerNextBox) return;


  function parseTimeToSeconds(str) {
    if (!str) return 0;
    const parts = str.split(':').map(p => Number(p));
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    return Number(parts[0]) || 0;
  }

  function formatTime(seconds) {
    seconds = Math.max(0, Math.floor(seconds));
    if (seconds >= 3600) {
      const h = Math.floor(seconds / 3600);
      const m = Math.floor((seconds % 3600) / 60);
      const s = seconds % 60;
      return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  }

  let nextMode = timerNextBox.classList.contains('timer-next-work') ? 'work' : 'rest';
  let currentMode = nextMode === 'work' ? 'rest' : 'work';

  const parsedNext = parseTimeToSeconds(nextTimeEl.innerText || '5:00');
  const parsedCurrent = parseTimeToSeconds(timerCurrentEl.innerText || '25:00');
  const durations = { work: 25 * 60, rest: 5 * 60 };
  durations[nextMode] = parsedNext || durations[nextMode];
  durations[currentMode] = parsedCurrent || durations[currentMode];

  let remaining = durations[currentMode];
  let intervalId = null;
  let running = false;

  function updateNextBoxClass() {
    timerNextBox.classList.toggle('timer-next-work', nextMode === 'work');
    timerNextBox.classList.toggle('timer-next-rest', nextMode === 'rest');
  }

  function updateDisplays() {
    timerCurrentEl.innerText = formatTime(remaining);
    nextTimeEl.innerText = formatTime(durations[nextMode]);
    updateNextBoxClass();
  }

  function startTimer() {
    if (running) return;
    running = true;
    if (playBtn) {
      try { playBtn.src = './images/Pause.svg';
       } catch (e) { /* ignore */ }
    }
    intervalId = setInterval(() => {
      remaining -= 1;
      if (remaining <= 0) {
        // end of session
        clearInterval(intervalId);
        intervalId = null;
        running = false;
        endSession();
        return;
      }
      updateDisplays();
    }, 1000);
  }

  function pauseTimer() {
    if (!running) return;
    running = false;
    if (playBtn) {
      playBtn.style.opacity = '1';
      try { playBtn.src = './images/Play.svg'; } catch (e) { /* ignore */ }
    }
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  }

  function resetTimer() {
    pauseTimer();
    remaining = durations[currentMode];
    updateDisplays();
  }

  function switchModes() {
    // swap current and next
    currentMode = currentMode === 'work' ? 'rest' : 'work';
    nextMode = nextMode === 'work' ? 'rest' : 'work';
  }

  function endSession() {

    if (currentMode === 'work') {
      // record completed work session (seconds)
      try { recordSession(durations['work']); } catch (e) { console.error(e); }
    }
    switchModes();
    remaining = durations[currentMode];
    updateDisplays();
    // auto-start next session
    startTimer();
  }

  function changeNextDuration(deltaMinutes) {
    const key = nextMode;
    const newVal = Math.max(1 * 60, durations[key] + deltaMinutes * 60);
    durations[key] = newVal;
    updateDisplays();
  }

  // wire controls
  if (incBtn) incBtn.addEventListener('click', () => changeNextDuration(1));
  if (decBtn) decBtn.addEventListener('click', () => changeNextDuration(-1));
  if (resetBtn) resetBtn.addEventListener('click', resetTimer);
  if (playBtn) playBtn.addEventListener('click', () => (running ? pauseTimer() : startTimer()));
  if (skipBtn) skipBtn.addEventListener('click', () => {
    pauseTimer();
    endSession();
  });

  // initialize displays
  updateDisplays();
})();
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const nightDisplay = document.getElementById('nightDisplay');
const scoreDisplay = document.getElementById('scoreDisplay');
const timeDisplay = document.getElementById('timeDisplay');
const endScreen = document.getElementById('end-screen');
const finalScore = document.getElementById('finalScore');

let score = 0;
let timeLeft = 60;
let nightCount = 1;
let gameInterval;
let eventInterval;
let isPlaying = false;
let gameStarted = false;

// Difficulty system
let eventSpawnRate = 4000;
let snoreLoudSoundPlaying = false;

// Animation
let frameCount = 0;
let roomShakeX = 0;
let roomShakeY = 0;
let shakeTimer = 0;

const images = {
  room: new Image(),
  fazzoletti: new Image(),
  gocce: new Image(),
  coperta: new Image(),
  panino: new Image(),
  telefono: new Image()
};

images.room.src = 'https://github.com/paolocala04/paolocala04.github.io/tree/main/client/room_bg_new.png';
images.fazzoletti.src = 'https://github.com/paolocala04/paolocala04.github.io/tree/main/client/fazzoletti.png';
images.gocce.src = 'https://github.com/paolocala04/paolocala04.github.io/tree/main/client/gocce_naso.png';
images.coperta.src = 'https://github.com/paolocala04/paolocala04.github.io/tree/main/client/coperta.png';
images.panino.src = 'https://github.com/paolocala04/paolocala04.github.io/tree/main/client/panino.png';
images.telefono.src = 'https://github.com/paolocala04/paolocala04.github.io/tree/main/client/telefono.png';

// Sounds - initialized null, will be created on first user interaction
let eventSnoreSound = null;
let phoneRingSound = null;
let coldSound = null;
let eatingSound = null;
let noseSound = null;
let hungerSound = null;
let backgroundMusic = null;
let audioInitialized = false;

function initializeAudio() {
  if (audioInitialized) return;
  
  eventSnoreSound = new Audio('https://github.com/paolocala04/paolocala04.github.io/tree/main/client/snoring.mp3');
  phoneRingSound = new Audio('https://github.com/paolocala04/paolocala04.github.io/tree/main/client/phone_ring.mp3');
  coldSound = new Audio('https://github.com/paolocala04/paolocala04.github.io/tree/main/client/cold_sound.mp3');
  eatingSound = new Audio('https://github.com/paolocala04/paolocala04.github.io/tree/main/client/eating.mp3');
  noseSound = new Audio('https://github.com/paolocala04/paolocala04.github.io/tree/main/client/nose_sound.mp3');
  hungerSound = new Audio('https://github.com/paolocala04/paolocala04.github.io/tree/main/client/hunger_sound.mp3');
  backgroundMusic = new Audio('https://github.com/paolocala04/paolocala04.github.io/tree/main/client/background_music.mp3');
  
  eventSnoreSound.loop = false;
  eventSnoreSound.volume = 0.6;
  phoneRingSound.loop = false;
  phoneRingSound.volume = 0.6;
  coldSound.loop = false;
  coldSound.volume = 0.6;
  eatingSound.loop = false;
  eatingSound.volume = 0.7;
  noseSound.loop = false;
  noseSound.volume = 0.6;
  hungerSound.loop = false;
  hungerSound.volume = 0.6;
  backgroundMusic.loop = true;
  backgroundMusic.volume = 0.25;
  
  audioInitialized = true;
}

let activeEvents = [];
let lastEventId = null;
const EVENT_TYPES = [
  { id: 'snore', icon: '💧', text: 'Ad Andrea cola il naso!', type: 'drag' },
  { id: 'snore_loud', icon: '💤', text: 'Andrea sta russando!', type: 'drag' },
  { id: 'blanket', icon: '🛏️', text: 'Andrea ha freddo!', type: 'drag' },
  { id: 'phone', icon: '📱', text: 'Il telefono di Andrea sta squillando!', type: 'drag' },
  { id: 'food', icon: '🥪', text: 'Andrea ha fame!', type: 'drag' },
  { id: 'snore', icon: '💧', text: 'Ad Andrea cola il naso!', type: 'drag' },
  { id: 'snore_loud', icon: '💤', text: 'Andrea sta russando!', type: 'drag' },
  { id: 'blanket', icon: '🛏️', text: 'Andrea ha freddo!', type: 'drag' },
  { id: 'phone', icon: '📱', text: 'Il telefono di Andrea sta squillando!', type: 'drag' },
  { id: 'food', icon: '🥪', text: 'Andrea ha fame!', type: 'drag' },
  { id: 'snore', icon: '💧', text: 'Ad Andrea cola il naso!', type: 'drag' },
  { id: 'blanket', icon: '🛏️', text: 'Andrea ha freddo!', type: 'drag' },
  { id: 'snore_loud', icon: '💤', text: 'Andrea sta russando!', type: 'drag' },
  { id: 'phone', icon: '📱', text: 'Il telefono di Andrea sta squillando!', type: 'drag' },
  { id: 'food', icon: '🥪', text: 'Andrea ha fame!', type: 'drag' },
  { id: 'snore', icon: '💧', text: 'Ad Andrea cola il naso!', type: 'drag' },
  { id: 'blanket', icon: '🛏️', text: 'Andrea ha freddo!', type: 'drag' },
  { id: 'snore_loud', icon: '💤', text: 'Andrea sta russando!', type: 'drag' },
  { id: 'food', icon: '🥪', text: 'Andrea ha fame!', type: 'drag' },
  { id: 'phone', icon: '📱', text: 'Il telefono di Andrea sta squillando!', type: 'drag' }
];

function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  canvas.style.width = window.innerWidth + 'px';
  canvas.style.height = window.innerHeight + 'px';
  ctx.scale(dpr, dpr);
  if (!gameStarted) drawMenu();
}
window.addEventListener('resize', resizeCanvas);

function drawMenu() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  ctx.fillStyle = '#120A2B';
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = 'white';
  
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  const title = 'Dormi con Andrea Simulator';
  const maxWidth = w * 0.9;
  
  let fontSize = Math.min(48, w / 8);
  ctx.font = `bold ${fontSize}px Inter`;
  
  let metrics = ctx.measureText(title);
  while (metrics.width > maxWidth && fontSize > 16) {
    fontSize -= 2;
    ctx.font = `bold ${fontSize}px Inter`;
    metrics = ctx.measureText(title);
  }
  
  ctx.fillText(title, w / 2, h / 2 - 40);
  
  ctx.font = `${Math.max(16, fontSize * 0.5)}px Inter`;
  ctx.fillText('Tocca per iniziare la notte...', w / 2, h / 2 + 40);
}

function init() {
  score = 0;
  timeLeft = 60;
  activeEvents = [];
  isPlaying = true;
  gameStarted = true;
  snoreLoudSoundPlaying = false;
  endScreen.classList.remove('visible');
  updateUI();
  
  // Initialize audio on first user interaction (mobile requirement)
  if (!audioInitialized) {
    initializeAudio();
  }
  
  // Resume audio context for mobile and start background music
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  
  if (backgroundMusic) {
    playSound(backgroundMusic);
  }
  
  clearInterval(gameInterval);
  gameInterval = setInterval(() => {
    timeLeft--;
    updateUI();
    if (timeLeft <= 0) endGame();
  }, 1000);
  
  scheduleNextEvent();
  requestAnimationFrame(gameLoop);
}

function scheduleNextEvent() {
  if (!isPlaying) return;
  const delay = Math.random() * 2000 + eventSpawnRate;
  eventInterval = setTimeout(() => {
    spawnEvent();
    scheduleNextEvent();
  }, delay);
}

function playSound(audio) {
  if (!audio) return;
  try {
    audio.pause();
    audio.currentTime = 0;
    
    // Try to resume audio context if suspended (mobile requirement)
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume().catch(err => {
        console.log('AudioContext resume error:', err);
      });
    }
    
    // Use longer setTimeout for mobile to ensure proper state reset
    setTimeout(() => {
      try {
        // Ensure audio is loaded before playing
        if (audio.readyState >= 2) {
          // Audio is loaded, can play immediately
          const playPromise = audio.play();
          if (playPromise !== undefined) {
            playPromise.catch(err => {
              console.log('Audio play error:', err);
              // Retry with longer delay if first attempt fails
              setTimeout(() => {
                audio.play().catch(() => {});
              }, 50);
            });
          }
        } else {
          // Wait for audio to load
          const canPlayHandler = () => {
            audio.removeEventListener('canplay', canPlayHandler);
            audio.play().catch(err => {
              console.log('Audio play error:', err);
            });
          };
          audio.addEventListener('canplay', canPlayHandler);
          audio.load();
        }
      } catch (e) {
        console.log('Audio error in setTimeout:', e);
      }
    }, 50);
  } catch (e) {
    console.log('Audio error:', e);
  }
}

function spawnEvent() {
  let type;
  let attempts = 0;
  
  // Evita di ripetere lo stesso imprevisto
  do {
    type = EVENT_TYPES[Math.floor(Math.random() * EVENT_TYPES.length)];
    attempts++;
  } while (type.id === lastEventId && attempts < 5);
  
  lastEventId = type.id;
  
  const layout = window.gameLayout || { x: 0, y: 0, w: canvas.width, h: canvas.height };
  
  const relX = 0.2 + Math.random() * 0.2;
  const relY = 0.4 + Math.random() * 0.3;
  
  const x = layout.x + relX * layout.w;
  const y = layout.y + relY * layout.h;
  
  activeEvents.push({ ...type, x: x, y: y, size: 60, createdAt: Date.now(), lifespan: 6000 });
  
  // Play event-specific sounds (only for events, not for resolution)
  if (type.id === 'phone') {
    playSound(phoneRingSound);
  } else if (type.id === 'snore_loud') {
    playSound(eventSnoreSound);
  } else if (type.id === 'blanket') {
    playSound(coldSound);
  } else if (type.id === 'food') {
    playSound(hungerSound);
  }
}

function updateUI() {
  scoreDisplay.innerText = `❤️ ${score}`;
  timeDisplay.innerText = `⏳ ${timeLeft}s`;
  nightDisplay.innerText = `🌙 Notte ${nightCount}`;
}

function endGame() {
  isPlaying = false;
  if (eventSnoreSound) eventSnoreSound.pause();
  if (backgroundMusic) backgroundMusic.pause();
  clearInterval(gameInterval);
  clearTimeout(eventInterval);
  endScreen.classList.add('visible');
  finalScore.innerText = score;
}

window.restartGame = () => {
  nightCount++;
  eventSpawnRate = Math.max(2000, 4000 - nightCount * 200);
  init();
};

function handleStart(e) {
  if (!gameStarted) { init(); return; }
  if (!isPlaying) return;
  const rect = canvas.getBoundingClientRect();
  const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
  const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
  
  for (let i = activeEvents.length - 1; i >= 0; i--) {
    const ev = activeEvents[i];
    if (Math.hypot(x - ev.x, y - ev.y) < ev.size) {
      isDragging = true;
      draggedEvent = ev;
      break;
    }
  }
}

let isDragging = false, draggedEvent = null;
function handleMove(e) {
  if (!isPlaying || !isDragging || !draggedEvent) return;
  const rect = canvas.getBoundingClientRect();
  draggedEvent.x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
  draggedEvent.y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
}

function handleEnd() {
  if (!isPlaying || !isDragging || !draggedEvent) return;
  
  const layout = window.gameLayout;
  const targetX = layout.x + layout.w * 0.7;
  const targetY = layout.y + layout.h * 0.4;
  
  if (Math.hypot(draggedEvent.x - targetX, draggedEvent.y - targetY) < 150) {
    shakeTimer = 10;
    const eventType = draggedEvent.id;
    resolveEvent(activeEvents.indexOf(draggedEvent));
  }
  
  isDragging = false;
  draggedEvent = null;
}

function resolveEvent(index) {
  if (index < 0) return;
  const ev = activeEvents[index];
  
  if (ev.id === 'snore_loud' && eventSnoreSound) {
    eventSnoreSound.pause();
    eventSnoreSound.currentTime = 0;
    snoreLoudSoundPlaying = false;
  }
  
  if (ev.id === 'blanket' && coldSound) {
    coldSound.pause();
    coldSound.currentTime = 0;
  }
  
  if (ev.id === 'phone' && phoneRingSound) {
    phoneRingSound.pause();
    phoneRingSound.currentTime = 0;
  }
  
  // Pause hunger sound and play eating sound when resolving food event
  if (ev.id === 'food') {
    if (hungerSound) {
      hungerSound.pause();
      hungerSound.currentTime = 0;
    }
    playSound(eatingSound);
  }
  
  // Play nose sound when resolving nose event
  if (ev.id === 'snore') {
    playSound(noseSound);
  }
  
  activeEvents.splice(index, 1);
  score++;
  updateUI();
}

function draw() {
  const logicalW = window.innerWidth;
  const logicalH = window.innerHeight;
  ctx.clearRect(0, 0, logicalW, logicalH);
  frameCount++;

  if (shakeTimer > 0) {
    shakeTimer--;
    roomShakeX = (Math.random() - 0.5) * 10;
    roomShakeY = (Math.random() - 0.5) * 10;
  } else {
    roomShakeX = roomShakeY = 0;
  }

  if (images.room.complete) {
    const ratio = images.room.width / images.room.height;
    const canvasRatio = logicalW / logicalH;
    let w, h, x, y;
    if (canvasRatio > ratio) {
      h = logicalH;
      w = h * ratio;
      x = (logicalW - w) / 2;
      y = 0;
    } else {
      w = logicalW;
      h = w / ratio;
      x = 0;
      y = (logicalH - h) / 2;
    }
    window.gameLayout = { x, y, w, h };
    ctx.drawImage(images.room, x + roomShakeX, y + roomShakeY, w, h);
  }

  const now = Date.now();
  activeEvents.forEach((ev, i) => {
    const age = now - ev.createdAt;
    if (age > ev.lifespan && ev !== draggedEvent) {
      if (ev.id === 'snore_loud' && eventSnoreSound) {
        eventSnoreSound.pause();
        snoreLoudSoundPlaying = false;
      }
      activeEvents.splice(i, 1);
      return;
    }
    
    if (ev.id === 'snore_loud' && !snoreLoudSoundPlaying) {
      snoreLoudSoundPlaying = true;
      eventSnoreSound.currentTime = 0;
      eventSnoreSound.play().catch(() => {});
    }
    
    ctx.globalAlpha = (ev !== draggedEvent && age > ev.lifespan - 1000) ? 1 - ((age - (ev.lifespan - 1000)) / 1000) : 1.0;
    
    if (ev.id === 'snore' && images.fazzoletti.complete) {
      const gSize = ev.size * 2;
      ctx.drawImage(images.fazzoletti, ev.x - gSize/2, ev.y - gSize/2, gSize, gSize);
    } else if (ev.id === 'snore_loud' && images.gocce.complete) {
      const baseSize = ev.size * 2;
      const imgRatio = images.gocce.width / images.gocce.height;
      const w = baseSize * imgRatio;
      const h = baseSize;
      ctx.drawImage(images.gocce, ev.x - w/2, ev.y - h/2, w, h);
    } else if (ev.id === 'blanket' && images.coperta.complete) {
      const gSize = ev.size * 2;
      ctx.drawImage(images.coperta, ev.x - gSize/2, ev.y - gSize/2, gSize, gSize);
    } else if (ev.id === 'food' && images.panino.complete) {
      const gSize = ev.size * 2;
      ctx.drawImage(images.panino, ev.x - gSize/2, ev.y - gSize/2, gSize, gSize);
    } else if (ev.id === 'phone' && images.telefono.complete) {
      const gSize = ev.size * 2;
      ctx.drawImage(images.telefono, ev.x - gSize/2, ev.y - gSize/2, gSize, gSize);
    } else {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.beginPath();
      ctx.arc(ev.x, ev.y, ev.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ff4d6d';
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.font = '30px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(ev.icon, ev.x, ev.y + 2);
    }
    
    ctx.fillStyle = 'white';
    ctx.font = 'bold 16px Inter';
    ctx.shadowBlur = 4;
    ctx.shadowColor = 'black';
    ctx.fillText(ev.text, ev.x, ev.y - ev.size - 10);
    ctx.shadowBlur = 0;
    
    ctx.globalAlpha = 1.0;
  });
}

function gameLoop() {
  if (gameStarted) draw();
  requestAnimationFrame(gameLoop);
}

resizeCanvas();
drawMenu();
canvas.addEventListener('mousedown', handleStart);
canvas.addEventListener('mousemove', handleMove);
canvas.addEventListener('mouseup', handleEnd);
canvas.addEventListener('touchstart', (e) => { e.preventDefault(); handleStart(e); }, {passive: false});
canvas.addEventListener('touchmove', handleMove, {passive: false});
canvas.addEventListener('touchend', handleEnd);
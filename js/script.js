let timer;
let isRunning = false;
let isBreak = false;
let timeLeft = 25 * 60;

const timerEl = document.getElementById("timer");
const playPauseBtn = document.getElementById("playPauseBtn");
const resetBtn = document.getElementById("resetBtn");
const saveConfigBtn = document.getElementById("saveConfigBtn");
const toggleConfigBtn = document.getElementById("toggleConfig");
const configSection = document.getElementById("configSection");
const removeBgBtn = document.getElementById("removeBgBtn");
const bgPreview = document.getElementById("bgPreview");

const focusInput = document.getElementById("focusTime");
const breakInput = document.getElementById("breakTime");
const bgImageFileInput = document.getElementById("bgImageFile");

const cropperModal = document.getElementById("cropperModal");
const cropperImage = document.getElementById("cropperImage");
const cropBtn = document.getElementById("cropBtn");
const cancelCropBtn = document.getElementById("cancelCropBtn");

let bgImageBase64 = "";
let cropper;

function updateDisplay() {
  const minutes = Math.floor(timeLeft / 60).toString().padStart(2,"0");
  const seconds = (timeLeft % 60).toString().padStart(2,"0");
  timerEl.textContent = `${minutes}:${seconds}`;
}

function startTimer() {
  if (isRunning) return;
  isRunning = true;
  playPauseBtn.textContent = "⏸";
  timer = setInterval(() => {
    if (timeLeft > 0) {
      timeLeft--;
      updateDisplay();
    } else {
      clearInterval(timer);
      isRunning = false;
      playPauseBtn.textContent = "▶";
      isBreak = !isBreak;
      timeLeft = (isBreak ? getBreakTime() : getFocusTime()) * 60;
      updateDisplay();
      alert(isBreak ? "☕ Hora da pausa!" : "💪 Hora de focar!");
    }
  },1000);
}

function pauseTimer() {
  clearInterval(timer);
  isRunning = false;
  playPauseBtn.textContent = "▶";
}

function togglePlayPause() {
  isRunning ? pauseTimer() : startTimer();
}

function resetTimer() {
  clearInterval(timer);
  isRunning = false;
  isBreak = false;
  timeLeft = getFocusTime() * 60;
  updateDisplay();
  playPauseBtn.textContent = "▶";
}

function getFocusTime() { return parseInt(focusInput.value)||25; }
function getBreakTime() { return parseInt(breakInput.value)||5; }

function saveConfig() {
  if (bgImageBase64) {
    document.body.style.backgroundImage = `url('${bgImageBase64}')`;
  } else {
    document.body.style.background = "#121212";
  }
  localStorage.setItem("pomodoroConfig", JSON.stringify({
    focus: getFocusTime(),
    break: getBreakTime(),
    bg: bgImageBase64
  }));
  resetTimer();
}

function loadConfig() {
  const config = JSON.parse(localStorage.getItem("pomodoroConfig"));
  if(config){
    focusInput.value = config.focus;
    breakInput.value = config.break;
    bgImageBase64 = config.bg || "";

    if(bgImageBase64){
      document.body.style.backgroundImage = `url('${bgImageBase64}')`;
      bgPreview.style.backgroundImage = `url('${bgImageBase64}')`;
      bgPreview.classList.remove("hidden");
      removeBgBtn.classList.remove("hidden");
    }
    timeLeft = config.focus*60;
  }
  updateDisplay();
}

// Cropper
bgImageFileInput.addEventListener("change", e => {
  const file = e.target.files[0];
  if(!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    cropperImage.src = reader.result;
    cropperModal.classList.remove("hidden");

    if(cropper) cropper.destroy();
    cropper = new Cropper(cropperImage, {
      aspectRatio: window.innerWidth/window.innerHeight,
      viewMode: 1,
      autoCropArea: 1
    });
  };
  reader.readAsDataURL(file);
});

cropBtn.addEventListener("click", ()=>{
  const canvas = cropper.getCroppedCanvas({
    width: window.innerWidth,
    height: window.innerHeight
  });
  bgImageBase64 = canvas.toDataURL("image/jpeg");
  document.body.style.backgroundImage = `url('${bgImageBase64}')`;
  bgPreview.style.backgroundImage = `url('${bgImageBase64}')`;
  bgPreview.classList.remove("hidden");
  removeBgBtn.classList.remove("hidden");
  cropperModal.classList.add("hidden");
  cropper.destroy();
});

cancelCropBtn.addEventListener("click", ()=>{
  cropperModal.classList.add("hidden");
  cropper.destroy();
});

removeBgBtn.addEventListener("click", ()=>{
  bgImageBase64 = "";
  document.body.style.background = "#121212";
  bgPreview.classList.add("hidden");
  removeBgBtn.classList.add("hidden");
});

toggleConfigBtn.addEventListener("click", ()=>{ configSection.classList.toggle("hidden"); });
playPauseBtn.addEventListener("click", togglePlayPause);
resetBtn.addEventListener("click", resetTimer);
saveConfigBtn.addEventListener("click", saveConfig);

window.onload = loadConfig;

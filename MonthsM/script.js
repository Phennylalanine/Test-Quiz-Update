// ----------------------
// QUIZ STATE VARIABLES
// ----------------------
let currentQuestionIndex = 0;
let score = 0;
let combo = 0;
let level = 1;
let xp = 0;
let questions = [];
let answered = false;

const maxComboForBonus = 5;

// ----------------------
// DOM ELEMENTS
// ----------------------
const jpText = document.getElementById("jpText");
const enText = document.getElementById("enText");
const answerInput = document.getElementById("answerInput");
const feedback = document.getElementById("feedback");
const nextBtn = document.getElementById("nextBtn");
const tryAgainBtn = document.getElementById("tryAgainBtn");
const choicesContainer = document.getElementById("choicesText");

const pointsEl = document.getElementById("quizScore");
const comboEl = document.getElementById("combo") || { textContent: "" };
const levelEl = document.getElementById("quizLevel");
const xpBar = document.getElementById("xpBar");
const xpText = document.getElementById("xpText");

// Confetti
const confettiCanvas = document.getElementById("confettiCanvas");
const ctx = confettiCanvas.getContext("2d");
let confettiParticles = [];

// ----------------------
// EVENT LISTENERS
// ----------------------
document.getElementById("startBtn").addEventListener("click", startQuiz);

nextBtn.addEventListener("click", () => {
  if (answered) {
    currentQuestionIndex++;
    loadNextQuestion();
  }
});

answerInput.addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    if (!answered) {
      checkAnswer();
    } else if (!nextBtn.disabled) {
      nextBtn.click();
    }
  }
});

tryAgainBtn.addEventListener("click", tryAgain);

window.addEventListener("DOMContentLoaded", () => {
  loadProgress();
  resizeCanvas();
});
window.addEventListener("resize", resizeCanvas);
setInterval(drawConfetti, 30);

// ----------------------
// QUIZ FUNCTIONS
// ----------------------
function startQuiz() {
  document.getElementById("startScreen").classList.remove("active");
  document.getElementById("quizScreen").classList.add("active");

  fetch("questions.csv")
    .then((response) => response.text())
    .then((data) => {
      questions = parseCSV(data);
      shuffleArray(questions);
      loadNextQuestion();
    })
    .catch((err) => {
      console.error("Failed to load questions.csv:", err);
    });
}

function parseCSV(data) {
  const lines = data.trim().split("\n");
  return lines.slice(1).map((line) => {
    const [jp, en] = line.split(",");
    return { jp: jp.trim(), en: en.trim() };
  });
}

function loadNextQuestion() {
  if (currentQuestionIndex >= questions.length) {
    currentQuestionIndex = 0;
    shuffleArray(questions);
  }

  const question = questions[currentQuestionIndex];
  jpText.textContent = question.jp;
  speak(question.en);

  // Display options (not clickable)
  const correctAnswer = question.en;
  const wrongAnswers = questions.filter(q => q.en !== correctAnswer).map(q => q.en);
  shuffleArray(wrongAnswers);
  const options = [correctAnswer, ...wrongAnswers.slice(0, 3)];
  shuffleArray(options);

  choicesContainer.innerHTML = "<strong>Choices:</strong><br>";
  options.forEach(opt => {
    const span = document.createElement("span");
    span.textContent = opt;
    span.className = "choice-option";
    choicesContainer.appendChild(span);
  });

  answerInput.value = "";
  answerInput.disabled = false;
  answerInput.focus();

  feedback.textContent = "";
  feedback.style.color = "black";

  nextBtn.disabled = true;
  tryAgainBtn.style.display = "none";
  answered = false;
}

function checkAnswer() {
  if (answered) return;
  answered = true;

  const userAnswer = answerInput.value.trim().toLowerCase();
  const correctAnswer = questions[currentQuestionIndex].en.trim().toLowerCase();

  console.log("User:", `"${userAnswer}"`, "Correct:", `"${correctAnswer}"`);

  if (userAnswer === correctAnswer) {
    feedback.innerHTML = "✔️ <strong>Correct!</strong>";
    feedback.style.color = "green";
    combo++;
    score += 1;

    const xpBonus = combo >= 5 && combo % 5 === 0 ? combo / 5 : 1;
    gainXP(xpBonus);
    showFloatingXP(`+${xpBonus} XP`);

    updateStats();

    answerInput.disabled = true;
    nextBtn.disabled = false;
    tryAgainBtn.style.display = "none";
  } else {
    feedback.innerHTML = `✖️ <strong>Wrong!</strong><br>Correct: <span style="color: green;">${questions[currentQuestionIndex].en}</span>`;
    feedback.style.color = "red";
    combo = 0;

    updateStats();

    answerInput.disabled = true;
    nextBtn.disabled = true;
    tryAgainBtn.style.display = "inline-block";
  }
}

function tryAgain() {
  feedback.textContent = "";
  feedback.style.color = "black";
  answerInput.disabled = false;
  answerInput.value = "";
  answerInput.focus();

  tryAgainBtn.style.display = "none";
  nextBtn.disabled = true;
  answered = false;
}

// ----------------------
// XP & STATS
// ----------------------
function gainXP(amount) {
  let levelBefore = level;
  xp += amount;

  while (xp >= xpToNextLevel(level)) {
    xp -= xpToNextLevel(level);
    level++;
    feedback.innerHTML += `<br>🎉 Level Up! You are now level ${level}`;
  }

  if (level > levelBefore) {
    triggerConfetti();
  }

  saveProgress();
  updateStats();
  checkOverallLevelForPet(); // <- NEW: check milestones
}

function xpToNextLevel(currentLevel) {
  let xpRequired = 3;
  for (let i = 2; i <= currentLevel; i++) xpRequired += i;
  return xpRequired;
}

function updateStats() {
  if (pointsEl) pointsEl.textContent = score;
  if (comboEl) comboEl.textContent = combo;
  if (levelEl) levelEl.textContent = level;

  if (xpBar && xpText) {
    const needed = xpToNextLevel(level);
    const percent = (xp / needed) * 100;
    xpBar.style.width = `${Math.min(percent, 100)}%`;
    xpText.textContent = `${xp} / ${needed}`;
  }
}

function saveProgress() {
  localStorage.setItem("MonthMxp", xp);
  localStorage.setItem("MonthtMlevel", level);
}

function loadProgress() {
  const savedXP = localStorage.getItem("MonthMxp");
  const savedLevel = localStorage.getItem("MonthMlevel");

  if (savedXP !== null) xp = parseInt(savedXP, 10);
  if (savedLevel !== null) level = parseInt(savedLevel, 10);

  updateStats();
}

// ----------------------
// OVERALL LEVEL & PET MODAL
// ----------------------
function checkOverallLevelForPet() {
  const quizData = [
    { key: "monthsSlevel", multiplier: 0.2 },
    { key: "EventSlevel", multiplier: 0.2 },
    { key: "monthsMlevel", multiplier: 0.5 },
    { key: "EventMlevel", multiplier: 0.5 },
  ];

  const overallLevel = Math.round(
    quizData.reduce((sum, { key, multiplier }) => {
      const value = parseInt(localStorage.getItem(key)) || 0;
      return sum + value * multiplier;
    }, 0)
  );

  // First milestone: overall level 3
  if (!localStorage.getItem("petModalShown3") && overallLevel >= 3) {
    localStorage.setItem("petModalShown3", "true");
    alert("🎉 Overall Level 3 reached! Go to the Quiz Hub to see your egg!");
    window.location.href = "https://phennylalanine.github.io/Test-Quiz-Update/";
  }
  // Second milestone: overall level 6
  else if (!localStorage.getItem("petModalShown6") && overallLevel >= 6) {
    localStorage.setItem("petModalShown6", "true");
    alert("🌟 Overall Level 6 reached! Go to the Quiz Hub to evolve your pet!");
    window.location.href = "https://phennylalanine.github.io/Test-Quiz-Update/";
  }
}

// ----------------------
// CONFETTI
// ----------------------
function triggerConfetti() {
  for (let i = 0; i < 100; i++) {
    confettiParticles.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * -20,
      r: Math.random() * 6 + 2,
      d: Math.random() * 5 + 1,
      color: `hsl(${Math.floor(Math.random() * 360)}, 100%, 70%)`,
      tilt: Math.random() * 10 - 10,
    });
  }
}

function drawConfetti() {
  ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
  confettiParticles.forEach((p) => {
    ctx.beginPath();
    ctx.fillStyle = p.color;
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2, true);
    ctx.fill();
  });
  updateConfetti();
}

function updateConfetti() {
  for (let i = 0; i < confettiParticles.length; i++) {
    const p = confettiParticles[i];
    p.y += p.d;
    p.x += Math.sin(p.tilt) * 2;

    if (p.y > confettiCanvas.height) {
      confettiParticles.splice(i, 1);
      i--;
    }
  }
}

function resizeCanvas() {
  confettiCanvas.width = window.innerWidth;
  confettiCanvas.height = window.innerHeight;
}

// ----------------------
// SPEECH
// ----------------------
function speak(text) {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-UK";
  speechSynthesis.speak(utterance);
}

function showFloatingXP(text) {
  const xpElem = document.createElement("div");
  xpElem.textContent = text;
  xpElem.className = "floating-xp";
  xpElem.style.left = `${Math.random() * 80 + 10}%`;
  xpElem.style.top = "50%";
  document.body.appendChild(xpElem);
  setTimeout(() => xpElem.remove(), 1500);
}

// ----------------------
// UTILS
// ----------------------
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

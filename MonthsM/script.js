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

// FIX: align with HTML IDs
const pointsEl = document.getElementById("quizScore");
const comboEl = document.getElementById("comboDisplay");
const levelEl = document.getElementById("quizLevel");
const xpBar = document.getElementById("xpBar");
const xpText = document.getElementById("xpText");

// Confetti
const confettiCanvas = document.getElementById("confettiCanvas");
const ctx = confettiCanvas.getContext("2d");
let confettiParticles = [];

// Pet modal
const petModal = document.getElementById("petModal");
const closeModalBtn = petModal.querySelector(".close");
const petChoices = petModal.querySelectorAll(".pet-choice");
const petModalTitle = document.getElementById("petModalTitle");
const petModalDesc = document.getElementById("petModalDesc");
const goHomepageBtn = document.getElementById("goHomepageBtn");

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

closeModalBtn.addEventListener("click", () => {
  petModal.style.display = "none";
});

goHomepageBtn.addEventListener("click", () => {
  // navigate back to your homepage (adjust path if needed)
  window.location.href = "index.html";
});

// ----------------------
// LOAD PROGRESS
// ----------------------
loadProgress();
checkPetEvolution(); // check at page load if modal should appear

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
    return { jp: (jp || "").trim(), en: (en || "").trim() };
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

  // Prepare answer options (display-only, not clickable)
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

  // Normalize answers for comparison
  const userAnswer = answerInput.value.trim().toLowerCase();
  const correctAnswer = questions[currentQuestionIndex].en.trim().toLowerCase();

  console.log("User:", `"${userAnswer}"`, "Correct:", `"${correctAnswer}"`);

  if (userAnswer === correctAnswer) {
    feedback.innerHTML = "✔️ <strong>Correct!</strong>";
    feedback.style.color = "green";
    combo++;
    score += 1;

    // XP bonus rule (unchanged)
    const xpBonus = combo >= 15 && combo % 5 === 0 ? (combo / 5) - 1 : 1;
    gainXP(xpBonus);
    showFloatingXP(`+${xpBonus} XP`);

    updateStats();

    answerInput.disabled = true;
    nextBtn.disabled = false;
    tryAgainBtn.style.display = "none";
  } else {
    const correctDisplay = questions[currentQuestionIndex].en.trim();
    feedback.innerHTML = `✖️ <strong>Wrong!</strong><br>Correct answer: <span style="color: green;">${correctDisplay}</span>`;
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
    // keep homepage "overallLevel" in sync (export)
    syncOverallLevel();
    // re-check milestones to show modal if needed
    checkPetEvolution();
  }

  saveProgress();
  updateStats();
}

function xpToNextLevel(currentLevel) {
  // Level 1 -> need 3 XP; then increases by level each time (3, +2, +3, +4...)
  let xpRequired = 3;
  for (let i = 2; i <= currentLevel; i++) {
    xpRequired += i;
  }
  return xpRequired;
}

function updateStats() {
  if (pointsEl) pointsEl.textContent = score;
  if (comboEl) comboEl.textContent = combo;
  if (levelEl) levelEl.textContent = level;

  const needed = xpToNextLevel(level);
  const percent = needed > 0 ? (xp / needed) * 100 : 0;
  if (xpBar) xpBar.style.width = `${Math.min(percent, 100)}%`;
  if (xpText) xpText.textContent = `${xp} / ${needed}`;
}

function saveProgress() {
  localStorage.setItem("EventMxp", xp.toString());
  localStorage.setItem("EventMlevel", level.toString());
  // also export latest to the homepage aggregator
  syncOverallLevel();
}

function loadProgress() {
  const savedXP = localStorage.getItem("EventMxp");
  const savedLevel = localStorage.getItem("EventMlevel");

  if (savedXP !== null) xp = parseInt(savedXP, 10) || 0;
  if (savedLevel !== null) level = parseInt(savedLevel, 10) || 1;

  // on load, ensure homepage overall is at least this level
  syncOverallLevel();
  updateStats();
}

/**
 * Export this quiz's level to a homepage-wide "overallLevel".
 * If you plan to aggregate multiple quizzes, you can change this logic
 * (e.g., sum across quizzes). For now we keep the MAX level.
 */
function syncOverallLevel() {
  const currentOverall = parseInt(localStorage.getItem("overallLevel") || "0", 10);
  if (level > currentOverall) {
    localStorage.setItem("overallLevel", level.toString());
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
      color: "hsl(" + Math.floor(Math.random() * 360) + ", 100%, 70%)",
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
window.addEventListener("resize", resizeCanvas);
resizeCanvas();
setInterval(drawConfetti, 30);

// ----------------------
// SPEECH
// ----------------------
function speak(text) {
  if (!text) return;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-GB"; // more standard than "en-UK"
  speechSynthesis.speak(utterance);
}

function showFloatingXP(text) {
  const xpElem = document.createElement("div");
  xpElem.textContent = text;
  xpElem.className = "floating-xp";
  xpElem.style.position = "fixed";
  xpElem.style.left = `${Math.random() * 80 + 10}%`;
  xpElem.style.top = "50%";
  xpElem.style.fontWeight = "700";
  xpElem.style.pointerEvents = "none";
  document.body.appendChild(xpElem);
  setTimeout(() => xpElem.remove(), 1500);
}

// ----------------------
// PET EVOLUTION LOGIC
// ----------------------
function checkPetEvolution() {
  const overallLevel = parseInt(localStorage.getItem("overallLevel") || "0", 10);
  const petStage = localStorage.getItem("petStage") || "0"; // 0 = none, 1 = first evo, 2 = second evo

  // First evolution choice at overall >= 3
  if (overallLevel >= 3 && petStage === "0") {
    petModalTitle.textContent = "🎉 Your Egg is Hatching!";
    petModalDesc.textContent = "Choose your first evolution and head back to the homepage!";
    goHomepageBtn.style.display = "inline-block";
    petModal.style.display = "flex";

    petChoices.forEach(choice => {
      choice.onclick = () => {
        localStorage.setItem("petChoiceStage1", choice.dataset.pet);
        localStorage.setItem("petStage", "1");
        petModal.style.display = "none";
      };
    });
  }
  // Second evolution choice at overall >= 6
  else if (overallLevel >= 6 && petStage === "1") {
    petModalTitle.textContent = "🌟 Your Pet is Evolving Again!";
    petModalDesc.textContent = "Choose your second evolution and head back to the homepage!";
    goHomepageBtn.style.display = "inline-block";
    petModal.style.display = "flex";

    petChoices.forEach(choice => {
      choice.onclick = () => {
        localStorage.setItem("petChoiceStage2", choice.dataset.pet);
        localStorage.setItem("petStage", "2");
        petModal.style.display = "none";
      };
    });
  } else {
    goHomepageBtn.style.display = "none";
  }
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

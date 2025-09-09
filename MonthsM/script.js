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

const pointsEl = document.getElementById("points");
const comboEl = document.getElementById("combo");
const levelEl = document.getElementById("level");
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

  const correctAnswer = question.en;
  const wrongAnswers = questions.filter(q => q.en !== correctAnswer).map(q => q.en);
  shuffleArray(wrongAnswers);

  const options = [correctAnswer, ...wrongAnswers.slice(0, 3)];
  shuffleArray(options);

  choicesContainer.innerHTML = "";
  options.forEach(opt => {
    const span = document.createElement("span");
    span.textContent = opt;
    span.className = "choice-option";
    span.style.padding = "5px 10px";
    span.style.border = "1px solid #ccc";
    span.style.borderRadius = "5px";
    span.style.background = "#f9f9f9";
    span.style.margin = "5px";
    span.style.userSelect = "none";
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

  const userAnswer = answerInput.value.trim();
  const correctAnswer = questions[currentQuestionIndex].en;

  if (userAnswer === correctAnswer) {
    feedback.innerHTML = "✔️ <strong>Correct!</strong>";
    feedback.style.color = "green";
    combo++;
    score += 1;

    const xpBonus = combo >= 15 && combo % 5 === 0 ? (combo / 5) - 1 : 1;
    gainXP(xpBonus);
    showFloatingXP(`+${xpBonus} XP`);

    updateStats();

    answerInput.disabled = true;
    nextBtn.disabled = false;
    tryAgainBtn.style.display = "none";
  } else {
    feedback.innerHTML = `✖️ <strong>Wrong!</strong><br>Correct answer: <span style="color: green;">${correctAnswer}</span>`;
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
}

function xpToNextLevel(currentLevel) {
  let xpRequired = 3;
  for (let i = 2; i <= currentLevel; i++) {
    xpRequired += i;
  }
  return xpRequired;
}

function updateStats() {
  pointsEl.textContent = score;
  comboEl.textContent = combo;
  levelEl.textContent = level;

  const needed = xpToNextLevel(level);
  const percent = (xp / needed) * 100;
  xpBar.style.width = `${Math.min(percent, 100)}%`;
  xpText.textContent = `${xp} / ${needed}`;
}

function saveProgress() {
  localStorage.setItem("EventMxp", xp);
  localStorage.setItem("EventMlevel", level);
}

function loadProgress() {
  const savedXP = localStorage.getItem("EventMxp");
  const savedLevel = localStorage.getItem("EventMlevel");

  if (savedXP !== null) xp = parseInt(savedXP, 10);
  if (savedLevel !== null) level = parseInt(savedLevel, 10);

  u

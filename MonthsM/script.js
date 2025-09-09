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
    span.style.cursor = "pointer";
    // Add click handler for multiple choice selection
    span.onclick = function() {
      if (!answered) {
        checkAnswer(opt); // Pass the selected option
      }
    };
    choicesContainer.appendChild(span);
  });

  if (answerInput) {
    answerInput.value = "";
    answerInput.disabled = true;  // Disable text input for multiple choice
  }
  feedback.textContent = "";
  feedback.style.color = "black";
  nextBtn.disabled = true;
  tryAgainBtn.style.display = "none";
  answered = false;
}

// Modified checkAnswer to receive the chosen answer
function checkAnswer(selectedAnswer) {
  if (answered) return;
  answered = true;

  const correctAnswer = questions[currentQuestionIndex].en;

  if (selectedAnswer === correctAnswer) {
    feedback.innerHTML = "✔️ <strong>Correct!</strong>";
    feedback.style.color = "green";
    combo++;
    score += 1;

    const xpBonus = combo >= 15 && combo % 5 === 0 ? (combo / 5) - 1 : 1;
    gainXP(xpBonus);
    showFloatingXP(`+${xpBonus} XP`);

    updateStats();

    nextBtn.disabled = false;
    tryAgainBtn.style.display = "none";

    // Highlight correct option
    highlightChoice(selectedAnswer, true);
  } else {
    feedback.innerHTML = `✖️ <strong>Wrong!</strong><br>Correct answer: <span style="color: green;">${correctAnswer}</span>`;
    feedback.style.color = "red";
    combo = 0;

    updateStats();

    nextBtn.disabled = true;
    tryAgainBtn.style.display = "inline-block";

    // Highlight wrong and correct options
    highlightChoice(selectedAnswer, false, correctAnswer);
  }
}

function highlightChoice(selected, isCorrect, correctAnswer) {
  Array.from(choicesContainer.children).forEach(span => {
    if (span.textContent === selected) {
      span.style.background = isCorrect ? "#d4edda" : "#f8d7da";
      span.style.borderColor = isCorrect ? "#28a745" : "#dc3545";
    } else if (!isCorrect && span.textContent === correctAnswer) {
      span.style.background = "#d4edda";
      span.style.borderColor = "#28a745";
    }
    span.style.pointerEvents = "none";
  });
}

function tryAgain() {
  feedback.textContent = "";
  feedback.style.color = "black";
  // Re-enable choices for retry
  Array.from(choicesContainer.children).forEach(span => {
    span.style.background = "#f9f9f9";
    span.style.borderColor = "#ccc";
    span.style.pointerEvents = "auto";
  });
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

  updateStats();
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
// PET EVOLUTION LOGIC
// ----------------------
function checkPetEvolution() {
  const overallLevel = parseInt(localStorage.getItem("overallLevel")) || 0;
  const petStage = localStorage.getItem("petStage") || "0"; // 0 = none, 1 = first evo, 2 = second evo

  if (overallLevel >= 3 && petStage === "0") {
    // First evolution choice
    petModalTitle.textContent = "🎉 Your Egg is Hatching!";
    petModalDesc.textContent = "Choose your first evolution!";
    petModal.style.display = "block";

    petChoices.forEach(choice => {
      choice.onclick = () => {
        localStorage.setItem("petChoiceStage1", choice.dataset.pet);
        localStorage.setItem("petStage", "1");
        petModal.style.display = "none";
      };
    });
  } else if (overallLevel >= 6 && petStage === "1") {
    // Second evolution choice
    petModalTitle.textContent = "🌟 Your Pet is Evolving Again!";
    petModalDesc.textContent = "Choose your second evolution!";
    petModal.style.display = "block";

    petChoices.forEach(choice => {
      choice.onclick = () => {
        localStorage.setItem("petChoiceStage2", choice.dataset.pet);
        localStorage.setItem("petStage", "2");
        petModal.style.display = "none";
      };
    });
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

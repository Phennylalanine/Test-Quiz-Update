import { xp, level } from './xp.js';
import { shuffleArray } from './utils.js';

export function updateStats() {
  const pointsEl = document.getElementById("quizScore");
  const levelEl = document.getElementById("quizLevel");
  const xpBar = document.getElementById("xpBar");
  const xpText = document.getElementById("xpText");

  if (pointsEl) pointsEl.textContent = xp;
  if (levelEl) levelEl.textContent = level;
  if (xpBar && xpText) {
    const percent = (xp / (level * 100)) * 100;
    xpBar.style.width = `${Math.min(percent, 100)}%`;
    xpText.textContent = `${xp} / ${level * 100}`;
  }
}

export function showFeedback(msg) {
  const fb = document.getElementById("feedback");
  fb.textContent = msg;
  fb.classList.remove("hidden");
}

export function showChoices(question) {
  const container = document.getElementById("choicesText");
  container.innerHTML = "<strong>Choices:</strong><br>";

  const options = shuffleArray([question.en, ...(question.wrongOptions || []).slice(0, 3)]);

  options.forEach(opt => {
    const span = document.createElement("span");
    span.textContent = opt;
    span.className = "choice-option";
    container.appendChild(span);
  });
}
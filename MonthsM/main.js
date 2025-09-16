// main.js
import { loadQuestions, loadNextQuestion, checkAnswer, tryAgain } from './quiz.js';
import { updateStats } from './ui.js';
import { notifyHubMilestone } from './notify.js';

document.addEventListener("DOMContentLoaded", () => {
  const startBtn = document.getElementById("startBtn");
  const nextBtn = document.getElementById("nextBtn");
  const tryAgainBtn = document.getElementById("tryAgainBtn");
  const answerInput = document.getElementById("answerInput");

  const startScreen = document.getElementById("startScreen");
  const quizScreen = document.getElementById("quizScreen");

  // --- Start Button ---
  if (startBtn) {
    startBtn.addEventListener("click", async () => {
      console.log("✅ Start button clicked");
      await loadQuestions();

      // Switch screens
      startScreen.classList.remove("active");
      startScreen.classList.add("hidden");
      quizScreen.classList.add("active");

      // First question
      loadNextQuestion();

      // Disable Next until answered
      nextBtn.disabled = true;
    });
  }

  // --- Next Button ---
  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      const input = answerInput?.value;
      if (input.trim() !== "") {
        checkAnswer(input);

        // Disable again after moving forward
        nextBtn.disabled = true;
        answerInput.value = "";
        loadNextQuestion();
      }
    });
  }

  // --- Try Again Button ---
  if (tryAgainBtn) {
    tryAgainBtn.addEventListener("click", () => {
      tryAgain();
      nextBtn.disabled = true; // reset state
    });
  }

  // --- Enter Key submits answer ---
  document.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && answerInput === document.activeElement) {
      const input = answerInput?.value;
      if (input.trim() !== "") {
        checkAnswer(input);

        // Enable Next now that an answer was given
        nextBtn.disabled = false;
      }
    }
  });

  // Initialize stats & pet milestone check
  updateStats();
  notifyHubMilestone();
});

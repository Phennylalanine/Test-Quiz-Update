// main.js
import { loadNextQuestion, checkAnswer, tryAgain } from './quiz.js';
import { updateStats } from './ui.js';
import { notifyHubMilestone } from './notify.js';

document.addEventListener('DOMContentLoaded', () => {
  // Buttons
  const startBtn = document.getElementById('startBtn');
  const nextBtn = document.getElementById('nextBtn');
  const tryAgainBtn = document.getElementById('tryAgainBtn');

  if (startBtn) startBtn.addEventListener('click', startQuiz);
  if (nextBtn) nextBtn.addEventListener('click', loadNextQuestion);
  if (tryAgainBtn) tryAgainBtn.addEventListener('click', tryAgain);

  // Allow Enter key to submit an answer
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') checkAnswer();
  });

  // Initialize stats + milestone check
  updateStats();
  notifyHubMilestone();
});

function startQuiz() {
  const startScreen = document.getElementById('startScreen');
  const quizScreen = document.getElementById('quizScreen');

  // Switch visibility using .active
  startScreen.classList.remove('active');
  quizScreen.classList.add('active');

  // Load the first question
  loadNextQuestion();
}

import { loadNextQuestion, checkAnswer, tryAgain } from './quiz.js';
import { updateStats } from './ui.js';
import { notifyHubMilestone } from './notify.js';

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('startBtn').addEventListener('click', startQuiz);
  document.getElementById('nextBtn').addEventListener('click', loadNextQuestion);
  document.getElementById('tryAgainBtn').addEventListener('click', tryAgain);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') checkAnswer();
  });

  updateStats();
  notifyHubMilestone();
});

function startQuiz() {
  document.getElementById('startScreen').classList.add('hidden');
  document.getElementById('quizScreen').classList.remove('hidden');
  loadNextQuestion();
}
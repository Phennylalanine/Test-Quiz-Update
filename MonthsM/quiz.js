import { shuffleArray } from './utils.js';
import { speak } from './speech.js';
import { showFeedback, showChoices, updateStats } from './ui.js';
import { gainXP } from './xp.js';
import { triggerConfetti } from './confetti.js';
import { notifyHubMilestone } from './notify.js';

let questions = [];
let currentQuestionIndex = 0;
let answered = false;

export function loadQuestions(qs) {
  questions = shuffleArray(qs);
  currentQuestionIndex = 0;
  loadNextQuestion();
}

export function loadNextQuestion() {
  if (currentQuestionIndex >= questions.length) {
    showFeedback("🎉 Quiz finished!");
    return;
  }

  const q = questions[currentQuestionIndex];
  showChoices(q);
  speak(q.jp);
  answered = false;
}

export function checkAnswer(userInput) {
  if (answered) return;
  answered = true;

  const q = questions[currentQuestionIndex];
  const userAnswer = (userInput || "").trim().toLowerCase();
  const correctAnswer = q.en.trim().toLowerCase();

  if (userAnswer === correctAnswer) {
    showFeedback("✅ Correct!");
    gainXP(1);
    triggerConfetti();
    updateStats();
    notifyHubMilestone();
  } else {
    showFeedback(`❌ Wrong! Correct: ${q.en}`);
  }

  currentQuestionIndex++;
}

export function tryAgain() {
  answered = false;
  loadNextQuestion();
}
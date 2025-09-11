import { shuffleArray } from './utils.js';
import { speak } from './speech.js';
import { showFeedback, showChoices, updateStats } from './ui.js';
import { gainXP } from './xp.js';
import { triggerConfetti } from './confetti.js';
import { notifyHubMilestone } from './notify.js';

let questions = [];
let currentQuestionIndex = 0;
let answered = false;

// === Load questions from CSV ===
export async function loadQuestions() {
  try {
    const response = await fetch('./questions.csv');
    const text = await response.text();
    questions = shuffleArray(parseCSV(text));
    currentQuestionIndex = 0;
  } catch (err) {
    console.error("Failed to load questions.csv:", err);
    showFeedback("⚠️ Could not load questions.");
  }
}

// Simple CSV parser: jp,en
function parseCSV(text) {
  const lines = text.trim().split('\n');
  return lines.map(line => {
    const [jp, en] = line.split(',');
    return { jp: jp.trim(), en: en.trim() };
  });
}

export function loadNextQuestion() {
  if (questions.length === 0) {
    showFeedback("⚠️ No questions loaded!");
    return;
  }

  if (currentQuestionIndex >= questions.length) {
    currentQuestionIndex = 0; // 👈 loop instead of finishing
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

// quiz.js
import { shuffleArray } from './utils.js';
import { speak } from './speech.js';
import { showFeedback, showChoices, updateStats } from './ui.js';
import { gainXP } from './xp.js';
import { triggerConfetti } from './confetti.js';
import { notifyHubMilestone } from './notify.js';

let questions = [];
let currentQuestionIndex = 0;
let answered = false;

// Fetch + parse questions.csv
export async function loadQuestions() {
  try {
    const res = await fetch('./questions.csv');
    const text = await res.text();

    // Parse CSV (skip header row)
    const rows = text.trim().split('\n').slice(1);
    questions = rows.map(line => {
      const [jp, en] = line.split(',');
      return { jp: jp.trim(), en: en.trim() };
    });

    // Shuffle questions
    questions = shuffleArray(questions);
    currentQuestionIndex = 0;
  } catch (err) {
    console.error("Error loading questions.csv:", err);
  }
}

export function loadNextQuestion() {
  if (questions.length === 0) {
    showFeedback("⚠️ No questions loaded.");
    return;
  }

  if (currentQuestionIndex >= questions.length) {
    // Instead of ending, restart
    currentQuestionIndex = 0;
    questions = shuffleArray(questions);
    showFeedback("🔄 Restarting quiz!");
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

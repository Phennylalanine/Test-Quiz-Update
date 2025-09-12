import { shuffleArray } from './utils.js';
import { speak } from './speech.js';
import { showFeedback, showChoices, updateStats } from './ui.js';
import { gainXP } from './xp.js';
import { triggerConfetti } from './confetti.js';
import { notifyHubMilestone } from './notify.js';

let questions = [];
let currentQuestionIndex = 0;
let answered = false;

// === Load questions from CSV (with fallback) ===
export async function loadQuestions() {
  try {
    const response = await fetch('./questions.csv');
    const text = await response.text();

    console.log("📥 CSV loaded:", text); // debug
    questions = shuffleArray(parseCSV(text));
    console.log("✅ Parsed questions:", questions); // debug
  } catch (err) {
    console.error("⚠️ Failed to load questions.csv:", err);

    // fallback questions if fetch fails
    questions = shuffleArray([
      { jp: "1月", en: "January" },
      { jp: "2月", en: "February" },
      { jp: "3月", en: "March" },
    ]);

    showFeedback("⚠️ Could not load questions.csv, using fallback set.");
  }

  currentQuestionIndex = 0;
}

// === Simple CSV parser: jp,en ===
function parseCSV(text) {
  const lines = text.trim().split('\n').slice(1); // skip header
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

  // Loop back to start when finished
  if (currentQuestionIndex >= questions.length) {
    currentQuestionIndex = 0;
  }

  const q = questions[currentQuestionIndex];
  console.log("➡️ Loading question:", q); // debug

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

  console.log("✍️ Answer given:", userAnswer, " | Correct:", correctAnswer); // debug

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

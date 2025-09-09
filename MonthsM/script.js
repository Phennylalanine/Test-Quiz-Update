// ... Existing code above ...

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
    checkMilestoneModal(); // <-- Add this here
  }

  saveProgress();
  updateStats();
}

// ---- Milestone Modal Logic ----

// Calculates overall level using all quiz progress in localStorage.
// You may need to adjust keys/multipliers to match your homepage logic.
function getOverallLevel() {
  const quizData = [
    { key: "monthsSlevel", multiplier: 0.6 },
    { key: "EventSlevel", multiplier: 0.6 },
    { key: "monthsMlevel", multiplier: 1.2 },
    { key: "EventMlevel", multiplier: 1.2 },
  ];
  return Math.round(
    quizData.reduce((sum, { key, multiplier }) => {
      const value = parseInt(localStorage.getItem(key)) || 0;
      return sum + value * multiplier;
    }, 0)
  );
}

// Modal element references
const milestoneModal = document.getElementById('milestoneModal');
const milestoneMessage = document.getElementById('milestoneMessage');
const closeModalBtn = document.getElementById('closeModalBtn');
const goHomepageBtn = document.getElementById('goHomepageBtn');

// Show modal if milestone is reached and not already notified
function checkMilestoneModal() {
  const milestones = [2, 5]; // Add more milestone levels if needed!
  const overallLevel = getOverallLevel();
  const notifiedLevels = JSON.parse(localStorage.getItem('milestoneNotified') || '[]');

  if (milestones.includes(overallLevel) && !notifiedLevels.includes(overallLevel)) {
    // Show modal
    milestoneMessage.textContent =
      overallLevel === 2
        ? "You found a mysterious egg! Go to the homepage to see what happens!"
        : "Your pet egg is hatching! Go to the homepage to choose your pet!";
    milestoneModal.style.display = 'flex';

    // Save that we've notified for this milestone
    notifiedLevels.push(overallLevel);
    localStorage.setItem('milestoneNotified', JSON.stringify(notifiedLevels));
  }
}

// Close modal when X or button is clicked
closeModalBtn.onclick = () => (milestoneModal.style.display = 'none');
goHomepageBtn.onclick = () => {
  window.open('https://phennylalanine.github.io/Yach-5-Quiz-Home/', '_blank');
  milestoneModal.style.display = 'none';
};

// Optionally, close modal when clicking outside the content
window.onclick = function(event) {
  if (event.target === milestoneModal) {
    milestoneModal.style.display = 'none';
  }
}

// ... Existing code below ...// ... Existing code above ...

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
    checkMilestoneModal(); // <-- Add this here
  }

  saveProgress();
  updateStats();
}

// ---- Milestone Modal Logic ----

// Calculates overall level using all quiz progress in localStorage.
// You may need to adjust keys/multipliers to match your homepage logic.
function getOverallLevel() {
  const quizData = [
    { key: "monthsSlevel", multiplier: 0.6 },
    { key: "EventSlevel", multiplier: 0.6 },
    { key: "monthsMlevel", multiplier: 1.2 },
    { key: "EventMlevel", multiplier: 1.2 },
  ];
  return Math.round(
    quizData.reduce((sum, { key, multiplier }) => {
      const value = parseInt(localStorage.getItem(key)) || 0;
      return sum + value * multiplier;
    }, 0)
  );
}

// Modal element references
const milestoneModal = document.getElementById('milestoneModal');
const milestoneMessage = document.getElementById('milestoneMessage');
const closeModalBtn = document.getElementById('closeModalBtn');
const goHomepageBtn = document.getElementById('goHomepageBtn');

// Show modal if milestone is reached and not already notified
function checkMilestoneModal() {
  const milestones = [2, 5]; // Add more milestone levels if needed!
  const overallLevel = getOverallLevel();
  const notifiedLevels = JSON.parse(localStorage.getItem('milestoneNotified') || '[]');

  if (milestones.includes(overallLevel) && !notifiedLevels.includes(overallLevel)) {
    // Show modal
    milestoneMessage.textContent =
      overallLevel === 2
        ? "You found a mysterious egg! Go to the homepage to see what happens!"
        : "Your pet egg is hatching! Go to the homepage to choose your pet!";
    milestoneModal.style.display = 'flex';

    // Save that we've notified for this milestone
    notifiedLevels.push(overallLevel);
    localStorage.setItem('milestoneNotified', JSON.stringify(notifiedLevels));
  }
}

// Close modal when X or button is clicked
closeModalBtn.onclick = () => (milestoneModal.style.display = 'none');
goHomepageBtn.onclick = () => {
  window.open('https://phennylalanine.github.io/Yach-5-Quiz-Home/', '_blank');
  milestoneModal.style.display = 'none';
};

// Optionally, close modal when clicking outside the content
window.onclick = function(event) {
  if (event.target === milestoneModal) {
    milestoneModal.style.display = 'none';
  }
}

// ... Existing code below ...

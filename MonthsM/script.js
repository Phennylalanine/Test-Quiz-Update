// Calculates overall level using quiz progress in localStorage
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

// Shows the pet selection modal
function showPetSelectionModal() {
  const modal = document.getElementById('petModal');
  if (!modal) return;

  modal.style.display = 'flex';

  // Optional: Add event listeners for pet choices
  const petChoices = modal.querySelectorAll('.pet-choice');
  petChoices.forEach(choice => {
    choice.onclick = function() {
      localStorage.setItem('petChoice', choice.dataset.pet);
      modal.style.display = 'none';
      // You can add code here to show the chosen pet on the homepage!
      alert(`You chose: ${choice.dataset.pet}`);
      // Optionally: Update homepage UI with pet
    };
  });

  // Close modal if needed
  const closeBtn = modal.querySelector('.close');
  if (closeBtn) {
    closeBtn.onclick = function() {
      modal.style.display = 'none';
    };
  }
}

// Show modal on page load if milestone reached and pet not chosen
document.addEventListener('DOMContentLoaded', function() {
  if (getOverallLevel() >= 5 && !localStorage.getItem('petChoice')) {
    showPetSelectionModal();
  }
  // ... rest of your homepage JS ...
});

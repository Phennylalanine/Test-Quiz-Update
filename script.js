window.addEventListener("DOMContentLoaded", () => {
  // Array of quiz levels with multipliers and keys matching data-key in HTML
  const quizData = [
    { key: "monthsSlevel", multiplier: 0.6 },
    { key: "EventSlevel", multiplier: 0.6 },
    { key: "monthsMlevel", multiplier: 1.2 },
    { key: "EventMlevel", multiplier: 1.2 },
  ];

  // Calculate weighted overall level (rounded)
  const overallLevel = Math.round(
    quizData.reduce((sum, { key, multiplier }) => {
      const value = parseInt(localStorage.getItem(key)) || 0;
      return sum + value * multiplier;
    }, 0)
  );

  // Update each span with class "levelValue" using the data-key attribute
  document.querySelectorAll(".levelValue").forEach((span) => {
    const key = span.getAttribute("data-key");
    const levelValue = parseInt(localStorage.getItem(key)) || 0;
    span.textContent = `(Level: ${levelValue})`;
  });

  // ---- PET LOGIC ----
  const petContainer = document.getElementById("petContainer");
  petContainer.innerHTML = "";

  // Helper: Get/set choice from localStorage
  const petChoiceKey = "petChoice"; // stores "plant" or "shadow"
  let petChoice = localStorage.getItem(petChoiceKey);

  if (overallLevel < 2) {
    // Not enough level yet
    petContainer.innerHTML = `<p>Keep playing quizzes to find a mysterious egg!</p>`;
  } else if (overallLevel >= 2 && overallLevel < 5) {
    // Show egg
    petContainer.innerHTML = `
      <img src="monster_image/shadow-plant-egg.png" alt="Egg">
      <p>Oh you found an egg! What could be inside?</p>
      <div class="jp">おお！卵を見つけたね！中には何が入っているのかな？</div>
    `;
  } else if (overallLevel >= 5) {
    // Hatching: Has pet choice?
    if (!petChoice) {
      petContainer.innerHTML = `
        <img src="monster_image/shadow-plant-egg.png" alt="Egg">
        <p>It looks like it's hatching, what could be coming out? Please pick Plant or Shadow</p>
        <div class="jp">孵化しそうだ！何が生まれるのかな？「植物」か「影」を選んでください</div>
        <button id="pickPlant">🌱 Plant</button>
        <button id="pickShadow">🌑 Shadow</button>
      `;
      document.getElementById("pickPlant").onclick = () => {
        localStorage.setItem(petChoiceKey, "plant");
        location.reload();
      };
      document.getElementById("pickShadow").onclick = () => {
        localStorage.setItem(petChoiceKey, "shadow");
        location.reload();
      };
    } else {
      // Show chosen pet
      let imgSrc = petChoice === "plant"
        ? "monster_image/Plant slime-1.png"
        : "monster_image/Shadow slime-1.png";
      let label = petChoice === "plant" ? "Plant Slime" : "Shadow Slime";
      let jpLabel = petChoice === "plant" ? "植物スライム" : "影スライム";
      petContainer.innerHTML = `
        <img src="${imgSrc}" alt="${label}">
        <p>You hatched: ${label}!</p>
        <div class="jp">${jpLabel}が生まれた！</div>
      `;
    }
  }
});

export let xp = parseInt(localStorage.getItem("monthsMxp")) || 0;
export let level = parseInt(localStorage.getItem("monthsMlevel")) || 1;

export function gainXP(amount) {
  xp += amount;
  while (xp >= xpToNextLevel(level)) {
    xp -= xpToNextLevel(level);
    level++;
  }
  saveProgress();
}

export function xpToNextLevel(lv) {
  return 3 + lv * 1;
}

export function saveProgress() {
  localStorage.setItem("monthsMxp", xp);
  localStorage.setItem("monthsMlevel", level);
}
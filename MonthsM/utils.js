export function shuffleArray(array) {
  return array.sort(() => Math.random() - 0.5);
}

export function parseCSV(csvText) {
  return csvText.split('\n').map(row => row.split(','));
}
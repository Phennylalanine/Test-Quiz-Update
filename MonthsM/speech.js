export function speak(text) {
  const msg = new SpeechSynthesisUtterance(text);
  msg.lang = 'en-US';
  speechSynthesis.speak(msg);
}
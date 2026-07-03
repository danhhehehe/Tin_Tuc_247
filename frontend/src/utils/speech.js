export function cleanTextForSpeech(text = '') {
  return String(text)
    .replace(/https?:\/\/\S+/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[^\p{L}\p{N}\s.,!?;:()"'%-]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function getVietnameseVoices() {
  if (!('speechSynthesis' in window)) return [];
  return window.speechSynthesis
    .getVoices()
    .filter((voice) => voice.lang?.toLowerCase().includes('vi'));
}

export function pickBestVietnameseVoice() {
  const voices = getVietnameseVoices();
  return (
    voices.find((voice) => /microsoft an/i.test(voice.name)) ||
    voices.find((voice) => voice.lang?.toLowerCase() === 'vi-vn') ||
    voices[0] ||
    null
  );
}

export function speakVietnamese(text = '', options = {}) {
  if (!('speechSynthesis' in window)) return null;
  const cleanText = cleanTextForSpeech(text);
  if (!cleanText) return null;

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(options.maxLength ? cleanText.slice(0, options.maxLength) : cleanText);
  utterance.lang = 'vi-VN';
  utterance.voice = pickBestVietnameseVoice();
  utterance.rate = Number(options.rate || 0.9);
  utterance.volume = Number(options.volume || 1);
  utterance.pitch = Number(options.pitch || 0.95);
  window.speechSynthesis.speak(utterance);
  return utterance;
}

export function stopSpeaking() {
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
}

export function pauseSpeaking() {
  if ('speechSynthesis' in window) window.speechSynthesis.pause();
}

export function resumeSpeaking() {
  if ('speechSynthesis' in window) window.speechSynthesis.resume();
}

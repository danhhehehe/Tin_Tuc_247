import { useEffect, useMemo, useState } from 'react';
import {
  cleanTextForSpeech,
  getVietnameseVoices,
  pauseSpeaking,
  pickBestVietnameseVoice,
  resumeSpeaking,
  speakVietnamese,
  stopSpeaking
} from '../utils/speech.js';

export function useSpeechRecognition({ onResult } = {}) {
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(true);

  const SpeechRecognition = useMemo(() => {
    return window.SpeechRecognition || window.webkitSpeechRecognition;
  }, []);

  function start() {
    if (!SpeechRecognition) {
      setSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'vi-VN';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    recognition.onresult = (event) => {
      const text = event.results?.[0]?.[0]?.transcript || '';
      if (text && onResult) onResult(text);
    };

    recognition.start();
  }

  return { listening, supported, start };
}

export function getBestVietnameseVoice(voices = [], preferredName = '') {
  if (preferredName) {
    const preferred = voices.find((voice) => voice.name === preferredName);
    if (preferred) return preferred;
  }

  return pickBestVietnameseVoice() ||
    voices.find((voice) => voice.lang?.toLowerCase() === 'vi-vn') ||
    voices.find((voice) => voice.lang?.toLowerCase().startsWith('vi')) ||
    null;
}

export function useSpeechVoices() {
  const [voices, setVoices] = useState([]);

  useEffect(() => {
    if (!('speechSynthesis' in window)) return undefined;

    function loadVoices() {
      setVoices(getVietnameseVoices());
    }

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  return voices;
}

export function cleanSpeechText(text = '') {
  return cleanTextForSpeech(text);
}

export function speak(text = '', options = {}) {
  return speakVietnamese(text, options);
}

export function pauseSpeech() {
  pauseSpeaking();
}

export function resumeSpeech() {
  resumeSpeaking();
}

export function stopSpeech() {
  stopSpeaking();
}

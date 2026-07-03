import { useEffect, useState } from 'react';
import api, { FRIENDLY_ERROR_MESSAGE } from '../services/api.js';
import { speak, useSpeechRecognition } from '../hooks/useSpeechRecognition.js';

const QUICK_PROMPTS = [
  'Tóm tắt tin lúa gạo hôm nay',
  'Tin bóng đá mới nhất có gì?',
  'Tìm tin công nghệ AI mới',
  'Tóm tắt 5 tin nổi bật'
];

function providerLabel(provider, model) {
  if (!provider) return 'AI đang sẵn sàng';
  if (provider === 'local') return 'AI Local ổn định';
  return `${provider.toUpperCase()}${model ? ` · ${model}` : ''}`;
}

export default function SearchAssistant({ onResults }) {
  const [query, setQuery] = useState('');
  const [message, setMessage] = useState('Bạn có thể nói: "tìm tin lúa gạo hôm nay", "tin bóng đá mới", "tóm tắt tin nổi bật".');
  const [aiAnswer, setAiAnswer] = useState('');
  const [provider, setProvider] = useState('');
  const [model, setModel] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    let mounted = true;
    api.get('/assistant/status')
      .then((response) => {
        if (mounted) setStatus(response.data);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  async function runSearch(text = query) {
    const value = text.trim();
    if (!value) return;
    setLoading(true);
    setAiAnswer('');
    try {
      const response = await api.post('/assistant/chat', { query: value });
      const answer = response.data.answer || response.data.message || 'AI đã xử lý xong.';
      setProvider(response.data.provider || 'local');
      setModel(response.data.model || '');
      setSuggestions(response.data.suggestions || []);
      setAiAnswer(answer);
      setMessage(answer.length > 180 ? `${answer.slice(0, 180)}...` : answer);
      speak(answer.slice(0, 520));
      onResults?.(response.data.data || [], value);
    } catch (error) {
      setMessage(FRIENDLY_ERROR_MESSAGE);
      setAiAnswer('AI chưa phản hồi được. Hãy kiểm tra backend hoặc API key, hệ thống vẫn có tìm kiếm thường.');
      try {
        const fallback = await api.post('/assistant/search', { query: value });
        onResults?.(fallback.data.data || [], value);
      } catch {
        // Keep friendly error visible.
      }
    } finally {
      setLoading(false);
    }
  }

  const { listening, supported, start } = useSpeechRecognition({
    onResult: (text) => {
      setQuery(text);
      runSearch(text);
    }
  });

  const localReady = status?.providers?.local?.configured;
  const configuredCloud = status?.providers
    ? Object.entries(status.providers).filter(([name, item]) => name !== 'local' && item.configured).map(([name]) => name.toUpperCase())
    : [];

  return (
    <section className="assistant-box container ai-assistant-box">
      <div>
        <span className="eyebrow">Trợ lý AI tin tức</span>
        <h2>Hỏi AI để tìm, tóm tắt và gợi ý tin</h2>
        <p>{message}</p>
        <div className="ai-status-row">
          <span>{providerLabel(provider, model)}</span>
          <small>{configuredCloud.length ? `Cloud AI: ${configuredCloud.join(', ')}` : localReady ? 'Chưa có API key cloud, đang dùng AI Local fallback.' : 'Đang kiểm tra AI.'}</small>
        </div>
        {!supported && <small>Trình duyệt này chưa hỗ trợ nhận giọng nói. Nên dùng Chrome hoặc Edge.</small>}
      </div>

      <div className="assistant-actions-panel">
        <div className="assistant-actions">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => event.key === 'Enter' && runSearch()}
            placeholder="Nhập hoặc bấm micro để hỏi AI..."
          />
          <button className={listening ? 'mic-btn listening' : 'mic-btn'} onClick={start}>
            {listening ? 'Đang nghe...' : 'Nói'}
          </button>
          <button className="primary-btn" onClick={() => runSearch()} disabled={loading}>
            {loading ? 'AI đang nghĩ...' : 'Hỏi AI'}
          </button>
        </div>

        <div className="ai-prompt-chips">
          {QUICK_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => {
                setQuery(prompt);
                runSearch(prompt);
              }}
            >
              {prompt}
            </button>
          ))}
        </div>

        {aiAnswer && (
          <div className="ai-answer-card">
            <strong>{providerLabel(provider, model)}</strong>
            <p>{aiAnswer}</p>
            {suggestions.length > 0 && (
              <div className="ai-suggestion-row">
                {suggestions.slice(0, 3).map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => {
                      setQuery(item);
                      runSearch(item);
                    }}
                  >
                    {item}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

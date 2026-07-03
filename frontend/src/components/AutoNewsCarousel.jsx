import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import SafeImage from './SafeImage.jsx';
import { getArticleImage } from '../utils/imageFallback.js';
import { speakVietnamese, stopSpeaking } from '../utils/speech.js';
import { normalizeVietnameseText } from '../utils/textNormalize.js';

function formatDate(date) {
  if (!date) return '';
  return new Intl.DateTimeFormat('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' }).format(new Date(date));
}

export default function AutoNewsCarousel({ articles = [] }) {
  const [index, setIndex] = useState(0);
  const [hovering, setHovering] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const items = useMemo(() => articles.slice(0, 8), [articles]);
  const article = items[index] || null;

  function move(delta) {
    if (!items.length) return;
    setIndex((value) => (value + delta + items.length) % items.length);
  }

  function handleRead() {
    if (!article) return;
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
      return;
    }

    const sourceName = normalizeVietnameseText(article.sourceName || article.source || 'Tin Tức 247');
    const summary = normalizeVietnameseText(article.summary || article.description || article.aiBrief || '');
    speakVietnamese(`Tin từ ${sourceName}. ${normalizeVietnameseText(article.title)}. ${summary}`, { maxLength: 520 });
    setIsSpeaking(true);
  }

  useEffect(() => {
    if (hovering || items.length < 2) return undefined;
    const timer = window.setInterval(() => move(1), 7000);
    return () => window.clearInterval(timer);
  }, [hovering, items.length]);

  useEffect(() => {
    setIsSpeaking(false);
    stopSpeaking();
  }, [article?._id]);

  if (!article) return null;

  const sourceName = normalizeVietnameseText(article.sourceName || article.source || 'Tin Tức 247');
  const summary = normalizeVietnameseText(article.summary || article.description || article.aiBrief || '');
  const title = normalizeVietnameseText(article.title);
  const image = getArticleImage(article);

  return (
    <section
      className="auto-news"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      onTouchStart={() => setHovering(true)}
      onTouchEnd={() => setHovering(false)}
    >
      <div className="auto-news-media">
        <SafeImage src={image} alt={title} />
      </div>
      <div className="auto-news-copy">
        <span className="eyebrow">Tin nổi bật</span>
        <div className="detail-meta">
          <span>{normalizeVietnameseText(article.category?.replaceAll('-', ' ') || 'Tin mới')}</span>
          <span>{sourceName}</span>
          <span>{formatDate(article.publishedAt)}</span>
        </div>
        <h2>{title}</h2>
        <p>{summary}</p>
        <div className="hero-actions">
          <button className="ghost-btn" onClick={handleRead}>{isSpeaking ? 'Dừng đọc' : 'Đọc tin'}</button>
          <button className="ghost-btn" onClick={() => move(1)}>Tin tiếp theo</button>
          <Link className="primary-btn" to={`/article/${article.slug || article._id}`}>Xem chi tiết</Link>
        </div>
      </div>
    </section>
  );
}

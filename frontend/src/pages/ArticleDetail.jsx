import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../services/api.js';
import Loading from '../components/Loading.jsx';
import EmptyState from '../components/EmptyState.jsx';
import SafeImage from '../components/SafeImage.jsx';
import RicePriceWidget from '../components/RicePriceWidget.jsx';
import { speak, stopSpeech } from '../hooks/useSpeechRecognition.js';
import { useLocalStorage } from '../hooks/useLocalStorage.js';
import { getArticleImage } from '../utils/imageFallback.js';
import { normalizeVietnameseText } from '../utils/textNormalize.js';

function formatDate(date) {
  if (!date) return '';
  return new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(new Date(date));
}

function uniqueParagraphs(...values) {
  const seen = new Set();
  return values
    .map((value) => normalizeVietnameseText(value || ''))
    .filter(Boolean)
    .filter((value) => {
      const key = value.replace(/\s+/g, ' ').toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

function splitReadableParagraphs(paragraphs = []) {
  return paragraphs.flatMap((paragraph) => {
    if (paragraph.length < 520) return [paragraph];
    return paragraph
      .split(/(?<=[.!?。])\s+/)
      .reduce((acc, sentence) => {
        const last = acc[acc.length - 1] || '';
        if (!last || `${last} ${sentence}`.length > 520) acc.push(sentence);
        else acc[acc.length - 1] = `${last} ${sentence}`;
        return acc;
      }, []);
  });
}

export default function ArticleDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [relatedArticles, setRelatedArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [favorites, setFavorites] = useLocalStorage('favorites', []);
  const favoriteIds = useMemo(() => favorites.map((item) => item._id), [favorites]);

  async function loadArticle() {
    setLoading(true);
    try {
      const response = await api.get(`/articles/${slug}`);
      const nextArticle = response.data;
      setArticle(nextArticle);
      api.post(`/articles/${nextArticle._id}/view`).catch(() => {});

      const relatedRes = await api.get('/articles', {
        params: { category: nextArticle.category || 'moi-nhat', limit: 12, sort: 'latest' }
      });
      setRelatedArticles((relatedRes.data.data || []).filter((item) => item.slug !== nextArticle.slug));
    } finally {
      setLoading(false);
    }
  }

  function toggleFavorite() {
    if (!article) return;
    const exists = favoriteIds.includes(article._id);
    setFavorites(exists ? favorites.filter((item) => item._id !== article._id) : [article, ...favorites].slice(0, 100));
  }

  function toggleRead() {
    if (!article) return;
    if (isSpeaking) {
      stopSpeech();
      setIsSpeaking(false);
      return;
    }

    const source = normalizeVietnameseText(article.sourceName || article.source || 'Tin Tức 247');
    const body = normalizeVietnameseText(article.content || article.description || article.summary || article.aiBrief || '');
    speak(`Tin từ ${source}. Tiêu đề: ${normalizeVietnameseText(article.title)}. Nội dung tóm tắt: ${body}`);
    setIsSpeaking(true);
  }

  function goNextArticle() {
    const next = relatedArticles[0];
    if (next?.slug) navigate(`/article/${next.slug}`);
  }

  useEffect(() => {
    loadArticle();
    return () => {
      stopSpeech();
      setIsSpeaking(false);
    };
  }, [slug]);

  if (loading) return <div className="container top-gap"><Loading /></div>;
  if (!article) return <div className="container top-gap"><EmptyState title="Không tìm thấy bài viết" /></div>;

  const image = getArticleImage(article);
  const readTime = article.readingTime || article.readTime || 1;
  const sourceName = normalizeVietnameseText(article.sourceName || article.source || 'Tin Tức 247');
  const title = normalizeVietnameseText(article.title);
  const summary = normalizeVietnameseText(article.summary || article.description || article.aiBrief || '');
  const paragraphs = splitReadableParagraphs(uniqueParagraphs(article.content, article.description, article.summary, article.aiBrief));
  const isSaved = favoriteIds.includes(article._id);

  return (
    <article className="detail-page">
      <div className="container detail-layout">
        <main className="article-detail-card">
          <Link to="/" className="back-link">← Về trang chủ</Link>
          <div className="detail-meta">
            <span>{sourceName}</span>
            <span>{normalizeVietnameseText(article.category?.replaceAll('-', ' ') || 'Tin mới')}</span>
            <span>{formatDate(article.publishedAt)}</span>
            <span>{readTime} phút đọc</span>
          </div>

          <h1>{title}</h1>
          <p className="lead">{summary}</p>

          <div className="detail-actions">
            <button className="primary-btn listen-btn" onClick={toggleRead}>
              {isSpeaking ? 'Dừng đọc' : 'Đọc tin'}
            </button>
            <button className="ghost-btn" onClick={goNextArticle} disabled={!relatedArticles.length}>Tin tiếp theo</button>
            <button className="ghost-btn" onClick={toggleFavorite}>{isSaved ? '★ Đã lưu' : '☆ Lưu tin'}</button>
            <a href={article.url} target="_blank" rel="noreferrer" className="ghost-btn">Đọc bài gốc</a>
          </div>

          <SafeImage className="detail-image" src={image} alt={title} />

          <div className="article-content article-body-text">
            {paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </div>

          {article.tags?.length > 0 && (
            <div className="tag-row">
              {article.tags.map((tag) => <span key={tag}>{normalizeVietnameseText(tag.replaceAll('-', ' '))}</span>)}
            </div>
          )}

          {relatedArticles.length > 0 && (
            <section className="next-news-panel">
              <h2>Bài liên quan</h2>
              <div className="next-news-list">
                {relatedArticles.slice(0, 4).map((item) => (
                  <Link key={item._id} to={`/article/${item.slug}`}>
                    <strong>{normalizeVietnameseText(item.title)}</strong>
                    <span>{normalizeVietnameseText(item.sourceName || item.source || 'Tin Tức 247')}</span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          <div className="source-box">
            <strong>Nguồn:</strong> {sourceName}. Trang này hiển thị phần nội dung RSS cung cấp và luôn dẫn về bài gốc.
          </div>
        </main>

        <aside className="detail-sidebar">
          <RicePriceWidget />
        </aside>
      </div>
    </article>
  );
}

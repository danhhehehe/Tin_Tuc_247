import { Link } from 'react-router-dom';
import { speak } from '../hooks/useSpeechRecognition.js';
import SafeImage from './SafeImage.jsx';
import { getArticleImage } from '../utils/imageFallback.js';
import { normalizeVietnameseText } from '../utils/textNormalize.js';

function formatDate(date) {
  if (!date) return 'Chưa rõ thời gian';
  return new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(new Date(date));
}

export default function ArticleCard({ article, compact = false, onToggleFavorite, isFavorite = false }) {
  const image = getArticleImage(article);
  const sourceName = normalizeVietnameseText(article.sourceName || article.source || 'Tin Tức 247');
  const title = normalizeVietnameseText(article.title);
  const summary = normalizeVietnameseText(article.summary || article.description || article.aiBrief || '');
  const category = normalizeVietnameseText(article.category?.replaceAll('-', ' ') || 'Tin mới');

  return (
    <article className={compact ? 'article-card compact' : 'article-card'}>
      <Link to={`/article/${article.slug}`} className="article-image-wrap">
        <SafeImage src={image} alt={title} />
        <span className="category-pill">{category}</span>
      </Link>
      <div className="article-body">
        <div className="article-meta">
          <span>{sourceName}</span>
          <span>{formatDate(article.publishedAt)}</span>
        </div>
        <Link to={`/article/${article.slug}`} className="article-title">
          {title}
        </Link>
        {!compact && <p>{summary}</p>}
        <div className="article-actions">
          <Link to={`/article/${article.slug}`} className="read-more">Đọc nhanh</Link>
          <button className="listen-small" onClick={() => speak(`Tin từ ${sourceName}. Tiêu đề: ${title}. Tóm tắt: ${summary}`)}>Nghe</button>
          {onToggleFavorite && (
            <button onClick={() => onToggleFavorite(article)}>{isFavorite ? 'Đã lưu' : 'Lưu tin'}</button>
          )}
        </div>
      </div>
    </article>
  );
}

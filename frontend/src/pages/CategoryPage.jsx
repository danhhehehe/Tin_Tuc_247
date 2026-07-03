import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api.js';
import ArticleCard from '../components/ArticleCard.jsx';
import CategoryMenu from '../components/CategoryMenu.jsx';
import Loading from '../components/Loading.jsx';
import EmptyState from '../components/EmptyState.jsx';
import Pagination from '../components/Pagination.jsx';
import RicePriceWidget from '../components/RicePriceWidget.jsx';
import { useLocalStorage } from '../hooks/useLocalStorage.js';
import { normalizeVietnameseText } from '../utils/textNormalize.js';

export default function CategoryPage() {
  const { category } = useParams();
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(18);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [favorites, setFavorites] = useLocalStorage('favorites', []);
  const listRef = useRef(null);
  const favoriteIds = useMemo(() => favorites.map((item) => item._id), [favorites]);

  const current = categories.find((item) => item.key === category);

  async function loadData() {
    setLoading(true);
    try {
      const [articleRes, categoryRes] = await Promise.all([
        api.get('/articles', { params: { category, q: submittedQuery, page, limit, sort: 'latest' } }),
        api.get('/articles/categories/list')
      ]);
      setArticles(articleRes.data.data || []);
      setPagination(articleRes.data.pagination || null);
      setCategories(categoryRes.data || []);
    } finally {
      setLoading(false);
    }
  }

  function toggleFavorite(article) {
    const exists = favoriteIds.includes(article._id);
    setFavorites(exists ? favorites.filter((item) => item._id !== article._id) : [article, ...favorites].slice(0, 100));
  }

  function submitSearch() {
    setSubmittedQuery(query.trim());
    setPage(1);
  }

  function handlePageChange(nextPage) {
    setPage(nextPage);
    window.setTimeout(() => {
      listRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 0);
  }

  useEffect(() => {
    setPage(1);
    setQuery('');
    setSubmittedQuery('');
  }, [category]);

  useEffect(() => {
    loadData();
  }, [category, page, submittedQuery]);

  return (
    <>
      <div className="page-hero small">
        <div className="container">
          <span className="eyebrow">Chuyên mục</span>
          <h1>{current ? `${current.icon} ${normalizeVietnameseText(current.label)}` : normalizeVietnameseText(category.replaceAll('-', ' '))}</h1>
          <p>Lọc nhanh các bài viết mới nhất trong chuyên mục này.</p>
          <div className="inline-search">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => event.key === 'Enter' && submitSearch()}
              placeholder="Tìm trong chuyên mục..."
            />
            <button className="primary-btn" onClick={submitSearch}>Tìm</button>
          </div>
        </div>
      </div>
      <CategoryMenu categories={categories} />
      {category === 'lua-gao' && (
        <div className="container">
          <RicePriceWidget variant="wide" />
        </div>
      )}
      <section className="container article-grid top-gap" ref={listRef}>
        {loading ? <Loading /> : articles.length ? articles.map((article) => (
          <ArticleCard
            key={article._id}
            article={article}
            onToggleFavorite={toggleFavorite}
            isFavorite={favoriteIds.includes(article._id)}
          />
        )) : <EmptyState />}
      </section>
      <div className="container">
        <Pagination pagination={pagination} onPageChange={handlePageChange} />
      </div>
    </>
  );
}

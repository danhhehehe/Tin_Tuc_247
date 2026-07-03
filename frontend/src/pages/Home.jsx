import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { FRIENDLY_ERROR_MESSAGE } from '../services/api.js';
import Hero from '../components/Hero.jsx';
import CategoryMenu from '../components/CategoryMenu.jsx';
import AutoNewsCarousel from '../components/AutoNewsCarousel.jsx';
import SearchAssistant from '../components/SearchAssistant.jsx';
import ArticleCard from '../components/ArticleCard.jsx';
import Loading from '../components/Loading.jsx';
import EmptyState from '../components/EmptyState.jsx';
import Pagination from '../components/Pagination.jsx';
import RicePriceWidget from '../components/RicePriceWidget.jsx';
import FootballWidget from '../components/FootballWidget.jsx';
import { useLocalStorage } from '../hooks/useLocalStorage.js';
import { normalizeVietnameseText } from '../utils/textNormalize.js';

export default function Home() {
  const [articles, setArticles] = useState([]);
  const [featuredArticles, setFeaturedArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState(null);
  const [syncStatus, setSyncStatus] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(24);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [notice, setNotice] = useState('');
  const [favorites, setFavorites] = useLocalStorage('favorites', []);
  const listRef = useRef(null);
  const autoSyncStarted = useRef(false);

  const favoriteIds = useMemo(() => favorites.map((item) => item._id), [favorites]);
  const riceArticles = useMemo(() => articles.filter((article) => article.category === 'lua-gao').slice(0, 4), [articles]);
  const footballArticles = useMemo(() => articles.filter((article) => article.category === 'bong-da').slice(0, 4), [articles]);

  async function loadData({ silent = false, targetPage = page } = {}) {
    if (!silent) setLoading(true);
    try {
      const [articleRes, featuredRes, categoryRes, statRes, statusRes] = await Promise.all([
        api.get('/articles', { params: { page: targetPage, limit, q: searchQuery, sort: 'latest' } }),
        api.get('/articles/featured?limit=8'),
        api.get('/articles/categories/list'),
        api.get('/articles/stats/overview'),
        api.get('/sync/status')
      ]);
      const list = articleRes.data.data || [];
      setArticles(list);
      setPagination(articleRes.data.pagination || null);
      setFeaturedArticles(featuredRes.data.data || []);
      setCategories(categoryRes.data || []);
      setStats(statRes.data || null);
      setSyncStatus(statusRes.data || null);
      return { total: articleRes.data.pagination?.total || list.length, status: statusRes.data };
    } catch (error) {
      setNotice(FRIENDLY_ERROR_MESSAGE);
      return { total: 0 };
    } finally {
      if (!silent) setLoading(false);
    }
  }

  async function syncNow({ auto = false } = {}) {
    setSyncing(true);
    setNotice(auto ? 'Lần đầu chưa có tin, hệ thống đang tự kéo dữ liệu RSS vào MongoDB...' : 'Đang cập nhật tin từ các nguồn RSS. Lần đầu có thể hơi lâu một chút.');
    try {
      const response = await api.post('/sync/run');
      setNotice(response.data.message || 'Đã cập nhật tin.');
      if (response.status === 202 || response.data.syncing) {
        window.setTimeout(() => loadData({ silent: true, targetPage: 1 }), 5000);
      } else {
        setPage(1);
        await loadData({ silent: true, targetPage: 1 });
      }
    } catch (error) {
      setNotice(FRIENDLY_ERROR_MESSAGE);
    } finally {
      setSyncing(false);
    }
  }

  function toggleFavorite(article) {
    const exists = favoriteIds.includes(article._id);
    setFavorites(exists ? favorites.filter((item) => item._id !== article._id) : [article, ...favorites].slice(0, 100));
  }

  function handleAssistantResults(results, keyword = '') {
    setSearchQuery(keyword);
    setPage(1);
    if (!results.length) setNotice('Không tìm thấy tin phù hợp. Hãy thử từ khóa khác hoặc bấm cập nhật tin ngay.');
  }

  function handlePageChange(nextPage) {
    setPage(nextPage);
    window.setTimeout(() => {
      listRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 0);
  }

  useEffect(() => {
    loadData().then((result) => {
      if (!autoSyncStarted.current && Number(result.total) === 0 && !result.status?.syncing) {
        autoSyncStarted.current = true;
        syncNow({ auto: true });
      }
    });
  }, [page, searchQuery]);

  useEffect(() => {
    if (!syncStatus?.syncing) return undefined;
    const timer = window.setInterval(() => loadData({ silent: true }), 8000);
    return () => window.clearInterval(timer);
  }, [syncStatus?.syncing, page, searchQuery]);

  useEffect(() => {
    const minutes = Math.max(Number(syncStatus?.syncIntervalMinutes || 30), 1);
    const timer = window.setInterval(() => loadData({ silent: true }), minutes * 60 * 1000);
    return () => window.clearInterval(timer);
  }, [syncStatus?.syncIntervalMinutes, page, searchQuery]);

  const popularArticles = stats?.popular || articles.slice(0, 5);
  const displayCap = pagination?.displayCap || 4000;
  const displayedTotal = pagination?.total || 0;

  return (
    <>
      <Hero stats={stats} syncStatus={syncStatus} onSync={() => syncNow()} syncing={syncing || syncStatus?.syncing} />
      <CategoryMenu categories={categories} />
      <SearchAssistant onResults={handleAssistantResults} />

      {notice && <div className="container notice">{notice}</div>}

      <div className="container mobile-widget-stack">
        <RicePriceWidget />
      </div>

      <main className="container main-layout">
        <div className="main-column">
          <AutoNewsCarousel articles={featuredArticles.length ? featuredArticles : articles} />

          <section className="section-head latest-head" ref={listRef}>
            <div>
              <span className="eyebrow">{searchQuery ? 'Kết quả tìm kiếm' : 'Bảng tin tổng hợp'}</span>
              <h2>{searchQuery ? `Tin liên quan "${searchQuery}"` : 'Tin mới đang cập nhật'}</h2>
              <p className="latest-cap-note">Hiển thị tối đa {displayCap.toLocaleString('vi-VN')} tin mới nhất, đang có {displayedTotal.toLocaleString('vi-VN')} tin trong danh sách.</p>
            </div>
            <button className="ghost-btn" onClick={() => loadData()}>Làm mới giao diện</button>
          </section>

          <section className="article-grid">
            {loading ? (
              <Loading />
            ) : articles.length ? (
              articles.map((article) => (
                <ArticleCard
                  key={article._id}
                  article={article}
                  onToggleFavorite={toggleFavorite}
                  isFavorite={favoriteIds.includes(article._id)}
                />
              ))
            ) : (
              <EmptyState title="Chưa có tin" text="Backend đang cần đồng bộ RSS lần đầu. Hãy chờ vài giây hoặc bấm Cập nhật tin ngay." />
            )}
          </section>

          <Pagination pagination={pagination} onPageChange={handlePageChange} />

          {riceArticles.length > 0 && (
            <section className="topic-block">
              <div className="section-head compact">
                <div>
                  <span className="eyebrow">Lúa gạo nổi bật</span>
                  <h2>Tin thị trường lúa gạo</h2>
                </div>
              </div>
              <div className="article-grid two-col">
                {riceArticles.map((article) => <ArticleCard key={article._id} article={article} compact />)}
              </div>
            </section>
          )}

          {footballArticles.length > 0 && (
            <section className="topic-block">
              <div className="section-head compact">
                <div>
                  <span className="eyebrow">Bóng đá</span>
                  <h2>Tin bóng đá mới nhất</h2>
                </div>
              </div>
              <div className="article-grid two-col">
                {footballArticles.map((article) => <ArticleCard key={article._id} article={article} compact />)}
              </div>
            </section>
          )}
        </div>

        <aside className="sidebar-column">
          <RicePriceWidget />
          <FootballWidget />

          <section className="sidebar-widget">
            <div className="widget-head">
              <span className="eyebrow">Đọc nhiều</span>
              <h2>Tin được quan tâm</h2>
            </div>
            <div className="sidebar-list">
              {popularArticles.slice(0, 5).map((item) => (
                <Link key={item._id || item.slug || item.title} to={`/article/${item.slug}`}>
                  <strong>{normalizeVietnameseText(item.title)}</strong>
                  {item.views !== undefined && <small>{item.views} lượt xem</small>}
                </Link>
              ))}
            </div>
          </section>

          <section className="sidebar-widget">
            <div className="widget-head">
              <span className="eyebrow">Cá nhân</span>
              <h2>Tin đã lưu</h2>
            </div>
            {favorites.length ? (
              <div className="sidebar-list">
                {favorites.slice(0, 4).map((item) => (
                  <Link key={item._id} to={`/article/${item.slug}`}>
                    <strong>{normalizeVietnameseText(item.title)}</strong>
                    <small>{normalizeVietnameseText(item.sourceName || item.source || 'Tin Tức 247')}</small>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="widget-message">Bạn chưa lưu tin nào.</p>
            )}
          </section>
        </aside>
      </main>
    </>
  );
}

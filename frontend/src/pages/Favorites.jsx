import ArticleCard from '../components/ArticleCard.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { useLocalStorage } from '../hooks/useLocalStorage.js';

export default function Favorites() {
  const [favorites, setFavorites] = useLocalStorage('favorites', []);
  const favoriteIds = favorites.map((item) => item._id);

  function toggleFavorite(article) {
    setFavorites(favorites.filter((item) => item._id !== article._id));
  }

  return (
    <>
      <div className="page-hero small">
        <div className="container">
          <span className="eyebrow">Cá nhân</span>
          <h1>Tin đã lưu</h1>
          <p>Các tin bạn lưu được giữ trong trình duyệt của máy này.</p>
        </div>
      </div>
      <section className="container article-grid top-gap">
        {favorites.length ? favorites.map((article) => (
          <ArticleCard
            key={article._id}
            article={article}
            onToggleFavorite={toggleFavorite}
            isFavorite={favoriteIds.includes(article._id)}
          />
        )) : <EmptyState title="Bạn chưa lưu tin nào" text="Bấm nút Lưu tin ở các bài viết để xem lại nhanh hơn." />}
      </section>
    </>
  );
}

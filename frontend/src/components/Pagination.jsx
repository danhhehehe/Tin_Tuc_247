import './Pagination.css';

export default function Pagination({ pagination, onPageChange }) {
  if (!pagination || pagination.totalPages <= 1) return null;

  const visibleStart = Math.max(1, pagination.page - 1);
  const visibleEnd = Math.min(pagination.totalPages, pagination.page + 1);
  const pages = [];
  for (let page = visibleStart; page <= visibleEnd; page += 1) pages.push(page);

  return (
    <nav className="pagination-bar" aria-label="Phân trang tin tức">
      <button
        type="button"
        disabled={!pagination.hasPrevPage}
        onClick={() => onPageChange(1)}
      >
        Đầu
      </button>

      <button
        type="button"
        disabled={!pagination.hasPrevPage}
        onClick={() => onPageChange(pagination.page - 1)}
      >
        ← Trước
      </button>

      <div className="page-number-row">
        {visibleStart > 1 && <span>...</span>}
        {pages.map((page) => (
          <button
            key={page}
            type="button"
            className={page === pagination.page ? 'active-page' : ''}
            onClick={() => onPageChange(page)}
          >
            {page}
          </button>
        ))}
        {visibleEnd < pagination.totalPages && <span>...</span>}
      </div>

      <span className="pagination-summary">Trang {pagination.page} / {pagination.totalPages}</span>

      <button
        type="button"
        disabled={!pagination.hasNextPage}
        onClick={() => onPageChange(pagination.page + 1)}
      >
        Tiếp theo →
      </button>

      <button
        type="button"
        disabled={!pagination.hasNextPage}
        onClick={() => onPageChange(pagination.totalPages)}
      >
        Cuối
      </button>
    </nav>
  );
}

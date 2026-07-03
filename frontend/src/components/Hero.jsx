import { Link } from 'react-router-dom';
import { normalizeVietnameseText } from '../utils/textNormalize.js';

function formatDate(date) {
  if (!date) return 'Chưa có';
  return new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(new Date(date));
}

export default function Hero({ stats, syncStatus, onSync, syncing }) {
  const interval = syncStatus?.syncIntervalMinutes || 30;

  return (
    <section className="hero-section">
      <div className="container hero-grid">
        <div className="hero-copy">
          <span className="eyebrow">Tin mới tự động mỗi {interval} phút</span>
          <h1>Tin Tức 247 - đọc nhanh, tìm dễ, nghe được bằng giọng nói.</h1>
          <p>
            Tập trung vào nông nghiệp, lúa gạo, bóng đá, thời sự, giao thông, an toàn lao động,
            công nghệ và các chủ đề đang được quan tâm.
          </p>
          <div className="hero-actions">
            <button onClick={onSync} disabled={syncing} className="primary-btn">
              {syncing ? 'Đang cập nhật...' : 'Cập nhật tin ngay'}
            </button>
            <Link to="/sources" className="ghost-btn">Lấy tin từ đâu</Link>
          </div>
        </div>
        <div className="hero-card">
          <div className="pulse-dot" />
          <h2>Trạng thái hệ thống</h2>
          <div className="stat-list">
            <div><strong>{stats?.total || syncStatus?.articleCount || 0}</strong><span>Bài viết</span></div>
            <div><strong>{syncStatus?.activeSourceCount || stats?.sourceCount || 0}</strong><span>Nguồn tin</span></div>
            <div><strong>{interval}p</strong><span>Lịch cập nhật</span></div>
          </div>
          <p>Tin mới nhất: {normalizeVietnameseText(stats?.newest?.title || 'Chưa có dữ liệu, hãy bấm cập nhật.')}</p>
          <div className="sync-times">
            <span>Lần cập nhật gần nhất: {formatDate(syncStatus?.lastSync)}</span>
            <span>Lần tiếp theo: {formatDate(syncStatus?.nextSync)}</span>
          </div>
        </div>
      </div>
    </section>
  );
}

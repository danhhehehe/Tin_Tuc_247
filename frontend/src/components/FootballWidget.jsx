import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api.js';
import './FootballWidget.css';

const tabs = [
  { key: 'today', label: 'Hôm nay' },
  { key: 'live', label: 'Đang đá' },
  { key: 'finished', label: 'Đã kết thúc' }
];

function formatTime(date) {
  if (!date) return 'Chưa rõ giờ';
  return new Intl.DateTimeFormat('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit'
  }).format(new Date(date));
}

function statusLabel(status) {
  if (['LIVE', 'IN_PLAY'].includes(status)) return 'Đang đá';
  if (status === 'PAUSED') return 'Tạm nghỉ';
  if (status === 'FINISHED') return 'Đã kết thúc';
  if (status === 'POSTPONED') return 'Hoãn';
  if (status === 'CANCELED') return 'Hủy';
  return 'Sắp diễn ra';
}

function formatArticleTime(date) {
  if (!date) return 'Mới cập nhật';
  return new Intl.DateTimeFormat('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }).format(new Date(date));
}

export default function FootballWidget() {
  const [active, setActive] = useState('today');
  const [widget, setWidget] = useState(null);
  const [message, setMessage] = useState('Đang tải lịch bóng đá...');
  const [loading, setLoading] = useState(false);

  async function loadWidget({ sync = false } = {}) {
    setLoading(true);
    try {
      if (sync) await api.post('/football/sync');
      const response = await api.get('/football/widget');
      setWidget(response.data);
      setMessage(response.data.message || 'Đã tải dữ liệu bóng đá.');
    } catch (error) {
      setMessage('Hiện chưa tải được dữ liệu bóng đá. Hệ thống sẽ tự thử lại sau.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadWidget();
  }, []);

  const matches = useMemo(() => widget?.data?.[active] || [], [widget, active]);
  const footballNews = widget?.data?.news || [];
  const highlights = widget?.data?.highlights || [];
  const isFallback = widget?.mode && widget.mode !== 'matches';

  return (
    <section className="sidebar-widget football-widget">
      <div className="widget-head football-widget-head">
        <div>
          <span className="eyebrow">Thể thao</span>
          <h2>Lịch bóng đá & tỉ số</h2>
        </div>
        <button className="football-refresh" onClick={() => loadWidget({ sync: true })} disabled={loading}>
          {loading ? '...' : 'Cập nhật'}
        </button>
      </div>

      <div className="football-tabs">
        {tabs.map((tab) => (
          <button key={tab.key} className={active === tab.key ? 'active' : ''} onClick={() => setActive(tab.key)}>
            {tab.label}
          </button>
        ))}
      </div>

      {matches.length ? (
        <div className="football-match-list">
          {matches.map((match) => (
            <article key={match._id || `${match.provider}-${match.externalId}`} className="football-match">
              <small>{match.league || 'Giải đấu'} · {formatTime(match.matchTime)}</small>
              <div className="football-teams">
                <strong>{match.homeTeam}</strong>
                <span>{match.homeScore ?? '-'} : {match.awayScore ?? '-'}</span>
                <strong>{match.awayTeam}</strong>
              </div>
              <small>{statusLabel(match.status)} · {match.sourceName || match.provider || 'Nguồn bóng đá'}</small>
            </article>
          ))}
        </div>
      ) : isFallback && footballNews.length ? (
        <div className="football-news-fallback">
          <p className="widget-message">{message}</p>
          {footballNews.slice(0, 5).map((item) => (
            <Link key={item.slug || item.url || item.title} to={item.slug ? `/article/${item.slug}` : '/category/bong-da'}>
              <strong>{item.title}</strong>
              <small>{item.sourceName || item.source || 'Tin bóng đá'} · {formatArticleTime(item.publishedAt || item.fetchedAt)}</small>
            </Link>
          ))}
        </div>
      ) : isFallback && highlights.length ? (
        <div className="football-news-fallback">
          <p className="widget-message">{message}</p>
          {highlights.slice(0, 5).map((item) => (
            <a key={item.sourceUrl || item.title} href={item.sourceUrl} target="_blank" rel="noreferrer">
              <strong>{item.title}</strong>
              <small>ScoreBat · {formatArticleTime(item.publishedAt)}</small>
            </a>
          ))}
        </div>
      ) : (
        <p className="widget-message">{message || 'Hiện chưa có lịch bóng đá mới.'}</p>
      )}

      {widget?.config && (
        <small className="football-provider-note">
          Nguồn: {widget.provider || 'auto'} · Múi giờ Việt Nam · {widget.config.theSportsDbMode || 'auto'}
        </small>
      )}
    </section>
  );
}

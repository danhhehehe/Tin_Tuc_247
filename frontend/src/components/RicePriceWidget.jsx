import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import api from '../services/api.js';
import './RicePriceWidget.css';

const EMPTY_MESSAGE = 'Chưa có bảng giá lúa mới. Hệ thống đang cập nhật.';
const GROUP_LABELS = {
  'lua-tuoi': 'Lúa tươi',
  'gao-nguyen-lieu': 'Gạo nguyên liệu',
  'gao-thanh-pham': 'Gạo thành phẩm',
  'gao-xuat-khau': 'Gạo xuất khẩu',
  'phu-pham': 'Phụ phẩm',
  khac: 'Khác'
};

function formatDate(date) {
  if (!date) return 'Đang cập nhật';
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return 'Đang cập nhật';
  return new Intl.DateTimeFormat('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit'
  }).format(parsed);
}

function trendSymbol(trend) {
  if (trend === 'up') return '↑';
  if (trend === 'down') return '↓';
  if (trend === 'stable') return '—';
  return '';
}

function isRealPrice(item) {
  return Boolean(item?.variety && item?.priceText && /\d/.test(item.priceText));
}

function displayPrice(item) {
  const price = item.priceText || '';
  if (/\/kg|\/tấn|\/tan|\/ton|usd/i.test(price)) return price;
  if (/\s*đ$/i.test(price)) return price.replace(/\s*đ$/i, ` ${item.unit || 'đ/kg'}`);
  return `${price} ${item.unit || ''}`.trim();
}

function RicePriceBoardModal({ open, onClose, rows, updatedAt, usingReference, refreshing, onRefresh }) {
  useEffect(() => {
    if (!open) return undefined;

    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="rice-board-overlay" onMouseDown={onClose}>
      <section
        className="rice-board-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Bảng giá lúa gạo lớn"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="rice-board-header">
          <div>
            <span className="eyebrow">Bảng giá lớn</span>
            <h2>Giá các loại lúa gạo nổi bật</h2>
            <p>
              Cập nhật: {formatDate(updatedAt)}. {usingReference
                ? 'Một số dòng là dữ liệu tham khảo khi nguồn trực tuyến chưa phản hồi.'
                : 'Dữ liệu lấy từ nguồn trực tuyến trong hệ thống.'}
            </p>
          </div>

          <button className="rice-board-close" type="button" onClick={onClose} aria-label="Đóng bảng giá">
            ×
          </button>
        </header>

        <div className="rice-board-content">
          <div className="rice-board-actions">
            <button className="primary-btn" type="button" onClick={onRefresh} disabled={refreshing}>
              {refreshing ? 'Đang cập nhật...' : 'Cập nhật bảng giá'}
            </button>
            <Link className="ghost-btn" to="/category/lua-gao" onClick={onClose}>Đọc tin lúa gạo</Link>
          </div>

          <div className="rice-board-table-wrap">
            <table className="rice-board-table">
              <thead>
                <tr>
                  <th>Loại</th>
                  <th>Nhóm</th>
                  <th>Giá</th>
                  <th>Khu vực</th>
                  <th>Xu hướng</th>
                  <th>Nguồn</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((item) => (
                  <tr key={`board-${item.variety}-${item.region}-${item.sourceName}-${item.priceText}`}>
                    <td><strong>{item.variety}</strong></td>
                    <td>{GROUP_LABELS[item.group] || 'Lúa gạo'}</td>
                    <td><strong>{displayPrice(item)}</strong></td>
                    <td>{item.region || 'ĐBSCL'}</td>
                    <td>{item.changeText || (item.trend === 'stable' ? 'Ổn định' : item.trend || 'Đang cập nhật')}</td>
                    <td>{item.sourceUrl ? <a href={item.sourceUrl} target="_blank" rel="noreferrer">{item.sourceName}</a> : item.sourceName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="rice-board-note">
            Lưu ý: Bảng giá có thể thay đổi theo địa phương, chất lượng hàng và thời điểm giao dịch. Nên xem đây là dữ liệu tham khảo nhanh cho website tin tức.
          </p>
        </div>
      </section>
    </div>,
    document.body
  );
}

export default function RicePriceWidget({ variant = 'sidebar' }) {
  const [prices, setPrices] = useState([]);
  const [boardPrices, setBoardPrices] = useState([]);
  const [message, setMessage] = useState(EMPTY_MESSAGE);
  const [expanded, setExpanded] = useState(false);
  const [boardOpen, setBoardOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  async function loadPrices(limit = 8) {
    const response = await api.get(`/rice-prices/latest?limit=${limit}`);
    const data = (response.data.data || []).filter(isRealPrice);
    setMessage(response.data.message || EMPTY_MESSAGE);
    if (limit > 8) setBoardPrices(data);
    else setPrices(data);
    return data;
  }

  useEffect(() => {
    let mounted = true;
    api.get('/rice-prices/latest?limit=8')
      .then((response) => {
        if (!mounted) return;
        const data = (response.data.data || []).filter(isRealPrice);
        setPrices(data);
        setMessage(response.data.message || EMPTY_MESSAGE);
      })
      .catch(() => {
        if (mounted) setMessage(EMPTY_MESSAGE);
      });
    return () => {
      mounted = false;
    };
  }, []);

  async function openBoard() {
    setBoardOpen(true);
    if (!boardPrices.length) {
      try {
        await loadPrices(30);
      } catch {
        setBoardPrices(prices);
      }
    }
  }

  async function refreshPrices() {
    setRefreshing(true);
    try {
      const response = await api.post('/rice-prices/sync?limit=30');
      const data = (response.data.data || []).filter(isRealPrice);
      setPrices(data.slice(0, 8));
      setBoardPrices(data);
      setMessage(response.data.message || 'Đã cập nhật bảng giá lúa gạo.');
    } catch {
      setMessage('Chưa kéo được bảng giá trực tuyến. Đang giữ bảng tham khảo để không bị trống.');
    } finally {
      setRefreshing(false);
    }
  }

  const visiblePrices = useMemo(() => (expanded ? prices : prices.slice(0, 6)), [expanded, prices]);
  const modalRows = boardPrices.length ? boardPrices : prices;
  const updatedAt = modalRows[0]?.priceDate || modalRows[0]?.fetchedAt;
  const usingReference = modalRows.some((item) => item.referenceOnly);

  return (
    <>
    <section className={`sidebar-widget rice-widget rice-widget-${variant}`}>
      <div className="widget-head rice-widget-head">
        <span className="eyebrow">Thị trường</span>
        <h2>Giá lúa hôm nay</h2>
        <p>{message || 'Cập nhật mới nhất từ thị trường'}</p>
      </div>

      {visiblePrices.length ? (
        <div className="rice-price-list">
          {visiblePrices.map((item) => (
            <article key={`${item.variety}-${item.region}-${item.sourceName}-${item.priceDate}`} className={`rice-price-row trend-${item.trend || 'unknown'}`}>
              <div className="rice-price-topline">
                <strong>{item.variety}</strong>
                <span className="rice-price-trend">{trendSymbol(item.trend)}</span>
              </div>
              <div className="rice-price-value">
                <strong>{displayPrice(item)}</strong>
                {item.changeText && <small>{item.changeText}</small>}
              </div>
              <small className="rice-price-meta">{GROUP_LABELS[item.group] || 'Lúa gạo'} · {item.region} · {item.sourceName}</small>
              <small className="rice-price-meta">Cập nhật: {formatDate(item.priceDate || item.fetchedAt)}</small>
            </article>
          ))}
        </div>
      ) : (
        <p className="widget-message">{message || EMPTY_MESSAGE}</p>
      )}

      {prices.length > 6 && (
        <button className="rice-more-btn" onClick={() => setExpanded((value) => !value)}>
          {expanded ? 'Thu gọn' : 'Xem thêm giá nhanh'}
        </button>
      )}

      <div className="rice-widget-actions">
        <button className="widget-link rice-open-board" type="button" onClick={openBoard}>Xem tin lúa gạo & bảng giá lớn</button>
        <button className="rice-refresh-btn" type="button" onClick={refreshPrices} disabled={refreshing}>{refreshing ? 'Đang cập nhật...' : 'Cập nhật giá'}</button>
      </div>

    </section>

    <RicePriceBoardModal
      open={boardOpen}
      onClose={() => setBoardOpen(false)}
      rows={modalRows}
      updatedAt={updatedAt}
      usingReference={usingReference}
      refreshing={refreshing}
      onRefresh={refreshPrices}
    />
    </>
  );
}

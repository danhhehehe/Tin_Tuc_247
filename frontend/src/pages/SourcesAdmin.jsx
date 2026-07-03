import { useEffect, useMemo, useState } from 'react';
import api, { FRIENDLY_ERROR_MESSAGE } from '../services/api.js';
import Loading from '../components/Loading.jsx';

const categoryOptions = [
  'nong-nghiep', 'lua-gao', 'nong-nghiep-the-gioi', 'bong-da', 'thoi-su', 'giao-thong',
  'an-toan-lao-dong', 'cong-nghe', 'kinh-doanh', 'suc-khoe', 'khoa-hoc', 'the-gioi', 'moi-nhat'
];

function sourceLink(source) {
  return source.homepage || source.url || '#';
}

function sourceStatus(source) {
  if (!source.enabled) return 'Đã tắt';
  if (source.lastStatus === 'success') return 'Đang lấy tin';
  if (source.lastStatus === 'failed') return 'Tạm lỗi, sẽ thử lại';
  return 'Đang chờ cập nhật';
}

export default function SourcesAdmin() {
  const [sources, setSources] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [notice, setNotice] = useState('');
  const [form, setForm] = useState({ name: '', url: '', homepage: '', category: 'nong-nghiep', language: 'vi', priority: 1 });

  const activeCount = useMemo(() => sources.filter((source) => source.enabled).length, [sources]);

  async function loadData() {
    setLoading(true);
    try {
      const [sourceRes, logRes] = await Promise.all([api.get('/sources'), api.get('/sync/logs')]);
      setSources(sourceRes.data || []);
      setLogs(logRes.data || []);
    } catch (error) {
      setNotice(FRIENDLY_ERROR_MESSAGE);
    } finally {
      setLoading(false);
    }
  }

  async function createSource(event) {
    event.preventDefault();
    try {
      await api.post('/sources', form);
      setForm({ name: '', url: '', homepage: '', category: 'nong-nghiep', language: 'vi', priority: 1 });
      setNotice('Đã thêm nguồn tin mới.');
      await loadData();
    } catch (error) {
      setNotice(FRIENDLY_ERROR_MESSAGE);
    }
  }

  async function toggleSource(source) {
    try {
      await api.patch(`/sources/${source._id}`, { enabled: !source.enabled });
      await loadData();
    } catch (error) {
      setNotice(FRIENDLY_ERROR_MESSAGE);
    }
  }

  async function deleteSource(source) {
    const ok = window.confirm(`Xóa nguồn ${source.name}?`);
    if (!ok) return;
    try {
      await api.delete(`/sources/${source._id}`);
      await loadData();
    } catch (error) {
      setNotice(FRIENDLY_ERROR_MESSAGE);
    }
  }

  async function syncNow() {
    setSyncing(true);
    setNotice('Đang lấy tin mới từ các nguồn...');
    try {
      const response = await api.post('/sync/run');
      setNotice(response.data.message || 'Đã cập nhật nguồn tin.');
      await loadData();
    } catch (error) {
      setNotice(FRIENDLY_ERROR_MESSAGE);
    } finally {
      setSyncing(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  return (
    <>
      <div className="page-hero small source-hero-clean">
        <div className="container source-hero-content">
          <div>
            <span className="eyebrow">Nguồn dữ liệu</span>
            <h1>Lấy tin từ đâu?</h1>
            <p>Trang này chỉ hiển thị các nguồn báo/RSS mà hệ thống đang đọc để cập nhật tin mới.</p>
          </div>
          <div className="source-hero-actions">
            <span>{activeCount}/{sources.length || 0} nguồn đang bật</span>
            <button className="primary-btn" onClick={syncNow} disabled={syncing}>{syncing ? 'Đang lấy tin...' : 'Lấy tin mới'}</button>
          </div>
        </div>
      </div>

      {notice && <div className="container notice">{notice}</div>}

      <section className="container sources-modern top-gap">
        <div className="source-panel source-panel-wide">
          <div className="source-panel-head">
            <div>
              <span className="eyebrow">Danh sách nguồn</span>
              <h2>Nơi hệ thống đang lấy tin</h2>
            </div>
          </div>

          {loading ? <Loading /> : (
            <div className="source-card-grid">
              {sources.map((source) => (
                <article key={source._id} className={source.enabled ? 'source-card active' : 'source-card muted'}>
                  <div className="source-card-top">
                    <strong>{source.name}</strong>
                    <span>{sourceStatus(source)}</span>
                  </div>
                  <a href={sourceLink(source)} target="_blank" rel="noreferrer">Lấy từ: {sourceLink(source)}</a>
                  <small>Nhóm tin: {source.category || 'moi-nhat'}</small>
                  {source.lastStatus === 'failed' && <em>Nguồn này tạm thời chưa truy cập được, hệ thống sẽ tự thử lại.</em>}
                  <div className="source-actions compact-actions">
                    <button onClick={() => toggleSource(source)}>{source.enabled ? 'Tạm tắt' : 'Bật lại'}</button>
                    <button onClick={() => deleteSource(source)}>Xóa</button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        <details className="source-form source-details">
          <summary>Thêm nguồn mới</summary>
          <form onSubmit={createSource} className="source-details-form">
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Tên nguồn, ví dụ: Báo Nông nghiệp" required />
            <input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="Link RSS, ví dụ: https://...rss" required />
            <input value={form.homepage} onChange={(e) => setForm({ ...form, homepage: e.target.value })} placeholder="Trang chủ nguồn tin" />
            <div className="form-row">
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {categoryOptions.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
              <input type="number" min="1" max="10" value={form.priority} onChange={(e) => setForm({ ...form, priority: Number(e.target.value) })} />
            </div>
            <button className="primary-btn" type="submit">Thêm nguồn</button>
          </form>
        </details>
      </section>

      <details className="container logs-panel source-log-details">
        <summary>Trạng thái cập nhật gần đây</summary>
        <div className="log-list">
          {logs.map((log) => (
            <div key={log._id} className="log-item">
              <strong>{new Date(log.createdAt).toLocaleString('vi-VN')}</strong>
              <span>{log.message}</span>
            </div>
          ))}
        </div>
      </details>
    </>
  );
}

import { NavLink, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

const navItems = [
  { to: '/', label: 'Trang chủ' },
  { to: '/category/nong-nghiep', label: 'Nông nghiệp' },
  { to: '/category/lua-gao', label: 'Lúa gạo' },
  { to: '/category/bong-da', label: 'Bóng đá' },
  { to: '/category/cong-nghe', label: 'Công nghệ' },
  { to: '/favorites', label: 'Đã lưu' },
  { to: '/sources', label: 'Lấy tin từ đâu' }
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const [largeText, setLargeText] = useState(() => localStorage.getItem('largeText') === 'true');

  useEffect(() => {
    document.body.classList.toggle('large-text', largeText);
    localStorage.setItem('largeText', String(largeText));
  }, [largeText]);

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link to="/" className="brand" aria-label="Tin Tức 247">
          <span className="brand-mark">24/7</span>
          <span>
            <strong>Tin Tức 247</strong>
            <small>Tin mới dễ đọc</small>
          </span>
        </Link>

        <button className="menu-btn" onClick={() => setOpen(!open)} aria-label="Mở menu">
          ☰
        </button>

        <nav className={open ? 'nav-links open' : 'nav-links'}>
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} onClick={() => setOpen(false)}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <button className="accessibility-btn" onClick={() => setLargeText((value) => !value)}>
          {largeText ? 'Chữ thường' : 'Chữ lớn'}
        </button>
      </div>
    </header>
  );
}

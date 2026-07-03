import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { normalizeVietnameseText } from '../utils/textNormalize.js';

export default function CategoryMenu({ categories = [] }) {
  const { category } = useParams();
  const [open, setOpen] = useState(false);

  return (
    <section className="category-menu-wrap container">
      <button className="category-menu-btn" onClick={() => setOpen((value) => !value)}>
        Danh mục
      </button>
      {open && (
        <div className="category-menu-panel">
          <div className="category-menu-head">
            <strong>Chọn chuyên mục</strong>
            <button onClick={() => setOpen(false)}>Đóng</button>
          </div>
          <div className="category-menu-grid">
            {categories.map((item) => (
              <Link
                key={item.key}
                to={item.key === 'moi-nhat' ? '/' : `/category/${item.key}`}
                onClick={() => setOpen(false)}
                className={category === item.key || (!category && item.key === 'moi-nhat') ? 'category-menu-item active' : 'category-menu-item'}
              >
                <span>{item.icon}</span>
                <strong>{normalizeVietnameseText(item.label)}</strong>
                <small>{item.count || 0}</small>
              </Link>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

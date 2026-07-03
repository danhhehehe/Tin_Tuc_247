import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <h3>Tin Tức 247</h3>
          <p>Tổng hợp tin mới từ RSS, ưu tiên trải nghiệm dễ đọc, dễ tìm kiếm cho mọi độ tuổi.</p>
        </div>
        <div>
          <h4>Chức năng</h4>
          <Link to="/sources">Quản lý nguồn tin</Link>
          <Link to="/favorites">Tin đã lưu</Link>
          <Link to="/about">Giới thiệu</Link>
        </div>
        <div>
          <h4>Lưu ý</h4>
          <p>Mỗi bài viết luôn có link đọc đầy đủ tại báo gốc. Hệ thống sẽ tự thử lại nếu một vài nguồn tin tạm thời bị lỗi.</p>
          <a
            className="footer-credit"
            href="https://www.facebook.com/huynh.thanh.danh.634137/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Code by @caubevacauvang
          </a>
        </div>
      </div>
    </footer>
  );
}

export default function About() {
  return (
    <div className="page-hero small about-page">
      <div className="container prose-card">
        <span className="eyebrow">Giới thiệu</span>
        <h1>Tin Tức 247</h1>
        <p>
          Dự án tổng hợp tin tức từ nhiều nguồn RSS, lưu vào MongoDB và hiển thị trên giao diện dễ dùng cho cả điện thoại lẫn máy tính.
        </p>
        <h2>Điểm nổi bật</h2>
        <p>
          Website có tìm kiếm bằng giọng nói, đọc tin bằng giọng nói, nút chữ lớn cho người lớn tuổi,
          trang quản lý nguồn tin và lịch cập nhật tự động 30 phút/lần.
        </p>
        <h2>Phạm vi tin tức</h2>
        <p>
          Nông nghiệp, lúa gạo trong và ngoài nước, bóng đá, thời sự, giao thông, an toàn lao động,
          công nghệ, kinh doanh, sức khỏe, khoa học và thế giới.
        </p>
        <h2>Lưu ý bản quyền</h2>
        <p>
          Website chỉ hiển thị tiêu đề, tóm tắt, ảnh đại diện và đường dẫn về nguồn gốc.
          Không nên sao chép toàn bộ nội dung bài báo khi chưa được phép.
        </p>
      </div>
    </div>
  );
}

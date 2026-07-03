export default function EmptyState({ title = 'Chưa có dữ liệu', text = 'Hãy thử cập nhật tin hoặc đổi từ khóa tìm kiếm.' }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">Tin</div>
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}

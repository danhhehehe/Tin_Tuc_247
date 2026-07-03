export default function Loading({ text = 'Đang tải dữ liệu...' }) {
  return (
    <div className="loading-box">
      <span className="loader" />
      <p>{text}</p>
    </div>
  );
}

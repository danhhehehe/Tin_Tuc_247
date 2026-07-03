export function notFound(req, res, next) {
  const error = new Error(`Endpoint not found: ${req.originalUrl}`);
  res.status(404);
  next(error);
}

export function errorHandler(error, req, res, next) {
  const status = res.statusCode === 200 ? 500 : res.statusCode;

  console.error('[API ERROR]');
  console.error(`Request: ${req.method} ${req.originalUrl}`);
  console.error(`Status: ${status}`);
  console.error(`Message: ${error.message}`);
  if (error.stack) console.error(error.stack);

  const message = status === 404
    ? 'Không tìm thấy nội dung yêu cầu.'
    : 'Hiện chưa tải được dữ liệu mới. Hệ thống sẽ tự thử lại sau.';

  res.status(status).json({
    success: false,
    message
  });
}

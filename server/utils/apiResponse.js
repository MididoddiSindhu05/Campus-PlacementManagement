export function ok(res, data, message = "OK", status = 200) {
  return res.status(status).json({
    success: true,
    message,
    data,
  });
}

export function fail(res, message = "Error", status = 400, errors = null) {
  const body = { success: false, message };
  if (errors) body.errors = errors;
  return res.status(status).json(body);
}

export function paginationMeta(total, page, limit) {
  return {
    total,
    page,
    limit,
    pages: Math.ceil(total / limit) || 1,
  };
}

export function getPagination(query) {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 10));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

export function sortSpec(query, defaultSort = "-createdAt") {
  const sort = query.sort && String(query.sort).trim();
  return sort || defaultSort;
}

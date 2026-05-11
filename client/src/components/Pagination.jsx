export default function Pagination({ page, pages, onChange }) {
  if (pages <= 1) return null;
  return (
    <div className="flex items-center gap-2 text-sm">
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        className="rounded border border-slate-200 px-3 py-1 disabled:opacity-40"
      >
        Prev
      </button>
      <span>
        Page {page} / {pages}
      </span>
      <button
        type="button"
        disabled={page >= pages}
        onClick={() => onChange(page + 1)}
        className="rounded border border-slate-200 px-3 py-1 disabled:opacity-40"
      >
        Next
      </button>
    </div>
  );
}

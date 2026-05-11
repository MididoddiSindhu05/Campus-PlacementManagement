export default function Spinner({ sm }) {
  return (
    <div
      className={`inline-block animate-spin rounded-full border-2 border-primary border-t-transparent ${
        sm ? "h-5 w-5" : "h-10 w-10"
      }`}
      role="status"
    />
  );
}

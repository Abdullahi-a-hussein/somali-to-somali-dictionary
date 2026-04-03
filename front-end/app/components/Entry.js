export default function Entry(entry) {
  return (
    <div className="mb-4">
      <div className="font-semibold text-[var(--foreground)] mt-4 b4-4">
        {entry.headword}
      </div>
      <div className="space-y-3"></div>
    </div>
  );
}

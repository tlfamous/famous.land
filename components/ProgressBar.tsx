export function ProgressBar({ current, total }: { current: number; total: number }) {
  const percent = total === 0 ? 0 : Math.min(100, Math.round((current / total) * 100));

  return (
    <div className="progress-bar" aria-label={`${current} of ${total}`}>
      <span style={{ width: `${percent}%` }} />
    </div>
  );
}

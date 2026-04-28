import { getEarnedBadges, getLockedBadges } from "@/lib/game";

export function BadgeList({ foundIds }: { foundIds: string[] }) {
  const earned = getEarnedBadges(foundIds);
  const locked = getLockedBadges(foundIds);

  return (
    <section className="stack">
      <div>
        <h2>Badges earned</h2>
        {earned.length === 0 ? (
          <p className="muted">No badges yet. Your first scan unlocks First Find.</p>
        ) : (
          <div className="badge-grid">
            {earned.map((badge) => (
              <div className="badge earned" key={badge.id}>
                <strong>{badge.name}</strong>
                <span>{badge.description}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2>Still locked</h2>
        <div className="badge-grid">
          {locked.map((badge) => (
            <div className="badge locked" key={badge.id}>
              <strong>{badge.name}</strong>
              <span>{badge.description}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

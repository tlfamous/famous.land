import { getCompletedZoneQuests } from "@/lib/game";

export function CompletedZoneQuests({ foundIds }: { foundIds: string[] }) {
  const completed = getCompletedZoneQuests(foundIds);

  return (
    <section>
      <h2>Completed zone quests</h2>
      {completed.length === 0 ? (
        <p className="muted">No zone quests completed yet. Finish a zone to complete one.</p>
      ) : (
        <div className="zone-quest-grid">
          {completed.map((quest) => (
            <div className="zone-quest-card complete" key={quest.id}>
              <strong>{quest.title}</strong>
              <span>{quest.description}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

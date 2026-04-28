"use client";

import { useEffect, useState } from "react";
import { getQuestStatuses, getZoneProgress } from "@/lib/game";
import { getLocalScannedMarkers } from "@/lib/localPlayer";
import { ProgressBar } from "@/components/ProgressBar";

export function QuestList({ initialFoundIds = [] }: { initialFoundIds?: string[] }) {
  const [foundIds, setFoundIds] = useState(initialFoundIds);

  useEffect(() => {
    setFoundIds(getLocalScannedMarkers());
  }, []);

  const quests = getQuestStatuses(foundIds);
  const zoneProgress = getZoneProgress(foundIds);

  return (
    <div className="stack">
      <section className="card">
        <p className="eyebrow">Quest board</p>
        <h1>Choose a small adventure or chase the whole summer.</h1>
        <p className="muted">
          Day visitors can finish the Quick Quest. Summer explorers can work through zones,
          20-marker progress, and the full 30-marker finish.
        </p>
      </section>

      <section className="quest-list">
        {quests.map((quest) => (
          <article className={quest.complete ? "quest complete" : "quest"} key={quest.id}>
            <div>
              <p className="eyebrow">{quest.complete ? "Badge unlocked" : "In progress"}</p>
              <h2>{quest.title}</h2>
              <p>{quest.description}</p>
            </div>
            <div>
              <strong>{quest.badge}</strong>
              <span>
                {quest.current} of {quest.total}
              </span>
              <ProgressBar current={quest.current} total={quest.total} />
            </div>
          </article>
        ))}
      </section>

      <section className="card">
        <h2>Zone progress</h2>
        <div className="zone-list">
          {zoneProgress.map((zone) => (
            <div key={zone.zone}>
              <div className="split">
                <strong>{zone.zone}</strong>
                <span>
                  {zone.current}/{zone.total}
                </span>
              </div>
              <ProgressBar current={zone.current} total={zone.total} />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

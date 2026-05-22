import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Feature Backlog | Famous Land Admin",
  description: "Feature backlog items for Famous Land game and admin work."
};

const backlogItems = [
  {
    title: "First scan experience",
    status: "Ready for field test",
    summary:
      "First marker scans now get a distinct onboarding state before the normal marker flow.",
    details: [
      "Shows a first-scan introduction explaining the game, basic safety, and phone-based progress.",
      "Keeps email recovery quiet on scan one and explains that it is optional later for active players.",
      "Preserves the stronger save-progress callout for players who reach 5 marker finds."
    ]
  },
  {
    title: "Email linking experience",
    status: "Needs end-to-end test",
    summary:
      "Verify that saved email addresses link cleanly to the right anonymous phone/player record.",
    details: [
      "Test the save-progress flow from marker progress through email entry.",
      "Confirm the player row updates with the email address.",
      "Verify recovery behavior on a fresh or reset phone state."
    ]
  },
  {
    title: "Grand prize experience",
    status: "Single hidden prize flow wired",
    summary:
      "Finish-the-quest players now get a hidden-until-complete grand-prize reveal for the 3D printed Lake Monomonac model.",
    details: [
      "The only live giveaway mechanic is one final grand prize.",
      "Finding all 21 markers in any order unlocks a prominent grand-prize reveal.",
      "QR code on the back of the model should open https://famous.land/prize/lakemonomonac2026.",
      "Show completed zone quests with completion dates on each zone quest."
    ]
  },
  {
    title: "Giveaway controls",
    status: "Backlog",
    summary:
      "Add admin controls for pausing or ending the single grand-prize giveaway when inventory runs out.",
    details: [
      "Keep zone quests as progress milestones, not prize tiers.",
      "Do not mention the grand prize in public rules, onboarding, or quest copy before completion.",
      "Let admins turn off the reveal or replace it with a non-giveaway completion message later."
    ]
  }
];

export default function BacklogPage() {
  return (
    <div className="stack backlog-page">
      <section className="dashboard-page-header">
        <h1>Feature Backlog</h1>
        <p>{backlogItems.length} active planning items</p>
      </section>

      <section className="backlog-list" aria-label="Feature backlog items">
        {backlogItems.map((item, index) => (
          <article className="backlog-item" key={item.title}>
            <div className="backlog-item-number">{String(index + 1).padStart(2, "0")}</div>
            <div className="backlog-item-body">
              <div className="split backlog-item-head">
                <h2>{item.title}</h2>
                <span>{item.status}</span>
              </div>
              <p>{item.summary}</p>
              <ul>
                {item.details.map((detail) => (
                  <li key={detail}>{detail}</li>
                ))}
              </ul>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}

import type { Metadata } from "next";
import { TOTAL_MARKERS } from "@/lib/game";

export const metadata: Metadata = {
  title: "Feature Backlog | Famous Land Admin",
  description: "Feature backlog items for Famous Land game and admin work."
};

const backlogItems = [
  {
    title: "Linking experience",
    status: "Needs end-to-end test",
    summary:
      "Verify that saved email addresses and SMS phone numbers link cleanly to the right anonymous phone/player record.",
    details: [
      "Test the save-progress flow from marker progress through email entry.",
      "Test phone-number capture and SMS recovery copy from the player database.",
      "Confirm the player row updates with the saved email address and phone number.",
      "Verify email and SMS recovery behavior on a fresh or reset phone state."
    ]
  },
  {
    title: "Grand Prize Experience",
    status: "Instructions needed",
    summary:
      "Finish-the-quest players get a hidden-until-complete grand-prize reveal, but the claim instructions still need to be written.",
    details: [
      "The only live giveaway mechanic is one final grand prize.",
      `Finding all ${TOTAL_MARKERS} markers in any order unlocks a prominent grand-prize reveal.`,
      "Write clear instructions for how the winner claims or receives the grand prize.",
      "QR code on the back of the model should open https://famous.land/prize/lakemonomonac2026."
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

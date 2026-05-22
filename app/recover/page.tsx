import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Recovery Help | Famous Land"
};

export default function RecoverHelpPage() {
  return (
    <div className="stack">
      <section className="hero-card">
        <p className="eyebrow">Recover progress</p>
        <h1>Use the recovery link from your email.</h1>
        <p>
          Recovery now works from the button in the email we send. Open that email
          on the phone you use for the quest and tap Recover.
        </p>
      </section>

      <section className="card">
        <p>
          If the link opens on a computer, open the same email on your phone. If
          the link is missing or expired, contact support and an admin can send a
          fresh recovery message.
        </p>
        <div className="button-row">
          <Link className="button primary" href="/contact">
            Contact support
          </Link>
          <Link className="button secondary" href="/quest">
            Back to quest
          </Link>
        </div>
      </section>
    </div>
  );
}

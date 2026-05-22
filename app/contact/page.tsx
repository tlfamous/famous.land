import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Famous Land",
  description: "Send a question or feedback for Famous Land."
};

export default function ContactPage() {
  return (
    <div className="stack contact-page">
      <section className="hero-card">
        <p className="eyebrow">Contact</p>
        <h1>Need help?</h1>
        <p>Have a question or feedback? Click below to send a text.</p>
      </section>

      <section className="card contact-card" aria-label="Support form">
        <h2>Send a text</h2>
        <p className="muted">This opens your messsaging app</p>
        <a className="button secondary sms-button" href="sms:+19784310135">
          Send text
        </a>
      </section>

      <section className="card contact-card" aria-label="Optional donation">
        <h2>Donate</h2>
        <p className="muted">Optional donation to support the quest.</p>
        <a
          className="button secondary"
          href="https://www.paypal.com/ncp/payment/M2GPRL3JME5Q4"
          rel="noreferrer"
          target="_blank"
        >
          Donate
        </a>
      </section>
    </div>
  );
}

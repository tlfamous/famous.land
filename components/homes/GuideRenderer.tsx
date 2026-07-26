import { PrintButton } from "./PrintButton";
import styles from "./homes.module.css";

const LOCK_VIDEO_URL = "https://www.youtube.com/watch?v=FnqhGuyrRAM";

export type RenderedGuideSection = {
  id?: string;
  type: string;
  title: string;
  body: string;
  position?: number;
  wifi?: { network: string; password: string };
};

export type RenderedGuide = {
  publicName: string;
  slug: string;
  publishedAt?: string | null;
  sections: RenderedGuideSection[];
  media?: Array<{ id: string; title: string; altText?: string; src: string }>;
};

type GuideRendererProps = {
  canonicalUrl: string;
  guide: RenderedGuide;
  preview?: boolean;
  printPreview?: boolean;
  qrSrc?: string;
  showPrintButton?: boolean;
};

export function GuideRenderer({
  canonicalUrl,
  guide,
  preview = false,
  printPreview = false,
  qrSrc,
  showPrintButton = true
}: GuideRendererProps) {
  const publishedLabel = formatPublishedDate(guide.publishedAt);
  const sortedSections = [...guide.sections].sort(
    (left, right) => (left.position ?? 0) - (right.position ?? 0)
  );

  const faqs = makeFaqs(sortedSections);
  const checkoutSections = sortedSections.filter((section) => section.type === "checkout");
  const diningSections = sortedSections.filter(isDiningSection);
  const instructionSections = sortedSections.filter(
    (section) => section.type !== "checkout" && !isDiningSection(section) && !isFaqOnlySection(section)
  );

  return (
    <>
    {showPrintButton ? (
      <div className={styles.manualActions}>
        <PrintButton />
      </div>
    ) : null}
    <div className={styles.manualPages} data-house-manual>
    <article
      className={`${styles.guideSheet} ${printPreview ? styles.printPreviewSheet : ""}`}
      data-guide-sheet
    >
      <header className={styles.guideHeader}>
        <div>
          <p className={styles.guideKicker}>Famous Land · House guide</p>
          <h1>{guide.publicName}</h1>
          <p className={styles.guideIntro}>
            Everything you need for a comfortable, safe stay—on one page.
          </p>
        </div>
      </header>

      {preview ? (
        <div className={styles.previewNotice} role="status">
          Draft preview · Nothing here is public until you publish.
        </div>
      ) : null}

      {guide.media?.length ? (
        <div className={styles.guideMedia} aria-label="House photos">
          {guide.media.map((media) => (
            <figure key={media.id}>
              <img
                alt={media.altText || media.title}
                loading="lazy"
                src={media.src}
              />
              <figcaption>{media.title}</figcaption>
            </figure>
          ))}
        </div>
      ) : null}

      <div className={styles.guideColumns}>
        {instructionSections.map((section) => (
          <section className={styles.guideSection} key={section.id ?? `${section.type}-${section.title}`}>
            <h2>{section.title}</h2>
            <GuideBody body={section.body} />
            {isLockSection(section) ? (
              <div className={styles.lockVideoCallout}>
                <img
                  alt="QR code for the lock-opening video"
                  height="68"
                  src={`/homes/${encodeURIComponent(guide.slug)}/lock-video-qr.svg`}
                  width="68"
                />
                <div>
                  <strong>Need a visual walkthrough?</strong>
                  <span>Scan to watch the lock-opening video.</span>
                  <a
                    className={styles.lockVideoUrl}
                    href={LOCK_VIDEO_URL}
                    rel="noreferrer"
                    target="_blank"
                  >
                    {LOCK_VIDEO_URL}
                  </a>
                </div>
              </div>
            ) : null}
            {section.wifi ? (
              <dl className={styles.wifiCredentials}>
                <div><dt>Network</dt><dd>{section.wifi.network}</dd></div>
                <div><dt>Password</dt><dd>{section.wifi.password}</dd></div>
              </dl>
            ) : null}
          </section>
        ))}
        {checkoutSections.length ? (
          <section className={styles.checkoutBox} aria-label="Check Out">
            <h2>Check Out</h2>
            {checkoutSections.map((section) => (
              <div className={styles.checkoutItem} key={section.id ?? `${section.type}-${section.title}`}>
                <h3>{section.title.replace(/^checkout:\s*/i, "")}</h3>
                <GuideBody body={section.body} />
              </div>
            ))}
          </section>
        ) : null}
      </div>

      <footer className={styles.guideFooter}>
        <div className={styles.guideQrCopy}>
          <strong>Scan for the latest instructions</strong>
          <span className={styles.guideUrl}>{canonicalUrl}</span>
          <span>Updated {publishedLabel}</span>
        </div>
        <img
          alt={`QR code for ${guide.publicName} instructions`}
          className={styles.guideQr}
          height="112"
          src={qrSrc ?? `/homes/${encodeURIComponent(guide.slug)}/qr.svg`}
          width="112"
        />
      </footer>
    </article>
    <article className={`${styles.guideSheet} ${styles.faqSheet}`} data-guide-sheet data-manual-side="back">
      <header className={styles.guideHeader}>
        <div>
          <h1>Additional Info</h1>
          <p className={styles.guideIntro}>{guide.publicName}</p>
        </div>
      </header>
      {diningSections.length ? (
        <section className={styles.diningBox} aria-label="Dining nearby">
          {diningSections.map((section) => (
            <div key={section.id ?? `${section.type}-${section.title}`}>
              <h2>{section.title}</h2>
              <GuideBody body={section.body} />
            </div>
          ))}
        </section>
      ) : null}
      <div className={styles.faqColumns}>
        {faqs.map((faq) => (
          <section className={styles.faqItem} key={faq.question}>
            <h2>{faq.question}</h2>
            <GuideBody body={faq.body} />
            {faq.wifi ? (
              <dl className={styles.wifiCredentials}>
                <div><dt>Network</dt><dd>{faq.wifi.network}</dd></div>
                <div><dt>Password</dt><dd>{faq.wifi.password}</dd></div>
              </dl>
            ) : null}
          </section>
        ))}
      </div>
      <footer className={styles.guideFooter}>
        <div className={styles.guideQrCopy}>
          <strong>Need the latest version?</strong>
          <span className={styles.guideUrl}>{canonicalUrl}</span>
          <span>Updated {publishedLabel}</span>
        </div>
      </footer>
    </article>
    </div>
    </>
  );
}

function isDiningSection(section: RenderedGuideSection) {
  return section.type === "food" && /^dining near\b/i.test(section.title);
}

function isLockSection(section: RenderedGuideSection) {
  return /^opening the lock$/i.test(section.title);
}

function isFaqOnlySection(section: RenderedGuideSection) {
  return (
    section.type === "bathroom" ||
    (section.type === "water" && /^can i bring my boat and use the dock\?$/i.test(section.title))
  );
}

function makeFaqs(sections: RenderedGuideSection[]) {
  const selected = sections.filter(isFaqOnlySection);
  return selected.map((section) => ({
    question: section.type === "bathroom" ? "How does the outdoor shower work?" : section.title,
    body: section.body,
    wifi: section.wifi
  }));
}

function GuideBody({ body }: { body: string }) {
  const blocks = body
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);

  if (blocks.length === 0) {
    return <p className={styles.emptyGuideSection}>Add instructions before publishing.</p>;
  }

  return blocks.map((block, index) => {
    const lines = block.split("\n").map((line) => line.trim()).filter(Boolean);
    const isUnorderedList = lines.length > 0 && lines.every((line) => /^[-*•]\s+/.test(line));
    const isOrderedList = lines.length > 0 && lines.every((line) => /^\d+[.)]\s+/.test(line));

    if (isUnorderedList) {
      return (
        <ul key={`${index}-${block.slice(0, 18)}`}>
          {lines.map((line) => (
            <li key={line}>{line.replace(/^[-*•]\s+/, "")}</li>
          ))}
        </ul>
      );
    }

    if (isOrderedList) {
      return (
        <ol key={`${index}-${block.slice(0, 18)}`}>
          {lines.map((line) => (
            <li key={line}>{line.replace(/^\d+[.)]\s+/, "")}</li>
          ))}
        </ol>
      );
    }

    const firstOrderedItem = lines.findIndex((line) => /^\d+[.)]\s+/.test(line));
    if (firstOrderedItem > 0 && lines.slice(firstOrderedItem).every((line) => /^\d+[.)]\s+/.test(line))) {
      return (
        <div key={`${index}-${block.slice(0, 18)}`}>
          <p>{lines.slice(0, firstOrderedItem).join(" ")}</p>
          <ol>
            {lines.slice(firstOrderedItem).map((line) => (
              <li key={line}>{line.replace(/^\d+[.)]\s+/, "")}</li>
            ))}
          </ol>
        </div>
      );
    }

    return (
      <p key={`${index}-${block.slice(0, 18)}`}>
        {lines.map((line, lineIndex) => (
          <span key={`${lineIndex}-${line.slice(0, 12)}`}>
            {lineIndex > 0 ? <br /> : null}
            {line}
          </span>
        ))}
      </p>
    );
  });
}

function formatPublishedDate(value?: string | null) {
  if (!value) {
    return "not yet published";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.valueOf())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "America/New_York"
  }).format(parsed);
}

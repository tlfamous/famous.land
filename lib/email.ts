import { getCloudflareContext } from "@opennextjs/cloudflare";

type RuntimeEnv = Record<string, unknown>;

type EmailRecipient = {
  email: string;
  name?: string;
};

type TransactionalEmail = {
  to: EmailRecipient[];
  subject: string;
  htmlContent: string;
  textContent: string;
  tags?: string[];
};

type BrandedEmail = {
  preheader: string;
  eyebrow: string;
  title: string;
  intro: string;
  metric?: {
    label: string;
    value: string;
  };
  cta?: {
    label: string;
    url: string;
  };
  bodyLink?: {
    label: string;
    url: string;
  };
  note?: string;
  supportUrl: string;
};

export type EmailDeliveryResult =
  | {
      ok: true;
      provider: "brevo";
      message_id?: string;
    }
  | {
      ok: false;
      reason:
        | "disabled"
        | "missing_config"
        | "provider_error"
        | "unsupported_provider";
      error?: string;
    };

let cachedCloudflareEnv: RuntimeEnv | null | undefined;

async function getCloudflareEnv(): Promise<RuntimeEnv | undefined> {
  if (cachedCloudflareEnv !== undefined) {
    return cachedCloudflareEnv ?? undefined;
  }

  try {
    const context = await getCloudflareContext({ async: true });
    cachedCloudflareEnv = context.env as RuntimeEnv;
  } catch {
    cachedCloudflareEnv = null;
  }

  return cachedCloudflareEnv ?? undefined;
}

async function getEnv(name: string): Promise<string | undefined> {
  const cloudflareEnv = await getCloudflareEnv();
  const runtimeValue = cloudflareEnv?.[name];

  if (typeof runtimeValue === "string" && runtimeValue.trim()) {
    return runtimeValue.trim();
  }

  const processValue = process.env[name];
  return processValue?.trim() || undefined;
}

async function getSiteUrl(): Promise<string> {
  const configuredUrl =
    (await getEnv("NEXT_PUBLIC_SITE_URL")) ?? (await getEnv("SITE_URL"));
  return (configuredUrl ?? "https://famous.land").replace(/\/+$/, "");
}

export async function sendProgressSavedEmail(input: {
  email: string;
  recovery_code: string;
  marker_count: number;
}): Promise<EmailDeliveryResult> {
  const siteUrl = await getSiteUrl();
  const recoverUrl = recoveryUrl(siteUrl, input.recovery_code);
  const supportUrl = contactUrl(siteUrl);
  const markerCount = input.marker_count;

  return sendTransactionalEmail({
    to: [{ email: input.email }],
    subject: "Your Famous Land Quest progress is saved",
    tags: ["progress-saved"],
    textContent: [
      "Your Famous Land Quest progress is saved.",
      "",
      `Markers saved: ${markerCount}`,
      "",
      "No action is needed now. Keep this email in case you need to restore progress later.",
      "",
      "Recovery link for later:",
      recoverUrl,
      "",
      "Need help? Send a text from the Famous Land contact page:",
      supportUrl
    ].join("\n"),
    htmlContent: emailShell({
      preheader: `Your Famous Land Quest progress is saved with ${markerCount} markers.`,
      eyebrow: "Progress saved",
      title: "Your progress is saved",
      intro:
        "Your Famous Land Quest progress is tucked away. No action is needed now.",
      metric: {
        label: "Markers saved",
        value: String(markerCount)
      },
      bodyLink: {
        label: "Recovery link for later",
        url: recoverUrl
      },
      note: "Keep this email in case you need to restore progress later.",
      supportUrl
    })
  });
}

export async function sendRecoveryEmail(input: {
  email: string;
  recovery_code: string;
}): Promise<EmailDeliveryResult> {
  const siteUrl = await getSiteUrl();
  const recoverUrl = recoveryUrl(siteUrl, input.recovery_code);
  const supportUrl = contactUrl(siteUrl);

  return sendTransactionalEmail({
    to: [{ email: input.email }],
    subject: "Recover your Famous Land Quest progress",
    tags: ["progress-recovery"],
    textContent: [
      "Use this link to restore your Famous Land Quest progress.",
      "",
      "Open it from the phone you use for the quest:",
      recoverUrl,
      "",
      "If this opens on a computer, open the same email on your phone and tap the link there.",
      "",
      "Need help? Send a text from the Famous Land contact page:",
      supportUrl
    ].join("\n"),
    htmlContent: emailShell({
      preheader: "Tap the recovery button from your quest phone to restore progress.",
      eyebrow: "Recovery link",
      title: "Ready to restore your quest?",
      intro:
        "Tap the button below from the phone you use for Famous Land. Your saved marker finds will be restored on that phone.",
      cta: {
        label: "Recover progress",
        url: recoverUrl
      },
      note:
        "If this opens on a computer, open the same email on your phone and tap Recover there.",
      supportUrl
    })
  });
}

export async function isEmailDeliveryConfigured(): Promise<boolean> {
  const provider = (await getEnv("EMAIL_PROVIDER"))?.toLowerCase();

  if (provider === "none" || provider === "off" || provider === "disabled") {
    return false;
  }

  if (provider && provider !== "brevo") {
    return false;
  }

  const [apiKey, fromEmail] = await Promise.all([
    getEnv("BREVO_API_KEY"),
    getEnv("EMAIL_FROM")
  ]);

  return Boolean(apiKey && fromEmail);
}

async function sendTransactionalEmail(
  email: TransactionalEmail
): Promise<EmailDeliveryResult> {
  const provider = (await getEnv("EMAIL_PROVIDER"))?.toLowerCase();

  if (provider === "none" || provider === "off" || provider === "disabled") {
    return { ok: false, reason: "disabled" };
  }

  const apiKey = await getEnv("BREVO_API_KEY");
  const fromEmail = await getEnv("EMAIL_FROM");

  if (provider && provider !== "brevo") {
    return {
      ok: false,
      reason: "unsupported_provider",
      error: `Unsupported EMAIL_PROVIDER "${provider}".`
    };
  }

  if (!apiKey || !fromEmail) {
    return { ok: false, reason: "missing_config" };
  }

  const fromName = (await getEnv("EMAIL_FROM_NAME")) ?? "Famous Land Quest";
  const replyToEmail = await getEnv("EMAIL_REPLY_TO");
  const replyToName = await getEnv("EMAIL_REPLY_TO_NAME");

  const payload = {
    sender: {
      email: fromEmail,
      name: fromName
    },
    to: email.to,
    subject: email.subject,
    htmlContent: email.htmlContent,
    textContent: email.textContent,
    tags: email.tags,
    replyTo: replyToEmail
      ? {
          email: replyToEmail,
          name: replyToName
        }
      : undefined
  };

  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "api-key": apiKey
      },
      body: JSON.stringify(payload)
    });

    const responseText = await response.text();

    if (!response.ok) {
      return {
        ok: false,
        reason: "provider_error",
        error: `Brevo ${response.status}: ${responseText.slice(0, 500)}`
      };
    }

    const responseBody = parseJson(responseText) as { messageId?: string } | null;

    return {
      ok: true,
      provider: "brevo",
      message_id: responseBody?.messageId
    };
  } catch (error) {
    return {
      ok: false,
      reason: "provider_error",
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

function emailShell(input: BrandedEmail): string {
  const safeCtaUrl = input.cta ? escapeHtml(input.cta.url) : "";
  const safeBodyLinkUrl = input.bodyLink ? escapeHtml(input.bodyLink.url) : "";
  const safeSupportUrl = escapeHtml(input.supportUrl);

  return `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="x-apple-disable-message-reformatting">
        <title>${escapeHtml(input.title)}</title>
      </head>
      <body style="margin: 0; padding: 0; background: #f7f3e8;">
        <div style="display: none; max-height: 0; overflow: hidden; opacity: 0; color: transparent;">
          ${escapeHtml(input.preheader)}
        </div>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width: 100%; background: #f7f3e8;">
          <tr>
            <td align="center" style="padding: 20px 12px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width: 100%; max-width: 600px; border-collapse: separate;">
                <tr>
                  <td style="padding: 0 0 10px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="font-family: Arial, Helvetica, sans-serif; color: #11140f; font-size: 13px; font-weight: 800; letter-spacing: 0.12em; text-transform: uppercase;">
                          Famous Land
                        </td>
                        <td align="right" style="font-family: Arial, Helvetica, sans-serif; color: #536b35; font-size: 12px; font-weight: 800;">
                          Famous Land Quest
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="overflow: hidden; border: 1px solid rgba(17, 20, 15, 0.14); border-radius: 18px; background: #fffaf0; box-shadow: 0 18px 48px rgba(17, 20, 15, 0.13);">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="padding: 22px 22px 16px; background: #11140f;">
                          <div style="font-family: Arial, Helvetica, sans-serif; color: #d8e3bd; font-size: 12px; font-weight: 900; letter-spacing: 0.12em; text-transform: uppercase;">
                            ${escapeHtml(input.eyebrow)}
                          </div>
                          <h1 style="margin: 12px 0 0; color: #fffaf0; font-family: Arial, Helvetica, sans-serif; font-size: 32px; line-height: 1.02; letter-spacing: 0; font-weight: 900;">
                            ${escapeHtml(input.title)}
                          </h1>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 22px;">
                          <p style="margin: 0 0 18px; color: #26361c; font-family: Arial, Helvetica, sans-serif; font-size: 18px; line-height: 1.45; font-weight: 700;">
                            ${escapeHtml(input.intro)}
                          </p>
                          ${input.metric ? metricBlock(input.metric) : ""}
                          ${input.cta ? buttonBlock(input.cta.label, safeCtaUrl) : ""}
                          ${input.bodyLink ? bodyLinkBlock(input.bodyLink.label, safeBodyLinkUrl) : ""}
                          ${input.note ? noteBlock(input.note) : ""}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 14px 6px 0; color: rgba(17, 20, 15, 0.58); font-family: Arial, Helvetica, sans-serif; font-size: 12px; line-height: 1.45; text-align: center;">
                    Famous Land Quest<br>
                    Need help? <a href="${safeSupportUrl}" style="color: #2f6f77; font-weight: 800; text-decoration: underline;">Support</a>.
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}

function metricBlock(metric: { label: string; value: string }): string {
  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin: 0 0 18px; background: #f7f3e8; border: 1px solid rgba(17, 20, 15, 0.1); border-radius: 12px;">
      <tr>
        <td style="padding: 14px 16px; font-family: Arial, Helvetica, sans-serif;">
          <div style="color: rgba(17, 20, 15, 0.62); font-size: 12px; font-weight: 900; letter-spacing: 0.1em; text-transform: uppercase;">
            ${escapeHtml(metric.label)}
          </div>
          <div style="margin-top: 4px; color: #11140f; font-size: 34px; line-height: 1; font-weight: 900;">
            ${escapeHtml(metric.value)}
          </div>
        </td>
      </tr>
    </table>
  `;
}

function noteBlock(note: string): string {
  return `
    <p style="margin: 18px 0 0; color: rgba(17, 20, 15, 0.72); font-family: Arial, Helvetica, sans-serif; font-size: 15px; line-height: 1.5; font-weight: 700;">
      ${escapeHtml(note)}
    </p>
  `;
}

function bodyLinkBlock(label: string, safeUrl: string): string {
  return `
    <p style="margin: 0 0 14px; color: rgba(17, 20, 15, 0.64); font-family: Arial, Helvetica, sans-serif; font-size: 13px; line-height: 1.45; word-break: break-word;">
      ${escapeHtml(label)}:<br>
      <a href="${safeUrl}" style="color: #2f6f77; font-weight: 800; text-decoration: underline;">${safeUrl}</a>
    </p>
  `;
}

function buttonBlock(label: string, safeUrl: string): string {
  return `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0;">
      <tr>
        <td style="border-radius: 999px; background: #11140f;">
          <a href="${safeUrl}" style="display: inline-block; padding: 15px 22px; color: #fffaf0; font-family: Arial, Helvetica, sans-serif; font-size: 17px; line-height: 1; font-weight: 900; text-decoration: none; border-radius: 999px;">
            ${escapeHtml(label)}
          </a>
        </td>
      </tr>
    </table>
    <p style="margin: 14px 0 0; color: rgba(17, 20, 15, 0.56); font-family: Arial, Helvetica, sans-serif; font-size: 12px; line-height: 1.45; word-break: break-word;">
      Button not working? Open this link:<br>
      <a href="${safeUrl}" style="color: #2f6f77; text-decoration: underline;">${safeUrl}</a>
    </p>
  `;
}

function recoveryUrl(siteUrl: string, recoveryCode: string): string {
  return `${siteUrl}/recover/${encodeURIComponent(recoveryCode)}`;
}

function contactUrl(siteUrl: string): string {
  return `${siteUrl}/contact`;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function parseJson(value: string): unknown {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

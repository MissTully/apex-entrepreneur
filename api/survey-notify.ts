import type { VercelRequest, VercelResponse } from "@vercel/node";

/**
 * Survey submission alert.
 *
 * A Supabase Database Webhook POSTs here on every INSERT into
 * `survey_responses`, and we email the program owner a short heads-up.
 * Setup steps live in docs/survey-data-access.md (Option B).
 *
 * SECURITY: the endpoint is protected by a shared secret. Supabase sends it
 * in the `x-survey-secret` header; requests without the right value are
 * rejected. The email deliberately contains NO survey answers — just who
 * submitted and when. The full data stays in Supabase (use the export views).
 *
 * Env vars (all set in Vercel, see .env.example):
 *   SURVEY_WEBHOOK_SECRET      required — any long random string
 *   RESEND_API_KEY             required — from resend.com
 *   SURVEY_NOTIFY_TO           required — where to send the alert
 *   SURVEY_NOTIFY_FROM         optional — defaults to Resend's shared sender
 *   SUPABASE_URL               optional — enables participant name/email lookup
 *   SUPABASE_SERVICE_ROLE_KEY  optional — enables participant name/email lookup
 */

interface WebhookPayload {
  type?: string;
  table?: string;
  record?: {
    id?: string;
    user_id?: string;
    survey_type?: string;
    created_at?: string;
  };
}

const SURVEY_LABELS: Record<string, string> = {
  pre_program: "Pre-Program Survey",
  post_program: "Post-Program Survey",
};

/** Best-effort lookup of the participant's name + email via the service role. */
async function lookupParticipant(userId: string): Promise<string | null> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  try {
    const headers = { apikey: key, Authorization: `Bearer ${key}` };
    const [userRes, profileRes] = await Promise.all([
      fetch(`${url}/auth/v1/admin/users/${userId}`, { headers }),
      fetch(`${url}/rest/v1/profiles?id=eq.${userId}&select=full_name`, { headers }),
    ]);
    const user = userRes.ok ? await userRes.json() : null;
    const profiles = profileRes.ok ? await profileRes.json() : [];
    const name = profiles?.[0]?.full_name;
    const email = user?.email;
    if (name && email) return `${name} (${email})`;
    return email ?? name ?? null;
  } catch {
    return null;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const secret = process.env.SURVEY_WEBHOOK_SECRET;
  if (!secret) {
    res.status(500).json({ error: "SURVEY_WEBHOOK_SECRET is not configured" });
    return;
  }
  if (req.headers["x-survey-secret"] !== secret) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.SURVEY_NOTIFY_TO;
  if (!apiKey || !to) {
    res.status(500).json({ error: "RESEND_API_KEY / SURVEY_NOTIFY_TO not configured" });
    return;
  }

  const body: WebhookPayload =
    (typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body) ?? {};
  const record = body.record ?? {};
  if (body.table && body.table !== "survey_responses") {
    res.status(200).json({ skipped: `ignoring table ${body.table}` });
    return;
  }

  const label = SURVEY_LABELS[record.survey_type ?? ""] ?? record.survey_type ?? "Survey";
  const who = record.user_id ? await lookupParticipant(record.user_id) : null;
  const when = record.created_at
    ? new Date(record.created_at).toLocaleString("en-US", { timeZone: "America/New_York" }) + " ET"
    : "just now";

  const text = [
    `A new ${label} response was submitted.`,
    ``,
    `Participant: ${who ?? record.user_id ?? "unknown"}`,
    `Submitted:   ${when}`,
    ``,
    `View it in Supabase → SQL Editor:`,
    `  select * from ${record.survey_type === "pre_program" ? "pre_program_export" : "post_program_export"};`,
  ].join("\n");

  const emailRes = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.SURVEY_NOTIFY_FROM ?? "Apex Surveys <onboarding@resend.dev>",
      to: [to],
      subject: `New ${label} response — Apex`,
      text,
    }),
  });

  if (!emailRes.ok) {
    const detail = await emailRes.text().catch(() => "");
    // Non-2xx so the failure is visible in Supabase's webhook logs.
    res.status(502).json({ error: "Email send failed", detail });
    return;
  }

  res.status(200).json({ ok: true });
}

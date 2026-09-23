// GHL embed configuration — populate per client scaffold.
// Never hardcode IDs in components; always reference these constants.
//
// IDs come from GHL > Sites > Forms (form embeds) and GHL > Calendars (booking widgets).
// Leave the YOUR_* placeholders in the shared template base — a value is only treated
// as configured when it is non-empty and does not start with "YOUR_".

export const GHL_CONFIG = {
  forms: {
    contact: 'YOUR_CONTACT_FORM_ID',
    leadCapture: 'YOUR_LEAD_CAPTURE_FORM_ID',
  },

  calendars: {
    discovery: 'YOUR_DISCOVERY_CALL_CALENDAR_ID',
  },

  // Inbound webhook targets for native-form submission (alternative to embeds:
  // keeps the designed form UI and posts to GHL instead of Netlify).
  // GHL: Workflows > Create Workflow > Inbound Webhook trigger > copy the POST URL.
  webhooks: {
    contact: 'YOUR_CONTACT_WEBHOOK_URL',
  },
} as const;

export type GHLFormId = keyof typeof GHL_CONFIG.forms;
export type GHLCalendarId = keyof typeof GHL_CONFIG.calendars;
export type GHLWebhookId = keyof typeof GHL_CONFIG.webhooks;

/**
 * Placeholder-safe check: the template base ships YOUR_* sentinels that must
 * never render as real embeds (they would 404 inside the iframe).
 */
export function isGhlConfigured(id: string | undefined): id is string {
  if (!id) return false;
  const value = id.trim();
  return value.length > 0 && !value.startsWith('YOUR_');
}

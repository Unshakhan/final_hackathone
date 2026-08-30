import type { TriageData } from "../models/Ticket.js";
import { validateCategory, validatePriority, validateSummary } from "../utils/ticketValidation.js";

interface ProviderResponse {
  choices?: Array<{ message?: { content?: string } }>;
}

interface TriageSuggestion extends TriageData {
  source: "ai" | "fallback";
}

const deterministicFallback = (subject: string, description: string): TriageData => {
  const text = `${subject} ${description}`.toLowerCase();
  let category: TriageData["category"] = "General";

  if (/refund|money back|chargeback|return/.test(text)) category = "Refund";
  else if (/bill|billing|invoice|charge|payment|price/.test(text)) category = "Billing";
  else if (/login|password|account|profile|sign in/.test(text)) category = "Account";
  else if (/error|bug|broken|crash|technical|not working|failed/.test(text)) category = "Technical";

  const priority: TriageData["priority"] = /urgent|emergency|critical|security|fraud|down|blocked/.test(text)
    ? "High"
    : /soon|important|repeated|again/.test(text)
      ? "Medium"
      : "Low";

  const compactDescription = description.replace(/\s+/g, " ").trim();
  const summary = `${subject.trim()}: ${compactDescription}`.slice(0, 500);
  return { category, priority, summary };
};

const validateTriage = (value: unknown): TriageData | null => {
  if (typeof value !== "object" || value === null) return null;
  const result = value as Record<string, unknown>;
  try {
    const category = validateCategory(result.category);
    if (!category) return null;
    return {
      category,
      priority: validatePriority(result.priority),
      summary: validateSummary(result.summary),
    };
  } catch {
    return null;
  }
};

const requestProvider = async (subject: string, description: string): Promise<TriageData | null> => {
  const url = process.env.AI_API_URL;
  const apiKey = process.env.AI_API_KEY;
  if (!url || !apiKey) return null;

  const response = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: process.env.AI_MODEL || "gpt-4o-mini",
      temperature: 0,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: "Return one JSON object only with category (Billing, Technical, Account, Refund, General), priority (Low, Medium, High), and a short factual summary. Duplicate charges or duplicate payments are Billing and High priority, even when the customer requests a refund. Do not include markdown or extra keys.",
        },
        { role: "user", content: `Subject: ${subject}\nDescription: ${description}` },
      ],
    }),
    signal: AbortSignal.timeout(8000),
  });

  if (!response.ok) return null;
  const data = (await response.json()) as ProviderResponse;
  const content = data.choices?.[0]?.message?.content;
  if (!content) return null;
  return validateTriage(JSON.parse(content) as unknown);
};

export const getTriageSuggestion = async (subject: string, description: string): Promise<TriageSuggestion> => {
  try {
    const providerResult = await requestProvider(subject, description);
    if (providerResult) return { ...providerResult, source: "ai" };
  } catch (error) {
    console.warn("AI triage unavailable; using deterministic fallback.", error instanceof Error ? error.message : error);
  }

  const fallback = deterministicFallback(subject, description);
  const validatedFallback = validateTriage(fallback) ?? { category: "General", priority: "Low", summary: subject.slice(0, 500) };
  return { ...validatedFallback, source: "fallback" };
};

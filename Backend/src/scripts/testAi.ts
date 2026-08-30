import "dotenv/config";

const key = process.env.AI_API_KEY;
const models = ["gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-3.6-flash"];

const testNative = async (model: string): Promise<void> => {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key ?? "")}`;
  const started = Date.now();
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: "Reply with OK only" }] }] }),
      signal: AbortSignal.timeout(20000),
    });
    const text = await response.text();
    console.log(`native ${model}: ${response.status} ${Date.now() - started}ms ${text.slice(0, 200)}`);
  } catch (error) {
    console.log(`native ${model}: ERR ${Date.now() - started}ms ${error instanceof Error ? error.message : error}`);
  }
};

const testOpenAi = async (model: string): Promise<void> => {
  const started = Date.now();
  try {
    const response = await fetch(process.env.AI_API_URL ?? "", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: "Reply with OK only" }],
      }),
      signal: AbortSignal.timeout(20000),
    });
    const text = await response.text();
    console.log(`openai ${model}: ${response.status} ${Date.now() - started}ms ${text.slice(0, 200)}`);
  } catch (error) {
    console.log(`openai ${model}: ERR ${Date.now() - started}ms ${error instanceof Error ? error.message : error}`);
  }
};

const main = async (): Promise<void> => {
  console.log("KEY_LEN", key?.length ?? 0);
  for (const model of models) {
    await testNative(model);
    await testOpenAi(model);
  }
};

void main();

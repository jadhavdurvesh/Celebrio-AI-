const allowedTypes = new Set(["Wedding", "Birthday", "Community event", "Other"]);
const clean = (v, max = 160) => typeof v === "string" ? v.trim().slice(0, max) : "";

export default async function handler(req, res) {
  if (req.method !== "POST") { res.setHeader("Allow", "POST"); return res.status(405).json({ error: "Method not allowed." }); }
  if (!process.env.GEMINI_API_KEY) return res.status(500).json({ error: "GEMINI_API_KEY is not configured on the server." });

  const b = req.body || {};
  const event = {
    eventType: clean(b.eventType, 40), name: clean(b.name, 100), location: clean(b.location, 120),
    date: clean(b.date, 20) || "Not specified", theme: clean(b.theme, 180) || "Suggest a suitable theme",
    guests: Number(b.guests), budget: Number(b.budget), currency: clean(b.currency, 8) || "INR"
  };
  if (!allowedTypes.has(event.eventType) || !event.name) return res.status(400).json({ error: "Provide a valid event type and name." });
  if (!Number.isInteger(event.guests) || event.guests < 1 || event.guests > 100000) return res.status(400).json({ error: "Guest count must be between 1 and 100,000." });
  if (!Number.isFinite(event.budget) || event.budget <= 0 || event.budget > 1e9) return res.status(400).json({ error: "Enter a valid positive budget." });

  const prompt = `Return only valid JSON with this schema:
{"title":"string","summary":"string","theme":"string","budgetBreakdown":[{"category":"string","estimatedCost":0,"notes":"string"}],"timeline":[{"time":"string","activity":"string","notes":"string"}],"tasks":[{"title":"string","description":"string","dueInDays":14,"priority":"High"}],"vendorIdeas":[{"category":"string","suggestion":"string"}],"tips":["string"]}
Create 5-8 budget categories, 5-8 timeline items, 8-12 tasks, 3-5 vendor ideas and 3-5 tips. Costs must be numeric, in ${event.currency}, and total no more than the budget. dueInDays is relative to the event. Priority must be High, Medium or Low. Treat prices as estimates; never claim vendor availability was checked. Be realistic and specific.
Event: ${JSON.stringify(event)}`;
  try {
    const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(process.env.GEMINI_API_KEY)}`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: prompt }] }], generationConfig: { responseMimeType: "application/json", temperature: 0.65 } })
    });
    const payload = await response.json();
    if (!response.ok) { console.error("Gemini API error", payload?.error?.message); return res.status(502).json({ error: "Gemini could not generate a plan. Check your API key and model." }); }
    const raw = payload?.candidates?.[0]?.content?.parts?.map(p => p.text || "").join("");
    if (!raw) return res.status(502).json({ error: "Gemini returned an empty response." });
    const plan = JSON.parse(raw);
    for (const key of ["budgetBreakdown", "timeline", "tasks", "vendorIdeas", "tips"]) if (!Array.isArray(plan[key])) throw new Error("Incomplete plan");
    plan.budgetBreakdown = plan.budgetBreakdown.slice(0, 12).map(x => ({ category: clean(x.category, 80), estimatedCost: Math.max(0, Number(x.estimatedCost) || 0), notes: clean(x.notes, 240) }));
    plan.tasks = plan.tasks.slice(0, 20).map(x => ({ title: clean(x.title, 140), description: clean(x.description, 300), dueInDays: Math.max(0, Math.min(365, Number(x.dueInDays) || 0)), priority: ["High","Medium","Low"].includes(x.priority) ? x.priority : "Medium", done: false }));
    return res.status(200).json({ plan });
  } catch (e) { console.error("Plan generation failed", e); return res.status(502).json({ error: "The AI response was invalid. Please try again." }); }
}
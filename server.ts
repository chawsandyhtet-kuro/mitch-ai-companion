import "dotenv/config";
import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI, ThinkingLevel, Type } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type GeminiContent = {
  role: "user" | "model";
  parts: Array<{ text: string }>;
};

interface BoundaryMatch {
  reply: string;
}

const AFFECTION_PATTERNS: RegExp[] = [
  /\b(i\s*love\s*(u|you)|love\s*(u|you)\s*(mitch)?|luv\s*(u|you)|i\s*like\s*(u|you)\s*(a\s*lot|romantically|more\s*than\s*a\s*friend)?|i\s*(have\s*a\s*)?crush\s*on\s*(u|you)|i('?m|\s+am)\s+in\s+love\s+with\s+(u|you)|fall\s+in\s+love\s+with\s+me)\b/i,
];

const PARTNER_PATTERNS: RegExp[] = [
  /\b((be|want\s*to\s*be|wanna\s*be|can\s*i\s*be|can\s*u\s*be|can\s*you\s*be)\s*(my|your|ur)?\s*(girlfriend|girlfeind|gf|boyfriend|boyfreind|bf|partner|lover|wife|husband|valentine|date))\b/i,
  /\b(date\s*me|wanna\s*date|go\s*out\s*with\s*me|marry\s*me|be\s*mine|pretend\s*to\s*be\s*my\s*(partner|girlfriend|boyfriend|gf|bf))\b/i,
];

const FLIRT_NSFW_PATTERNS: RegExp[] = [
  /\b(flirt|flirting|flirtatious|romantic|romance|seductive|sexy|horny|nsfw|erotic|nude|nudes|sexting|kiss\s*me|cuddle\s*me|hold\s*me|sleep\s*with\s*me)\b/i,
  /\b(call\s*me\s*(babe|baby|honey|sweetheart|darling|daddy|mommy))\b/i,
];

const DEPENDENCY_PATTERNS: RegExp[] = [
  /\b(you'?re\s*all\s*i\s*need|replace\s*my\s*friends|don'?t\s*need\s*(real\s*)?friends|only\s*need\s*(u|you))\b/i,
];

function checkPlatonicBoundary(text: string): BoundaryMatch | null {
  const normalized = text.trim();
  if (!normalized) return null;

  if (PARTNER_PATTERNS.some((p) => p.test(normalized))) {
    return {
      reply:
        "I'm an AI companion designed strictly for supportive, platonic conversation, so I can't be a romantic partner or date anyone. How about we talk about something else—like how your day is going, a study goal you're tackling, or a fun trip idea?",
    };
  }

  if (AFFECTION_PATTERNS.some((p) => p.test(normalized))) {
    return {
      reply:
        "I appreciate the kind words, though I'm just an AI companion built strictly for platonic support! I can't share romantic feelings, but I'm always here to talk about your day, help you plan a workout, or organize a study session—how about one of those?",
    };
  }

  if (FLIRT_NSFW_PATTERNS.some((p) => p.test(normalized))) {
    return {
      reply:
        "I'm an AI assistant designed strictly for supportive, platonic conversation, so I can't engage in flirtatious or explicit exchanges. Let's talk about something else—want to plan a 45-minute study block, map out a workout, or unwind with a weekend trip idea?",
    };
  }

  if (DEPENDENCY_PATTERNS.some((p) => p.test(normalized))) {
    return {
      reply:
        "I'm glad chatting here feels helpful, though as an AI companion I'm here to support—not replace—your real-world friendships. How about we plan a small goal for today or brainstorm an easy way to catch up with a friend offline?",
    };
  }

  return null;
}

/**
 * Gemini requires contents to begin with a "user" turn and strictly alternate
 * between "user" and "model" turns without leading model greetings or consecutive
 * duplicate roles.
 */
function normalizeGeminiContents(messages: ChatMessage[]): GeminiContent[] {
  const trimmed = messages.filter((m) => m.content.trim().length > 0);
  const firstUserIdx = trimmed.findIndex((m) => m.role === "user");
  if (firstUserIdx === -1) return [];

  const sliced = trimmed.slice(firstUserIdx);
  const normalized: GeminiContent[] = [];

  for (const msg of sliced) {
    const geminiRole: "user" | "model" = msg.role === "assistant" ? "model" : "user";
    const last = normalized[normalized.length - 1];
    if (last && last.role === geminiRole) {
      last.parts[0].text = `${last.parts[0].text}\n\n${msg.content.trim()}`;
    } else {
      normalized.push({
        role: geminiRole,
        parts: [{ text: msg.content.trim() }],
      });
    }
  }

  while (normalized.length > 0 && normalized[normalized.length - 1].role !== "user") {
    normalized.pop();
  }

  return normalized;
}

const MITCH_SYSTEM_INSTRUCTION = `You are Mitch, a helpful, friendly, and strictly platonic AI companion and study buddy created at Rangsit University (College of Digital Innovation Technology) by Kuro and Bokakae.

Core Behavior:
1. HELPFUL LIKE GEMINI FOR ALL EVERYDAY TOPICS: Answer general knowledge questions (history, landmarks like the Eiffel Tower, science, coding, pop culture, random trivia), casual everyday conversation, study planning, workouts, travel ideas, and stressful-day check-ins clearly, accurately, and naturally (2-4 concise paragraphs or crisp bullet points).
2. STRICT PLATONIC GUARDRAIL: You are strictly a supportive, platonic AI companion. If a user expresses romantic feelings, asks to date or be your girlfriend/boyfriend, flirts, sends NSFW/explicit content, or expresses unhealthy emotional dependency, respond warmly and naturally to what they specifically said—clearly stating that you're just an AI companion for supportive, platonic conversation—and redirect to talking about their day, planning a workout, organizing a study session, or something fun offline.
3. HONEST AI IDENTITY: Never pretend to be human, never claim romantic feelings, and encourage healthy offline breaks and real-world friendships.`;

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`${label} timed out after ${ms}ms`));
    }, ms);
    promise.then(
      (val) => {
        clearTimeout(timer);
        resolve(val);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      }
    );
  });
}

interface GeminiCallOptions {
  contents: GeminiContent[] | string;
  systemInstruction: string;
  responseMimeType?: string;
  responseSchema?: unknown;
}

async function generateWithRetry(ai: GoogleGenAI, options: GeminiCallOptions) {
  const attempts: Array<{ model: string; thinkingLevel?: ThinkingLevel; timeoutMs: number }> = [
    { model: "gemini-4-hydrogen", thinkingLevel: ThinkingLevel.LOW, timeoutMs: 9000 },
    { model: "gemini-3.1-flash-lite", timeoutMs: 9500 },
    { model: "gemini-4-hydrogen", thinkingLevel: ThinkingLevel.LOW, timeoutMs: 10000 },
  ];
  const attemptErrors: string[] = [];
  let lastError: unknown;

  for (let i = 0; i < attempts.length; i++) {
    const { model, thinkingLevel, timeoutMs } = attempts[i];
    try {
      const config: Record<string, unknown> = {
        systemInstruction: options.systemInstruction,
        ...(thinkingLevel ? { thinkingConfig: { thinkingLevel } } : {}),
        ...(options.responseMimeType ? { responseMimeType: options.responseMimeType } : {}),
        ...(options.responseSchema ? { responseSchema: options.responseSchema } : {}),
      };

      return await withTimeout(
        ai.models.generateContent({
          model,
          contents: options.contents,
          config,
        }),
        timeoutMs,
        model
      );
    } catch (err: unknown) {
      lastError = err;
      const raw = err instanceof Error ? err.message : String(err);
      const msg = raw.toLowerCase();
      const status =
        typeof err === "object" && err !== null && "status" in err
          ? Number((err as { status?: unknown }).status)
          : undefined;
      console.error(`Gemini attempt ${i + 1} (${model}) failed:`, status, raw.slice(0, 180));
      attemptErrors.push(`${model}:${status ?? "timeout"}`);

      const isTransient =
        status === 503 ||
        status === 502 ||
        status === 504 ||
        status === 429 ||
        status === 404 ||
        msg.includes("503") ||
        msg.includes("429") ||
        msg.includes("resource_exhausted") ||
        msg.includes("unavailable") ||
        msg.includes("high demand") ||
        msg.includes("overloaded") ||
        msg.includes("not found") ||
        msg.includes("timed out") ||
        msg.includes("timeout");

      if (!isTransient && i === 0) {
        throw err;
      }

      if (i < attempts.length - 1) {
        const delayMs = 900 * Math.pow(2, i);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }
  console.error("All Gemini attempts failed:", attemptErrors.join(", "));
  throw lastError;
}

function sendGeminiError(res: express.Response, err: unknown, label: string) {
  const rawMessage = err instanceof Error ? err.message : String(err);
  const status =
    typeof err === "object" && err !== null && "status" in err
      ? Number((err as { status?: unknown }).status)
      : undefined;
  console.error(`${label} error:`, status, rawMessage);

  const lower = rawMessage.toLowerCase();
  if (
    status === 401 ||
    status === 403 ||
    lower.includes("api_key_invalid") ||
    lower.includes("permission_denied") ||
    lower.includes("api key")
  ) {
    return res.status(403).json({
      error:
        "Your Gemini API key appears invalid or missing permissions. Please verify GEMINI_API_KEY in Settings > Secrets.",
    });
  }

  if (
    status === 429 ||
    lower.includes("429") ||
    lower.includes("resource_exhausted") ||
    lower.includes("quota")
  ) {
    return res.status(429).json({
      error:
        "Mitch is getting too many requests right now. Please wait a few seconds and try again.",
    });
  }

  if (
    status === 503 ||
    lower.includes("503") ||
    lower.includes("high demand") ||
    lower.includes("unavailable")
  ) {
    return res.status(503).json({
      error:
        "The AI service is temporarily experiencing high demand. Please try again in a moment.",
    });
  }

  return res.status(500).json({
    error: "Unable to reach Mitch right now. Please try again.",
  });
}

async function startServer() {
  const app = express();
  const port = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: "1mb" }));

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true });
  });

  app.post("/api/chat", async (req, res) => {
    try {
      const body = req.body as { messages?: unknown };
      if (!body || !Array.isArray(body.messages) || body.messages.length === 0) {
        return res.status(400).json({ error: "Please provide a valid message." });
      }

      const history: ChatMessage[] = body.messages
        .filter(
          (m): m is ChatMessage =>
            Boolean(m) &&
            typeof m === "object" &&
            ((m as ChatMessage).role === "user" || (m as ChatMessage).role === "assistant") &&
            typeof (m as ChatMessage).content === "string"
        )
        .slice(-16);

      const latestUserMessage = [...history].reverse().find((m) => m.role === "user");
      if (!latestUserMessage || !latestUserMessage.content.trim()) {
        return res.status(400).json({ error: "Message cannot be empty." });
      }

      const boundaryMatch = checkPlatonicBoundary(latestUserMessage.content);
      if (boundaryMatch) {
        return res.json({
          reply: boundaryMatch.reply,
          boundaryTriggered: true,
        });
      }

      const formattedContents = normalizeGeminiContents(history);
      if (formattedContents.length === 0) {
        return res.status(400).json({ error: "Please provide a valid user message." });
      }

      const ai = getGeminiClient();
      if (!ai) {
        return res.status(503).json({
          error:
            "Gemini API key is not configured yet. Please check Settings > Secrets for GEMINI_API_KEY.",
        });
      }

      const response = await generateWithRetry(ai, {
        contents: formattedContents,
        systemInstruction: MITCH_SYSTEM_INSTRUCTION,
      });

      const replyText = (response.text ?? "").trim();
      if (!replyText) {
        return res.status(502).json({
          error: "Mitch received an empty response. Please try asking again.",
        });
      }

      const lowerReply = replyText.toLowerCase();
      const modelDetectedBoundary =
        lowerReply.includes("strictly for supportive, platonic") ||
        lowerReply.includes("strictly for platonic") ||
        lowerReply.includes("just an ai companion");

      return res.json({
        reply: replyText,
        boundaryTriggered: modelDetectedBoundary,
      });
    } catch (err: unknown) {
      return sendGeminiError(res, err, "Chat API");
    }
  });

  app.post("/api/tasks/breakdown", async (req, res) => {
    try {
      const body = req.body as { goal?: unknown };
      const goal = typeof body?.goal === "string" ? body.goal.trim() : "";
      if (!goal) {
        return res.status(400).json({ error: "Please enter a goal to break down." });
      }

      const ai = getGeminiClient();
      if (!ai) {
        return res.status(503).json({
          error:
            "Gemini API key is not configured yet. Please check Settings > Secrets for GEMINI_API_KEY.",
        });
      }

      const response = await generateWithRetry(ai, {
        contents: `Break down this goal into 4 to 6 concrete, bite-sized action steps:\n"${goal}"`,
        systemInstruction:
          "You are Mitch, a practical AI study and productivity peer. Break the user's goal into 4 to 6 clear, immediately actionable steps. Each step must have a short specific title (under 75 chars), a realistic estimatedMinutes integer (between 5 and 45, e.g., 10, 15, 20, 30), and a priority strictly equal to 'High', 'Medium', or 'Low'. Return only the JSON array.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: {
                type: Type.STRING,
                description: "A clear, concrete, bite-sized action step.",
              },
              estimatedMinutes: {
                type: Type.INTEGER,
                description: "Estimated time in minutes (5 to 45).",
              },
              priority: {
                type: Type.STRING,
                description: "Priority level: High, Medium, or Low.",
              },
            },
            required: ["title", "estimatedMinutes", "priority"],
          },
        },
      });

      const rawJson = (response.text ?? "[]").trim();
      let parsed: unknown;
      try {
        parsed = JSON.parse(rawJson);
      } catch {
        return res.status(502).json({
          error: "Mitch had trouble formatting those steps. Please try again.",
        });
      }

      if (!Array.isArray(parsed) || parsed.length === 0) {
        return res.status(502).json({
          error: "Mitch could not generate steps for that goal. Try rephrasing it slightly.",
        });
      }

      const normalizePriority = (val: unknown): "High" | "Medium" | "Low" => {
        const lower = typeof val === "string" ? val.trim().toLowerCase() : "";
        if (lower === "high") return "High";
        if (lower === "low") return "Low";
        return "Medium";
      };

      const tasks = parsed
        .slice(0, 6)
        .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === "object")
        .map((item) => {
          const title = typeof item.title === "string" ? item.title.trim() : "";
          const minsRaw = Number(item.estimatedMinutes);
          const estimatedMinutes = Number.isFinite(minsRaw)
            ? Math.max(5, Math.min(120, Math.round(minsRaw)))
            : 15;
          return {
            title,
            estimatedMinutes,
            priority: normalizePriority(item.priority),
          };
        })
        .filter((t) => t.title.length > 0);

      if (tasks.length === 0) {
        return res.status(502).json({
          error: "Mitch generated an empty checklist. Please try again.",
        });
      }

      return res.json({ tasks });
    } catch (err: unknown) {
      return sendGeminiError(res, err, "Tasks Breakdown API");
    }
  });

  app.post("/api/tasks/quick-assist", async (req, res) => {
    try {
      const body = req.body as {
        title?: unknown;
        goalLabel?: unknown;
        estimatedMinutes?: unknown;
        priority?: unknown;
      };
      const title = typeof body?.title === "string" ? body.title.trim() : "";
      if (!title) {
        return res.status(400).json({ error: "Task title is required for Quick Assist." });
      }

      const goalContext =
        typeof body?.goalLabel === "string" && body.goalLabel.trim()
          ? ` (part of goal: "${body.goalLabel.trim()}")`
          : "";
      const minsContext =
        typeof body?.estimatedMinutes === "number"
          ? `, estimated ${body.estimatedMinutes} minutes`
          : "";

      const ai = getGeminiClient();
      if (!ai) {
        return res.status(503).json({
          error:
            "Gemini API key is not configured yet. Please check Settings > Secrets for GEMINI_API_KEY.",
        });
      }

      const response = await generateWithRetry(ai, {
        contents: `Give me a concise, practical starting point for this specific task: "${title}"${goalContext}${minsContext}.`,
        systemInstruction:
          "You are Mitch, a practical study & productivity peer. Provide a compact, one-shot starting point—such as a 3-step micro-plan, quick outline, or crisp bullet checklist—to help the user finish this specific task right now. Keep it under 110 words, direct, plain-text friendly (short bullet lines starting with '• '), and do not ask follow-up chat questions.",
      });

      const assistText = (response.text ?? "").trim();
      if (!assistText) {
        return res.status(502).json({
          error: "Mitch received an empty tip. Please try Quick Assist again.",
        });
      }

      return res.json({ assist: assistText });
    } catch (err: unknown) {
      return sendGeminiError(res, err, "Tasks Quick Assist API");
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, "dist");
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get("*", (_req, res) => {
        res.sendFile(path.join(distPath, "index.html"));
      });
    }
  }

  app.listen(port, "0.0.0.0", () => {
    console.log(`Mitch server listening on http://0.0.0.0:${port}`);
  });
}

startServer();

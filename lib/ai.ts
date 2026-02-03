const provider = process.env.AI_PROVIDER || "openai";

async function getOpenAIClient() {
  const { OpenAI } = await import("openai");
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("OPENAI_API_KEY が設定されていません");
  return new OpenAI({ apiKey: key });
}

async function getGeminiModel(systemInstruction: string) {
  const { GoogleGenerativeAI } = await import("@google/generative-ai");
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY が設定されていません");
  const genAI = new GoogleGenerativeAI(key);
  return genAI.getGenerativeModel({
    model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
    systemInstruction,
  });
}

export async function generateSystemPromptFromText(sampleText: string): Promise<string> {
  const system =
    "あなたは、与えられた文章の「文体・考え方・話し方」を再現するための「システムプロンプト」を1つ作成するアシスタントです。出力はそのシステムプロンプトの本文のみを返してください。説明や前置きは不要です。";
  const user = `以下の文章を分析し、この人の文体・考え方・話し方を再現するためにAIに渡すシステムプロンプトを1つ作成してください。\n\n---\n\n${sampleText.slice(0, 15000)}`;

  if (provider === "gemini") {
    const model = await getGeminiModel(system);
    const result = await model.generateContent(user);
    const response = result.response;
    return response.text()?.trim() ?? "";
  }

  if (provider === "anthropic") {
    const { Anthropic } = await import("@anthropic-ai/sdk");
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const msg = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: system,
      messages: [{ role: "user", content: user }],
    });
    const text = msg.content.find((c) => c.type === "text");
    return text && "text" in text ? text.text : "";
  }

  const openai = await getOpenAIClient();
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    max_tokens: 1024,
  });
  return completion.choices[0]?.message?.content?.trim() ?? "";
}

function parseTitleAndBody(text: string): { title: string; body: string } {
  const trimmed = text.trim();
  const firstBreak = trimmed.indexOf("\n");
  if (firstBreak <= 0) {
    return { title: trimmed || "無題", body: "" };
  }
  const title = trimmed.slice(0, firstBreak).replace(/^タイトル[：:]\s*/, "").trim() || "無題";
  const body = trimmed.slice(firstBreak).replace(/^\s*\n*本文[：:]?\s*\n*/, "").trim();
  return { title, body };
}

export async function generateBlogPost(
  systemPrompt: string,
  rules: string,
  seedWords: string
): Promise<{ title: string; body: string }> {
  const system = [
    systemPrompt,
    rules ? `追加ルール:\n${rules}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");

  const user = `以下のアイデア・単語を元に、上記の文体・考え方でブログ記事を書いてください。
出力は必ず次の形式にしてください（説明や前置きは不要です）:
1行目: 記事のタイトル（1行だけ）
2行目: 空行
3行目以降: 本文（見出しは含めず、本文のみ）

アイデア・単語:
${seedWords}`;

  let raw = "";
  if (provider === "gemini") {
    const model = await getGeminiModel(system);
    const result = await model.generateContent(user);
    const response = result.response;
    raw = response.text()?.trim() ?? "";
  } else if (provider === "anthropic") {
    const { Anthropic } = await import("@anthropic-ai/sdk");
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const msg = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      system: system,
      messages: [{ role: "user", content: user }],
    });
    const text = msg.content.find((c) => c.type === "text");
    raw = text && "text" in text ? text.text : "";
  } else {
    const openai = await getOpenAIClient();
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      max_tokens: 4096,
    });
    raw = completion.choices[0]?.message?.content?.trim() ?? "";
  }
  return parseTitleAndBody(raw);
}

const refineSystem =
  "あなたはブログ記事の編集アシスタントです。ユーザーから「現在のタイトルと本文」と「修正指示」が渡されます。指示に従ってのみ修正し、指示にない部分は変えずに返してください。出力は次の形式だけにしてください（説明や前置きは不要）: 1行目がタイトル、2行目は空行、3行目以降が本文。";

export async function refineArticle(
  title: string,
  body: string,
  instruction: string
): Promise<{ title: string; body: string }> {
  const user = `【現在のタイトル】\n${title}\n\n【現在の本文】\n${body}\n\n【修正指示】\n${instruction}\n\n上記の指示に従って修正したタイトルと本文を、1行目=タイトル・2行目=空行・3行目以降=本文の形式で出力してください。`;

  let raw = "";
  if (provider === "gemini") {
    const model = await getGeminiModel(refineSystem);
    const result = await model.generateContent(user);
    const response = result.response;
    raw = response.text()?.trim() ?? "";
  } else if (provider === "anthropic") {
    const { Anthropic } = await import("@anthropic-ai/sdk");
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const msg = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      system: refineSystem,
      messages: [{ role: "user", content: user }],
    });
    const text = msg.content.find((c) => c.type === "text");
    raw = text && "text" in text ? text.text : "";
  } else {
    const openai = await getOpenAIClient();
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: refineSystem },
        { role: "user", content: user },
      ],
      max_tokens: 4096,
    });
    raw = completion.choices[0]?.message?.content?.trim() ?? "";
  }
  return parseTitleAndBody(raw);
}

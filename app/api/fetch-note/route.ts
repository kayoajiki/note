import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const urls = Array.isArray(body.urls) ? body.urls : body.url ? [body.url] : [];
    if (urls.length === 0) {
      return NextResponse.json(
        { error: "url または urls を指定してください" },
        { status: 400 }
      );
    }

    const texts: string[] = [];
    for (const url of urls) {
      if (!String(url).includes("note.com")) {
        texts.push(`[スキップ: note.com のURLではありません] ${url}`);
        continue;
      }
      const res = await fetch(url as string, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (compatible; CloneBlog/1.0)",
        },
      });
      if (!res.ok) {
        texts.push(`[取得失敗: ${res.status}] ${url}`);
        continue;
      }
      const html = await res.text();
      const $ = cheerio.load(html);
      const article =
        $("article").first().text() ||
        $("[data-testid='note-body']").text() ||
        $(".note-body").text() ||
        $(".note-content").text() ||
        $("main").first().text() ||
        $(".postContent").text();
      const text = article?.replace(/\s+/g, " ").trim() || $("body").text().replace(/\s+/g, " ").trim();
      texts.push(text || `[本文を取得できませんでした] ${url}`);
    }

    return NextResponse.json({ text: texts.join("\n\n---\n\n") });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "取得に失敗しました" },
      { status: 500 }
    );
  }
}

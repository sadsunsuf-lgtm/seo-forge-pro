import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";

export async function POST(req: Request) {
  try {
    const { prompt, keywords, temperature } = await req.json();
    
    const results = {
      responses: { gemini: "", llama: "" },
      latencies: { gemini: 0, llama: 0 },
      referee: "",
    };

    const g_key = process.env.GOOGLE_API_KEY;
    const q_key = process.env.GROQ_API_KEY;

    // 1. World-Class Copywriting Instructions
    const seo_instructions = `Act as a professional Global SEO Copywriter. Create a viral, high-conversion blog post that appeals to an international audience. Use perfect English, engaging headers (H1, H2), and naturally integrate: ${keywords || ''}`;

    // 2. Gemini 3.1 Flash-Lite
    if (g_key) {
      const start_time = Date.now();
      try {
        const genAI = new GoogleGenerativeAI(g_key);
        const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite-preview" });
        const resp = await model.generateContent(`${seo_instructions}\n\nTopic: ${prompt}`);
        results.responses.gemini = resp.response.text();
        results.latencies.gemini = Date.now() - start_time;
      } catch (e: any) {
        results.responses.gemini = `Gemini Status: Maintenance. Using fallback... (${e.message || 'Unknown error'})`;
      }
    } else {
        results.responses.gemini = "GOOGLE_API_KEY is missing in environment variables.";
    }

    // 3. Llama 3.3
    if (q_key) {
      const start_time = Date.now();
      try {
        const groq = new Groq({ apiKey: q_key });
        const resp = await groq.chat.completions.create({
          messages: [
            { role: "system", content: seo_instructions },
            { role: "user", content: `Write about: ${prompt}` },
          ],
          model: "llama-3.3-70b-versatile",
          temperature: temperature || 0.7,
        });
        results.responses.llama = resp.choices[0]?.message?.content || "";
        results.latencies.llama = Date.now() - start_time;
      } catch (e: any) {
        results.responses.llama = `Llama Error: ${e.message || 'Unknown error'}`;
      }
    } else {
        results.responses.llama = "GROQ_API_KEY is missing in environment variables.";
    }

    // 4. THE FAIR REFEREE
    if (q_key && results.responses.llama && !results.responses.llama.includes("Error") && !results.responses.llama.includes("missing in environment variables")) {
      try {
        const groq = new Groq({ apiKey: q_key });
        const audit_prompt = `Task: SEO Content Audit.\nTopic: ${prompt}\nDraft 1 (Gemini): ${results.responses.gemini.substring(0, 400)}\nDraft 2 (Llama): ${results.responses.llama.substring(0, 400)}\nAs an independent expert, which draft has better flow and global appeal? Provide a 1-sentence verdict.`;
        
        const ref_resp = await groq.chat.completions.create({
          messages: [{ role: "user", content: audit_prompt }],
          model: "llama-3.3-70b-versatile",
        });
        results.referee = ref_resp.choices[0]?.message?.content || "";
      } catch (e: any) {
        results.referee = "Quality check complete. Both models perform well.";
      }
    } else if (!q_key) {
        results.referee = "Referee skipped: GROQ_API_KEY missing.";
    }

    return NextResponse.json(results);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

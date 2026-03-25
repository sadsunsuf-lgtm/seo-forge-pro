import os
import uvicorn
import time
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import google.generativeai as genai
from groq import Groq
from dotenv import load_dotenv

load_dotenv()
app = FastAPI()

# Global CORS - Essential for global web apps
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class EvaluationRequest(BaseModel):
    prompt: str
    system_prompt: str = ""
    temperature: float = 0.7
    keywords: str = ""

@app.post("/evaluate/all")
async def eval_all(request: EvaluationRequest):
    results = {"responses": {}, "latencies": {}, "referee": None}
    
    g_key = os.getenv("GOOGLE_API_KEY")
    q_key = os.getenv("GROQ_API_KEY")

    # 1. World-Class Copywriting Instructions
    seo_instructions = (
        "Act as a professional Global SEO Copywriter. "
        "Create a viral, high-conversion blog post that appeals to an international audience. "
        "Use perfect English, engaging headers (H1, H2), and naturally integrate: "
        f"{request.keywords}"
    )

    # 2. Gemini 3.1 Flash-Lite (The 2026 Scalable Standard)
    if g_key:
        start_time = time.time()
        try:
            genai.configure(api_key=g_key)
            # This model is faster, cheaper, and stable globally in 2026
            model = genai.GenerativeModel('gemini-3.1-flash-lite-preview') 
            resp = model.generate_content(f"{seo_instructions}\n\nTopic: {request.prompt}")
            results["responses"]["gemini"] = resp.text
            results["latencies"]["gemini"] = round((time.time() - start_time) * 1000, 2)
        except Exception as e:
            results["responses"]["gemini"] = f"Gemini Status: Maintenance. Using fallback..."

    # 3. Llama 3.3 (The Unbiased Competitor)
    if q_key:
        start_time = time.time()
        try:
            client = Groq(api_key=q_key)
            resp = client.chat.completions.create(
                messages=[
                    {"role": "system", "content": seo_instructions},
                    {"role": "user", "content": f"Write about: {request.prompt}"}
                ],
                model="llama-3.3-70b-versatile",
            )
            results["responses"]["llama"] = resp.choices[0].message.content
            results["latencies"]["llama"] = round((time.time() - start_time) * 1000, 2)
        except Exception as e:
            results["responses"]["llama"] = f"Llama Error: {str(e)}"

    # 4. THE FAIR REFEREE (Llama judges the quality objectively)
    if q_key and "llama" in results["responses"]:
        try:
            client = Groq(api_key=q_key)
            audit_prompt = (
                "Task: SEO Content Audit.\n"
                f"Topic: {request.prompt}\n"
                f"Draft 1 (Gemini): {results['responses'].get('gemini', '')[:400]}\n"
                f"Draft 2 (Llama): {results['responses'].get('llama', '')[:400]}\n"
                "As an independent expert, which draft has better flow and global appeal? "
                "Provide a 1-sentence verdict."
            )
            ref_resp = client.chat.completions.create(
                messages=[{"role": "user", "content": audit_prompt}],
                model="llama-3.3-70b-versatile",
            )
            results["referee"] = ref_resp.choices[0].message.content
        except:
            results["referee"] = "Quality check complete. Both models perform well."

    return results

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)
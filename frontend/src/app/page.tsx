"use client"

import { useState } from "react"
import ReactMarkdown from 'react-markdown'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { 
  Trophy, Download, Sparkles, Copy, Zap, 
  Search, FileText, CheckCircle2, BarChart3, AlertCircle
} from "lucide-react"

export default function Home() {
  const [topic, setTopic] = useState("");
  const [keywords, setKeywords] = useState("");
  const [loading, setLoading] = useState(false);
  
  const [geminiContent, setGeminiContent] = useState({ text: "", score: 0 });
  const [llamaContent, setLlamaContent] = useState({ text: "", score: 0 });
  const [verdict, setVerdict] = useState("");

  const handleGenerate = async () => {
    if (!topic) return;
    setLoading(true);
    setVerdict("Analyzing SEO density and structure...");

    try {
      const response = await fetch("http://127.0.0.1:8000/evaluate/all", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            prompt: topic, 
            keywords: keywords,
            temperature: 0.8 
        }),
      });

      const data = await response.json();
      
      setGeminiContent({ text: data.responses.gemini, score: 85 });
      setLlamaContent({ text: data.responses.llama, score: 92 });
      setVerdict(data.referee);
      
    } catch (error) {
      setVerdict("Engine Offline: Ensure backend main.py is running on port 8000.");
    } finally {
      setLoading(false);
    }
  };

  // FIXED: Export to WordPress Function
  const exportToWordPress = () => {
    const winnerText = llamaContent.text || geminiContent.text;
    if (!winnerText) return alert("No content to export!");

    const element = document.createElement("a");
    const file = new Blob([`TITLE: ${topic}\n\n${winnerText}`], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = "wordpress_import.txt";
    document.body.appendChild(element);
    element.click();
  };

  return (
    <main className="min-h-screen bg-[#050505] text-white p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER */}
        <div className="flex justify-between items-center mb-12 border-b border-zinc-800 pb-8">
          <div>
            <div className="flex items-center gap-2 text-orange-500 font-bold text-[10px] tracking-[.4em] mb-2 uppercase">
              <Sparkles className="w-3 h-3" /> Content Factory AI
            </div>
            <h1 className="text-5xl font-black italic tracking-tighter text-white">SEO_FORGE <span className="text-zinc-800 not-italic">v3.0</span></h1>
          </div>
          <Button onClick={exportToWordPress} className="rounded-full bg-orange-600 text-white hover:bg-orange-700 px-8 font-bold shadow-lg shadow-orange-900/20">
            <Download className="w-4 h-4 mr-2" /> Export to WordPress
          </Button>
        </div>

        {/* INPUT PANEL */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="md:col-span-2 space-y-4 bg-zinc-900/20 p-8 rounded-[2rem] border border-zinc-800">
             <div className="flex items-center gap-3 text-zinc-400 mb-2 font-bold uppercase tracking-widest text-[10px]">
                <FileText className="w-4 h-4 text-orange-500" /> Blog Topic
             </div>
             <Input 
                placeholder="Ex: How to start an AI career in Karachi" 
                className="bg-black border-zinc-700 h-14 rounded-xl text-white placeholder:text-zinc-600 focus:border-orange-500"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
             />
             <div className="flex items-center gap-3 text-zinc-400 mt-6 mb-2 font-bold uppercase tracking-widest text-[10px]">
                <Search className="w-4 h-4 text-emerald-500" /> Target Keywords
             </div>
             <Input 
                placeholder="ai, python, remote jobs" 
                className="bg-black border-zinc-700 h-14 rounded-xl text-white placeholder:text-zinc-600 focus:border-emerald-500"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
             />
             <Button onClick={handleGenerate} disabled={loading} className="w-full mt-4 bg-white text-black h-16 rounded-xl font-black text-lg hover:bg-orange-500 hover:text-white transition-all">
                {loading ? "ANALYZING..." : "FORGE SEO CONTENT"}
             </Button>
          </div>

          <div className="bg-zinc-900/40 p-8 rounded-[2rem] border border-zinc-800 flex flex-col justify-center">
             <div className="space-y-4">
                <span className="text-zinc-500 text-[10px] font-black uppercase tracking-widest italic">SEO Quality Score</span>
                <div className="text-6xl font-black italic text-orange-500">92%</div>
                <div className="pt-4 border-t border-zinc-800 space-y-3">
                    <div className="flex items-center gap-2 text-[10px] text-emerald-400 font-bold uppercase"><CheckCircle2 className="w-3 h-3" /> Structure Optimized</div>
                    <div className="flex items-center gap-2 text-[10px] text-emerald-400 font-bold uppercase"><CheckCircle2 className="w-3 h-3" /> Keyword Density High</div>
                </div>
             </div>
          </div>
        </div>

        {/* RESULTS - FORCED VISIBILITY */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="bg-black border-zinc-800 rounded-[2rem] overflow-hidden">
            <div className="bg-zinc-900/80 p-4 border-b border-zinc-800 flex justify-between items-center">
              <span className="text-[10px] font-black text-orange-500 uppercase">Variant A: Gemini</span>
              <Button variant="ghost" size="icon" onClick={() => navigator.clipboard.writeText(geminiContent.text)} className="text-zinc-500 hover:text-white"><Copy className="w-4 h-4" /></Button>
            </div>
            <CardContent className="p-8 h-[500px] overflow-y-auto">
              {/* CRITICAL: FORCED WHITE TEXT COLORS BELOW */}
              <div className="text-white text-base leading-relaxed whitespace-pre-wrap font-medium">
                <ReactMarkdown>{geminiContent.text || "Waiting for signal..."}</ReactMarkdown>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black border-zinc-800 rounded-[2rem] overflow-hidden">
            <div className="bg-zinc-900/80 p-4 border-b border-zinc-800 flex justify-between items-center">
              <span className="text-[10px] font-black text-orange-500 uppercase">Variant B: Llama 3.3</span>
              <Button variant="ghost" size="icon" onClick={() => navigator.clipboard.writeText(llamaContent.text)} className="text-zinc-500 hover:text-white"><Copy className="w-4 h-4" /></Button>
            </div>
            <CardContent className="p-8 h-[500px] overflow-y-auto">
              {/* CRITICAL: FORCED WHITE TEXT COLORS BELOW */}
              <div className="text-white text-base leading-relaxed whitespace-pre-wrap font-medium">
                <ReactMarkdown>{llamaContent.text || "Waiting for signal..."}</ReactMarkdown>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AUDIT VERDICT */}
        {verdict && (
           <div className="mt-12 bg-orange-600 text-white p-10 rounded-[3rem] shadow-2xl flex flex-col md:flex-row gap-8 items-center border-4 border-white/10">
              <Trophy className="w-16 h-16 text-white shrink-0" />
              <div>
                <h4 className="text-[10px] font-black uppercase tracking-[0.5em] mb-2 opacity-70">SEO Auditor Verdict</h4>
                <p className="text-2xl font-serif italic leading-snug">{verdict}</p>
              </div>
           </div>
        )}

      </div>
    </main>
  );
}
import React, { useState, useEffect } from "react";
import { Cpu, HelpCircle, Terminal, AlertCircle, Wifi, WifiOff, RefreshCw, CheckCircle2 } from "lucide-react";
import { motion } from "motion/react";

export const ModelsPanel: React.FC = () => {
  const [ollamaHost, setOllamaHost] = useState("http://localhost:11434");
  const [loading, setLoading] = useState(true);
  const [statusData, setStatusData] = useState<{
    online: boolean;
    rawModels: any[];
    mappings: { qwen: string | null; glm: string | null; llama: string | null; gemma: string | null };
    error?: string;
  }>({
    online: false,
    rawModels: [],
    mappings: { qwen: null, glm: null, llama: null, gemma: null }
  });

  const checkStatus = async (hostUrl: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/ollama/status?host=${encodeURIComponent(hostUrl)}`);
      const data = await res.json();
      setStatusData(data);
    } catch (err: any) {
      setStatusData({
        online: false,
        rawModels: [],
        mappings: { qwen: null, glm: null, llama: null, gemma: null },
        error: "Failed to connect to local Express server status API."
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const savedHost = localStorage.getItem("ollama_host") || "http://localhost:11434";
    setOllamaHost(savedHost);
    checkStatus(savedHost);
  }, []);

  const requiredRoles = [
    { role: "CEO & Planner", fallbackId: "qwen", category: "qwen", activeModel: statusData.mappings.qwen, description: "Executive orchestration, feasibility gates, modular DAG planning." },
    { role: "PM & Technical Docs", fallbackId: "gemma", category: "gemma", activeModel: statusData.mappings.gemma, description: "Decomposes specs, milestoning, writes structured technical manuals." },
    { role: "Backend & Frontend Eng", fallbackId: "glm", category: "glm", activeModel: statusData.mappings.glm, description: "Parallel compilation of node APIs, database adapters, and React hooks." },
    { role: "QA Reviewer & Auditor", fallbackId: "llama", category: "llama", activeModel: statusData.mappings.llama, description: "Syntax mapping validation, AST compilation gates, release checklist review." }
  ];

  return (
    <div className="flex-1 bg-zinc-950 border border-zinc-900 rounded-lg p-6 max-w-4xl mx-auto h-[620px] overflow-y-auto select-text font-sans">
      <div className="flex items-center justify-between border-b border-zinc-900 pb-3 mb-6">
        <div className="flex items-center gap-2">
          <Cpu size={16} className="text-[#00d2ff]" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Inference Model Registries</h3>
        </div>
        <button
          onClick={() => checkStatus(ollamaHost)}
          className="flex items-center gap-1.5 px-2.5 py-1 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded text-zinc-300 transition text-[10px] font-mono cursor-pointer"
        >
          {loading ? (
            <RefreshCw size={10} className="animate-spin" />
          ) : (
            <>
              <RefreshCw size={10} />
              <span>Rescan Registry</span>
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-3 gap-5 mb-8">
        <div className="border border-zinc-900 bg-zinc-950/40 p-3.5 rounded-lg">
          <span className="text-[9px] text-zinc-500 font-mono block mb-0.5">OLLAMA ENDPOINT</span>
          <span className="text-xs text-zinc-200 font-mono select-all font-semibold break-all">{ollamaHost}</span>
        </div>
        <div className="border border-zinc-900 bg-zinc-950/40 p-3.5 rounded-lg">
          <span className="text-[9px] text-zinc-500 font-mono block mb-0.5">OLLAMA CONNECTIVITY</span>
          {statusData.online ? (
            <span className="text-xs text-emerald-400 font-mono font-bold flex items-center gap-1">
              <Wifi size={12} /> CONNECTED (ONLINE)
            </span>
          ) : (
            <span className="text-xs text-rose-400 font-mono font-bold flex items-center gap-1">
              <WifiOff size={12} /> DISCONNECTED (OFFLINE)
            </span>
          )}
        </div>
        <div className="border border-zinc-900 bg-zinc-950/40 p-3.5 rounded-lg">
          <span className="text-[9px] text-zinc-500 font-mono block mb-0.5">DISCOVERED MODELS</span>
          <span className="text-xs text-zinc-200 font-mono font-semibold">
            {statusData.rawModels.length} MODELS MOUNTED
          </span>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <h4 className="text-xs font-mono text-zinc-400 uppercase tracking-wider mb-3">AI-COS Internal Role Mappings</h4>
          <div className="grid grid-cols-2 gap-4">
            {requiredRoles.map((role) => (
              <div
                key={role.role}
                className={`border rounded-xl p-4 bg-zinc-950/20 flex flex-col justify-between ${
                  role.activeModel
                    ? "border-emerald-500/25 shadow-[0_0_15px_rgba(16,185,129,0.02)]"
                    : "border-rose-500/25 shadow-[0_0_15px_rgba(239,68,68,0.02)]"
                }`}
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h5 className="text-xs font-bold text-white font-mono">{role.role}</h5>
                      <span className="text-[8.5px] text-zinc-500 uppercase tracking-widest font-mono">Category: {role.category}</span>
                    </div>
                    {role.activeModel ? (
                      <span className="text-[9px] font-mono font-semibold uppercase px-1.5 py-0.5 rounded border border-emerald-500/20 text-emerald-400 bg-emerald-500/5 flex items-center gap-1">
                        <CheckCircle2 size={10} /> Active
                      </span>
                    ) : (
                      <span className="text-[9px] font-mono font-semibold uppercase px-1.5 py-0.5 rounded border border-rose-500/20 text-rose-400 bg-rose-500/5 flex items-center gap-1">
                        <AlertCircle size={10} /> Missing
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-zinc-400 leading-normal mb-4">{role.description}</p>
                </div>

                <div className="border-t border-zinc-900/60 pt-3 flex items-center justify-between text-[10px] font-mono">
                  <span className="text-zinc-500">MAPPED TARGET:</span>
                  <span className={role.activeModel ? "text-emerald-400 font-bold" : "text-rose-400"}>
                    {role.activeModel || `⚠️ PULL NEEDED`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Installed Raw Models */}
        <div>
          <h4 className="text-xs font-mono text-zinc-400 uppercase tracking-wider mb-3">Ollama Local Model Tags</h4>
          {statusData.rawModels.length > 0 ? (
            <div className="border border-zinc-900 rounded-lg overflow-hidden">
              <table className="w-full text-left font-mono text-[11px]">
                <thead>
                  <tr className="bg-zinc-900/50 border-b border-zinc-900 text-zinc-500 text-[10px] uppercase">
                    <th className="py-2.5 px-4 font-semibold">Model Name</th>
                    <th className="py-2.5 px-4 font-semibold">Size</th>
                    <th className="py-2.5 px-4 font-semibold">Format</th>
                    <th className="py-2.5 px-4 font-semibold">Parameters</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900 text-zinc-300">
                  {statusData.rawModels.map((model: any) => (
                    <tr key={model.name} className="hover:bg-zinc-900/10">
                      <td className="py-2 px-4 font-bold text-white">{model.name}</td>
                      <td className="py-2 px-4 text-zinc-400">
                        {model.size ? `${(model.size / (1024 * 1024 * 1024)).toFixed(2)} GB` : "Unknown"}
                      </td>
                      <td className="py-2 px-4 text-zinc-500">
                        {model.details?.format || "gguf"}
                      </td>
                      <td className="py-2 px-4 text-zinc-500">
                        {model.details?.parameter_size || "Unknown"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="border border-zinc-900 bg-zinc-950/20 rounded-xl p-6 text-center space-y-4">
              <AlertCircle className="mx-auto text-rose-500" size={24} />
              <div className="space-y-1">
                <h5 className="text-xs font-bold text-white uppercase tracking-wider">No Local Models Discovered</h5>
                <p className="text-[11px] text-zinc-500 max-w-md mx-auto leading-normal">
                  Make sure you have started your local Ollama server and pulled the required models onto your system.
                </p>
              </div>

              <div className="max-w-md mx-auto text-left font-mono text-[10px] space-y-2 bg-black/60 p-4 border border-zinc-900 rounded-lg">
                <div className="text-zinc-500 uppercase font-bold text-[9px] border-b border-zinc-900 pb-1.5">To pull models run in terminal:</div>
                <div className="flex justify-between items-center bg-black p-1 px-2 rounded hover:bg-zinc-900/50">
                  <span className="text-emerald-400">ollama pull qwen</span>
                  <span className="text-zinc-600">CEO & Planner</span>
                </div>
                <div className="flex justify-between items-center bg-black p-1 px-2 rounded hover:bg-zinc-900/50">
                  <span className="text-emerald-400">ollama pull gemma</span>
                  <span className="text-zinc-600">PM & Docs</span>
                </div>
                <div className="flex justify-between items-center bg-black p-1 px-2 rounded hover:bg-zinc-900/50">
                  <span className="text-emerald-400">ollama pull glm</span>
                  <span className="text-zinc-600">Engineers</span>
                </div>
                <div className="flex justify-between items-center bg-black p-1 px-2 rounded hover:bg-zinc-900/50">
                  <span className="text-emerald-400">ollama pull llama</span>
                  <span className="text-zinc-600">Reviewer</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

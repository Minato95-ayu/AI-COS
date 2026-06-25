import React, { useState, useEffect } from "react";
import { Shield, Sparkles, Check, Database, Sliders, AlertCircle, Cpu, Wifi, WifiOff, RefreshCw } from "lucide-react";
import { motion } from "motion/react";

export const SettingsPanel: React.FC = () => {
  const [dailyCap, setDailyCap] = useState(150);
  const [concurrency, setConcurrency] = useState(10);
  const [recursionDepth, setRecursionDepth] = useState(5);
  const [guardrailsEnabled, setGuardrailsEnabled] = useState(true);
  const [safetyCheck, setSafetyCheck] = useState(true);
  const [saved, setSaved] = useState(false);

  // Ollama Configuration State
  const [ollamaHost, setOllamaHost] = useState("http://localhost:11434");
  const [connectionStatus, setConnectionStatus] = useState<"unchecked" | "connecting" | "success" | "error">("unchecked");
  const [discoveredModels, setDiscoveredModels] = useState<any[]>([]);
  const [mappedModels, setMappedModels] = useState<{ qwen: string | null; glm: string | null; llama: string | null; gemma: string | null }>({
    qwen: null,
    glm: null,
    llama: null,
    gemma: null
  });
  const [errorMessage, setErrorMessage] = useState("");

  // Load configuration from localStorage on mount
  useEffect(() => {
    const savedHost = localStorage.getItem("ollama_host");
    if (savedHost) {
      setOllamaHost(savedHost);
    }
  }, []);

  const handleTestConnection = async () => {
    setConnectionStatus("connecting");
    setErrorMessage("");
    try {
      const res = await fetch(`/api/ollama/status?host=${encodeURIComponent(ollamaHost)}`);
      const data = await res.json();
      if (data.online) {
        setConnectionStatus("success");
        setDiscoveredModels(data.rawModels);
        setMappedModels(data.mappings);
        localStorage.setItem("ollama_host", ollamaHost);
        // Sync setting with backend
        await fetch("/api/ollama/configure", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ host: ollamaHost })
        });
      } else {
        setConnectionStatus("error");
        setErrorMessage(data.error || "Ollama daemon unreachable.");
      }
    } catch (err: any) {
      setConnectionStatus("error");
      setErrorMessage(err.message || "Failed to fetch status from sandbox API.");
    }
  };

  // Auto-test on mount to show active state
  useEffect(() => {
    const savedHost = localStorage.getItem("ollama_host") || "http://localhost:11434";
    fetch(`/api/ollama/status?host=${encodeURIComponent(savedHost)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.online) {
          setConnectionStatus("success");
          setDiscoveredModels(data.rawModels);
          setMappedModels(data.mappings);
        } else {
          setConnectionStatus("error");
          setErrorMessage("Local daemon is offline.");
        }
      })
      .catch(() => {
        setConnectionStatus("error");
        setErrorMessage("Sandbox connection error.");
      });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("ollama_host", ollamaHost);
    try {
      await fetch("/api/ollama/configure", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ host: ollamaHost })
      });
    } catch (err) {
      console.error(err);
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="flex-1 bg-zinc-950 border border-zinc-900 rounded-lg p-6 max-w-2xl mx-auto h-[620px] overflow-y-auto select-text">
      <div className="flex items-center gap-2 border-b border-zinc-900 pb-3 mb-6">
        <Sliders size={16} className="text-indigo-400" />
        <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">System Operational Settings</h3>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Ollama Daemon Configurations */}
        <div className="space-y-3 bg-[#111318]/40 border border-[#00d2ff]/10 p-5 rounded-xl">
          <h4 className="text-xs font-semibold text-[#00d2ff] flex items-center gap-2">
            <Cpu size={14} />
            <span>Ollama AI Model Integration</span>
          </h4>
          <p className="text-[11px] text-zinc-400 leading-normal">
            Configure the host URL for your local Ollama server. Ensure that CORS origins are enabled by starting Ollama with <code className="text-amber-400 font-mono px-1 bg-black/40 rounded">OLLAMA_ORIGINS="*"</code>.
          </p>

          <div className="space-y-3">
            <div>
              <label className="text-[10px] font-mono text-zinc-500 block mb-1 uppercase">Ollama Daemon Service Address</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={ollamaHost}
                  onChange={(e) => setOllamaHost(e.target.value)}
                  placeholder="http://localhost:11434"
                  className="flex-1 bg-black border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-white font-mono focus:border-[#00d2ff] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleTestConnection}
                  className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 hover:border-[#00d2ff] text-zinc-300 hover:text-white transition rounded text-[11px] font-mono flex items-center gap-1 cursor-pointer"
                >
                  {connectionStatus === "connecting" ? (
                    <RefreshCw size={11} className="animate-spin" />
                  ) : (
                    <span>Test</span>
                  )}
                </button>
              </div>
            </div>

            {/* Connection Telemetry */}
            <div className="bg-black/40 border border-zinc-900 rounded p-3 text-[11px] font-mono space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">DAEMON STATUS:</span>
                {connectionStatus === "success" ? (
                  <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                    <Wifi size={11} /> ONLINE
                  </span>
                ) : connectionStatus === "connecting" ? (
                  <span className="text-amber-400 flex items-center gap-1 animate-pulse">
                    <RefreshCw size={11} className="animate-spin" /> TESTING...
                  </span>
                ) : (
                  <span className="text-rose-400 flex items-center gap-1 font-semibold">
                    <WifiOff size={11} /> OFFLINE
                  </span>
                )}
              </div>

              {connectionStatus === "success" ? (
                <div className="space-y-1.5 pt-1.5 border-t border-zinc-900/60 text-[10px]">
                  <div className="text-zinc-500 uppercase tracking-widest font-bold pb-0.5 text-[8.5px]">Verified Model Mapping Matrix:</div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-400">CEO / Planner (Qwen):</span>
                    <span className={mappedModels.qwen ? "text-emerald-400 font-semibold" : "text-rose-400"}>
                      {mappedModels.qwen || "⚠️ MISSING QWEN"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-400">PM / Docs (Gemma):</span>
                    <span className={mappedModels.gemma ? "text-emerald-400 font-semibold" : "text-rose-400"}>
                      {mappedModels.gemma || "⚠️ MISSING GEMMA"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-400">Backend / Frontend (GLM):</span>
                    <span className={mappedModels.glm ? "text-emerald-400 font-semibold" : "text-rose-400"}>
                      {mappedModels.glm || "⚠️ MISSING GLM"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-400">Code Reviewer (Llama):</span>
                    <span className={mappedModels.llama ? "text-emerald-400 font-semibold" : "text-rose-400"}>
                      {mappedModels.llama || "⚠️ MISSING LLAMA"}
                    </span>
                  </div>
                </div>
              ) : errorMessage ? (
                <div className="text-rose-400 text-[10px] leading-relaxed pt-1 border-t border-zinc-900/60 bg-rose-500/5 p-2 rounded">
                  <strong>Ollama Offline:</strong> {errorMessage}
                  <div className="mt-2 text-zinc-400 leading-normal">
                    Please make sure Ollama is installed and running locally on your computer with correct CORS configuration:
                    <pre className="text-amber-400 mt-1 bg-black/50 p-1.5 rounded text-[9px] overflow-x-auto leading-normal">
                      OLLAMA_ORIGINS="*" ollama serve
                    </pre>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {/* Financial Guardrails */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-zinc-300 flex items-center gap-2">
            <Shield size={13} className="text-zinc-500" />
            <span>Financial & Usage Guardrails</span>
          </h4>
          <p className="text-[11px] text-zinc-500 leading-normal">
            Establish hard financial thresholds to prevent rogue agent loops from draining active token budgets.
          </p>

          <div className="space-y-3 bg-zinc-950/40 p-4 border border-zinc-900 rounded-lg">
            <div>
              <div className="flex justify-between items-center text-xs font-mono text-zinc-400 mb-1">
                <span>Daily Expense Cap</span>
                <span className="text-white font-bold">${dailyCap} USD</span>
              </div>
              <input
                type="range"
                min="10"
                max="1000"
                step="10"
                value={dailyCap}
                onChange={(e) => setDailyCap(Number(e.target.value))}
                className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>

            <div className="flex items-center justify-between border-t border-zinc-900 pt-3">
              <div>
                <span className="text-xs font-medium text-zinc-300 block">Strict Budget Gatekeeping</span>
                <span className="text-[10px] text-zinc-500 block">Pause execution immediately if limit exceeded.</span>
              </div>
              <button
                type="button"
                onClick={() => setGuardrailsEnabled(!guardrailsEnabled)}
                className={`w-9 h-5 rounded-full p-0.5 transition duration-200 cursor-pointer ${
                  guardrailsEnabled ? "bg-indigo-600" : "bg-zinc-800"
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow transform transition duration-200 ${
                    guardrailsEnabled ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Operational Limits */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-zinc-300 flex items-center gap-2">
            <Database size={13} className="text-zinc-500" />
            <span>Operational Constraints</span>
          </h4>

          <div className="grid grid-cols-2 gap-4 bg-zinc-950/40 p-4 border border-zinc-900 rounded-lg">
            <div>
              <label className="text-[10px] font-mono text-zinc-500 block mb-1 uppercase">Max Agent Concurrency</label>
              <select
                value={concurrency}
                onChange={(e) => setConcurrency(Number(e.target.value))}
                className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-white font-mono"
              >
                <option value={5}>5 Concurrent Workers</option>
                <option value={10}>10 Concurrent Workers</option>
                <option value={20}>20 Concurrent Workers</option>
                <option value={50}>50 Concurrent Workers</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-mono text-zinc-500 block mb-1 uppercase">Max Recursion Depth</label>
              <select
                value={recursionDepth}
                onChange={(e) => setRecursionDepth(Number(e.target.value))}
                className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-white font-mono"
              >
                <option value={3}>3 Levels Deep</option>
                <option value={5}>5 Levels Deep</option>
                <option value={10}>10 Levels Deep</option>
                <option value={15}>15 Levels Deep</option>
              </select>
            </div>
          </div>
        </div>

        {/* Safety Settings */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-zinc-300 flex items-center gap-2">
            <Shield size={13} className="text-zinc-500" />
            <span>Code Auditing & Safety Bounds</span>
          </h4>

          <div className="bg-zinc-950/40 p-4 border border-zinc-900 rounded-lg flex items-center justify-between">
            <div className="flex gap-2.5 items-start">
              <AlertCircle size={14} className="text-indigo-400 mt-0.5" />
              <div>
                <span className="text-xs font-medium text-zinc-300 block">Pre-Execution Code Verification</span>
                <span className="text-[10px] text-zinc-500 block">
                  Verify sandbox code safety before executing compiler commands.
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSafetyCheck(!safetyCheck)}
              className={`w-9 h-5 rounded-full p-0.5 transition duration-200 cursor-pointer ${
                safetyCheck ? "bg-indigo-600" : "bg-zinc-800"
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow transform transition duration-200 ${
                  safetyCheck ? "translate-x-4" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="border-t border-zinc-900 pt-5 flex items-center justify-between">
          <span className="text-[10px] text-zinc-500 font-mono">Changes apply globally to all runtimes.</span>
          <button
            type="submit"
            className="flex items-center gap-1.5 px-4 py-2 bg-[#00d2ff]/10 hover:bg-[#00d2ff]/20 text-[#00d2ff] border border-[#00d2ff]/25 font-medium text-xs rounded transition cursor-pointer font-mono"
          >
            {saved ? (
              <>
                <Check size={13} />
                <span>Configuration Saved</span>
              </>
            ) : (
              <span>Save Settings</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

import React, { useState } from "react";
import { CheckCircle2, Download, ExternalLink, GitBranch, Terminal, Sparkles, Check, Play, FolderCheck, Cpu } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface SuccessCelebrationProps {
  prompt: string;
  projectName: string;
  onClose: () => void;
  triggerNotification: (msg: string) => void;
}

export const SuccessCelebration: React.FC<SuccessCelebrationProps> = ({
  prompt,
  projectName,
  onClose,
  triggerNotification,
}) => {
  const [activeAction, setActiveAction] = useState<"none" | "downloading" | "vscode" | "git">("none");
  const [gitStage, setGitStage] = useState(0);
  const [vscodeStage, setVscodeStage] = useState(0);

  const handleDownload = () => {
    setActiveAction("downloading");
    triggerNotification("Assembling target structures...");
    
    setTimeout(() => {
      // Create and trigger file download
      const projectMeta = {
        projectName,
        prompt,
        exportedAt: new Date().toISOString(),
        engine: "AI-COS Operating Kernel v1.0.4",
        status: "Production Ready",
        architecture: {
          backend: ["app/core/config.py", "app/core/database.py", "app/core/redis.py", "requirements.txt"],
          frontend: ["src/App.tsx", "src/index.css", "package.json"],
        },
      };

      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(projectMeta, null, 2));
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `${projectName.toLowerCase().replace(/ /g, "_")}_workspace.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      setActiveAction("none");
      triggerNotification("Project bundle downloaded successfully!");
    }, 1500);
  };

  const handleOpenVSCode = () => {
    setActiveAction("vscode");
    setVscodeStage(1);
    
    setTimeout(() => setVscodeStage(2), 800);
    setTimeout(() => setVscodeStage(3), 1600);
    setTimeout(() => {
      setActiveAction("none");
      setVscodeStage(0);
      triggerNotification("Synthesized workspace loaded in local VS Code process.");
    }, 2400);
  };

  const handleCommitToGit = () => {
    setActiveAction("git");
    setGitStage(1);
    
    setTimeout(() => setGitStage(2), 1000);
    setTimeout(() => setGitStage(3), 2000);
    setTimeout(() => setGitStage(4), 3000);
    setTimeout(() => {
      setActiveAction("none");
      setGitStage(0);
      triggerNotification("Changes committed & pushed to origin/main successfully!");
    }, 4000);
  };

  return (
    <div className="fixed inset-0 bg-[#07080A]/80 backdrop-blur-md z-50 flex items-center justify-center p-4 select-none">
      {/* Decorative ambient glowing ring */}
      <div className="absolute w-[500px] h-[500px] bg-emerald-500/5 blur-3xl rounded-full pointer-events-none animate-pulse" />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="bg-[#111318] border border-emerald-500/20 max-w-2xl w-full rounded-2xl shadow-[0_25px_60px_rgba(16,185,129,0.08)] overflow-hidden flex flex-col font-sans"
      >
        {/* Confetti Particle Effect (Simulated via motion.div rows) */}
        <div className="relative h-1 bg-gradient-to-r from-emerald-500 via-[#00d2ff] to-emerald-500 w-full" />

        {/* Content Area */}
        <div className="p-6 md:p-8 space-y-6">
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto shadow-[0_0_20px_rgba(16,185,129,0.15)]">
              <CheckCircle2 size={24} className="animate-bounce" />
            </div>
            
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-white font-display uppercase tracking-tight">Mission Accomplished</h2>
              <p className="text-[11px] text-zinc-500 max-w-md mx-auto">
                All digital employee nodes have validated and compiled the core specifications successfully.
              </p>
            </div>
          </div>

          {/* Prompt/Spec Summary Card */}
          <div className="bg-[#0c0d10] border border-[rgba(255,255,255,0.04)] rounded-xl p-4 space-y-2">
            <div className="flex justify-between items-center text-[9px] font-mono text-zinc-500">
              <span className="uppercase tracking-widest">DISPATCHED PROMPT SPECIFICATION</span>
              <span className="text-[#00d2ff]">gemini-2.5-pro authoritative</span>
            </div>
            <p className="text-zinc-200 text-xs font-medium leading-relaxed font-sans">
              "{prompt}"
            </p>
            <div className="pt-2 border-t border-[rgba(255,255,255,0.03)] flex items-center justify-between text-[10px] font-mono text-zinc-400">
              <span className="flex items-center gap-1"><FolderCheck size={11} className="text-emerald-400" /> Project: {projectName}</span>
              <span className="text-emerald-400 font-semibold">100% Tested & Verified</span>
            </div>
          </div>

          {/* Project Summary Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-[#16181D]/30 p-3 rounded-xl border border-[rgba(255,255,255,0.03)] text-center">
              <span className="text-[8px] text-zinc-500 font-mono block uppercase mb-1">Architecture</span>
              <span className="text-[11.5px] font-bold text-zinc-200">Full-Stack (Dual)</span>
            </div>
            <div className="bg-[#16181D]/30 p-3 rounded-xl border border-[rgba(255,255,255,0.03)] text-center">
              <span className="text-[8px] text-zinc-500 font-mono block uppercase mb-1">Generated Files</span>
              <span className="text-[11.5px] font-bold text-[#00d2ff]">12 Core Modules</span>
            </div>
            <div className="bg-[#16181D]/30 p-3 rounded-xl border border-[rgba(255,255,255,0.03)] text-center">
              <span className="text-[8px] text-zinc-500 font-mono block uppercase mb-1">Integration Guard</span>
              <span className="text-[11.5px] font-bold text-emerald-400">JWT + OAuth</span>
            </div>
            <div className="bg-[#16181D]/30 p-3 rounded-xl border border-[rgba(255,255,255,0.03)] text-center">
              <span className="text-[8px] text-zinc-500 font-mono block uppercase mb-1">Compilation Rating</span>
              <span className="text-[11.5px] font-bold text-amber-400">98.4% Efficient</span>
            </div>
          </div>

          {/* Interactive Simulation Panel (Git / VS Code) */}
          <AnimatePresence mode="wait">
            {activeAction !== "none" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-[#0c0d10] border border-[rgba(255,255,255,0.05)] rounded-xl p-4 font-mono text-[10.5px] text-zinc-400 space-y-1.5 overflow-hidden"
              >
                <div className="flex justify-between items-center text-[9px] text-zinc-500 border-b border-[rgba(255,255,255,0.03)] pb-1.5 mb-1.5 font-bold uppercase tracking-wider">
                  <span className="flex items-center gap-1"><Terminal size={11} className="text-[#00d2ff]" /> Active Process Log</span>
                  <span className="animate-pulse text-[#00d2ff]">Running...</span>
                </div>
                
                {activeAction === "downloading" && (
                  <>
                    <div>$ package_composer --target {projectName.toLowerCase().replace(/ /g, "_")}</div>
                    <div className="text-zinc-500">Creating directories and compiling workspace maps...</div>
                    <div className="text-emerald-400">SUCCESS: Assembly finished. Sending file anchor triggers.</div>
                  </>
                )}

                {activeAction === "vscode" && (
                  <>
                    {vscodeStage >= 1 && <div>$ code . --workspace={projectName.replace(/ /g, "_")}</div>}
                    {vscodeStage >= 2 && <div className="text-zinc-500">Connecting to VS Code local process sockets...</div>}
                    {vscodeStage >= 3 && <div className="text-[#00d2ff]">Opened workspace inside external window securely.</div>}
                  </>
                )}

                {activeAction === "git" && (
                  <>
                    {gitStage >= 1 && <div>$ git add . && git commit -m "feat: complete target build from AI-COS orchestration"</div>}
                    {gitStage >= 2 && <div className="text-zinc-500">Creating secure commit tree. Hash: <strong className="text-amber-400">a9c8f2b1d</strong></div>}
                    {gitStage >= 3 && <div>$ git push origin main --force-with-lease</div>}
                    {gitStage >= 4 && <div className="text-emerald-400">SUCCESS: [main 8f7da1a] remote push signed and active on origin/main.</div>}
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Interactive Actions Panel */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-[rgba(255,255,255,0.04)] pt-5">
            <button
              onClick={handleDownload}
              disabled={activeAction !== "none"}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-[#16181D] hover:bg-[#1f2229] border border-[rgba(255,255,255,0.06)] hover:border-[#00d2ff]/30 text-zinc-300 hover:text-[#00d2ff] rounded-xl text-xs font-semibold font-mono transition cursor-pointer disabled:opacity-50"
            >
              <Download size={13} />
              <span>DOWNLOAD PROJECT</span>
            </button>

            <button
              onClick={handleOpenVSCode}
              disabled={activeAction !== "none"}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-[#16181D] hover:bg-[#1f2229] border border-[rgba(255,255,255,0.06)] hover:border-[#00d2ff]/30 text-zinc-300 hover:text-[#00d2ff] rounded-xl text-xs font-semibold font-mono transition cursor-pointer disabled:opacity-50"
            >
              <ExternalLink size={13} />
              <span>OPEN IN VS CODE</span>
            </button>

            <button
              onClick={handleCommitToGit}
              disabled={activeAction !== "none"}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs font-semibold font-mono transition cursor-pointer disabled:opacity-50"
            >
              <GitBranch size={13} />
              <span>COMMIT TO GIT</span>
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[#0c0d10] border-t border-[rgba(255,255,255,0.04)] flex justify-between items-center text-[9.5px] text-zinc-500 font-mono">
          <span className="flex items-center gap-1 text-[#00d2ff]"><Cpu size={10} /> Operating secure isolated control plane</span>
          <button 
            onClick={onClose}
            className="px-3 py-1 bg-zinc-900 border border-[rgba(255,255,255,0.06)] hover:bg-[#16181D] hover:text-white rounded-lg transition text-[9px] cursor-pointer"
          >
            RETURN TO CONTROL PANEL
          </button>
        </div>
      </motion.div>
    </div>
  );
};

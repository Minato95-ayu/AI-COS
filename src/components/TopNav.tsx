import React, { useState } from "react";
import { Cpu, Bell, ChevronDown, Sparkles, FolderKanban, Activity } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface TopNavProps {
  currentProject: string;
  activeModelsCount: number;
}

export const TopNav: React.FC<TopNavProps> = ({ currentProject, activeModelsCount }) => {
  const [showNotificationMenu, setShowNotificationMenu] = useState(false);
  const [showModelsMenu, setShowModelsMenu] = useState(false);

  return (
    <header className="h-12 border-b border-[rgba(255,255,255,0.06)] bg-[#09090B] px-4 flex items-center justify-between z-20 shrink-0 font-sans">
      {/* Company Logo / Brand */}
      <div className="flex items-center gap-2.5">
        <div className="relative">
          <div className="w-7 h-7 rounded-md bg-zinc-900 border border-[rgba(255,255,255,0.08)] flex items-center justify-center text-[#00d2ff]">
            <Cpu size={14} className="animate-pulse" />
          </div>
        </div>
        <div className="flex flex-col">
          <span className="font-display font-semibold text-xs tracking-tight text-white flex items-center gap-1">
            AI-COS
            <span className="text-[9px] bg-zinc-800 text-[#00d2ff] border border-[rgba(255,255,255,0.06)] px-1 py-0.2 rounded font-mono font-medium">
              v1.0
            </span>
          </span>
        </div>
      </div>

      {/* Middle/Right Widgets */}
      <div className="flex items-center gap-3">
        {/* Current Project Selector */}
        <div className="hidden sm:flex items-center gap-1.5 bg-[#111318] border border-[rgba(255,255,255,0.06)] px-2.5 py-1 rounded-md text-[11px] text-zinc-300">
          <FolderKanban size={12} className="text-zinc-500" />
          <span className="font-mono text-zinc-500">Project:</span>
          <span className="font-medium text-zinc-200">{currentProject}</span>
          <ChevronDown size={10} className="text-zinc-500 ml-0.5" />
        </div>

        {/* Active Model Indicator */}
        <div className="relative">
          <button
            onClick={() => setShowModelsMenu(!showModelsMenu)}
            className="flex items-center gap-1.5 bg-[#111318] hover:bg-[#16181D] border border-[rgba(255,255,255,0.06)] px-2.5 py-1 rounded-md text-[11px] font-mono text-zinc-300 transition cursor-pointer"
          >
            <Sparkles size={12} className="text-[#00d2ff]" />
            <span>Models: <strong className="text-white font-medium">{activeModelsCount}</strong></span>
            <ChevronDown size={10} className="text-zinc-500" />
          </button>

          <AnimatePresence>
            {showModelsMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowModelsMenu(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  transition={{ duration: 0.1 }}
                  className="absolute right-0 mt-1.5 w-56 bg-[#111318] border border-[rgba(255,255,255,0.08)] rounded-lg shadow-xl py-1 z-20 text-[11px]"
                >
                  <div className="px-2.5 py-1 border-b border-[rgba(255,255,255,0.06)] text-zinc-500 font-medium font-mono uppercase tracking-wider text-[9px]">Available Registry</div>
                  <div className="px-2.5 py-1.5 hover:bg-[#16181D] flex items-center justify-between cursor-pointer">
                    <span className="font-mono text-zinc-200">gemini-2.5-flash</span>
                    <span className="text-[9px] text-[#00d2ff] bg-[#00d2ff]/10 border border-[#00d2ff]/20 px-1 py-0.2 rounded font-mono">Primary</span>
                  </div>
                  <div className="px-2.5 py-1.5 hover:bg-[#16181D] flex items-center justify-between cursor-pointer">
                    <span className="font-mono text-zinc-400">gemini-2.5-pro</span>
                    <span className="text-[9px] text-zinc-400 bg-zinc-800 border border-[rgba(255,255,255,0.06)] px-1 py-0.2 rounded font-mono">Advanced</span>
                  </div>
                  <div className="px-2.5 py-1.5 hover:bg-[#16181D] flex items-center justify-between cursor-pointer">
                    <span className="font-mono text-zinc-400">llama-3.3-70b</span>
                    <span className="text-[9px] text-zinc-400 bg-zinc-800 border border-[rgba(255,255,255,0.06)] px-1 py-0.2 rounded font-mono">Local</span>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotificationMenu(!showNotificationMenu)}
            className="w-7 h-7 rounded-md bg-[#111318] hover:bg-[#16181D] border border-[rgba(255,255,255,0.06)] flex items-center justify-center text-zinc-400 hover:text-white transition cursor-pointer relative"
          >
            <Bell size={12} />
            <span className="absolute top-1.5 right-1.5 w-1 h-1 rounded-full bg-[#00d2ff]" />
          </button>

          <AnimatePresence>
            {showNotificationMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowNotificationMenu(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  transition={{ duration: 0.1 }}
                  className="absolute right-0 mt-1.5 w-72 bg-[#111318] border border-[rgba(255,255,255,0.08)] rounded-lg shadow-xl py-1 z-20 text-[11px]"
                >
                  <div className="px-3 py-1 border-b border-[rgba(255,255,255,0.06)] text-zinc-500 font-mono uppercase tracking-wider text-[9px] flex justify-between items-center">
                    <span>Notifications</span>
                    <span className="text-[9px] bg-zinc-800 text-zinc-400 px-1 py-0.2 rounded font-mono">1 New</span>
                  </div>
                  <div className="px-3.5 py-2.5 hover:bg-[#16181D] border-b border-[rgba(255,255,255,0.04)] cursor-pointer">
                    <div className="flex items-center gap-1.5 mb-0.5 text-zinc-200 font-medium">
                      <Activity size={10} className="text-emerald-500" />
                      <span>CEO Agent Dispatched</span>
                    </div>
                    <p className="text-zinc-400 text-[10px] leading-relaxed">
                      Sophia Sterling has initialized executive briefing on the workspace.
                    </p>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* User Menu / Avatar */}
        <div className="flex items-center gap-2 pl-2 border-l border-[rgba(255,255,255,0.06)]">
          <div className="flex flex-col text-right hidden md:flex">
            <span className="text-[11px] font-medium text-white leading-none">Ayush Kaushik</span>
            <span className="text-[9px] text-zinc-500 font-mono mt-0.5">ayushkaushik1441@gmail.com</span>
          </div>
          <div className="w-7 h-7 rounded-full bg-zinc-800 border border-[rgba(255,255,255,0.08)] flex items-center justify-center text-[10px] font-bold text-white shadow-inner">
            AK
          </div>
        </div>
      </div>
    </header>
  );
};

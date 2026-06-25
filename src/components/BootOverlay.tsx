import React, { useEffect, useState } from "react";
import { Cpu, ShieldCheck, Database, CheckCircle2, Server, Power, RefreshCw, Terminal } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface BootOverlayProps {
  onComplete: () => void;
}

export const BootOverlay: React.FC<BootOverlayProps> = ({ onComplete }) => {
  const [bootStep, setBootStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [logLines, setLogLines] = useState<string[]>([]);
  const [wokenEmployees, setWokenEmployees] = useState<string[]>([]);

  const systemChecks = [
    { text: "AI-COS Operating Kernel v1.0.4 loaded securely.", delay: 300 },
    { text: "Initializing high-concurrency multi-agent scheduler...", delay: 600 },
    { text: "Verifying secure process isolation boundaries... ENFORCED.", delay: 900 },
    { text: "Scanning local database pools... CONNECTED (20 connections active).", delay: 1200 },
    { text: "Discovering active AI LLM model registries...", delay: 1500 },
    { text: "-> gemini-2.5-flash: FOUND [STABLE]", delay: 1700 },
    { text: "-> gemini-2.5-pro: FOUND [PRODUCTION]", delay: 1900 },
    { text: "-> gemini-1.5-pro: FOUND [BACKUP]", delay: 2100 },
    { text: "Initializing digital workspace employee unit clusters...", delay: 2300 },
  ];

  const employeesToWake = [
    "Sophia Sterling (CEO) - Executive Unit [WOKEN]",
    "David Vance (Project Manager) - Management Unit [WOKEN]",
    "Liam Vance (Planner) - Strategy Unit [WOKEN]",
    "Ethan Thorne (Backend Engineer) - Engineering Unit [WOKEN]",
    "Maya Lin (Frontend Engineer) - Engineering Unit [WOKEN]",
    "Lucas Mercer (QA / Reviewer) - Quality Unit [WOKEN]",
  ];

  useEffect(() => {
    // Progress bar increment
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 1;
      });
    }, 45);

    // Timeline logs
    systemChecks.forEach((check) => {
      setTimeout(() => {
        setLogLines((prev) => [...prev, check.text]);
      }, check.delay);
    });

    // Employee wakes
    employeesToWake.forEach((emp, index) => {
      setTimeout(() => {
        setWokenEmployees((prev) => [...prev, emp]);
        setLogLines((prev) => [...prev, `[WORKER] Thread initiated for ${emp.split(" - ")[0]}`]);
      }, 2500 + index * 250);
    });

    // Boot completion trigger
    const completeTimeout = setTimeout(() => {
      onComplete();
    }, 4800);

    return () => {
      clearInterval(progressInterval);
      completeTimeout && clearTimeout(completeTimeout);
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-[#07080A] z-[100] flex flex-col justify-between p-8 font-mono select-none overflow-hidden text-slate-300">
      {/* Background Cyber Grid */}
      <div className="absolute inset-0 cosmic-grid opacity-10 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#00d2ff]/5 blur-3xl rounded-full pointer-events-none animate-pulse" />

      {/* Top Header Row */}
      <div className="flex justify-between items-center text-[10px] text-zinc-500 border-b border-[rgba(255,255,255,0.03)] pb-4 z-10">
        <div className="flex items-center gap-2">
          <Terminal size={12} className="text-[#00d2ff] animate-pulse" />
          <span>SYS_BOOT: SYSTEM_OK</span>
        </div>
        <div className="flex items-center gap-4">
          <span>LATENCY: 14ms</span>
          <span>BUILD: 80815.9</span>
          <button 
            onClick={onComplete}
            className="px-2.5 py-1 bg-zinc-900 hover:bg-[#00d2ff]/10 hover:text-[#00d2ff] border border-[rgba(255,255,255,0.06)] rounded-lg text-[9px] transition cursor-pointer"
          >
            SKIP BOOT [ESC]
          </button>
        </div>
      </div>

      {/* Centered Logo and Progress Reveal */}
      <div className="flex-1 flex flex-col items-center justify-center max-w-xl mx-auto w-full z-10 space-y-10 my-8">
        
        {/* Animated AI-COS Reveal */}
        <div className="text-center space-y-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="w-20 h-20 mx-auto rounded-2xl bg-[#111318] border border-[#00d2ff]/30 shadow-[0_0_35px_rgba(0,210,255,0.15)] flex items-center justify-center text-[#00d2ff] relative"
          >
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 rounded-2xl border border-dashed border-[#00d2ff]/15"
            />
            <Cpu size={36} className="animate-pulse" />
          </motion.div>

          <div className="space-y-1.5">
            <motion.h1
              initial={{ letterSpacing: "0.2em", opacity: 0 }}
              animate={{ letterSpacing: "0.05em", opacity: 1 }}
              transition={{ delay: 0.3, duration: 1 }}
              className="text-xl font-bold tracking-wider text-white font-display uppercase"
            >
              AI-COS Kernel
            </motion.h1>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest">
              Cooperative Agent Operating System
            </p>
          </div>
        </div>

        {/* Console Log Subsystem */}
        <div className="w-full bg-[#0c0d10] border border-[rgba(255,255,255,0.05)] rounded-xl p-4 h-48 overflow-y-auto text-[10.5px] leading-relaxed text-zinc-400 space-y-1 scroll-smooth custom-scrollbar">
          <AnimatePresence>
            {logLines.map((line, idx) => {
              const isWorker = line.startsWith("[WORKER]");
              const isArrow = line.startsWith("->");
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.15 }}
                  className={`flex items-start gap-2 ${
                    isWorker 
                      ? "text-[#6366f1]" 
                      : isArrow 
                      ? "text-[#00d2ff] font-medium pl-3" 
                      : "text-zinc-400"
                  }`}
                >
                  <span className="text-zinc-600 select-none">▶</span>
                  <span>{line}</span>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Loading Bar with stats */}
        <div className="w-full space-y-2">
          <div className="flex justify-between items-center text-[10px] text-zinc-500">
            <span className="flex items-center gap-1.5">
              <RefreshCw size={10} className="animate-spin text-[#00d2ff]" />
              SYS_LOAD: COOPERATIVE_DAEMONS
            </span>
            <span className="text-emerald-400 font-semibold">{progress}%</span>
          </div>
          <div className="w-full bg-zinc-950 h-1.5 rounded-full overflow-hidden border border-[rgba(255,255,255,0.03)]">
            <motion.div
              className="h-full bg-gradient-to-r from-[#00d2ff] to-[#6366f1] rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: `${progress}%` }}
              transition={{ ease: "easeInOut" }}
            />
          </div>
        </div>
      </div>

      {/* Underbelly System Grid Status */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-[rgba(255,255,255,0.03)] pt-4 text-[10px] text-zinc-500 z-10">
        <div>
          <span className="block text-[8px] text-zinc-600 uppercase">SYS_MEM_POOL</span>
          <span className="text-zinc-300">16,384MB / 16,384MB (100% OK)</span>
        </div>
        <div>
          <span className="block text-[8px] text-zinc-600 uppercase">ACTIVE_MODELS</span>
          <span className="text-[#00d2ff]">Gemini-2.5 Integration active</span>
        </div>
        <div>
          <span className="block text-[8px] text-zinc-600 uppercase">RELIABILITY</span>
          <span className="text-emerald-400">99.98% operational uptime</span>
        </div>
        <div>
          <span className="block text-[8px] text-zinc-600 uppercase">SECURE_ROOT</span>
          <span className="text-zinc-300">ADMINISTRATOR SECURE SHIELD</span>
        </div>
      </div>
    </div>
  );
};

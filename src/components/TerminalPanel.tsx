import React, { useEffect, useRef, useState } from "react";
import { TerminalLine } from "../types";
import { Terminal, Trash2, Copy, Check, TerminalSquare } from "lucide-react";
import { motion } from "motion/react";

interface TerminalPanelProps {
  lines: TerminalLine[];
  onClear: () => void;
}

export const TerminalPanel: React.FC<TerminalPanelProps> = ({ lines, onClear }) => {
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [lines]);

  const handleCopy = () => {
    const text = lines.map((l) => `[${l.timestamp}] ${l.text}`).join("\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getLineColor = (type: TerminalLine["type"]) => {
    switch (type) {
      case "success":
        return "text-emerald-400 font-normal";
      case "warning":
        return "text-amber-400 font-normal";
      case "error":
        return "text-rose-400 font-medium";
      case "command":
        return "text-[#00d2ff] font-semibold";
      case "output":
        return "text-zinc-300";
      default:
        return "text-zinc-400";
    }
  };

  return (
    <div className="flex-1 flex flex-col h-72 bg-[#111318] border border-[rgba(255,255,255,0.06)] rounded-xl overflow-hidden font-mono text-[11px]">
      {/* Terminal Title Bar */}
      <div className="h-9 border-b border-[rgba(255,255,255,0.05)] px-4 flex items-center justify-between bg-[#111318] shrink-0">
        <div className="flex items-center gap-2 text-zinc-400 font-medium">
          <Terminal size={12} className="text-[#00d2ff]" />
          <span className="font-sans text-[11px] font-semibold text-zinc-300">Live Process Stream</span>
        </div>
        
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleCopy}
            className="p-1.5 text-zinc-500 hover:text-zinc-300 hover:bg-[#16181D] rounded transition cursor-pointer"
            title="Copy Logs"
          >
            {copied ? <Check size={11} className="text-emerald-500" /> : <Copy size={11} />}
          </button>
          <button
            onClick={onClear}
            className="p-1.5 text-zinc-500 hover:text-zinc-300 hover:bg-[#16181D] rounded transition cursor-pointer"
            title="Clear Console"
          >
            <Trash2 size={11} />
          </button>
        </div>
      </div>

      {/* Terminal Lines Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-1 bg-[#0c0d10]/50 leading-relaxed select-text custom-scrollbar">
        {lines.length === 0 ? (
          <div className="text-zinc-600 italic flex items-center gap-2 h-full justify-center">
            <TerminalSquare size={13} />
            <span className="font-sans text-[11px]">Console buffer cleared. Awaiting task stream activation...</span>
          </div>
        ) : (
          lines.map((line, idx) => (
            <motion.div
              key={line.id || idx}
              initial={{ opacity: 0, x: -3 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.1 }}
              className="flex items-start gap-1.5"
            >
              <span className="text-zinc-600 shrink-0 select-none">[{line.timestamp}]</span>
              {line.type === "command" && <span className="text-[#00d2ff] select-none">$</span>}
              <span className={`break-all ${getLineColor(line.type)}`}>{line.text}</span>
            </motion.div>
          ))
        )}
        <div ref={terminalEndRef} />
      </div>
    </div>
  );
};


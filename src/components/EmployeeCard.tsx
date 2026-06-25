import React, { useEffect, useState } from "react";
import { Employee } from "../types";
import { Cpu, FileText, Zap, Hourglass, CheckCircle2, ShieldAlert } from "lucide-react";
import { motion } from "motion/react";

interface EmployeeCardProps {
  employee: Employee;
  isActive: boolean;
  onInspect?: (employee: Employee) => void;
}

export const EmployeeCard: React.FC<EmployeeCardProps> = ({ employee, isActive, onInspect }) => {
  const [cpuUsage, setCpuUsage] = useState(1);
  const [tokensProcessed, setTokensProcessed] = useState(0);

  // Generate dynamic metric fluctuations for active employees to feel alive
  useEffect(() => {
    if (employee.status === "executing") {
      const interval = setInterval(() => {
        setCpuUsage(Math.floor(Math.random() * 35) + 55); // 55% - 90%
        setTokensProcessed((prev) => prev + Math.floor(Math.random() * 120) + 80);
      }, 1000);
      return () => clearInterval(interval);
    } else if (employee.status === "planning") {
      const interval = setInterval(() => {
        setCpuUsage(Math.floor(Math.random() * 15) + 15); // 15% - 30%
        setTokensProcessed((prev) => prev + Math.floor(Math.random() * 40) + 10);
      }, 1200);
      return () => clearInterval(interval);
    } else if (employee.status === "idle") {
      setCpuUsage(1);
      setTokensProcessed(0);
    } else {
      setCpuUsage(0);
    }
  }, [employee.status]);

  const getStatusConfig = (status: Employee["status"]) => {
    switch (status) {
      case "idle":
        return {
          bg: "bg-[#111318]",
          border: "border-[rgba(255,255,255,0.04)]",
          glow: "",
          text: "text-zinc-500",
          indicator: "bg-zinc-600",
          file: "None",
          eta: "--"
        };
      case "planning":
        return {
          bg: "bg-[#111318]",
          border: "border-[rgba(99,102,241,0.2)]",
          glow: "shadow-[0_0_15px_rgba(99,102,241,0.04)]",
          text: "text-indigo-400",
          indicator: "bg-indigo-400 animate-pulse",
          file: "workspace/strategy.json",
          eta: "~12s"
        };
      case "executing":
        return {
          bg: "bg-[#16181D]",
          border: "border-[rgba(0,210,255,0.25)]",
          glow: "shadow-[0_0_15px_rgba(0,210,255,0.05)]",
          text: "text-[#00d2ff]",
          indicator: "bg-[#00d2ff] animate-pulse",
          file: employee.department === "Engineering" 
            ? (employee.role.includes("Backend") ? "backend/app/redis.py" : "frontend/src/App.tsx")
            : "management/roadmap.md",
          eta: `${Math.max(1, Math.ceil((100 - employee.progress) / 12))}s`
        };
      case "success":
        return {
          bg: "bg-[#111318]",
          border: "border-[rgba(16,185,129,0.15)]",
          glow: "",
          text: "text-emerald-400",
          indicator: "bg-emerald-500",
          file: "Completed Tasks",
          eta: "0s"
        };
      case "failed":
        return {
          bg: "bg-[#111318]",
          border: "border-[rgba(244,63,94,0.15)]",
          glow: "",
          text: "text-rose-400",
          indicator: "bg-rose-500",
          file: "None (Error)",
          eta: "--"
        };
      default:
        return {
          bg: "bg-[#111318]",
          border: "border-[rgba(255,255,255,0.04)]",
          glow: "",
          text: "text-zinc-500",
          indicator: "bg-zinc-600",
          file: "None",
          eta: "--"
        };
    }
  };

  const config = getStatusConfig(employee.status);
  const initials = employee.name
    .split(" ")
    .map((n) => n[0])
    .join("");

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2, borderColor: "rgba(0, 210, 255, 0.3)", transition: { duration: 0.15 } }}
      onClick={() => onInspect?.(employee)}
      className={`rounded-xl border p-3.5 transition-all duration-300 relative overflow-hidden font-sans cursor-pointer ${config.bg} ${config.border} ${config.glow} ${
        isActive ? "ring-1 ring-[#00d2ff]/20 shadow-[0_0_15px_rgba(0,210,255,0.04)]" : ""
      }`}
    >
      {/* Decorative backdrop glow for executing employees */}
      {employee.status === "executing" && (
        <span className="absolute top-0 right-0 w-24 h-24 bg-[#00d2ff]/5 rounded-full blur-2xl pointer-events-none" />
      )}
      {employee.status === "planning" && (
        <span className="absolute top-0 right-0 w-24 h-24 bg-[#6366f1]/5 rounded-full blur-2xl pointer-events-none" />
      )}

      {/* Header Info */}
      <div className="flex items-start justify-between gap-3 mb-3 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-bold font-mono border transition-all duration-300 ${
            employee.status === "executing" 
              ? "bg-[#00d2ff]/10 text-[#00d2ff] border-[#00d2ff]/20 shadow-[0_0_8px_rgba(0,210,255,0.1)]" 
              : "bg-zinc-900 text-zinc-300 border-[rgba(255,255,255,0.06)]"
          }`}>
            {initials}
          </div>
          <div>
            <h4 className="text-[12px] font-semibold text-zinc-100 leading-tight font-display">{employee.name}</h4>
            <span className="text-[10px] text-zinc-500 font-mono tracking-tight">{employee.role}</span>
          </div>
        </div>

        {/* State Badge */}
        <span className={`text-[9px] font-mono tracking-wider uppercase px-1.5 py-0.5 rounded border flex items-center gap-1 ${
          employee.status === "executing" 
            ? "bg-[#00d2ff]/5 text-[#00d2ff] border-[#00d2ff]/20" 
            : employee.status === "planning"
            ? "bg-[#6366f1]/5 text-[#6366f1] border-[#6366f1]/20"
            : "bg-zinc-900/50 text-zinc-400 border-[rgba(255,255,255,0.06)]"
        }`}>
          <span className={`w-1 h-1 rounded-full ${config.indicator}`} />
          {employee.status}
        </span>
      </div>

      {/* Task & File Section */}
      <div className="space-y-2 mb-3 text-[11px] relative z-10">
        <div>
          <span className="text-[9px] text-zinc-500 font-mono block mb-0.5 uppercase tracking-wider">ACTIVE DIRECTIVE</span>
          <p className="text-zinc-200 leading-normal font-sans font-normal truncate">
            {employee.currentTask ? employee.currentTask : <span className="text-zinc-600 italic">Waiting in standby</span>}
          </p>
        </div>

        {employee.status !== "idle" && (
          <div className="grid grid-cols-2 gap-2 border-t border-[rgba(255,255,255,0.04)] pt-2 mt-1.5">
            <div>
              <span className="text-[8px] text-zinc-500 font-mono block uppercase">TARGET FILE</span>
              <div className="flex items-center gap-1 text-zinc-400 font-mono text-[9px] mt-0.5 truncate">
                <FileText size={10} className="text-zinc-500" />
                <span className="truncate">{config.file}</span>
              </div>
            </div>
            <div>
              <span className="text-[8px] text-zinc-500 font-mono block uppercase">MODEL REGISTRY</span>
              <div className="flex items-center gap-1 text-zinc-400 font-mono text-[9px] mt-0.5 truncate">
                <Cpu size={10} className="text-zinc-500" />
                <span className="truncate">{employee.activeModel}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Live Engine stats: CPU, Tokens, ETA */}
      {employee.status !== "idle" && (
        <div className="grid grid-cols-3 gap-1.5 py-2 border-t border-[rgba(255,255,255,0.04)] mb-3 text-[10px] font-mono relative z-10">
          <div className="bg-[#111318]/50 p-1 rounded border border-[rgba(255,255,255,0.03)] text-center">
            <span className="text-[8px] text-zinc-500 block uppercase">CPU LOAD</span>
            <span className="font-semibold text-zinc-300 flex items-center justify-center gap-0.5 mt-0.5 text-[9px]">
              <Zap size={9} className="text-[#00d2ff]" /> {cpuUsage}%
            </span>
          </div>
          <div className="bg-[#111318]/50 p-1 rounded border border-[rgba(255,255,255,0.03)] text-center">
            <span className="text-[8px] text-zinc-500 block uppercase">TOKENS</span>
            <span className="font-semibold text-zinc-300 mt-0.5 text-[9px]">
              {tokensProcessed > 0 ? `${(tokensProcessed / 1000).toFixed(1)}k` : "0.0k"}
            </span>
          </div>
          <div className="bg-[#111318]/50 p-1 rounded border border-[rgba(255,255,255,0.03)] text-center">
            <span className="text-[8px] text-zinc-500 block uppercase">ETA</span>
            <span className="font-semibold text-zinc-300 flex items-center justify-center gap-0.5 mt-0.5 text-[9px]">
              <Hourglass size={9} className="text-zinc-500" /> {config.eta}
            </span>
          </div>
        </div>
      )}

      {/* Progress slider and Score metrics */}
      <div className="space-y-2 pt-2 border-t border-[rgba(255,255,255,0.04)] relative z-10">
        {employee.status !== "idle" && (
          <div>
            <div className="flex justify-between items-center text-[9px] font-mono text-zinc-500 mb-1">
              <span>WORKLOAD COMPLETE</span>
              <span className={config.text}>{employee.progress}%</span>
            </div>
            <div className="w-full bg-zinc-950 h-1 rounded-full overflow-hidden">
              <motion.div 
                className={`h-full rounded-full ${
                  employee.status === "executing" ? "bg-[#00d2ff]" : "bg-[#6366f1]"
                }`}
                initial={{ width: 0 }}
                animate={{ width: `${employee.progress}%` }}
                transition={{ duration: 0.2 }}
              />
            </div>
          </div>
        )}

        <div className="grid grid-cols-3 gap-1 text-center">
          <div className="bg-[#111318]/20 p-1 rounded border border-[rgba(255,255,255,0.03)]">
            <span className="text-[7.5px] text-zinc-500 font-mono block">PERF</span>
            <span className="text-[9.5px] font-bold text-zinc-300 font-mono">{employee.performanceScore}%</span>
          </div>
          <div className="bg-[#111318]/20 p-1 rounded border border-[rgba(255,255,255,0.03)]">
            <span className="text-[7.5px] text-zinc-500 font-mono block">RELI</span>
            <span className="text-[9.5px] font-bold text-zinc-300 font-mono">{employee.reliabilityScore}%</span>
          </div>
          <div className="bg-[#111318]/20 p-1 rounded border border-[rgba(255,255,255,0.03)]">
            <span className="text-[7.5px] text-zinc-500 font-mono block">VALUE</span>
            <span className="text-[9.5px] font-bold text-zinc-300 font-mono">${(employee.salaryCost / 1000).toFixed(0)}k</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};


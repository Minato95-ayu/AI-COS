import React from "react";
import { ActivityLog, ModelMetric } from "../types";
import { Cpu, DollarSign, Activity, FileJson, Gauge, Zap } from "lucide-react";
import { motion } from "motion/react";

interface MetricStatsProps {
  logs: ActivityLog[];
  modelMetrics: ModelMetric[];
  totalTokens: number;
  totalCost: number;
  performanceScore: number;
}

export const MetricStats: React.FC<MetricStatsProps> = ({
  logs,
  modelMetrics,
  totalTokens,
  totalCost,
  performanceScore
}) => {
  return (
    <div className="w-96 flex flex-col gap-4 shrink-0 font-sans">
      {/* Dynamic Key Counters */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-[#111318] border border-[rgba(255,255,255,0.06)] rounded-xl p-3.5 shadow-sm">
          <div className="flex items-center justify-between text-zinc-500 mb-1">
            <span className="text-[9px] font-mono tracking-wider uppercase font-semibold">TOKEN SPEND</span>
            <Zap size={11} className="text-zinc-600" />
          </div>
          <div className="text-sm font-bold font-mono text-zinc-100 leading-tight">
            {totalTokens.toLocaleString()}
          </div>
          <span className="text-[8.5px] text-zinc-500 font-mono">Cumulative tokens</span>
        </div>

        <div className="bg-[#111318] border border-[rgba(255,255,255,0.06)] rounded-xl p-3.5 shadow-sm">
          <div className="flex items-center justify-between text-zinc-500 mb-1">
            <span className="text-[9px] font-mono tracking-wider uppercase font-semibold">TOTAL COST</span>
            <DollarSign size={11} className="text-zinc-600" />
          </div>
          <div className="text-sm font-bold font-mono text-[#00d2ff] leading-tight">
            ${totalCost.toFixed(4)}
          </div>
          <span className="text-[8.5px] text-zinc-500 font-mono">LLM API billing</span>
        </div>

        <div className="bg-[#111318] border border-[rgba(255,255,255,0.06)] rounded-xl p-3.5 shadow-sm">
          <div className="flex items-center justify-between text-zinc-500 mb-1">
            <span className="text-[9px] font-mono tracking-wider uppercase font-semibold">EFFICIENCY</span>
            <Gauge size={11} className="text-zinc-600" />
          </div>
          <div className="text-sm font-bold font-mono text-emerald-400 leading-tight">
            {performanceScore}%
          </div>
          <span className="text-[8.5px] text-zinc-500 font-mono">OS performance</span>
        </div>
      </div>

      {/* Split Block for Model Usage and Activity Feed */}
      <div className="flex-1 grid grid-rows-2 gap-4 h-56">
        {/* Model Allocation */}
        <div className="bg-[#111318] border border-[rgba(255,255,255,0.06)] rounded-xl p-4 flex flex-col justify-between overflow-hidden shadow-sm">
          <div className="flex items-center gap-1.5 border-b border-[rgba(255,255,255,0.04)] pb-2 mb-2">
            <Cpu size={12} className="text-[#00d2ff]" />
            <span className="text-[9.5px] font-mono uppercase font-semibold text-zinc-400">Enterprise Model Usage</span>
          </div>

          <div className="space-y-2 flex-1 overflow-y-auto custom-scrollbar pr-1">
            {modelMetrics.map((model) => {
              const maxTokens = Math.max(...modelMetrics.map((m) => m.tokens), 1);
              const percentage = Math.min((model.tokens / maxTokens) * 100, 100);

              return (
                <div key={model.name} className="space-y-1">
                  <div className="flex justify-between items-center text-[10px] font-mono">
                    <span className="text-zinc-300 font-medium">{model.name}</span>
                    <span className="text-zinc-500">
                      {model.calls} calls · {(model.tokens / 1000).toFixed(1)}k tokens
                    </span>
                  </div>
                  <div className="w-full bg-zinc-900/40 h-1 rounded-full overflow-hidden">
                    <motion.div
                      className="bg-[#00d2ff] h-full rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Employee Activity Feed */}
        <div className="bg-[#111318] border border-[rgba(255,255,255,0.06)] rounded-xl p-4 flex flex-col justify-between overflow-hidden shadow-sm">
          <div className="flex items-center gap-1.5 border-b border-[rgba(255,255,255,0.04)] pb-2 mb-2">
            <Activity size={12} className="text-[#00d2ff]" />
            <span className="text-[9.5px] font-mono uppercase font-semibold text-zinc-400">Employee Activity Feed</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-1 select-none">
            {logs.length === 0 ? (
              <div className="text-[10px] text-zinc-600 italic text-center py-4">No active workflow telemetry.</div>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="text-[10.5px] leading-tight flex items-start gap-2">
                  <div className="text-[9.5px] font-mono text-zinc-600 shrink-0">[{log.timestamp}]</div>
                  <div>
                    <span className="text-zinc-300 font-medium">{log.employeeName}</span>{" "}
                    <span className="text-zinc-500 font-mono text-[9px]">({log.role})</span>:{" "}
                    <span className="text-zinc-400">{log.message}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};


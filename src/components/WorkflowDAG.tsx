import React from "react";
import { WorkflowNode } from "../types";
import { 
  UserCheck, 
  FileText, 
  Cpu, 
  Database, 
  Layout, 
  CheckSquare, 
  CheckCircle2, 
  ArrowRight,
  GitMerge
} from "lucide-react";
import { motion } from "motion/react";

interface WorkflowDAGProps {
  steps: WorkflowNode[];
}

export const WorkflowDAG: React.FC<WorkflowDAGProps> = ({ steps }) => {
  const getStepStatus = (id: string): WorkflowNode["status"] => {
    return steps.find((s) => s.id === id)?.status || "pending";
  };

  const getStatusColor = (status: WorkflowNode["status"]) => {
    switch (status) {
      case "completed":
        return {
          bg: "bg-emerald-500/10",
          border: "border-emerald-500/30",
          text: "text-emerald-400",
          ring: "ring-emerald-500/10 shadow-[0_0_12px_rgba(16,185,129,0.05)]",
          iconColor: "text-emerald-400"
        };
      case "active":
        return {
          bg: "bg-[#00d2ff]/10",
          border: "border-[#00d2ff]",
          text: "text-[#00d2ff]",
          ring: "ring-[#00d2ff]/20 shadow-[0_0_15px_rgba(0,210,255,0.12)]",
          iconColor: "text-[#00d2ff]"
        };
      case "failed":
        return {
          bg: "bg-rose-500/10",
          border: "border-rose-500/30",
          text: "text-rose-400",
          ring: "ring-rose-500/10 shadow-[0_0_12px_rgba(244,63,94,0.05)]",
          iconColor: "text-rose-400"
        };
      default:
        return {
          bg: "bg-[#111318]",
          border: "border-[rgba(255,255,255,0.05)]",
          text: "text-zinc-500",
          ring: "ring-transparent",
          iconColor: "text-zinc-500"
        };
    }
  };

  const nodes = [
    { id: "ceo", label: "CEO Directive", icon: UserCheck, gridArea: "col-start-1 row-start-2" },
    { id: "pm", label: "Roadmap PM", icon: FileText, gridArea: "col-start-2 row-start-2" },
    { id: "planner", label: "DAG Planning", icon: Cpu, gridArea: "col-start-3 row-start-2" },
    { id: "backend", label: "Backend API", icon: Database, gridArea: "col-start-4 row-start-1" },
    { id: "frontend", label: "Frontend UI", icon: Layout, gridArea: "col-start-4 row-start-3" },
    { id: "qa", label: "QA Check", icon: CheckSquare, gridArea: "col-start-5 row-start-2" },
    { id: "merge", label: "Deploy / Merge", icon: GitMerge, gridArea: "col-start-6 row-start-2" },
  ];

  return (
    <div className="relative w-full bg-[#111318] border border-[rgba(255,255,255,0.06)] rounded-xl p-5 overflow-x-auto min-h-[220px] flex items-center justify-center">
      {/* SVG Connections background */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ minWidth: "800px" }}>
        <defs>
          <linearGradient id="activeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00d2ff" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0.8" />
          </linearGradient>
        </defs>

        {/* CEO -> PM */}
        <path
          d="M 120 110 L 210 110"
          stroke={getStepStatus("pm") === "completed" ? "#10b981" : getStepStatus("pm") === "active" ? "url(#activeGrad)" : "rgba(255,255,255,0.04)"}
          strokeWidth="1.5"
          strokeDasharray={getStepStatus("pm") === "active" ? "3 3" : "0"}
          fill="none"
        />

        {/* PM -> Planner */}
        <path
          d="M 290 110 L 380 110"
          stroke={getStepStatus("planner") === "completed" ? "#10b981" : getStepStatus("planner") === "active" ? "url(#activeGrad)" : "rgba(255,255,255,0.04)"}
          strokeWidth="1.5"
          fill="none"
        />

        {/* Planner -> Backend (top) */}
        <path
          d="M 460 110 Q 500 110, 500 50 T 540 50"
          stroke={getStepStatus("backend") === "completed" ? "#10b981" : getStepStatus("backend") === "active" ? "url(#activeGrad)" : "rgba(255,255,255,0.04)"}
          strokeWidth="1.5"
          fill="none"
        />

        {/* Planner -> Frontend (bottom) */}
        <path
          d="M 460 110 Q 500 110, 500 170 T 540 170"
          stroke={getStepStatus("frontend") === "completed" ? "#10b981" : getStepStatus("frontend") === "active" ? "url(#activeGrad)" : "rgba(255,255,255,0.04)"}
          strokeWidth="1.5"
          fill="none"
        />

        {/* Backend -> QA */}
        <path
          d="M 620 50 Q 660 50, 660 110 T 700 110"
          stroke={getStepStatus("qa") === "completed" ? "#10b981" : getStepStatus("qa") === "active" ? "url(#activeGrad)" : "rgba(255,255,255,0.04)"}
          strokeWidth="1.5"
          fill="none"
        />

        {/* Frontend -> QA */}
        <path
          d="M 620 170 Q 660 170, 660 110 T 700 110"
          stroke={getStepStatus("qa") === "completed" ? "#10b981" : getStepStatus("qa") === "active" ? "url(#activeGrad)" : "rgba(255,255,255,0.04)"}
          strokeWidth="1.5"
          fill="none"
        />

        {/* QA -> Merge */}
        <path
          d="M 780 110 L 870 110"
          stroke={getStepStatus("merge") === "completed" ? "#10b981" : getStepStatus("merge") === "active" ? "url(#activeGrad)" : "rgba(255,255,255,0.04)"}
          strokeWidth="1.5"
          fill="none"
        />

        {/* Animated Light Pulses */}
        {getStepStatus("pm") === "active" && (
          <circle r="3" fill="#00d2ff">
            <animateMotion dur="1.2s" repeatCount="indefinite" path="M 120 110 L 210 110" />
          </circle>
        )}
        {getStepStatus("planner") === "active" && (
          <circle r="3" fill="#00d2ff">
            <animateMotion dur="1.2s" repeatCount="indefinite" path="M 290 110 L 380 110" />
          </circle>
        )}
        {getStepStatus("backend") === "active" && (
          <circle r="3" fill="#00d2ff">
            <animateMotion dur="1.8s" repeatCount="indefinite" path="M 460 110 Q 500 110, 500 50 T 540 50" />
          </circle>
        )}
        {getStepStatus("frontend") === "active" && (
          <circle r="3" fill="#00d2ff">
            <animateMotion dur="1.8s" repeatCount="indefinite" path="M 460 110 Q 500 110, 500 170 T 540 170" />
          </circle>
        )}
        {getStepStatus("qa") === "active" && (
          <>
            <circle r="3" fill="#00d2ff">
              <animateMotion dur="1.8s" repeatCount="indefinite" path="M 620 50 Q 660 50, 660 110 T 700 110" />
            </circle>
            <circle r="3" fill="#00d2ff">
              <animateMotion dur="1.8s" repeatCount="indefinite" path="M 620 170 Q 660 170, 660 110 T 700 110" />
            </circle>
          </>
        )}
        {getStepStatus("merge") === "active" && (
          <circle r="3" fill="#00d2ff">
            <animateMotion dur="1.2s" repeatCount="indefinite" path="M 780 110 L 870 110" />
          </circle>
        )}
      </svg>

      {/* Grid Layout of Nodes */}
      <div className="grid grid-cols-6 grid-rows-3 gap-y-6 gap-x-12 relative z-10 w-full max-w-[950px] min-w-[850px] h-[190px] items-center justify-items-center">
        {nodes.map((node) => {
          const status = getStepStatus(node.id);
          const styleColors = getStatusColor(status);
          const NodeIcon = node.icon;

          return (
            <div key={node.id} className={`${node.gridArea} flex flex-col items-center`}>
              <motion.div
                whileHover={{ scale: 1.04 }}
                className={`w-9 h-9 rounded-lg flex items-center justify-center border transition-all duration-300 ring-1 ${styleColors.bg} ${styleColors.border} ${styleColors.ring}`}
              >
                <NodeIcon size={14} strokeWidth={2} className={`${styleColors.iconColor} transition-colors duration-300`} />
              </motion.div>
              <div className="mt-1.5 text-center">
                <span className={`text-[10px] font-mono tracking-tight font-medium ${
                  status === "active" ? "text-[#00d2ff] font-semibold" : status === "completed" ? "text-emerald-400" : "text-zinc-500"
                }`}>
                  {node.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

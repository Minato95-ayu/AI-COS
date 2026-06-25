import React from "react";
import { Wrench, Terminal, ShieldAlert, CheckCircle, ExternalLink } from "lucide-react";
import { motion } from "motion/react";

export const ToolsPanel: React.FC = () => {
  const tools = [
    {
      name: "StrategicDashboard",
      category: "Executive / Management",
      description: "Aggregates milestone timelines, parses client specifications, and translates enterprise objectives into structural task directives.",
      dangerous: false,
      permissions: " Sophia Sterling only"
    },
    {
      name: "DelegatorTool",
      category: "Executive / Management",
      description: "Bypasses primary queue loops to delegate emergency action parameters directly to subordinate workers.",
      dangerous: false,
      permissions: "Sophia Sterling, David Vance"
    },
    {
      name: "CompilerService",
      category: "Software Development",
      description: "Triggers automated sandboxed typescript and python compile cycles to verify syntactic correctness of deliverables.",
      dangerous: true,
      permissions: "Ethan Thorne, Maya Lin"
    },
    {
      name: "IntegrationTester",
      category: "Quality Assurance",
      description: "Spawns asynchronous endpoint calls against sandbox routes to audit performance and compliance metrics.",
      dangerous: false,
      permissions: "Lucas Mercer"
    }
  ];

  return (
    <div className="flex-1 bg-zinc-950 border border-zinc-900 rounded-lg p-6 max-w-4xl mx-auto h-[620px] overflow-y-auto select-text">
      <div className="flex items-center justify-between border-b border-zinc-900 pb-3 mb-6">
        <div className="flex items-center gap-2">
          <Wrench size={16} className="text-indigo-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Dynamic System Toolkits</h3>
        </div>
        <span className="text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded font-mono">
          4 INSTALLED
        </span>
      </div>

      <div className="space-y-4">
        {tools.map((tool) => (
          <motion.div
            key={tool.name}
            className="border border-zinc-900 bg-zinc-950/40 p-4 rounded-lg flex items-start gap-4 justify-between"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <h4 className="text-sm font-bold text-white font-mono">{tool.name}</h4>
                <span className="text-[9px] font-mono uppercase bg-zinc-900 text-zinc-400 border border-zinc-800 px-1.5 py-0.5 rounded">
                  {tool.category}
                </span>
                {tool.dangerous && (
                  <span className="text-[9px] font-mono uppercase bg-rose-500/10 text-rose-400 border border-rose-500/20 px-1.5 py-0.5 rounded flex items-center gap-1">
                    <ShieldAlert size={10} />
                    Dangerous
                  </span>
                )}
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed max-w-2xl">{tool.description}</p>
            </div>

            <div className="text-right shrink-0">
              <span className="text-[8px] text-zinc-500 font-mono block">CLEARANCE</span>
              <span className="text-[10px] text-zinc-300 font-semibold font-mono">{tool.permissions}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

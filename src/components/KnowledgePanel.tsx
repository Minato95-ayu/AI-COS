import React, { useState } from "react";
import { BookOpen, Search, ArrowRight, Layers, HelpCircle, Code } from "lucide-react";
import { ARCHITECTURE_DATA, ModuleSpec } from "../data/architecture";
import { motion } from "motion/react";

export const KnowledgePanel: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedModule, setSelectedModule] = useState<ModuleSpec | null>(ARCHITECTURE_DATA[0]);

  const filteredModules = ARCHITECTURE_DATA.filter(
    (m) =>
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 bg-zinc-950 border border-zinc-900 rounded-lg flex h-[620px] overflow-hidden select-text">
      {/* Module Directory */}
      <div className="w-80 border-r border-zinc-900 flex flex-col bg-zinc-950 shrink-0">
        <div className="p-4 border-b border-zinc-900 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <BookOpen size={14} className="text-indigo-400" />
            <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">System Knowledge Graph</span>
          </div>

          {/* Search box */}
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-500" />
            <input
              type="text"
              placeholder="Search specifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded px-8 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500/50"
            />
          </div>
        </div>

        {/* List of modules */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
          {filteredModules.map((m) => (
            <button
              key={m.id}
              onClick={() => setSelectedModule(m)}
              className={`w-full text-left p-3 rounded-lg border transition cursor-pointer flex flex-col gap-1.5 ${
                selectedModule?.id === m.id
                  ? "bg-zinc-900 border-zinc-800 text-white"
                  : "bg-transparent border-transparent hover:bg-zinc-900/30 text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold font-sans">{m.name}</span>
                <span className="text-[8px] font-mono uppercase bg-zinc-950 text-zinc-500 border border-zinc-900 px-1 py-0.2 rounded">
                  {m.category}
                </span>
              </div>
              <p className="text-[10px] text-zinc-500 leading-snug line-clamp-2">{m.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Module Detailed Spec View */}
      <div className="flex-1 flex flex-col bg-zinc-950 overflow-y-auto custom-scrollbar p-6">
        {selectedModule ? (
          <div className="space-y-6">
            {/* Header */}
            <div className="border-b border-zinc-900 pb-4">
              <div className="flex items-center gap-2 text-zinc-500 text-[10px] font-mono uppercase tracking-wider mb-1">
                <span>Core Module Specification</span>
                <span>·</span>
                <span className="text-indigo-400">{selectedModule.category}</span>
              </div>
              <h3 className="text-lg font-bold text-white font-sans">{selectedModule.name}</h3>
              <code className="text-xs text-zinc-500 font-mono mt-1 block">{selectedModule.path}</code>
            </div>

            {/* Description and Design Pattern */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">Description</span>
                <p className="text-xs text-zinc-300 leading-relaxed font-sans">{selectedModule.description}</p>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">Design Architecture</span>
                <div className="bg-zinc-950/40 border border-zinc-900 p-3 rounded-lg space-y-1">
                  <span className="text-xs font-bold text-white block">{selectedModule.designPattern}</span>
                  <p className="text-[10px] text-zinc-500 font-sans leading-normal">
                    This architectural pattern governs module instantiation, event routing, and state boundaries.
                  </p>
                </div>
              </div>
            </div>

            {/* Interfaces & UML */}
            <div className="space-y-3">
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">Exposed Abstract Interfaces</span>
              <div className="flex flex-wrap gap-2">
                {selectedModule.interfaces.map((i) => (
                  <span
                    key={i}
                    className="text-[10px] font-mono bg-zinc-950 text-indigo-400 border border-zinc-900 rounded px-2.5 py-1"
                  >
                    interface {i}
                  </span>
                ))}
              </div>
            </div>

            {/* UML Text Diagram block */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">UML Domain Class Map</span>
                <span className="text-[9px] font-mono text-zinc-600">Generated via PlantUML Specifications</span>
              </div>
              <pre className="bg-zinc-950 border border-zinc-900 p-4 rounded-lg font-mono text-xs text-zinc-400 overflow-auto">
                {selectedModule.uml}
              </pre>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-zinc-600 italic">
            <HelpCircle size={20} className="mb-2 text-zinc-700 animate-pulse" />
            <span>Select a core system module to query the underlying AI-COS specifications.</span>
          </div>
        )}
      </div>
    </div>
  );
};

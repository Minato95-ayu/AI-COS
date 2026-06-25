import React, { useState, useEffect } from "react";
import {
  Brain,
  CheckCircle2,
  Lock,
  Unlock,
  Clock,
  User,
  Cpu,
  Layers,
  Activity,
  Plus,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  ListChecks,
  GitBranch,
  Compass,
  FileText,
  History,
  CornerDownRight,
  CheckSquare,
  Square,
  Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ChecklistItem {
  text: string;
  checked: boolean;
}

interface Subtask {
  title: string;
  status: string;
  checklist: ChecklistItem[];
}

interface Task {
  id: string;
  title: string;
  description: string;
  status: string; // COMPLETED, IN_PROGRESS, PENDING, BLOCKED
  priority: string;
  started: string | null;
  finished: string | null;
  estimatedTime: string;
  dependencies: string[];
  relatedFiles: string[];
  assignedEmployee: string;
  assignedModel: string;
  assignedTools: string[];
  result: string | null;
  review: string | null;
  nextTask: string;
  subtasks?: Subtask[];
}

interface Section {
  name: string;
  status: string;
  progress: number;
  tasks: Task[];
}

interface Branch {
  name: string;
  status: string;
  progress: number;
  sections: Section[];
}

interface Phase {
  name: string;
  status: string;
  progress: number;
  branches: Branch[];
}

interface ProjectMetadata {
  name: string;
  vision: string;
  description: string;
  version: string;
  currentPhase: string;
  currentBranch: string;
  currentSection: string;
  currentTask: string;
  currentSubtask: string;
  progress: number;
  startedDate: string;
  updatedDate: string;
  owner: string;
  priority: string;
  risk: string;
  completionStatus: string;
  reviewRequired: boolean;
  blocked: boolean;
  notes: string;
  parallelExecutionEnabled?: boolean;
  nextRecommendation?: {
    taskId: string;
    title: string;
    phase: string;
    branch: string;
    description: string;
    assignedEmployee: string;
    priority: string;
  } | null;
}

interface TimelineEvent {
  time: string;
  event: string;
  details: string;
}

interface Decision {
  id: string;
  reason: string;
  alternativesConsidered: string[];
  chosenSolution: string;
  tradeoffs: string;
  date: string;
  author: string;
  affectedModules: string[];
}

interface ChangeLogEntry {
  timestamp: string;
  author: string;
  action: string;
}

interface ProjectBrainState {
  project: ProjectMetadata;
  phases: Phase[];
  timeline: TimelineEvent[];
  decisionMemory: Decision[];
  changeLog: ChangeLogEntry[];
}

interface ProjectBrainPanelProps {
  onPreFillPrompt?: (prompt: string) => void;
}

export const ProjectBrainPanel: React.FC<ProjectBrainPanelProps> = ({ onPreFillPrompt }) => {
  const [brainData, setBrainData] = useState<ProjectBrainState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Accordion open states
  const [expandedPhases, setExpandedPhases] = useState<Record<string, boolean>>({
    "AI Integration": true
  });
  const [expandedBranches, setExpandedBranches] = useState<Record<string, boolean>>({
    "Ollama Core Integration": true
  });
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    "Streaming Core": true
  });
  const [expandedTasks, setExpandedTasks] = useState<Record<string, boolean>>({});

  // Active sub-sections of Project Brain Panel
  const [activeSubTab, setActiveSubTab] = useState<"tree" | "decisions" | "timeline" | "changelog">("tree");

  // Decision formulation form states
  const [showAddDecision, setShowAddDecision] = useState(false);
  const [newReason, setNewReason] = useState("");
  const [newAlternatives, setNewAlternatives] = useState("");
  const [newChosen, setNewChosen] = useState("");
  const [newTradeoffs, setNewTradeoffs] = useState("");
  const [newAuthor, setNewAuthor] = useState("");
  const [newModules, setNewModules] = useState("");

  // Timeline form states
  const [showAddTimeline, setShowAddTimeline] = useState(false);
  const [newTimelineEvent, setNewTimelineEvent] = useState("");
  const [newTimelineDetails, setNewTimelineDetails] = useState("");

  // Load brain state
  const fetchBrainData = async () => {
    try {
      const res = await fetch("/api/project-brain");
      if (!res.ok) {
        throw new Error(`Failed to load Project Brain state: ${res.statusText}`);
      }
      const data = await res.json();
      setBrainData(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrainData();
    const interval = setInterval(fetchBrainData, 4000); // Polling synchronization
    return () => clearInterval(interval);
  }, []);

  const togglePhase = (phaseName: string) => {
    setExpandedPhases((prev) => ({ ...prev, [phaseName]: !prev[phaseName] }));
  };

  const toggleBranch = (branchName: string) => {
    setExpandedBranches((prev) => ({ ...prev, [branchName]: !prev[branchName] }));
  };

  const toggleSection = (sectionName: string) => {
    setExpandedSections((prev) => ({ ...prev, [sectionName]: !prev[sectionName] }));
  };

  const toggleTaskDetail = (taskId: string) => {
    setExpandedTasks((prev) => ({ ...prev, [taskId]: !prev[taskId] }));
  };

  const handleUpdateTaskStatus = async (taskId: string, status: string) => {
    try {
      const res = await fetch("/api/project-brain/task/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId, status })
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to update task status.");
      }
      const data = await res.json();
      setBrainData(data.state);
      setActionError(null);
    } catch (err: any) {
      setActionError(err.message);
      setTimeout(() => setActionError(null), 8000);
    }
  };

  const handleToggleChecklist = async (taskId: string, text: string, checked: boolean) => {
    try {
      const res = await fetch("/api/project-brain/task/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId, checklistText: text, checklistChecked: checked })
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to toggle checklist item.");
      }
      const data = await res.json();
      setBrainData(data.state);
      setActionError(null);
    } catch (err: any) {
      setActionError(err.message);
      setTimeout(() => setActionError(null), 8000);
    }
  };

  const handleToggleParallel = async () => {
    if (!brainData) return;
    const nextVal = !brainData.project.parallelExecutionEnabled;
    try {
      const res = await fetch("/api/project-brain/configure", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ parallelExecutionEnabled: nextVal })
      });
      if (res.ok) {
        const data = await res.json();
        setBrainData((prev) => prev ? { ...prev, project: data.project } : null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddDecision = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/project-brain/decision/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reason: newReason,
          alternativesConsidered: newAlternatives.split("\n").filter(Boolean),
          chosenSolution: newChosen,
          tradeoffs: newTradeoffs,
          author: newAuthor,
          affectedModules: newModules.split(",").map(s => s.trim()).filter(Boolean)
        })
      });
      if (res.ok) {
        setShowAddDecision(false);
        setNewReason("");
        setNewAlternatives("");
        setNewChosen("");
        setNewTradeoffs("");
        setNewAuthor("");
        setNewModules("");
        fetchBrainData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddTimeline = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/project-brain/timeline/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event: newTimelineEvent, details: newTimelineDetails })
      });
      if (res.ok) {
        setShowAddTimeline(false);
        setNewTimelineEvent("");
        setNewTimelineDetails("");
        fetchBrainData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20 text-zinc-500 font-mono text-xs gap-3">
        <Brain size={24} className="text-[#00d2ff] animate-pulse" />
        <span>Synchronizing with Project Brain core state...</span>
      </div>
    );
  }

  if (error || !brainData) {
    return (
      <div className="flex-1 border border-rose-950 bg-rose-950/20 rounded-2xl p-6 text-center text-rose-400 font-mono text-xs max-w-xl mx-auto space-y-3">
        <AlertTriangle size={24} className="mx-auto" />
        <h3 className="font-semibold text-sm">Failed to Bind Project Brain</h3>
        <p className="text-[10px] leading-relaxed text-rose-300">
          {error || "Project state is structurally corrupted or server is currently compiling dev dependencies."}
        </p>
      </div>
    );
  }

  const p = brainData.project;

  return (
    <div className="flex-1 flex flex-col gap-6 p-1 md:p-3 font-sans">
      
      {/* Action Error Notification Toast */}
      <AnimatePresence>
        {actionError && (
          <motion.div
            initial={{ opacity: 0, y: -20, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -20, height: 0 }}
            className="bg-rose-500/10 border border-rose-500/30 text-rose-300 p-3.5 rounded-xl font-mono text-[11px] flex items-start gap-2.5 relative overflow-hidden shrink-0"
          >
            <div className="absolute top-0 left-0 bottom-0 w-1 bg-rose-500" />
            <AlertTriangle size={14} className="text-rose-400 mt-0.5 shrink-0" />
            <div className="flex-1">
              <span className="font-bold block uppercase tracking-wider text-[9px] text-rose-400">OPERATION WARNING</span>
              <p className="mt-0.5">{actionError}</p>
            </div>
            <button 
              onClick={() => setActionError(null)}
              className="text-rose-400 hover:text-white text-[10px] uppercase font-bold tracking-widest cursor-pointer hover:bg-rose-500/20 px-2 py-0.5 rounded"
            >
              Close
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. PROJECT INTELLIGENCE DASHBOARD BAR */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Core Metadata Card */}
        <div className="lg:col-span-2 bg-[#111318]/60 border border-[rgba(255,255,255,0.06)] rounded-2xl p-5 shadow-[0_4px_30px_rgba(0,0,0,0.3)] relative overflow-hidden backdrop-blur-sm">
          <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#00d2ff]/25 to-transparent" />
          
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Brain size={16} className="text-[#00d2ff]" />
                <h2 className="text-[15px] font-semibold text-zinc-100 font-display uppercase tracking-wider">{p.name}</h2>
                <span className="text-[9px] bg-[#00d2ff]/10 text-[#00d2ff] border border-[#00d2ff]/20 px-1.5 py-0.2 rounded font-mono font-bold">
                  v{p.version}
                </span>
              </div>
              <p className="text-[10.5px] text-[#00d2ff]/80 font-mono uppercase tracking-widest">{p.vision}</p>
            </div>
            
            <div className="text-right">
              <span className="text-[9px] text-zinc-500 font-mono block uppercase">Global Progress</span>
              <span className="text-2xl font-bold font-mono text-white tracking-tighter">
                {p.progress}%
              </span>
            </div>
          </div>

          <p className="text-xs text-zinc-400 leading-relaxed mb-5 font-sans">
            {p.description}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-[rgba(255,255,255,0.04)] pt-4 text-[10.5px] font-mono">
            <div>
              <span className="text-zinc-500 block text-[9px] uppercase">Active Phase</span>
              <span className="text-zinc-200 font-semibold flex items-center gap-1 mt-0.5">
                <Layers size={10} className="text-amber-500" /> {p.currentPhase}
              </span>
            </div>
            <div>
              <span className="text-zinc-500 block text-[9px] uppercase">Active Branch</span>
              <span className="text-zinc-200 font-semibold flex items-center gap-1 mt-0.5">
                <GitBranch size={10} className="text-purple-400" /> {p.currentBranch}
              </span>
            </div>
            <div>
              <span className="text-zinc-500 block text-[9px] uppercase">Risk Coefficient</span>
              <span className={`font-semibold uppercase tracking-tight block mt-0.5 ${p.risk === "HIGH" ? "text-rose-400" : p.risk === "MEDIUM" ? "text-amber-400" : "text-emerald-400"}`}>
                {p.risk} Sector
              </span>
            </div>
            <div>
              <span className="text-zinc-500 block text-[9px] uppercase">Updated Date</span>
              <span className="text-zinc-400 block mt-0.5 truncate">
                {new Date(p.updatedDate).toLocaleTimeString()}
              </span>
            </div>
          </div>
        </div>

        {/* Operational Constraints Panel */}
        <div className="bg-[#111318]/40 border border-[rgba(255,255,255,0.06)] rounded-2xl p-5 flex flex-col justify-between shadow-[0_4px_30px_rgba(0,0,0,0.3)] backdrop-blur-sm font-mono text-[11px]">
          <div>
            <div className="text-[10px] uppercase text-zinc-500 tracking-wider font-bold mb-3 flex items-center justify-between">
              <span>Branch Execution Lock</span>
              <span className={`text-[8.5px] px-1.5 py-0.2 rounded font-normal ${p.parallelExecutionEnabled ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"}`}>
                {p.parallelExecutionEnabled ? "PARALLEL_OK" : "MUTEX_LOCKED"}
              </span>
            </div>

            <p className="text-zinc-400 text-[10px] leading-relaxed mb-4 font-sans">
              Only one active branch may exist within a single phase unless parallel execution is explicitly toggled by the system operator.
            </p>
          </div>

          <div className="space-y-2 border-t border-[rgba(255,255,255,0.04)] pt-3.5">
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-zinc-400">Lock State:</span>
              <strong className="text-zinc-200 flex items-center gap-1">
                {p.parallelExecutionEnabled ? (
                  <><Unlock size={11} className="text-emerald-400" /> Parallel Branches Unlocked</>
                ) : (
                  <><Lock size={11} className="text-amber-400" /> Mutex Single-Branch Lock</>
                )}
              </strong>
            </div>

            <button
              onClick={handleToggleParallel}
              className={`w-full py-2 border rounded-xl font-bold transition-all duration-200 text-center cursor-pointer ${
                p.parallelExecutionEnabled
                  ? "bg-rose-500/5 border-rose-500/20 hover:bg-rose-500/10 text-rose-400"
                  : "bg-[#00d2ff]/5 border-[#00d2ff]/20 hover:bg-[#00d2ff]/10 text-[#00d2ff]"
              }`}
            >
              {p.parallelExecutionEnabled ? "ENABLE SINGLE-BRANCH MUTEX" : "ENABLE PARALLEL EXECUTION"}
            </button>
          </div>
        </div>

      </div>

      {/* 2. AUTOMATIC RECOMMENDATION ROUTER */}
      {p.nextRecommendation && (
        <div className="bg-gradient-to-r from-[#00d2ff]/5 via-zinc-900/40 to-transparent border border-[#00d2ff]/25 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 font-mono">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#00d2ff]/10 text-[#00d2ff] border border-[#00d2ff]/20 flex items-center justify-center shrink-0">
              <Compass size={18} className="animate-spin-slow text-[#00d2ff]" />
            </div>
            <div>
              <span className="text-[8.5px] bg-[#00d2ff]/10 border border-[#00d2ff]/20 text-[#00d2ff] px-2 py-0.5 rounded font-bold uppercase block w-max mb-1.5">
                NEXT LOGICAL RECOMMENDATION
              </span>
              <h3 className="text-xs font-bold text-zinc-100 flex items-center gap-1.5">
                {p.nextRecommendation.title}
                <span className="text-[9px] text-zinc-500 font-normal">({p.nextRecommendation.phase} &rarr; {p.nextRecommendation.branch})</span>
              </h3>
              <p className="text-[10.5px] text-zinc-400 mt-1 font-sans">
                {p.nextRecommendation.description}
              </p>
            </div>
          </div>
          
          {onPreFillPrompt && (
            <button
              onClick={() => onPreFillPrompt?.(p.nextRecommendation?.title || "")}
              className="px-4 py-2 bg-[#00d2ff] hover:bg-[#00b2d6] text-[#09090B] font-bold text-xs rounded-xl shadow-[0_0_15px_rgba(0,210,255,0.15)] transition cursor-pointer flex items-center gap-1.5 shrink-0 self-end sm:self-center"
            >
              <Sparkles size={11} fill="currentColor" />
              <span>DISPATCH WORKER</span>
            </button>
          )}
        </div>
      )}

      {/* 3. SUB-PANEL NAVIGATION */}
      <div className="flex gap-2 border-b border-[rgba(255,255,255,0.06)] pb-1 shrink-0 font-mono">
        <button
          onClick={() => setActiveSubTab("tree")}
          className={`flex items-center gap-1.5 px-3 py-2 text-[10.5px] font-bold border-b-2 transition cursor-pointer ${
            activeSubTab === "tree" ? "border-[#00d2ff] text-[#00d2ff]" : "border-transparent text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <ListChecks size={12} />
          VISUAL TREE VIEW ({p.progress}% Overall)
        </button>
        <button
          onClick={() => setActiveSubTab("decisions")}
          className={`flex items-center gap-1.5 px-3 py-2 text-[10.5px] font-bold border-b-2 transition cursor-pointer ${
            activeSubTab === "decisions" ? "border-[#00d2ff] text-[#00d2ff]" : "border-transparent text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <Brain size={12} />
          DECISION MEMORY ({brainData.decisionMemory.length})
        </button>
        <button
          onClick={() => setActiveSubTab("timeline")}
          className={`flex items-center gap-1.5 px-3 py-2 text-[10.5px] font-bold border-b-2 transition cursor-pointer ${
            activeSubTab === "timeline" ? "border-[#00d2ff] text-[#00d2ff]" : "border-transparent text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <Clock size={12} />
          PROJECT TIMELINE ({brainData.timeline.length})
        </button>
        <button
          onClick={() => setActiveSubTab("changelog")}
          className={`flex items-center gap-1.5 px-3 py-2 text-[10.5px] font-bold border-b-2 transition cursor-pointer ${
            activeSubTab === "changelog" ? "border-[#00d2ff] text-[#00d2ff]" : "border-transparent text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <History size={12} />
          CHANGE LOG
        </button>
      </div>

      {/* 4. ACTIVE SUB-PANEL BODY */}
      <div className="flex-1 overflow-visible">
        
        {/* TAB 4.1: VISUAL TREE VIEW */}
        {activeSubTab === "tree" && (
          <div className="space-y-4 font-mono text-[11px] leading-relaxed">
            
            {brainData.phases.map((phase) => {
              const isPhaseExpanded = !!expandedPhases[phase.name];
              const isPhaseCompleted = phase.status === "COMPLETED";
              const isPhaseActive = phase.status === "IN_PROGRESS";

              return (
                <div key={phase.name} className="border border-[rgba(255,255,255,0.04)] rounded-xl bg-[#111318]/20 overflow-hidden">
                  
                  {/* Phase Row */}
                  <div
                    onClick={() => togglePhase(phase.name)}
                    className={`flex items-center justify-between px-4 py-3 cursor-pointer transition select-none ${
                      isPhaseActive ? "bg-[#16181D]" : "hover:bg-[#16181D]/40"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="shrink-0">
                        {isPhaseCompleted ? (
                          <CheckCircle2 size={13} className="text-emerald-400" />
                        ) : isPhaseActive ? (
                          <div className="w-3.5 h-3.5 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
                        ) : (
                          <div className="w-3.5 h-3.5 rounded-full border border-zinc-700 bg-zinc-900/50" />
                        )}
                      </div>
                      
                      <span className={`text-[12px] font-bold uppercase tracking-wide ${isPhaseCompleted ? "text-zinc-400" : "text-zinc-100"}`}>
                        {phase.name}
                      </span>
                      <span className="text-[10px] text-zinc-500">({phase.progress}%)</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`text-[9.5px] px-2 py-0.5 rounded font-semibold ${
                        isPhaseCompleted ? "bg-emerald-500/10 text-emerald-400" : isPhaseActive ? "bg-amber-500/10 text-amber-400" : "bg-zinc-800 text-zinc-500"
                      }`}>
                        {phase.status}
                      </span>
                      {isPhaseExpanded ? <ChevronDown size={14} className="text-zinc-500" /> : <ChevronRight size={14} className="text-zinc-500" />}
                    </div>
                  </div>

                  {/* Phase Content (Branches) */}
                  <AnimatePresence initial={false}>
                    {isPhaseExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="border-t border-[rgba(255,255,255,0.03)] p-3 space-y-3 bg-[#0a0c10]/30"
                      >
                        {phase.branches.length === 0 ? (
                          <div className="text-zinc-600 pl-6 py-2 italic font-sans text-xs">No active branches mapped to this lifecycle tier.</div>
                        ) : (
                          phase.branches.map((branch) => {
                            const isBranchExpanded = !!expandedBranches[branch.name];
                            const isBranchCompleted = branch.status === "COMPLETED";
                            const isBranchActive = branch.status === "IN_PROGRESS";

                            return (
                              <div key={branch.name} className="border border-[rgba(255,255,255,0.03)] rounded-xl bg-[#111318]/45 p-2.5">
                                
                                {/* Branch Header */}
                                <div
                                  onClick={() => toggleBranch(branch.name)}
                                  className="flex items-center justify-between cursor-pointer py-1.5 px-2 select-none hover:text-[#00d2ff] transition"
                                >
                                  <div className="flex items-center gap-2">
                                    <GitBranch size={12} className={isBranchActive ? "text-amber-400 animate-pulse" : "text-zinc-500"} />
                                    <span className={`font-semibold text-[11px] ${isBranchCompleted ? "text-zinc-400" : "text-zinc-200"}`}>
                                      {branch.name}
                                    </span>
                                    <span className="text-[9.5px] text-zinc-600 font-normal">({branch.progress}%)</span>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <span className={`text-[8.5px] px-1.5 py-0.2 rounded font-mono ${
                                      isBranchCompleted ? "text-emerald-400 bg-emerald-500/5" : isBranchActive ? "text-amber-400 bg-amber-500/5" : "text-zinc-600"
                                    }`}>
                                      {branch.status}
                                    </span>
                                    {isBranchExpanded ? <ChevronDown size={11} className="text-zinc-600" /> : <ChevronRight size={11} className="text-zinc-600" />}
                                  </div>
                                </div>

                                {/* Branch Content (Sections) */}
                                {isBranchExpanded && (
                                  <div className="mt-2.5 pl-3 border-l border-[rgba(255,255,255,0.04)] space-y-2.5">
                                    {branch.sections.length === 0 ? (
                                      <div className="text-zinc-700 italic pl-3 py-1">No subsections formulated yet.</div>
                                    ) : (
                                      branch.sections.map((section) => {
                                        const isSectionExpanded = !!expandedSections[section.name];
                                        const isSectionCompleted = section.status === "COMPLETED";
                                        const isSectionActive = section.status === "IN_PROGRESS";

                                        return (
                                          <div key={section.name} className="space-y-1">
                                            
                                            {/* Section Row */}
                                            <div
                                              onClick={() => toggleSection(section.name)}
                                              className="flex items-center justify-between cursor-pointer py-1 hover:text-zinc-100 px-1 text-zinc-400 select-none"
                                            >
                                              <div className="flex items-center gap-1.5">
                                                <Layers size={11} className="text-zinc-600" />
                                                <span className="font-semibold text-[10.5px]">
                                                  {section.name}
                                                </span>
                                                <span className="text-[9px] text-zinc-600 font-normal">({section.progress}%)</span>
                                              </div>
                                              <div className="flex items-center gap-2">
                                                {isSectionExpanded ? <ChevronDown size={11} className="text-zinc-700" /> : <ChevronRight size={11} className="text-zinc-700" />}
                                              </div>
                                            </div>

                                            {/* Tasks in Section */}
                                            {isSectionExpanded && (
                                              <div className="pl-3 py-1 border-l border-[rgba(255,255,255,0.03)] space-y-2">
                                                {section.tasks.length === 0 ? (
                                                  <div className="text-zinc-800 italic pl-3">Awaiting task compiling.</div>
                                                ) : (
                                                  section.tasks.map((task) => {
                                                    const isTaskDetailOpen = !!expandedTasks[task.id];
                                                    const isCompleted = task.status === "COMPLETED";
                                                    const isActive = task.status === "IN_PROGRESS";
                                                    const isBlocked = task.status === "BLOCKED";

                                                    return (
                                                      <div key={task.id} className="border border-[rgba(255,255,255,0.02)] rounded-lg bg-[#111318]/20 overflow-hidden">
                                                        
                                                        {/* Task row */}
                                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2 hover:bg-[#16181D]/30 transition">
                                                          <div className="flex items-start gap-2 cursor-pointer" onClick={() => toggleTaskDetail(task.id)}>
                                                            <div className="mt-0.5">
                                                              {isCompleted ? (
                                                                <CheckCircle2 size={12} className="text-emerald-500" />
                                                              ) : isActive ? (
                                                                <div className="w-3 h-3 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
                                                              ) : isBlocked ? (
                                                                <Lock size={12} className="text-rose-400" />
                                                              ) : (
                                                                <div className="w-3 h-3 rounded-full border border-zinc-700 bg-zinc-900/40" />
                                                              )}
                                                            </div>

                                                            <div>
                                                              <h4 className={`text-[11px] font-bold ${isCompleted ? "text-zinc-500 line-through" : "text-zinc-200"}`}>
                                                                {task.title}
                                                              </h4>
                                                              <p className="text-[10px] text-zinc-500 leading-normal max-w-lg font-sans">
                                                                {task.description}
                                                              </p>
                                                            </div>
                                                          </div>

                                                          {/* Task state controls */}
                                                          <div className="flex items-center gap-2 self-end sm:self-center pl-5 sm:pl-0">
                                                            <span className={`text-[8px] font-bold px-1.5 py-0.2 rounded uppercase ${
                                                              isCompleted ? "text-emerald-400 bg-emerald-500/10" : isActive ? "text-amber-400 bg-amber-500/10" : isBlocked ? "text-rose-400 bg-rose-500/10" : "text-zinc-400 bg-zinc-800"
                                                            }`}>
                                                              {task.status}
                                                            </span>

                                                            {/* Operator Quick status toggle overrides */}
                                                            <select
                                                              value={task.status}
                                                              onChange={(e) => handleUpdateTaskStatus(task.id, e.target.value)}
                                                              className="bg-zinc-900 border border-[rgba(255,255,255,0.06)] text-[9px] text-zinc-400 rounded-md px-1.5 py-0.5 cursor-pointer font-sans focus:outline-none focus:border-[#00d2ff]/40"
                                                            >
                                                              <option value="PENDING">Pending</option>
                                                              <option value="IN_PROGRESS">Executing</option>
                                                              <option value="COMPLETED">Complete</option>
                                                              <option value="BLOCKED">Blocked</option>
                                                            </select>
                                                          </div>
                                                        </div>

                                                        {/* Task Details Dropdown */}
                                                        {isTaskDetailOpen && (
                                                          <div className="p-3 bg-[#0c0d10] border-t border-[rgba(255,255,255,0.03)] grid grid-cols-1 md:grid-cols-2 gap-4 text-[10px] text-zinc-400">
                                                            <div className="space-y-2">
                                                              <div className="grid grid-cols-2 gap-2">
                                                                <div>
                                                                  <span className="text-zinc-600 block text-[8px] uppercase">Task ID</span>
                                                                  <span className="text-zinc-300 font-semibold">{task.id}</span>
                                                                </div>
                                                                <div>
                                                                  <span className="text-zinc-600 block text-[8px] uppercase">Priority</span>
                                                                  <span className="text-zinc-300 font-semibold">{task.priority}</span>
                                                                </div>
                                                                <div>
                                                                  <span className="text-zinc-600 block text-[8px] uppercase">Est Time</span>
                                                                  <span className="text-zinc-300 font-semibold">{task.estimatedTime}</span>
                                                                </div>
                                                                <div>
                                                                  <span className="text-zinc-600 block text-[8px] uppercase">Assigned Staff</span>
                                                                  <span className="text-zinc-300 font-semibold flex items-center gap-1">
                                                                    <User size={10} className="text-[#00d2ff]" />
                                                                    {task.assignedEmployee}
                                                                  </span>
                                                                </div>
                                                                <div>
                                                                  <span className="text-zinc-600 block text-[8px] uppercase">Active Matrix</span>
                                                                  <span className="text-[#00d2ff] font-semibold flex items-center gap-1">
                                                                    <Cpu size={10} />
                                                                    {task.assignedModel}
                                                                  </span>
                                                                </div>
                                                                <div>
                                                                  <span className="text-zinc-600 block text-[8px] uppercase">Tools Registered</span>
                                                                  <span className="text-zinc-300 font-semibold">
                                                                    {task.assignedTools.length > 0 ? task.assignedTools.join(", ") : "None"}
                                                                  </span>
                                                                </div>
                                                              </div>

                                                              {task.dependencies && task.dependencies.length > 0 && (
                                                                <div className="border-t border-[rgba(255,255,255,0.03)] pt-2">
                                                                  <span className="text-zinc-600 block text-[8px] uppercase mb-0.5">Blocked by Dependencies:</span>
                                                                  <div className="flex flex-wrap gap-1 mt-1">
                                                                    {task.dependencies.map((dep) => (
                                                                      <span key={dep} className="px-1.5 py-0.2 bg-zinc-900 border border-[rgba(255,255,255,0.05)] rounded text-[8.5px] text-zinc-500 font-mono">
                                                                        {dep}
                                                                      </span>
                                                                    ))}
                                                                  </div>
                                                                </div>
                                                              )}
                                                            </div>

                                                            {/* Subtasks checklists & Deliverable logs */}
                                                            <div className="space-y-3.5 border-t md:border-t-0 md:border-l border-[rgba(255,255,255,0.04)] md:pl-4">
                                                              
                                                              {/* Interactive Checklist Items */}
                                                              {task.subtasks && task.subtasks.map((sub, sIdx) => (
                                                                <div key={sIdx} className="space-y-1.5">
                                                                  <div className="text-zinc-500 font-bold text-[9px] uppercase tracking-wide flex items-center gap-1.5">
                                                                    <CornerDownRight size={10} />
                                                                    {sub.title}
                                                                  </div>
                                                                  
                                                                  <div className="space-y-1 pl-2">
                                                                    {sub.checklist && sub.checklist.map((item, iIdx) => (
                                                                      <div
                                                                        key={iIdx}
                                                                        onClick={() => handleToggleChecklist(task.id, item.text, !item.checked)}
                                                                        className="flex items-center gap-2 cursor-pointer text-zinc-400 hover:text-zinc-200 transition font-sans text-[10.5px] py-0.5 select-none"
                                                                      >
                                                                        {item.checked ? (
                                                                          <CheckSquare size={11} className="text-[#00d2ff]" />
                                                                        ) : (
                                                                          <Square size={11} className="text-zinc-600" />
                                                                        )}
                                                                        <span className={item.checked ? "line-through text-zinc-600 font-mono" : ""}>{item.text}</span>
                                                                      </div>
                                                                    ))}
                                                                  </div>
                                                                </div>
                                                              ))}

                                                              {/* Task result outputs */}
                                                              {task.result && (
                                                                <div className="border-t border-[rgba(255,255,255,0.03)] pt-2 space-y-1">
                                                                  <span className="text-emerald-500 block text-[8px] uppercase tracking-wider font-bold">COMPILER DELIVERABLE OUTPUT:</span>
                                                                  <p className="bg-[#07080a] p-2 rounded border border-[rgba(255,255,255,0.03)] text-zinc-300 leading-normal font-sans text-[10px]">
                                                                    {task.result}
                                                                  </p>
                                                                </div>
                                                              )}
                                                            </div>
                                                          </div>
                                                        )}

                                                      </div>
                                                    );
                                                  })
                                                )}
                                              </div>
                                            )}
                                          </div>
                                        );
                                      })
                                    )}
                                  </div>
                                )}

                              </div>
                            );
                          })
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                </div>
              );
            })}

          </div>
        )}

        {/* TAB 4.2: DECISION MEMORY */}
        {activeSubTab === "decisions" && (
          <div className="space-y-4 font-mono text-[11px] leading-relaxed">
            
            <div className="flex justify-between items-center bg-[#111318]/40 border border-[rgba(255,255,255,0.04)] rounded-2xl p-4">
              <div>
                <h3 className="font-semibold text-zinc-100 flex items-center gap-1.5 text-xs uppercase">
                  <Brain size={13} className="text-[#00d2ff]" /> Architectural Decision Memory
                </h3>
                <p className="text-zinc-500 text-[10px] leading-relaxed font-sans mt-1">
                  Permanently record major technology stacks, API bindings, schema models, and tradeoffs chosen by the system architecture team.
                </p>
              </div>

              <button
                onClick={() => setShowAddDecision(!showAddDecision)}
                className="px-3 py-1.5 bg-zinc-900 border border-[rgba(255,255,255,0.06)] hover:bg-[#16181D] hover:text-[#00d2ff] rounded-xl text-zinc-400 hover:text-white transition cursor-pointer flex items-center gap-1 shrink-0 text-[10px] font-bold"
              >
                <Plus size={11} />
                <span>LOG ARCHITECTURAL CHOICE</span>
              </button>
            </div>

            {/* FORM TO ADD NEW DECISION */}
            {showAddDecision && (
              <form onSubmit={handleAddDecision} className="bg-[#111318]/60 border border-[#00d2ff]/20 rounded-2xl p-5 space-y-4 max-w-xl mx-auto">
                <div className="text-[10px] uppercase text-[#00d2ff] tracking-wider font-bold">Log Architectural Choice Formulation</div>
                
                <div className="space-y-1">
                  <label className="text-[9px] text-zinc-500 uppercase block">Contextual Reason</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., SQLite selection for local multi-agent storage caching constraints"
                    value={newReason}
                    onChange={(e) => setNewReason(e.target.value)}
                    className="w-full bg-[#0c0d10] border border-[rgba(255,255,255,0.06)] focus:border-[#00d2ff]/40 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:ring-1 focus:ring-[#00d2ff]/10"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] text-zinc-500 uppercase block">Decision Author</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., Sophia Sterling"
                      value={newAuthor}
                      onChange={(e) => setNewAuthor(e.target.value)}
                      className="w-full bg-[#0c0d10] border border-[rgba(255,255,255,0.06)] focus:border-[#00d2ff]/40 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:ring-1 focus:ring-[#00d2ff]/10"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] text-zinc-500 uppercase block">Affected Modules (comma separated)</label>
                    <input
                      type="text"
                      placeholder="e.g., server.ts, src/types.ts"
                      value={newModules}
                      onChange={(e) => setNewModules(e.target.value)}
                      className="w-full bg-[#0c0d10] border border-[rgba(255,255,255,0.06)] focus:border-[#00d2ff]/40 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:ring-1 focus:ring-[#00d2ff]/10"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] text-zinc-500 uppercase block">Chosen Solution Definition</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Establish zero-config JSON persistent file system stores under src/data"
                    value={newChosen}
                    onChange={(e) => setNewChosen(e.target.value)}
                    className="w-full bg-[#0c0d10] border border-[rgba(255,255,255,0.06)] focus:border-[#00d2ff]/40 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] text-zinc-500 uppercase block">Alternatives Considered (one per line)</label>
                  <textarea
                    rows={2}
                    placeholder="e.g., PostgreSQL local pool daemon&#10;In-memory Node.js JS memory Heap arrays"
                    value={newAlternatives}
                    onChange={(e) => setNewAlternatives(e.target.value)}
                    className="w-full bg-[#0c0d10] border border-[rgba(255,255,255,0.06)] focus:border-[#00d2ff]/40 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none font-sans"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] text-zinc-500 uppercase block">Engineering Tradeoffs & Constraints</label>
                  <textarea
                    rows={2}
                    required
                    placeholder="e.g., Simple file persistence avoids SQL dependency configurations, but locks write operations under high parallel agent thread operations."
                    value={newTradeoffs}
                    onChange={(e) => setNewTradeoffs(e.target.value)}
                    className="w-full bg-[#0c0d10] border border-[rgba(255,255,255,0.06)] focus:border-[#00d2ff]/40 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none font-sans"
                  />
                </div>

                <div className="flex gap-2 justify-end font-sans">
                  <button
                    type="button"
                    onClick={() => setShowAddDecision(false)}
                    className="px-3.5 py-2 bg-zinc-900 border border-[rgba(255,255,255,0.06)] text-zinc-400 rounded-xl hover:bg-[#16181D] transition cursor-pointer text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#00d2ff] text-[#09090b] font-bold rounded-xl hover:bg-[#00b2d6] transition cursor-pointer text-xs"
                  >
                    Log Architectural Decision
                  </button>
                </div>
              </form>
            )}

            {/* List of decisions */}
            <div className="space-y-3.5">
              {brainData.decisionMemory.length === 0 ? (
                <div className="text-zinc-600 text-center py-10 italic">No recorded architectural choices.</div>
              ) : (
                brainData.decisionMemory.map((dec) => (
                  <div key={dec.id} className="bg-[#111318]/20 border border-[rgba(255,255,255,0.04)] rounded-2xl p-4 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-2 text-[10px] text-zinc-600 font-bold">{dec.id}</div>
                    
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[9px] bg-purple-500/10 border border-purple-500/20 text-purple-400 px-1.5 py-0.2 rounded uppercase">
                        ARCHITECTURAL LOG ENTRY
                      </span>
                      <span className="text-zinc-500 font-normal">[{new Date(dec.date).toLocaleDateString()}]</span>
                    </div>

                    <div className="space-y-2 text-[10.5px]">
                      <div>
                        <span className="text-zinc-600 block text-[8px] uppercase">Architectural Reason / Problem</span>
                        <p className="text-zinc-200 font-semibold">{dec.reason}</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 border-t border-[rgba(255,255,255,0.03)] pt-2 mt-2">
                        <div>
                          <span className="text-zinc-600 block text-[8px] uppercase">Chosen Solution Implementation</span>
                          <p className="text-[#00d2ff] font-bold font-sans text-xs mt-0.5">{dec.chosenSolution}</p>
                        </div>
                        <div>
                          <span className="text-zinc-600 block text-[8px] uppercase">Decision Tradeoffs & Constraints</span>
                          <p className="text-zinc-400 font-sans mt-0.5 leading-normal">{dec.tradeoffs}</p>
                        </div>
                      </div>

                      {dec.alternativesConsidered.length > 0 && (
                        <div className="border-t border-[rgba(255,255,255,0.03)] pt-2">
                          <span className="text-zinc-600 block text-[8px] uppercase mb-1">Rejected Alternatives Evaluated:</span>
                          <ul className="list-disc list-inside space-y-0.5 text-zinc-500 pl-1 font-sans text-[10px]">
                            {dec.alternativesConsidered.map((alt, idx) => (
                              <li key={idx}>{alt}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="flex justify-between items-center text-[8.5px] border-t border-[rgba(255,255,255,0.02)] pt-2.5 text-zinc-600 uppercase">
                        <span>Logged by: <strong className="text-zinc-400">{dec.author}</strong></span>
                        <span>Affected: <strong className="text-zinc-400">{dec.affectedModules.join(", ")}</strong></span>
                      </div>
                    </div>

                  </div>
                ))
              )}
            </div>

          </div>
        )}

        {/* TAB 4.3: PROJECT TIMELINE */}
        {activeSubTab === "timeline" && (
          <div className="space-y-4 font-mono text-[11px] leading-relaxed">
            
            <div className="flex justify-between items-center bg-[#111318]/40 border border-[rgba(255,255,255,0.04)] rounded-2xl p-4">
              <div>
                <h3 className="font-semibold text-zinc-100 flex items-center gap-1.5 text-xs uppercase">
                  <Clock size={13} className="text-[#00d2ff]" /> Operating System Project Timeline
                </h3>
                <p className="text-zinc-500 text-[10px] leading-relaxed font-sans mt-1">
                  Chronological milestone register and active event sequence trace log.
                </p>
              </div>

              <button
                onClick={() => setShowAddTimeline(!showAddTimeline)}
                className="px-3 py-1.5 bg-zinc-900 border border-[rgba(255,255,255,0.06)] hover:bg-[#16181D] hover:text-[#00d2ff] rounded-xl text-zinc-400 hover:text-white transition cursor-pointer flex items-center gap-1 shrink-0 text-[10px] font-bold"
              >
                <Plus size={11} />
                <span>LOG MILESTONE</span>
              </button>
            </div>

            {/* FORM TO ADD TIMELINE MILESTONE */}
            {showAddTimeline && (
              <form onSubmit={handleAddTimeline} className="bg-[#111318]/60 border border-[#00d2ff]/20 rounded-2xl p-5 space-y-4 max-w-xl mx-auto font-sans">
                <div className="text-[10px] uppercase text-[#00d2ff] tracking-wider font-bold font-mono">Formulate Custom System Milestone</div>
                
                <div className="space-y-1">
                  <label className="text-[9px] text-zinc-500 uppercase block font-mono">Milestone Event Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Workflow Engine Complete"
                    value={newTimelineEvent}
                    onChange={(e) => setNewTimelineEvent(e.target.value)}
                    className="w-full bg-[#0c0d10] border border-[rgba(255,255,255,0.06)] focus:border-[#00d2ff]/40 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] text-zinc-500 uppercase block font-mono">Log Trace Details</label>
                  <textarea
                    rows={2}
                    required
                    placeholder="e.g., Express router configured with dynamic local thread triggers and polling state cache listeners."
                    value={newTimelineDetails}
                    onChange={(e) => setNewTimelineDetails(e.target.value)}
                    className="w-full bg-[#0c0d10] border border-[rgba(255,255,255,0.06)] focus:border-[#00d2ff]/40 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none"
                  />
                </div>

                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => setShowAddTimeline(false)}
                    className="px-3.5 py-2 bg-zinc-900 border border-[rgba(255,255,255,0.06)] text-zinc-400 rounded-xl hover:bg-[#16181D] transition cursor-pointer text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#00d2ff] text-[#09090b] font-bold rounded-xl hover:bg-[#00b2d6] transition cursor-pointer text-xs"
                  >
                    Record Milestone
                  </button>
                </div>
              </form>
            )}

            {/* Render Timeline Trace List */}
            <div className="border-l border-[rgba(255,255,255,0.04)] ml-3 pl-6 space-y-5 relative">
              {brainData.timeline.length === 0 ? (
                <div className="text-zinc-600 text-center py-10 italic font-sans text-xs">No trace logs recorded.</div>
              ) : (
                brainData.timeline.map((item, idx) => (
                  <div key={idx} className="relative group">
                    
                    {/* Event Marker Node Dot */}
                    <div className="absolute -left-9 mt-1.5 w-6 h-6 rounded-full bg-[#0c0d10] border-2 border-[#00d2ff]/40 flex items-center justify-center text-[9px] font-mono text-[#00d2ff] font-bold group-hover:scale-110 transition shadow-[0_0_10px_rgba(0,210,255,0.1)]">
                      {item.time}
                    </div>

                    <div className="bg-[#111318]/25 border border-[rgba(255,255,255,0.03)] hover:border-[#00d2ff]/20 rounded-xl p-3.5 transition">
                      <h4 className="text-xs font-bold text-zinc-200">{item.event}</h4>
                      <p className="text-[10.5px] text-zinc-500 font-sans mt-1 leading-relaxed">
                        {item.details}
                      </p>
                    </div>

                  </div>
                ))
              )}
            </div>

          </div>
        )}

        {/* TAB 4.4: CHANGE LOG */}
        {activeSubTab === "changelog" && (
          <div className="space-y-4 font-mono text-[11px] leading-relaxed">
            
            <div className="bg-[#111318]/40 border border-[rgba(255,255,255,0.04)] rounded-2xl p-4">
              <h3 className="font-semibold text-zinc-100 flex items-center gap-1.5 text-xs uppercase">
                <History size={13} className="text-[#00d2ff]" /> OS Core Change Log Register
              </h3>
              <p className="text-zinc-500 text-[10px] leading-relaxed font-sans mt-1">
                Authoritative trace audit of project status adjustments, state toggles, and multi-agent compile deliverables.
              </p>
            </div>

            <div className="bg-[#111318]/20 border border-[rgba(255,255,255,0.04)] rounded-2xl p-3 overflow-hidden">
              <div className="max-h-[350px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                {brainData.changeLog.length === 0 ? (
                  <div className="text-zinc-600 text-center py-10 italic">Awaiting change registry logs.</div>
                ) : (
                  brainData.changeLog.map((log, idx) => (
                    <div key={idx} className="flex gap-4 py-2 border-b border-[rgba(255,255,255,0.02)] text-[10px] leading-normal font-mono group hover:bg-[#16181D]/10 px-2 rounded-lg transition">
                      <span className="text-zinc-600 select-none w-28 shrink-0">{new Date(log.timestamp).toLocaleTimeString()}</span>
                      <span className="text-zinc-400 font-bold shrink-0 w-24 truncate">{log.author}</span>
                      <span className="text-zinc-300 flex-1 group-hover:text-[#00d2ff] transition">{log.action}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        )}

      </div>

    </div>
  );
};

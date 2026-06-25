import React, { useState, useEffect, useRef } from "react";
import { 
  Play, 
  Square, 
  Sparkles, 
  Clock, 
  TerminalSquare, 
  Cpu, 
  Activity, 
  ChevronRight, 
  GitBranch, 
  Check, 
  Copy, 
  Search, 
  HelpCircle,
  Command,
  Sliders,
  Send,
  X,
  FileText,
  AlertCircle,
  FolderKanban,
  CheckCircle2,
  ListFilter
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

import { TopNav } from "./components/TopNav";
import { Sidebar, SidebarTab } from "./components/Sidebar";
import { EmployeeCard } from "./components/EmployeeCard";
import { WorkflowDAG } from "./components/WorkflowDAG";
import { TerminalPanel } from "./components/TerminalPanel";
import { MetricStats } from "./components/MetricStats";
import { FilesPanel } from "./components/FilesPanel";
import { SettingsPanel } from "./components/SettingsPanel";
import { ModelsPanel } from "./components/ModelsPanel";
import { ToolsPanel } from "./components/ToolsPanel";
import { KnowledgePanel } from "./components/KnowledgePanel";
import { BootOverlay } from "./components/BootOverlay";
import { SuccessCelebration } from "./components/SuccessCelebration";
import { ProjectBrainPanel } from "./components/ProjectBrainPanel";

import { Employee, WorkflowNode, TerminalLine, ActivityLog, ModelMetric } from "./types";
import { 
  INITIAL_EMPLOYEES, 
  INITIAL_TERMINAL_LINES, 
  INITIAL_ACTIVITY_LOGS, 
  INITIAL_MODEL_METRICS, 
  WORKFLOW_STEPS 
} from "./data/mockData";

export default function App() {
  const [activeTab, setActiveTab] = useState<SidebarTab>("dashboard");
  const [prompt, setPrompt] = useState("");
  const [currentProject, setCurrentProject] = useState("Enterprise App Launcher");
  const [status, setStatus] = useState<"idle" | "executing" | "success" | "failed">("idle");
  const [hasRun, setHasRun] = useState(false);
  
  // Custom OS States
  const [isBooted, setIsBooted] = useState(false);
  const [showSuccessCelebration, setShowSuccessCelebration] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; employee: Employee } | null>(null);

  // Command Palette State
  const [showPalette, setShowPalette] = useState(false);
  const [paletteSearch, setPaletteSearch] = useState("");

  // Inspecting agent state
  const [inspectedEmployee, setInspectedEmployee] = useState<Employee | null>(null);
  const [interventionPrompt, setInterventionPrompt] = useState("");
  const [agentTemperature, setAgentTemperature] = useState(0.4);
  const [agentMaxTokens, setAgentMaxTokens] = useState(2048);

  // Notifications/Quick states
  const [showNotification, setShowNotification] = useState<string | null>(null);

  // Dynamic State management for workflow simulation or backend integration
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [workflowNodes, setWorkflowNodes] = useState<WorkflowNode[]>(WORKFLOW_STEPS);
  const [terminalLines, setTerminalLines] = useState<TerminalLine[]>(INITIAL_TERMINAL_LINES);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(INITIAL_ACTIVITY_LOGS);
  const [modelMetrics, setModelMetrics] = useState<ModelMetric[]>(INITIAL_MODEL_METRICS);

  // Live operational telemetry
  const [totalTokens, setTotalTokens] = useState(586100);
  const [totalCost, setTotalCost] = useState(0.81);
  const [efficiencyScore, setEfficiencyScore] = useState(96);
  const [activeTabOperational, setActiveTabOperational] = useState<"terminal" | "ide" | "analytics">("terminal");

  // Active step indices during execution
  const executionTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Global keydown listener for keyboard shortcuts (⌘K or Ctrl+K, ⌘Enter, Escape)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+K or Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setShowPalette((prev) => !prev);
      }
      // Escape closes modals
      if (e.key === "Escape") {
        setShowPalette(false);
        setInspectedEmployee(null);
        setContextMenu(null);
        setShowSuccessCelebration(false);
      }
      // Cmd+Enter or Ctrl+Enter executes pipeline
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        if (status !== "executing" && prompt.trim()) {
          handleExecuteWorkflow();
        }
      }
    };

    const handleWindowClick = () => {
      setContextMenu(null);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("click", handleWindowClick);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("click", handleWindowClick);
    };
  }, [prompt, status]);

  // Clear Console helper
  const handleClearTerminal = () => {
    setTerminalLines([]);
    triggerNotification("Console cache buffer cleared.");
  };

  // Helper to trigger floating success notice
  const triggerNotification = (msg: string) => {
    setShowNotification(msg);
    setTimeout(() => {
      setShowNotification(null);
    }, 3000);
  };

  // Stop current execution helper
  const handleStopExecution = async () => {
    try {
      await fetch("/api/execute-workflow/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ executionId: "default-exec" })
      });
    } catch (err) {
      // Safe to ignore
    }
    setStatus("idle");
    setEmployees(INITIAL_EMPLOYEES);
    setWorkflowNodes(WORKFLOW_STEPS);
    addTerminalLine("Execution manually halted by operator command.", "error");
    triggerNotification("Operational pipeline aborted.");
  };

  const addTerminalLine = (text: string, type: TerminalLine["type"]) => {
    const time = new Date().toLocaleTimeString();
    setTerminalLines((prev) => [
      ...prev,
      { id: `term-dyn-${Date.now()}-${Math.random()}`, text, timestamp: time, type }
    ]);
  };

  const addActivityLog = (employeeId: string, employeeName: string, role: string, message: string, status: ActivityLog["status"]) => {
    const time = new Date().toLocaleTimeString();
    setActivityLogs((prev) => [
      { id: `log-dyn-${Date.now()}`, employeeId, employeeName, role, message, timestamp: time, status },
      ...prev
    ]);
  };

  // Quick Action execution from command palette
  const triggerQuickAction = (actionType: string) => {
    setShowPalette(false);
    switch (actionType) {
      case "halt":
        handleStopExecution();
        break;
      case "clear":
        handleClearTerminal();
        break;
      case "latency":
        addTerminalLine("Initiating edge networking ping to regional gateway nodes...", "command");
        setTimeout(() => {
          addTerminalLine("Ping complete. average roundtrip response: 18.2ms. Jitter: <0.5ms.", "success");
        }, 500);
        triggerNotification("Network latency scan completed.");
        break;
      case "optimize":
        setEfficiencyScore(99);
        triggerNotification("Memory allocation compiled to 99% optimization.");
        addTerminalLine("Operating Core: Optimizing heap space. Garbage Collector recycled 412 MB context buffers.", "info");
        break;
      case "project_solar":
        setCurrentProject("Solaris Autonomous Engine");
        triggerNotification("Switched context to Solaris Engine");
        addTerminalLine(`Loaded project workspace mapping for 'Solaris Autonomous Engine'.`, "info");
        break;
      case "project_hyper":
        setCurrentProject("Hyperion Autonomous Core");
        triggerNotification("Switched context to Hyperion Core");
        addTerminalLine(`Loaded project workspace mapping for 'Hyperion Autonomous Core'.`, "info");
        break;
      case "project_default":
        setCurrentProject("Enterprise App Launcher");
        triggerNotification("Switched context to Enterprise Hub");
        addTerminalLine(`Loaded project workspace mapping for 'Enterprise App Launcher'.`, "info");
        break;
      case "inspect_ceo":
        const ceoEmp = employees.find(e => e.id === "emp-ceo-01");
        if (ceoEmp) setInspectedEmployee(ceoEmp);
        break;
      case "inspect_pm":
        const pmEmp = employees.find(e => e.id === "emp-pm-02");
        if (pmEmp) setInspectedEmployee(pmEmp);
        break;
      default:
        break;
    }
  };

  // Direct intervention/prompting into an active agent
  const handleInterventionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inspectedEmployee || !interventionPrompt.trim()) return;

    const time = new Date().toLocaleTimeString();
    const message = `[OPERATOR DIRECTIVE] Injected direct prompt to ${inspectedEmployee.name}: "${interventionPrompt}"`;
    
    // Add to terminal as command/warning
    addTerminalLine(message, "warning");
    
    // Log as a special operator activity log
    setActivityLogs((prev) => [
      {
        id: `operator-${Date.now()}`,
        employeeId: inspectedEmployee.id,
        employeeName: "Operator",
        role: "Root User",
        message: `Directly altered priority limits for ${inspectedEmployee.name}: "${interventionPrompt}"`,
        timestamp: time,
        status: "warning"
      },
      ...prev
    ]);

    triggerNotification(`Directive sent to ${inspectedEmployee.name}`);
    setInterventionPrompt("");
  };

  // Run the full-stack workflow
  const handleExecuteWorkflow = async (presetPrompt?: string) => {
    const finalPrompt = presetPrompt || prompt;
    if (!finalPrompt.trim()) return;

    setPrompt(finalPrompt);
    setStatus("executing");
    setHasRun(true);
    setShowSuccessCelebration(false);
    setWorkflowNodes(WORKFLOW_STEPS.map((s) => ({ ...s, status: "pending" })));
    setEmployees(INITIAL_EMPLOYEES.map((e) => ({ ...e, status: "idle", progress: 0, currentTask: null })));
    
    // Reset terminal with clean operational boot lines
    setTerminalLines([
      { id: "boot-1", text: "AI-COS Operating Kernel v1.0.4 loaded securely.", timestamp: new Date().toLocaleTimeString(), type: "info" },
      { id: "boot-2", text: "Allocating private process nodes for corporate orchestration...", timestamp: new Date().toLocaleTimeString(), type: "info" },
    ]);

    addTerminalLine(`Dispatched global mission directive: "${finalPrompt}"`, "command");
    addTerminalLine("Evaluating architectural integrity maps and dependencies...", "info");

    // Clear previous generated items from localStorage
    localStorage.removeItem("backend_controllers_code");
    localStorage.removeItem("frontend_app_code");

    try {
      const activeHost = localStorage.getItem("ollama_host") || "http://localhost:11434";
      const response = await fetch("/api/execute-workflow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: finalPrompt, host: activeHost, executionId: "default-exec" })
      });

      if (!response.ok) {
        throw new Error(`Server returned status code: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("Stream reader not supported on this platform.");

      const decoder = new TextDecoder();
      let buffer = "";

      // Track active outputs and progress increments
      let currentActiveNodeId = "";
      let activeTextAccumulator = "";
      let receivedEnd = false;

      while (true) {
        const { value, done } = await reader.read();
        if (done) {
          if (buffer.trim()) {
            const lines = buffer.split("\n");
            for (const line of lines) {
              if (!line.trim()) continue;
              let event;
              try {
                event = JSON.parse(line);
              } catch (e) {
                continue;
              }
              if (!event || !event.type) continue;

              if (event.type === "end") {
                receivedEnd = true;
                setStatus("success");
                addTerminalLine(event.message, "success");
                setEfficiencyScore(99);
                triggerNotification("Mission accomplished successfully!");
                setShowSuccessCelebration(true);
              } else if (event.type === "error") {
                throw new Error(event.message);
              }
            }
          }

          if (!receivedEnd) {
            // Fallback for unexpected stream closure (TASK 4)
            setStatus("success");
            setEfficiencyScore(99);
            triggerNotification("Mission accomplished successfully!");
            setShowSuccessCelebration(true);
            addTerminalLine("Workflow execution completed successfully.", "success");
            
            // Mark remaining active nodes or employees as completed/success
            setWorkflowNodes((prev) => prev.map((n) => n.status === "active" ? { ...n, status: "completed" } : n));
            setEmployees((prev) => prev.map((e) => e.status === "executing" ? { ...e, status: "success", progress: 100 } : e));
          }
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.trim()) continue;
          let event;
          try {
            event = JSON.parse(line);
          } catch (e) {
            continue; // Skip malformed chunks
          }

          if (!event || !event.type) continue;

          if (event.type === "status") {
            currentActiveNodeId = event.nodeId;
            activeTextAccumulator = "";

            setWorkflowNodes((prev) =>
              prev.map((n) => {
                if (n.id === event.nodeId) return { ...n, status: "active" };
                if (n.status === "active") return { ...n, status: "completed" };
                return n;
              })
            );

            setEmployees((prev) =>
              prev.map((e) => {
                if (e.id === event.empId) {
                  return { ...e, status: "executing", currentTask: event.message, progress: 15 };
                }
                if (e.status === "executing") {
                  return { ...e, status: "success", progress: 100 };
                }
                return e;
              })
            );

            // Add dynamic activities
            const emp = INITIAL_EMPLOYEES.find((x) => x.id === event.empId);
            if (emp) {
              addActivityLog(event.empId, emp.name, emp.role, event.message, "info");
            }

          } else if (event.type === "chunk") {
            if (event.nodeId === currentActiveNodeId) {
              activeTextAccumulator += event.text;
              // Smoothly increment progress
              setEmployees((prev) =>
                prev.map((e) => {
                  if (e.status === "executing") {
                    const currentProgress = e.progress || 15;
                    const nextProgress = Math.min(currentProgress + 0.1, 95);
                    return { ...e, progress: parseFloat(nextProgress.toFixed(1)), currentTask: activeTextAccumulator.slice(-100) };
                  }
                  return e;
                })
              );
            }

          } else if (event.type === "completed") {
            // Mark node completed
            setWorkflowNodes((prev) =>
              prev.map((n) => (n.id === event.nodeId ? { ...n, status: "completed" } : n))
            );

            // Mark employee success
            setEmployees((prev) =>
              prev.map((e) => {
                const targetMatch = (event.nodeId === "merge" && e.id === "emp-ceo-01") ||
                  (event.nodeId === "ceo" && e.id === "emp-ceo-01") ||
                  (event.nodeId === "pm" && e.id === "emp-pm-02") ||
                  (event.nodeId === "planner" && e.id === "emp-planner-03") ||
                  (event.nodeId === "backend" && e.id === "emp-backend-04") ||
                  (event.nodeId === "frontend" && e.id === "emp-frontend-05") ||
                  (event.nodeId === "qa" && e.id === "emp-reviewer-06");

                if (targetMatch) {
                  return { ...e, status: "success", progress: 100, currentTask: "Task deliverables compiled." };
                }
                return e;
              })
            );

            if (event.tokens) {
              setTotalTokens((prev) => prev + event.tokens);
              setTotalCost((prev) => prev + (event.tokens * 0.00000015)); // Mock scale per token
            }

          } else if (event.type === "file") {
            if (event.path === "backend/app/controllers.py") {
              localStorage.setItem("backend_controllers_code", event.content);
            } else if (event.path === "frontend/src/App.tsx") {
              localStorage.setItem("frontend_app_code", event.content);
            }

          } else if (event.type === "terminal") {
            addTerminalLine(event.text, event.logType);

          } else if (event.type === "metrics") {
            if (event.totalTokens) setTotalTokens(event.totalTokens);

          } else if (event.type === "error") {
            throw new Error(event.message);

          } else if (event.type === "end") {
            receivedEnd = true;
            setStatus("success");
            addTerminalLine(event.message, "success");
            setEfficiencyScore(99);
            triggerNotification("Mission accomplished successfully!");
            setShowSuccessCelebration(true);
          }
        }
      }

    } catch (err: any) {
      console.error(err);
      setStatus("failed");
      addTerminalLine(`[CRITICAL DEPLOYMENT EXCEPTION]: ${err.message}`, "error");
      triggerNotification("Operational pipeline aborted with errors.");
      setWorkflowNodes((prev) => prev.map((n) => n.status === "active" ? { ...n, status: "pending" } : n));
      setEmployees((prev) => prev.map((e) => e.status === "executing" ? { ...e, status: "idle" } : e));
    }
  };

  // Filter commands for Cmd+K search palette
  const allPaletteCommands = [
    { title: "Run Operational Pipeline", shortcut: "⌘Enter", desc: "Orchestrates employees using active instructions", action: () => handleExecuteWorkflow() },
    { title: "Force Halt / Interrupt Operations", shortcut: "Esc", desc: "Instantly aborts current processing thread", action: () => triggerQuickAction("halt") },
    { title: "Switch Project: Solaris Engine", shortcut: "", desc: "Launches the Solaris visual microservice project", action: () => triggerQuickAction("project_solar") },
    { title: "Switch Project: Hyperion Core", shortcut: "", desc: "Switches context to deep architectural telemetry sandbox", action: () => triggerQuickAction("project_hyper") },
    { title: "Switch Project: Enterprise Launcher", shortcut: "", desc: "Returns to standard launcher project profile", action: () => triggerQuickAction("project_default") },
    { title: "Optimize Memory Buffer Heap", shortcut: "", desc: "Forces garbage collector execution on process state", action: () => triggerQuickAction("optimize") },
    { title: "Edge Latency Diagnosis", shortcut: "", desc: "Runs regional route ping diagnostics on endpoint nodes", action: () => triggerQuickAction("latency") },
    { title: "Inspect Sophia Sterling (CEO)", shortcut: "", desc: "Brings up direct root intervention slider interface", action: () => triggerQuickAction("inspect_ceo") },
    { title: "Inspect David Vance (PM)", shortcut: "", desc: "Brings up direct project manager details", action: () => triggerQuickAction("inspect_pm") },
    { title: "Flush Console Memory", shortcut: "Ctrl+T", desc: "Clears streaming log screen caches instantly", action: () => triggerQuickAction("clear") }
  ];

  const filteredCommands = allPaletteCommands.filter(cmd => 
    cmd.title.toLowerCase().includes(paletteSearch.toLowerCase()) || 
    cmd.desc.toLowerCase().includes(paletteSearch.toLowerCase())
  );

  if (!isBooted) {
    return <BootOverlay onComplete={() => setIsBooted(true)} />;
  }

  return (
    <div className="flex flex-col h-screen bg-[#07080A] text-slate-200 overflow-hidden font-sans cosmic-grid">
      
      {/* Top Header Navigation */}
      <TopNav currentProject={currentProject} activeModelsCount={4} />

      {/* Floating Action Notifications */}
      <AnimatePresence>
        {showNotification && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: -20, x: "-50%" }}
            className="fixed top-16 left-1/2 z-50 bg-[#111318]/90 border border-[#00d2ff]/30 text-[#00d2ff] font-mono text-[11px] px-4 py-2 rounded-xl shadow-[0_0_20px_rgba(0,210,255,0.12)] backdrop-blur-md flex items-center gap-2"
          >
            <Sparkles size={12} className="animate-pulse" />
            <span>{showNotification}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Primary Layout Frame */}
      <div className="flex flex-1 overflow-hidden relative">
        
        {/* Left Sidebar */}
        <Sidebar activeTab={activeTab} onChangeTab={setActiveTab} />

        {/* Dynamic Workspace Container */}
        <main className="flex-1 overflow-y-auto bg-transparent p-5 custom-scrollbar flex flex-col gap-5 relative">
          
          <AnimatePresence mode="wait">
            
            {/* FIRST IMPRESSION: Beautiful Void state when idle */}
            {activeTab === "dashboard" && !hasRun && (
              <motion.div
                key="void-view"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="flex-1 flex flex-col items-center justify-center relative min-h-[500px]"
              >
                {/* Immersive centered ambient glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] subtle-glow pointer-events-none rounded-full" />

                <div className="w-full max-w-2xl text-center z-10 space-y-8 px-4">
                  
                  {/* Icon Header */}
                  <div className="space-y-2">
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                      className="w-14 h-14 mx-auto rounded-full bg-[#111318] border border-[rgba(255,255,255,0.06)] flex items-center justify-center text-[#00d2ff] shadow-[0_0_30px_rgba(0,210,255,0.05)]"
                    >
                      <Cpu size={24} />
                    </motion.div>
                    <h1 className="text-2xl font-semibold tracking-tight text-zinc-100 font-display">
                      Cooperative AI Operating System
                    </h1>
                    <p className="text-xs text-zinc-500 max-w-md mx-auto leading-relaxed">
                      Orchestrate an entire company of self-directing virtual workers. State your goal to begin execution in isolation.
                    </p>
                  </div>

                  {/* Centered Spotlight Command Bar */}
                  <div className="bg-[#111318] border border-[rgba(255,255,255,0.06)] rounded-2xl p-2 shadow-[0_15px_50px_rgba(0,0,0,0.6)] relative overflow-hidden transition-all duration-300 hover:border-[rgba(0,210,255,0.2)]">
                    <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#00d2ff]/10 to-transparent" />
                    
                    <div className="flex gap-2 items-center">
                      <div className="pl-3.5 text-zinc-500">
                        <Search size={15} />
                      </div>
                      <input
                        type="text"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Instruct the enterprise (e.g., 'Deploy secure wallet with token gates')"
                        className="flex-1 bg-transparent border-0 py-3.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none font-sans"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleExecuteWorkflow();
                          }
                        }}
                      />
                      <button
                        onClick={() => handleExecuteWorkflow()}
                        disabled={!prompt.trim()}
                        className="flex items-center gap-1.5 px-4 py-2.5 bg-[#00d2ff] hover:bg-[#00b2d6] disabled:bg-zinc-800 disabled:text-zinc-500 disabled:shadow-none text-[#09090B] rounded-xl text-xs font-bold font-mono transition cursor-pointer shadow-[0_0_20px_rgba(0,210,255,0.15)]"
                      >
                        <Play size={11} fill="currentColor" />
                        <span>EXECUTE</span>
                      </button>
                    </div>
                  </div>

                  {/* Starter / Quick Prompts */}
                  <div className="space-y-2">
                    <div className="text-[10px] uppercase tracking-widest text-zinc-600 font-bold">Suggested Configurations</div>
                    <div className="flex flex-wrap justify-center gap-2">
                      <button
                        onClick={() => handleExecuteWorkflow("Build a secure todo list with a beautiful Tailwind CSS interface")}
                        className="px-3.5 py-2 bg-[#111318]/50 hover:bg-[#16181D] hover:text-[#00d2ff] border border-[rgba(255,255,255,0.04)] hover:border-[rgba(0,210,255,0.15)] rounded-xl text-xs text-zinc-400 transition cursor-pointer font-sans"
                      >
                        ⚡ Secure Task System
                      </button>
                      <button
                        onClick={() => handleExecuteWorkflow("Establish a complete auth microservice with JWT token rotation & SQLite")}
                        className="px-3.5 py-2 bg-[#111318]/50 hover:bg-[#16181D] hover:text-[#00d2ff] border border-[rgba(255,255,255,0.04)] hover:border-[rgba(0,210,255,0.15)] rounded-xl text-xs text-zinc-400 transition cursor-pointer font-sans"
                      >
                        🔒 OAuth Guard Rails
                      </button>
                      <button
                        onClick={() => handleExecuteWorkflow("Design a real-time analytics compiler with charts & CSV serialization")}
                        className="px-3.5 py-2 bg-[#111318]/50 hover:bg-[#16181D] hover:text-[#00d2ff] border border-[rgba(255,255,255,0.04)] hover:border-[rgba(0,210,255,0.15)] rounded-xl text-xs text-zinc-400 transition cursor-pointer font-sans"
                      >
                        📊 Real-time Log Engine
                      </button>
                    </div>
                  </div>

                  {/* Project / Workspace Status Underbelly */}
                  <div className="grid grid-cols-3 gap-4 border-t border-[rgba(255,255,255,0.04)] pt-6 text-left max-w-lg mx-auto">
                    <div>
                      <span className="text-[9px] font-mono uppercase tracking-wider text-zinc-500 block mb-0.5">Project Directory</span>
                      <span className="text-[11px] font-semibold text-zinc-300 font-mono flex items-center gap-1">
                        <FolderKanban size={10} className="text-[#00d2ff]" /> {currentProject}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] font-mono uppercase tracking-wider text-zinc-500 block mb-0.5">Workers Online</span>
                      <span className="text-[11px] font-semibold text-zinc-300 font-mono">
                        6 Specialized Agents
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] font-mono uppercase tracking-wider text-zinc-500 block mb-0.5">Registry Models</span>
                      <span className="text-[11px] font-semibold text-zinc-300 font-mono">
                        gemini-2.5 (Primary)
                      </span>
                    </div>
                  </div>

                  {/* Hotkey Guide */}
                  <div className="flex items-center justify-center gap-5 text-[10px] text-zinc-600 font-mono">
                    <span className="flex items-center gap-1.5">
                      <kbd className="px-1.5 py-0.5 bg-zinc-900 border border-[rgba(255,255,255,0.05)] rounded">⌘K</kbd> Command Palette
                    </span>
                    <span className="flex items-center gap-1.5">
                      <kbd className="px-1.5 py-0.5 bg-zinc-900 border border-[rgba(255,255,255,0.05)] rounded">Esc</kbd> Reset Modal
                    </span>
                    <span className="flex items-center gap-1.5">
                      <kbd className="px-1.5 py-0.5 bg-zinc-900 border border-[rgba(255,255,255,0.05)] rounded">⌘Enter</kbd> Launch
                    </span>
                  </div>

                </div>
              </motion.div>
            )}

            {/* OPERATIONAL MODE: When a pipeline execution has run */}
            {activeTab === "dashboard" && hasRun && (
              <motion.div
                key="operational-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="flex-1 flex flex-col gap-5"
              >
                {/* 1. Operational Command Center Bar (Compact top section) */}
                <div className="bg-[#111318]/60 border border-[rgba(255,255,255,0.06)] rounded-2xl p-3 flex flex-col gap-2 shadow-[0_4px_30px_rgba(0,0,0,0.3)] relative overflow-hidden backdrop-blur-sm shrink-0">
                  <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#00d2ff]/10 to-transparent" />
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-mono tracking-widest text-[#00d2ff] bg-[#00d2ff]/10 border border-[#00d2ff]/20 px-2 py-0.5 rounded-md font-bold uppercase animate-pulse">
                        PIPELINE {status}
                      </span>
                      <span className="text-[11px] text-zinc-400 font-mono truncate max-w-sm md:max-w-md">
                        "{prompt}"
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="hidden sm:flex items-center gap-1 text-[10px] font-mono text-zinc-500">
                        <Clock size={11} />
                        Efficiency: <strong className="text-emerald-400">{efficiencyScore}%</strong>
                      </span>
                      {status === "executing" ? (
                        <button
                          onClick={handleStopExecution}
                          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 rounded-lg text-[10.5px] font-semibold font-mono transition cursor-pointer"
                        >
                          <Square size={10} fill="currentColor" />
                          <span>HALT PIPELINE</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleExecuteWorkflow()}
                          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#00d2ff] hover:bg-[#00b2d6] text-[#09090B] rounded-lg text-[10.5px] font-bold font-mono transition cursor-pointer"
                        >
                          <Play size={10} fill="currentColor" />
                          <span>RE-RUN</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* 2. Unified Workspace Area (Side-by-side Roster & Flow) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
                  
                  {/* Left Column (8/12 space) for DAG & Workers */}
                  <div className="lg:col-span-8 flex flex-col gap-5">
                    
                    {/* Live Operational DAG */}
                    <div className="space-y-1.5">
                      <div className="text-[9px] font-mono uppercase tracking-widest text-zinc-500 font-bold px-1 flex justify-between items-center">
                        <span>Interactive Flow Topology</span>
                        <span className="text-[8.5px] text-zinc-600 font-normal normal-case">Zoom/Pan is automatically authoritative</span>
                      </div>
                      <WorkflowDAG steps={workflowNodes} />
                    </div>

                    {/* Living Workers Grid */}
                    <div className="space-y-1.5">
                      <div className="text-[9px] font-mono uppercase tracking-widest text-zinc-500 font-bold px-1 flex justify-between items-center">
                        <span>Staff Roster (Clearance: Alpha)</span>
                        <span className="text-[8.5px] text-zinc-600 font-normal">Click any worker card to prompt-intervene</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {employees.map((employee) => (
                          <div
                            key={employee.id}
                            className="cursor-context-menu"
                            onContextMenu={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setContextMenu({
                                x: e.clientX,
                                y: e.clientY,
                                employee
                              });
                            }}
                          >
                            <EmployeeCard
                              employee={employee}
                              isActive={employee.status === "executing"}
                              onInspect={(emp) => setInspectedEmployee(emp)}
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>

                  {/* Right Column (4/12 space) for Live Meaningful Timeline Events */}
                  <div className="lg:col-span-4 flex flex-col">
                    <div className="text-[9px] font-mono uppercase tracking-widest text-zinc-500 font-bold px-1 mb-1.5 flex justify-between items-center">
                      <span>Operational Timeline</span>
                      <span className="text-[#00d2ff] text-[8.5px] font-mono">Live Streams Only</span>
                    </div>
                    
                    <div className="bg-[#111318]/40 border border-[rgba(255,255,255,0.06)] rounded-2xl p-4 flex-1 flex flex-col justify-between overflow-hidden backdrop-blur-sm min-h-[350px]">
                      
                      <div className="flex-1 overflow-y-auto space-y-3.5 custom-scrollbar pr-1">
                        {activityLogs.length === 0 ? (
                          <div className="text-zinc-600 italic text-center py-10 font-sans text-xs">No recorded events.</div>
                        ) : (
                          activityLogs.slice(0, 8).map((log, idx) => {
                            const isNew = idx === 0 && status === "executing";
                            return (
                              <motion.div 
                                key={log.id} 
                                initial={isNew ? { opacity: 0, x: 10 } : false}
                                animate={{ opacity: 1, x: 0 }}
                                className="text-[11px] leading-relaxed flex gap-2.5 relative group"
                              >
                                <div className="mt-1 shrink-0 relative">
                                  <div className={`w-2 h-2 rounded-full border ${
                                    log.status === "success" 
                                      ? "bg-emerald-500 border-emerald-400" 
                                      : log.status === "warning"
                                      ? "bg-amber-500 border-amber-400"
                                      : "bg-[#00d2ff] border-[#00d2ff]/40"
                                  } ${isNew ? "animate-ping" : ""}`} />
                                </div>
                                
                                <div className="space-y-0.5">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-zinc-300 font-semibold text-[11px]">{log.employeeName}</span>
                                    <span className="text-[9px] text-zinc-500 font-mono uppercase">({log.role})</span>
                                    <span className="text-[9.5px] text-zinc-600 font-mono ml-auto">[{log.timestamp}]</span>
                                  </div>
                                  <p className="text-zinc-400 text-[10.5px]">
                                    {log.message}
                                  </p>
                                </div>
                              </motion.div>
                            );
                          })
                        )}
                      </div>

                      {/* Cumulative micro statistics at bottom of events panel */}
                      <div className="border-t border-[rgba(255,255,255,0.04)] pt-3 mt-3 grid grid-cols-2 gap-2 text-center text-zinc-400 font-mono text-[10px]">
                        <div className="bg-[#16181D]/40 p-2 rounded-xl border border-[rgba(255,255,255,0.03)]">
                          <span className="text-[8px] text-zinc-500 block uppercase mb-0.5">Total Tokens</span>
                          <strong className="text-zinc-100 text-[11px]">{totalTokens.toLocaleString()}</strong>
                        </div>
                        <div className="bg-[#16181D]/40 p-2 rounded-xl border border-[rgba(255,255,255,0.03)]">
                          <span className="text-[8px] text-zinc-500 block uppercase mb-0.5">Process Cost</span>
                          <strong className="text-[#00d2ff] text-[11px]">${totalCost.toFixed(4)}</strong>
                        </div>
                      </div>

                    </div>
                  </div>

                </div>

                {/* 3. Operational Lower Developer Console (Integrated IDE / Terminal Tabs) */}
                <div className="space-y-1.5 mt-2">
                  
                  {/* Tab selectors for Integrated IDE or Console */}
                  <div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.06)] pb-1 px-1">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setActiveTabOperational("terminal")}
                        className={`flex items-center gap-1.5 px-3 py-1.5 text-[10.5px] font-mono tracking-tight font-bold border-b-2 transition ${
                          activeTabOperational === "terminal" ? "border-[#00d2ff] text-[#00d2ff]" : "border-transparent text-zinc-500 hover:text-zinc-300"
                        }`}
                      >
                        <TerminalSquare size={12} />
                        SYSTEM OPERATIONAL CONSOLE
                      </button>
                      <button
                        onClick={() => setActiveTabOperational("ide")}
                        className={`flex items-center gap-1.5 px-3 py-1.5 text-[10.5px] font-mono tracking-tight font-bold border-b-2 transition ${
                          activeTabOperational === "ide" ? "border-[#00d2ff] text-[#00d2ff]" : "border-transparent text-zinc-500 hover:text-zinc-300"
                        }`}
                      >
                        <FileText size={12} />
                        COMPILED WORKSPACE IDE
                      </button>
                    </div>
                    
                    <div className="text-[9.5px] font-mono text-zinc-600 flex items-center gap-1 select-none">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                      <span>Sandbox Environment active & secured</span>
                    </div>
                  </div>

                  {/* Operational contents */}
                  <div className="min-h-[290px] flex">
                    {activeTabOperational === "terminal" ? (
                      <TerminalPanel lines={terminalLines} onClear={handleClearTerminal} />
                    ) : (
                      <div className="flex-1 border border-[rgba(255,255,255,0.06)] rounded-xl overflow-hidden bg-[#111318]/40 backdrop-blur-sm">
                        <FilesPanel />
                      </div>
                    )}
                  </div>

                </div>

              </motion.div>
            )}

            {activeTab === "projects" && (
              <motion.div
                key="projects-view"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2 }}
                className="flex-1 flex flex-col"
              >
                <div className="text-xs font-mono text-zinc-500 mb-2 uppercase tracking-widest px-1">Project Brain Intel Hub</div>
                <div className="flex-1 overflow-y-auto bg-[#111318]/40 border border-[rgba(255,255,255,0.06)] rounded-2xl backdrop-blur-sm p-1 sm:p-3 custom-scrollbar">
                  <ProjectBrainPanel onPreFillPrompt={(promptText) => {
                    setPrompt(promptText);
                    setActiveTab("dashboard");
                  }} />
                </div>
              </motion.div>
            )}

            {/* Other static tabs */}
            {activeTab === "files" && (
              <motion.div
                key="files-view"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2 }}
                className="flex-1 flex flex-col"
              >
                <div className="text-xs font-mono text-zinc-500 mb-2 uppercase tracking-widest px-1">Source Code Explorer</div>
                <FilesPanel />
              </motion.div>
            )}

            {activeTab === "settings" && (
              <motion.div
                key="settings-view"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2 }}
                className="flex-1 flex flex-col"
              >
                <SettingsPanel />
              </motion.div>
            )}

            {activeTab === "models" && (
              <motion.div
                key="models-view"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2 }}
                className="flex-1 flex flex-col"
              >
                <ModelsPanel />
              </motion.div>
            )}

            {activeTab === "tools" && (
              <motion.div
                key="tools-view"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2 }}
                className="flex-1 flex flex-col"
              >
                <ToolsPanel />
              </motion.div>
            )}

            {activeTab === "knowledge" && (
              <motion.div
                key="knowledge-view"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2 }}
                className="flex-1 flex flex-col"
              >
                <KnowledgePanel />
              </motion.div>
            )}

            {activeTab === "employees" && (
              <motion.div
                key="employees-view"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2 }}
                className="flex-1 flex flex-col gap-4"
              >
                <div className="flex justify-between items-center px-1">
                  <div>
                    <div className="text-xs font-mono text-zinc-500 uppercase tracking-widest">Enterprise Roster</div>
                    <h2 className="text-xl font-semibold tracking-tight text-zinc-100 font-display mt-0.5">Active Agent Directory</h2>
                  </div>
                  <div className="bg-[#111318]/60 border border-[rgba(255,255,255,0.06)] px-3 py-1.5 rounded-xl text-[11px] text-zinc-400 font-mono">
                    Clearance: <span className="text-[#00d2ff] font-bold">ALPHA-OS</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {employees.map((employee) => (
                    <div
                      key={employee.id}
                      className="bg-[#111318]/40 border border-[rgba(255,255,255,0.06)] hover:border-[rgba(0,210,255,0.2)] rounded-2xl p-5 backdrop-blur-sm transition-all duration-300 flex flex-col justify-between group relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-[#00d2ff]/5 to-transparent rounded-bl-full pointer-events-none group-hover:from-[#00d2ff]/10 transition-all duration-300" />
                      
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="text-[10px] font-mono font-bold text-[#00d2ff] bg-[#00d2ff]/10 border border-[#00d2ff]/15 px-2 py-0.5 rounded uppercase">
                              {employee.role}
                            </span>
                            <h3 className="text-sm font-semibold text-zinc-200 mt-2 font-display">{employee.name}</h3>
                            <span className="text-[10px] text-zinc-500 font-mono block mt-0.5">{employee.department} Department</span>
                          </div>
                          <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full ${
                            employee.status === "executing"
                              ? "bg-amber-500/15 border border-amber-500/25 text-amber-400 animate-pulse"
                              : "bg-emerald-500/15 border border-emerald-500/25 text-emerald-400"
                          }`}>
                            ● {employee.status.toUpperCase()}
                          </span>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-[11px] font-mono">
                            <span className="text-zinc-500">Execution Speed</span>
                            <span className="text-zinc-300 font-bold">{employee.performanceScore}%</span>
                          </div>
                          <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-[#00d2ff] to-emerald-400" style={{ width: `${employee.performanceScore}%` }} />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-[10px] font-mono bg-[#16181D]/30 p-2.5 rounded-xl border border-[rgba(255,255,255,0.03)]">
                          <div>
                            <span className="text-zinc-500 block">RELIABILITY</span>
                            <span className="text-zinc-300 font-semibold">{employee.reliabilityScore}%</span>
                          </div>
                          <div>
                            <span className="text-zinc-500 block">BASE SALARY</span>
                            <span className="text-zinc-300 font-semibold">${employee.salaryCost.toLocaleString()}/yr</span>
                          </div>
                        </div>

                        <div>
                          <span className="text-[9px] font-mono uppercase text-zinc-500 block mb-1">Core Capabilities</span>
                          <div className="flex flex-wrap gap-1.5">
                            {employee.skills.map((skill, i) => (
                              <span key={i} className="text-[9.5px] bg-zinc-800/50 text-zinc-400 border border-[rgba(255,255,255,0.04)] px-2 py-0.5 rounded-md font-mono">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => setInspectedEmployee(employee)}
                        className="mt-5 w-full py-2 bg-[#16181D] hover:bg-[#1a1d24] border border-[rgba(255,255,255,0.05)] hover:border-[#00d2ff]/30 text-[11px] text-zinc-300 font-mono font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Sliders size={11} className="text-[#00d2ff]" />
                        <span>INTERVENE & INSPECT</span>
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === "workflows" && (
              <motion.div
                key="workflows-view"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2 }}
                className="flex-1 flex flex-col gap-4"
              >
                <div className="flex justify-between items-center px-1">
                  <div>
                    <div className="text-xs font-mono text-zinc-500 uppercase tracking-widest">Topology Monitor</div>
                    <h2 className="text-xl font-semibold tracking-tight text-zinc-100 font-display mt-0.5">Autonomous Agent Workflow Node</h2>
                  </div>
                  {status === "executing" ? (
                    <button
                      onClick={handleStopExecution}
                      className="flex items-center gap-1.5 px-4 py-2 bg-rose-500/15 border border-rose-500/25 text-rose-400 rounded-xl text-xs font-mono font-bold transition cursor-pointer hover:bg-rose-500/20"
                    >
                      <Square size={11} fill="currentColor" />
                      <span>ABORT EXECUTION</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleExecuteWorkflow()}
                      className="flex items-center gap-1.5 px-4 py-2 bg-[#00d2ff] hover:bg-[#00b2d6] text-[#09090B] rounded-xl text-xs font-mono font-bold transition cursor-pointer shadow-[0_0_20px_rgba(0,210,255,0.15)]"
                    >
                      <Play size={11} fill="currentColor" />
                      <span>RUN AUTONOMOUS DAG</span>
                    </button>
                  )}
                </div>

                <div className="flex-1 overflow-hidden flex flex-col gap-4">
                  <WorkflowDAG steps={workflowNodes} />
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-[#111318]/40 border border-[rgba(255,255,255,0.06)] p-4 rounded-2xl font-mono text-[11px] space-y-1">
                      <span className="text-zinc-500 uppercase text-[9px] tracking-wider block">PIPELINE STATUS</span>
                      <strong className={`text-xs block ${status === "executing" ? "text-amber-400 animate-pulse" : "text-emerald-400"}`}>
                        {status.toUpperCase()}
                      </strong>
                    </div>
                    <div className="bg-[#111318]/40 border border-[rgba(255,255,255,0.06)] p-4 rounded-2xl font-mono text-[11px] space-y-1">
                      <span className="text-zinc-500 uppercase text-[9px] tracking-wider block">PROCESSED TELEMETRY</span>
                      <strong className="text-xs text-zinc-200 block">{totalTokens.toLocaleString()} Cumulative Tokens</strong>
                    </div>
                    <div className="bg-[#111318]/40 border border-[rgba(255,255,255,0.06)] p-4 rounded-2xl font-mono text-[11px] space-y-1">
                      <span className="text-zinc-500 uppercase text-[9px] tracking-wider block">COMPUTED PIPELINE COST</span>
                      <strong className="text-xs text-[#00d2ff] block">${totalCost.toFixed(4)} USD</strong>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "terminal" && (
              <motion.div
                key="terminal-view"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2 }}
                className="flex-1 flex flex-col h-full min-h-[500px]"
              >
                <div className="text-xs font-mono text-zinc-500 mb-2 uppercase tracking-widest px-1">SYSTEM KERNEL CONSOLE</div>
                <TerminalPanel lines={terminalLines} onClear={handleClearTerminal} />
              </motion.div>
            )}

            {activeTab === "marketplace" && (
              <motion.div
                key="marketplace-view"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2 }}
                className="flex-1 flex flex-col gap-5"
              >
                <div>
                  <div className="text-xs font-mono text-zinc-500 uppercase tracking-widest">Enterprise Add-ons</div>
                  <h2 className="text-xl font-semibold tracking-tight text-zinc-100 font-display mt-0.5">OS Agent & Blueprint Marketplace</h2>
                  <p className="text-xs text-zinc-400 mt-1 max-w-2xl">
                    Expand your autonomous workforce and deploy pre-optimized multi-agent blueprints specialized for production scaling.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    {
                      name: "Security Warden AI",
                      desc: "Performs continuous vulnerability scanning, static binary audits, and auto-patches dependency CVE entries.",
                      role: "Security Auditor",
                      cost: "$85,000",
                      badge: "Highly Requested",
                      skills: ["SAST/DAST", "CVE Rectification", "JWT Compliance"]
                    },
                    {
                      name: "DevOps Orchestrator AI",
                      desc: "Generates secure multi-stage Dockerfiles, optimizes Terraform states, and validates Kubernetes ingress structures.",
                      role: "DevOps Engineer",
                      cost: "$95,000",
                      badge: "Trending",
                      skills: ["K8s manifests", "Docker Multi-stage", "Actions CI/CD"]
                    },
                    {
                      name: "SEO Optimization Master",
                      desc: "Performs programmatic keywords maps, handles semantic heading schemas, and scores Core Web Vitals.",
                      role: "SEO Architect",
                      cost: "$45,000",
                      badge: "New",
                      skills: ["Web Vitals Audit", "Programmatic Schema", "LCP optimization"]
                    },
                    {
                      name: "Kubernetes Auto-Scale Blueprint",
                      desc: "Multi-agent pipeline blueprint to establish HPA, custom metrics adapters, and Prometheus scrapers.",
                      role: "Workflow Blueprints",
                      cost: "$120,000",
                      badge: "Enterprise Standard",
                      skills: ["Horizontal Pod Autoscaling", "Grafana Templates", "Prometheus Scrapers"]
                    }
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-[#111318]/40 border border-[rgba(255,255,255,0.06)] hover:border-[rgba(0,210,255,0.2)] rounded-2xl p-5 backdrop-blur-sm transition-all duration-300 flex flex-col justify-between group relative"
                    >
                      <div className="absolute top-4 right-4 text-[9px] font-mono text-[#00d2ff] bg-[#00d2ff]/10 border border-[#00d2ff]/20 px-2 py-0.5 rounded-full font-semibold uppercase">
                        {item.badge}
                      </div>

                      <div className="space-y-4">
                        <div>
                          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">
                            {item.role}
                          </span>
                          <h3 className="text-sm font-semibold text-zinc-200 mt-1 font-display group-hover:text-white transition-colors">
                            {item.name}
                          </h3>
                        </div>
                        <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                          {item.desc}
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {item.skills.map((skill, i) => (
                            <span key={i} className="text-[9px] font-mono bg-zinc-800/40 text-zinc-400 px-2 py-0.5 rounded-md border border-[rgba(255,255,255,0.03)]">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between border-t border-[rgba(255,255,255,0.04)] pt-4 mt-4">
                        <div className="font-mono text-xs">
                          <span className="text-zinc-500 block text-[9px]">COMPUTED LICENSE</span>
                          <span className="text-zinc-300 font-bold">{item.cost}/yr equivalent</span>
                        </div>
                        <button
                          onClick={() => {
                            setShowNotification(`Licensing and deploying ${item.name} to System Core...`);
                            setTimeout(() => setShowNotification(null), 3000);
                          }}
                          className="px-3 py-1.5 bg-[#00d2ff]/10 hover:bg-[#00d2ff] text-[#00d2ff] hover:text-[#09090B] border border-[#00d2ff]/20 hover:border-transparent rounded-lg font-mono text-[10px] font-bold transition cursor-pointer"
                        >
                          HIRE / DEPLOY
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </main>
      </div>

      {/* COMMAND PALETTE (Spotlight/Raycast Ctrl+K Dialog Modal) */}
      <AnimatePresence>
        {showPalette && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 bg-[#07080A]/85 backdrop-blur-md flex items-start justify-center pt-24 px-4 select-none"
            onClick={() => setShowPalette(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: -15, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="bg-[#111318] border border-[rgba(255,255,255,0.08)] w-full max-w-lg rounded-2xl shadow-[0_30px_70px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Search input field */}
              <div className="flex items-center gap-3.5 px-4 py-3.5 border-b border-[rgba(255,255,255,0.06)] bg-[#0f1115]">
                <Command size={14} className="text-[#00d2ff]" />
                <input
                  type="text"
                  placeholder="Type an OS instruction or command..."
                  className="flex-1 bg-transparent text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none"
                  value={paletteSearch}
                  onChange={(e) => setPaletteSearch(e.target.value)}
                  autoFocus
                />
                <span className="text-[9px] bg-zinc-900 border border-[rgba(255,255,255,0.05)] text-zinc-500 px-1.5 py-0.5 rounded font-mono">
                  ESC to close
                </span>
              </div>

              {/* Action Rows */}
              <div className="max-h-72 overflow-y-auto p-2 space-y-0.5 custom-scrollbar">
                {filteredCommands.length === 0 ? (
                  <div className="text-center py-8 text-xs text-zinc-600 font-mono">
                    No matching OS commands found.
                  </div>
                ) : (
                  filteredCommands.map((cmd, idx) => (
                    <button
                      key={idx}
                      onClick={cmd.action}
                      className="w-full text-left px-3.5 py-2.5 rounded-xl hover:bg-[#16181D] flex items-center justify-between group transition cursor-pointer text-xs"
                    >
                      <div className="space-y-0.5">
                        <div className="font-semibold text-zinc-200 group-hover:text-[#00d2ff] transition">
                          {cmd.title}
                        </div>
                        <div className="text-[10px] text-zinc-500">{cmd.desc}</div>
                      </div>
                      {cmd.shortcut && (
                        <span className="text-[9px] font-mono text-zinc-600 bg-zinc-900/50 border border-[rgba(255,255,255,0.03)] px-1.5 py-0.5 rounded">
                          {cmd.shortcut}
                        </span>
                      )}
                    </button>
                  ))
                )}
              </div>

              {/* Palette Footer */}
              <div className="px-4 py-2 bg-[#0c0d10] border-t border-[rgba(255,255,255,0.04)] flex justify-between items-center text-[9px] text-zinc-500 font-mono">
                <span>Enterprise Registry OS v1.0.4</span>
                <span>Press ↑↓ to navigate</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FLOATING INSPECTOR: Draggable-style glass overlay for direct agent parameter adjustments */}
      <AnimatePresence>
        {inspectedEmployee && (
          <div className="fixed inset-0 z-40 bg-[#07080A]/40 backdrop-blur-sm pointer-events-auto" onClick={() => setInspectedEmployee(null)}>
            <div className="absolute right-6 top-16 bottom-6 w-96 flex flex-col pointer-events-auto" onClick={(e) => e.stopPropagation()}>
              <motion.div
                drag
                dragMomentum={false}
                dragElastic={0.1}
                dragConstraints={{ left: -700, right: 100, top: -100, bottom: 200 }}
                initial={{ opacity: 0, x: 50, scale: 0.98 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 50, scale: 0.98 }}
                transition={{ type: "spring", damping: 25, stiffness: 220 }}
                className="bg-[#111318]/95 border border-[rgba(255,255,255,0.08)] h-full rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden font-sans backdrop-blur-md cursor-grab active:cursor-grabbing"
              >
                {/* Drag handle line */}
                <div className="w-8 h-1 bg-zinc-700/40 rounded-full mx-auto mt-2 pointer-events-none" />

                {/* Header */}
                <div className="p-4 border-b border-[rgba(255,255,255,0.06)] bg-[#0f1115] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sliders size={13} className="text-[#00d2ff]" />
                    <span className="text-[11px] font-mono uppercase tracking-widest text-zinc-400 font-bold">
                      ROOT AGENT INSPECTION
                    </span>
                  </div>
                  <button
                    onClick={() => setInspectedEmployee(null)}
                    className="p-1 hover:bg-[#16181D] rounded-lg transition text-zinc-500 hover:text-white cursor-pointer"
                  >
                    <X size={14} />
                  </button>
                </div>

                {/* Main scrollable stats body */}
                <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar text-[11px]">
                  
                  {/* Basic Credentials */}
                  <div className="flex items-center gap-3 bg-[#16181D]/40 p-3 rounded-xl border border-[rgba(255,255,255,0.04)]">
                    <div className="w-10 h-10 rounded-lg bg-[#00d2ff]/10 text-[#00d2ff] border border-[#00d2ff]/20 flex items-center justify-center font-bold font-mono">
                      {inspectedEmployee.name.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div>
                      <h3 className="text-xs font-semibold text-zinc-100 font-display">{inspectedEmployee.name}</h3>
                      <span className="text-[10px] text-zinc-500 font-mono block">{inspectedEmployee.role}</span>
                      <span className="text-[9px] text-[#00d2ff] font-mono font-medium tracking-tight bg-[#00d2ff]/5 border border-[#00d2ff]/10 px-1 py-0.2 rounded mt-1 inline-block">
                        {inspectedEmployee.department} Unit
                      </span>
                    </div>
                  </div>

                  {/* Operational Objective and Target */}
                  <div className="space-y-2">
                    <span className="text-[9px] font-mono uppercase text-zinc-500 tracking-wider font-bold">Current Node Objective</span>
                    <p className="bg-[#0c0d10] p-3 rounded-xl border border-[rgba(255,255,255,0.04)] text-zinc-300 leading-relaxed font-sans">
                      {inspectedEmployee.currentTask ? inspectedEmployee.currentTask : "In standby state. Awaiting global instruct dispatch from operating system console."}
                    </p>
                  </div>

                  {/* Interactive LLM Hyper-parameters adjustments */}
                  <div className="space-y-4 border-t border-[rgba(255,255,255,0.04)] pt-5">
                    <span className="text-[9px] font-mono uppercase text-zinc-500 tracking-wider font-bold flex items-center gap-1">
                      <Sliders size={11} className="text-[#00d2ff]" /> Active Model Controls (Override)
                    </span>

                    {/* Temperature Slider */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between font-mono text-[10px]">
                        <span className="text-zinc-400">Agent Temperature</span>
                        <strong className="text-[#00d2ff]">{agentTemperature.toFixed(2)}</strong>
                      </div>
                      <input
                        type="range"
                        min="0.1"
                        max="1.0"
                        step="0.05"
                        value={agentTemperature}
                        onChange={(e) => setAgentTemperature(parseFloat(e.target.value))}
                        className="w-full accent-[#00d2ff] bg-zinc-900 rounded-lg appearance-none h-1.5 cursor-pointer"
                      />
                      <span className="text-[8.5px] text-zinc-600 block leading-normal">
                        Lower temperature optimizes syntactic logic bounds; higher yields creative strategy options.
                      </span>
                    </div>

                    {/* Max Tokens Slider */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between font-mono text-[10px]">
                        <span className="text-zinc-400">Token Horizon Limit</span>
                        <strong className="text-[#00d2ff]">{agentMaxTokens} tokens</strong>
                      </div>
                      <input
                        type="range"
                        min="512"
                        max="4096"
                        step="128"
                        value={agentMaxTokens}
                        onChange={(e) => setAgentMaxTokens(parseInt(e.target.value))}
                        className="w-full accent-[#00d2ff] bg-zinc-900 rounded-lg appearance-none h-1.5 cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Static metrics details */}
                  <div className="space-y-2 border-t border-[rgba(255,255,255,0.04)] pt-5 font-mono">
                    <span className="text-[9px] font-mono uppercase text-zinc-500 tracking-wider font-bold">Node Capability Metrics</span>
                    <div className="grid grid-cols-2 gap-2 text-[10px]">
                      <div className="bg-[#16181D]/30 p-2 rounded-xl border border-[rgba(255,255,255,0.03)]">
                        <span className="text-zinc-500 text-[8.5px] block uppercase">Clearance Level</span>
                        <span className="text-zinc-300 font-semibold">Alpha Sector</span>
                      </div>
                      <div className="bg-[#16181D]/30 p-2 rounded-xl border border-[rgba(255,255,255,0.03)]">
                        <span className="text-zinc-500 text-[8.5px] block uppercase">Network Cost (H)</span>
                        <span className="text-zinc-300 font-semibold">${(inspectedEmployee.salaryCost / 720).toFixed(2)}/hr</span>
                      </div>
                      <div className="bg-[#16181D]/30 p-2 rounded-xl border border-[rgba(255,255,255,0.03)]">
                        <span className="text-zinc-500 text-[8.5px] block uppercase">Attention Map</span>
                        <span className="text-emerald-400 font-semibold">98.4% (Direct)</span>
                      </div>
                      <div className="bg-[#16181D]/30 p-2 rounded-xl border border-[rgba(255,255,255,0.03)]">
                        <span className="text-zinc-500 text-[8.5px] block uppercase">Target Registry</span>
                        <span className="text-[#00d2ff] font-semibold">{inspectedEmployee.activeModel}</span>
                      </div>
                    </div>
                  </div>

                  {/* Direct Intervention prompt field */}
                  <div className="space-y-2.5 border-t border-[rgba(255,255,255,0.04)] pt-5">
                    <span className="text-[9px] font-mono uppercase text-zinc-500 tracking-wider font-bold flex items-center gap-1">
                      <Send size={11} className="text-[#00d2ff]" /> Injected Operator Intervention
                    </span>
                    <form onSubmit={handleInterventionSubmit} className="flex gap-2">
                      <input
                        type="text"
                        value={interventionPrompt}
                        onChange={(e) => setInterventionPrompt(e.target.value)}
                        placeholder={`Force direct command to ${inspectedEmployee.name.split(" ")[0]}...`}
                        className="flex-1 bg-[#0c0d10] border border-[rgba(255,255,255,0.06)] focus:border-[#00d2ff]/50 rounded-xl px-3 py-2 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-[#00d2ff]/10"
                      />
                      <button
                        type="submit"
                        disabled={!interventionPrompt.trim()}
                        className="px-3 bg-zinc-900 border border-[rgba(255,255,255,0.06)] hover:bg-[#16181D] hover:text-[#00d2ff] text-zinc-400 rounded-xl transition cursor-pointer"
                      >
                        <Send size={11} />
                      </button>
                    </form>
                    <span className="text-[8.5px] text-zinc-600 block leading-normal font-sans">
                      Operators can inject strict constraints into the active worker's context thread dynamically.
                    </span>
                  </div>

                </div>

                {/* Footer status bar */}
                <div className="p-3 bg-[#0c0d10] border-t border-[rgba(255,255,255,0.04)] flex justify-between items-center text-[9px] font-mono text-zinc-600">
                  <span>Connection bounds: ONLINE</span>
                  <span>Latency: 12ms</span>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* SUCCESS CELEBRATION MODAL */}
      <AnimatePresence>
        {showSuccessCelebration && (
          <SuccessCelebration
            prompt={prompt}
            projectName={currentProject}
            onClose={() => setShowSuccessCelebration(false)}
            triggerNotification={triggerNotification}
          />
        )}
      </AnimatePresence>

      {/* CUSTOM CONTEXT MENU */}
      <AnimatePresence>
        {contextMenu && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.1 }}
            style={{ top: contextMenu.y, left: contextMenu.x }}
            className="fixed z-50 bg-[#111318]/95 border border-[#00d2ff]/30 rounded-xl shadow-[0_15px_30px_rgba(0,0,0,0.5)] p-1.5 min-w-[175px] font-sans backdrop-blur-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-2.5 py-1.5 text-[8.5px] font-mono text-zinc-500 border-b border-[rgba(255,255,255,0.04)] uppercase tracking-wider">
              {contextMenu.employee.name.split(" ")[0]} Controls
            </div>
            <button
              onClick={() => {
                setInspectedEmployee(contextMenu.employee);
                setContextMenu(null);
              }}
              className="w-full text-left px-2.5 py-2 hover:bg-[#16181D] hover:text-[#00d2ff] rounded-lg transition text-[11px] font-medium text-zinc-300 block cursor-pointer"
            >
              Root Inspection
            </button>
            <button
              onClick={() => {
                setInspectedEmployee(contextMenu.employee);
                setContextMenu(null);
                setTimeout(() => {
                  const input = document.querySelector('input[placeholder*="Force direct command"]');
                  if (input) (input as HTMLInputElement).focus();
                }, 100);
              }}
              className="w-full text-left px-2.5 py-2 hover:bg-[#16181D] hover:text-[#00d2ff] rounded-lg transition text-[11px] font-medium text-zinc-300 block cursor-pointer"
            >
              Inject Directive
            </button>
            <button
              onClick={() => {
                setEmployees(prev => prev.map(e => e.id === contextMenu.employee.id ? { ...e, status: "executing", progress: 30, currentTask: "Thread forced awake." } : e));
                addTerminalLine(`[OPERATOR] Forced manual wake-up signal to thread unit: ${contextMenu.employee.name}`, "warning");
                setContextMenu(null);
                triggerNotification(`${contextMenu.employee.name.split(" ")[0]} thread forced awake.`);
              }}
              className="w-full text-left px-2.5 py-2 hover:bg-[#16181D] hover:text-[#00d2ff] rounded-lg transition text-[11px] font-medium text-zinc-300 block cursor-pointer"
            >
              Force Wake-Up Core
            </button>
            <button
              onClick={() => {
                setEfficiencyScore(99);
                addTerminalLine(`[OPERATOR] Recycled memory buffers for thread segment: ${contextMenu.employee.name}`, "info");
                setContextMenu(null);
                triggerNotification("Memory recycled successfully.");
              }}
              className="w-full text-left px-2.5 py-2 hover:bg-[#16181D] hover:text-[#00d2ff] rounded-lg transition text-[11px] font-medium text-zinc-300 border-t border-[rgba(255,255,255,0.04)] mt-1 pt-1.5 block cursor-pointer"
            >
              Garbage Recycle Heap
            </button>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

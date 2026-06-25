import React, { useState } from "react";
import { Folder, File, ChevronRight, ChevronDown, Code, Copy, Check, GitCommit, Eye, GitBranch, History } from "lucide-react";
import { ARCHITECTURE_DATA } from "../data/architecture";
import { motion, AnimatePresence } from "motion/react";

interface FileNodeProps {
  name: string;
  type: "file" | "directory";
  path: string;
  size?: string;
  onSelectFile: (path: string) => void;
  selectedFilePath: string;
}

const FileNode: React.FC<FileNodeProps> = ({ name, type, path, size, onSelectFile, selectedFilePath }) => {
  const [isOpen, setIsOpen] = useState(true);
  const isSelected = selectedFilePath === path;

  // Render dummy children for mocked directories to simulate a real file tree
  const getMockChildren = () => {
    if (path === "backend") {
      return [
        { name: "app", type: "directory", path: "backend/app" },
        { name: "requirements.txt", type: "file", path: "backend/requirements.txt", size: "1.2 KB" }
      ];
    }
    if (path === "backend/app") {
      return [
        { name: "core", type: "directory", path: "backend/app/core" },
        { name: "models", type: "directory", path: "backend/app/models" },
        { name: "agents", type: "directory", path: "backend/app/agents" },
        { name: "controllers.py", type: "file", path: "backend/app/controllers.py", size: "Real Time" },
        { name: "run_workflow.py", type: "file", path: "backend/app/run_workflow.py", size: "18.7 KB" }
      ];
    }
    if (path === "backend/app/core") {
      return [
        { name: "config.py", type: "file", path: "backend/app/core/config.py", size: "2.5 KB" },
        { name: "database.py", type: "file", path: "backend/app/core/database.py", size: "1.3 KB" },
        { name: "redis.py", type: "file", path: "backend/app/core/redis.py", size: "1.9 KB" },
        { name: "logging.py", type: "file", path: "backend/app/core/logging.py", size: "1.5 KB" },
        { name: "memory.py", type: "file", path: "backend/app/core/memory.py", size: "3.2 KB" }
      ];
    }
    if (path === "backend/app/models") {
      return [
        { name: "ollama_client.py", type: "file", path: "backend/app/models/ollama_client.py", size: "2.1 KB" },
        { name: "model_manager.py", type: "file", path: "backend/app/models/model_manager.py", size: "1.8 KB" }
      ];
    }
    if (path === "backend/app/agents") {
      return [
        { name: "registry.py", type: "file", path: "backend/app/agents/registry.py", size: "2.8 KB" },
        { name: "planner.py", type: "file", path: "backend/app/agents/planner.py", size: "3.4 KB" },
        { name: "router.py", type: "file", path: "backend/app/agents/router.py", size: "1.9 KB" },
        { name: "tools.py", type: "file", path: "backend/app/agents/tools.py", size: "2.2 KB" }
      ];
    }
    if (path === "frontend") {
      return [
        { name: "src", type: "directory", path: "frontend/src" },
        { name: "package.json", type: "file", path: "frontend/package.json", size: "950 B" }
      ];
    }
    if (path === "frontend/src") {
      return [
        { name: "App.tsx", type: "file", path: "frontend/src/App.tsx", size: "28.5 KB" },
        { name: "index.css", type: "file", path: "frontend/src/index.css", size: "2.0 KB" }
      ];
    }
    return [];
  };

  if (type === "directory") {
    return (
      <div className="pl-3">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 py-1 text-zinc-400 hover:text-zinc-200 transition text-[11px] font-medium cursor-pointer w-full text-left"
        >
          {isOpen ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
          <Folder size={12} className="text-[#00d2ff]/80 fill-[#00d2ff]/5" />
          <span>{name}</span>
        </button>
        {isOpen && (
          <div className="border-l border-[rgba(255,255,255,0.04)] ml-1.5 pl-1.5 mt-0.5 space-y-0.5">
            {getMockChildren().map((child) => (
              <FileNode
                key={child.path}
                name={child.name}
                type={child.type as any}
                path={child.path}
                size={(child as any).size}
                onSelectFile={onSelectFile}
                selectedFilePath={selectedFilePath}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="pl-4.5">
      <button
        onClick={() => onSelectFile(path)}
        className={`flex items-center justify-between py-1 px-1.5 rounded-md w-full text-left transition text-[11px] cursor-pointer ${
          isSelected 
            ? "bg-[#16181D] text-[#00d2ff] font-medium border border-[rgba(255,255,255,0.04)]" 
            : "text-zinc-500 hover:text-zinc-300 hover:bg-[#16181D]/30 border border-transparent"
        }`}
      >
        <div className="flex items-center gap-1.5">
          <File size={11} className={isSelected ? "text-[#00d2ff]" : "text-zinc-500"} />
          <span>{name}</span>
        </div>
        {size && <span className="text-[8.5px] text-zinc-600 font-mono select-none">{size}</span>}
      </button>
    </div>
  );
};

export const FilesPanel: React.FC = () => {
  const [selectedFilePath, setSelectedFilePath] = useState("backend/app/core/config.py");
  const [copied, setCopied] = useState(false);
  const [editorTab, setEditorTab] = useState<"code" | "diff" | "blame" | "history">("code");

  const activeModule = ARCHITECTURE_DATA.find((m) => m.path === selectedFilePath);

  const getFileContent = () => {
    if (selectedFilePath === "backend/app/controllers.py") {
      return localStorage.getItem("backend_controllers_code") || `# [Devon Brooks] Code output will stream here live during execution.\n# Click "Run" on dashboard to begin real generation.`;
    }
    if (selectedFilePath === "frontend/src/App.tsx") {
      return localStorage.getItem("frontend_app_code") || `// [Chloe Chen] Code output will stream here live during execution.\n// Click "Run" on dashboard to begin real generation.`;
    }
    if (activeModule) return activeModule.code;
    if (selectedFilePath === "backend/requirements.txt") {
      return `fastapi==0.110.0\nuvicorn==0.28.0\npydantic==2.6.4\npydantic-settings==2.2.1\nsqlalchemy[asyncio]==2.0.28\nasyncpg==0.29.0\nredis==5.0.3\npython-multipart==0.0.9\njwt==1.3.1\nollama==0.1.7\n`;
    }
    if (selectedFilePath === "frontend/package.json") {
      return `{\n  "name": "ai-cos-frontend",\n  "private": true,\n  "version": "1.0.0",\n  "type": "module",\n  "dependencies": {\n    "lucide-react": "^0.359.0",\n    "react": "^19.0.0",\n    "react-dom": "^19.0.0",\n    "motion": "^12.0.0"\n  }\n}`;
    }
    return `# File: ${selectedFilePath}\n# Content available in sandbox workspace container.\n# Status: READABLE\n\nimport os\n\nprint("Sandbox file loaded successfully.")\n`;
  };

  const getFileAuthor = () => {
    if (selectedFilePath.includes("config") || selectedFilePath.includes("database")) return "Ethan Thorne";
    if (selectedFilePath.includes("planner")) return "Liam Vance";
    if (selectedFilePath.includes("App")) return "Maya Lin";
    return "Sophia Sterling";
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getFileContent());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const code = getFileContent();
  const lines = code.split("\n");

  const mockCommits = [
    { hash: "8f7da1a", author: getFileAuthor(), date: "2 hours ago", msg: `Optimize performance bounds on ${selectedFilePath.split("/").pop()}` },
    { hash: "4c11b02", author: "Sophia Sterling", date: "1 day ago", msg: "Establish declarative schemas & typing boundary checks" },
    { hash: "f99aa03", author: getFileAuthor(), date: "3 days ago", msg: "Initial sandbox implementation & structural unit tests passed" }
  ];

  return (
    <div className="flex-1 bg-[#111318] border border-[rgba(255,255,255,0.06)] rounded-xl flex h-[580px] overflow-hidden select-text font-sans">
      {/* File Tree Sidebar */}
      <div className="w-56 border-r border-[rgba(255,255,255,0.06)] p-3.5 overflow-y-auto bg-[#0f1115] select-none shrink-0 custom-scrollbar">
        <div className="text-[9px] font-mono uppercase tracking-widest text-zinc-500 mb-3 px-1 font-semibold">
          Workspace Files
        </div>
        <div className="space-y-0.5">
          <FileNode
            name="backend"
            type="directory"
            path="backend"
            onSelectFile={setSelectedFilePath}
            selectedFilePath={selectedFilePath}
          />
          <FileNode
            name="frontend"
            type="directory"
            path="frontend"
            onSelectFile={setSelectedFilePath}
            selectedFilePath={selectedFilePath}
          />
        </div>
      </div>

      {/* Code Editor Preview */}
      <div className="flex-1 flex flex-col bg-[#111318]">
        {/* Editor Tab Bar */}
        <div className="h-9 border-b border-[rgba(255,255,255,0.05)] px-3 flex items-center justify-between bg-[#111318] select-none">
          <div className="flex items-center gap-1.5 overflow-x-auto shrink-0">
            <span className="text-[10px] text-zinc-400 bg-zinc-900 border border-[rgba(255,255,255,0.06)] px-1.5 py-0.5 rounded font-mono shrink-0 mr-1.5">{selectedFilePath.split("/").pop()}</span>
            
            <button 
              onClick={() => setEditorTab("code")}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-t-md text-[10.5px] font-medium transition ${
                editorTab === "code" ? "text-[#00d2ff] bg-[#16181D]/80 border-b border-[#00d2ff]" : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <Code size={11} /> <span>Code</span>
            </button>
            <button 
              onClick={() => setEditorTab("diff")}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-t-md text-[10.5px] font-medium transition ${
                editorTab === "diff" ? "text-[#00d2ff] bg-[#16181D]/80 border-b border-[#00d2ff]" : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <GitBranch size={11} /> <span>Diff Viewer</span>
            </button>
            <button 
              onClick={() => setEditorTab("blame")}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-t-md text-[10.5px] font-medium transition ${
                editorTab === "blame" ? "text-[#00d2ff] bg-[#16181D]/80 border-b border-[#00d2ff]" : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <Eye size={11} /> <span>Git Blame</span>
            </button>
            <button 
              onClick={() => setEditorTab("history")}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-t-md text-[10.5px] font-medium transition ${
                editorTab === "history" ? "text-[#00d2ff] bg-[#16181D]/80 border-b border-[#00d2ff]" : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <History size={11} /> <span>History</span>
            </button>
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2 py-0.5 text-[10px] bg-[#16181D] hover:bg-zinc-800 border border-[rgba(255,255,255,0.06)] rounded-md text-zinc-300 hover:text-white transition font-mono cursor-pointer"
          >
            {copied ? (
              <>
                <Check size={10} className="text-emerald-500" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy size={10} />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>

        {/* Editor Main Content */}
        <div className="flex-1 overflow-auto bg-[#0c0d10]/50 custom-scrollbar select-text">
          {editorTab === "code" && (
            <div className="p-4 font-mono text-[11px] text-zinc-300 leading-relaxed whitespace-pre overflow-x-auto">
              {lines.map((line, idx) => (
                <div key={idx} className="table-row hover:bg-zinc-900/40">
                  <span className="table-cell text-right pr-4 text-zinc-600 select-none w-8 text-[10px]">{idx + 1}</span>
                  <span className="table-cell text-zinc-300">{line || " "}</span>
                </div>
              ))}
            </div>
          )}

          {editorTab === "diff" && (
            <div className="p-4 font-mono text-[11px] text-zinc-300 leading-relaxed whitespace-pre overflow-x-auto">
              <div className="text-zinc-500 border-b border-[rgba(255,255,255,0.04)] pb-1.5 mb-2 select-none text-[10px]">
                Showing differences against branch <span className="text-[#00d2ff]">main</span>
              </div>
              {lines.map((line, idx) => {
                const isConfigLine = idx === 4 || idx === 10 || idx === 12;
                return (
                  <div key={idx} className={`table-row ${isConfigLine ? "bg-emerald-950/20 text-emerald-300" : ""}`}>
                    <span className="table-cell text-right pr-4 text-zinc-600 select-none w-8 text-[10px]">{idx + 1}</span>
                    <span className="table-cell pr-2 text-zinc-600 select-none w-4">{isConfigLine ? "+" : " "}</span>
                    <span className="table-cell">{line || " "}</span>
                  </div>
                );
              })}
            </div>
          )}

          {editorTab === "blame" && (
            <div className="p-4 font-mono text-[11px] text-zinc-300 leading-relaxed whitespace-pre overflow-x-auto">
              <table className="w-full">
                <tbody>
                  {lines.map((line, idx) => {
                    const author = getFileAuthor();
                    return (
                      <tr key={idx} className="hover:bg-zinc-900/40 border-b border-transparent">
                        <td className="text-right pr-3 text-zinc-600 select-none w-8 text-[10px]">{idx + 1}</td>
                        <td className="text-left pr-3 text-zinc-500 select-none w-36 text-[9.5px] border-r border-[rgba(255,255,255,0.04)] font-sans truncate max-w-[120px]">
                          {author} <span className="text-[8px] text-zinc-600 opacity-80">2d ago</span>
                        </td>
                        <td className="pl-3 text-zinc-300 whitespace-pre">{line || " "}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {editorTab === "history" && (
            <div className="p-5 font-sans">
              <div className="text-zinc-500 font-mono text-[10px] mb-4 uppercase tracking-wider">Commit logs for this file</div>
              <div className="relative border-l border-[rgba(255,255,255,0.05)] pl-4 ml-2 space-y-5">
                {mockCommits.map((c, i) => (
                  <div key={i} className="relative group">
                    <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-[#16181D] border border-[#00d2ff] flex items-center justify-center">
                      <span className="w-1 h-1 bg-[#00d2ff] rounded-full animate-pulse" />
                    </span>
                    <div className="text-xs font-semibold text-zinc-200 group-hover:text-[#00d2ff] transition">{c.msg}</div>
                    <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-mono mt-1">
                      <span className="text-[#00d2ff]">{c.hash}</span>
                      <span>•</span>
                      <span>{c.author}</span>
                      <span>•</span>
                      <span>{c.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


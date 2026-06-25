import React from "react";
import { 
  LayoutGrid, 
  Brain, 
  Users, 
  Workflow, 
  Cpu, 
  Wrench, 
  BookOpen, 
  FileCode, 
  Terminal, 
  Settings,
  ShoppingBag,
  ChevronRight
} from "lucide-react";

export type SidebarTab = 
  | "dashboard" 
  | "projects" 
  | "employees" 
  | "workflows" 
  | "models" 
  | "tools" 
  | "knowledge" 
  | "files" 
  | "terminal" 
  | "marketplace"
  | "settings";

interface SidebarProps {
  activeTab: SidebarTab;
  onChangeTab: (tab: SidebarTab) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onChangeTab }) => {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutGrid },
    { id: "projects", label: "Project Brain", icon: Brain },
    { id: "employees", label: "Employees", icon: Users },
    { id: "workflows", label: "Workflows", icon: Workflow },
    { id: "models", label: "Models", icon: Cpu },
    { id: "tools", label: "Tools", icon: Wrench },
    { id: "knowledge", label: "Knowledge", icon: BookOpen },
    { id: "files", label: "Files", icon: FileCode },
    { id: "terminal", label: "Terminal", icon: Terminal },
    { id: "marketplace", label: "Marketplace", icon: ShoppingBag },
    { id: "settings", label: "Settings", icon: Settings },
  ] as const;

  return (
    <aside className="w-16 md:w-52 border-r border-[rgba(255,255,255,0.06)] bg-[#111318] flex flex-col justify-between p-3 shrink-0 font-sans transition-all duration-300">
      <div className="flex flex-col gap-5">
        <div className="hidden md:block text-[10px] font-mono font-medium text-zinc-500 uppercase tracking-widest px-3 pt-2">
          SYSTEM CORE
        </div>
        
        <nav className="flex flex-col gap-0.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onChangeTab(item.id)}
                className={`w-full flex items-center justify-center md:justify-between px-3 py-2 rounded-md text-xs font-medium transition-all duration-150 cursor-pointer group ${
                  isActive 
                    ? "bg-[#16181D] text-white border border-[rgba(255,255,255,0.06)] shadow-sm" 
                    : "text-zinc-400 hover:text-zinc-100 hover:bg-[#16181D]/40 border border-transparent"
                }`}
                title={item.label}
              >
                <div className="flex items-center gap-2.5">
                  <Icon 
                    size={14} 
                    strokeWidth={1.8}
                    className={`transition-colors duration-150 ${
                      isActive ? "text-[#00d2ff]" : "text-zinc-400 group-hover:text-zinc-200"
                    }`} 
                  />
                  <span className="hidden md:inline font-sans text-[12px]">{item.label}</span>
                </div>
                {isActive && (
                  <ChevronRight size={10} className="hidden md:inline text-zinc-600" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="hidden md:block px-3 py-2 border-t border-[rgba(255,255,255,0.04)] text-[10px] text-zinc-600 font-mono text-center">
        AI-COS Platform
      </div>
    </aside>
  );
};


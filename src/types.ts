export interface Employee {
  id: string;
  name: string;
  role: string;
  department: string;
  avatarUrl?: string;
  currentTask: string | null;
  activeModel: string;
  status: "idle" | "planning" | "executing" | "success" | "failed";
  progress: number;
  performanceScore: number;
  experienceScore: number;
  reliabilityScore: number;
  salaryCost: number;
  skills: string[];
  recentLog?: string;
}

export interface WorkflowNode {
  id: string;
  label: string;
  role: string;
  status: "pending" | "active" | "completed" | "failed";
  dependencies: string[];
}

export interface TerminalLine {
  id: string;
  text: string;
  timestamp: string;
  type: "info" | "success" | "warning" | "error" | "command" | "output";
}

export interface ActivityLog {
  id: string;
  employeeId: string;
  employeeName: string;
  role: string;
  message: string;
  timestamp: string;
  status: "info" | "success" | "warning" | "error";
}

export interface FileItem {
  name: string;
  path: string;
  type: "file" | "directory";
  size?: string;
  children?: FileItem[];
}

export interface ModelMetric {
  name: string;
  calls: number;
  tokens: number;
  cost: number;
}

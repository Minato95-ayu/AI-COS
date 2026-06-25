import { Employee, WorkflowNode, TerminalLine, ActivityLog, FileItem, ModelMetric } from "../types";

export const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: "emp-ceo-01",
    name: "Sophia Sterling",
    role: "CEO",
    department: "Executive",
    currentTask: null,
    activeModel: "gemini-2.5-flash",
    status: "idle",
    progress: 0,
    performanceScore: 98,
    experienceScore: 99,
    reliabilityScore: 99,
    salaryCost: 500000,
    skills: ["Strategic Planning", "Capital Allocation", "Enterprise Risk"]
  },
  {
    id: "emp-pm-02",
    name: "David Vance",
    role: "Project Manager",
    department: "Management",
    currentTask: null,
    activeModel: "gemini-2.5-flash",
    status: "idle",
    progress: 0,
    performanceScore: 94,
    experienceScore: 92,
    reliabilityScore: 95,
    salaryCost: 180000,
    skills: ["Resource Planning", "Timeline Optimization", "Milestone Tracking"]
  },
  {
    id: "emp-planner-03",
    name: "Liam Vance",
    role: "Planner",
    department: "Strategy",
    currentTask: null,
    activeModel: "gemini-2.5-flash",
    status: "idle",
    progress: 0,
    performanceScore: 96,
    experienceScore: 95,
    reliabilityScore: 97,
    salaryCost: 160000,
    skills: ["DAG Generation", "Dependency Decomposition", "Schema Architecture"]
  },
  {
    id: "emp-backend-04",
    name: "Ethan Thorne",
    role: "Backend Engineer",
    department: "Engineering",
    currentTask: null,
    activeModel: "gemini-2.5-flash",
    status: "idle",
    progress: 0,
    performanceScore: 95,
    experienceScore: 96,
    reliabilityScore: 94,
    salaryCost: 150000,
    skills: ["FastAPI", "PostgreSQL", "Redis", "Distributed Task Queues"]
  },
  {
    id: "emp-frontend-05",
    name: "Maya Lin",
    role: "Frontend Engineer",
    department: "Engineering",
    currentTask: null,
    activeModel: "gemini-2.5-flash",
    status: "idle",
    progress: 0,
    performanceScore: 97,
    experienceScore: 94,
    reliabilityScore: 96,
    salaryCost: 145000,
    skills: ["React 19", "Vite", "Tailwind CSS", "Framer Motion"]
  },
  {
    id: "emp-reviewer-06",
    name: "Lucas Mercer",
    role: "Reviewer / QA",
    department: "Quality Assurance",
    currentTask: null,
    activeModel: "gemini-2.5-flash",
    status: "idle",
    progress: 0,
    performanceScore: 93,
    experienceScore: 91,
    reliabilityScore: 98,
    salaryCost: 135000,
    skills: ["Unit Testing", "Code Auditing", "Integration Gatekeeping"]
  }
];

export const INITIAL_TERMINAL_LINES: TerminalLine[] = [
  {
    id: "term-1",
    text: "Initializing AI-COS Kernel v1.0...",
    timestamp: "11:00:00",
    type: "info"
  },
  {
    id: "term-2",
    text: "Connecting to secure local Redis broker state lock...",
    timestamp: "11:00:01",
    type: "info"
  },
  {
    id: "term-3",
    text: "Redis cluster: CONNECTED. Version: 7.2.4 | Port: 6379",
    timestamp: "11:00:01",
    type: "success"
  },
  {
    id: "term-4",
    text: "Establishing async PostgreSQL connection pool...",
    timestamp: "11:00:02",
    type: "info"
  },
  {
    id: "term-5",
    text: "SQL Database: CONNECTED. 20 active connections in pool.",
    timestamp: "11:00:02",
    type: "success"
  },
  {
    id: "term-6",
    text: "Registering enterprise digital workforce (6 certified employees)...",
    timestamp: "11:00:03",
    type: "info"
  },
  {
    id: "term-7",
    text: "Sophia Sterling (CEO) clearance level: ADMINISTRATIVE. Status: IDLE",
    timestamp: "11:00:03",
    type: "success"
  },
  {
    id: "term-8",
    text: "All agent runtimes initialized. Operating System is READY.",
    timestamp: "11:00:04",
    type: "success"
  }
];

export const INITIAL_ACTIVITY_LOGS: ActivityLog[] = [
  {
    id: "log-1",
    employeeId: "emp-ceo-01",
    employeeName: "Sophia Sterling",
    role: "CEO",
    message: "Authorized quarterly product launch directive.",
    timestamp: "11:00:03",
    status: "success"
  },
  {
    id: "log-2",
    employeeId: "emp-pm-02",
    employeeName: "David Vance",
    role: "Project Manager",
    message: "Synchronized active roadmap items with strategic requirements.",
    timestamp: "11:00:04",
    status: "info"
  },
  {
    id: "log-3",
    employeeId: "emp-planner-03",
    employeeName: "Liam Vance",
    role: "Planner",
    message: "Verified structural validity of parallel backend/frontend branches.",
    timestamp: "11:00:05",
    status: "info"
  }
];

export const INITIAL_MODEL_METRICS: ModelMetric[] = [
  { name: "gemini-2.5-flash", calls: 42, tokens: 284500, cost: 0.14 },
  { name: "gemini-2.5-pro", calls: 12, tokens: 95400, cost: 0.67 },
  { name: "llama-3.3-70b", calls: 8, tokens: 41200, cost: 0.00 },
  { name: "qwen-2.5-coder", calls: 24, tokens: 165000, cost: 0.00 }
];

export const WORKFLOW_STEPS: WorkflowNode[] = [
  { id: "ceo", label: "CEO Directive", role: "CEO", status: "pending", dependencies: [] },
  { id: "pm", label: "Roadmap Planning", role: "Project Manager", status: "pending", dependencies: ["ceo"] },
  { id: "planner", label: "DAG Generation", role: "Planner", status: "pending", dependencies: ["pm"] },
  { id: "backend", label: "Backend API", role: "Backend Engineer", status: "pending", dependencies: ["planner"] },
  { id: "frontend", label: "Frontend UI", role: "Frontend Engineer", status: "pending", dependencies: ["planner"] },
  { id: "qa", label: "Code Verification", role: "Reviewer / QA", status: "pending", dependencies: ["backend", "frontend"] },
  { id: "merge", label: "Sandbox Merge", role: "CEO", status: "pending", dependencies: ["qa"] }
];

export const MOCK_PROJECT_FILES: FileItem[] = [
  {
    name: "backend",
    path: "backend",
    type: "directory",
    children: [
      {
        name: "app",
        path: "backend/app",
        type: "directory",
        children: [
          { name: "config.py", path: "backend/app/core/config.py", type: "file", size: "2.4 KB" },
          { name: "database.py", path: "backend/app/core/database.py", type: "file", size: "1.2 KB" },
          { name: "redis.py", path: "backend/app/core/redis.py", type: "file", size: "1.8 KB" },
          { name: "memory.py", path: "backend/app/core/memory.py", type: "file", size: "3.5 KB" }
        ]
      },
      { name: "requirements.txt", path: "backend/requirements.txt", type: "file", size: "420 B" }
    ]
  },
  {
    name: "frontend",
    path: "frontend",
    type: "directory",
    children: [
      {
        name: "src",
        path: "frontend/src",
        type: "directory",
        children: [
          { name: "App.tsx", path: "frontend/src/App.tsx", type: "file", size: "24 KB" },
          { name: "index.css", path: "frontend/src/index.css", type: "file", size: "4.2 KB" }
        ]
      },
      { name: "package.json", path: "frontend/package.json", type: "file", size: "1.1 KB" }
    ]
  }
];

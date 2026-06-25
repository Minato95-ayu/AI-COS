export interface ModuleSpec {
  id: string;
  name: string;
  category: "backend-core" | "models" | "agents" | "coordination" | "frontend" | "security";
  path: string;
  description: string;
  uml: string;
  code: string;
  designPattern: string;
  interfaces: string[];
}

export const ARCHITECTURE_DATA: ModuleSpec[] = [
  {
    id: "config",
    name: "Configuration Manager",
    category: "backend-core",
    path: "backend/app/core/config.py",
    description: "Defines the centralized, environment-aware configuration schema for AI-COS. It parses environment variables, validates system settings, and provides strong typing for database, Redis, and LLM connections using Pydantic Settings.",
    designPattern: "Singleton / Monostate Pattern",
    interfaces: ["Settings", "DatabaseSettings", "RedisSettings", "OllamaSettings"],
    uml: `@startuml
class Settings {
    + PROJECT_NAME: str
    + DEBUG: bool
    + API_V1_STR: str
    + DATABASE_URL: str
    + REDIS_URL: str
    + OLLAMA_HOST: str
    + MAX_AGENT_CONCURRENCY: int
    + get_db_settings()
    + get_redis_settings()
}
@enduml`,
    code: `import os
from typing import Optional
from pydantic import Field, PostgresDsn, RedisDsn
from pydantic_settings import BaseSettings, SettingsConfigDict

class DatabaseSettings(BaseSettings):
    """PostgreSQL configuration schemas and validation."""
    DATABASE_URL: Optional[PostgresDsn] = Field(
        default="postgresql+asyncpg://postgres:postgres@localhost:5432/aicos",
        validation_alias="DATABASE_URL"
    )

class RedisSettings(BaseSettings):
    """Redis high-throughput queue and state lock configuration."""
    REDIS_URL: Optional[RedisDsn] = Field(
        default="redis://localhost:6379/0",
        validation_alias="REDIS_URL"
    )

class OllamaSettings(BaseSettings):
    """Local model integration parameters."""
    OLLAMA_HOST: str = Field(default="http://localhost:11434", validation_alias="OLLAMA_HOST")
    DEFAULT_MODEL: str = Field(default="llama3.1:8b", validation_alias="OLLAMA_DEFAULT_MODEL")
    EMBEDDING_MODEL: str = Field(default="nomic-embed-text", validation_alias="OLLAMA_EMBED_MODEL")

class Settings(BaseSettings):
    """AI Company Operating System Central Config."""
    model_config = SettingsConfigDict(
        env_file=".env", 
        env_file_encoding="utf-8",
        extra="ignore"
    )

    PROJECT_NAME: str = "AI Company Operating System (AI-COS)"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Modules Config
    db: DatabaseSettings = DatabaseSettings()
    redis: RedisSettings = RedisSettings()
    ollama: OllamaSettings = OllamaSettings()
    
    # OS Operational Boundaries
    MAX_AGENT_RECURSION_DEPTH: int = 10
    GLOBAL_AGENT_CONCURRENCY_LIMIT: int = 250
    WORKSPACE_ROOT: str = "./run/workspaces"
    LOG_LEVEL: str = "INFO"

# Centralized instantiated configuration singleton
settings = Settings()
`
  },
  {
    id: "auth",
    name: "Authentication & Authorization",
    category: "security",
    path: "backend/app/core/auth.py",
    description: "Provides abstract interfaces and security stubs for role-based access control, JWT verification, and scoping, ensuring only verified controllers and users can command agents.",
    designPattern: "RBAC (Role Based Access Control) & Dependency Injection",
    interfaces: ["IAuthService", "JWTAuthenticator", "AgentScopeGuard"],
    uml: `@startuml
interface IAuthService {
    + authenticate_user(credentials)
    + generate_token(claims)
    + verify_token(token)
}
class JWTAuthService implements IAuthService {}
@enduml`,
    code: `from abc import ABC, abstractmethod
from typing import Dict, Any, Optional
from pydantic import BaseModel

class UserClaims(BaseModel):
    user_id: str
    role: str
    scopes: list[str]

class IAuthService(ABC):
    """Abstract interface defining the identity boundary of the Operating System."""
    
    @abstractmethod
    async def authenticate(self, credentials: Dict[str, str]) -> Optional[UserClaims]:
        """Verify username/password or token and return identity claims."""
        pass

    @abstractmethod
    def generate_token(self, claims: UserClaims) -> str:
        """Create a cryptographic JWT or token for session tracking."""
        pass

    @abstractmethod
    def verify_token(self, token: str) -> Optional[UserClaims]:
        """Validate session token integrity and extract scopes."""
        pass

class AgentScopeGuard:
    """Middle-tier decorator pattern checking if an actor has access to run an Agent."""
    def __init__(self, required_scope: str):
        self.required_scope = required_scope

    async def __call__(self, claims: UserClaims) -> bool:
        if "admin" in claims.scopes:
            return True
        return self.required_scope in claims.scopes
`
  },
  {
    id: "postgres",
    name: "PostgreSQL Database Connection",
    category: "backend-core",
    path: "backend/app/core/database.py",
    description: "Establishes async PostgreSQL connections and transaction scopes using SQLAlchemy. It governs dynamic connection pools and provides declarative models for historical logs, agent state, and configurations.",
    designPattern: "Data Mapper / Unit of Work",
    interfaces: ["IDbSessionProvider", "AsyncDbManager"],
    uml: `@startuml
class AsyncDbManager {
    - engine: AsyncEngine
    - session_factory: sessionmaker
    + get_db_session() : AsyncSession
}
@enduml`,
    code: `from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from .config import settings

# Async driver configuration using asyncpg
engine = create_async_engine(
    str(settings.db.DATABASE_URL),
    echo=False,
    pool_size=20,
    max_overflow=10,
    pool_pre_ping=True
)

SessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False
)

class Base(DeclarativeBase):
    """Abstract declarative base for mapping database entity structures."""
    pass

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Dependency injection generator to manage transaction scoping per request."""
    async with SessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
`
  },
  {
    id: "redis",
    name: "Redis State & Distributed Locks",
    category: "backend-core",
    path: "backend/app/core/redis.py",
    description: "Handles interaction with Redis to facilitate state caching, shared variables across dynamic worker instances, and distributed lock coordination to avoid conflicting concurrent operations.",
    designPattern: "Proxy Pattern / Distributed Lock Pattern",
    interfaces: ["IRedisClient", "IDistributedLock"],
    uml: `@startuml
class RedisManager {
    - client: Redis
    + acquire_lock(lock_key, ttl)
    + release_lock(lock_key)
    + publish_event(channel, payload)
}
@enduml`,
    code: `from abc import ABC, abstractmethod
from typing import Optional, Any
import redis.asyncio as aioredis
from .config import settings

class IRedisClient(ABC):
    """Abstract interface for fast caching, active message queues, and shared memory."""
    
    @abstractmethod
    async def get(self, key: str) -> Optional[str]:
        pass

    @abstractmethod
    async def set(self, key: str, value: str, expire_seconds: Optional[int] = None) -> bool:
        pass

    @abstractmethod
    async def acquire_lock(self, lock_name: str, acquire_timeout: int = 10, lock_timeout: int = 60) -> Optional[str]:
        """Obtain a distributed lock token to prevent agent racing conditions."""
        pass

    @abstractmethod
    async def release_lock(self, lock_name: str, identifier: str) -> bool:
        """Safely release the distributed lock if the token matches."""
        pass

class RedisClient(IRedisClient):
    """Production Redis Adapter mapping abstract caching and locking onto native asyncio commands."""
    def __init__(self):
        self.pool = aioredis.ConnectionPool.from_url(
            str(settings.redis.REDIS_URL),
            max_connections=50,
            decode_responses=True
        )

    def get_redis(self) -> aioredis.Redis:
        return aioredis.Redis(connection_pool=self.pool)

    async def get(self, key: str) -> Optional[str]:
        async with self.get_redis() as r:
            return await r.get(key)

    async def set(self, key: str, value: str, expire_seconds: Optional[int] = None) -> bool:
        async with self.get_redis() as r:
            return await r.set(key, value, ex=expire_seconds)

    async def acquire_lock(self, lock_name: str, acquire_timeout: int = 10, lock_timeout: int = 60) -> Optional[str]:
        # Lock acquisition logic using SETNX
        pass

    async def release_lock(self, lock_name: str, identifier: str) -> bool:
        # Lua script safety check for atomic release
        pass
`
  },
  {
    id: "logging",
    name: "Structured Logging Engine",
    category: "backend-core",
    path: "backend/app/core/logging.py",
    description: "Configures JSON-based structured logs to enable downstream parsing, tracing recursive AI reasoning chains, audit logs, and communication protocols between agent endpoints.",
    designPattern: "Log Formatter Chain / Context Tracing",
    interfaces: ["IStructuredLogger", "LogCorrelationContext"],
    uml: `@startuml
class LogContext {
    + trace_id: str
    + agent_id: str
}
class StructuredLogger {
    + log_info(msg, context)
    + log_audit(event, context)
}
@enduml`,
    code: `import json
import logging
import time
from typing import Dict, Any, Optional
from contextvars import ContextVar

# Thread-safe context variables to keep track of recursive agent calling trees
trace_id_var: ContextVar[Optional[str]] = ContextVar("trace_id", default=None)
agent_id_var: ContextVar[Optional[str]] = ContextVar("agent_id", default=None)

class JsonLogFormatter(logging.Formatter):
    """Custom standard library formatter exporting trace contexts as flat JSON structures."""
    def format(self, record: logging.LogRecord) -> str:
        log_payload: Dict[str, Any] = {
            "timestamp": self.formatTime(record, self.datefmt),
            "level": record.levelname,
            "message": record.getMessage(),
            "logger": record.name,
            "trace_id": trace_id_var.get(),
            "agent_id": agent_id_var.get(),
        }
        
        if hasattr(record, "agent_metadata"):
            log_payload["metadata"] = record.agent_metadata
            
        return json.dumps(log_payload)

def configure_system_logging() -> None:
    """Initialize structured logging pipelines for the whole agent stack."""
    handler = logging.StreamHandler()
    handler.setFormatter(JsonLogFormatter())
    
    root_logger = logging.getLogger()
    root_logger.setLevel(logging.INFO)
    root_logger.addHandler(handler)
`
  },
  {
    id: "memory",
    name: "Grounding & Multi-tier Memory",
    category: "backend-core",
    path: "backend/app/core/memory.py",
    description: "Handles long-term episodic storage (Vector Store), short-term working state (Redis), and transactional message logs (Postgres) to ground agents in previous experience.",
    designPattern: "Facade Pattern / Strategy Pattern (Semantic/Episodic/Working)",
    interfaces: ["IMemory", "ShortTermMemory", "LongTermMemory", "IVectorStore"],
    uml: `@startuml
interface IMemory {
    + store(key, val, metadata)
    + retrieve(key)
    + search_semantic(query, limit)
}
class HybridMemory implements IMemory {}
@enduml`,
    code: `from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
from pydantic import BaseModel

class MemoryItem(BaseModel):
    content: str
    metadata: Dict[str, Any]
    embedding: Optional[List[float]] = None
    timestamp: float

class IMemory(ABC):
    """Abstract interface defining the complete grounding loop of an agent."""
    
    @abstractmethod
    async def add_working_context(self, session_id: str, message: Dict[str, Any]) -> None:
        """Append a conversational snippet to temporary sliding short-term buffer."""
        pass

    @abstractmethod
    async def get_working_context(self, session_id: str, limit: int = 15) -> List[Dict[str, Any]]:
        """Retrieve the ordered list of recent working messages."""
        pass

    @abstractmethod
    async def save_episodic_memory(self, agent_id: str, content: str, tags: List[str]) -> str:
        """Persist structured summary in episodic vector memory space."""
        pass

    @abstractmethod
    async def query_semantic_memories(self, agent_id: str, query: str, limit: int = 5) -> List[MemoryItem]:
        """Perform cosine similarity lookup against agent embeddings."""
        pass

    @abstractmethod
    async def clear_all_context(self, session_id: str) -> None:
        """Flush transient state queues."""
        pass
`
  },
  {
    id: "ollama",
    name: "Ollama LLM Integration",
    category: "models",
    path: "backend/app/models/ollama_client.py",
    description: "Configures the API client mapping for locally hosted Ollama instances, supporting structured generation parameters and asynchronous response streaming.",
    designPattern: "Adapter Pattern",
    interfaces: ["ILLMClient", "IOllamaStream"],
    uml: `@startuml
interface ILLMClient {
    + generate(prompt, model)
    + generate_stream(prompt, model)
    + get_embedding(text)
}
class OllamaClient implements ILLMClient {}
@enduml`,
    code: `from abc import ABC, abstractmethod
from typing import AsyncGenerator, Dict, Any, List, Optional
from pydantic import BaseModel

class LLMRequest(BaseModel):
    prompt: str
    model: str
    temperature: float = 0.7
    max_tokens: int = 1000
    stop_sequences: Optional[List[str]] = None
    system_instruction: Optional[str] = None

class LLMResponse(BaseModel):
    text: str
    prompt_tokens: int
    completion_tokens: int
    raw_response: Dict[str, Any]

class ILLMClient(ABC):
    """Abstract driver representing local model execution constraints."""
    
    @abstractmethod
    async def generate(self, request: LLMRequest) -> LLMResponse:
        """Asynchronously call model endpoint and wait for full completion payload."""
        pass

    @abstractmethod
    async def stream(self, request: LLMRequest) -> AsyncGenerator[str, None]:
        """Stream token-by-token text output for high responsiveness in UI layouts."""
        pass

    @abstractmethod
    async def embed(self, texts: List[str], model: str) -> List[List[float]]:
        """Generate high-dimensional semantic embeddings for storage and search."""
        pass
`
  },
  {
    id: "model_manager",
    name: "Local Model Manager",
    category: "models",
    path: "backend/app/models/model_manager.py",
    description: "Coordinates local model allocation, tracks loaded model instances in GPU memory (VRAM), manages model hot-swapping policies, and routes requests to fallback models in case of timeout.",
    designPattern: "Resource Pool / Load Balancer Pattern",
    interfaces: ["IModelManager", "IVramAllocator", "IFallbackPolicy"],
    uml: `@startuml
class ModelManager {
    - active_models: Dict
    - pool: ModelPool
    + load_model(name)
    + unload_model(name)
    + get_optimal_model(task_type)
}
@enduml`,
    code: `from abc import ABC, abstractmethod
from enum import Enum
from typing import Dict, Any, List, Optional
from pydantic import BaseModel

class ModelStatus(str, Enum):
    IDLE = "idle"
    LOADING = "loading"
    ACTIVE = "active"
    UNLOADED = "unloaded"

class ModelDetails(BaseModel):
    model_name: str
    size_bytes: int
    vram_requirement_bytes: int
    status: ModelStatus
    loaded_at: Optional[float] = None

class IModelManager(ABC):
    """Coordinates physical model allocation across available processing nodes."""

    @abstractmethod
    async def list_available_models(self) -> List[ModelDetails]:
        """Query registry for all valid, downloadable, or pre-loaded LLMs."""
        pass

    @abstractmethod
    async def request_model_mount(self, model_name: str) -> bool:
        """Trigger dynamic model swap into VRAM based on urgency and LRU queue caching."""
        pass

    @abstractmethod
    async def handle_inference_routing(self, task_complexity: str) -> str:
        """Resolve optimal model matching size, speed constraints, and current queue load."""
        pass

    @abstractmethod
    async def track_vram_overhead(self) -> Dict[str, Any]:
        """Monitor live graphics hardware statistics to avert Out Of Memory (OOM) failures."""
        pass
`
  },
  {
    id: "registry",
    name: "Agent Registry Manager",
    category: "agents",
    path: "backend/app/agents/registry.py",
    description: "Acts as the single source of truth for all specialized virtual employees. It manages dynamic metadata, security clearances, core competencies, and instantiates agent runtimes dynamically.",
    designPattern: "Registry / Factory Pattern",
    interfaces: ["IAgentRegistry", "IAgentFactory"],
    uml: `@startuml
class AgentRegistry {
    - registered_agents: Map
    + register_agent_class(cls)
    + get_agent_instance(id)
    + query_by_capability(cap)
}
@enduml`,
    code: `from abc import ABC, abstractmethod
from typing import Dict, Any, List, Type, Optional
from pydantic import BaseModel, Field

class AgentProfile(BaseModel):
    agent_id: str
    name: str
    role: str
    department_id: str
    core_competencies: List[str]
    max_token_budget_per_run: int = 50000
    mcp_servers_enabled: List[str] = Field(default_factory=list)
    system_prompt_override: Optional[str] = None

class BaseAgentInstance(ABC):
    """Abstract parent class governing a single instantiated agent runtime thread."""
    def __init__(self, profile: AgentProfile):
        self.profile = profile

    @abstractmethod
    async def run(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Main execution engine loop representing one step of the agent's work."""
        pass

class IAgentRegistry(ABC):
    """Central index of all specialized agent profiles across the enterprise OS."""
    
    @abstractmethod
    def register_agent(self, profile: AgentProfile, agent_cls: Type[BaseAgentInstance]) -> None:
        """Register a new model archetype into the central catalog."""
        pass

    @abstractmethod
    def get_agent_profile(self, agent_id: str) -> Optional[AgentProfile]:
        """Retrieve configuration profile of a target agent."""
        pass

    @abstractmethod
    def find_agents_by_skill(self, skill: str) -> List[AgentProfile]:
        """Locate qualified agents with specialized competencies for a given task."""
        pass

    @abstractmethod
    def instantiate_agent(self, agent_id: str) -> BaseAgentInstance:
        """Factory method to load, setup, and instantiate active running contexts."""
        pass
`
  },
  {
    id: "departments",
    name: "Department Registry",
    category: "coordination",
    path: "backend/app/departments/registry.py",
    description: "Structures the AI company into distinct business units (e.g., Engineering, Marketing, Security). It governs internal routing, resource budgets, and department-level messaging rules.",
    designPattern: "Composite Pattern / Unit Coordinator Pattern",
    interfaces: ["IDepartment", "IDepartmentRegistry"],
    uml: `@startuml
class Department {
    + department_id: str
    + name: str
    + manager_agent_id: str
    + agent_ids: List
    + budget_limit_usd: float
}
@enduml`,
    code: `from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
from pydantic import BaseModel

class DepartmentProfile(BaseModel):
    department_id: str
    name: str
    manager_agent_id: str  # Escalation router
    member_agent_ids: List[str]
    monthly_budget_cap: float
    current_spend: float = 0.0

class IDepartmentRegistry(ABC):
    """Defines organizational taxonomy rules, reporting lines, and delegation loops."""
    
    @abstractmethod
    def create_department(self, department: DepartmentProfile) -> None:
        pass

    @abstractmethod
    def assign_agent_to_department(self, agent_id: str, department_id: str) -> None:
        pass

    @abstractmethod
    def route_to_department_manager(self, department_id: str, task_context: Dict[str, Any]) -> Dict[str, Any]:
        """Escalate an unhandled task to the head of a department for replanning."""
        pass

    @abstractmethod
    def track_department_expenditure(self, department_id: str, token_cost_usd: float) -> None:
        """Track department financial quotas in high-concurrency systems."""
        pass
`
  },
  {
    id: "queue",
    name: "Asynchronous Task Queue",
    category: "coordination",
    path: "backend/app/queue/task_queue.py",
    description: "Coordinates concurrent job runs, schedules worker loops, handles long-running jobs without blocking, and updates parent processes on sub-task completions.",
    designPattern: "Producer-Consumer / Task Queue Pattern",
    interfaces: ["ITaskProducer", "ITaskConsumer", "ITaskStateStore"],
    uml: `@startuml
class Task {
    + id: str
    + name: str
    + payload: dict
    + status: Enum
}
interface ITaskProducer {
    + enqueue_task(task)
}
@enduml`,
    code: `from abc import ABC, abstractmethod
from enum import Enum
from typing import Dict, Any, Optional
from pydantic import BaseModel, Field

class TaskStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    RETRYING = "retrying"

class TaskEnvelope(BaseModel):
    task_id: str
    target_agent_id: str
    payload: Dict[str, Any]
    status: TaskStatus = TaskStatus.PENDING
    retry_count: int = 0
    max_retries: int = 3
    priority: int = 0  # High values processed first

class ITaskQueueProducer(ABC):
    """Asynchronous interface to dispatch workload envelopes safely."""
    
    @abstractmethod
    async def publish_task(self, task: TaskEnvelope) -> bool:
        """Enqueue task envelope to active broker queue."""
        pass

class ITaskQueueConsumer(ABC):
    """Abstract background worker loop parsing tasks from broker."""
    
    @abstractmethod
    async def poll_next_task(self) -> Optional[TaskEnvelope]:
        """Block and wait for next eligible high-priority task."""
        pass

    @abstractmethod
    async def update_task_progress(self, task_id: str, status: TaskStatus, result: Optional[Dict[str, Any]] = None, error: Optional[str] = None) -> None:
        """Broadband state updates on worker task outcome."""
        pass
`
  },
  {
    id: "planner",
    name: "Recursive Task Planner",
    category: "agents",
    path: "backend/app/agents/planner.py",
    description: "Acts as the executive reasoning center. It decomposes vague multi-step requests into Directed Acyclic Graphs (DAGs) representing sequential and parallel step executions.",
    designPattern: "Strategy Pattern / Graph-DAG Deconstructor",
    interfaces: ["IPlanner", "IDagGenerator", "IPlanValidator"],
    uml: `@startuml
class PlanNode {
    + step_id: str
    + executor_agent: str
    + dependencies: List[str]
}
class PlanDAG {
    + nodes: Map
    + resolve_execution_order()
}
@enduml`,
    code: `from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
from pydantic import BaseModel

class StepDefinition(BaseModel):
    step_id: str
    name: str
    description: str
    assigned_agent_id: str
    dependencies: List[str]  # IDs of steps that MUST complete before this starts
    expected_output_schema: Dict[str, Any]

class ExecutionPlan(BaseModel):
    plan_id: str
    goal: str
    steps: Dict[str, StepDefinition]
    metadata: Dict[str, Any]

class IPlanner(ABC):
    """Architectural blueprint of the operational reasoning engine."""

    @abstractmethod
    async def generate_plan(self, user_goal: str, context: Dict[str, Any]) -> ExecutionPlan:
        """Deconstruct high level human objectives into a clear multi-agent execution map."""
        pass

    @abstractmethod
    async def validate_plan(self, plan: ExecutionPlan) -> bool:
        """Audit the acyclic dependency structure and check model parameters."""
        pass

    @abstractmethod
    async def adjust_plan_on_error(self, plan: ExecutionPlan, failed_step_id: str, error_msg: str) -> ExecutionPlan:
        """Dynamically rewrite the remaining DAG branch when a single agent node fails."""
        pass
`
  },
  {
    id: "router",
    name: "Semantic Intent Router",
    category: "agents",
    path: "backend/app/agents/router.py",
    description: "Leverages lightweight semantic embedding or model scoring to map a given intent, query, or task step to the absolute best-suited agent instance.",
    designPattern: "Chain of Responsibility / Router Pattern",
    interfaces: ["ISemanticRouter", "IRoutingStrategy"],
    uml: `@startuml
interface IRouter {
    + route_request(request) : Agent_ID
}
class SemanticRouter implements IRouter {}
@enduml`,
    code: `from abc import ABC, abstractmethod
from typing import Dict, Any, List
from pydantic import BaseModel

class RoutingOption(BaseModel):
    agent_id: str
    score: float  # Confidence affinity
    rationale: str

class ISemanticRouter(ABC):
    """Dynamic gateway forwarding workload inputs to correct specialized systems."""

    @abstractmethod
    async def select_best_agent(self, task_description: str, registry_profiles: List[Dict[str, Any]]) -> RoutingOption:
        """Compare task description semantic requirements against active agent capabilities."""
        pass

    @abstractmethod
    async def rank_top_agents(self, task_description: str, limit: int = 3) -> List[RoutingOption]:
        """Provide a ranked confidence list of top capable agent candidates."""
        pass

    @abstractmethod
    async def route_event(self, event_type: str, payload: Dict[str, Any]) -> str:
        """Route dynamic system-level events (e.g. system errors, triggers) to monitor agents."""
        pass
`
  },
  {
    id: "tools",
    name: "Tool Manager Gateway",
    category: "agents",
    path: "backend/app/agents/tools.py",
    description: "Defines clean, self-documenting parameters for external script hooks (e.g. shell executors, web scrapers, python sandboxes) with integrated argument validation and security limits.",
    designPattern: "Command Pattern / Proxy Gateway",
    interfaces: ["ITool", "IToolRegistry", "IToolExecutor"],
    uml: `@startuml
class ToolMetadata {
    + name: str
    + args_schema: schema
}
class ToolExecutor {
    + execute_with_guard(tool, args)
}
@enduml`,
    code: `from abc import ABC, abstractmethod
from typing import Dict, Any, Optional
from pydantic import BaseModel, Field

class ToolSpec(BaseModel):
    name: str
    description: str
    parameters_schema: Dict[str, Any]  # JSON Schema format
    is_dangerous: bool = False
    timeout_seconds: int = 30

class BaseTool(ABC):
    """Abstract baseline pattern for any physical action capable by an agent."""
    def __init__(self, spec: ToolSpec):
        self.spec = spec

    @abstractmethod
    async def execute(self, arguments: Dict[str, Any], context: Dict[str, Any]) -> Any:
        """Asynchronously call the underlying API, script, or utility."""
        pass

class IToolRegistry(ABC):
    """Catalog holding valid registered system and user-defined tools."""
    
    @abstractmethod
    def register_tool(self, tool: BaseTool) -> None:
        pass

    @abstractmethod
    def get_tool(self, tool_name: str) -> Optional[BaseTool]:
        pass

    @abstractmethod
    async def invoke_guarded(self, tool_name: str, args: Dict[str, Any], ctx: Dict[str, Any]) -> Dict[str, Any]:
        """Perform validation and run checking steps (e.g. timeout, security hooks)."""
        pass
`
  },
  {
    id: "mcp",
    name: "Model Context Protocol Client",
    category: "agents",
    path: "backend/app/agents/mcp.py",
    description: "Implements client specifications for the Model Context Protocol (MCP), enabling external context server attachment, tool syncing, and schema alignment.",
    designPattern: "Adapter / Mediator Pattern",
    interfaces: ["IMCPClient", "IMCPRegistry", "ISessionHandler"],
    uml: `@startuml
class MCPSession {
    + connection_id: str
    + list_resources()
    + call_tool(name, args)
}
@enduml`,
    code: `from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
from pydantic import BaseModel

class MCPResource(BaseModel):
    uri: str
    name: str
    description: Optional[str] = None
    mime_type: Optional[str] = None

class MCPClientSession(ABC):
    """Abstract interface governing client connections to MCP standard endpoints."""
    
    @abstractmethod
    async def connect(self, server_url: str, auth_headers: Dict[str, str]) -> bool:
        pass

    @abstractmethod
    async def discover_resources(self) -> List[MCPResource]:
        """Query connected MCP server for available dynamic data streams."""
        pass

    @abstractmethod
    async def fetch_resource(self, uri: str) -> str:
        """Read precise state content from target URI schema."""
        pass

    @abstractmethod
    async def invoke_mcp_tool(self, name: str, arguments: Dict[str, Any]) -> Dict[str, Any]:
        """Delegate reasoning actions to external microservice standard tools."""
        pass
`
  },
  {
    id: "workspace",
    name: "Isolated Workspace Manager",
    category: "coordination",
    path: "backend/app/workspace/manager.py",
    description: "Provisions temporary storage containers, directories, and virtual paths where agents can write, test, and package file artifacts without system-level risks.",
    designPattern: "Sandbox / Virtual File System Pattern",
    interfaces: ["IWorkspaceManager", "IWorkspaceSandbox"],
    uml: `@startuml
class Workspace {
    + id: str
    + path: str
    + write_file(filename, bytes)
    + read_file(filename)
    + execute_command(cmd)
}
@enduml`,
    code: `from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
from pydantic import BaseModel

class WorkspaceLimits(BaseModel):
    max_disk_space_mb: int = 500
    network_allowed: bool = False
    cpu_cores_limit: float = 1.0

class IWorkspaceSandbox(ABC):
    """Abstract definition of an isolated directory workspace assigned to an active task."""

    @abstractmethod
    async def write_file(self, filename: str, content: bytes) -> str:
        """Create a file inside sandbox with strict directory boundary validations."""
        pass

    @abstractmethod
    async def read_file(self, filename: str) -> bytes:
        """Retrieve data stream from targeted file."""
        pass

    @abstractmethod
    async def execute_command(self, command: str, args: List[str]) -> Dict[str, Any]:
        """Compile or execute test runner inside dynamic child process constraints."""
        pass

    @abstractmethod
    async def clean_sandbox(self) -> None:
        """Wipe directory files to prevent data storage leaks."""
        pass
`
  },
  {
    id: "plugins",
    name: "Plugin & Extension Hook System",
    category: "coordination",
    path: "backend/app/workspace/plugins.py",
    description: "Allows loading dynamic Python libraries as middleware, injecting telemetry, altering agent run parameters, or monitoring audit flows.",
    designPattern: "Observer / Hook Pattern",
    interfaces: ["IPlugin", "IPluginLoader", "IPluginRegistry"],
    uml: `@startuml
interface IPlugin {
    + on_startup()
    + on_agent_call(input)
    + on_agent_return(output)
}
@enduml`,
    code: `from abc import ABC, abstractmethod
from typing import Dict, Any

class PluginContext(ABC):
    """Contextual metadata passed to plugin hooks at runtime."""
    sender_id: str
    execution_trace_id: str

class IPlugin(ABC):
    """Interface to build interceptor libraries and dynamic custom modules."""
    
    @abstractmethod
    async def on_system_init(self) -> None:
        """Fires when the AI-COS starts loading up system instances."""
        pass

    @abstractmethod
    async def pre_agent_inference(self, agent_id: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        """Hook to filter, audit, or rewrite input variables before passing to LLMs."""
        pass

    @abstractmethod
    async def post_agent_inference(self, agent_id: str, result: Dict[str, Any]) -> Dict[str, Any]:
        """Hook to capture, log, parse, or censor output responses before processing."""
        pass

    @abstractmethod
    async def on_system_shutdown(self) -> None:
        """Safely close open handles or telemetry links."""
        pass
`
  },
  {
    id: "settings",
    name: "Global Operational Settings",
    category: "security",
    path: "backend/app/core/settings.py",
    description: "Maintains real-time mutable settings for systemic guardrails, API limits, rate limits, currency spend trackers, and agent permission hierarchies.",
    designPattern: "State Pattern / Guard Pattern",
    interfaces: ["ICompanySettingsManager", "IRateLimiter"],
    uml: `@startuml
class CompanySettings {
    + max_daily_budget_usd: float
    + current_daily_spend: float
    + rate_limiter: RateLimiter
}
@enduml`,
    code: `from abc import ABC, abstractmethod
from typing import Dict, Any, Optional
from pydantic import BaseModel

class SystemGuardrails(BaseModel):
    max_tokens_per_minute: int = 80000
    daily_spend_cap_usd: float = 150.00
    approved_tool_domains: list[str] = ["github.com", "api.stripe.com"]
    enable_dangerous_commands: bool = False

class ICompanySettingsManager(ABC):
    """Abstract interface governing core administrative and safety thresholds."""
    
    @abstractmethod
    async def fetch_current_guardrails(self) -> SystemGuardrails:
        pass

    @abstractmethod
    async def update_guardrails(self, new_guardrails: SystemGuardrails) -> bool:
        pass

    @abstractmethod
    async def check_api_rate_limit(self, client_id: str) -> bool:
        """Trigger evaluation of dynamic rate token bucket algorithms."""
        pass
`
  },
  {
    id: "frontend-layout",
    name: "React + Next.js App Shell",
    category: "frontend",
    path: "frontend/src/app/layout.tsx",
    description: "Sets up the high-end display wrapper, styled fonts, metadata settings, and global state providers for the enterprise-level dashboard.",
    designPattern: "Provider / Composition Pattern",
    interfaces: ["AppLayout", "RootMetadata", "ViewportConfig"],
    uml: `@startuml
class AppLayout {
    + RootProvider
    + NavigationShell
    + DashboardCanvas
}
@enduml`,
    code: `import React from "react";
import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "AI Company OS (AI-COS)",
  description: "Enterprise operating command dashboard managing hundreds of virtual employees.",
};

export const viewport: Viewport = {
  themeColor: "#09090b",
  width: "device-width",
  initialScale: 1,
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" className="dark scroll-smooth selection:bg-cyan-500/30 selection:text-cyan-200">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans antialiased text-slate-100 bg-zinc-950 min-h-screen">
        <div className="flex flex-col min-h-screen">
          {/* Main system header */}
          <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse" />
              <span className="font-mono text-sm tracking-widest uppercase font-semibold text-cyan-400">AI-COS CORE v1.0</span>
            </div>
            <nav className="flex gap-6 text-sm font-medium text-slate-400">
              <a href="#overview" className="hover:text-white transition">Overview</a>
              <a href="#agents" className="hover:text-white transition">Agent Registry</a>
              <a href="#queue" className="hover:text-white transition">Execution Queue</a>
              <a href="#settings" className="hover:text-white transition">OS Settings</a>
            </nav>
          </header>

          {/* Active system main dashboard canvas */}
          <main className="flex-1 max-w-7xl w-full mx-auto p-6 flex flex-col gap-6">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
`
  },
  {
    id: "frontend-api",
    name: "API & WebSocket Gateway",
    category: "frontend",
    path: "frontend/src/lib/api.ts",
    description: "Establishes typed interfaces, asynchronous fetch wrappers, and real-time WebSocket protocol listeners to bind the React layout to core FastAPI routers.",
    designPattern: "Gateway / Event Dispatcher Pattern",
    interfaces: ["IApiGateway", "IWebSocketStream", "IResponseEnvelope"],
    uml: `@startuml
class ApiGateway {
    - baseUrl: string
    - wsUrl: string
    + getAgents() : Promise
    + submitTask(task) : Promise
    + subscribeToUpdates(callback)
}
@enduml`,
    code: `export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  trace_id: string;
  error?: string;
}

export interface AgentSchema {
  agent_id: string;
  name: string;
  role: string;
  status: "idle" | "busy" | "offline";
  current_task_id?: string;
}

export interface QueueTask {
  task_id: string;
  priority: number;
  status: "pending" | "running" | "completed" | "failed";
  progress: number;
  assigned_agent_id: string;
}

export class ApiGateway {
  private static instance: ApiGateway;
  private baseUrl: string;
  private wsUrl: string;

  private constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";
    this.wsUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:3000/ws/v1";
  }

  public static getInstance(): ApiGateway {
    if (!ApiGateway.instance) {
      ApiGateway.instance = new ApiGateway();
    }
    return ApiGateway.instance;
  }

  public async fetch<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    const url = \`\${this.baseUrl}\${endpoint}\`;
    const headers = {
      "Content-Type": "application/json",
      "Authorization": \`Bearer \${localStorage.getItem("token") || ""}\`,
      ...(options?.headers || {}),
    };

    try {
      const response = await fetch(url, { ...options, headers });
      if (!response.ok) {
        throw new Error(\`Network error: \${response.statusText}\`);
      }
      return await response.json();
    } catch (error) {
      return {
        success: false,
        data: null as any,
        trace_id: "error-offline-mock",
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  public connectTaskStream(taskId: string, onUpdate: (data: QueueTask) => void): () => void {
    const socket = new WebSocket(\`\${this.wsUrl}/tasks/\${taskId}/stream\`);

    socket.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        onUpdate(payload);
      } catch (err) {
        console.error("Failed to parse task socket stream update:", err);
      }
    };

    return () => {
      socket.close();
    };
  }
}
`
  }
];

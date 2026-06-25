from enum import Enum

class AgentRole(str, Enum):
    CEO = "ceo"
    CTO = "cto"
    CFO = "cfo"
    CMO = "cmo"
    HR_DIRECTOR = "hr_director"
    PRODUCT_MANAGER = "product_manager"
    SOFTWARE_ENGINEER = "software_engineer"
    QA_ENGINEER = "qa_engineer"
    SECURITY_SPECIALIST = "security_specialist"
    UX_UI_DESIGNER = "ux_ui_designer"
    RESEARCHER = "researcher"
    CONTENT_WRITER = "content_writer"
    IMAGE_GENERATOR = "image_generator"
    CUSTOMER_SUPPORT = "customer_support"
    DATA_ANALYST = "data_analyst"
    COMPLIANCE_OFFICER = "compliance_officer"

class AgentState(str, Enum):
    INITIALIZING = "initializing"
    IDLE = "idle"
    PLANNING = "planning"
    EXECUTING = "executing"
    COMMUNICATING = "communicating"
    PAUSED = "paused"
    TERMINATED = "terminated"
    ERROR = "error"

class ExecutionMode(str, Enum):
    AUTONOMOUS = "autonomous"
    SEMI_AUTONOMOUS = "semi_autonomous"
    HUMAN_IN_THE_LOOP = "human_in_the_loop"

class ReasoningMode(str, Enum):
    ZERO_SHOT = "zero_shot"
    FEW_SHOT = "few_shot"
    CHAIN_OF_THOUGHT = "chain_of_thought"
    TREE_OF_THOUGHTS = "tree_of_thoughts"
    RE_ACT = "re_act"
    REFLEXION = "reflexion"

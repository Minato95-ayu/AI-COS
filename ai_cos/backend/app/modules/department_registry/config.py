from pydantic_settings import BaseSettings

class DepartmentRegistryConfig(BaseSettings):
    """Department Registry Local Parameters."""
    enable_cascading_deletes: bool = False
    max_departments: int = 50

    model_config = {
        "env_prefix": "DEPARTMENT_REGISTRY_",
        "extra": "ignore"
    }

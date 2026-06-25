import os
from typing import Any
from pydantic import BaseModel

class BaseSettings(BaseModel):
    def __init__(self, **kwargs):
        # Gather all annotations (type hints) from self and parent classes
        annotations = {}
        for cls in reversed(self.__class__.__mro__):
            if hasattr(cls, '__annotations__'):
                annotations.update(cls.__annotations__)

        # Load environment variables matching field names (both case-sensitive and uppercase)
        env_kwargs = {}
        for name in annotations:
            env_val = os.environ.get(name) or os.environ.get(name.upper())
            if env_val is not None:
                # Basic type conversion for standard settings types
                field_type = annotations[name]
                if field_type is int:
                    try:
                        env_kwargs[name] = int(env_val)
                    except ValueError:
                        pass
                elif field_type is float:
                    try:
                        env_kwargs[name] = float(env_val)
                    except ValueError:
                        pass
                elif field_type is bool:
                    env_kwargs[name] = env_val.lower() in ("true", "1", "yes")
                else:
                    env_kwargs[name] = env_val

        # Override with constructor kwargs
        env_kwargs.update(kwargs)
        super().__init__(**env_kwargs)

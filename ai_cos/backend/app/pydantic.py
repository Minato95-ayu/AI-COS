from typing import Any, Callable, Dict, List, Optional, Type, Union

class FieldInfo:
    def __init__(self, default: Any = None, default_factory: Optional[Callable[[], Any]] = None, **kwargs):
        self.default = default
        self.default_factory = default_factory
        for k, v in kwargs.items():
            setattr(self, k, v)

def Field(default: Any = None, default_factory: Optional[Callable[[], Any]] = None, **kwargs) -> Any:
    return FieldInfo(default=default, default_factory=default_factory, **kwargs)

class BaseModel:
    def __init__(self, **kwargs):
        # Gather all annotations (type hints) from self and parent classes
        annotations = {}
        for cls in reversed(self.__class__.__mro__):
            if hasattr(cls, '__annotations__'):
                annotations.update(cls.__annotations__)

        # Set values from kwargs or defaults
        for name, value in kwargs.items():
            setattr(self, name, value)

        # Apply defaults for any missing annotated fields
        for name in annotations:
            val = self.__dict__.get(name)
            if val is None or isinstance(val, FieldInfo) or name not in self.__dict__:
                # Check class-level defaults
                class_val = getattr(self.__class__, name, None)
                if isinstance(class_val, FieldInfo):
                    if class_val.default_factory is not None:
                        setattr(self, name, class_val.default_factory())
                    else:
                        setattr(self, name, class_val.default)
                elif class_val is not None and not name.startswith('_') and not callable(class_val):
                    setattr(self, name, class_val)
                else:
                    if name not in self.__dict__:
                        setattr(self, name, None)

        # For non-annotated but class-level defined Field attributes
        for name, class_val in self.__class__.__dict__.items():
            if not name.startswith('_') and (name not in self.__dict__ or isinstance(self.__dict__.get(name), FieldInfo)):
                if isinstance(class_val, FieldInfo):
                    if class_val.default_factory is not None:
                        setattr(self, name, class_val.default_factory())
                    else:
                        setattr(self, name, class_val.default)

    def model_dump(self) -> Dict[str, Any]:
        res = {}
        for k, v in self.__dict__.items():
            if k.startswith('_'):
                continue
            if isinstance(v, BaseModel):
                res[k] = v.model_dump()
            elif v.__class__.__name__ == 'datetime':
                res[k] = v.isoformat()
            elif isinstance(v, list):
                res[k] = [item.model_dump() if isinstance(item, BaseModel) else item for item in v]
            elif isinstance(v, dict):
                res[k] = {key: val.model_dump() if isinstance(val, BaseModel) else val for key, val in v.items()}
            elif hasattr(v, 'value'): # Handle enums
                res[k] = v.value
            else:
                res[k] = v
        return res

    def dict(self) -> Dict[str, Any]:
        return self.model_dump()

    @classmethod
    def model_validate(cls, obj: Any) -> 'BaseModel':
        if isinstance(obj, dict):
            return cls(**obj)
        return obj

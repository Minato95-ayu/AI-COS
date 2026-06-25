# Database Module

The `Database` module governs connection lifecycles, transaction boundaries, and pool configurations, abstracting database operations with SQLAlchemy async interfaces.

## Folder Structure
- `interfaces.py`: Defines connection pool hooks and scoped transaction session loops.
- `base.py`: Aggregates DB strings mapping parameters.
- `models.py`: Maps SQLAlchemy pooling settings.
- `services.py`: Concrete provider yielding session instances.
- `repository.py`: Executes low-level engine connection handshakes and pings.

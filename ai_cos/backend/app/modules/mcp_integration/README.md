# MCP Integration Module

The `Model Context Protocol (MCP)` integration client allows the AI-COS core to interact with standard MCP resources and external services (e.g., databases, GitHub, Jira, or Slack API bounds).

## Folder Structure
- `interfaces.py`: Defines connect, retrieve and tool invoke boundaries.
- `base.py`: Performs socket schema formatting calculations.
- `models.py`: Maps external endpoint profiles and resource schemas.
- `services.py`: Concrete connection pooler executing JSON-RPC handshakes.
- `repository.py`: Maps active MCP connections.

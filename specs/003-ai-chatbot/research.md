# Phase 0: Research - AI Todo Chatbot

**Feature**: 003-ai-chatbot
**Date**: 2026-01-01
**Purpose**: Research technology choices, integration patterns, and best practices for Phase 3

---

## Research Areas

### 1. OpenAI Agents SDK Function Calling

**Decision**: Use OpenAI Python SDK with function calling (tools) feature

**Rationale**:
- Native support for function calling in GPT-4 models
- Well-documented Python SDK with async support
- Proven integration with FastAPI backends
- Direct mapping of MCP tools to OpenAI function definitions

**Implementation Pattern**:
```python
from openai import AsyncOpenAI

client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))

tools = [
    {
        "type": "function",
        "function": {
            "name": "add_task",
            "description": "Create a new todo task",
            "parameters": {
                "type": "object",
                "properties": {
                    "user_id": {"type": "string"},
                    "title": {"type": "string"},
                    "description": {"type": "string"}
                },
                "required": ["user_id", "title"]
            }
        }
    }
]

response = await client.chat.completions.create(
    model="gpt-4",
    messages=conversation_history,
    tools=tools,
    tool_choice="auto"
)
```

**Alternatives Considered**:
- LangChain: Rejected due to additional abstraction layer overhead
- Custom prompt engineering: Rejected due to unreliability vs. function calling
- OpenAI Assistants API: Rejected due to stateful nature (conflicts with Principle I)

---

### 2. MCP SDK Integration

**Decision**: Use Official MCP SDK (Python) for tool registry and server

**Rationale**:
- Standardized protocol for AI-app communication
- Type-safe tool definitions
- Built-in validation and error handling
- Designed for stateless tool execution

**Implementation Pattern**:
```python
from mcp import MCPServer, Tool

server = MCPServer()

@server.tool()
async def add_task(user_id: str, title: str, description: str = None) -> dict:
    """MCP tool that delegates to Phase 2 task creation logic"""
    from services.task_service import create_task
    task = await create_task(user_id, title, description)
    return {"success": True, "task_id": str(task.id), "task": task.dict()}
```

**Alternatives Considered**:
- Direct OpenAI function calling without MCP: Rejected due to lack of standardization
- Custom tool framework: Rejected due to reinventing the wheel
- REST API calls from AI: Rejected due to added network latency

---

### 3. Stateless Conversation Management

**Decision**: Database-only state with per-request history fetching

**Rationale**:
- Enables horizontal scaling (no server affinity required)
- Fault-tolerant (server restarts don't lose data)
- Simplifies deployment (no Redis/Memcached needed for MVP)
- Aligns with Phase 3 Principle I (Stateless Backend)

**Implementation Pattern**:
```python
async def handle_chat_request(user_id: str, message: str):
    # 1. Fetch conversation from DB
    conversation = await get_or_create_conversation(user_id)

    # 2. Fetch last N messages from DB
    messages = await get_recent_messages(conversation.id, limit=20)

    # 3. Build OpenAI context
    openai_messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        *[{"role": msg.role, "content": msg.content} for msg in messages],
        {"role": "user", "content": message}
    ]

    # 4. Store user message immediately
    await store_message(conversation.id, "user", message)

    # 5. Call OpenAI + MCP
    response = await openai_with_mcp_tools(openai_messages)

    # 6. Store assistant response
    await store_message(conversation.id, "assistant", response.content)

    return response
```

**Alternatives Considered**:
- In-memory conversation cache: Rejected due to stateless requirement
- Redis session storage: Rejected as unnecessary complexity for MVP
- WebSocket persistent connections: Rejected due to simpler HTTP polling approach

---

### 4. PostgreSQL JSONB for Tool Calls

**Decision**: Use JSONB column in messages table to store tool_calls metadata

**Rationale**:
- Native JSON support in PostgreSQL
- Queryable and indexable
- No need for separate tool_calls table
- Flexible schema for future tool additions

**Schema Design**:
```sql
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'tool')),
    content TEXT NOT NULL,
    tool_calls JSONB DEFAULT NULL,
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Example tool_calls JSONB structure:
{
    "tool_name": "add_task",
    "parameters": {"user_id": "123", "title": "Buy milk"},
    "result": {"success": true, "task_id": "456"}
}
```

**Alternatives Considered**:
- Separate tool_calls table: Rejected due to added join complexity
- Text column with JSON string: Rejected due to lack of query capability
- NoSQL database for messages: Rejected to keep single database (Neon PostgreSQL)

---

### 5. Next.js Optimistic UI Updates

**Decision**: Use SWR with optimistic updates for real-time task list synchronization

**Rationale**:
- Built-in support for optimistic updates
- Automatic revalidation on focus
- Error rollback handling
- Works seamlessly with Next.js

**Implementation Pattern**:
```typescript
import useSWR from 'swr';

function useTaskList() {
    const { data, error, mutate } = useSWR('/api/tasks', fetcher);

    const addTaskOptimistic = async (newTask) => {
        // Optimistic update
        mutate([...data, newTask], false);

        try {
            // Actual API call (via chat)
            await sendChatMessage(`Add ${newTask.title}`);
            // Revalidate
            mutate();
        } catch (err) {
            // Rollback on error
            mutate();
        }
    };

    return { tasks: data, addTaskOptimistic };
}
```

**Alternatives Considered**:
- Manual state management with useState: Rejected due to complexity
- Redux/Zustand: Rejected as overkill for this feature
- WebSocket real-time updates: Deferred to future phase (MVP uses polling)

---

## Technology Summary

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| AI | OpenAI API | GPT-4 | Natural language understanding |
| SDK | OpenAI Python SDK | ≥1.0.0 | API client with function calling |
| MCP | Official MCP SDK | Latest | Tool registry and server |
| Backend | FastAPI | ≥0.104.0 | REST API framework |
| ORM | SQLModel | ≥0.0.14 | Database models |
| Database | Neon PostgreSQL | ≥15 | Persistence (JSONB support) |
| Frontend | Next.js | ≥14.0.0 | React framework |
| State | SWR | ≥2.0.0 | Data fetching with optimistic updates |
| Styling | Tailwind CSS | ≥3.0.0 | UI styling (Phase 2 reuse) |

---

## Best Practices Identified

### OpenAI Function Calling
- Define clear, unambiguous function descriptions
- Use strict JSON schema for parameters
- Handle tool call errors gracefully
- Limit conversation context to last 20 messages (token optimization)

### MCP Tool Design
- Keep tools stateless (no internal state)
- Enforce user_id in every tool signature
- Return structured JSON responses with success/error codes
- Delegate to existing Phase 2 logic (no duplication)

### Database Design
- Use UUIDs for primary keys (better for distributed systems)
- Add ON DELETE CASCADE for conversation → messages
- Index conversation_id and user_id for query performance
- Use JSONB for flexible tool_calls storage

### Frontend Architecture
- Reuse Phase 2 Tailwind classes for consistency
- Keep chat components in separate directory (`chat/`)
- Use React Context for chat state management
- Implement optimistic UI updates for perceived performance

---

## Open Questions Resolved

**Q: Should we use OpenAI Assistants API?**
**A**: No. Assistants API is stateful (manages threads/messages internally), which conflicts with our stateless requirement (Principle I).

**Q: How to handle long conversation histories?**
**A**: Fetch only last 20 messages per request. Older messages remain in database but aren't sent to OpenAI (token cost optimization).

**Q: Should MCP tools be separate microservices?**
**A**: No for MVP. MCP tools will be functions within the FastAPI backend for simplicity. Can be extracted to microservices in future if needed.

**Q: How to prevent race conditions with optimistic updates?**
**A**: SWR handles this automatically. Optimistic update → API call → revalidation. If API fails, SWR reverts to previous state.

**Q: What if OpenAI API is down?**
**A**: Graceful degradation: Chat endpoint returns error response, frontend shows user-friendly message, Phase 2 UI remains fully functional.

---

**Research Status**: ✅ Complete - All technology choices documented and justified

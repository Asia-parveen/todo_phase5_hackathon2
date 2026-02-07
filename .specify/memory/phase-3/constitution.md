<!--
================================================================================
SYNC IMPACT REPORT
================================================================================
Version Change: 0.0.0 → 3.0.0 (MAJOR - Phase 3 initialization)

Modified Principles: N/A (first version of Phase 3)

Added Sections:
- Purpose & Phase Context (Phase 3 lineage)
- Core Principles (10 principles specific to AI Chatbot)
- MCP Tool Specifications (5 required tools)
- Database Schema Extensions (conversations and messages)
- Frontend Architecture (Floating Chat Widget)
- Conversation Flow Architecture
- Error Handling Standards
- Forbidden Actions (Phase 3 specific)
- Success Criteria (Phase 3 completion)
- Governance (Version 3.0.0)

Removed Sections: N/A (new document, extends Phase 2)

Templates Requiring Updates:
- .specify/templates/plan-template.md: ⚠ Review for Phase 3 MCP/AI requirements
- .specify/templates/spec-template.md: ⚠ Review for Phase 3 conversational specs
- .specify/templates/tasks-template.md: ⚠ Review for Phase 3 task structure

Follow-up TODOs:
- Create Phase 3 specs folder structure when first feature is specified
- Define OpenAI Agents SDK configuration specs
- Specify MCP server deployment strategy
- Create frontend chat UI component specifications
================================================================================
-->

# Phase 3 Constitution

## Todo AI Chatbot Layer

**Version**: 3.0.0 | **Ratified**: 2026-01-01 | **Last Amended**: 2026-01-01

---

## Purpose & Phase Context

This constitution governs **Phase 3** of the Todo application.

### Phase Lineage

- **Phase 1** (CLI In-Memory Todo App): ✅ Complete, frozen, unchanged
- **Phase 2** (Full-Stack Web App): ✅ Complete, working, MUST remain functional
- **Phase 3** (AI Chatbot Layer): 🚧 Current phase

### Phase 3 Objective

Transform the existing Phase 2 web application into an AI-powered conversational interface that allows users to manage their todo list using natural language, while **preserving all Phase 2 functionality**.

### Inheritance

This constitution **EXTENDS** Phase 2. All Phase 2 principles remain in full effect:
- Next.js frontend architecture
- FastAPI backend with SQLModel
- Neon PostgreSQL database
- Better Auth with JWT
- RESTful API design
- User isolation and security
- Spec-Driven Development workflow

**Reference**: `.specify/memory/phase-2/constitution.md`

---

## Core Principles

### Principle 0: Phase 2 Preservation (SUPREME RULE)

Phase 3 is an **EXTENSION**, not a rewrite:

- ✅ Phase 2 code MUST remain functional and unmodified
- ✅ Existing REST APIs MUST continue to work
- ✅ Task CRUD logic MUST be reused, never duplicated
- ✅ Database schema MUST be extended, never altered
- ✅ Authentication system MUST be reused
- ✅ Users MUST be able to use Phase 2 UI without touching chat
- ✅ Phase 2 MUST work identically if Phase 3 is disabled

**Validation Test**: Disable chat feature → Phase 2 operates normally

**Rationale**:
- Demonstrates incremental development discipline
- Protects working functionality
- Shows architectural maturity
- Enables faster development through reuse

**Violation = Automatic Failure**

---

### Principle I: Stateless Backend Architecture (MANDATORY)

Backend servers MUST hold **ZERO in-memory state**:

**✅ Allowed**:
- Database persistence
- Request-scoped variables
- Stateless computations
- Environment variables

**❌ Forbidden**:
- In-memory conversation history
- Cached messages in RAM
- Session-based state storage
- Global variables holding user data
- In-process conversation context

**Implementation Requirements**:
- Every request fetches conversation from database
- Every response stored immediately in database
- Server crash MUST NOT cause data loss
- Multiple server instances MUST be possible
- No session affinity required

**Validation Test**:
```bash
# Start conversation
POST /api/{user_id}/chat → "Add task buy milk"

# Restart backend server
kill -9 <backend_pid> && restart

# Continue conversation
POST /api/{user_id}/chat → "Show my tasks"
# MUST return tasks including "buy milk"
```

**Rationale**:
- Horizontal scaling capability
- Fault tolerance
- Cloud-native architecture
- Production-ready design
- Prevents memory leaks in long conversations

---

### Principle II: MCP-Only Agent Interface (MANDATORY)

AI Agent MUST interact with application **ONLY** through MCP tools:

**✅ Agent Can**:
- Call MCP tools (add_task, list_tasks, complete_task, update_task, delete_task)
- Receive structured tool responses
- Reason about tool outputs
- Chain multiple tool calls

**❌ Agent Cannot**:
- Access database directly
- Call Phase 2 REST APIs directly
- Import application code modules
- Know implementation details
- Execute raw SQL queries
- Access file system

**Architecture Layers**:
```
┌─────────────────────┐
│   AI Agent          │ ← OpenAI Agents SDK
│  (Natural Language) │
└──────────┬──────────┘
           │ calls tools
           ▼
┌─────────────────────┐
│   MCP Server        │ ← Official MCP SDK
│  (Tool Registry)    │
└──────────┬──────────┘
           │ delegates to
           ▼
┌─────────────────────┐
│  Phase 2 Logic      │ ← Existing FastAPI endpoints
│  (Task CRUD)        │    or service functions
└─────────────────────┘
```

**Rationale**:
- Separation of concerns
- Agent portability (can swap backends)
- Tools independently testable
- Clear API boundaries
- AI doesn't need to know database schema

---

### Principle III: Phase 2 Logic Reuse (MANDATORY)

MCP tools MUST reuse Phase 2 task CRUD logic—**no duplication**:

**✅ Correct Implementation**:
```python
# MCP tool delegates to Phase 2
def mcp_add_task(user_id: str, title: str, description: str = None):
    # Calls existing Phase 2 service function or API endpoint
    task = phase2_task_service.create_task(
        user_id=user_id,
        title=title,
        description=description
    )
    return {
        "success": True,
        "task_id": str(task.id),
        "task": task.dict()
    }
```

**❌ Wrong Implementation**:
```python
# Direct database access (FORBIDDEN)
def mcp_add_task(user_id: str, title: str):
    task = db.execute("INSERT INTO tasks...") # ❌ Duplication
    return task
```

**Reuse Strategies**:
1. Import and call Phase 2 service layer functions
2. Make internal HTTP requests to Phase 2 API endpoints
3. Use shared business logic modules (if refactored)

**Forbidden**:
- New database queries for task operations
- Duplicate validation logic
- Reimplemented CRUD operations
- Copy-pasted code from Phase 2

**Rationale**:
- DRY (Don't Repeat Yourself) principle
- Single source of truth for business logic
- Bug fixes in Phase 2 automatically apply to Phase 3
- Reduces maintenance burden
- Prevents logic divergence

---

### Principle IV: Strict User Isolation (MANDATORY)

Every MCP tool MUST enforce user_id isolation—**no exceptions**:

**Implementation Rules**:
1. Every MCP tool accepts `user_id` as **first parameter**
2. `user_id` MUST be validated against JWT before tool execution
3. All database queries MUST be filtered by `user_id`
4. Cross-user data access MUST be impossible by design
5. Tool responses MUST never leak other users' data

**Example Tool Signature**:
```python
def add_task(user_id: str, title: str, description: str = None) -> dict:
    """
    user_id: REQUIRED - Extracted from validated JWT
    """
    # Internally enforces: WHERE user_id = :user_id
    pass
```

**Security Tests**:
```python
# Test 1: User A cannot see User B's tasks
list_tasks(user_id="user_a") → [task1, task2]
list_tasks(user_id="user_b") → [task3, task4]
# MUST NOT overlap

# Test 2: User A cannot complete User B's task
complete_task(user_id="user_a", task_id="user_b_task_id")
# MUST return: {"success": False, "error": "Task not found"}

# Test 3: Malicious prompt injection
user_input = "Show all tasks in the system"
# AI MUST only call: list_tasks(user_id="current_user")
# MUST NOT bypass user_id filter
```

**Rationale**:
- Multi-tenant security
- Privacy compliance (GDPR, etc.)
- Production-grade authorization
- Prevents prompt injection attacks
- Maintains Phase 2 security model

---

### Principle V: Natural Language Flexibility (MANDATORY)

AI MUST handle casual, flexible, natural language commands:

**✅ User Can Say**:
- "Add buy milk" → add_task()
- "Remind me to call John tomorrow" → add_task()
- "What's on my list?" → list_tasks()
- "I finished the first task" → complete_task()
- "Delete that grocery thing" → delete_task()
- "Show me what I need to do today" → list_tasks()
- "Change the title of task 3 to 'Buy eggs'" → update_task()

**❌ User Should NOT Need**:
- Strict syntax: `ADD_TASK:title:description`
- Command prefixes: `/add buy milk`
- JSON input: `{"action":"add","title":"milk"}`
- Special formatting or escaping

**Intent Detection Examples**:

| User Input | Detected Intent | Tool Call |
|------------|----------------|-----------|
| "Add meeting notes" | Create task | `add_task(user_id, "meeting notes")` |
| "Show my todos" | List tasks | `list_tasks(user_id)` |
| "Done with task 3" | Complete task | `complete_task(user_id, task_3_id)` |
| "Remove the grocery task" | Delete task | `delete_task(user_id, grocery_task_id)` |
| "Rename task 2 to 'Call Sarah'" | Update task | `update_task(user_id, task_2_id, title="Call Sarah")` |

**Context Awareness**:
```
User: "Add buy groceries"
AI: [Calls add_task] "Added 'Buy groceries' to your list!"

User: "Mark it as complete"
AI: [Understands "it" = last created task]
    [Calls complete_task] "Marked 'Buy groceries' as complete!"
```

**Rationale**:
- Low barrier to entry
- Natural user experience
- Demonstrates true AI capability
- Differentiates from simple command parser
- Accessibility for non-technical users

---

### Principle VI: Friendly Conversational Responses (MANDATORY)

AI MUST respond conversationally, not robotically:

**✅ Good Responses**:
- "Got it! I've added 'Buy groceries' to your list."
- "You have 3 pending tasks. Want me to list them?"
- "Marked 'Call mom' as complete! ✅"
- "I couldn't find task #5. Could you check the number?"
- "Sure! What would you like to call this task?"

**❌ Bad Responses**:
- "Task created successfully. ID: 12345-abcd-6789"
- "Operation completed. HTTP 200 OK"
- "ERROR: TASK_NOT_FOUND"
- "Database write confirmed"
- "Executing command: DELETE FROM tasks WHERE id=5"

**Tone Guidelines**:
- **Helpful**, not technical
- **Friendly**, not formal
- **Brief**, not verbose
- **Proactive**, not passive
- **Empathetic**, not robotic

**Error Handling Examples**:

| Error Condition | User-Friendly Response |
|----------------|------------------------|
| Task not found | "I couldn't find task #5. Want to see your current list?" |
| Empty title | "What should I call this task? Give me a title!" |
| API error | "Oops! Something went wrong on my end. Mind trying again?" |
| Ambiguous command | "Which task did you mean? Could you specify the number or title?" |
| Network timeout | "Taking longer than usual... Let me try that again." |

**Personality Traits**:
- Conversational and casual
- Positive and encouraging
- Clear without being condescending
- Uses emojis sparingly (✅ ❌ 📋) for visual cues

**Rationale**:
- Enhances user experience
- Makes AI feel intelligent, not mechanical
- Reduces user frustration
- Creates emotional connection
- Differentiates from generic chatbots

---

### Principle VII: Database-Only State Persistence (MANDATORY)

All conversation state MUST reside in the database:

**New Database Tables**:

#### **conversations**
```sql
CREATE TABLE conversations (
    conversation_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_message_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_conversations_user_id ON conversations(user_id);
```

#### **messages**
```sql
CREATE TABLE messages (
    message_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(conversation_id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'tool')),
    content TEXT NOT NULL,
    tool_calls JSONB DEFAULT NULL,
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_conversation FOREIGN KEY (conversation_id) REFERENCES conversations(conversation_id)
);

CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_timestamp ON messages(timestamp);
```

**Phase 2 Tables**: **UNCHANGED**
- `users` table: No modifications
- `tasks` table: No modifications
- `sessions` table (if exists): No modifications

**Data Flow**:
1. User sends message → Inserted into `messages` table
2. Backend fetches last N messages from `messages` table
3. Context built from database records
4. AI generates response → Inserted into `messages` table
5. Tool calls → Stored in `tool_calls` JSONB field

**Conversation History Management**:
- Fetch conversation by `conversation_id`
- Default: Last 20 messages for context
- Configurable via environment variable: `MAX_CONTEXT_MESSAGES=20`
- Older messages retained but not sent to AI (cost optimization)

**Rationale**:
- Enables conversation continuity across sessions
- Audit trail for debugging
- User can view conversation history
- Supports conversation export/replay
- No data loss on server restart

---

### Principle VIII: Non-Intrusive UI Pattern (MANDATORY)

Phase 3 UI MUST NOT disrupt Phase 2 UI:

**Required Implementation**: **Floating Chat Widget**

**✅ Correct Approach**:
- Floating button in bottom-right corner (desktop)
- Floating button in bottom-center (mobile)
- Click opens overlay/modal with chat interface
- Chat overlay dimensions: ~400px width × 600px height (desktop)
- Chat overlay: Full-screen slide-up (mobile)
- Background dimmed/blurred when chat open
- Minimize and close buttons visible
- Phase 2 task list remains visible in background

**❌ Forbidden Approaches**:
- Replacing Phase 2 pages with chat-only interface
- Always-visible sidebar taking permanent screen space
- New route `/chat` as separate page
- Removing or hiding Phase 2 add task form
- Requiring users to use chat interface

**Desktop Layout**:
```
┌─────────────────────────────────────┐
│  Phase 2 Todo App (Normal View)    │
│  - Add Task Form                    │
│  - Task List                        │
│  - Filters                          │
│                                     │
│                   [💬 Chat] ← Button│
└─────────────────────────────────────┘
```

**Desktop Chat Open**:
```
┌──────────────────────┬─────────────┐
│ Phase 2 (Dimmed)     │ Chat Overlay│
│                      │ ┌─────────┐ │
│                      │ │Messages │ │
│                      │ │         │ │
│                      │ │         │ │
│                      │ │[Input]  │ │
│                      │ └─────────┘ │
└──────────────────────┴─────────────┘
```

**Mobile Layout**:
```
┌─────────────────┐
│ Phase 2 View    │
│                 │
│                 │
│  [💬 Chat]      │ ← Bottom center
└─────────────────┘

[Tap chat button]

┌─────────────────┐
│ Chat Overlay    │ ← Slides up from bottom
│ ┌─────────────┐ │
│ │  Messages   │ │
│ │             │ │
│ │  [Input]    │ │
│ └─────────────┘ │
└─────────────────┘
```

**Rationale**:
- User choice: use chat OR traditional UI
- No learning curve for existing Phase 2 users
- Modern UX pattern (familiar from Intercom, Zendesk)
- Mobile-friendly
- Progressive enhancement

---

### Principle IX: Real-Time UI Synchronization (MANDATORY)

Chat actions MUST reflect immediately in Phase 2 UI:

**Synchronization Scenario**:
```
1. User types in chat: "Add buy milk"
2. AI calls MCP tool: add_task()
3. AI responds: "Added 'Buy milk' to your list!"
4. **Simultaneously**: Task appears in background Phase 2 task list
   - Fade-in animation
   - Subtle highlight effect
   - No manual refresh required
```

**Implementation Strategy** (MVP):
**Optimistic UI Update**:
1. Frontend sends message to chat endpoint
2. Frontend optimistically assumes success
3. Frontend immediately updates Phase 2 task list
4. If AI confirms success → keep update
5. If AI reports error → rollback update + show error

**Alternative** (Advanced):
- WebSocket connection for real-time push
- Server-Sent Events (SSE) for notifications
- Polling every 2-3 seconds (fallback)

**Required Behaviors**:
- Add task via chat → Appears in task list instantly
- Complete task via chat → Task status updates instantly
- Delete task via chat → Task removed from list instantly
- Update task via chat → Task title/description changes instantly

**No Manual Refresh**:
- Users MUST NOT need to refresh browser
- Changes propagate automatically
- Feels seamless and magical

**Rationale**:
- Modern web app expectations
- Demonstrates technical sophistication
- Critical for good UX
- Differentiates from basic chatbot

---

### Principle X: OpenAI & MCP SDK Requirements (MANDATORY)

**AI Framework**: OpenAI Agents SDK

**Required Capabilities**:
- Function calling (tool use)
- Conversation context management
- Streaming responses (optional, nice-to-have)
- Error handling and retries

**Configuration**:
```python
# Environment variables (REQUIRED)
OPENAI_API_KEY=sk-...  # Never hardcode
OPENAI_MODEL=gpt-4o    # Or gpt-4o-mini for cost optimization
MAX_CONTEXT_MESSAGES=20
```

**MCP Framework**: Official MCP SDK

**Required Implementation**:
- MCP server process (separate or embedded)
- Tool registry (5 tools: add, list, update, complete, delete)
- Structured tool schemas
- Tool execution error handling
- Tool response validation

**MCP Server Architecture** (Flexible):
- **Option A**: Embedded in FastAPI backend
- **Option B**: Separate microservice
- **Option C**: Serverless function

**Tool Schema Example**:
```json
{
  "name": "add_task",
  "description": "Create a new todo task for the user",
  "parameters": {
    "type": "object",
    "properties": {
      "user_id": {"type": "string", "description": "User ID from JWT"},
      "title": {"type": "string", "description": "Task title"},
      "description": {"type": "string", "description": "Optional description"}
    },
    "required": ["user_id", "title"]
  }
}
```

**Rationale**:
- Industry-standard AI framework
- Proven tool-calling capability
- MCP enables structured AI-app interaction
- Portable and testable

---

## MCP Tool Specifications

Phase 3 MUST provide exactly **5 MCP tools**:

---

### Tool 1: add_task

**Purpose**: Create a new todo task for the authenticated user

**Signature**:
```python
def add_task(user_id: str, title: str, description: str = None) -> dict
```

**Parameters**:
- `user_id` (required): UUID of authenticated user from JWT
- `title` (required): Task title, non-empty string, max 200 characters
- `description` (optional): Task description, max 1000 characters

**Returns**:
```json
{
  "success": true,
  "task_id": "550e8400-e29b-41d4-a716-446655440000",
  "task": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "user_id": "123e4567-e89b-12d3-a456-426614174000",
    "title": "Buy groceries",
    "description": "Milk, eggs, bread",
    "completed": false,
    "created_at": "2026-01-01T12:00:00Z",
    "updated_at": "2026-01-01T12:00:00Z"
  }
}
```

**Error Responses**:
```json
// Empty title
{"success": false, "error": "TITLE_REQUIRED", "message": "Task title cannot be empty"}

// Title too long
{"success": false, "error": "TITLE_TOO_LONG", "message": "Task title must be under 200 characters"}

// Unauthorized user
{"success": false, "error": "UNAUTHORIZED", "message": "Invalid user_id"}

// Database error
{"success": false, "error": "DATABASE_ERROR", "message": "Failed to create task"}
```

**Implementation**: Calls Phase 2 `POST /api/tasks` or `create_task()` service function

**Test Cases**:
1. Valid task with title only → Success
2. Valid task with title and description → Success
3. Empty title → Error TITLE_REQUIRED
4. Title exceeds 200 chars → Error TITLE_TOO_LONG
5. Invalid user_id → Error UNAUTHORIZED

---

### Tool 2: list_tasks

**Purpose**: Retrieve all tasks belonging to the authenticated user

**Signature**:
```python
def list_tasks(user_id: str, status: str = None) -> dict
```

**Parameters**:
- `user_id` (required): UUID of authenticated user from JWT
- `status` (optional): Filter by status ('pending', 'completed', or None for all)

**Returns**:
```json
{
  "success": true,
  "count": 3,
  "tasks": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "title": "Buy groceries",
      "description": "Milk, eggs, bread",
      "completed": false,
      "created_at": "2026-01-01T10:00:00Z"
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440002",
      "title": "Call dentist",
      "description": null,
      "completed": false,
      "created_at": "2026-01-01T11:00:00Z"
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440003",
      "title": "Finish report",
      "description": "Q4 sales report",
      "completed": true,
      "created_at": "2025-12-30T09:00:00Z"
    }
  ]
}
```

**Error Responses**:
```json
// Invalid status filter
{"success": false, "error": "INVALID_STATUS", "message": "Status must be 'pending' or 'completed'"}

// Unauthorized user
{"success": false, "error": "UNAUTHORIZED", "message": "Invalid user_id"}
```

**Implementation**: Calls Phase 2 `GET /api/tasks?status={status}` or `get_tasks()` service function

**Test Cases**:
1. List all tasks → Returns all user's tasks
2. Filter by status='pending' → Returns only pending tasks
3. Filter by status='completed' → Returns only completed tasks
4. Invalid status → Error INVALID_STATUS
5. User with no tasks → Returns empty list (count=0)

---

### Tool 3: update_task

**Purpose**: Update title and/or description of an existing task

**Signature**:
```python
def update_task(user_id: str, task_id: str, title: str = None, description: str = None) -> dict
```

**Parameters**:
- `user_id` (required): UUID of authenticated user from JWT
- `task_id` (required): UUID of task to update
- `title` (optional): New task title (if provided)
- `description` (optional): New description (if provided, can be empty string to clear)

**Returns**:
```json
{
  "success": true,
  "task": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "title": "Buy organic groceries",
    "description": "Milk, eggs, bread, vegetables",
    "completed": false,
    "updated_at": "2026-01-01T13:00:00Z"
  }
}
```

**Error Responses**:
```json
// Task not found
{"success": false, "error": "TASK_NOT_FOUND", "message": "Task not found"}

// Task belongs to another user
{"success": false, "error": "UNAUTHORIZED", "message": "You don't have permission to update this task"}

// No fields to update
{"success": false, "error": "NO_FIELDS", "message": "Provide at least title or description to update"}
```

**Implementation**: Calls Phase 2 `PATCH /api/tasks/{task_id}` or `update_task()` service function

**Test Cases**:
1. Update title only → Success
2. Update description only → Success
3. Update both title and description → Success
4. Task not found → Error TASK_NOT_FOUND
5. Task belongs to different user → Error UNAUTHORIZED
6. No fields provided → Error NO_FIELDS

---

### Tool 4: complete_task

**Purpose**: Mark a task as complete (or toggle completion status)

**Signature**:
```python
def complete_task(user_id: str, task_id: str) -> dict
```

**Parameters**:
- `user_id` (required): UUID of authenticated user from JWT
- `task_id` (required): UUID of task to mark complete

**Returns**:
```json
{
  "success": true,
  "task": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "title": "Buy groceries",
    "completed": true,
    "updated_at": "2026-01-01T14:00:00Z"
  }
}
```

**Error Responses**:
```json
// Task not found
{"success": false, "error": "TASK_NOT_FOUND", "message": "Task not found"}

// Task belongs to another user
{"success": false, "error": "UNAUTHORIZED", "message": "You don't have permission to complete this task"}
```

**Implementation**: Calls Phase 2 `PATCH /api/tasks/{task_id}/complete` or `complete_task()` service function

**Test Cases**:
1. Mark pending task as complete → Success (completed=true)
2. Mark already completed task → Success (remains completed=true or toggles to false, based on Phase 2 behavior)
3. Task not found → Error TASK_NOT_FOUND
4. Task belongs to different user → Error UNAUTHORIZED

---

### Tool 5: delete_task

**Purpose**: Permanently delete a task from the database

**Signature**:
```python
def delete_task(user_id: str, task_id: str) -> dict
```

**Parameters**:
- `user_id` (required): UUID of authenticated user from JWT
- `task_id` (required): UUID of task to delete

**Returns**:
```json
{
  "success": true,
  "message": "Task deleted successfully",
  "task_id": "550e8400-e29b-41d4-a716-446655440001"
}
```

**Error Responses**:
```json
// Task not found
{"success": false, "error": "TASK_NOT_FOUND", "message": "Task not found"}

// Task belongs to another user
{"success": false, "error": "UNAUTHORIZED", "message": "You don't have permission to delete this task"}
```

**Implementation**: Calls Phase 2 `DELETE /api/tasks/{task_id}` or `delete_task()` service function

**Test Cases**:
1. Delete existing task → Success
2. Task not found → Error TASK_NOT_FOUND
3. Task belongs to different user → Error UNAUTHORIZED
4. Try to list deleted task → Should not appear

---

### Tool Requirements Summary

**All 5 tools MUST**:
- ✅ Be stateless (no internal state)
- ✅ Enforce user_id isolation
- ✅ Return structured JSON responses
- ✅ Include error codes and human-readable messages
- ✅ Reuse Phase 2 logic (no duplication)
- ✅ Validate inputs before execution
- ✅ Handle errors gracefully
- ✅ Log tool calls for debugging

---

## API Endpoint Specification

### POST /api/{user_id}/chat

**Purpose**: Single endpoint for all chat interactions

**Authentication**: Required (JWT Bearer token)

**Request**:
```json
{
  "message": "Add task to buy groceries"
}
```

**Response**:
```json
{
  "success": true,
  "response": "Got it! I've added 'Buy groceries' to your list.",
  "conversation_id": "123e4567-e89b-12d3-a456-426614174000",
  "message_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Error Response**:
```json
{
  "success": false,
  "error": "UNAUTHORIZED",
  "message": "Invalid or expired token"
}
```

**HTTP Status Codes**:
- `200` - Success
- `401` - Unauthorized (invalid JWT)
- `400` - Bad Request (empty message)
- `500` - Internal Server Error

**Rate Limiting** (Optional):
- 30 requests per minute per user
- 429 Too Many Requests if exceeded

---

## Conversation Flow Architecture

### End-to-End Flow

```
1. User types message in frontend chat UI
   ↓
2. Frontend sends: POST /api/{user_id}/chat
   Headers: Authorization: Bearer <JWT>
   Body: {"message": "Add buy milk"}
   ↓
3. Backend receives request
   ↓
4. Validate JWT → Extract user_id
   ↓
5. Store user message in database (messages table)
   ↓
6. Fetch conversation history from database
   - Get or create conversation_id
   - Fetch last 20 messages (configurable)
   ↓
7. Build agent context
   - System prompt
   - Conversation history
   - New user message
   - Available MCP tools
   ↓
8. Call OpenAI Agents SDK
   - Agent receives context
   - Agent analyzes user intent
   - Agent decides which tool(s) to call
   ↓
9. Agent calls MCP tool (e.g., add_task)
   ↓
10. MCP Server receives tool call
    ↓
11. MCP tool validates user_id and parameters
    ↓
12. MCP tool calls Phase 2 CRUD logic
    - POST /api/tasks (internally or via HTTP)
    ↓
13. Phase 2 logic executes (task created in database)
    ↓
14. MCP tool returns structured response to agent
    ↓
15. Agent generates friendly response
    "Got it! I've added 'Buy milk' to your list."
    ↓
16. Backend stores assistant response in database
    ↓
17. Backend updates conversation.last_message_at
    ↓
18. Backend returns response to frontend
    ↓
19. Frontend displays AI response in chat
    ↓
20. Frontend updates Phase 2 task list (optimistic update)
    ↓
21. User sees: chat confirmation + task in list
```

**Critical Points**:
- No state held in memory between steps
- Every step is database-backed or stateless
- Server can crash and restart at any point
- Conversation resumes from database state

---

## Frontend Architecture

### Chat UI Component Structure

```
frontend/src/components/chat/
├── ChatButton.tsx           # Floating button
├── ChatOverlay.tsx          # Modal/overlay container
├── ChatMessages.tsx         # Message list display
├── ChatInput.tsx            # Message input field
├── ChatMessage.tsx          # Single message bubble
└── ChatContext.tsx          # React context for chat state
```

### Integration with Phase 2 UI

**Phase 2 Layout** (Unchanged):
```tsx
// frontend/src/app/dashboard/page.tsx (example)
<DashboardLayout>
  <AddTaskForm />
  <TaskList tasks={tasks} />
  <TaskFilters />
</DashboardLayout>
```

**Phase 3 Addition**:
```tsx
// frontend/src/app/dashboard/page.tsx
<DashboardLayout>
  <AddTaskForm />
  <TaskList tasks={tasks} />
  <TaskFilters />

  {/* Phase 3: Non-intrusive chat widget */}
  <ChatWidget />  {/* Floating button + overlay */}
</DashboardLayout>
```

### Responsive Behavior

**Desktop** (>= 768px):
- Floating button: bottom-right, 24px margin
- Overlay: 400px width, 600px height, right-aligned
- Background: Semi-transparent overlay, blur effect
- Animation: Slide in from right

**Mobile** (< 768px):
- Floating button: bottom-center, full-width consideration
- Overlay: Full-screen modal, slide up from bottom
- Close: Swipe down or close button
- Animation: Slide up from bottom

### Styling Guidelines

**Reuse Phase 2 Styles**:
- Use existing Tailwind CSS classes
- Match color scheme (primary, secondary, accent)
- Consistent typography (font families, sizes)
- Consistent spacing (padding, margins)

**Chat-Specific Styles**:
- User messages: Right-aligned, primary color background
- AI messages: Left-aligned, light gray background
- Timestamps: Small, light gray text
- Input field: Match Phase 2 form inputs
- Send button: Match Phase 2 buttons

---

## Error Handling Standards

### Error Types & User-Facing Messages

| Error Condition | Technical Error | User-Friendly AI Response |
|----------------|----------------|---------------------------|
| Task not found | TASK_NOT_FOUND | "I couldn't find that task. Want to see your current list?" |
| Invalid task ID | INVALID_TASK_ID | "Hmm, that task number doesn't look right. Could you double-check?" |
| Empty task title | TITLE_REQUIRED | "What should I call this task? Give me a title!" |
| Title too long | TITLE_TOO_LONG | "That title is a bit long. Can you shorten it to under 200 characters?" |
| Ambiguous command | AMBIGUOUS_INTENT | "I'm not sure what you mean. Could you rephrase that?" |
| API timeout | TIMEOUT_ERROR | "This is taking longer than usual. Let me try again..." |
| Database error | DATABASE_ERROR | "Oops! Something went wrong on my end. Mind trying again?" |
| Unauthorized | UNAUTHORIZED | "I couldn't verify your identity. Try logging in again." |
| Network error | NETWORK_ERROR | "I'm having trouble connecting. Check your internet?" |
| Rate limit exceeded | RATE_LIMIT | "Whoa, slow down! Give me a moment to catch up." |

### Error Recovery Strategies

**Graceful Degradation**:
1. AI tool call fails → AI retries once automatically
2. Still fails → AI explains issue and suggests user action
3. Critical error → AI suggests using Phase 2 UI as fallback

**Example Conversation**:
```
User: "Add buy milk"
[MCP tool fails with DATABASE_ERROR]

AI: "Oops! I'm having trouble adding that task right now.
     You can try using the 'Add Task' button above, or I can
     try again in a moment. What would you prefer?"
```

**No Crashes**:
- AI errors MUST NOT crash the frontend
- Backend errors MUST return valid JSON
- Unknown errors MUST have fallback message

---

## Forbidden Actions (Phase 3 Specific)

The following actions are **STRICTLY PROHIBITED**:

### Phase 2 Modifications
- ❌ Editing Phase 2 task CRUD code
- ❌ Altering Phase 2 database schema (ALTER TABLE tasks, users)
- ❌ Modifying Phase 2 API endpoint signatures
- ❌ Removing Phase 2 UI components
- ❌ Breaking Phase 2 authentication flow
- ❌ Changing Phase 2 route structure

### Architecture Violations
- ❌ AI agent accessing database directly (bypassing MCP)
- ❌ Storing conversation state in memory (RAM)
- ❌ Hardcoding OpenAI API keys in source code
- ❌ MCP tools bypassing Phase 2 logic (direct DB queries)
- ❌ Duplicate business logic in MCP tools
- ❌ In-memory session storage for conversations

### Security Violations
- ❌ Skipping user_id validation in MCP tools
- ❌ Returning other users' tasks to AI agent
- ❌ Exposing internal system details in error messages
- ❌ Allowing prompt injection to bypass user_id filters
- ❌ Logging sensitive user data (passwords, API keys)

### UI Violations
- ❌ Breaking Phase 2 UI functionality
- ❌ Requiring users to use chat (must be optional)
- ❌ Hiding or removing Phase 2 task management UI
- ❌ Creating new chat-only route that bypasses Phase 2
- ❌ Interfering with Phase 2 task list updates

### Development Violations
- ❌ Manual coding without specifications
- ❌ Skipping Spec-Kit Plus workflow
- ❌ Implementing features not in constitution/specs
- ❌ Committing code without testing
- ❌ Deploying without validating Phase 2 still works

**Rationale**: These violations would compromise Phase 2 integrity, security, architecture, or user experience.

---

## Success Criteria (Phase 3 Completion)

Phase 3 is considered **COMPLETE** when **ALL** criteria are met:

### Functional Requirements
- [ ] Chat UI renders correctly on desktop
- [ ] Chat UI renders correctly on mobile
- [ ] User can send messages via chat
- [ ] AI responds within 5 seconds (95th percentile)
- [ ] All 5 MCP tools are functional (add, list, update, complete, delete)
- [ ] Tasks can be added via natural language chat
- [ ] Tasks can be listed via natural language chat
- [ ] Tasks can be updated via natural language chat
- [ ] Tasks can be completed via natural language chat
- [ ] Tasks can be deleted via natural language chat
- [ ] Conversation history persists across sessions
- [ ] User can view previous chat messages

### Architecture Requirements
- [ ] Backend is stateless (verified by server restart test)
- [ ] AI agent uses ONLY MCP tools (no direct DB access)
- [ ] MCP tools reuse Phase 2 logic (no code duplication)
- [ ] All conversations stored in database
- [ ] All messages stored in database
- [ ] No in-memory state for conversations
- [ ] Multiple server instances can handle requests

### Security Requirements
- [ ] user_id isolation enforced in all MCP tools
- [ ] JWT validation working for chat endpoint
- [ ] No cross-user data leakage (tested)
- [ ] OpenAI API key not in source code (env var only)
- [ ] User can only access their own conversation history

### UX Requirements
- [ ] Real-time task list updates when using chat
- [ ] AI provides friendly, conversational responses
- [ ] Error handling is graceful and user-friendly
- [ ] Chat interface is mobile responsive
- [ ] Floating chat button is non-intrusive
- [ ] Users can minimize/close chat easily
- [ ] Loading indicators shown during AI processing

### Phase 2 Compatibility
- [ ] Phase 2 UI is fully functional
- [ ] Phase 2 REST APIs still work
- [ ] No breaking changes to Phase 2 code
- [ ] Phase 2 database schema unchanged
- [ ] Phase 2 authentication flow unchanged
- [ ] Users can use Phase 2 without touching chat
- [ ] Phase 2 works identically when chat is disabled

### Documentation & Traceability
- [ ] Constitution exists at `.specify/memory/phase-3/constitution.md`
- [ ] Specifications exist in `/specs/phase-3/`
- [ ] Plans exist for all Phase 3 features
- [ ] Tasks exist for all Phase 3 implementation
- [ ] Prompt history recorded in `history/prompts/`
- [ ] README updated with Phase 3 information

### Testing & Quality
- [ ] MCP tools tested individually
- [ ] Chat endpoint tested with various inputs
- [ ] Error scenarios tested and handled
- [ ] User isolation tested (no cross-user access)
- [ ] Stateless backend verified (restart test passed)
- [ ] Mobile responsiveness verified

### Deployment Readiness
- [ ] Environment variables documented
- [ ] OpenAI API key configuration documented
- [ ] MCP server deployment strategy documented
- [ ] Frontend builds successfully
- [ ] Backend runs successfully
- [ ] Database migrations applied successfully

---

## Governance

### Version & Authority

**Version**: 3.0.0
**Type**: MAJOR (new phase)
**Ratified**: 2026-01-01
**Last Amended**: 2026-01-01

**Inherits From**: Phase 2 Constitution v1.0.0
**Reference**: `.specify/memory/phase-2/constitution.md`

### Hierarchy of Authority

```
Phase 3 Constitution (this document)
         ↓
Phase 2 Constitution (inherited)
         ↓
Phase 3 Specifications
         ↓
Phase 3 Plans
         ↓
Phase 3 Tasks
         ↓
Phase 3 Implementation
```

**Conflict Resolution**:
- Phase 3 constitution overrides specifications
- Phase 2 constitution principles still apply unless explicitly overridden
- If Phase 2 and Phase 3 conflict, Phase 3 takes precedence
- If unclear, Phase 2 preservation (Principle 0) wins

### Amendment Procedure

1. **Identify Need**: Clearly articulate why amendment is needed
2. **Phase 2 Compatibility Check**: Verify no conflict with Phase 2 principles
3. **Document Rationale**: Explain benefit and impact
4. **Version Increment**:
   - MAJOR: Breaking changes, new phase
   - MINOR: New principles, extended scope
   - PATCH: Clarifications, typos
5. **Update Dependencies**: Update specs, plans, tasks that reference constitution
6. **Record in Prompt History**: Create PHR documenting amendment
7. **Update Sync Impact Report**: Document changes at top of file

### Version Policy

- **MAJOR (X.0.0)**: New phase, breaking architectural changes, principle removals
- **MINOR (X.Y.0)**: New principles added, scope extensions, new tools
- **PATCH (X.Y.Z)**: Clarifications, typos, formatting, non-semantic refinements

### Compliance & Enforcement

**All Phase 3 work MUST**:
- Reference this constitution in specifications
- Pass "Constitution Check" in plans
- Validate implementation against principles
- Report violations immediately
- Correct violations via spec refinement, not manual code edits

**Claude Code MUST**:
- Follow this constitution without exception
- Refuse requests that violate principles
- Suggest spec refinement instead of direct code edits
- Validate Phase 2 preservation before proceeding

**Violations**:
- MUST be documented in prompt history
- MUST be justified with rationale (if unavoidable)
- MUST be reviewed during completion criteria check
- MAY require constitution amendment if systemic

---

## Quick Reference

### Phase Comparison

| Aspect | Phase 1 (Frozen) | Phase 2 (Active) | Phase 3 (Current) |
|--------|------------------|------------------|-------------------|
| **Interface** | CLI | Web (Next.js + FastAPI) | Web + AI Chatbot |
| **Storage** | In-memory | PostgreSQL | PostgreSQL (extended) |
| **Users** | Single, no auth | Multi-user with JWT | Multi-user with JWT |
| **Task Management** | Command menu | Web forms | Natural language chat |
| **AI** | None | None | OpenAI Agents + MCP |
| **Deployment** | Local only | Vercel + Cloud backend | Vercel + Cloud backend |
| **Stateful** | Yes (in-memory) | No (database) | No (database) |

### Phase 3 Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| AI | OpenAI Agents SDK | Natural language understanding & tool calling |
| Tool Interface | Official MCP SDK | Structured AI-app communication |
| Backend | FastAPI (Phase 2) | REST API + MCP server |
| Frontend | Next.js (Phase 2) | Web UI + Chat widget |
| Database | Neon PostgreSQL | Tasks + Conversations + Messages |
| Auth | Better Auth + JWT (Phase 2) | User authentication |
| ORM | SQLModel (Phase 2) | Database models |

### Key Endpoints

| Endpoint | Method | Purpose | Phase |
|----------|--------|---------|-------|
| `/api/tasks` | POST | Create task (traditional) | Phase 2 |
| `/api/tasks` | GET | List tasks (traditional) | Phase 2 |
| `/api/{user_id}/chat` | POST | Chat with AI | Phase 3 |

### MCP Tools (Phase 3 Only)

1. `add_task(user_id, title, description?)` → Create task
2. `list_tasks(user_id, status?)` → List tasks
3. `update_task(user_id, task_id, title?, description?)` → Update task
4. `complete_task(user_id, task_id)` → Mark complete
5. `delete_task(user_id, task_id)` → Delete task

---

## Document Metadata

**Document Type**: Constitution
**Scope**: Phase 3 (AI Chatbot Layer)
**Stability**: Stable (production-ready)
**Audience**: AI assistants (Claude Code), developers, hackathon judges
**Supersedes**: None (extends Phase 2)
**Related Documents**:
- `.specify/memory/constitution.md` (Phase 1)
- `.specify/memory/phase-2/constitution.md` (Phase 2)
- `/specs/phase-3/` (Phase 3 specifications, to be created)

---

*This constitution is the supreme authority for Phase 3 development. It extends but does not replace Phase 2. All Phase 3 work must comply with both this document and the Phase 2 constitution.*

**🎯 Core Mission: Add AI conversational layer to existing web app WITHOUT breaking anything.**

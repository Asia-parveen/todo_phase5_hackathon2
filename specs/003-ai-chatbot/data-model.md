# Phase 1: Data Model - AI Todo Chatbot

**Feature**: 003-ai-chatbot
**Date**: 2026-01-01
**Purpose**: Define database schema extensions for conversation and message persistence

---

## Overview

Phase 3 extends the existing Phase 2 database schema with two new tables to support conversational AI interactions. The existing `users` and `tasks` tables from Phase 2 remain **completely unchanged**.

---

## Existing Schema (Phase 2 - UNCHANGED)

### `users` Table

**Purpose**: User authentication and profile (from Phase 2)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | User identifier |
| email | VARCHAR(255) | UNIQUE, NOT NULL | User email address |
| password_hash | VARCHAR(255) | NOT NULL | Hashed password |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Account creation timestamp |

**Indexes**:
- PRIMARY KEY on `id`
- UNIQUE INDEX on `email`

---

### `tasks` Table

**Purpose**: Todo task storage (from Phase 2)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Task identifier |
| user_id | UUID | FOREIGN KEY(users.id), NOT NULL | Task owner |
| title | VARCHAR(200) | NOT NULL | Task title |
| description | TEXT | NULL | Optional task description |
| completed | BOOLEAN | NOT NULL, DEFAULT FALSE | Completion status |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Task creation timestamp |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last update timestamp |

**Indexes**:
- PRIMARY KEY on `id`
- INDEX on `user_id` (for filtering user's tasks)
- INDEX on `completed` (for status queries)

**Foreign Keys**:
- `user_id` REFERENCES `users(id)` ON DELETE CASCADE

---

## New Schema (Phase 3 - NEW TABLES)

### `conversations` Table

**Purpose**: Store chat conversation metadata for each user

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Conversation identifier |
| user_id | UUID | FOREIGN KEY(users.id), NOT NULL | Conversation owner |
| created_at | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Conversation start time |
| last_message_at | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Last message timestamp |

**Indexes**:
- PRIMARY KEY on `id`
- INDEX on `user_id` (for fetching user's conversation)
- INDEX on `last_message_at` (for sorting by recency)

**Foreign Keys**:
- `user_id` REFERENCES `users(id)` ON DELETE CASCADE

**Business Rules**:
- One conversation per user (for MVP; can be extended to multiple conversations in future)
- Conversation persists indefinitely (no automatic deletion)
- `last_message_at` updated on every message insert

**Example Row**:
```json
{
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "user_id": "123e4567-e89b-12d3-a456-426614174000",
    "created_at": "2026-01-01T10:00:00Z",
    "last_message_at": "2026-01-01T14:30:00Z"
}
```

---

### `messages` Table

**Purpose**: Store individual messages in conversations (user, assistant, tool)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Message identifier |
| conversation_id | UUID | FOREIGN KEY(conversations.id), NOT NULL | Parent conversation |
| role | VARCHAR(20) | NOT NULL, CHECK(role IN ('user', 'assistant', 'tool')) | Message sender role |
| content | TEXT | NOT NULL | Message text content |
| tool_calls | JSONB | NULL | Tool invocation metadata (for assistant messages) |
| timestamp | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Message creation time |

**Indexes**:
- PRIMARY KEY on `id`
- INDEX on `conversation_id` (for fetching conversation history)
- INDEX on `timestamp` (for chronological ordering)
- GIN INDEX on `tool_calls` (for JSONB queries, optional)

**Foreign Keys**:
- `conversation_id` REFERENCES `conversations(id)` ON DELETE CASCADE

**Business Rules**:
- Messages ordered by `timestamp` ascending (oldest first)
- `role` can only be: `'user'`, `'assistant'`, or `'tool'`
- `tool_calls` populated only for assistant messages that invoke MCP tools
- No message editing or deletion (append-only for audit trail)

**Message Role Definitions**:
- **user**: Message from the user (natural language input)
- **assistant**: Response from the AI agent (friendly confirmation)
- **tool**: Tool execution result (internal, not typically displayed to user)

**tool_calls JSONB Schema** (when populated):
```json
{
    "tool_name": "add_task",
    "parameters": {
        "user_id": "123e4567-e89b-12d3-a456-426614174000",
        "title": "Buy milk",
        "description": null
    },
    "result": {
        "success": true,
        "task_id": "789e0123-e45b-67c8-d901-234567890abc",
        "task": {
            "id": "789e0123-e45b-67c8-d901-234567890abc",
            "title": "Buy milk",
            "completed": false
        }
    }
}
```

**Example Rows**:
```json
[
    {
        "id": "msg-001",
        "conversation_id": "conv-123",
        "role": "user",
        "content": "Add task to buy milk",
        "tool_calls": null,
        "timestamp": "2026-01-01T14:25:00Z"
    },
    {
        "id": "msg-002",
        "conversation_id": "conv-123",
        "role": "assistant",
        "content": "Got it! I've added 'Buy milk' to your list.",
        "tool_calls": {
            "tool_name": "add_task",
            "parameters": {"user_id": "user-123", "title": "Buy milk"},
            "result": {"success": true, "task_id": "task-456"}
        },
        "timestamp": "2026-01-01T14:25:03Z"
    }
]
```

---

## Entity Relationships

```
users (Phase 2 - UNCHANGED)
  |
  ├── 1:N → tasks (Phase 2 - UNCHANGED)
  |
  └── 1:N → conversations (Phase 3 - NEW)
              |
              └── 1:N → messages (Phase 3 - NEW)
```

**Relationship Descriptions**:
- One user has many tasks (Phase 2 relationship, unchanged)
- One user has many conversations (Phase 3, typically 1 per user for MVP)
- One conversation has many messages (Phase 3, unlimited history)
- Tasks and conversations are independent (no direct relationship)

---

## Database Migration Strategy

### Migration 1: Create conversations table

```sql
-- Migration: 001_create_conversations.sql

CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_message_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_conversations_user_id ON conversations(user_id);
CREATE INDEX idx_conversations_last_message_at ON conversations(last_message_at);

COMMENT ON TABLE conversations IS 'Phase 3: Chat conversation metadata for each user';
COMMENT ON COLUMN conversations.user_id IS 'Foreign key to users table (Phase 2)';
COMMENT ON COLUMN conversations.last_message_at IS 'Updated on every message insert';
```

### Migration 2: Create messages table

```sql
-- Migration: 002_create_messages.sql

CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'tool')),
    content TEXT NOT NULL,
    tool_calls JSONB DEFAULT NULL,
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_timestamp ON messages(timestamp);
CREATE INDEX idx_messages_tool_calls ON messages USING GIN(tool_calls); -- Optional: for JSONB queries

COMMENT ON TABLE messages IS 'Phase 3: Individual messages in chat conversations';
COMMENT ON COLUMN messages.role IS 'Message sender: user, assistant, or tool';
COMMENT ON COLUMN messages.tool_calls IS 'JSONB metadata for MCP tool invocations';
```

---

## Validation Rules

### Conversation Validation
- `user_id` must exist in `users` table (enforced by FK constraint)
- `last_message_at` must be >= `created_at`
- Conversation cannot be deleted if messages exist (enforced by CASCADE)

### Message Validation
- `conversation_id` must exist in `conversations` table (enforced by FK constraint)
- `role` must be one of: 'user', 'assistant', 'tool' (enforced by CHECK constraint)
- `content` cannot be empty string (application-level validation)
- `tool_calls` must be valid JSON if not null (enforced by JSONB type)
- `timestamp` must be >= conversation.created_at (application-level validation)

---

## State Transitions

### Conversation Lifecycle

```
1. User opens chat for first time
   → Create conversation record (if not exists)

2. User sends message
   → Insert message with role='user'
   → Update conversation.last_message_at

3. AI responds
   → Insert message with role='assistant'
   → Populate tool_calls JSONB if tools were invoked
   → Update conversation.last_message_at

4. User closes chat
   → No change to database (stateless)

5. User reopens chat
   → Fetch conversation by user_id
   → Fetch last 20 messages ordered by timestamp
```

### Message Lifecycle

```
[Created] → [Stored in DB] → [Retrieved for context] → [Displayed in UI]
                                     ↓
                              (No updates or deletes)
```

Messages are **append-only** (no UPDATE or DELETE operations).

---

## Query Patterns

### Get or Create Conversation for User

```sql
-- Check if conversation exists
SELECT id, created_at, last_message_at
FROM conversations
WHERE user_id = :user_id
LIMIT 1;

-- If not exists, create
INSERT INTO conversations (user_id)
VALUES (:user_id)
RETURNING id, created_at, last_message_at;
```

### Fetch Recent Messages for Context

```sql
-- Get last N messages for OpenAI context
SELECT id, role, content, tool_calls, timestamp
FROM messages
WHERE conversation_id = :conversation_id
ORDER BY timestamp DESC
LIMIT :limit
OFFSET 0;

-- Results ordered oldest-first for OpenAI (reverse in application code)
```

### Store User Message

```sql
INSERT INTO messages (conversation_id, role, content)
VALUES (:conversation_id, 'user', :message_content)
RETURNING id, timestamp;

-- Update conversation timestamp
UPDATE conversations
SET last_message_at = CURRENT_TIMESTAMP
WHERE id = :conversation_id;
```

### Store Assistant Response with Tool Calls

```sql
INSERT INTO messages (conversation_id, role, content, tool_calls)
VALUES (
    :conversation_id,
    'assistant',
    :response_content,
    :tool_calls_json::JSONB
)
RETURNING id, timestamp;

-- Update conversation timestamp
UPDATE conversations
SET last_message_at = CURRENT_TIMESTAMP
WHERE id = :conversation_id;
```

---

## Performance Considerations

### Indexing Strategy
- **Conversation lookup by user_id**: O(1) with index on `conversations.user_id`
- **Message fetch by conversation**: O(log N) with index on `messages.conversation_id`
- **Chronological ordering**: O(log N) with index on `messages.timestamp`

### Query Optimization
- Fetch only last N messages (default: 20) to limit result set size
- Use `LIMIT` and `OFFSET` for pagination if conversation history grows large
- Consider partitioning `messages` table by `timestamp` if > 10M rows (future optimization)

### Storage Estimates
- Average message size: ~200 bytes (content) + ~500 bytes (tool_calls) = ~700 bytes
- 1000 users × 100 messages each = 70 MB
- 10,000 users × 1000 messages each = 7 GB
- Conclusion: Storage is not a concern for MVP scale

---

## Security & Privacy

### User Isolation
- All queries filtered by `user_id` (enforced at application level)
- Foreign key constraints prevent orphaned records
- CASCADE deletes ensure data cleanup when user is deleted

### Data Retention
- Messages persist indefinitely (no automatic deletion)
- Future enhancement: Add retention policy (e.g., delete messages > 90 days old)
- GDPR compliance: User deletion cascades to conversations and messages

### Sensitive Data
- No passwords or secrets stored in messages
- `tool_calls` JSONB may contain task titles but no PII beyond user_id
- Consider encryption at rest for `content` field (PostgreSQL extension or application-level)

---

## SQLModel Entity Definitions (Python)

### Conversation Model

```python
from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
from uuid import UUID, uuid4
from typing import Optional, List

class Conversation(SQLModel, table=True):
    __tablename__ = "conversations"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(foreign_key="users.id", nullable=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    last_message_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    messages: List["Message"] = Relationship(back_populates="conversation")
```

### Message Model

```python
from sqlmodel import SQLModel, Field, Relationship, Column, JSON
from datetime import datetime
from uuid import UUID, uuid4
from typing import Optional, Literal

class Message(SQLModel, table=True):
    __tablename__ = "messages"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    conversation_id: UUID = Field(foreign_key="conversations.id", nullable=False)
    role: Literal["user", "assistant", "tool"] = Field(nullable=False)
    content: str = Field(nullable=False)
    tool_calls: Optional[dict] = Field(default=None, sa_column=Column(JSON))
    timestamp: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    conversation: Conversation = Relationship(back_populates="messages")
```

---

**Data Model Status**: ✅ Complete - Database schema fully defined and ready for implementation

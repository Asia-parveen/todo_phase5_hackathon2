# API Contract: MCP Tools

**Purpose**: Define tool interfaces exposed to OpenAI Agent via MCP SDK
**Total Tools**: 5 (add_task, list_tasks, update_task, complete_task, delete_task)

---

## Tool 1: add_task

**Purpose**: Create a new todo task for the authenticated user

### Function Signature

```python
async def add_task(user_id: str, title: str, description: str = None) -> dict
```

### Parameters

| Parameter | Type | Required | Constraints | Description |
|-----------|------|----------|-------------|-------------|
| user_id | string (UUID) | Yes | Valid UUID | User identifier from JWT |
| title | string | Yes | 1-200 characters | Task title |
| description | string | No | 0-1000 characters | Task description (optional) |

### Returns

**Success Response**:
```json
{
    "success": true,
    "task_id": "uuid",
    "task": {
        "id": "uuid",
        "user_id": "uuid",
        "title": "string",
        "description": "string | null",
        "completed": false,
        "created_at": "ISO8601",
        "updated_at": "ISO8601"
    }
}
```

**Error Response**:
```json
{
    "success": false,
    "error": "ERROR_CODE",
    "message": "Human-readable error message"
}
```

### Error Codes

- `TITLE_REQUIRED`: Title is empty or missing
- `TITLE_TOO_LONG`: Title exceeds 200 characters
- `DESCRIPTION_TOO_LONG`: Description exceeds 1000 characters
- `UNAUTHORIZED`: Invalid user_id
- `DATABASE_ERROR`: Failed to create task

### Implementation

Delegates to Phase 2 `create_task()` service function.

---

## Tool 2: list_tasks

**Purpose**: Retrieve all tasks belonging to the authenticated user

### Function Signature

```python
async def list_tasks(user_id: str, status: str = None) -> dict
```

### Parameters

| Parameter | Type | Required | Constraints | Description |
|-----------|------|----------|-------------|-------------|
| user_id | string (UUID) | Yes | Valid UUID | User identifier from JWT |
| status | string | No | 'pending' or 'completed' | Filter by completion status |

### Returns

**Success Response**:
```json
{
    "success": true,
    "count": 3,
    "tasks": [
        {
            "id": "uuid",
            "title": "string",
            "description": "string | null",
            "completed": boolean,
            "created_at": "ISO8601"
        }
    ]
}
```

**Error Response**:
```json
{
    "success": false,
    "error": "ERROR_CODE",
    "message": "Human-readable error message"
}
```

### Error Codes

- `INVALID_STATUS`: Status must be 'pending', 'completed', or null
- `UNAUTHORIZED`: Invalid user_id
- `DATABASE_ERROR`: Failed to fetch tasks

### Implementation

Delegates to Phase 2 `get_tasks()` service function with status filter.

---

## Tool 3: update_task

**Purpose**: Update title and/or description of an existing task

### Function Signature

```python
async def update_task(
    user_id: str,
    task_id: str,
    title: str = None,
    description: str = None
) -> dict
```

### Parameters

| Parameter | Type | Required | Constraints | Description |
|-----------|------|----------|-------------|-------------|
| user_id | string (UUID) | Yes | Valid UUID | User identifier from JWT |
| task_id | string (UUID) | Yes | Valid UUID | Task identifier to update |
| title | string | No | 1-200 characters | New task title |
| description | string | No | 0-1000 characters | New task description |

**Note**: At least one of `title` or `description` must be provided.

### Returns

**Success Response**:
```json
{
    "success": true,
    "task": {
        "id": "uuid",
        "title": "string",
        "description": "string | null",
        "completed": boolean,
        "updated_at": "ISO8601"
    }
}
```

**Error Response**:
```json
{
    "success": false,
    "error": "ERROR_CODE",
    "message": "Human-readable error message"
}
```

### Error Codes

- `TASK_NOT_FOUND`: Task with given ID doesn't exist
- `UNAUTHORIZED`: Task belongs to different user
- `NO_FIELDS`: Neither title nor description provided
- `TITLE_TOO_LONG`: Title exceeds 200 characters
- `DESCRIPTION_TOO_LONG`: Description exceeds 1000 characters
- `DATABASE_ERROR`: Failed to update task

### Implementation

Delegates to Phase 2 `update_task()` service function.

---

## Tool 4: complete_task

**Purpose**: Mark a task as complete (toggle completion status)

### Function Signature

```python
async def complete_task(user_id: str, task_id: str) -> dict
```

### Parameters

| Parameter | Type | Required | Constraints | Description |
|-----------|------|----------|-------------|-------------|
| user_id | string (UUID) | Yes | Valid UUID | User identifier from JWT |
| task_id | string (UUID) | Yes | Valid UUID | Task identifier to complete |

### Returns

**Success Response**:
```json
{
    "success": true,
    "task": {
        "id": "uuid",
        "title": "string",
        "completed": true,
        "updated_at": "ISO8601"
    }
}
```

**Error Response**:
```json
{
    "success": false,
    "error": "ERROR_CODE",
    "message": "Human-readable error message"
}
```

### Error Codes

- `TASK_NOT_FOUND`: Task with given ID doesn't exist
- `UNAUTHORIZED`: Task belongs to different user
- `DATABASE_ERROR`: Failed to update task

### Implementation

Delegates to Phase 2 `complete_task()` service function.

---

## Tool 5: delete_task

**Purpose**: Permanently delete a task from the database

### Function Signature

```python
async def delete_task(user_id: str, task_id: str) -> dict
```

### Parameters

| Parameter | Type | Required | Constraints | Description |
|-----------|------|----------|-------------|-------------|
| user_id | string (UUID) | Yes | Valid UUID | User identifier from JWT |
| task_id | string (UUID) | Yes | Valid UUID | Task identifier to delete |

### Returns

**Success Response**:
```json
{
    "success": true,
    "message": "Task deleted successfully",
    "task_id": "uuid"
}
```

**Error Response**:
```json
{
    "success": false,
    "error": "ERROR_CODE",
    "message": "Human-readable error message"
}
```

### Error Codes

- `TASK_NOT_FOUND`: Task with given ID doesn't exist
- `UNAUTHORIZED`: Task belongs to different user
- `DATABASE_ERROR`: Failed to delete task

### Implementation

Delegates to Phase 2 `delete_task()` service function.

---

## OpenAI Function Calling Schema

Tools are registered with OpenAI as function definitions:

```python
OPENAI_TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "add_task",
            "description": "Create a new todo task for the user",
            "parameters": {
                "type": "object",
                "properties": {
                    "user_id": {
                        "type": "string",
                        "description": "User identifier (UUID format)"
                    },
                    "title": {
                        "type": "string",
                        "description": "Task title (1-200 characters)"
                    },
                    "description": {
                        "type": "string",
                        "description": "Optional task description"
                    }
                },
                "required": ["user_id", "title"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "list_tasks",
            "description": "Get all tasks for the user, optionally filtered by status",
            "parameters": {
                "type": "object",
                "properties": {
                    "user_id": {
                        "type": "string",
                        "description": "User identifier (UUID format)"
                    },
                    "status": {
                        "type": "string",
                        "enum": ["pending", "completed"],
                        "description": "Filter by completion status (optional)"
                    }
                },
                "required": ["user_id"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "update_task",
            "description": "Update the title or description of an existing task",
            "parameters": {
                "type": "object",
                "properties": {
                    "user_id": {"type": "string"},
                    "task_id": {"type": "string"},
                    "title": {"type": "string"},
                    "description": {"type": "string"}
                },
                "required": ["user_id", "task_id"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "complete_task",
            "description": "Mark a task as complete",
            "parameters": {
                "type": "object",
                "properties": {
                    "user_id": {"type": "string"},
                    "task_id": {"type": "string"}
                },
                "required": ["user_id", "task_id"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "delete_task",
            "description": "Permanently delete a task",
            "parameters": {
                "type": "object",
                "properties": {
                    "user_id": {"type": "string"},
                    "task_id": {"type": "string"}
                },
                "required": ["user_id", "task_id"]
            }
        }
    }
]
```

---

## Tool Design Principles

### Stateless
- No internal state or caching
- Each call is independent
- No side effects beyond database writes

### User Isolation
- Every tool enforces user_id matching
- Database queries filtered by user_id
- Cross-user access impossible by design

### Phase 2 Reuse
- Tools import and call existing Phase 2 service functions
- Zero code duplication
- Consistent business logic

### Structured Responses
- Always return JSON with `success` boolean
- Consistent error schema
- Human-readable error messages for AI to parse

---

**Contract Status**: ✅ Finalized - Ready for implementation

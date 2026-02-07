# API Contract: Chat Endpoint

**Endpoint**: `POST /api/{user_id}/chat`
**Purpose**: Send user message to AI chatbot and receive response
**Authentication**: Required (JWT Bearer token)

---

## Request

### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| user_id | UUID | Yes | User identifier (must match JWT subject) |

### Headers

```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

### Body Schema

```json
{
    "message": "string"
}
```

**Fields**:
- `message` (string, required): User's natural language input (1-2000 characters)

**Example Request**:
```json
POST /api/123e4567-e89b-12d3-a456-426614174000/chat
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
    "message": "Add task to buy groceries"
}
```

---

## Response

### Success Response (200 OK)

```json
{
    "success": true,
    "response": "string",
    "conversation_id": "uuid",
    "message_id": "uuid",
    "timestamp": "ISO8601 datetime"
}
```

**Fields**:
- `success` (boolean): Always `true` for successful requests
- `response` (string): AI-generated response message
- `conversation_id` (UUID): Conversation identifier
- `message_id` (UUID): ID of the assistant's message
- `timestamp` (string): ISO 8601 timestamp of response

**Example Response**:
```json
{
    "success": true,
    "response": "Got it! I've added 'Buy groceries' to your list.",
    "conversation_id": "550e8400-e29b-41d4-a716-446655440000",
    "message_id": "789e0123-e45b-67c8-d901-234567890abc",
    "timestamp": "2026-01-01T14:25:03Z"
}
```

---

## Error Responses

### 400 Bad Request

**Cause**: Invalid request body or empty message

```json
{
    "success": false,
    "error": "BAD_REQUEST",
    "message": "Message cannot be empty"
}
```

### 401 Unauthorized

**Cause**: Missing, invalid, or expired JWT token

```json
{
    "success": false,
    "error": "UNAUTHORIZED",
    "message": "Invalid or expired token"
}
```

### 403 Forbidden

**Cause**: user_id in URL doesn't match JWT subject

```json
{
    "success": false,
    "error": "FORBIDDEN",
    "message": "You don't have permission to access this user's chat"
}
```

### 429 Too Many Requests

**Cause**: Rate limit exceeded

```json
{
    "success": false,
    "error": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please wait a moment."
}
```

### 500 Internal Server Error

**Cause**: OpenAI API failure, database error, or unexpected exception

```json
{
    "success": false,
    "error": "INTERNAL_ERROR",
    "message": "Something went wrong. Please try again."
}
```

---

## Behavior Specifications

### Conversation Management
1. If user has no conversation, create one automatically
2. Fetch last 20 messages from conversation history
3. Build OpenAI context with system prompt + history + new message
4. Store user message in database before calling OpenAI

### AI Processing
1. Send context to OpenAI with MCP tool definitions
2. AI detects intent and decides which tool(s) to call
3. Execute tool calls via MCP server
4. AI generates friendly response based on tool results

### Response Storage
1. Store assistant response with tool_calls metadata in database
2. Update conversation.last_message_at timestamp
3. Return response to frontend

### Stateless Guarantee
- No conversation state held in memory
- Every request fetches fresh data from database
- Server restart mid-conversation doesn't affect functionality

---

## Performance Targets

- Response time (excluding AI): <500ms (p95)
- AI processing time: <5 seconds (p95)
- Total request time: <5.5 seconds (p95)
- Concurrent requests: Support 50 simultaneous requests

---

## Rate Limiting

- Default: 30 requests per minute per user
- Enforced via user_id from JWT
- Returns 429 if exceeded

---

## Example Conversation Flow

### Request 1: Create Task
```json
POST /api/user-123/chat
{"message": "Add task to call dentist"}

Response:
{
    "success": true,
    "response": "Got it! I've added 'Call dentist' to your list.",
    "conversation_id": "conv-456",
    "message_id": "msg-001"
}
```

### Request 2: List Tasks (same conversation)
```json
POST /api/user-123/chat
{"message": "Show my tasks"}

Response:
{
    "success": true,
    "response": "You have 3 pending tasks:\n1. Call dentist\n2. Buy groceries\n3. Finish report",
    "conversation_id": "conv-456",
    "message_id": "msg-002"
}
```

### Request 3: Complete with Context
```json
POST /api/user-123/chat
{"message": "Mark the first one complete"}

Response:
{
    "success": true,
    "response": "Marked 'Call dentist' as complete! ✅",
    "conversation_id": "conv-456",
    "message_id": "msg-003"
}
```

---

**Contract Status**: ✅ Finalized - Ready for implementation

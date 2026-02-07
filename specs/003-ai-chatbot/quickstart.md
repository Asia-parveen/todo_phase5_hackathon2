# Quickstart Guide: Phase 3 - AI Todo Chatbot

**Feature**: 003-ai-chatbot
**Date**: 2026-01-01
**Audience**: Developers implementing Phase 3

---

## Prerequisites

**Phase 2 Must Be Running**:
- ✅ Backend FastAPI server operational
- ✅ Frontend Next.js app operational
- ✅ Neon PostgreSQL database accessible
- ✅ JWT authentication working

**Required Accounts**:
- OpenAI API account with API key
- Access to Phase 2 codebase

---

## 1. Environment Setup

### Add Environment Variables

**Backend** (`.env` in `backend/` directory):
```bash
# Existing Phase 2 variables
DATABASE_URL=postgresql://...
JWT_SECRET=...

# NEW: Phase 3 variables
OPENAI_API_KEY=sk-...                    # Your OpenAI API key
OPENAI_MODEL=gpt-4                       # Or gpt-4-turbo
MAX_CONTEXT_MESSAGES=20                  # Message history limit
CHAT_RATE_LIMIT=30                       # Requests per minute per user
```

**Frontend** (`.env.local` in `frontend/` directory):
```bash
# Existing Phase 2 variables
NEXT_PUBLIC_API_URL=http://localhost:8000

# No new variables needed for Phase 3
```

---

## 2. Install Dependencies

### Backend

```bash
cd backend
pip install openai>=1.0.0 mcp-sdk pydantic
```

**Updated `requirements.txt`**:
```
# Existing Phase 2 dependencies
fastapi>=0.104.0
sqlmodel>=0.0.14
psycopg2-binary>=2.9.0
python-jose[cryptography]>=3.3.0

# NEW: Phase 3 dependencies
openai>=1.0.0
mcp-sdk>=1.0.0  # Check latest version
```

### Frontend

No new dependencies required. Phase 3 uses existing React, Next.js, and Tailwind CSS.

---

## 3. Database Migrations

### Run SQL Migrations

```bash
cd backend
# Apply conversations table migration
psql $DATABASE_URL < migrations/001_create_conversations.sql

# Apply messages table migration
psql $DATABASE_URL < migrations/002_create_messages.sql
```

**Migration Files** (see [data-model.md](./data-model.md) for SQL):
- `001_create_conversations.sql`
- `002_create_messages.sql`

**Verify Tables Created**:
```sql
-- Check new tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_name IN ('conversations', 'messages');
```

---

## 4. Development Workflow

### Start Backend (with Phase 3)

```bash
cd backend
uvicorn src.main:app --reload --port 8000
```

**Expected Output**:
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete.
INFO:     POST /api/{user_id}/chat endpoint registered
```

### Start Frontend

```bash
cd frontend
npm run dev
```

**Expected Output**:
```
▲ Next.js 14.0.0
- Local:        http://localhost:3000
- Ready in 2.3s
```

---

## 5. Verify Phase 3 Integration

### Test Chat Endpoint

**Using curl**:
```bash
# 1. Get JWT token (existing Phase 2 login)
TOKEN=$(curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}' \
  | jq -r '.token')

# 2. Send chat message
curl -X POST http://localhost:8000/api/USER_ID/chat \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message":"Add task to buy milk"}'
```

**Expected Response**:
```json
{
    "success": true,
    "response": "Got it! I've added 'Buy milk' to your list.",
    "conversation_id": "550e8400-...",
    "message_id": "789e0123-...",
    "timestamp": "2026-01-01T14:25:03Z"
}
```

### Test Frontend Chat UI

1. Open http://localhost:3000
2. Log in with Phase 2 credentials
3. Look for floating chat button (bottom-right corner)
4. Click button → chat overlay should appear
5. Type "Add task to test chat" → should see AI response
6. Verify task appears in Phase 2 task list

---

## 6. Key Files Reference

### Backend (Phase 3 additions)

```
backend/src/
├── models/
│   ├── conversation.py         # Conversation SQLModel
│   └── message.py              # Message SQLModel
├── services/
│   └── chat_service.py         # Conversation management
├── api/
│   └── chat.py                 # Chat endpoint handler
├── ai/
│   ├── agent.py                # OpenAI Agent wrapper
│   └── system_prompt.py        # AI system prompt
└── mcp/
    ├── server.py               # MCP server setup
    └── tools/
        ├── add_task.py
        ├── list_tasks.py
        ├── update_task.py
        ├── complete_task.py
        └── delete_task.py
```

### Frontend (Phase 3 additions)

```
frontend/src/
├── components/chat/
│   ├── ChatButton.tsx
│   ├── ChatOverlay.tsx
│   ├── ChatMessages.tsx
│   ├── ChatMessage.tsx
│   ├── ChatInput.tsx
│   └── ChatContext.tsx
├── lib/
│   └── chat-api.ts            # Chat API client
└── hooks/
    └── useChat.ts             # Chat state hook
```

---

## 7. Common Issues & Solutions

### Issue: "OpenAI API key not found"

**Solution**:
```bash
# Verify environment variable is set
echo $OPENAI_API_KEY

# If empty, add to backend/.env
echo "OPENAI_API_KEY=sk-your-key-here" >> backend/.env

# Restart backend server
```

### Issue: "Table 'conversations' does not exist"

**Solution**:
```bash
# Run migrations manually
cd backend
psql $DATABASE_URL -f migrations/001_create_conversations.sql
psql $DATABASE_URL -f migrations/002_create_messages.sql
```

### Issue: "Chat button not appearing"

**Solution**:
1. Check browser console for React errors
2. Verify `<ChatWidget />` is added to dashboard layout
3. Clear browser cache and hard reload (Ctrl+Shift+R)

### Issue: "AI responses are slow (>10 seconds)"

**Solution**:
```bash
# 1. Check OpenAI model in use
echo $OPENAI_MODEL

# 2. Consider using gpt-4-turbo for faster responses
# Update backend/.env:
OPENAI_MODEL=gpt-4-turbo

# 3. Reduce context window
MAX_CONTEXT_MESSAGES=10
```

### Issue: "Tool calls failing"

**Solution**:
```python
# Check MCP tool registration in backend logs
# Should see: "Registered MCP tool: add_task"

# Verify Phase 2 service functions are importable
from services.task_service import create_task, get_tasks
# If ImportError, check PYTHONPATH or module structure
```

---

## 8. Testing Checklist

**Backend**:
- [ ] Chat endpoint returns 200 for valid requests
- [ ] Chat endpoint returns 401 for missing JWT
- [ ] Conversations are created automatically
- [ ] Messages are stored in database
- [ ] MCP tools execute successfully
- [ ] Server restart preserves conversation history

**Frontend**:
- [ ] Chat button visible on dashboard
- [ ] Chat overlay opens/closes smoothly
- [ ] Messages display correctly (user + AI)
- [ ] Typing indicator shows during AI processing
- [ ] Task list updates after chat operations
- [ ] Mobile responsive (chat slides up from bottom)

**Integration**:
- [ ] Add task via chat → appears in Phase 2 list
- [ ] Complete task via chat → status updates
- [ ] Delete task via chat → task removed
- [ ] Phase 2 UI works independently (chat closed)

---

## 9. Demo Script (30 seconds)

**For hackathon judges**:

1. **Show Phase 2** (5s): "This is our existing Phase 2 todo app with authentication and database."

2. **Introduce Phase 3** (5s): "Now watch Phase 3 - AI-powered chatbot." *Click floating button*

3. **Live Demo** (15s):
   - Type: "Add task to prepare demo"
   - *Task appears in background with animation*
   - Type: "Show my tasks"
   - *AI lists tasks*
   - Type: "Mark the first one complete"
   - *Task marked complete in background*

4. **Highlight** (5s): "Natural language, real-time updates, stateless MCP architecture."

---

## 10. Next Steps

**After Quickstart**:
1. Run `/sp.tasks` to generate implementation tasks
2. Follow task list for step-by-step implementation
3. Test each component independently
4. Run integration tests
5. Deploy to staging environment

**Resources**:
- [spec.md](./spec.md) - Full feature specification
- [plan.md](./plan.md) - Implementation plan
- [data-model.md](./data-model.md) - Database schema
- [contracts/](./contracts/) - API contracts
- [Phase 3 Constitution](../.specify/memory/phase-3/constitution.md)

---

**Quickstart Status**: ✅ Complete - Ready for development

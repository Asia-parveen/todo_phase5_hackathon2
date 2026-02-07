# Feature Specification: Phase 3 - AI Todo Chatbot

**Feature Branch**: `003-ai-chatbot`
**Created**: 2026-01-01
**Status**: Draft
**Input**: User description: "Phase 3 Todo AI Chatbot - Extend Phase 2 Todo Web App (Next.js frontend, FastAPI backend, SQLModel + Neon DB, JWT auth) to an AI-powered conversational chatbot. Users can manage their todo list using natural language via a frontend chat UI. The backend is stateless; all state (tasks, conversations, messages) is stored in the database. The AI agent must only interact via MCP tools, never directly accessing the database or business logic."

**Constitution Reference**: `.specify/memory/phase-3/constitution.md` (v3.0.0)

---

## User Scenarios & Testing

### User Story 1 - Natural Language Task Creation (Priority: P1)

As a user, I want to add tasks to my todo list by typing natural language commands in a chat interface, so I can quickly capture tasks without filling out forms.

**Why this priority**: This is the core MVP functionality that demonstrates AI value. Users can immediately see the benefit of conversational interaction over traditional form-based UI.

**Independent Test**: Can be fully tested by opening the chat widget, typing "Add buy groceries", and verifying the task appears in both the chat confirmation and the task list.

**Acceptance Scenarios**:

1. **Given** I am logged in and viewing my todo dashboard, **When** I click the floating chat button and type "Add task to buy milk", **Then** the AI responds with a confirmation message and the task "Buy milk" appears in my task list
2. **Given** I have an empty task list, **When** I type "Remind me to call John tomorrow" in the chat, **Then** the AI creates a task titled "Call John tomorrow" and confirms the action
3. **Given** I am in the chat interface, **When** I type "Add prepare presentation with detailed notes and examples", **Then** the AI creates a task with both title and description extracted from my message
4. **Given** I submit an ambiguous command like "Add something", **When** the AI cannot determine the task title, **Then** the AI asks me "What should I call this task? Give me a title!"

---

### User Story 2 - View and Manage Tasks via Chat (Priority: P1)

As a user, I want to ask the AI to show me my tasks and mark them complete using natural language, so I can manage my todos entirely through conversation.

**Why this priority**: Completes the basic CRUD loop via AI. Users need to see their tasks and mark progress conversationally to experience the full chatbot benefit.

**Independent Test**: Can be tested by creating 2-3 tasks, then typing "Show my tasks" to see the list, and "Mark the first one complete" to update status.

**Acceptance Scenarios**:

1. **Given** I have 3 pending tasks in my list, **When** I type "Show my tasks" in the chat, **Then** the AI lists all 3 tasks with their titles and status
2. **Given** I have tasks with mixed status (some pending, some complete), **When** I type "Show my pending tasks", **Then** the AI lists only the incomplete tasks
3. **Given** I have a task "Buy groceries" in my list, **When** I type "Mark 'Buy groceries' as complete", **Then** the AI marks it complete and the task list updates to show completed status
4. **Given** I just added a task via chat, **When** I say "Mark it complete", **Then** the AI understands "it" refers to the last task and completes it
5. **Given** I type "Complete task #5" but task #5 doesn't exist, **When** the AI checks my tasks, **Then** the AI responds "I couldn't find task #5. Want to see your current list?"

---

### User Story 3 - Update and Delete Tasks Conversationally (Priority: P2)

As a user, I want to modify or remove tasks by chatting with the AI, so I can keep my task list accurate without navigating through traditional UI forms.

**Why this priority**: Extends the conversational experience to cover all CRUD operations. Less critical than create/read/complete since these are less frequent actions.

**Independent Test**: Can be tested by creating a task, then typing "Change task 2 title to 'Buy organic groceries'", and "Delete the grocery task" to verify updates and deletions work.

**Acceptance Scenarios**:

1. **Given** I have a task titled "Call dentist", **When** I type "Change the title of that task to 'Call dentist at 2pm'", **Then** the AI updates the task title and confirms the change
2. **Given** I have a task with ID 3, **When** I type "Update task 3 description to include meeting agenda items", **Then** the AI updates the description and shows the updated task
3. **Given** I have a task titled "Buy milk", **When** I type "Delete the milk task", **Then** the AI removes the task from my list and it disappears from the UI
4. **Given** I type "Remove task 10" but no such task exists, **When** the AI checks, **Then** the AI responds "I couldn't find task #10. Could you check the number?"

---

### User Story 4 - Persistent Conversation History (Priority: P2)

As a user, I want my chat conversations with the AI to be saved, so I can review previous interactions and continue conversations across sessions.

**Why this priority**: Enables stateful user experience across sessions. Important for usability but not blocking for basic functionality.

**Independent Test**: Can be tested by chatting with the AI, closing the browser, reopening, and verifying the previous messages are still visible.

**Acceptance Scenarios**:

1. **Given** I had a conversation with the AI yesterday, **When** I open the chat widget today, **Then** I see all previous messages from yesterday's conversation
2. **Given** I ask the AI "What tasks did I add today?", **When** the AI checks conversation history, **Then** it can reference tasks I created earlier in the session
3. **Given** I refresh the page mid-conversation, **When** I reopen the chat, **Then** my conversation continues exactly where I left off
4. **Given** the server restarts while I'm away, **When** I return and send a message, **Then** my conversation history is intact and the AI can continue contextually

---

### User Story 5 - Responsive Chat UI (Priority: P3)

As a mobile user, I want the chat interface to work smoothly on my phone, so I can manage tasks on the go using natural language.

**Why this priority**: Important for accessibility but can be delivered after core desktop experience works. Progressive enhancement approach.

**Independent Test**: Can be tested by opening the app on a mobile browser and verifying the chat button, overlay, and message input work correctly on small screens.

**Acceptance Scenarios**:

1. **Given** I am on a mobile device, **When** I tap the floating chat button, **Then** the chat overlay slides up from the bottom and covers most of the screen
2. **Given** the chat is open on mobile, **When** I type a message, **Then** the keyboard doesn't obscure the input field and I can see the AI's responses
3. **Given** I want to close the chat on mobile, **When** I swipe down on the overlay, **Then** the chat minimizes and I return to the task list view
4. **Given** I am switching between portrait and landscape on mobile, **When** the orientation changes, **Then** the chat UI adapts smoothly without losing my message or context

---

### Edge Cases

- **What happens when the AI cannot understand the user's intent?**
  - AI responds: "I'm not sure what you mean. Could you rephrase that?" and suggests example commands

- **What happens when the user sends an empty message?**
  - Chat input validation prevents sending empty messages; send button is disabled until text is entered

- **What happens when the OpenAI API call fails or times out?**
  - AI responds: "Oops! Something went wrong on my end. Mind trying again?" and logs the error for debugging

- **What happens when the user rapidly sends multiple messages?**
  - Messages are queued and processed sequentially; AI shows typing indicator while processing

- **What happens when conversation history exceeds token limits?**
  - System fetches only the last 20 messages to build context; older messages remain in database but aren't sent to AI

- **What happens when two users try to use the same conversation_id?**
  - Cannot happen; conversation_id is tied to user_id via foreign key constraint

- **What happens when the user references "the task" but there are multiple tasks?**
  - AI asks for clarification: "Which task did you mean? Could you specify the task number or title?"

- **What happens when Phase 2 task API returns an error?**
  - MCP tool returns structured error response; AI translates it to user-friendly message like "I couldn't add that task. Please try again."

---

## Requirements

### Functional Requirements

**Chat Interface (Frontend)**

- **FR-001**: System MUST display a floating chat button in the bottom-right corner (desktop) or bottom-center (mobile) that is always visible when user is logged in
- **FR-002**: System MUST open a chat overlay when the button is clicked, sliding in smoothly with animation
- **FR-003**: Chat overlay MUST display conversation history with user and AI messages clearly differentiated by alignment and styling
- **FR-004**: System MUST provide a text input field and send button for users to submit messages
- **FR-005**: System MUST show a typing indicator when AI is processing a message
- **FR-006**: System MUST allow users to close or minimize the chat overlay without losing conversation state
- **FR-007**: Chat UI MUST be responsive and work on mobile devices (viewports < 768px)
- **FR-008**: System MUST reuse Phase 2 styling (Tailwind CSS classes, colors, fonts) for consistency

**Natural Language Processing (Backend AI)**

- **FR-009**: AI agent MUST detect user intent from natural language input without requiring strict command syntax
- **FR-010**: AI agent MUST map detected intent to appropriate MCP tool (add_task, list_tasks, update_task, complete_task, delete_task)
- **FR-011**: AI agent MUST provide friendly, conversational confirmation messages after each successful action
- **FR-012**: AI agent MUST handle errors gracefully and provide user-friendly error messages
- **FR-013**: AI agent MUST understand context from previous messages (e.g., "Mark it complete" after "Add buy milk")
- **FR-014**: AI agent MUST never hallucinate or invent task data; all responses must be based on actual database state

**MCP Tool Layer (Backend)**

- **FR-015**: System MUST provide exactly 5 MCP tools: add_task, list_tasks, update_task, complete_task, delete_task
- **FR-016**: Each MCP tool MUST enforce user_id isolation and never return data from other users
- **FR-017**: Each MCP tool MUST reuse existing Phase 2 task CRUD logic (no duplicate implementations)
- **FR-018**: Each MCP tool MUST return structured JSON responses with success status and error codes
- **FR-019**: MCP tools MUST be stateless and not hold any in-memory conversation or task data

**Chat API Endpoint (Backend)**

- **FR-020**: System MUST provide a single endpoint `POST /api/{user_id}/chat` for all chat interactions
- **FR-021**: Endpoint MUST validate JWT token and extract user_id from the token
- **FR-022**: Endpoint MUST fetch conversation history from database (not from memory)
- **FR-023**: Endpoint MUST store user message in database immediately upon receipt
- **FR-024**: Endpoint MUST invoke OpenAI Agent with conversation context and available MCP tools
- **FR-025**: Endpoint MUST store AI response and tool call results in database before returning to frontend
- **FR-026**: Endpoint MUST return AI response to frontend within 5 seconds (95th percentile target)
- **FR-027**: Endpoint MUST handle errors from OpenAI API and return appropriate error responses

**Stateless Architecture (Backend)**

- **FR-028**: Backend MUST NOT store any conversation state in memory (RAM)
- **FR-029**: Backend MUST fetch all conversation data from database on every request
- **FR-030**: Backend MUST be able to restart without losing any conversation or message data
- **FR-031**: Multiple backend server instances MUST be able to handle requests for the same user without conflicts

**Database Persistence**

- **FR-032**: System MUST persist all conversations in a `conversations` table with fields: id, user_id, created_at, last_message_at
- **FR-033**: System MUST persist all messages in a `messages` table with fields: id, conversation_id, role (user/assistant/tool), content, tool_calls (JSON), timestamp
- **FR-034**: System MUST create or reuse existing conversation for each user
- **FR-035**: System MUST maintain foreign key relationships (conversations.user_id → users.id, messages.conversation_id → conversations.id)
- **FR-036**: System MUST delete all messages when a conversation is deleted (CASCADE)

**Real-Time UI Synchronization (Frontend)**

- **FR-037**: When AI successfully adds a task via chat, the task MUST appear in Phase 2 task list immediately without manual refresh
- **FR-038**: When AI marks a task complete via chat, the task status MUST update in Phase 2 task list immediately
- **FR-039**: When AI deletes a task via chat, the task MUST disappear from Phase 2 task list immediately
- **FR-040**: Task list updates MUST use optimistic UI updates for instant feedback

**Phase 2 Preservation**

- **FR-041**: All Phase 2 functionality MUST remain fully operational (add task form, task list, filters, etc.)
- **FR-042**: Phase 2 task CRUD endpoints MUST NOT be modified or replaced
- **FR-043**: Phase 2 database schema (users, tasks tables) MUST remain unchanged
- **FR-044**: Phase 2 authentication flow MUST remain unchanged
- **FR-045**: Users MUST be able to use Phase 2 UI without ever opening the chat widget

**Security & User Isolation**

- **FR-046**: Every MCP tool call MUST include user_id parameter extracted from validated JWT
- **FR-047**: System MUST prevent users from accessing conversations or messages belonging to other users
- **FR-048**: OpenAI API key MUST be stored in environment variables, never in source code
- **FR-049**: Chat endpoint MUST return 401 Unauthorized if JWT is invalid or expired

### Key Entities

- **Conversation**: Represents a chat conversation between a user and the AI agent. Contains: conversation_id (UUID), user_id (foreign key to Phase 2 users table), created_at (timestamp), last_message_at (timestamp). Relationships: One conversation belongs to one user; one conversation has many messages.

- **Message**: Represents a single message in a conversation (from user, AI assistant, or tool call). Contains: message_id (UUID), conversation_id (foreign key), role (enum: 'user', 'assistant', 'tool'), content (text), tool_calls (JSONB for storing tool invocation details), timestamp. Relationships: Each message belongs to one conversation.

- **MCP Tool**: Logical entity representing a callable function exposed to the AI agent. Each tool has: name (add_task, list_tasks, etc.), parameters (user_id, title, description, task_id, status), response schema (structured JSON with success/error). Tools delegate to Phase 2 task CRUD logic.

---

## Success Criteria

### Measurable Outcomes

- **SC-001**: Users can add a task using natural language chat and see it appear in their task list within 3 seconds
- **SC-002**: Users can list all their tasks via chat command and receive a formatted response within 2 seconds
- **SC-003**: Users can mark tasks complete via chat and see status update in task list within 2 seconds
- **SC-004**: 90% of natural language commands are correctly interpreted and mapped to the appropriate action on first attempt
- **SC-005**: Conversation history persists across browser sessions and server restarts with 100% accuracy
- **SC-006**: Chat interface is fully functional on mobile devices (tested on viewports from 320px to 768px width)
- **SC-007**: Backend can handle 50 concurrent chat requests without performance degradation
- **SC-008**: Phase 2 functionality remains 100% operational with zero breaking changes
- **SC-009**: AI response time is under 5 seconds for 95% of requests
- **SC-010**: Users successfully complete their first chat-based task creation within 30 seconds of opening chat (no tutorial needed)
- **SC-011**: Error messages from AI are clear and actionable for 100% of error scenarios
- **SC-012**: System maintains strict user isolation with zero instances of cross-user data leakage

---

## Assumptions

1. **OpenAI API Availability**: Assumes OpenAI API is accessible and API key is provided via environment variables
2. **Token Limits**: Assumes conversation context can be managed by fetching last 20 messages without loss of conversational quality
3. **Phase 2 Completion**: Assumes Phase 2 is fully functional with working JWT authentication, task CRUD APIs, and database schema
4. **MCP SDK Compatibility**: Assumes Official MCP SDK is compatible with FastAPI backend architecture
5. **Network Latency**: Assumes network latency between backend and OpenAI API is reasonable (<2 seconds) for production deployment
6. **User Intent**: Assumes natural language commands will follow common patterns (imperative statements like "Add task", "Show tasks") without excessive ambiguity
7. **Browser Support**: Assumes users are on modern browsers with JavaScript enabled (Chrome, Firefox, Safari, Edge - last 2 versions)
8. **Database Schema Extensions**: Assumes Neon PostgreSQL supports UUID primary keys and JSONB data type for tool_calls storage
9. **Concurrent Users**: Assumes typical todo app usage patterns (low write frequency per user, mostly sequential chat interactions)
10. **Error Recovery**: Assumes transient failures (API timeouts, network errors) are acceptable with user retry; no automatic retry logic required for MVP

---

## Out of Scope

The following are explicitly **NOT** included in Phase 3:

- Voice input/output for chat interface
- Multi-language support for AI conversations
- Task sharing or collaboration features via chat
- Advanced NLP features like sentiment analysis or task priority suggestions
- Integration with external services (Google Calendar, Slack, etc.)
- Chat history export or search functionality
- Multiple conversation threads per user
- AI personalization or learning user preferences
- Real-time WebSocket connections (using HTTP polling for MVP)
- Push notifications for AI responses
- Conversation analytics or reporting
- Admin features for monitoring AI interactions
- Fine-tuning custom AI models
- Modifying Phase 2 code, database schema, or API endpoints

---

## Dependencies

- **Phase 2 Must Be Complete**: All Phase 2 functionality (Next.js frontend, FastAPI backend, SQLModel, Neon DB, Better Auth with JWT) must be fully operational
- **OpenAI API Access**: Requires valid OpenAI API key with access to GPT-4 or GPT-4 Turbo models
- **MCP SDK**: Requires Official MCP SDK installation and configuration
- **Database Migrations**: Requires ability to add new tables (conversations, messages) to existing Neon PostgreSQL database
- **Environment Variables**: Requires configuration system for OPENAI_API_KEY, MAX_CONTEXT_MESSAGES, and other settings

---

## Technical Constraints (from Constitution)

These constraints from Phase 3 Constitution v3.0.0 MUST be followed:

1. **Stateless Backend**: Zero in-memory state; all data in database
2. **MCP-Only AI Interface**: AI agent interacts ONLY through MCP tools, never direct database access
3. **Phase 2 Reuse**: MCP tools MUST delegate to existing Phase 2 CRUD logic
4. **User Isolation**: All MCP tools MUST enforce user_id filtering
5. **Floating Widget UI**: Non-intrusive chat interface (bottom-right button → overlay)
6. **Real-Time Sync**: Chat actions MUST reflect immediately in Phase 2 UI
7. **Natural Language**: AI MUST handle casual, flexible commands without strict syntax
8. **Friendly Responses**: AI MUST use conversational, human-friendly tone
9. **Database Persistence**: Conversations and messages MUST persist in database
10. **Phase 2 Preservation**: Phase 2 MUST work identically with or without chat feature

---

**Specification Status**: Ready for Validation

**Next Step**: Validate specification quality before proceeding to planning phase

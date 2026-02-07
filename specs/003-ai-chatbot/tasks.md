# Tasks: Phase 3 - AI Todo Chatbot

**Input**: Design documents from `/specs/003-ai-chatbot/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/
**Constitution**: `.specify/memory/phase-3/constitution.md` (v3.0.0)

---

## Format: `- [ ] [ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Install OpenAI Python SDK (>=1.0.0) in backend/requirements.txt
- [x] T002 Install MCP SDK in backend/requirements.txt
- [x] T003 [P] Add OPENAI_API_KEY to backend/.env.example
- [x] T004 [P] Add MAX_CONTEXT_MESSAGES=20 to backend/.env.example
- [x] T005 [P] Add OPENAI_MODEL=gpt-4 to backend/.env.example
- [x] T006 [P] Create backend/migrations/001_create_conversations.sql with conversation table schema
- [x] T007 [P] Create backend/migrations/002_create_messages.sql with message table schema
- [x] T008 Run database migrations to create conversation and message tables

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T009 Create backend/src/models/conversation.py with Conversation SQLModel
- [ ] T010 [P] Create backend/src/models/message.py with Message SQLModel
- [ ] T011 Create backend/src/services/chat_service.py with get_or_create_conversation() function
- [ ] T012 [P] Implement store_message() in backend/src/services/chat_service.py
- [ ] T013 [P] Implement get_recent_messages(limit=20) in backend/src/services/chat_service.py
- [ ] T014 Create backend/src/ai/system_prompt.py with conversational AI system prompt
- [ ] T015 Create backend/src/ai/agent.py with OpenAI client initialization
- [ ] T016 Implement openai_chat_completion() with function calling in backend/src/ai/agent.py
- [ ] T017 Create backend/src/mcp/server.py with MCP server setup
- [ ] T018 Register 5 MCP tools in backend/src/mcp/server.py (empty stubs)
- [ ] T019 Create frontend/src/components/chat/ directory structure
- [ ] T020 [P] Create frontend/src/lib/chat-api.ts with sendChatMessage() function
- [ ] T021 [P] Create frontend/src/hooks/useChat.ts with chat state management hook

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Natural Language Task Creation (Priority: P1) 🎯 MVP

**Goal**: Users can add tasks via natural language chat and see them appear in the task list

**Independent Test**: Open chat, type "Add buy groceries", verify task appears in both chat confirmation and Phase 2 task list

### Implementation for User Story 1

- [ ] T022 [P] [US1] Implement add_task MCP tool in backend/src/mcp/tools/add_task.py that delegates to Phase 2 create_task()
- [ ] T023 [P] [US1] Create ChatButton.tsx component in frontend/src/components/chat/ with floating button UI
- [ ] T024 [P] [US1] Create ChatOverlay.tsx component in frontend/src/components/chat/ with modal/overlay container
- [ ] T025 [P] [US1] Create ChatInput.tsx component in frontend/src/components/chat/ with input field and send button
- [ ] T026 [P] [US1] Create ChatMessages.tsx component in frontend/src/components/chat/ for message list display
- [ ] T027 [P] [US1] Create ChatMessage.tsx component in frontend/src/components/chat/ for single message bubble
- [ ] T028 [P] [US1] Create ChatContext.tsx in frontend/src/components/chat/ with React Context for chat state
- [ ] T029 [US1] Create POST /api/{user_id}/chat endpoint in backend/src/api/chat.py
- [ ] T030 [US1] Implement chat endpoint handler that fetches conversation, stores user message, calls OpenAI, stores response
- [ ] T031 [US1] Integrate ChatButton into frontend/src/pages/dashboard/page.tsx (Phase 2 dashboard)
- [ ] T032 [US1] Add optimistic UI update in useChat hook to update Phase 2 task list when AI adds task
- [ ] T033 [US1] Test end-to-end: "Add buy milk" → task appears in chat response and Phase 2 list

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - View and Manage Tasks via Chat (Priority: P1)

**Goal**: Users can list tasks and mark them complete conversationally

**Independent Test**: Create 2-3 tasks, type "Show my tasks", see list, then "Mark the first one complete" updates status

### Implementation for User Story 2

- [ ] T034 [P] [US2] Implement list_tasks MCP tool in backend/src/mcp/tools/list_tasks.py that delegates to Phase 2 get_tasks()
- [ ] T035 [P] [US2] Implement complete_task MCP tool in backend/src/mcp/tools/complete_task.py that delegates to Phase 2 complete_task()
- [ ] T036 [US2] Update AI system prompt in backend/src/ai/system_prompt.py to handle list and complete intents
- [ ] T037 [US2] Add context awareness to AI agent to resolve "it" and "the first one" references
- [ ] T038 [US2] Format list_tasks response in AI agent to display task titles, statuses, and numbers
- [ ] T039 [US2] Add optimistic UI update for complete_task in frontend useChat hook
- [ ] T040 [US2] Test end-to-end: "Show my tasks" → AI lists tasks, "Mark first one complete" → status updates

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Update and Delete Tasks Conversationally (Priority: P2)

**Goal**: Users can modify task titles/descriptions and delete tasks via chat

**Independent Test**: Create task, type "Change task 2 title to 'Buy organic groceries'", verify update, then "Delete the grocery task" removes it

### Implementation for User Story 3

- [ ] T041 [P] [US3] Implement update_task MCP tool in backend/src/mcp/tools/update_task.py that delegates to Phase 2 update_task()
- [ ] T042 [P] [US3] Implement delete_task MCP tool in backend/src/mcp/tools/delete_task.py that delegates to Phase 2 delete_task()
- [ ] T043 [US3] Update AI system prompt to handle update and delete intents
- [ ] T044 [US3] Add parameter extraction logic in AI agent for title/description updates
- [ ] T045 [US3] Add optimistic UI update for update_task in frontend useChat hook
- [ ] T046 [US3] Add optimistic UI update for delete_task in frontend useChat hook
- [ ] T047 [US3] Test end-to-end: "Change title of task 2" → title updates, "Delete task 3" → task removed

**Checkpoint**: All user stories should now be independently functional

---

## Phase 6: User Story 4 - Persistent Conversation History (Priority: P2)

**Goal**: Conversation history persists across sessions and server restarts

**Independent Test**: Chat with AI, close browser, reopen, verify previous messages visible

### Implementation for User Story 4

- [ ] T048 [US4] Implement fetch conversation history on chat open in frontend useChat hook
- [ ] T049 [US4] Display historical messages in ChatMessages component with scroll to bottom
- [ ] T050 [US4] Add message timestamps to Message model and display in ChatMessage component
- [ ] T051 [US4] Implement conversation context loading (last 20 messages) in chat endpoint
- [ ] T052 [US4] Test stateless backend: restart server mid-conversation, verify history persists
- [ ] T053 [US4] Test cross-session: close browser, reopen, verify messages still visible

**Checkpoint**: Conversation persistence verified across sessions and restarts

---

## Phase 7: User Story 5 - Responsive Chat UI (Priority: P3)

**Goal**: Chat interface works smoothly on mobile devices

**Independent Test**: Open app on mobile browser, verify chat button, overlay, and input work on small screens

### Implementation for User Story 5

- [ ] T054 [P] [US5] Add mobile-specific styles to ChatButton (bottom-center on mobile)
- [ ] T055 [P] [US5] Add mobile-specific styles to ChatOverlay (full-screen slide-up on mobile)
- [ ] T056 [P] [US5] Add swipe-down gesture handler to close chat on mobile in ChatOverlay component
- [ ] T057 [P] [US5] Add viewport detection hook (useMediaQuery) in frontend/src/hooks/
- [ ] T058 [US5] Test chat on mobile viewport (<768px): button position, overlay behavior
- [ ] T059 [US5] Test keyboard doesn't obscure input on mobile
- [ ] T060 [US5] Test orientation changes (portrait ↔ landscape) maintain chat state

**Checkpoint**: All user stories complete, mobile responsive

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T061 [P] Add ChatTypingIndicator component in frontend/src/components/chat/ for "AI is typing..." animation
- [ ] T062 [P] Add error handling in chat endpoint for OpenAI API failures (500 → friendly message)
- [ ] T063 [P] Add rate limiting middleware for chat endpoint (30 requests/minute per user)
- [ ] T064 [P] Add input validation: prevent empty messages, max 2000 characters
- [ ] T065 Add loading states to ChatInput (disable send button while AI processing)
- [ ] T066 Add animation transitions for chat overlay open/close (slide-in/slide-out)
- [ ] T067 Add fade-in animation when new tasks appear in Phase 2 list via chat
- [ ] T068 Update README.md with Phase 3 setup instructions (OpenAI API key, migrations)
- [ ] T069 Verify Phase 2 functionality still works without opening chat (preservation test)
- [ ] T070 Run quickstart.md validation checklist

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-7)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P1 → P2 → P2 → P3)
- **Polish (Phase 8)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - No dependencies on US1 (independent)
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) - No dependencies on US1/US2 (independent)
- **User Story 4 (P2)**: Can start after Foundational (Phase 2) - No dependencies on US1/US2/US3 (independent)
- **User Story 5 (P3)**: Can start after Foundational (Phase 2) - Enhances all stories but independent

### Within Each User Story

- Models before services (already in Foundational phase)
- MCP tools before AI agent updates
- Backend implementation before frontend components
- Frontend components can be built in parallel (marked [P])
- Integration/testing after all components ready

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- Within each user story, tasks marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch all frontend components for User Story 1 together:
Task T023: "Create ChatButton.tsx"
Task T024: "Create ChatOverlay.tsx"
Task T025: "Create ChatInput.tsx"
Task T026: "Create ChatMessages.tsx"
Task T027: "Create ChatMessage.tsx"
Task T028: "Create ChatContext.tsx"

# Can all be implemented in parallel by different developers
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T008)
2. Complete Phase 2: Foundational (T009-T021) - CRITICAL BLOCKING PHASE
3. Complete Phase 3: User Story 1 (T022-T033)
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready (minimum viable chatbot)

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Add User Story 4 → Test independently → Deploy/Demo
6. Add User Story 5 → Test independently → Deploy/Demo
7. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (T022-T033)
   - Developer B: User Story 2 (T034-T040)
   - Developer C: User Story 3 (T041-T047)
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- **Phase 2 Preservation**: Never modify existing Phase 2 files (users.py, tasks.py, task_service.py, etc.)
- **Stateless Requirement**: All conversation state must be fetched from database on every request

---

## Task Summary

**Total Tasks**: 70
**Breakdown by Phase**:
- Phase 1 (Setup): 8 tasks
- Phase 2 (Foundational): 13 tasks (BLOCKING)
- Phase 3 (US1 - P1): 12 tasks (MVP)
- Phase 4 (US2 - P1): 7 tasks
- Phase 5 (US3 - P2): 7 tasks
- Phase 6 (US4 - P2): 6 tasks
- Phase 7 (US5 - P3): 7 tasks
- Phase 8 (Polish): 10 tasks

**Parallel Opportunities**: 31 tasks marked [P] can run in parallel within their phases

**MVP Scope**: Phases 1-3 (T001-T033) = 33 tasks for minimum viable AI chatbot

**Suggested First Sprint**: Complete through User Story 1 (T001-T033) for demo-ready MVP

---

**Tasks Status**: ✅ Ready for Implementation - All tasks follow checklist format with IDs, file paths, and story labels

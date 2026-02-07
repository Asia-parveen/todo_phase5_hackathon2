---
id: 0001
title: Phase 3 Constitution Creation
stage: constitution
date: 2026-01-01
surface: agent
model: claude-sonnet-4-5
feature: phase-3-ai-chatbot
branch: 002-fullstack-todo-web
user: system
command: /sp.constitution
labels: ["phase-3", "constitution", "ai-chatbot", "mcp", "openai"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
 - .specify/memory/phase-3/constitution.md
tests:
 - None (constitutional document)
---

## Prompt

You are Claude Code acting as a strict Spec-Driven Architect.

Context: Phase 1 (In-Memory Todo CLI App) is completed. Phase 2 (Full-Stack Todo Web App using Next.js, FastAPI, SQLModel, Neon DB, Better Auth with JWT) is completed and working. We are now implementing Phase 3: Todo AI Chatbot.

Important Rules: Phase 3 MUST EXTEND Phase 2, not replace or rewrite it. Existing task CRUD, auth, and database logic from Phase 2 must be reused. No manual coding is allowed; everything must be spec-driven. Follow Spec-Kit Plus workflow strictly. Backend and MCP tools must be completely STATELESS. All state (tasks, conversations, messages) must be stored in the database.

Phase 3 Objective: Build an AI-powered conversational chatbot that allows users to manage their todo list using natural language and provides a frontend chat UI where users can type messages, view conversation history, see real-time updates for task operations (Add, Show/List, Update, Complete, Delete), and receive friendly AI confirmation messages. The frontend must be responsive, mobile-friendly, and reuse Phase 2 styling/components where possible.

Mandatory Technical Requirements: Use OpenAI Agents SDK for AI reasoning. Use Official MCP SDK to build an MCP server. MCP server must expose todo operations as TOOLS. AI agent must NEVER directly access database or business logic. AI agent must interact ONLY via MCP tools. Provide a single chat endpoint: POST /api/{user_id}/chat.

Conversation Architecture: 1. Receive user message. 2. Fetch conversation history from database. 3. Build agent context (history + new message). 4. Store user message in database. 5. Run OpenAI Agent. 6. Agent calls MCP tools. 7. Store assistant response and tool calls in database. 8. Return response to frontend chat UI. 9. Server holds NO in-memory state.

Required MCP Tools: add_task(user_id, title, description?), list_tasks(user_id, status?), update_task(user_id, task_id, title?, description?), complete_task(user_id, task_id), delete_task(user_id, task_id).

MCP Tool Rules: Tools must be stateless. Tools must enforce user_id isolation. Tools must reuse Phase 2 task CRUD logic. Tools must return structured responses.

AI Agent Behavior Rules: Detect intent from natural language. Map intent to correct MCP tool. Confirm actions with friendly responses. Handle errors gracefully (task not found, invalid input). Never hallucinate task data.

Requirements: Create Phase 3 constitution (including frontend chat UI). Feature specs for chatbot. API specs for chat endpoint. MCP tool specifications. Database schema specs for conversations and messages.

Proceed carefully, ensure nothing from Phase 2 is broken, and ensure full alignment with Phase 3 requirements.

## Response snapshot

Created comprehensive Phase 3 constitution at `.specify/memory/phase-3/constitution.md` with version 3.0.0.

The constitution includes:

**10 Core Principles:**
0. Phase 2 Preservation (Supreme Rule)
1. Stateless Backend Architecture
2. MCP-Only Agent Interface
3. Phase 2 Logic Reuse
4. Strict User Isolation
5. Natural Language Flexibility
6. Friendly Conversational Responses
7. Database-Only State Persistence
8. Non-Intrusive UI Pattern (Floating Chat Widget)
9. Real-Time UI Synchronization
10. OpenAI & MCP SDK Requirements

**Complete Specifications:**
- 5 MCP Tools (add_task, list_tasks, update_task, complete_task, delete_task) with full signatures, parameters, returns, and error handling
- Database schema extensions (conversations and messages tables)
- Single chat API endpoint: POST /api/{user_id}/chat
- Frontend architecture (floating chat widget pattern)
- Conversation flow architecture (21-step end-to-end flow)
- Error handling standards with user-friendly message mappings
- Forbidden actions list
- Success criteria (47 completion checkboxes)
- Governance and version policy

**Key Architectural Decisions:**
- Extends Phase 2 without modifying it
- Stateless backend (database-only persistence)
- MCP tools as abstraction layer between AI and Phase 2 logic
- Floating chat widget UI pattern (non-disruptive)
- Real-time UI synchronization via optimistic updates

## Outcome

- ✅ Impact: Created foundational constitution for Phase 3 (AI Chatbot layer) that extends Phase 2 while preserving all existing functionality
- 🧪 Tests: None required (constitutional document)
- 📁 Files: Created `.specify/memory/phase-3/constitution.md` (920 lines)
- 🔁 Next prompts: Create Phase 3 feature specifications (/sp.specify), Database schema extension spec, MCP tool implementation specs, Chat UI component specs
- 🧠 Reflection: Constitution successfully establishes clear boundaries between phases, enforces stateless architecture, and defines comprehensive MCP tool contracts. Ready for specification phase.

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): N/A (constitutional document, no automated grading)
- Prompt variant (if applicable): Standard constitution creation workflow
- Next experiment (smallest change to try): Proceed to /sp.specify for Phase 3 chatbot feature specification

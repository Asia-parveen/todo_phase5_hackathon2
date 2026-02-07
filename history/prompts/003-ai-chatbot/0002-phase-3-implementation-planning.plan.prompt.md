---
id: 0002
title: Phase 3 Implementation Planning
stage: plan
date: 2026-01-01
surface: agent
model: claude-sonnet-4-5
feature: 003-ai-chatbot
branch: 003-ai-chatbot
user: system
command: /sp.plan
labels: ["phase-3", "planning", "architecture", "mcp", "openai", "database-schema"]
links:
  spec: specs/003-ai-chatbot/spec.md
  ticket: null
  adr: null
  pr: null
files:
 - specs/003-ai-chatbot/plan.md
 - specs/003-ai-chatbot/research.md
 - specs/003-ai-chatbot/data-model.md
 - specs/003-ai-chatbot/quickstart.md
 - specs/003-ai-chatbot/contracts/chat-endpoint.md
 - specs/003-ai-chatbot/contracts/mcp-tools.md
tests:
 - Constitution Check: All 10 principles validated (PASS)
---

## Prompt

/sp.plan

Execute implementation planning workflow for Phase 3 AI Todo Chatbot based on specification in specs/003-ai-chatbot/spec.md and Phase 3 Constitution v3.0.0.

**Context**: Phase 1 and Phase 2 complete. Implementing AI chatbot layer that extends Phase 2 without modification.

**Requirements**:
- Fill Technical Context with concrete technology choices
- Run Constitution Check gates against 10 Phase 3 principles
- Generate Phase 0 research (OpenAI SDK, MCP SDK, stateless patterns)
- Generate Phase 1 design (database schema, API contracts, quickstart)
- Ensure Phase 2 preservation and stateless architecture

## Response snapshot

Created comprehensive implementation plan with Phase 0 research and Phase 1 design artifacts:

**Constitution Check**: ✅ ALL 10 GATES PASSED
- Principle 0: Phase 2 Preservation (SUPREME) - PASS
- Principle I: Stateless Backend - PASS
- Principle II: MCP-Only AI Interface - PASS
- Principle III: Phase 2 Logic Reuse - PASS
- Principle IV: User Isolation - PASS
- Principle V: Natural Language Flexibility - PASS
- Principle VI: Friendly Responses - PASS
- Principle VII: Database Persistence - PASS
- Principle VIII: Non-Intrusive UI - PASS
- Principle IX: Real-Time Sync - PASS
- Principle X: OpenAI & MCP SDK - PASS

**Technical Context Defined**:
- Backend: Python 3.11+, FastAPI, SQLModel, OpenAI SDK, MCP SDK
- Frontend: TypeScript 5.x, Next.js 14, React 18, Tailwind CSS, SWR
- Database: Neon PostgreSQL (extended with 2 new tables)
- Performance: <5s AI response (p95), 50 concurrent requests

**Phase 0: Research (research.md)**:
- OpenAI function calling integration patterns
- MCP SDK server setup and tool registration
- Stateless conversation management (database-only)
- PostgreSQL JSONB for tool_calls metadata
- Next.js optimistic UI update patterns with SWR

**Phase 1: Design Artifacts**:

1. **data-model.md**: Database schema for conversations and messages tables
   - `conversations`: id, user_id, created_at, last_message_at
   - `messages`: id, conversation_id, role, content, tool_calls (JSONB), timestamp
   - SQL migrations provided
   - SQLModel entity definitions

2. **contracts/chat-endpoint.md**: POST /api/{user_id}/chat API specification
   - Request/response schemas
   - Error handling (400, 401, 403, 429, 500)
   - Example conversation flows

3. **contracts/mcp-tools.md**: 5 MCP tool function signatures
   - add_task, list_tasks, update_task, complete_task, delete_task
   - Parameter schemas, return types, error codes
   - OpenAI function calling schema definitions

4. **quickstart.md**: Developer setup guide
   - Environment variables
   - Dependency installation
   - Database migrations
   - Testing checklist
   - 30-second demo script

**Project Structure Documented**:
- Backend: New directories for `ai/`, `mcp/tools/`, plus models and services
- Frontend: New `components/chat/` directory with 7 chat components
- All Phase 2 files marked as UNCHANGED

## Outcome

- ✅ Impact: Created production-ready implementation plan with complete technical architecture, database schema, API contracts, and developer quickstart for Phase 3
- 🧪 Tests: Constitution Check validated all 10 principles (PASS), no violations detected
- 📁 Files: plan.md (in progress), research.md, data-model.md, quickstart.md, 2 contract files (chat-endpoint.md, mcp-tools.md)
- 🔁 Next prompts: /sp.tasks (generate implementation tasks based on plan and spec)
- 🧠 Reflection: Planning phase successfully decomposed Phase 3 into concrete technical decisions. Research resolved all technology choices (OpenAI SDK, MCP SDK, SWR). Database schema extends Phase 2 without modification. API contracts provide clear implementation targets. Ready for task generation.

## Evaluation notes (flywheel)

- Failure modes observed: None - all planning artifacts generated successfully
- Graders run and results (PASS/FAIL): Constitution Check - PASS (10/10 principles)
- Prompt variant (if applicable): Standard /sp.plan workflow with Phase 3 Constitution constraints
- Next experiment (smallest change to try): Proceed to /sp.tasks to generate implementation tasks prioritized by user story dependencies

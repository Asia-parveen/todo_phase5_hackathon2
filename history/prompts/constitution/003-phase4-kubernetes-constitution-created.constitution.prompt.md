---
id: 003
title: Phase 4 Kubernetes Constitution Created
stage: constitution
date: 2026-01-08
surface: agent
model: claude-sonnet-4-5-20250929
feature: phase-4-kubernetes
branch: main
user: unknown
command: /sp.constitution
labels: ["phase-4", "kubernetes", "minikube", "helm", "infrastructure"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - .specify/memory/phase-4/constitution.md
tests:
  - null
---

## Prompt

# Constitution – Phase IV
## Local Kubernetes Deployment using Minikube & Helm

---

## 1. Purpose (Scope Lock)

Phase IV exists **only** to deploy the already completed and verified
Phase III AI Todo Chatbot onto a **local Kubernetes cluster (Minikube)**.

This phase is strictly about **infrastructure, containerization,
and orchestration**.

No product evolution, feature changes, or logic improvements
are allowed in this phase.

---

## 2. Absolute Non-Negotiables

1. **NO CLOUD DEPLOYMENT**
   - Frontend MUST NOT be deployed to Vercel.
   - Backend MUST NOT be deployed to HuggingFace.
   - No AWS, GCP, Azure, or any public cloud usage is permitted.
   - Deployment target is **ONLY Minikube (local machine)**.

2. **NO APPLICATION CODE CHANGES**
   - Frontend logic must remain exactly as Phase III.
   - Backend APIs, routes, MCP tools, AI logic, and database models
     must remain unchanged.
   - Any modification to application behavior is forbidden.

3. **DEPLOYMENT ≠ DEVELOPMENT**
   - Phase IV introduces infrastructure artifacts only:
     - Dockerfiles
     - Helm charts
     - Kubernetes configuration
   - No secrets, URLs, or environment values
     may be hard-coded in images.
   - Configuration must be injected via Helm values.

---

## 3. Spec-Driven Enforcement

4. **SPEC-FIRST RULE**
   - No Dockerfile, Helm chart, or Kubernetes YAML may be written
     without an explicit approved specification.
   - The workflow MUST strictly follow:

     **Specify → Plan → Tasks → Implement**

5. **NO MANUAL CODING**
   - All infrastructure artifacts must be generated
     by Claude CLI through Spec-Kit.
   - Human involvement is limited to:
     - Writing constitutions
     - Writing specifications
     - Reviewing outputs

---

## 4. Repository & Phase Isolation Rules

6. **Phase IV Repository Integrity**
   - Phase IV may exist in a separate repository.
   - That repository MUST be a continuation of Phase III.
   - README must clearly state:
     "This project is a Phase IV continuation of Phase III."

7. **Phase III Deployments Must Remain Untouched**
   - Existing Vercel and HuggingFace deployments
     must not be altered.

---

## 6. Kubernetes & Networking Rules

10. **Minikube Only**
    - All Kubernetes resources must target Minikube.
    - No managed Kubernetes services are allowed.

11. **Service-Based Communication**
    - Frontend must communicate with backend
      using Kubernetes service names.
    - `localhost` must not be used for inter-service communication
      inside the cluster.

12. **Deployment Standards**
    - Each service must use a Kubernetes Deployment.
    - Services must expose pods internally via ClusterIP or NodePort.
    - Replicas must be configurable via Helm values.

---

## 7. Helm Enforcement

13. **Helm is Mandatory**
    - Raw Kubernetes YAML alone is insufficient.
    - Helm charts must exist for:
      - Frontend
      - Backend

14. **Helm Values Control**
    - Image name and tag
    - Environment variables
    - Service ports
    - Replica counts

---

## 8. Database Handling Rules

15. **No Database Redesign**
    - Database schema must remain unchanged.
    - Existing database configuration from Phase III
      must be reused.

16. **Persistence Awareness**
    - If SQLite or local DB is used,
      volume configuration may be introduced
      without altering schema or logic.

---

## 9. AI-Assisted DevOps Requirement

17. **AI Kubernetes Tooling**
    - AI-assisted DevOps tools must be demonstrated:
      - kubectl-ai and/or kagent
    - Usage may include:
      - Deployment help
      - Pod debugging
      - Scaling inspection

18. **AI as Assistant, Not Architect**
    - AI tools assist execution,
      but architecture must remain spec-driven.

---

## 10. Validation & Acceptance Criteria

19. **Functional Parity Guarantee**
    - Application behavior must exactly match Phase III.
    - Todo creation, listing, update, deletion,
      and chatbot interaction must work correctly.

20. **Operational Validation**
    - Pods reach Running state.
    - Services are reachable via Minikube.
    - Logs show clean startup.

21. **Reproducibility**
    - A new user must be able to:
      - Start Minikube
      - Install Helm
      - Deploy the app using provided charts
      - Access the chatbot locally

---

## 11. Explicitly Forbidden Actions

The following are strictly forbidden in Phase IV:

- Deploying to Vercel or HuggingFace
- Adding new features or APIs
- Refactoring application code
- Introducing Kafka, Dapr, or event systems
- Moving to cloud Kubernetes
- Mixing Phase V requirements

Any violation invalidates Phase IV.

---

## 12. Authority Order

In case of conflict, the following hierarchy applies:

**This Constitution**
→ Specifications
→ Plans
→ Tasks
→ Implementation

Lower levels may never override higher levels.

## Response snapshot

Created comprehensive Phase 4 constitution at `.specify/memory/phase-4/constitution.md` with 12 core principles covering:

- **Scope Lock**: Infrastructure-only deployment (no code changes)
- **Minikube ONLY**: Local Kubernetes on developer machine
- **Spec-First**: SDD workflow enforced for all artifacts
- **Helm Mandatory**: Charts for frontend and backend
- **No Hardcoding**: Configuration via Helm values, secrets via K8s Secrets
- **Service DNS**: Pod communication via Kubernetes service names
- **Deployment Standards**: Replicas, health checks, persistent volumes
- **Phase 3 Preservation**: Application code completely frozen
- **DB Schema Frozen**: Zero database changes allowed
- **AI-Assisted DevOps**: kubectl-ai and kagent integration required
- **Reproducibility**: New user can deploy in <10 minutes
- **Validation Criteria**: 40+ acceptance criteria covering functional, infrastructure, security, and UX requirements

The constitution includes:
- Sync Impact Report (version 4.0.0, 12 new principles, 8 new sections)
- Complete governance model with amendment procedures
- Quick reference for tech stack and commands
- Explicit forbidden actions with rationales
- Phase comparison and lineage documentation

## Outcome

- ✅ Impact: Established clear scope boundaries for Phase 4 infrastructure deployment
- 🧪 Tests: Constitution includes 40+ acceptance criteria for validation
- 📁 Files: `.specify/memory/phase-4/constitution.md` created at 1,396 lines
- 🔁 Next prompts: Create Phase 4 specifications for Dockerfile and Helm charts
- 🧠 Reflection: Constitution establishes infrastructure-only mandate while preserving Phase 3 functionality; enables spec-driven deployment workflow

## Evaluation notes (flywheel)

- Failure modes observed: None (successful creation)
- Graders run and results (PASS/FAIL): PASS
- Prompt variant (if applicable): null
- Next experiment: Create Docker specification (frontend/backend Dockerfiles)

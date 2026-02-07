---
description: "Implementation tasks for Phase IV Kubernetes deployment"
---

# Tasks: Phase IV - Local Kubernetes Deployment

**Input**: Design documents from `/specs/004-minikube-deployment/`
**Prerequisites**: plan.md (required), spec.md (required)

**Tests**: Tests are OPTIONAL - only health check and integration validation tasks included (no separate unit test tasks)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

---

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Include exact file paths in descriptions

---

## Dependencies & Parallel Execution

### User Story Priority & Dependencies

**User Story 1 (P1 - Core Deployment)**: ✅ **NO DEPENDENCIES** (foundational)
- Can begin immediately after Phase 1 & 2 setup
- Deliverables: Dockerfiles, Helm charts, basic deployment

**User Story 2 (P1 - Configuration Security)**: ✅ **DEPENDENT ON US1**
- Requires Docker images to exist (to verify secrets not hardcoded)
- Requires Helm charts to exist (to verify config injection)
- Can start after US1 Phase (Dockerfiles + Helm charts built)

**User Story 3 (P2 - AI-Assisted DevOps)**: ✅ **DEPENDENT ON US1 + US2**
- Requires working deployment (pods running, services accessible)
- Can start after US1 + US2 phases complete

### Parallel Execution Strategy

**Phase 1 & 2 (Setup & Foundational)**: Must complete sequentially
- T001-T008: Sequential prerequisite setup

**User Story 1 (Docker & Helm)**: Parallelizable within story
- T009-T010: Backend Dockerfile can build independently
- T011-T012: Frontend Dockerfile can build independently (parallel to backend)
- T013-T016: Backend Helm chart can build independently (parallel to frontend chart)
- T017-T020: Frontend Helm chart can build independently (parallel to backend chart)

**User Story 2 (Configuration)**: Sequential (depends on US1 images/charts)
- T021-T024: Can execute after Dockerfiles/Helm charts exist

**User Story 3 (AI-DevOps)**: Sequential (depends on deployment working)
- T025-T030: Can execute after working deployment

**Recommended MVP Scope**: Complete User Story 1 (Docker + Helm) → immediately testable with single deployment

---

## Phase 1: Setup & Prerequisites

**Purpose**: Project initialization and infrastructure preparation

- [ ] T001 Review Phase IV Constitution and confirm zero application code changes are acceptable (`..specify/memory/phase-4/constitution.md`)
- [ ] T002 Verify Phase III source code exists and is accessible (backend/, frontend/, check for main.py, package.json)
- [ ] T003 Verify Minikube is installed on development machine and running (`minikube status` shows Running)
- [ ] T004 Verify Docker daemon is accessible and working (`docker version` shows valid output)
- [ ] T005 Verify Helm 3+ is installed and working (`helm version` shows v3.x or higher)
- [ ] T006 Verify kubectl is installed and configured to access Minikube cluster (`kubectl cluster-info` shows minikube)
- [ ] T007 Create helm/ directory structure at repository root with backend/ and frontend/ subdirectories
- [ ] T008 Create scripts/ directory for deployment automation and validation scripts

---

## Phase 2: Foundational & Shared Infrastructure

**Purpose**: Establish shared infrastructure required by all user stories

- [ ] T009 [P] Review existing Phase III health endpoints (`backend/main.py` or equivalent) to confirm `/health` and `/ready` endpoints exist or plan for stubs
- [ ] T010 [P] Document Kubernetes and Helm concepts applicable to Phase IV deployment (service DNS, ConfigMap injection, Secret management)
- [ ] T011 [P] Plan Docker build strategy: identify build context, dependencies, build-time vs runtime optimization opportunities
- [ ] T012 [P] Plan Helm values strategy: identify configuration parameters, environment-specific overrides, secret vs config data separation
- [ ] T013 [P] Document Neon database connection requirements (DATABASE_URL format, firewall/network access from Minikube)
- [ ] T014 [P] Document OpenAI API key requirements and Secret creation procedure
- [ ] T015 [P] Create .dockerignore files for backend/ and frontend/ to optimize Docker build context
- [ ] T016 [P] Create helm/backend/Chart.yaml with name, version, appVersion metadata from plan.md

---

## Phase 3: User Story 1 - Developer Deploys App to Minikube (Priority: P1)

**Story Goal**: Successfully deploy Phase III AI Todo Chatbot to Minikube using Helm charts

**Independent Test**: Deployment can be tested by verifying pods reach Running state, services have ClusterIP, and health checks pass

**Story Tasks**:

### Phase 3.1: Backend Dockerfile

- [ ] T017 [P] [US1] Create backend/Dockerfile with multi-stage build: FROM python:3.11-slim
- [ ] T018 [P] [US1] Add Python dependencies to backend Dockerfile (copy requirements.txt, pip install, layer caching optimization)
- [ ] T019 [P] [US1] Add non-root user to backend Dockerfile (RUN useradd -m -u 1001 appuser, USER appuser)
- [ ] T020 [P] [US1] Add application startup to backend Dockerfile (EXPOSE 8000, CMD with uvicorn)
- [ ] T021 [US1] Build backend Docker image locally (`docker build -t backend:latest backend/`) and verify build success
- [ ] T022 [US1] Verify backend image runs as non-root user (`docker run backend:latest id` shows uid=1001)
- [ ] T023 [US1] Verify backend image does not contain hardcoded secrets (inspect Dockerfile and build output, no API keys or URLs in ENV)
- [ ] T024 [US1] Load backend image into Minikube Docker daemon (`eval $(minikube docker-env) && docker build -t backend:latest backend/`)

### Phase 3.2: Frontend Dockerfile

- [ ] T025 [P] [US1] Create frontend/Dockerfile with multi-stage build: Stage 1 FROM node:18-alpine (build), Stage 2 FROM node:18-alpine (runtime)
- [ ] T026 [P] [US1] Add Node.js dependencies to frontend Dockerfile (copy package.json/lock, npm ci, optimize layers)
- [ ] T027 [P] [US1] Add Next.js build step to frontend Dockerfile (npm run build in builder stage)
- [ ] T028 [P] [US1] Add non-root user to frontend Dockerfile (RUN addgroup -g 1001 nodejs, RUN adduser -S nextjs -u 1001, USER nextjs)
- [ ] T029 [P] [US1] Add application startup to frontend Dockerfile (EXPOSE 3000, CMD running production Next.js)
- [ ] T030 [US1] Build frontend Docker image locally (`docker build -t frontend:latest frontend/`) and verify build success
- [ ] T031 [US1] Verify frontend image runs as non-root user (`docker run frontend:latest id` shows uid=1001)
- [ ] T032 [US1] Verify frontend image does not contain hardcoded secrets or localhost references
- [ ] T033 [US1] Load frontend image into Minikube Docker daemon (`eval $(minikube docker-env) && docker build -t frontend:latest frontend/`)

### Phase 3.3: Backend Helm Chart

- [ ] T034 [P] [US1] Create helm/backend/values.yaml with default configuration (image: backend:latest, replicas: 1, port: 8000, env section)
- [ ] T035 [P] [US1] Create helm/backend/values-dev.yaml for development overrides
- [ ] T036 [US1] Create helm/backend/templates/deployment.yaml with: Deployment spec, container spec, env variable injection, liveness probe /health, readiness probe /ready
- [ ] T037 [US1] Create helm/backend/templates/service.yaml with: Service name: backend-service, type: ClusterIP, port: 8000, selector: app: backend
- [ ] T038 [US1] Create helm/backend/templates/configmap.yaml with: ConfigMap data for DATABASE_URL, ENVIRONMENT, LOG_LEVEL
- [ ] T039 [US1] Create helm/backend/templates/secret.yaml with: Secret template for OPENAI_API_KEY (placeholder for user to fill)
- [ ] T040 [US1] Create helm/backend/README.md documenting chart usage, values, deployment instructions
- [ ] T041 [US1] Validate backend Helm chart (`helm lint helm/backend/`) - must pass with no warnings
- [ ] T042 [US1] Dry-run backend Helm chart (`helm install --dry-run --debug backend helm/backend/`) and verify manifest output is valid

### Phase 3.4: Frontend Helm Chart

- [ ] T043 [P] [US1] Create helm/frontend/values.yaml with default configuration (image: frontend:latest, replicas: 1, port: 3000, env section)
- [ ] T044 [P] [US1] Create helm/frontend/values-dev.yaml for development overrides
- [ ] T045 [US1] Create helm/frontend/templates/deployment.yaml with: Deployment spec, container spec, env variable injection, liveness probe /api/health, readiness probe /api/health
- [ ] T046 [US1] Create helm/frontend/templates/service.yaml with: Service name: frontend-service, type: ClusterIP, port: 3000, selector: app: frontend
- [ ] T047 [US1] Create helm/frontend/templates/configmap.yaml with: ConfigMap data for NEXT_PUBLIC_API_URL (pointing to backend-service:8000), ENVIRONMENT
- [ ] T048 [US1] Create helm/frontend/README.md documenting chart usage, values, deployment instructions
- [ ] T049 [US1] Validate frontend Helm chart (`helm lint helm/frontend/`) - must pass with no warnings
- [ ] T050 [US1] Dry-run frontend Helm chart (`helm install --dry-run --debug frontend helm/frontend/`) and verify manifest output is valid

### Phase 3.5: Deployment & Verification

- [ ] T051 [US1] Create Kubernetes Secret for OpenAI API key (`kubectl create secret generic openai-secret --from-literal=api-key=$OPENAI_API_KEY`)
- [ ] T052 [US1] Install backend Helm chart to Minikube (`helm install backend helm/backend/ --set env.DATABASE_URL=<Neon-connection-string>`)
- [ ] T053 [US1] Install frontend Helm chart to Minikube (`helm install frontend helm/frontend/`)
- [ ] T054 [US1] Verify backend pod reaches Running state within 30 seconds (`kubectl get pods -l app=backend`)
- [ ] T055 [US1] Verify frontend pod reaches Running state within 30 seconds (`kubectl get pods -l app=frontend`)
- [ ] T056 [US1] Verify backend-service has ClusterIP assigned (`kubectl get svc backend-service`)
- [ ] T057 [US1] Verify frontend-service has ClusterIP assigned (`kubectl get svc frontend-service`)
- [ ] T058 [US1] Verify backend service is accessible by DNS from frontend pod (`kubectl exec -it <frontend-pod> -- curl http://backend-service:8000/health`)
- [ ] T059 [US1] Verify liveness probe succeeds (HTTP GET /health returns 200) (`kubectl get pods -l app=backend`)
- [ ] T060 [US1] Verify readiness probe succeeds (HTTP GET /ready returns 200 if DB connected) (`kubectl get pods -l app=backend`)
- [ ] T061 [US1] Port forward backend service to local machine (`kubectl port-forward svc/backend-service 8000:8000`)
- [ ] T062 [US1] Port forward frontend service to local machine (`kubectl port-forward svc/frontend-service 3000:3000`)
- [ ] T063 [US1] Verify chatbot responds to test message via deployed backend (manual: curl -X POST http://localhost:8000/api/chat or UI interaction)
- [ ] T064 [US1] Verify task CRUD operations work via deployed backend (manual: create task, list tasks, complete task, delete task)

---

## Phase 4: User Story 2 - Configure Application Without Hardcoding Secrets (Priority: P1)

**Story Goal**: Verify all configuration is injected via Helm values and Kubernetes Secrets; no secrets hardcoded in images

**Independent Test**: Image inspection shows zero hardcoded API keys/URLs; pod environment variables show injected values from ConfigMap/Secret; backend connects to Neon via injected DATABASE_URL

**Story Tasks**:

### Phase 4.1: Image Configuration Validation

- [ ] T065 [P] [US2] Inspect backend Docker image for hardcoded environment variables (`docker inspect backend:latest | grep -i "env"`) - MUST NOT contain API_KEY, DATABASE_URL, SECRET
- [ ] T065 [P] [US2] Inspect frontend Docker image for hardcoded API endpoint (`docker inspect frontend:latest | grep -i "api"`) - MUST NOT contain localhost or hardcoded URLs
- [ ] T066 [US2] Review backend/Dockerfile source code to confirm no ENV statements for sensitive data
- [ ] T067 [US2] Review frontend/Dockerfile source code to confirm no ENV statements for secrets or localhost URLs

### Phase 4.2: ConfigMap Injection Verification

- [ ] T068 [P] [US2] Verify backend ConfigMap exists (`kubectl get configmap backend-backend-configmap`)
- [ ] T069 [P] [US2] Verify backend ConfigMap contains DATABASE_URL (`kubectl get configmap backend-backend-configmap -o yaml | grep DATABASE_URL`)
- [ ] T070 [P] [US2] Verify backend ConfigMap contains ENVIRONMENT and LOG_LEVEL (`kubectl get configmap backend-backend-configmap -o yaml`)
- [ ] T071 [US2] Verify frontend ConfigMap exists (`kubectl get configmap frontend-frontend-configmap`)
- [ ] T072 [US2] Verify frontend ConfigMap contains NEXT_PUBLIC_API_URL pointing to backend-service (`kubectl get configmap frontend-frontend-configmap -o yaml | grep "backend-service"`)
- [ ] T073 [US2] Execute into backend pod and verify environment variable is set (`kubectl exec -it <backend-pod> -- echo $DATABASE_URL`)
- [ ] T074 [US2] Execute into frontend pod and verify NEXT_PUBLIC_API_URL is set correctly (`kubectl exec -it <frontend-pod> -- echo $NEXT_PUBLIC_API_URL`)

### Phase 4.3: Kubernetes Secret Injection Verification

- [ ] T075 [P] [US2] Verify Kubernetes Secret for OpenAI API key exists (`kubectl get secret openai-secret`)
- [ ] T076 [P] [US2] Verify backend pod mounts secret (`kubectl get pods -l app=backend -o yaml | grep -i "secret"`)
- [ ] T077 [US2] Execute into backend pod and verify OPENAI_API_KEY is set from Secret (`kubectl exec -it <backend-pod> -- echo $OPENAI_API_KEY`)
- [ ] T078 [US2] Verify OPENAI_API_KEY does NOT appear in pod logs (`kubectl logs <backend-pod> | grep -i "sk-" | wc -l` should be 0)

### Phase 4.4: Helm Values Customization

- [ ] T079 [P] [US2] Modify Helm values and redeploy backend with custom image tag (`helm upgrade backend helm/backend/ --set image.tag=v1.0`)
- [ ] T080 [P] [US2] Verify new image tag is used in pod without rebuilding image
- [ ] T081 [US2] Modify Helm values to scale backend to 2 replicas (`helm upgrade backend helm/backend/ --set replicaCount=2`)
- [ ] T082 [US2] Verify 2 backend pods are running (`kubectl get pods -l app=backend | wc -l` should show 2)
- [ ] T083 [US2] Verify configuration can be updated without image rebuild (change LOG_LEVEL via ConfigMap, restart pod, verify pod runs with new setting)

### Phase 4.5: Database Connection Verification

- [ ] T084 [US2] Verify backend pod connects to Neon database successfully (`kubectl logs <backend-pod> | grep "Database connection" or similar startup message`)
- [ ] T085 [US2] Verify backend pod does not log database credentials (`kubectl logs <backend-pod> | grep -i "password" | wc -l` should be 0)
- [ ] T086 [US2] Verify chatbot task operations work via pod with injected DATABASE_URL (manual test: create task via chat, verify written to database)

---

## Phase 5: User Story 3 - Monitor & Debug with AI Tools (Priority: P2)

**Story Goal**: Demonstrate kubectl-ai and kagent for infrastructure monitoring, debugging, and optimization

**Independent Test**: kubectl-ai generates correct kubectl commands from natural language; kagent diagnoses pod issues from logs; scaling recommendations applied successfully

**Story Tasks**:

### Phase 5.1: kubectl-ai Integration

- [ ] T087 [P] [US3] Install kubectl-ai plugin (`kubectl krew install ai` or equivalent installation method)
- [ ] T088 [P] [US3] Verify kubectl-ai is working (`kubectl ai --version` or `kubectl ai --help`)
- [ ] T089 [US3] Use kubectl-ai to generate command: "Show all pods in default namespace" (`kubectl ai "Show all pods in default namespace"`)
- [ ] T090 [US3] Verify kubectl-ai output generates correct kubectl command (`kubectl get pods`)
- [ ] T091 [US3] Use kubectl-ai to generate command: "Check resource usage of backend pods" (`kubectl ai "Check resource usage of backend pods"`)
- [ ] T092 [US3] Use kubectl-ai to generate command: "Describe backend service" (`kubectl ai "Describe backend service"`)
- [ ] T093 [US3] Create scripts/kubectl-ai-examples.sh documenting 3+ kubectl-ai usage examples with descriptions

### Phase 5.2: kagent or k8s-copilot Integration

- [ ] T094 [P] [US3] Install kagent or k8s-copilot (`pip install kagent` or equivalent, or follow project installation)
- [ ] T095 [P] [US3] Verify kagent is installed and working (`kagent --version` or `kagent --help`)
- [ ] T096 [US3] Simulate pod failure: introduce invalid DATABASE_URL in ConfigMap, force pod restart, observe CrashLoopBackOff
- [ ] T097 [US3] Use kagent to diagnose issue: provide pod logs to kagent (`kagent analyze-logs <backend-pod>` or equivalent command)
- [ ] T098 [US3] Verify kagent identifies root cause (missing/invalid DATABASE_URL connection)
- [ ] T099 [US3] Fix DATABASE_URL in ConfigMap and verify pod recovers (`helm upgrade backend helm/backend/ --set env.DATABASE_URL=<valid-url>`)
- [ ] T100 [US3] Use kagent to analyze resource usage and suggest optimization (`kagent suggest-resources <backend-deployment>` or equivalent)
- [ ] T101 [US3] Apply kagent suggestions (e.g., adjust resource requests/limits) and verify pod continues running
- [ ] T102 [US3] Create scripts/kagent-examples.sh documenting 3+ kagent usage examples with descriptions

### Phase 5.3: AI-DevOps Documentation

- [ ] T103 [US3] Create README section documenting kubectl-ai and kagent usage for Phase 4 deployment
- [ ] T104 [US3] Document at least 5 real-world debugging scenarios using AI tools (pod restart loops, connectivity issues, resource exhaustion, etc.)
- [ ] T105 [US3] Create troubleshooting guide with kubectl-ai and kagent recommendations for common Phase 4 issues

---

## Phase 6: Documentation & Automation

**Purpose**: Create comprehensive deployment documentation and automation scripts

- [ ] T106 [P] Create scripts/deploy.sh automation script that: starts Minikube, builds images, creates Kubernetes Secret, installs Helm charts
- [ ] T107 [P] Create scripts/validate.sh checklist script that: runs all verification tests (pod status, service connectivity, health probes, etc.)
- [ ] T108 [P] Create scripts/cleanup.sh script that: uninstalls Helm charts, deletes Kubernetes Secret, stops Minikube
- [ ] T109 Create README.md deployment guide with: prerequisites, step-by-step deployment instructions, verification checklist, troubleshooting guide, AI-DevOps examples
- [ ] T110 Create specs/004-minikube-deployment/quickstart.md with: 5-minute quick start, common deployment commands, expected output screenshots/descriptions
- [ ] T111 [P] Create deployment validation checklist in scripts/VALIDATION_CHECKLIST.md covering all success criteria from spec.md and plan.md

---

## Phase 7: Integration & Final Validation

**Purpose**: End-to-end validation and Phase III functionality preservation

- [ ] T112 [P] End-to-end test: Clone fresh repository, follow README, deploy app successfully without modifications
- [ ] T113 [P] End-to-end test: Verify all 3 user stories work as expected (deployment, configuration, AI-DevOps debugging)
- [ ] T114 [US1] Verify Phase III chatbot functionality unchanged: test natural language task commands (add, list, complete, delete)
- [ ] T115 [US1] Verify conversation history persists across pod restart (`kubectl delete pod <backend-pod>`, verify conversation resumes)
- [ ] T116 [US1] Performance validation: Pod startup <30s, health response <2s, helm install <60s (time all operations)
- [ ] T117 [US1] Security validation: No secrets in logs, pods run non-root, resource limits enforced
- [ ] T118 Create final summary report: All tasks completed, all success criteria met, Phase IV deployment functional

---

## Phase 8: Optional Polish & Future Enhancements

**Purpose**: Future work (not required for Phase IV)

- [ ] T119 [Optional] Add Helm value validation (pre-install checks)
- [ ] T120 [Optional] Create Helm update strategy for version upgrades
- [ ] T121 [Optional] Add namespace isolation for multiple deployments
- [ ] T122 [Optional] Create monitoring dashboard integration (Prometheus/Grafana placeholders)

---

## Summary

### Task Counts by User Story

| User Story | Count | Status |
|------------|-------|--------|
| **Setup & Foundational** | 16 tasks (T001-T016) | ✅ Prerequisites |
| **US1: Core Deployment** | 48 tasks (T017-T064) | ✅ Docker + Helm + Deploy |
| **US2: Configuration** | 20 tasks (T065-T084) | ✅ Secrets + ConfigMap + Verification |
| **US3: AI-DevOps** | 19 tasks (T087-T105) | ✅ kubectl-ai + kagent + Docs |
| **Documentation** | 6 tasks (T106-T111) | ✅ Scripts + README + Quickstart |
| **Integration** | 7 tasks (T112-T118) | ✅ E2E Testing |
| **Polish (Optional)** | 4 tasks (T119-T122) | ⏳ Future |

**Total**: 120 tasks (116 required + 4 optional)

### Parallel Execution Opportunities

**Can Execute in Parallel** (after Phase 1-2):
- T025-T033: Frontend Dockerfile (while T017-T024 runs backend)
- T043-T049: Frontend Helm chart (while T034-T041 runs backend)
- T065-T067: Image validation backend (while T087-T088 starts kubectl-ai)
- T068-T074: ConfigMap verification (while T075-T078 does Secret verification)

### Independent Testing Per Story

**US1 (Core Deployment)**: ✅ Testable after T064
- Pods Running, services accessible, health probes pass, chatbot responds

**US2 (Configuration)**: ✅ Testable after T086
- No hardcoded secrets, ConfigMap injection works, database connection valid

**US3 (AI-DevOps)**: ✅ Testable after T105
- kubectl-ai generates commands, kagent diagnoses issues, scaling works

### Recommended MVP Scope

**Minimum Viable Phase 4**: User Story 1 (Core Deployment)
- Deploy Phase III to Minikube
- Pods Running, services working, chatbot accessible
- Estimated completion: 48 tasks (T017-T064)
- Enables immediate validation and feedback

**Full Phase 4**: All user stories
- US1 (deployment) + US2 (configuration security) + US3 (AI-DevOps)
- Complete infrastructure management demonstration
- Estimated completion: 116 tasks (T001-T118)

---

## Quality Assurance

✅ All tasks follow strict format: `- [ ] [TaskID] [P?] [Story?] Description with file path`
✅ All tasks are specific and actionable (can be completed by LLM without additional context)
✅ All tasks have clear file paths and success criteria
✅ Tasks organized by user story (independent implementation possible)
✅ Parallel execution opportunities identified and documented
✅ Dependencies explicitly documented
✅ Constitutional alignment: All tasks respect Phase IV principles

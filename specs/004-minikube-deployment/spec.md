# Feature Specification: Phase IV - Local Kubernetes Deployment

**Feature Branch**: `004-minikube-deployment`
**Created**: 2026-01-08
**Status**: Draft
**Input**: Deploy Phase III AI Todo Chatbot to local Minikube cluster using Helm, Docker, with AI-assisted DevOps tools

---

## User Scenarios & Testing

### User Story 1 - Developer Deploys App to Minikube (Priority: P1)

A developer with a local machine (Linux, macOS, or Windows) needs to deploy the complete AI Todo Chatbot application to a local Kubernetes cluster using Minikube, making the application accessible to interact with.

**Why this priority**: P1 is critical because deployment is the core deliverable of Phase IV. Without successful local deployment, the entire phase fails. This is the foundation upon which all other stories depend.

**Independent Test**: Deployment can be tested independently by verifying that after running a sequence of `helm install` commands, both frontend and backend pods are in Running state, services have ClusterIP assignments, and the application is accessible via port forwarding.

**Acceptance Scenarios**:

1. **Given** a developer has Minikube installed and running, **When** they clone the repository and execute deployment commands, **Then** frontend and backend pods start successfully with status "Running" and services are created with internal ClusterIP addresses.

2. **Given** pods are running, **When** health check endpoints are called, **Then** liveness and readiness probes respond with HTTP 200 status, indicating pods are healthy.

3. **Given** frontend and backend pods are running, **When** frontend attempts to connect to backend using Kubernetes service DNS name (e.g., `backend-service:8000`), **Then** connection is successful and API requests resolve correctly.

4. **Given** the application is deployed, **When** a user accesses the chat endpoint, **Then** the chatbot responds with conversational messages and performs task operations (add, list, complete, delete) correctly.

---

### User Story 2 - Configure Application Without Hardcoding Secrets (Priority: P1)

A DevOps engineer needs to configure the application (environment variables, API keys, database URLs) via Helm values and Kubernetes Secrets, ensuring no sensitive data is embedded in Docker images.

**Why this priority**: P1 is critical for security. Hardcoding secrets in images violates Phase IV constitution and is a production security violation. This must work correctly from day one.

**Independent Test**: Configuration can be tested independently by verifying that: (1) Docker images contain no hardcoded API keys or URLs, (2) Helm values can be customized without rebuilding images, (3) environment variables are injected correctly into pods at runtime, (4) secrets are stored in Kubernetes Secrets and mounted as environment variables.

**Acceptance Scenarios**:

1. **Given** a backend image is built, **When** the image is inspected, **Then** no environment variables containing API keys, database URLs, or secret tokens are hardcoded in the Dockerfile or image layers.

2. **Given** Helm charts are installed with custom values, **When** pods start, **Then** environment variables are injected correctly from ConfigMap and Secret sources, verified by `kubectl exec` and environment inspection.

3. **Given** the backend pod is running, **When** it connects to the Neon database, **Then** the connection uses the DATABASE_URL injected via Helm ConfigMap, not a hardcoded value.

4. **Given** OpenAI API key is needed, **When** the backend initializes, **Then** it reads the API key from a Kubernetes Secret mounted as an environment variable, and startup succeeds without exposing the key in logs.

---

### User Story 3 - Monitor and Debug Kubernetes Deployment with AI Tools (Priority: P2)

A DevOps engineer needs to use AI-assisted Kubernetes tools (kubectl-ai, kagent) to inspect deployments, debug pod issues, and optimize scaling, demonstrating practical AI usage for infrastructure management.

**Why this priority**: P2 because while important for demonstrating AI-DevOps integration, core deployment functionality (P1 stories) must work first. This adds sophistication to infrastructure management but isn't blocking.

**Independent Test**: AI tool usage can be tested independently by verifying that: (1) kubectl-ai and kagent are installed and configured, (2) developers can use these tools to generate deployment inspection commands, (3) tools successfully debug pod connectivity issues, (4) scaling recommendations from AI tools are validated and applied.

**Acceptance Scenarios**:

1. **Given** kubectl-ai is installed, **When** a developer asks "Show me all pods in the default namespace", **Then** kubectl-ai generates the correct `kubectl get pods` command and displays results.

2. **Given** a pod is in CrashLoopBackOff state, **When** kagent is invoked to diagnose issues, **Then** it analyzes pod logs, suggests root cause (e.g., missing environment variable), and recommends remediation steps.

3. **Given** the deployment is running, **When** kubectl-ai is used to generate scaling commands, **Then** the deployment can be scaled to multiple replicas, pods start correctly, and services still route to all replicas.

4. **Given** multiple pods are running, **When** AI tools analyze resource usage, **Then** they suggest optimal resource requests/limits based on observed utilization, and recommendations are applied without service interruption.

---

### Edge Cases

- What happens when a developer's Minikube cluster runs out of disk space? System should fail gracefully with clear error message about insufficient storage.
- What happens if the database connection string is misconfigured in Helm values? Backend pod should fail startup and logs should indicate DATABASE_URL connection failure.
- What happens if two developers try to deploy to the same Minikube cluster simultaneously? Helm should either succeed (if namespace isolation is used) or clearly indicate namespace conflict.
- What happens if a pod exceeds resource limits? Kubernetes should evict the pod and restart it; readiness probe should detect failure and mark pod as not ready.
- What happens if the OpenAI API key is invalid or expired? Backend should fail gracefully, log the authentication error without exposing the key, and remain recoverable when key is updated.

---

## Requirements

### Functional Requirements

**Docker & Image Building**:

- **FR-001**: System MUST provide a Dockerfile for the backend that builds successfully without errors, results in a runnable image, and contains no hardcoded secrets or environment variables.
- **FR-002**: System MUST provide a Dockerfile for the frontend (Next.js) that performs a multi-stage build, minimizing final image size, and runs the application on port 3000.
- **FR-003**: Both Dockerfiles MUST run application containers as non-root users for security.
- **FR-004**: Dockerfiles MUST be buildable locally and loadable into Minikube's Docker daemon without requiring external image registry.

**Helm Charts & Configuration**:

- **FR-005**: System MUST provide a Helm chart for the backend that generates a Deployment, Service, ConfigMap, and optionally Secrets.
- **FR-006**: System MUST provide a Helm chart for the frontend that generates a Deployment, Service, and ConfigMap.
- **FR-007**: Helm charts MUST allow configuration of image name/tag, environment variables, service ports, and replica counts via `values.yaml` without modifying templates.
- **FR-008**: Helm charts MUST support deploying multiple replicas (minimum 1, configurable up to 3+) with load balancing via Kubernetes Service.

**Environment Configuration**:

- **FR-009**: Backend pod MUST receive DATABASE_URL from Helm ConfigMap pointing to managed Neon database (not local database or PVC).
- **FR-010**: Backend pod MUST receive OPENAI_API_KEY from Kubernetes Secret, injected at runtime, with no hardcoding in Dockerfile.
- **FR-011**: Frontend pod MUST receive NEXT_PUBLIC_API_URL pointing to backend service via Kubernetes DNS name (e.g., `http://backend-service:8000`), not localhost.
- **FR-012**: Helm values MUST support environment-specific configuration (development, staging) via separate values files.

**Kubernetes Deployment**:

- **FR-013**: System MUST create Deployment resources with selector labels matching pod labels.
- **FR-014**: System MUST define liveness probes (HTTP GET to `/health` endpoint) to restart failed containers.
- **FR-015**: System MUST define readiness probes (HTTP GET to `/ready` endpoint) to control traffic routing to healthy pods only.
- **FR-016**: System MUST create Service resources (type: ClusterIP) for internal pod communication with stable DNS names.
- **FR-017**: Pod-to-pod communication MUST use Kubernetes service DNS names, not localhost or pod IPs.

**Database Integration**:

- **FR-018**: Backend MUST connect to managed Neon PostgreSQL database using connection string from environment variable (DATABASE_URL).
- **FR-019**: Database schema from Phase III MUST remain unchanged; no migrations or schema modifications are allowed.
- **FR-020**: Pod data persistence MUST be handled by the external database, not local volumes (no SQLite or local files in pods).

**AI-Assisted DevOps**:

- **FR-021**: System MUST support kubectl-ai plugin for generating kubectl commands from natural language.
- **FR-022**: System MUST support kagent or k8s-copilot for deployment analysis and troubleshooting.
- **FR-023**: Documentation MUST provide at least 3 concrete examples of using AI tools for: deployment inspection, pod debugging, and scaling checks.

**Health Checks & Monitoring**:

- **FR-024**: Backend MUST expose `/health` endpoint returning `{"status": "ok"}` with HTTP 200 for liveness probes.
- **FR-025**: Backend MUST expose `/ready` endpoint returning database connection status for readiness probes; returns HTTP 503 if database unavailable.
- **FR-026**: Frontend MUST expose health check endpoint (e.g., `/api/health`) returning application status.

**Validation & Reproducibility**:

- **FR-027**: System MUST provide a README documenting step-by-step deployment instructions for a new user.
- **FR-028**: System MUST provide a validation script or checklist verifying all pods are running, services are accessible, and health checks pass.
- **FR-029**: Documentation MUST enable a new user with no prior Kubernetes experience to deploy the app in under 10 minutes.

### Key Entities

- **Container Image**: Docker image built from Dockerfile, tagged with version (e.g., `backend:latest`, `frontend:latest`), runnable on Minikube without external registry.
- **Helm Chart**: Package containing Kubernetes manifests, templated with `values.yaml` for configuration, installable via `helm install` command.
- **Kubernetes Service**: Internal DNS name (e.g., `backend-service`) mapping to pods running application, enabling service-to-service communication.
- **ConfigMap**: Kubernetes resource storing non-sensitive configuration (URLs, environment variables) injected into pods.
- **Secret**: Kubernetes resource storing sensitive data (API keys, database passwords) injected into pods as environment variables or mounted files.
- **Deployment**: Kubernetes controller managing pod replicas, ensuring desired count always running, supporting rolling updates.
- **PersistentVolumeClaim (optional)**: For local database persistence if needed; not required for Neon-managed database.

---

## Success Criteria

### Measurable Outcomes

**Deployment Success**:

- **SC-001**: Pods reach "Running" state within 30 seconds of Helm installation with no restart loops.
- **SC-002**: Services are created with valid ClusterIP addresses and stable DNS names resolvable from within pods.
- **SC-003**: Health check endpoints respond with HTTP 200 status within 2 seconds from pod startup.

**Configuration Management**:

- **SC-004**: Docker images contain zero hardcoded secrets, verified by image inspection and source code review.
- **SC-005**: Environment variables are successfully injected from Helm ConfigMap and Secrets, verified by pod environment inspection.
- **SC-006**: All configuration values are customizable via `values.yaml` without requiring Dockerfile rebuild or image modification.

**Functionality Preservation**:

- **SC-007**: AI chatbot responds to natural language commands (add task, list tasks, complete task, delete task) identically to Phase III, with <5 second latency p95.
- **SC-008**: Task CRUD operations work correctly via both traditional UI and chat interface (if applicable).
- **SC-009**: Conversation history persists across pod restarts; no data loss when pod is deleted and recreated.

**Infrastructure Quality**:

- **SC-010**: Helm charts pass validation (`helm lint`) with no warnings or errors.
- **SC-011**: Multiple replicas (2+) can be deployed without pod startup failures or resource contention.
- **SC-012**: Readiness probes correctly identify unhealthy pods within 5 seconds of health degradation.

**Developer Experience**:

- **SC-013**: A new user can clone repository, start Minikube, and deploy app via 5 simple commands.
- **SC-014**: Documentation includes screenshots/commands showing expected output at each step.
- **SC-015**: Deployment process is deterministic; running same commands produces identical results across different machines (same OS).

**AI-Assisted DevOps**:

- **SC-016**: kubectl-ai successfully generates at least 3 different useful kubectl commands from natural language input.
- **SC-017**: kagent identifies at least 1 deployment issue and suggests remediation when provided pod logs.
- **SC-018**: Scaling operations executed via AI-recommended commands succeed without pod failures.

**Security & Best Practices**:

- **SC-019**: No secrets appear in pod logs, environment variable output, or API responses.
- **SC-020**: All pods run as non-root users (UID >= 1000), verified by pod security policy and runtime inspection.
- **SC-021**: Resource requests and limits are defined for all containers, preventing uncontrolled resource consumption.

---

## Assumptions

- **Assumption-001**: Developer has Minikube installed and Docker configured (or has access to install these).
- **Assumption-002**: Developer has Helm 3+ installed.
- **Assumption-003**: Neon PostgreSQL database is already provisioned and accessible from Minikube cluster (external database connection supported).
- **Assumption-004**: OpenAI API key is available and injected via Kubernetes Secrets or environment variables (not hardcoded).
- **Assumption-005**: kubectl-ai and kagent are available via Kubernetes plugin mechanisms (krew or similar).
- **Assumption-006**: Frontend and backend source code from Phase III exists and is deployable without modifications.
- **Assumption-007**: Health check endpoints (`/health`, `/ready`) are already implemented in Phase III backend and don't require changes.
- **Assumption-008**: "Minikube only" means local single-node cluster; no cloud Kubernetes services (EKS, GKE, AKS) are used.

---

## Constraints & Non-Goals

**Constraints**:

- Must use Minikube for Kubernetes (no EKS, GKE, AKS, or other managed services).
- Must not modify Phase III application code; deployment only.
- Must not change database schema or add new tables to Phase III.
- Configuration via Helm values only; no manual kubectl apply of raw YAML.
- All sensitive data via Kubernetes Secrets, never hardcoded in images.

**Non-Goals**:

- Implementing multi-cloud deployment strategies.
- Creating CI/CD pipelines or GitOps workflows (deployment is manual for Phase IV).
- Implementing auto-scaling policies or resource monitoring dashboards.
- Database backup and disaster recovery (handled by Neon).
- TLS/SSL certificate management (not required for local Minikube).
- Implementing service mesh (Istio, Linkerd) or advanced networking.

---

## Dependencies & Integration

**Phase III Dependency**:

- All Phase III code, database schema, and APIs MUST be frozen and unchanged.
- Phase III must remain fully functional when deployed via Phase IV infrastructure.
- No breaking changes to authentication, API endpoints, or data models.

**External Systems**:

- **Neon PostgreSQL**: Managed database providing DATABASE_URL connection string; assumed to be provisioned and accessible.
- **OpenAI API**: Requires valid API key injected via Kubernetes Secret for chatbot functionality.
- **kubectl-ai / kagent**: Kubernetes plugins providing AI-assisted DevOps capabilities; must be installable via krew or similar.

**Infrastructure Requirements**:

- Docker daemon running (Docker Desktop on macOS/Windows or system daemon on Linux).
- Minikube cluster with sufficient resources (minimum 2 CPUs, 4GB RAM recommended).
- Network connectivity from Minikube pods to external database (Neon) and OpenAI API.

---

## Phase IV Constitution Reference

This specification strictly adheres to Phase IV Constitution (`.specify/memory/phase-4/constitution.md`):

- ✅ **Principle 0 (Code Freeze)**: Zero application code changes; infrastructure only.
- ✅ **Principle I (Minikube ONLY)**: Deployment target is local Minikube cluster only.
- ✅ **Principle II (Spec-First)**: Specification written before implementation begins.
- ✅ **Principle III (Helm Mandatory)**: Helm charts required for all services.
- ✅ **Principle VII (No Hardcoding)**: Configuration injected via Helm values and Kubernetes Secrets.
- ✅ **Principle VIII (Database Frozen)**: Schema unchanged; connection via managed Neon database.
- ✅ **Principle IX (Dockerfile Standards)**: Multi-stage builds, non-root users, minimal base images.
- ✅ **Principle XI (AI-Assisted DevOps)**: kubectl-ai and kagent integration demonstrated.
- ✅ **Principle XII (Reproducibility)**: Documentation enables 10-minute deployment for new users.

---

## Deliverables

By completion of Phase IV implementation based on this spec, the following artifacts must exist:

1. **Dockerfile** (`backend/Dockerfile`): Builds backend image with FastAPI, Python dependencies, health endpoints.
2. **Dockerfile** (`frontend/Dockerfile`): Builds frontend image with Next.js, optimized multi-stage build.
3. **Helm Chart** (`helm/backend/`): Chart.yaml, values.yaml, templates for Deployment, Service, ConfigMap, Secrets.
4. **Helm Chart** (`helm/frontend/`): Chart.yaml, values.yaml, templates for Deployment, Service, ConfigMap.
5. **README.md**: Step-by-step deployment guide, validation checklist, troubleshooting guide.
6. **Documentation**: AI-assisted DevOps examples with kubectl-ai and kagent usage.
7. **Validation Script**: Automated script or checklist verifying deployment success criteria.

---

## Out of Scope

- Implementing new features or APIs for the chatbot.
- Modifying application source code, database schema, or business logic.
- Creating production-grade disaster recovery or multi-region deployments.
- Implementing Kubernetes RBAC policies or network policies (if not already present).
- Setting up container image registries or artifact repositories.
- Creating monitoring dashboards or alerting systems (beyond basic health checks).

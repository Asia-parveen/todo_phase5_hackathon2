# Implementation Plan: Phase IV - Local Kubernetes Deployment

**Branch**: `004-minikube-deployment` | **Date**: 2026-01-08 | **Spec**: [Phase IV Specification](./spec.md)

**Input**: Feature specification from `/specs/004-minikube-deployment/spec.md`

---

## Summary

Phase IV requires deploying the Phase III AI Todo Chatbot to a local Kubernetes cluster (Minikube) using Helm charts for orchestration. The deployment must be **infrastructure-only** with **zero application code changes**. Frontend (Next.js) and backend (FastAPI) will run as containerized services on Minikube, communicating via Kubernetes service DNS names. Configuration (database URL, API keys) will be injected via Helm values and Kubernetes Secrets, never hardcoded in images. AI-assisted DevOps tools (kubectl-ai, kagent) will demonstrate practical infrastructure monitoring and debugging.

---

## Technical Context

**Language/Version**:
- **Backend**: Python 3.11 (inherited from Phase III FastAPI app)
- **Frontend**: Node.js 18+ (inherited from Phase III Next.js app)
- **Infrastructure**: Kubernetes 1.24+ via Minikube

**Primary Dependencies**:
- **Container Runtime**: Docker (Desktop or daemon)
- **Kubernetes**: Minikube (local single-node cluster)
- **Package Manager**: Helm 3.x (application packaging)
- **Orchestration**: kubectl (Kubernetes CLI)
- **AI-DevOps**: kubectl-ai (krew plugin), kagent or k8s-copilot

**Storage**:
- **Database**: Neon PostgreSQL (managed, external to Kubernetes)
- **Pod Storage**: No local persistence required (database handles state)
- **Optional**: PersistentVolumeClaim for future expansion

**Testing**:
- **Container Testing**: Docker build validation (images build, run as non-root)
- **Helm Testing**: `helm lint` for chart validation, `helm install --dry-run` for manifest preview
- **Integration Testing**: Pod startup verification, service DNS resolution, health check endpoints
- **AI-DevOps Testing**: kubectl-ai command generation, kagent issue diagnosis

**Target Platform**:
- **Host OS**: Linux, macOS (x86_64 or ARM64), Windows (WSL2 or Docker Desktop)
- **Kubernetes**: Minikube cluster (single-node, local)
- **Deployment Method**: Helm charts (no manual kubectl apply of raw YAML)

**Project Type**: Web application (frontend + backend separation with Kubernetes orchestration)

**Performance Goals**:
- Pod startup: <30 seconds
- Health check response: <2 seconds
- Helm install completion: <60 seconds
- Service DNS resolution: <1 second

**Constraints**:
- Minikube ONLY (no EKS, GKE, AKS, or managed Kubernetes)
- No Phase III application code modifications
- No database schema changes
- No hardcoded secrets in Docker images
- Configuration via Helm values and Kubernetes Secrets only

**Scale/Scope**:
- Single Minikube cluster (local developer machine)
- 2 services (frontend, backend) with configurable replicas (1-3+ for demo)
- 1 external database (Neon PostgreSQL)
- 2 Docker images (frontend, backend)
- 2 Helm charts (frontend, backend)

---

## Constitution Check

**Gate Status**: ✅ **PASSES** - All Phase IV Constitutional requirements verified and satisfied

### Principle Validation

**Principle 0 (Code Freeze - SUPREME)**: ✅ **PASS**
- Plan contains zero application code modifications
- Only infrastructure artifacts: Dockerfiles, Helm charts, configuration
- Phase III code remains completely untouched
- Validation: Source code directories unchanged; only `Dockerfile` and `helm/` directories created

**Principle I (Minikube ONLY)**: ✅ **PASS**
- Deployment target explicitly limited to local Minikube cluster
- No cloud provider integration (AWS, GCP, Azure, etc.)
- Plan rejects managed Kubernetes services
- Validation: Deployment method via `minikube start` and local `docker` daemon

**Principle II (Spec-First)**: ✅ **PASS**
- This plan follows approved specification (`spec.md`)
- Workflow: Spec → Plan → Tasks → Implement
- No ad-hoc coding without specification
- Validation: Every task traces to functional requirement in spec

**Principle III (Helm Mandatory)**: ✅ **PASS**
- Both frontend and backend require Helm charts
- No raw Kubernetes YAML files accepted outside Helm templates
- Configuration via `values.yaml` only
- Validation: `helm/frontend/` and `helm/backend/` chart structures required

**Principle VII (No Hardcoding)**: ✅ **PASS**
- Database URL injected via Helm ConfigMap (not hardcoded)
- OpenAI API key injected via Kubernetes Secret (not hardcoded)
- Frontend API endpoint injected via Helm ConfigMap (not hardcoded)
- All images buildable without secrets
- Validation: Dockerfiles inspect clean; `helm values` show configuration sources

**Principle VIII (Database Frozen)**: ✅ **PASS**
- Schema remains unchanged from Phase III
- Connection string managed via environment variable
- No PersistentVolumeClaim for local database (Neon manages persistence)
- Validation: Database schema comparison (Phase III vs Phase IV) shows zero changes

**Principle IX (Dockerfile Standards)**: ✅ **PASS**
- Multi-stage builds for both frontend and backend
- Non-root users (UID >= 1000) in all containers
- Minimal base images (python:3.11-slim, node:18-alpine)
- Local Minikube compatibility (no external registry required)
- Validation: Image inspection, user verification, size optimization

**Principle XI (AI-Assisted DevOps)**: ✅ **PASS**
- kubectl-ai integration for command generation
- kagent or k8s-copilot for deployment analysis and debugging
- 3+ concrete use cases documented
- Validation: Example commands, debugging scenarios, scaling operations

**Principle XII (Reproducibility)**: ✅ **PASS**
- New user can deploy in <10 minutes via documented steps
- Step-by-step README with screenshots/commands
- Validation checklist provided
- Validation: Independent deployment test from fresh clone

### Gate Resolution

**Violations Identified**: 0

**Justifications Required**: 0

**Gate Status**: ✅ **READY TO PROCEED** - Plan is constitutionally compliant and ready for Phase 1 design.

---

## Project Structure

### Documentation (this feature)

```text
specs/004-minikube-deployment/
├── spec.md                  # ✅ Feature specification (complete)
├── plan.md                  # ← This file (implementation plan)
├── research.md              # → Phase 0 output (research findings)
├── data-model.md            # → Phase 1 output (infrastructure entities)
├── quickstart.md            # → Phase 1 output (setup guide)
├── contracts/               # → Phase 1 output (API contracts, Helm schemas)
└── checklists/
    └── requirements.md      # ✅ Quality validation checklist (complete)
```

### Source Code Structure

Phase IV uses existing Phase III application structure. Infrastructure artifacts added:

```text
.
├── backend/
│   ├── Dockerfile               # → Multi-stage FastAPI image
│   ├── requirements.txt          # (existing Phase III)
│   ├── main.py                  # (existing Phase III)
│   └── ...
│
├── frontend/
│   ├── Dockerfile               # → Multi-stage Next.js image
│   ├── package.json             # (existing Phase III)
│   ├── src/                     # (existing Phase III)
│   └── ...
│
├── helm/                        # → NEW: Helm charts
│   ├── backend/
│   │   ├── Chart.yaml           # Helm chart metadata
│   │   ├── values.yaml          # Configuration values
│   │   ├── values-dev.yaml      # Development-specific values
│   │   ├── templates/
│   │   │   ├── deployment.yaml  # Backend Deployment resource
│   │   │   ├── service.yaml     # Backend Service resource
│   │   │   ├── configmap.yaml   # Backend ConfigMap (env vars)
│   │   │   └── secret.yaml      # Backend Secret (API keys)
│   │   └── README.md            # Chart documentation
│   │
│   └── frontend/
│       ├── Chart.yaml           # Helm chart metadata
│       ├── values.yaml          # Configuration values
│       ├── values-dev.yaml      # Development-specific values
│       ├── templates/
│       │   ├── deployment.yaml  # Frontend Deployment resource
│       │   ├── service.yaml     # Frontend Service resource
│       │   └── configmap.yaml   # Frontend ConfigMap (env vars)
│       └── README.md            # Chart documentation
│
├── README.md                    # → Updated with Phase 4 deployment guide
└── scripts/                     # → NEW: Deployment and validation scripts
    ├── deploy.sh               # Automated deployment script
    ├── validate.sh             # Validation checklist script
    ├── ai-devops-examples.sh   # kubectl-ai and kagent usage examples
    └── cleanup.sh              # Teardown script
```

---

## Phase 0: Research & Clarifications

### Clarifications Resolved

**All requirements in specification are concrete and unambiguous. No [NEEDS CLARIFICATION] markers required.**

Research findings documented in `research.md`:

1. **Dockerfile Strategy**: Multi-stage builds validated as best practice; base images selected (python:3.11-slim, node:18-alpine)
2. **Helm Chart Structure**: Helm 3+ syntax confirmed; ConfigMap/Secret injection patterns documented
3. **Kubernetes Service DNS**: `{service-name}.{namespace}.svc.cluster.local` resolution verified for pod-to-pod communication
4. **Neon Database Integration**: External database connection via connection string (no local persistence needed)
5. **kubectl-ai Integration**: krew plugin installation documented; real-world command generation examples provided
6. **kagent/k8s-copilot**: Installation methods and debugging scenarios documented
7. **Health Endpoint Requirements**: `/health` (liveness) and `/ready` (readiness) patterns validated

---

## Phase 1: Design & Architecture

### Data Model (Infrastructure Entities)

**Container Image**:
- **Entity**: Docker image built from Dockerfile, tagged with version
- **Fields**: name (backend, frontend), tag (latest, v1.0), digest (sha256:...)
- **Attributes**: size, base OS, layers, non-root user UID
- **Lifecycle**: built → loaded → pushed (if using registry) → deployed
- **Validation**: Must run as non-root, must not contain hardcoded secrets

**Helm Chart**:
- **Entity**: Package containing Kubernetes manifests and configuration templates
- **Fields**: chart name, version, appVersion, dependencies
- **Key Files**: Chart.yaml (metadata), values.yaml (defaults), templates/ (K8s resources)
- **Attributes**: replicaCount, image, environment variables, service ports, resource limits
- **Lifecycle**: created → linted (validation) → installed → upgraded → uninstalled
- **Validation**: Must pass `helm lint`, must customize via values only

**Kubernetes Deployment**:
- **Entity**: Kubernetes resource managing pod replicas
- **Fields**: name, replicas, selector (labels), template (pod spec)
- **Attributes**: image, ports, environment variables, resource requests/limits, health probes
- **Relationships**: manages Pods, exposed by Service, configured by ConfigMap/Secret
- **Lifecycle**: created → scaling → rolling update → deletion
- **Validation**: Replicas must reach Running state, health probes must pass

**Kubernetes Service**:
- **Entity**: Stable DNS name and load balancing for pod group
- **Fields**: name, type (ClusterIP), ports, selector (target pods)
- **Attributes**: ClusterIP (internal IP), port mapping, DNS name
- **Relationships**: exposes Deployment, resolved by pod DNS queries
- **Lifecycle**: created → endpoint discovery → traffic routing → deletion
- **Validation**: Must have ClusterIP assigned, must resolve via DNS from pods

**ConfigMap**:
- **Entity**: Kubernetes resource storing non-secret configuration
- **Fields**: name, data (key-value pairs)
- **Key Data**: DATABASE_URL, API endpoints, feature flags, environment names
- **Attributes**: immutable flag (optional), namespace
- **Relationships**: mounted as environment variables or files in pod spec
- **Lifecycle**: created → mounted in pods → updated → deletion
- **Validation**: Must contain only non-sensitive configuration

**Secret**:
- **Entity**: Kubernetes resource storing sensitive data
- **Fields**: name, data (base64-encoded key-value pairs), type
- **Key Data**: OPENAI_API_KEY, database passwords, API tokens
- **Attributes**: immutable flag (optional), namespace, encoding
- **Relationships**: mounted as environment variables in pod spec
- **Lifecycle**: created → mounted in pods → rotated (key updates) → deletion
- **Validation**: Must use base64 encoding, must not appear in logs

### API Contracts & Helm Schemas

**Helm Backend Chart Values Schema**:

```yaml
# helm/backend/values.yaml
backend:
  image: backend:latest            # Container image name:tag
  replicas: 1                      # Number of pod replicas (1-3+)
  port: 8000                       # Service port

  env:
    DATABASE_URL: ""               # Injected from ConfigMap
    OPENAI_API_KEY: ""             # Injected from Secret
    LOG_LEVEL: "info"              # Application configuration
    ENVIRONMENT: "development"     # Environment name

  resources:
    requests:
      cpu: "100m"                  # CPU request
      memory: "256Mi"              # Memory request
    limits:
      cpu: "500m"                  # CPU limit
      memory: "512Mi"              # Memory limit

  probes:
    liveness:
      path: "/health"              # Liveness probe endpoint
      initialDelaySeconds: 10      # Delay before first check
      periodSeconds: 10            # Check interval
    readiness:
      path: "/ready"               # Readiness probe endpoint
      initialDelaySeconds: 5
      periodSeconds: 5
```

**Helm Frontend Chart Values Schema**:

```yaml
# helm/frontend/values.yaml
frontend:
  image: frontend:latest           # Container image name:tag
  replicas: 1                      # Number of pod replicas
  port: 3000                       # Service port

  env:
    NEXT_PUBLIC_API_URL: "http://backend-service:8000"  # Backend service DNS
    ENVIRONMENT: "development"

  resources:
    requests:
      cpu: "50m"
      memory: "128Mi"
    limits:
      cpu: "200m"
      memory: "256Mi"

  probes:
    liveness:
      path: "/api/health"          # Frontend health endpoint
      initialDelaySeconds: 15
      periodSeconds: 10
    readiness:
      path: "/api/health"
      initialDelaySeconds: 10
      periodSeconds: 5
```

**Service DNS Communication**:

```yaml
# Backend Service (exposed to frontend)
apiVersion: v1
kind: Service
metadata:
  name: backend-service
spec:
  selector:
    app: backend
  ports:
    - port: 8000
      targetPort: 8000
  type: ClusterIP

# Frontend pod connects to backend via DNS
# URL: http://backend-service:8000/api/chat
# Kubernetes resolves backend-service → ClusterIP → backend pods
```

### Quickstart Guide Structure

`quickstart.md` will contain:

1. **Prerequisites**: Minikube, Docker, Helm, kubectl installation
2. **Step-by-Step Deployment**:
   - Start Minikube cluster
   - Build Docker images
   - Create Kubernetes Secrets (OpenAI API key)
   - Install Helm charts
   - Port forward services
3. **Verification**: Health checks, service accessibility, basic chatbot test
4. **Troubleshooting**: Common issues and resolution steps
5. **Cleanup**: Teardown commands

---

## Phase 2: Implementation Strategy

### Work Breakdown Structure

The implementation follows this sequenced workflow:

**Foundation Layer** (Prerequisites):
1. Create backend Dockerfile (multi-stage, non-root, optimized)
2. Create frontend Dockerfile (multi-stage, non-root, optimized)

**Orchestration Layer** (Helm Charts):
3. Create backend Helm chart (Deployment, Service, ConfigMap, Secret)
4. Create frontend Helm chart (Deployment, Service, ConfigMap)

**Configuration Layer** (Values & Secrets):
5. Define backend values.yaml with environment configuration
6. Define frontend values.yaml with environment configuration
7. Document Kubernetes Secret creation for API keys

**Integration Layer** (Pod-to-Pod Communication):
8. Configure backend service DNS in frontend environment
9. Verify service DNS resolution within pods

**Health & Monitoring Layer**:
10. Verify `/health` and `/ready` endpoints in backend
11. Configure liveness and readiness probes in Helm templates
12. Validate health check endpoint in frontend (if needed)

**DevOps & Documentation Layer**:
13. Install and document kubectl-ai usage (3+ examples)
14. Install and document kagent or k8s-copilot (3+ examples)
15. Create deployment.sh automation script
16. Create validate.sh checklist script
17. Create ai-devops-examples.sh with kubectl-ai and kagent commands
18. Write comprehensive README.md deployment guide
19. Create quickstart.md setup instructions

**Validation & Testing Layer**:
20. Validate all Dockerfiles (image build, non-root user, secrets check)
21. Validate all Helm charts (`helm lint` passes)
22. Integration test: pod startup, service creation, DNS resolution
23. Integration test: health probes passing
24. Integration test: pod-to-pod communication via service DNS
25. Integration test: chatbot functionality via deployed backend
26. Performance test: pod startup <30s, health response <2s
27. AI-DevOps test: kubectl-ai commands generate correctly
28. AI-DevOps test: kagent diagnoses pod issues
29. Documentation test: new user can deploy in <10 minutes
30. Final compliance: Phase III functionality unchanged

### Architectural Decisions

**AD-001: Multi-Stage Docker Builds**
- **Decision**: Use multi-stage Dockerfile pattern for both frontend and backend
- **Rationale**: Reduces final image size (eliminates build tools), improves security (smaller attack surface), speeds deployment
- **Implications**: Requires docker build context setup for frontend (build → production stages)

**AD-002: Helm as Package Manager (NO Raw YAML)**
- **Decision**: All Kubernetes resources templated via Helm; no raw kubectl apply of YAML
- **Rationale**: Enables configuration reuse, supports environment-specific values, provides version management
- **Implications**: Requires Helm 3+ CLI, chart linting in CI/CD

**AD-003: External Database (Neon, NO Local Persistence)**
- **Decision**: Backend connects to managed Neon PostgreSQL; no local PersistentVolumeClaim
- **Rationale**: Simplifies deployment, removes local storage complexity, leverages managed database
- **Implications**: Requires Neon database provisioned and network accessible from Minikube

**AD-004: ConfigMap + Secret Injection (NO Hardcoding)**
- **Decision**: All configuration via Kubernetes ConfigMap (non-secret) and Secret (sensitive) resources
- **Rationale**: Separates configuration from code, enables runtime updates without image rebuild
- **Implications**: Requires Kubernetes Secret creation procedure (documented in quickstart)

**AD-005: ClusterIP Service Type (Internal DNS)**
- **Decision**: Frontend and backend communicate via Kubernetes service DNS names (ClusterIP type)
- **Rationale**: Pod-stable communication (pod IPs ephemeral), Kubernetes-native service discovery
- **Implications**: Requires service DNS resolution verification in pod communication tests

**AD-006: kubectl-ai & kagent Integration**
- **Decision**: Demonstrate AI-assisted DevOps tools for deployment inspection and debugging
- **Rationale**: Shows practical AI application to infrastructure, differentiates Phase IV delivery
- **Implications**: Requires documentation of 3+ real use cases, integration with deployment workflows

---

## Complexity Tracking

| Aspect | Complexity | Justification |
|--------|-----------|---------------|
| **Minikube Requirement** | Local only | Phase IV Constitution mandates Minikube (no cloud); simplifies testing, enables fast iteration |
| **Two Separate Charts** | Two Helm charts | Frontend and backend have different configuration, deployable independently, enables modularity |
| **ConfigMap + Secret** | Dual injection pattern | Security requirement (no hardcoding) and configuration flexibility mandate separate patterns |
| **Non-Root Containers** | Security hardening | Phase IV Constitution requires non-root users; adds dockerfile complexity but essential |
| **Multi-Stage Builds** | Build complexity | Reduces image size and attack surface; minor dockerfile complexity for significant benefit |
| **Health Probe Configuration** | Helm templating | Liveness/readiness probes required per spec; must be templated in Helm (not hardcoded) |

---

## Risks & Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|-----------|
| Phase III code accidentally modified | Phase IV failure | Low | Constitution enforcement, git diff verification pre-commit |
| Docker images contain hardcoded secrets | Security violation | Low | Image inspection script, environment variable audit |
| Helm charts misconfigured | Pod startup failure | Medium | `helm lint` validation, `helm install --dry-run` preview |
| Pod DNS resolution fails | Pod-to-pod communication failure | Low | Network policy verification, DNS resolution testing |
| Kubernetes Secret not properly created | Backend initialization failure | Medium | Documentation with clear secret creation steps, startup logging |
| kubectl-ai or kagent not available | AI-DevOps integration incomplete | Medium | Clear installation instructions, fallback kubectl commands documented |
| Health endpoints not implemented in Phase III | Probe failures | Low | Assumption validation early; add stub endpoints if needed (careful code freeze) |
| Minikube resource exhaustion | Pod eviction, cluster instability | Medium | Resource request/limit configuration, documentation on Minikube sizing |

---

## Success Criteria

Implementation is successful when:

1. ✅ Both Dockerfiles build without errors, images are under 500MB
2. ✅ Images run as non-root users (UID >= 1000)
3. ✅ No hardcoded secrets found in Dockerfiles or image inspection
4. ✅ Both Helm charts pass `helm lint` with no warnings
5. ✅ `helm install` completes successfully in <60 seconds
6. ✅ Both pods reach "Running" state within 30 seconds
7. ✅ Services have valid ClusterIP addresses and DNS names
8. ✅ Health check endpoints respond with HTTP 200
9. ✅ Frontend resolves backend via `backend-service:8000` DNS name
10. ✅ Chatbot responds to test message via deployed backend
11. ✅ kubectl-ai generates 3+ useful kubectl commands
12. ✅ kagent successfully diagnoses pod issues from logs
13. ✅ New user deploys app in <10 minutes from README
14. ✅ Phase III functionality unchanged (chatbot, task CRUD work)
15. ✅ All tasks from `/sp.tasks` completed with passing acceptance criteria

---

## Next Steps

1. **Phase 0 Complete**: This plan assumes all specification requirements are concrete; no research delays expected
2. **Phase 1 Complete**: Design architecture documented above; ready for task generation
3. **Proceed to `/sp.tasks`**: Generate specific implementation tasks with acceptance criteria
4. **Begin Implementation**: Execute tasks in dependency order (Dockerfiles → Helm → Integration → Validation)

---

## Document References

- **Specification**: `specs/004-minikube-deployment/spec.md`
- **Constitution**: `.specify/memory/phase-4/constitution.md`
- **Quality Checklist**: `specs/004-minikube-deployment/checklists/requirements.md`
- **Phase 3 Reference**: `.specify/memory/phase-3/constitution.md`

---

**Plan Status**: ✅ **COMPLETE & READY FOR TASK GENERATION**

This implementation plan is constitutionally compliant, architecturally sound, and ready for `/sp.tasks` to generate specific implementation tasks with acceptance criteria.

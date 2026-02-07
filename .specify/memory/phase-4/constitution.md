<!--
================================================================================
SYNC IMPACT REPORT
================================================================================
Version Change: 0.0.0 → 4.0.0 (MAJOR - Phase 4 initialization)

Modified Principles: N/A (first version of Phase 4)

Added Sections:
- Purpose & Phase Context (Phase 4 lineage from Phase 3)
- Core Principles (12 principles specific to Kubernetes deployment)
- Kubernetes & Networking Rules (Minikube, service communication)
- Helm Enforcement (mandatory charts for frontend/backend)
- Database Handling Rules (persistence, no schema changes)
- AI-Assisted DevOps Requirement (kubectl-ai, kagent tools)
- Validation & Acceptance Criteria (functional parity, operational validation)
- Explicitly Forbidden Actions (cloud deployment, code changes)
- Governance (version control, amendment procedure)

Removed Sections: N/A (new document, extends Phase 3)

Templates Requiring Updates:
- .specify/templates/plan-template.md: ⚠ Review for Phase 4 DevOps/Helm requirements
- .specify/templates/spec-template.md: ⚠ Review for Phase 4 infrastructure specs
- .specify/templates/tasks-template.md: ⚠ Review for Phase 4 deployment task structure

Follow-up TODOs:
- Create Phase 4 specs folder structure when first feature is specified
- Define Dockerfile specifications for frontend and backend
- Define Helm chart structure and values configuration
- Create Minikube deployment runbook
- Define kubectl-ai and kagent usage guidelines
================================================================================
-->

# Phase 4 Constitution

## Local Kubernetes Deployment using Minikube & Helm

**Version**: 4.0.0 | **Ratified**: 2026-01-08 | **Last Amended**: 2026-01-08

---

## Purpose & Phase Context

This constitution governs **Phase 4** of the Todo application.

### Phase Lineage

- **Phase 1** (CLI In-Memory Todo App): ✅ Complete, frozen, unchanged
- **Phase 2** (Full-Stack Web App): ✅ Complete, working, MUST remain functional
- **Phase 3** (AI Chatbot Layer): ✅ Complete, verified, MUST remain functional
- **Phase 4** (Local Kubernetes Deployment): 🚧 Current phase

### Phase 4 Objective

Deploy the completed Phase III AI Todo Chatbot onto a **local Kubernetes cluster (Minikube)** using **Helm charts** for orchestration. This phase focuses **EXCLUSIVELY on infrastructure, containerization, and orchestration** with **ZERO application code changes**.

### Inheritance & Non-Negotiable Rule

This constitution **EXTENDS** Phase 3. All Phase 3 principles remain in full effect:
- AI chatbot conversational interface
- MCP-based tool integration
- Stateless backend architecture
- User isolation and security
- OpenAI Agents SDK integration
- Natural language processing

**Reference**: `.specify/memory/phase-3/constitution.md`

**CRITICAL**: Phase IV is **INFRASTRUCTURE ONLY**. Any attempt to change application logic, add features, or modify Phase III code **automatically fails the phase**.

---

## Core Principles

### Principle 0: Application Code Freeze (SUPREME RULE)

Phase 4 is **PURE INFRASTRUCTURE**, not application development:

**✅ Allowed**:
- Creating Dockerfiles
- Writing Helm charts
- Configuring Kubernetes resources
- Injecting configuration via environment variables
- Adjusting deployment replicas or resource requests

**❌ STRICTLY FORBIDDEN**:
- Modifying Phase 3 application code
- Changing API endpoints or schemas
- Altering database schema
- Adding new features or endpoints
- Refactoring business logic
- Optimizing or cleaning up code
- Changing authentication flow
- Adding new libraries or dependencies (to application code)

**Validation Test**:
```bash
# Disable Kubernetes/Helm deployment → Phase 3 app runs identically
python -m uvicorn backend.main:app --reload
# Must work exactly as before
```

**Rationale**:
- Demonstrates infrastructure competency separately from application logic
- Prevents scope creep and feature bloat
- Preserves Phase III's verified, working state
- Keeps focus on DevOps excellence

**Violation = Automatic Phase 4 Failure**

---

### Principle I: Minikube ONLY (NO CLOUD)

**✅ Deployment Target**:
- Local Minikube cluster on developer's machine
- `minikube start` initiates deployment
- All pods run on local machine

**❌ STRICTLY FORBIDDEN**:
- AWS (EKS, EC2, RDS, etc.)
- Google Cloud (GKE, Cloud Run, etc.)
- Azure (AKS, Azure Container Instances, etc.)
- DigitalOcean Kubernetes
- Heroku, Vercel, Fly.io
- Any managed Kubernetes service
- Any public cloud infrastructure

**Configuration**:
```bash
# ONLY this approach is allowed:
minikube start --driver=docker  # or hyperkit, virtualbox
kubectl config use-context minikube
helm repo add <name> <url>
helm install <release> <chart>
```

**Validation Test**:
```bash
minikube status
# output: host: Running
#         kubelet: Running
#         apiserver: Running
```

**Rationale**:
- Local development and testing
- No cloud costs or billing
- Full control of infrastructure
- Demonstrates Kubernetes fundamentals
- Reproducible on any developer machine

---

### Principle II: Spec-First Infrastructure (MANDATORY)

**No Dockerfile, Helm chart, or Kubernetes YAML may be written without an explicit approved specification.**

**Workflow MUST be**:
```
Specify → Plan → Tasks → Implement
```

**Requirements**:
1. Create specification for infrastructure feature
2. Get spec reviewed and approved
3. Create implementation plan from spec
4. Break plan into actionable tasks
5. Only then implement

**Forbidden**:
- Writing Helm charts without spec
- Creating Dockerfiles without spec
- Manual Kubernetes YAML without spec
- "Quick" infrastructure changes
- Skipping documentation

**Rationale**:
- Infrastructure as code principles
- Traceability and reproducibility
- Clear acceptance criteria before building
- Enables debugging and iteration

---

### Principle III: Helm is Mandatory

**Raw Kubernetes YAML alone is insufficient.**

**Required**:
- **Frontend Helm Chart** at `helm/frontend/`
- **Backend Helm Chart** at `helm/backend/`

**Helm Chart Requirements**:
```
helm/
├── frontend/
│   ├── Chart.yaml
│   ├── values.yaml
│   ├── templates/
│   │   ├── deployment.yaml
│   │   ├── service.yaml
│   │   └── configmap.yaml
│   └── README.md
└── backend/
    ├── Chart.yaml
    ├── values.yaml
    ├── templates/
    │   ├── deployment.yaml
    │   ├── service.yaml
    │   ├── configmap.yaml
    │   └── secret.yaml  (optional, for secrets)
    └── README.md
```

**Helm Values MUST Control**:
- Container image name and tag
- Environment variables
- Service port numbers
- Replica counts
- Resource requests/limits
- Database connection strings
- API keys (via secrets)

**Helm Installation**:
```bash
helm install frontend helm/frontend --values helm/frontend/values.yaml
helm install backend helm/backend --values helm/backend/values.yaml
```

**Rationale**:
- Industry-standard package manager for Kubernetes
- Enables templating and reuse
- Version management of deployments
- Easy configuration management
- Reproducible deployments

---

### Principle IV: No Kubernetes YAML Manual Coding

**All Kubernetes resource definitions MUST be generated or templated, never hand-written.**

**Forbidden Approach**:
```bash
# ❌ Manual YAML creation
kubectl create deployment frontend --image=myimage --dry-run=client -o yaml > deployment.yaml
```

**Correct Approach**:
- Use Helm chart templates
- Use `helm template` to validate
- Use `helm install --dry-run` to preview
- All YAML lives in `helm/*/templates/`

**AI-Assisted Tools**:
- `kubectl-ai`: AI-powered kubectl assistance
- `kagent`: Kubernetes-aware AI agent
- Use these to generate Helm values, not raw YAML

**Rationale**:
- Helm templating provides consistency
- Reduces manual errors
- Enables environment-specific configurations
- Supports configuration inheritance

---

### Principle V: Service-Based Communication (NO localhost)

**Pod-to-pod communication MUST use Kubernetes service names, NOT localhost.**

**❌ Wrong** (Pod-to-pod):
```python
# Backend pod connecting to database
db_url = "localhost:5432"  # ❌ WRONG - won't work across pods
```

**✅ Correct** (Service DNS):
```python
# Backend pod connecting to database service
db_url = "postgres-service:5432"  # ✅ Kubernetes DNS resolution
```

**Frontend-to-Backend Communication**:
```javascript
// ❌ WRONG
const API_URL = "http://localhost:8000";

// ✅ CORRECT
const API_URL = "http://backend-service:8000";  // Kubernetes service name
```

**Service Types**:
- **ClusterIP** (default): Internal cluster communication only
- **NodePort**: Expose service on all node IPs (for Minikube access)
- **LoadBalancer** (not needed for Minikube)

**Example Service Definition** (in Helm template):
```yaml
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
```

**Validation Test**:
```bash
# From frontend pod, resolve backend service
kubectl exec -it <frontend-pod> -- nslookup backend-service
# Must resolve to cluster IP
```

**Rationale**:
- Kubernetes-native service discovery
- Pod IPs are ephemeral; service names are stable
- Enables pod scaling and replacement
- Best practice for cloud-native apps

---

### Principle VI: Deployment Standards

**Each service MUST use a Kubernetes Deployment resource (not raw pods).**

**Required for Each Service**:
1. **Deployment**: Pod template, replicas, selector
2. **Service**: Expose pods internally or externally
3. **ConfigMap**: Non-secret configuration (environment variables, config files)
4. **Secret** (optional): Sensitive data (API keys, passwords)

**Deployment Replicas**:
- **Must be configurable** via Helm values
- Default: 1 replica for Minikube (low resource usage)
- Scalable: `helm upgrade --set replicaCount=3`

**Pod Selector Labels** (REQUIRED):
```yaml
# deployment.yaml
spec:
  selector:
    matchLabels:
      app: backend
      version: v1
  template:
    metadata:
      labels:
        app: backend
        version: v1
```

**Rationale**:
- Enables automatic pod restart on failure
- Rolling updates for zero-downtime deployments
- Horizontal scaling capability
- Self-healing infrastructure

---

### Principle VII: Configuration Injection (NO Hardcoding)

**ABSOLUTELY NO secrets, URLs, or environment values may be hardcoded in Docker images.**

**❌ FORBIDDEN** (In Dockerfile or application code):
```dockerfile
# ❌ WRONG - Hardcoded secrets in image
ENV OPENAI_API_KEY=sk-...
ENV DATABASE_URL=postgres://user:pass@localhost:5432/todo
```

**✅ CORRECT** (Injected via Helm):
```yaml
# helm/backend/templates/deployment.yaml
spec:
  containers:
  - name: backend
    env:
    - name: OPENAI_API_KEY
      valueFrom:
        secretKeyRef:
          name: openai-secret
          key: api-key
    - name: DATABASE_URL
      valueFrom:
        configMapKeyRef:
          name: backend-config
          key: database-url
```

**Configuration Sources** (Ordered by sensitivity):
1. **Secrets**: API keys, passwords, tokens (Kubernetes Secrets or Sealed Secrets)
2. **ConfigMaps**: URLs, service endpoints, feature flags
3. **Default values.yaml**: Non-sensitive defaults

**Helm values.yaml Example**:
```yaml
backend:
  image: myregistry/backend:latest
  replicas: 1
  env:
    DATABASE_URL: "postgres://postgres-service:5432/todo"
    LOG_LEVEL: "info"
  secrets:
    openaiApiKey: ""  # Inject via --set or secrets file
```

**Deployment**:
```bash
# Create secret
kubectl create secret generic openai-secret \
  --from-literal=api-key=$OPENAI_API_KEY

# Install chart (refs secret and ConfigMap)
helm install backend helm/backend
```

**Rationale**:
- Secrets never stored in images
- Supports different configurations per environment
- Security best practice
- Enables credential rotation

---

### Principle VIII: Database Persistence (Schema FROZEN)

**Database schema MUST remain unchanged from Phase 3.**

**✅ Allowed**:
- Persistent volumes for database data
- Volume claims for pod storage
- Configuration of database connection pooling
- Backup strategies

**❌ STRICTLY FORBIDDEN**:
- ALTER TABLE statements
- Adding new tables (except Phase 4 infrastructure tables)
- Modifying existing table schemas
- Changing column types or constraints
- Adding/removing indexes

**Persistent Storage Configuration**:
```yaml
# helm/backend/templates/postgres-pvc.yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: postgres-pvc
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 10Gi
```

**For Phase 3 Database (PostgreSQL)**:
```bash
# Initialize or migrate database (before pod deployment)
helm run-job migration --image=backend:latest

# Connection string (via service DNS)
DATABASE_URL=postgres://user:pass@postgres-service:5432/todo
```

**For SQLite (if used)**:
```yaml
# Mount volume for SQLite file
volumeMounts:
- name: sqlite-storage
  mountPath: /data
volumes:
- name: sqlite-storage
  emptyDir: {}  # or persistentVolumeClaim
```

**Validation Test**:
```bash
# Data persists across pod restart
kubectl delete pod <backend-pod>
# Pod restarts, data still exists
```

**Rationale**:
- Preserves Phase 3 data integrity
- No application logic changes required
- Kubernetes-native storage management

---

### Principle IX: Dockerfile Standards

**Dockerfiles MUST**:
- Use minimal base images (Alpine, Debian slim)
- Run as non-root user
- Minimize layer count
- Avoid secrets in layers
- Be optimized for caching

**Example Frontend Dockerfile**:
```dockerfile
# Multi-stage build
FROM node:18-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json .
RUN npm ci
COPY . .
RUN npm run build

# Production image
FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json .
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001
USER nextjs
EXPOSE 3000
CMD ["node", ".next/standalone/server.js"]
```

**Example Backend Dockerfile**:
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
RUN useradd -m -u 1001 appuser
USER appuser
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**Build & Push**:
```bash
# Local testing (no registry needed for Minikube)
docker build -t backend:latest backend/
docker build -t frontend:latest frontend/

# Configure Minikube to use local images
eval $(minikube docker-env)
docker build -t backend:latest backend/
docker build -t frontend:latest frontend/
```

**Rationale**:
- Non-root users for security
- Multi-stage builds reduce image size
- Local image reuse in Minikube
- Fast iteration on development

---

### Principle X: Health Checks & Readiness

**Each pod MUST expose health check endpoints and readiness probes.**

**Backend Example**:
```python
# backend/main.py
@app.get("/health")
def health_check():
    return {"status": "ok", "service": "todo-backend"}

@app.get("/ready")
def readiness_check():
    # Verify database connection, etc.
    try:
        db.execute("SELECT 1")
        return {"ready": True}
    except:
        return {"ready": False}, 503
```

**Helm Template** (deployment.yaml):
```yaml
containers:
- name: backend
  livenessProbe:
    httpGet:
      path: /health
      port: 8000
    initialDelaySeconds: 10
    periodSeconds: 10
  readinessProbe:
    httpGet:
      path: /ready
      port: 8000
    initialDelaySeconds: 5
    periodSeconds: 5
```

**Frontend Example**:
```javascript
// frontend/pages/api/health.js
export default function handler(req, res) {
  res.status(200).json({ status: "ok", service: "todo-frontend" });
}
```

**Validation Test**:
```bash
kubectl get pods
# Pods should show 1/1 Ready and Running status
kubectl describe pod <pod-name>
# Liveness/readiness probes should show success
```

**Rationale**:
- Kubernetes automatically restarts failed pods
- Load balancers only route to ready pods
- Enables graceful rollouts
- Production-grade reliability

---

### Principle XI: AI-Assisted DevOps Tools (MUST DEMONSTRATE)

**Phase 4 MUST demonstrate AI-powered Kubernetes tooling.**

**Required Tools**:

**1. kubectl-ai**
- AI-powered `kubectl` plugin
- Generates kubectl commands from natural language
- Installation: `kubectl krew install ai`
- Example usage:
```bash
kubectl ai "Show me all pods in the default namespace"
kubectl ai "Create a deployment with 3 replicas"
kubectl ai "Debug pod connectivity issues"
```

**2. kagent or k8s-copilot**
- Kubernetes-aware AI agent
- Provides deployment recommendations
- Example usage:
```bash
kagent suggest improvements
kagent diagnose issues
kagent help with scaling
```

**Usage Requirements**:
- Use AI tools for at least 3 DevOps tasks (debugging, optimization, troubleshooting)
- Document usage in Phase 4 documentation
- Record usage in task history

**Forbidden**:
- Using AI just for show; must solve real problems
- AI tools cannot replace human understanding
- Must validate AI suggestions before applying

**Rationale**:
- Demonstrates AI application to infrastructure
- Shows practical use of AI assistants
- Reduces manual kubectl command writing
- Bridges AI/DevOps skills

---

### Principle XII: Reproducibility (Anyone Can Deploy)

**A new user with no prior setup MUST be able to deploy the app in under 10 minutes.**

**Required Artifacts**:
1. **README.md** with step-by-step instructions
2. **Minikube Setup Guide** (installing Minikube, Docker)
3. **Helm Installation Steps** (exact commands)
4. **Validation Checklist** (verify everything works)

**Example README Section**:
```markdown
## Quick Start

### Prerequisites
- Minikube installed (`brew install minikube`)
- Helm installed (`brew install helm`)
- Docker Desktop running (or Docker daemon)

### Deployment
1. Start Minikube: `minikube start --driver=docker`
2. Clone repo: `git clone <url>`
3. Install charts: `helm install frontend helm/frontend && helm install backend helm/backend`
4. Port forward: `kubectl port-forward svc/frontend-service 3000:3000`
5. Access app: Open http://localhost:3000

### Verification
- Check pods: `kubectl get pods` → All should be Running
- Check services: `kubectl get svc` → Services should have CLUSTER-IP
- Check logs: `kubectl logs -f <pod-name>` → No errors
```

**Validation Script**:
```bash
#!/bin/bash
echo "Checking Minikube..."
minikube status || exit 1

echo "Checking Helm releases..."
helm list || exit 1

echo "Checking pods..."
kubectl get pods -o wide || exit 1

echo "✅ All systems operational"
```

**Rationale**:
- Hackathon judges need easy deployment
- Reduces setup friction
- Demonstrates DevOps maturity
- Enables rapid feedback cycles

---

## Dockerfile Specification

### Frontend Dockerfile Location
- **Path**: `frontend/Dockerfile`
- **Base Image**: `node:18-alpine` or lighter
- **Build Args**: None (all config via Helm)

### Backend Dockerfile Location
- **Path**: `backend/Dockerfile`
- **Base Image**: `python:3.11-slim` or lighter
- **Build Args**: None (all config via Helm)

### Build & Deploy Process
```bash
# 1. Build images locally (Minikube Docker environment)
eval $(minikube docker-env)
docker build -t frontend:latest frontend/
docker build -t backend:latest backend/

# 2. Deploy via Helm (images already in Minikube)
helm install frontend helm/frontend
helm install backend helm/backend

# 3. Verify pods running
kubectl get pods -w
```

---

## Validation & Acceptance Criteria

Phase 4 is considered **COMPLETE** when **ALL** criteria are met:

### Functional Requirements
- [ ] Frontend pod starts and runs successfully
- [ ] Backend pod starts and runs successfully
- [ ] Service endpoints are accessible from pods
- [ ] Application behavior matches Phase 3 exactly
- [ ] AI chatbot works via Kubernetes-deployed backend
- [ ] Task CRUD operations work via deployed services
- [ ] All 5 MCP tools function correctly in Kubernetes

### Infrastructure Requirements
- [ ] Minikube cluster is running
- [ ] Both pods reach "Running" state
- [ ] Health checks pass (livenessProbe, readinessProbe)
- [ ] Services are created and have ClusterIP
- [ ] Frontend can resolve backend service by DNS name
- [ ] Persistent volumes are mounted and data persists

### Helm & Configuration
- [ ] Frontend Helm chart exists and installs cleanly
- [ ] Backend Helm chart exists and installs cleanly
- [ ] No errors during `helm install`
- [ ] Replicas configurable via `helm upgrade --set`
- [ ] Environment variables injected correctly
- [ ] No secrets hardcoded in Docker images

### Dockerfiles
- [ ] Frontend Dockerfile builds without errors
- [ ] Backend Dockerfile builds without errors
- [ ] Images run as non-root users
- [ ] Images minimal and optimized
- [ ] No secrets stored in image layers

### Deployment Process
- [ ] Documented deployment steps in README
- [ ] New user can deploy app in < 10 minutes
- [ ] Validation checklist provided
- [ ] Port forwarding instructions clear
- [ ] Health check endpoints working

### AI-Assisted DevOps
- [ ] kubectl-ai installed and used for >= 3 tasks
- [ ] kagent or k8s-copilot integrated
- [ ] AI tool usage documented with examples
- [ ] Troubleshooting guide includes AI tool usage

### Phase 3 Preservation (CRITICAL)
- [ ] Phase 3 application code unchanged
- [ ] No new features added
- [ ] No application dependencies added
- [ ] Database schema unchanged
- [ ] Authentication flow unchanged
- [ ] API endpoints unchanged
- [ ] MCP tools function identically

### Documentation & Traceability
- [ ] Constitution exists at `.specify/memory/phase-4/constitution.md`
- [ ] Specifications exist in `/specs/phase-4/` (Dockerfiles, Helm charts)
- [ ] Plans exist for all Phase 4 features
- [ ] Tasks exist for all Phase 4 implementation
- [ ] Prompt history recorded in `history/prompts/`
- [ ] README updated with Phase 4 instructions

### Security & Best Practices
- [ ] No hardcoded secrets in code or images
- [ ] All sensitive data via Kubernetes Secrets
- [ ] Pods run as non-root users
- [ ] Resource limits configured
- [ ] Network policies consider (if needed)

---

## Explicitly Forbidden Actions

The following actions are **STRICTLY PROHIBITED** in Phase 4:

### Cloud Deployment (AUTOMATIC FAILURE)
- ❌ Deploying frontend to Vercel
- ❌ Deploying backend to HuggingFace
- ❌ Using AWS, GCP, Azure, or any cloud provider
- ❌ Using managed Kubernetes (EKS, GKE, AKS)
- ❌ Pushing to Heroku, Fly.io, Railway, or similar

### Application Code Changes (AUTOMATIC FAILURE)
- ❌ Modifying Phase 3 application code
- ❌ Adding new features or endpoints
- ❌ Refactoring business logic
- ❌ Changing authentication mechanisms
- ❌ Altering database schema
- ❌ Adding new dependencies to application code

### Infrastructure Anti-Patterns
- ❌ Hardcoding secrets in Docker images
- ❌ Hardcoding URLs or configuration in code
- ❌ Using `localhost` for pod-to-pod communication
- ❌ Running containers as root user
- ❌ Using raw Kubernetes YAML (must use Helm)
- ❌ Manual pod creation without Deployment controller
- ❌ Skipping health checks and readiness probes

### Development Process Violations
- ❌ Writing Dockerfile/Helm chart without specification
- ❌ Skipping infrastructure planning phase
- ❌ Implementing without approved tasks
- ❌ Committing code without testing
- ❌ Deploying without validation against criteria
- ❌ Manual coding without SDD workflow

**Rationale**: Any of these violations would either break Phase 3 functionality or violate the scope-lock of Phase 4 as an infrastructure-only phase.

---

## Governance

### Version & Authority

**Version**: 4.0.0
**Type**: MAJOR (new phase)
**Ratified**: 2026-01-08
**Last Amended**: 2026-01-08

**Inherits From**: Phase 3 Constitution v3.0.0
**Reference**: `.specify/memory/phase-3/constitution.md`

### Hierarchy of Authority

```
Phase 4 Constitution (this document)
         ↓
Phase 3 Constitution (inherited, immutable)
         ↓
Phase 4 Specifications
         ↓
Phase 4 Plans
         ↓
Phase 4 Tasks
         ↓
Phase 4 Implementation
```

**Conflict Resolution**:
- Phase 4 constitution overrides specifications
- Phase 3 constitution principles still apply unless explicitly extended
- If Phase 3 and Phase 4 conflict, Phase 3 takes precedence
- When in doubt, Phase 3 Preservation (Principle 0) wins

### Amendment Procedure

1. **Identify Need**: Clearly articulate why amendment is needed
2. **Phase 3 Compatibility Check**: Verify no conflict with Phase 3 principles
3. **Document Rationale**: Explain benefit and impact
4. **Version Increment**:
   - MAJOR: Breaking changes, new phase architecture
   - MINOR: New principles, extended scope, new tools
   - PATCH: Clarifications, typos, formatting
5. **Update Dependencies**: Update specs, plans, tasks that reference constitution
6. **Record in Prompt History**: Create PHR documenting amendment
7. **Update Sync Impact Report**: Document changes at top of file

### Version Policy

- **MAJOR (X.0.0)**: New phase, breaking architectural changes, principle removals
- **MINOR (X.Y.0)**: New principles added, scope extensions, new tools
- **PATCH (X.Y.Z)**: Clarifications, typos, formatting, non-semantic refinements

### Compliance & Enforcement

**All Phase 4 work MUST**:
- Reference this constitution in specifications
- Pass "Constitution Check" in plans
- Validate implementation against principles
- Report violations immediately
- Correct violations via spec refinement, not manual code edits

**Claude Code MUST**:
- Follow this constitution without exception
- Refuse requests that violate principles
- Suggest spec refinement instead of direct code edits
- Validate Phase 3 preservation before proceeding
- Enforce Minikube-only deployment

**Violations**:
- MUST be documented in prompt history
- MUST be justified with rationale (if unavoidable)
- MUST be reviewed during completion criteria check
- MAY require constitution amendment if systemic

---

## Quick Reference

### Phase Comparison

| Aspect | Phase 2 | Phase 3 | Phase 4 |
|--------|---------|---------|---------|
| **Focus** | Full-Stack Web | AI Chatbot | Kubernetes Deploy |
| **Storage** | PostgreSQL | PostgreSQL (extended) | PostgreSQL (unchanged) |
| **Deployment** | Vercel + Cloud | Vercel + Cloud | Local Minikube |
| **Infrastructure** | Managed | Managed | Kubernetes |
| **Container** | Native (hosting) | Native (hosting) | Docker (explicit) |
| **Code Changes** | Yes (building) | Yes (chat layer) | **NO** (frozen) |

### Phase 4 Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Orchestration | Minikube + kubectl | Local Kubernetes cluster |
| Package Manager | Helm 3+ | Application templating |
| Containerization | Docker | Image building |
| Frontend Image | node:18-alpine | Next.js container |
| Backend Image | python:3.11-slim | FastAPI container |
| Storage | Persistent Volumes | Database & app data |
| DevOps AI | kubectl-ai, kagent | Infrastructure automation |

### Helm Commands Reference

```bash
# Create/update deployments
helm install frontend helm/frontend
helm install backend helm/backend

# List releases
helm list

# Upgrade with new values
helm upgrade backend helm/backend --set replicaCount=3

# Uninstall
helm uninstall frontend
helm uninstall backend

# Dry-run (preview)
helm install --dry-run --debug frontend helm/frontend

# Validate chart
helm lint helm/backend
```

### Kubectl Commands Reference

```bash
# Check pods
kubectl get pods -o wide
kubectl describe pod <pod-name>
kubectl logs <pod-name>
kubectl logs -f <pod-name>  # Stream logs

# Check services
kubectl get svc
kubectl describe svc <service-name>

# Port forwarding (access from local machine)
kubectl port-forward svc/frontend-service 3000:3000
kubectl port-forward svc/backend-service 8000:8000

# Health checks
kubectl get pods
# Check READY and STATUS columns

# Troubleshooting
kubectl get events
kubectl debug <pod-name>
```

---

## Document Metadata

**Document Type**: Constitution
**Scope**: Phase 4 (Kubernetes Deployment)
**Stability**: Stable (deployment-ready)
**Audience**: AI assistants (Claude Code), DevOps engineers, hackathon judges
**Supersedes**: None (extends Phase 3)
**Related Documents**:
- `.specify/memory/constitution.md` (Phase 1)
- `.specify/memory/phase-2/constitution.md` (Phase 2)
- `.specify/memory/phase-3/constitution.md` (Phase 3)
- `/specs/phase-4/` (Phase 4 specifications, to be created)

---

*This constitution is the supreme authority for Phase 4 development. It extends but does not replace Phase 3. All Phase 4 work must comply with both this document and the Phase 3 constitution. Phase 4 is INFRASTRUCTURE ONLY — no application code changes allowed.*

**🎯 Core Mission: Deploy the verified Phase III app to local Kubernetes WITHOUT modifying application code.**

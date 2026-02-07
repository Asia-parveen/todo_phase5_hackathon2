# Phase 4: Minikube Deployment on Windows 11 - Complete Guide

**Project**: Phase 3 AI Todo Chatbot (Next.js frontend + FastAPI backend + Neon DB)
**Target**: Local Kubernetes (Minikube) with Hyper-V on Windows 11 Pro
**Date**: 2026-01-08
**Status**: Step-by-step executable guide

---

## Table of Contents
1. [Prerequisites Verification](#prerequisites-verification)
2. [Windows Environment Setup](#windows-environment-setup)
3. [Minikube Startup](#minikube-startup)
4. [Docker Context Configuration](#docker-context-configuration)
5. [Build Docker Images](#build-docker-images)
6. [Deploy with Helm](#deploy-with-helm)
7. [Verification & Testing](#verification--testing)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites Verification

**Why**: Confirms all required tools are installed and accessible before proceeding.

### Step 1.1: Check Tool Versions in PowerShell (Run as Administrator)

```powershell
# Run in PowerShell (Admin) - required for Hyper-V and Minikube operations
Write-Host "=== PREREQUISITE CHECK ===" -ForegroundColor Cyan

# Check Minikube
minikube version
# Expected: minikube version: v1.37.0 (or later)

# Check Helm
helm version
# Expected: version.BuildInfo{Version:"v4.0.3", ...}

# Check kubectl
kubectl version --client
# Expected: Client Version: v1.x.x

# Check Docker
docker version
# Expected: Docker version 29.1.3

# Verify Hyper-V is enabled
Get-WindowsFeature Hyper-V | Format-Table Name, InstallState
# Expected: Hyper-V | Installed
```

**Success Indicators:**
- ✅ All tools show versions above
- ✅ Hyper-V shows "Installed"
- ✅ No "command not found" errors

---

## Windows Environment Setup

**Why**: Windows requires explicit PATH setup and PowerShell execution policy to run Minikube commands. CMD cannot access Minikube properly due to PATH limitations and Hyper-V permissions.

### Step 2.1: Set Execution Policy in PowerShell (Admin)

```powershell
# Allow scripts to run (required for Minikube initialization)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force
Write-Host "Execution policy set to RemoteSigned" -ForegroundColor Green
```

**Why**: Minikube initialization scripts require script execution. RemoteSigned allows scripts from your computer but requires signed scripts from internet.

### Step 2.2: Verify PATH Includes Minikube and Helm

```powershell
# Check if Minikube and Helm are in PATH
$env:PATH -split ";" | Where-Object { $_ -like "*Minikube*" -or $_ -like "*Helm*" }

# If no output, manually add to PATH (temporary session)
$env:PATH += ";C:\ProgramData\chocolatey\bin"

# Verify again
minikube --version
helm version --short
```

**Why**: Windows PATH determines where executables are found. Chocolatey installs to `C:\ProgramData\chocolatey\bin`, which may not be in initial PATH.

### Step 2.3: Navigate to Project Folder (Important for Helm)

```powershell
# Change to project directory
cd F:\todo-phase4-hackathon2

# Verify current location
Write-Host "Current directory: $(Get-Location)" -ForegroundColor Cyan

# List to confirm Dockerfiles and Helm charts exist
ls backend/Dockerfile
ls frontend/Dockerfile
ls helm/backend/Chart.yaml
ls helm/frontend/Chart.yaml
```

**Why**: Helm charts are relative to project folder. Running Helm commands from project root ensures correct paths.

---

## Minikube Startup

**Why**: Minikube creates a local single-node Kubernetes cluster. Hyper-V is the recommended driver on Windows Pro with hardware virtualization.

### Step 3.1: Stop Any Running Minikube Instance

```powershell
# Check current status
minikube status
# Expected: if running, shows "host: Running", "kubelet: Running", etc.

# Stop if running (prevents port/resource conflicts)
minikube stop
Write-Host "Minikube stopped" -ForegroundColor Green
```

**Why**: Ensures clean state. Multiple Minikube instances cause port conflicts and resource exhaustion.

### Step 3.2: Start Minikube with Hyper-V Driver

```powershell
# Start Minikube with explicit Hyper-V driver
# This may take 30-60 seconds on first run
minikube start --driver=hyperv --cpus=4 --memory=4096 --disk-size=20gb

# Expected output:
# 😄  minikube v1.37.0 on Windows 11 (amd64)
# ✨  Using the hyperv driver based on user configuration
# 🔄  Updating VM ...
# 🎉  minikube cluster started successfully!
```

**Why**:
- `--driver=hyperv`: Uses Hyper-V (not VirtualBox or Docker Desktop) as virtualization
- `--cpus=4`: Allocates 4 CPU cores to Minikube VM (adjust to your system)
- `--memory=4096`: Allocates 4GB RAM to Minikube VM (adjust to your system)
- `--disk-size=20gb`: Allocates 20GB disk space for container images

### Step 3.3: Verify Minikube Cluster Status

```powershell
# Get cluster status
minikube status
# Expected output:
# minikube
# type: Control Plane
# host: Running
# kubelet: Running
# apiserver: Running
# kubeconfig: Configured

# Get cluster info
kubectl cluster-info
# Expected: Kubernetes master is running at https://192.168.x.x:8443

# Check nodes
kubectl get nodes
# Expected: 1 node (minikube) with STATUS Ready
```

**Success Indicators:**
- ✅ `minikube status` shows all components "Running"
- ✅ `kubectl get nodes` shows minikube node in "Ready" state
- ✅ `kubectl cluster-info` shows Kubernetes master running

---

## Docker Context Configuration

**Why**: Docker Desktop Linux engine (default) cannot access Minikube's internal Docker daemon. You must switch Docker context to use Minikube's Docker engine, which has direct access to its internal registry and container runtime.

### Step 4.1: Evaluate Minikube Docker Environment Variables

```powershell
# This command sets environment variables to connect to Minikube's Docker daemon
$minikubeDockerEnv = minikube docker-env --shell=powershell

# Display what will be set (for understanding)
Write-Host "Minikube Docker environment variables:" -ForegroundColor Cyan
$minikubeDockerEnv | ForEach-Object { Write-Host $_ }

# Expected output (example):
# $Env:DOCKER_TLS_VERIFY = "1"
# $Env:DOCKER_HOST = "tcp://192.168.x.x:2376"
# $Env:DOCKER_CERT_PATH = "$Env:USERPROFILE\.minikube\certs"
# $Env:MINIKUBE_ACTIVE_DOCKERD = "minikube"
```

**Why**: These environment variables tell Docker client to connect to Minikube's Docker daemon instead of Docker Desktop.

### Step 4.2: Apply Minikube Docker Environment in Current PowerShell Session

```powershell
# Execute the environment setup (connects Docker to Minikube daemon)
minikube docker-env --shell=powershell | Invoke-Expression

# Verify Docker is now connected to Minikube
docker ps
# Expected: Lists containers from Minikube (initially empty)

# Verify Docker info shows Minikube context
docker info | Select-String "ServerVersion|Name|DockerRootDir"
# Expected output shows Minikube-related info

Write-Host "Docker context switched to Minikube" -ForegroundColor Green
```

**Why**: This switches the Docker client (in current PowerShell session) to communicate with Minikube's Docker daemon. Future `docker build` commands will run inside Minikube's container runtime.

### Step 4.3: Verify Docker Connection to Minikube

```powershell
# Create simple test container to verify connection
docker run --rm -it busybox echo "Docker is connected to Minikube!"
# Expected: Prints the echo message without errors

# Check images available in Minikube Docker
docker images
# Expected: May show some Kubernetes system images (pause, etc.)

Write-Host "Docker successfully connected to Minikube internal engine" -ForegroundColor Green
```

**Success Indicators:**
- ✅ `docker ps` returns no errors
- ✅ `docker run` test succeeds
- ✅ `docker images` shows Minikube's image registry

**Critical Note**: This Docker context switch is **session-specific**. If you open a new PowerShell, you must repeat steps 4.1-4.2. Alternatively, set permanent environment variables in Windows System Properties.

---

## Build Docker Images

**Why**: Builds containerized versions of backend and frontend applications in Minikube's Docker engine, making them available for Kubernetes deployment.

### Step 5.1: Build Backend Docker Image

```powershell
# Ensure you're still in project directory with Docker context set to Minikube
Write-Host "Building backend image..." -ForegroundColor Cyan

# Build with tag "backend:latest"
docker build -t backend:latest backend/

# Expected output (takes 1-2 minutes):
# Sending build context to Docker daemon
# Step 1/15 : FROM python:3.11-slim as builder
# ...
# Step 15/15 : CMD ["uvicorn", "app.main:app", ...]
# Successfully built <hash>
# Successfully tagged backend:latest
```

**Why**:
- `-t backend:latest`: Tags image for Minikube Helm deployment
- `backend/`: Path to Dockerfile in backend directory
- Multi-stage build optimizes final image size
- Non-root user (UID 1001) runs container for security

### Step 5.2: Verify Backend Image in Minikube Docker

```powershell
# List images in Minikube Docker
docker images | grep backend
# Expected:
# backend  latest  <hash>  <timestamp>  <size>

# Inspect image to verify non-root user
docker inspect backend:latest | Select-String -Pattern "User"
# Expected: "User": "1001" (non-root)

Write-Host "Backend image built successfully: backend:latest" -ForegroundColor Green
```

**Success Indicator**: Backend image appears in `docker images` list.

### Step 5.3: Build Frontend Docker Image

```powershell
# Build frontend image
Write-Host "Building frontend image..." -ForegroundColor Cyan

docker build -t frontend:latest frontend/

# Expected output (takes 1-2 minutes):
# Sending build context to Docker daemon
# Step 1/18 : FROM node:18-alpine as builder
# ...
# Step 18/18 : CMD ["node", "server.js"]
# Successfully built <hash>
# Successfully tagged frontend:latest
```

**Why**:
- Node.js 18-alpine provides optimized runtime
- Multi-stage build reduces final image from ~500MB to ~100MB
- Next.js standalone server optimization for Kubernetes

### Step 5.4: Verify Frontend Image

```powershell
# Verify frontend image
docker images | grep frontend
# Expected:
# frontend latest <hash>  <timestamp>  <size>

# Confirm both images present
docker images | grep -E "backend|frontend"
# Expected: 2 rows (backend and frontend)

Write-Host "Both Docker images successfully built in Minikube" -ForegroundColor Green
```

**Success Indicators:**
- ✅ Both `backend:latest` and `frontend:latest` appear in `docker images`
- ✅ Images are small (backend ~150MB, frontend ~100MB due to multi-stage builds)

---

## Deploy with Helm

**Why**: Helm packages Kubernetes deployments. Charts define Deployments (pods), Services (network access), ConfigMaps (non-secret config), and Secrets (sensitive data like API keys).

### Step 6.1: Prepare Environment Variables for Deployment

```powershell
# Create variables for sensitive configuration (Neon database)
# Read from .env file if present, otherwise use placeholder

# Check if .env exists
if (Test-Path "backend/.env") {
    $envContent = Get-Content "backend/.env"
    Write-Host "Found backend/.env file" -ForegroundColor Cyan
    $envContent | ForEach-Object { Write-Host $_ }
} else {
    Write-Host "No .env file found - will use default values" -ForegroundColor Yellow
}

# Extract DATABASE_URL and OPENAI_API_KEY (examples, adjust to your actual values)
$DATABASE_URL = "postgresql://user:password@ep-xyz.neon.tech/neondb"
$OPENAI_API_KEY = "your-actual-openai-api-key"

# Verify variables are set
Write-Host "Database URL configured: $($DATABASE_URL.Substring(0, 30))..." -ForegroundColor Cyan
Write-Host "API Key configured: $($OPENAI_API_KEY.Substring(0, 10))..." -ForegroundColor Cyan
```

**Why**: Helm deployment requires these values injected as environment variables into containers via Kubernetes Secrets and ConfigMaps.

### Step 6.2: Validate Helm Charts Before Deployment

```powershell
# Lint backend chart (checks syntax and best practices)
helm lint helm/backend/

# Expected output:
# ==> Linting helm/backend/
# [INFO] Chart.yaml: icon is missing
# [WARNING] values.yaml: unknown field "env"
# 1 chart(s) linted, 0 error(s), 1 warning(s)

Write-Host "Backend chart linted successfully" -ForegroundColor Green

# Lint frontend chart
helm lint helm/frontend/
Write-Host "Frontend chart linted successfully" -ForegroundColor Green
```

**Why**: `helm lint` validates chart structure, required fields, and syntax before deployment. Catches errors early.

### Step 6.3: Deploy Backend Helm Chart to Minikube

```powershell
# Create namespace for Phase 4 (optional but organized)
kubectl create namespace phase4 --dry-run=client -o yaml | kubectl apply -f -
Write-Host "Namespace 'phase4' ready" -ForegroundColor Cyan

# Deploy backend chart with overridden values
helm install backend helm/backend/ `
    --namespace phase4 `
    --set image.tag=latest `
    --set env.DATABASE_URL="$DATABASE_URL" `
    --set env.ENVIRONMENT="production" `
    --set env.LOG_LEVEL="info" `
    --set-string secret.OPENAI_API_KEY="$OPENAI_API_KEY"

# Expected output:
# NAME: backend
# LAST DEPLOYED: Wed Jan 08 14:30:00 2026
# NAMESPACE: phase4
# STATUS: deployed
# REVISION: 1
# NOTES: Backend service deployed successfully...

Write-Host "Backend chart deployed successfully" -ForegroundColor Green
```

**Why**:
- `--namespace phase4`: Isolates Phase 4 resources from other namespaces
- `--set image.tag=latest`: Uses the Minikube-built backend:latest image
- `--set env.DATABASE_URL`: Injects Neon database connection string
- `--set secret.OPENAI_API_KEY`: Injects API key as Kubernetes Secret (encrypted)

### Step 6.4: Wait for Backend Pod to Start

```powershell
# Wait for backend deployment to be ready (may take 30-60 seconds)
Write-Host "Waiting for backend pod to start..." -ForegroundColor Cyan

# Check status repeatedly
kubectl rollout status deployment/backend -n phase4 --timeout=120s

# Expected: "deployment "backend" successfully rolled out"

# Verify pod is running
kubectl get pods -n phase4
# Expected:
# NAME                       READY   STATUS    RESTARTS   AGE
# backend-xxxxxxxxxx-yyyyy   1/1     Running   0          10s
```

**Why**: Rollout status waits until pod is ready, health probes pass, and container is running.

### Step 6.5: Deploy Frontend Helm Chart to Minikube

```powershell
# Deploy frontend chart with backend service URL
helm install frontend helm/frontend/ `
    --namespace phase4 `
    --set image.tag=latest `
    --set env.NEXT_PUBLIC_API_URL="http://backend-service:8000" `
    --set env.ENVIRONMENT="production"

# Expected output:
# NAME: frontend
# LAST DEPLOYED: Wed Jan 08 14:31:00 2026
# NAMESPACE: phase4
# STATUS: deployed
# REVISION: 1

Write-Host "Frontend chart deployed successfully" -ForegroundColor Green
```

**Why**:
- `NEXT_PUBLIC_API_URL="http://backend-service:8000"`: Frontend connects to backend via Kubernetes service DNS
- `backend-service` is the internal Kubernetes DNS name (created by backend Service resource)
- Port 8000 is backend's exposed port (from Helm values.yaml)

### Step 6.6: Wait for Frontend Pod and Verify Both Deployments

```powershell
# Wait for frontend deployment
kubectl rollout status deployment/frontend -n phase4 --timeout=120s

# Check all pods in phase4 namespace
kubectl get pods -n phase4 -o wide
# Expected:
# NAME                        READY   STATUS    RESTARTS   AGE   IP           NODE
# backend-xxxxxxxxxx-yyyyy    1/1     Running   0          1m    10.244.x.x   minikube
# frontend-xxxxxxxxxx-zzzzz   1/1     Running   0          30s   10.244.x.x   minikube

# Check services (verify ClusterIP and ports)
kubectl get svc -n phase4
# Expected:
# NAME                TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)    AGE
# backend-service     ClusterIP   10.96.x.x       <none>        8000/TCP   1m
# frontend-service    ClusterIP   10.96.x.x       <none>        3000/TCP   30s

Write-Host "Both deployments running and services exposed" -ForegroundColor Green
```

**Success Indicators:**
- ✅ Both pods show STATUS "Running" and READY "1/1"
- ✅ Both services show TYPE "ClusterIP" with assigned IPs
- ✅ No errors in `kubectl get pods` output

---

## Verification & Testing

**Why**: Verifies application is working correctly end-to-end: pods healthy, services accessible, frontend connects to backend, AI chatbot functions.

### Step 7.1: Test Backend Health Endpoint

```powershell
# Port-forward backend service to localhost:8000 (for testing from Windows host)
$backendProcess = Start-Job -ScriptBlock {
    kubectl port-forward -n phase4 svc/backend-service 8000:8000
}

# Wait for port-forward to establish
Start-Sleep -Seconds 3

# Test health endpoint
try {
    $healthResponse = Invoke-WebRequest -Uri "http://localhost:8000/api/health" -UseBasicParsing
    Write-Host "Backend health check successful!" -ForegroundColor Green
    Write-Host "Response: $($healthResponse.Content)" -ForegroundColor Cyan
    # Expected: {"status":"healthy"}
} catch {
    Write-Host "Backend health check failed: $_" -ForegroundColor Red
}
```

**Why**: Health endpoint `/api/health` confirms backend is running and database connection works.

### Step 7.2: Test Frontend Access

```powershell
# Port-forward frontend service to localhost:3000
$frontendProcess = Start-Job -ScriptBlock {
    kubectl port-forward -n phase4 svc/frontend-service 3000:3000
}

# Wait for port-forward to establish
Start-Sleep -Seconds 3

# Test frontend is accessible
try {
    $frontendResponse = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing
    Write-Host "Frontend accessible!" -ForegroundColor Green
    Write-Host "Status Code: $($frontendResponse.StatusCode)" -ForegroundColor Cyan
    # Expected: Status Code 200
} catch {
    Write-Host "Frontend access failed: $_" -ForegroundColor Red
}
```

**Why**: Confirms Next.js frontend is running and responsive from browser.

### Step 7.3: Test Pod-to-Pod Communication

```powershell
# Exec into frontend pod to test connectivity to backend service
kubectl exec -n phase4 -it deployment/frontend -- curl -s http://backend-service:8000/api/health

# Expected: {"status":"healthy"}
# This confirms frontend pod can reach backend pod via Kubernetes service DNS

Write-Host "Pod-to-pod communication working (service DNS resolution)" -ForegroundColor Green
```

**Why**: Validates Kubernetes service discovery. Frontend pod resolves `backend-service` hostname and reaches backend pod on port 8000.

### Step 7.4: Test AI Chatbot Functionality (Manual Browser Test)

```powershell
# Open frontend in browser
Start-Process "http://localhost:3000"

Write-Host "Frontend opened in browser" -ForegroundColor Cyan
Write-Host "Test the following in browser:" -ForegroundColor Yellow
Write-Host "1. Add a new task using natural language (e.g., 'Create a task to write documentation')" -ForegroundColor White
Write-Host "2. List tasks (e.g., 'Show all my tasks')" -ForegroundColor White
Write-Host "3. Mark task complete (e.g., 'Mark first task as done')" -ForegroundColor White
Write-Host "4. Chat with AI chatbot" -ForegroundColor White
```

**Why**: End-to-end test confirms:
- Frontend renders correctly
- AI chatbot integration works
- Task CRUD operations function
- Frontend ↔ Backend communication successful

### Step 7.5: View Logs for Debugging

```powershell
# View backend pod logs (last 50 lines)
kubectl logs -n phase4 deployment/backend --tail=50

# View frontend pod logs
kubectl logs -n phase4 deployment/frontend --tail=50

# View logs in real-time (streaming)
kubectl logs -n phase4 deployment/backend -f
# Press Ctrl+C to stop streaming
```

**Why**: Logs show application output, errors, and confirm health probes are working.

### Step 7.6: Clean Up Port-Forward Background Jobs

```powershell
# Stop all port-forward background jobs when done testing
Get-Job | Stop-Job
Write-Host "Port-forward jobs stopped" -ForegroundColor Green
```

---

## Troubleshooting

**Why**: Addresses common Windows + Minikube + Docker issues and their solutions.

### Issue 1: "minikube docker-env" Permission Denied (Hyper-V Error)

**Error**: `Get-VM : User does not have permission to perform this action`

**Root Cause**: PowerShell must run as Administrator for Hyper-V operations.

**Solution**:
```powershell
# Right-click PowerShell and select "Run as Administrator"
# Verify admin status
[bool](([System.Security.Principal.WindowsIdentity]::GetCurrent()).groups -match "S-1-5-32-544")
# Expected: True if running as admin
```

### Issue 2: Docker Cannot Connect to Minikube Daemon

**Error**: `error during connect: This error may indicate that the docker daemon is not running`

**Root Cause**: Docker context not switched to Minikube, or Minikube not running.

**Solution**:
```powershell
# Verify Minikube is running
minikube status

# Re-apply Docker environment variables
minikube docker-env --shell=powershell | Invoke-Expression

# Verify connection
docker ps
```

### Issue 3: Image Pull Fails - "ImagePullBackOff"

**Error**: `Pod stuck in ImagePullBackOff status`

**Root Cause**: Helm chart image tag doesn't match Minikube-built image, or image pull policy incorrect.

**Solution**:
```powershell
# Verify images exist in Minikube Docker
docker images | grep -E "backend|frontend"

# Check pod status and events
kubectl describe pod -n phase4 <pod-name>

# Rebuild image if necessary
docker build -t backend:latest backend/
```

### Issue 4: Service Cannot Be Reached via DNS

**Error**: `curl: (6) Could not resolve host name`

**Root Cause**: CoreDNS not working or pod not in same namespace.

**Solution**:
```powershell
# Check CoreDNS pods
kubectl get pods -n kube-system | grep coredns

# Test DNS from pod
kubectl run -n phase4 --rm -it test-dns --image=busybox -- nslookup backend-service

# Expected: Server returns backend-service IP address
```

### Issue 5: Port Already in Use (Port 8443, 2376, etc.)

**Error**: `Minikube start fails: port already in use`

**Root Cause**: Previous Minikube instance or Docker Desktop interfering.

**Solution**:
```powershell
# Stop Minikube completely
minikube stop
minikube delete

# Kill Docker processes if needed
taskkill /F /IM docker.exe

# Wait 10 seconds
Start-Sleep -Seconds 10

# Start fresh
minikube start --driver=hyperv --cpus=4 --memory=4096
```

### Issue 6: Pods Not Receiving Environment Variables

**Error**: Pods running but environment variables missing or wrong.

**Root Cause**: Helm chart values not overridden or ConfigMap/Secret not mounted.

**Solution**:
```powershell
# Check pod environment variables
kubectl exec -n phase4 deployment/backend -- env | grep DATABASE_URL

# Verify ConfigMap and Secret created
kubectl get configmap -n phase4
kubectl get secret -n phase4

# Check deployment spec
kubectl get deployment -n phase4 backend -o yaml | Select-String "env" -A 10
```

---

## Complete Quick Reference

For future runs, after initial setup:

```powershell
# 1. Open PowerShell as Administrator
# 2. Navigate to project folder
cd F:\todo-phase4-hackathon2

# 3. Start Minikube
minikube start --driver=hyperv

# 4. Switch Docker context
minikube docker-env --shell=powershell | Invoke-Expression

# 5. Build images
docker build -t backend:latest backend/
docker build -t frontend:latest frontend/

# 6. Deploy with Helm (ensure env vars set)
helm install backend helm/backend/ --namespace phase4 --set env.DATABASE_URL="..." --set-string secret.OPENAI_API_KEY="..."
helm install frontend helm/frontend/ --namespace phase4 --set env.NEXT_PUBLIC_API_URL="http://backend-service:8000"

# 7. Verify
kubectl get pods -n phase4
kubectl get svc -n phase4

# 8. Port-forward for testing
kubectl port-forward -n phase4 svc/frontend-service 3000:3000
kubectl port-forward -n phase4 svc/backend-service 8000:8000

# 9. Open frontend
Start-Process "http://localhost:3000"
```

---

## Success Checklist

After completing all steps, verify:

- [ ] Minikube cluster running (`minikube status` shows all components Running)
- [ ] Both Docker images built (`docker images | grep -E "backend|frontend"` shows 2 images)
- [ ] Both Helm charts deployed (`helm list -n phase4` shows backend and frontend)
- [ ] Both pods running (`kubectl get pods -n phase4` shows READY 1/1, STATUS Running)
- [ ] Backend service accessible (`http://localhost:8000/api/health` returns healthy status)
- [ ] Frontend service accessible (`http://localhost:3000` loads in browser)
- [ ] AI chatbot responds to natural language commands
- [ ] Task CRUD operations work (create, list, complete, delete)
- [ ] No Phase III code modified
- [ ] Deployment reproducible for new user

---

**Generated**: 2026-01-08
**Status**: Phase 4 Minikube Deployment Guide - Windows Complete

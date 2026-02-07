# Phase 4 Minikube Deployment - Step by Step Instructions

## Before You Start

You need to have these values from your `backend/.env` file:
- DATABASE_URL (Neon PostgreSQL connection string)
- GOOGLE_API_KEY or OPENAI_API_KEY (for AI Chatbot)

---

## STEP 1: Open PowerShell as Administrator

1. **Press**: `Windows Key + X`
2. **Click**: "Windows PowerShell (Admin)" or "Terminal (Admin)"
3. **Confirm**: When prompted "Do you want to allow this app to make changes?" - click **Yes**

✅ **Expected**: PowerShell window opens with `Administrator:` in the title

---

## STEP 2: Update the Deployment Script with Your Credentials

1. Open the file: `F:\todo-phase4-hackathon2\DEPLOY_MINIKUBE.ps1` in Notepad

2. Find these lines (around line 20-25):
   ```powershell
   # Environment variables for Helm deployment (CUSTOMIZE THESE)
   $DatabaseUrl = "postgresql://neondb_owner:XYZ@ep-xyz.neon.tech/neondb"  # FROM backend/.env
   $OpenAiApiKey = "sk-..."  # FROM backend/.env GOOGLE_API_KEY or OPENAI_API_KEY
   ```

3. Replace with YOUR actual values from `backend/.env`:
   - Replace the entire `postgresql://...` string with your actual DATABASE_URL
   - Replace `sk-...` with your actual API key (GOOGLE_API_KEY from your .env)

4. **Save the file** (Ctrl+S)

✅ **Expected**: Your credentials are now in the script

---

## STEP 3: Run the Deployment Script

In the PowerShell window (running as Admin), paste and run this command:

```powershell
cd F:\todo-phase4-hackathon2
powershell -ExecutionPolicy RemoteSigned -File DEPLOY_MINIKUBE.ps1
```

Then press **Enter**.

⏳ **Wait**: The script will take 5-10 minutes to complete. It will:
- Check all prerequisites (Minikube, Helm, kubectl, Docker, Hyper-V)
- Start Minikube cluster
- Set up Docker to use Minikube
- Build backend Docker image (~1-2 minutes)
- Build frontend Docker image (~1-2 minutes)
- Deploy backend to Minikube
- Deploy frontend to Minikube
- Run verification tests
- Show you how to access your app

✅ **Expected**: Script runs and shows green checkmarks for each step

---

## STEP 4: If Script Completes Successfully

You'll see a summary that looks like:
```
✓ Phase 4 Minikube Deployment Complete!

DEPLOYMENT DETAILS:
- Namespace: phase4
- Backend Image: backend:latest
- Frontend Image: frontend:latest
```

This means your app is now running on Kubernetes! 🎉

---

## STEP 5: Test Your App in Browser

### Terminal 1: Open a NEW PowerShell window (as Admin) and run:

```powershell
kubectl port-forward -n phase4 svc/frontend-service 3000:3000
```

Leave this window open - it keeps port 3000 available.

### Terminal 2: Open ANOTHER new PowerShell window (as Admin) and run:

```powershell
kubectl port-forward -n phase4 svc/backend-service 8000:8000
```

Leave this window open - it keeps port 8000 available.

### Then: Open Your Browser

1. Go to: **http://localhost:3000**
2. Your Next.js frontend will load
3. Test your app:
   - ✅ Create a new task using natural language
   - ✅ Chat with the AI chatbot (Gemini)
   - ✅ List tasks
   - ✅ Mark tasks complete
   - ✅ Delete tasks

---

## STEP 6: Verify Everything is Working

### Check All Pods Running:
```powershell
kubectl get pods -n phase4
```

**Expected output:**
```
NAME                        READY   STATUS    RESTARTS   AGE
backend-xxxxxxxxxx-xxxxx    1/1     Running   0          2m
frontend-xxxxxxxxxx-xxxxx   1/1     Running   0          1m
```

### Check Backend Health:
```powershell
curl http://localhost:8000/api/health
```

**Expected output:**
```
{"status":"healthy"}
```

### View Logs:
```powershell
kubectl logs -n phase4 deployment/backend
kubectl logs -n phase4 deployment/frontend
```

---

## STEP 7: When You're Done Testing

### To Keep Minikube Running (for later testing):
Just close the port-forward windows.

### To Stop Everything:

```powershell
# Stop port-forward windows first (Ctrl+C)

# Then stop Minikube:
minikube stop

# Later, restart with:
minikube start --driver=hyperv
```

### To Delete Everything (clean slate):
```powershell
# Delete Helm releases
helm uninstall backend frontend -n phase4

# Delete namespace
kubectl delete namespace phase4

# Delete Minikube cluster (careful - removes everything)
minikube delete
```

---

## Troubleshooting

### Issue: "minikube: The term 'minikube' is not recognized"
**Solution**:
- Make sure you're running PowerShell as Administrator
- Try restarting PowerShell

### Issue: "Docker not connected to Minikube"
**Solution**:
- Make sure Minikube started successfully
- Try running: `minikube docker-env --shell=powershell | Invoke-Expression`

### Issue: "Backend pod stuck in ImagePullBackOff"
**Solution**:
- Images might not have built properly
- Check: `docker images | grep -E "backend|frontend"`
- Check pod logs: `kubectl describe pod -n phase4 <pod-name>`

### Issue: "Frontend cannot connect to backend"
**Solution**:
- Backend pod might not be running - check: `kubectl get pods -n phase4`
- Try port-forwarding and testing: `curl http://localhost:8000/api/health`

### Issue: "Helm deployment says 'permission denied' for Hyper-V"
**Solution**:
- You must run PowerShell as Administrator
- Right-click PowerShell → "Run as Administrator"

---

## Your App is Running Perfectly!

All your backend logic, APIs, CRUD operations, and AI chatbot are working exactly as they did before. The ONLY thing that changed is:
- **Before**: Running on localhost (native process)
- **After**: Running in Minikube (containerized Kubernetes pods)

Your app still:
✅ Connects to Neon PostgreSQL
✅ Uses Google Gemini API for chatbot
✅ Processes natural language commands
✅ Stores/retrieves tasks
✅ Handles all CRUD operations

**Congratulations! Your Phase 4 deployment is complete!**

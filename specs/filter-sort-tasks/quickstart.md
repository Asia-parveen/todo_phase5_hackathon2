# Quick Start Guide: Filter and Sort Tasks

## Overview
This guide explains how to implement and use the filtering and sorting functionality for tasks in the Phase 5 event-driven todo system.

## Prerequisites
- Python 3.11+
- Dapr runtime installed and running
- Kubernetes cluster (Minikube for local development)
- Completed Phase 4 setup with Helm charts

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Initialize Dapr:
```bash
dapr init
```

3. Start the service:
```bash
dapr run --app-id todo-service --dapr-http-port 3500 --app-port 8000 python src/main.py
```

## Usage Examples

### Filter Tasks by Status
```
GET http://localhost:3500/v1.0/invoke/todo-service/method/api/v1/tasks?status=pending
```

### Filter Tasks by Priority
```
GET http://localhost:3500/v1.0/invoke/todo-service/method/api/v1/tasks?priority=high
```

### Filter Tasks by Tags
```
GET http://localhost:3500/v1.0/invoke/todo-service/method/api/v1/tasks?tags=work&tags=urgent
```

### Filter Tasks by Due Date Presence
```
GET http://localhost:3500/v1.0/invoke/todo-service/method/api/v1/tasks?has_due_date=true
```

### Sort Tasks by Creation Date
```
GET http://localhost:3500/v1.0/invoke/todo-service/method/api/v1/tasks?sortBy=created_date&order=desc
```

### Sort Tasks by Priority
```
GET http://localhost:3500/v1.0/invoke/todo-service/method/api/v1/tasks?sortBy=priority&order=asc
```

### Combine Filtering and Sorting
```
GET http://localhost:3500/v1.0/invoke/todo-service/method/api/v1/tasks?status=pending&priority=high&sortBy=due_date&order=asc
```

## Backward Compatibility
When no filter or sort parameters are provided, the API returns the same results as before, maintaining backward compatibility:

```
GET http://localhost:3500/v1.0/invoke/todo-service/method/api/v1/tasks
```

## Testing
Run the complete test suite:
```bash
pytest tests/
```

Run specific tests:
```bash
pytest tests/unit/test_services/test_filter_sort_service.py
pytest tests/integration/test_api/test_task_endpoints.py
```

## Architecture Notes
- All filtering and sorting logic is implemented in the service layer
- Dapr state store is used for data retrieval before applying filters/sorts
- The service maintains statelessness as required by the Phase 5 constitution
- All operations follow the event-driven architecture with proper event emissions
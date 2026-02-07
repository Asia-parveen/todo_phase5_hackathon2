@echo off
REM Phase 5 Startup Script for Windows
REM Handles Docker pull failures with retries

echo === Phase 5: Event-Driven Todo App ===
echo.

set COMPOSE_FILE=docker-compose.phase5.yml
set MAX_RETRIES=3

REM Infrastructure images
set INFRA_IMAGES=redis:7-alpine confluentinc/cp-zookeeper:7.5.0 confluentinc/cp-kafka:7.5.0 daprio/dapr:1.13.0

REM App images (from Phase 4)
set APP_IMAGES=todo-backend todo-frontend

echo === Step 1: Verifying Phase 4 App Images ===
for %%i in (%APP_IMAGES%) do (
    docker image inspect %%i >nul 2>&1
    if errorlevel 1 (
        echo [MISSING] %%i not found!
        echo Please ensure Phase 4 images are built.
        exit /b 1
    ) else (
        echo [OK] %%i exists locally
    )
)

echo.
echo === Step 2: Pulling Infrastructure Images ===
set PULL_FAILED=0

for %%i in (%INFRA_IMAGES%) do (
    docker image inspect %%i >nul 2>&1
    if errorlevel 1 (
        echo Pulling %%i ...
        docker pull %%i
        if errorlevel 1 (
            echo [WARN] Failed to pull %%i
            set PULL_FAILED=1
        ) else (
            echo [OK] Pulled %%i
        )
    ) else (
        echo [CACHED] %%i already exists
    )
)

if %PULL_FAILED%==1 (
    echo.
    echo === Some images failed to pull ===
    echo.
    echo Options:
    echo 1. Run WITHOUT Kafka/Dapr: docker-compose -f docker-compose.yml up -d
    echo 2. Retry later when network is stable
    echo 3. Pull from alternative registry manually
    echo.
    set /p CONTINUE="Continue anyway? (y/n): "
    if /i not "%CONTINUE%"=="y" exit /b 1
)

echo.
echo === Step 3: Starting Services ===
docker-compose -f %COMPOSE_FILE% up -d

echo.
echo === Step 4: Waiting for services... ===
timeout /t 10 /nobreak >nul

echo.
echo === Phase 5 Startup Complete ===
echo.
echo Services:
echo   - Frontend:  http://localhost:3000
echo   - Backend:   http://localhost:8000
echo   - Kafka:     localhost:9092
echo   - Redis:     localhost:6379
echo.
echo View logs: docker-compose -f %COMPOSE_FILE% logs -f

pause

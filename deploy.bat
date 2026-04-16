@echo off
REM ==========================================
REM Smart Campus Notification System
REM Deployment Script (Windows)
REM ==========================================

echo ==========================================
echo   Smart Campus Notification System
echo   Deployment Script
echo ==========================================
echo.

REM ==========================================
REM Check Requirements
REM ==========================================
echo [INFO] Checking requirements...

docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker is not installed. Please install Docker Desktop first.
    exit /b 1
)

docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker Compose is not installed.
    exit /b 1
)

echo [INFO] All requirements met!
echo.

REM ==========================================
REM Parse Command
REM ==========================================
set COMMAND=%1
if "%COMMAND%"=="" set COMMAND=deploy

REM ==========================================
REM Deploy
REM ==========================================
if "%COMMAND%"=="deploy" (
    echo [INFO] Setting up environment variables...
    
    if not exist ".env" (
        if exist ".env.production.example" (
            echo [WARN] .env not found. Copying from .env.production.example
            copy .env.production.example .env
            echo [WARN] Please edit .env and fill in your values before continuing.
            exit /b 1
        ) else (
            echo [ERROR] .env file not found.
            exit /b 1
        )
    )
    
    echo [INFO] Building and starting containers...
    docker-compose build --no-cache
    docker-compose up -d
    
    echo [INFO] Waiting for services to be healthy...
    timeout /t 10 /nobreak >nul
    
    docker-compose ps
    
    echo.
    echo [INFO] Deployment complete!
    echo [INFO] Application available at: http://localhost:3000
    echo [INFO] API available at: http://localhost:8000
    goto :end
)

REM ==========================================
REM Start
REM ==========================================
if "%COMMAND%"=="start" (
    echo [INFO] Starting services...
    docker-compose up -d
    goto :end
)

REM ==========================================
REM Stop
REM ==========================================
if "%COMMAND%"=="stop" (
    echo [INFO] Stopping services...
    docker-compose down
    goto :end
)

REM ==========================================
REM Restart
REM ==========================================
if "%COMMAND%"=="restart" (
    echo [INFO] Restarting services...
    docker-compose restart
    goto :end
)

REM ==========================================
REM Logs
REM ==========================================
if "%COMMAND%"=="logs" (
    echo [INFO] Showing logs (Ctrl+C to exit)...
    docker-compose logs -f
    goto :end
)

REM ==========================================
REM Status
REM ==========================================
if "%COMMAND%"=="status" (
    echo.
    echo Container Status:
    docker-compose ps
    goto :end
)

REM ==========================================
REM Rebuild
REM ==========================================
if "%COMMAND%"=="rebuild" (
    echo [INFO] Rebuilding containers...
    docker-compose build --no-cache
    docker-compose up -d
    goto :end
)

REM ==========================================
REM Clean
REM ==========================================
if "%COMMAND%"=="clean" (
    echo [WARN] Cleaning up containers and volumes...
    docker-compose down -v --remove-orphans
    docker system prune -f
    echo [INFO] Cleanup complete!
    goto :end
)

REM ==========================================
REM Help
REM ==========================================
echo Usage: deploy.bat {deploy^|start^|stop^|restart^|logs^|status^|rebuild^|clean}
echo.
echo Commands:
echo   deploy   - Build and deploy the entire stack ^(default^)
echo   start    - Start existing containers
echo   stop     - Stop all containers
echo   restart  - Restart all containers
echo   logs     - Show logs
echo   status   - Show container status
echo   rebuild  - Rebuild and restart containers
echo   clean    - Remove containers, volumes, and prune Docker
exit /b 1

:end

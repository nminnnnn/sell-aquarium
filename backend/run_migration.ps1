# PowerShell script to run AI migration
# Usage: .\run_migration.ps1

Write-Host "Running AI Chatbot Migration..." -ForegroundColor Cyan

# Check if Docker container is running
$containerStatus = docker ps --filter "name=charan_aquarium_db" --format "{{.Status}}"
if (-not $containerStatus) {
    Write-Host "Error: Docker container 'charan_aquarium_db' is not running!" -ForegroundColor Red
    Write-Host "Please start it with: docker-compose up -d" -ForegroundColor Yellow
    exit 1
}

Write-Host "Container is running: $containerStatus" -ForegroundColor Green

# Run migration
Write-Host "Executing migration SQL..." -ForegroundColor Cyan
Get-Content ai_migration.sql | docker exec -i charan_aquarium_db mysql -u root -prootpassword charan_aquarium

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Migration completed successfully!" -ForegroundColor Green
    Write-Host "You can now use AI Chatbot!" -ForegroundColor Green
} else {
    Write-Host "`n❌ Migration failed!" -ForegroundColor Red
    Write-Host "Please check the error message above." -ForegroundColor Yellow
    exit 1
}


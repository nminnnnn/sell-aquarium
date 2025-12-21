# PowerShell script to run favorites migration
Write-Host "Running favorites migration..." -ForegroundColor Cyan

# Check if Docker container is running
$containerStatus = docker ps --filter "name=charan_aquarium_db" --format "{{.Status}}"
if (-not $containerStatus) {
    Write-Host "Error: Docker container 'charan_aquarium_db' is not running!" -ForegroundColor Red
    Write-Host "Please start the container first with: docker-compose up -d" -ForegroundColor Yellow
    exit 1
}

Write-Host "Container is running. Executing SQL migration..." -ForegroundColor Green

# Execute SQL file
Get-Content favorites_migration.sql | docker exec -i charan_aquarium_db mysql -u root -prootpassword charan_aquarium

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Migration completed successfully!" -ForegroundColor Green
} else {
    Write-Host "`n❌ Migration failed!" -ForegroundColor Red
    exit 1
}


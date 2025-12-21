# Run reviews migration for Docker MySQL
# This script executes the reviews_migration.sql file

Write-Host "Running reviews migration..." -ForegroundColor Cyan

Get-Content reviews_migration.sql | docker exec -i charan_aquarium_db mysql -u root -prootpassword charan_aquarium

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Reviews migration completed successfully!" -ForegroundColor Green
} else {
    Write-Host "❌ Migration failed. Please check the error above." -ForegroundColor Red
}


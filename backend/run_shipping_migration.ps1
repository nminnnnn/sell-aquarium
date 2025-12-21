

# Run shipping migration for Docker MySQL
Write-Host "Running shipping migration..." -ForegroundColor Cyan

Get-Content shipping_migration.sql | docker exec -i charan_aquarium_db mysql -u root -prootpassword charan_aquarium

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Shipping migration completed successfully!" -ForegroundColor Green
} else {
    Write-Host "❌ Migration failed. Please check the error above." -ForegroundColor Red
}


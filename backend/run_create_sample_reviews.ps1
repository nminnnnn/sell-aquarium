# Create sample orders and reviews for all products
Write-Host "Creating sample orders and reviews..." -ForegroundColor Cyan

Get-Content create_sample_orders_reviews.sql | docker exec -i charan_aquarium_db mysql -u root -prootpassword charan_aquarium

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Sample orders and reviews created successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Review summary:" -ForegroundColor Yellow
} else {
    Write-Host "❌ Failed to create reviews. Please check the error above." -ForegroundColor Red
}


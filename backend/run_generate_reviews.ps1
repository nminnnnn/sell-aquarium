# Generate sample reviews for products
# This script executes the generate_reviews.sql file

Write-Host "Generating sample reviews for products..." -ForegroundColor Cyan

Get-Content generate_reviews.sql | docker exec -i charan_aquarium_db mysql -u root -prootpassword charan_aquarium

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Sample reviews generated successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Review summary:" -ForegroundColor Yellow
    docker exec -i charan_aquarium_db mysql -u root -prootpassword charan_aquarium -e "
        SELECT 
            p.name as 'Product',
            p.category as 'Category',
            COUNT(pr.id) as 'Reviews',
            ROUND(AVG(pr.rating), 2) as 'Avg Rating'
        FROM products p
        LEFT JOIN product_reviews pr ON p.id = pr.product_id
        GROUP BY p.id, p.name, p.category
        ORDER BY COUNT(pr.id) DESC;
    "
} else {
    Write-Host "❌ Failed to generate reviews. Please check the error above." -ForegroundColor Red
}


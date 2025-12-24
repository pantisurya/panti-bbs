# Test Backend API dengan PowerShell
Start-Sleep -Seconds 2
Write-Host "🧪 Testing Backend API...`n"

try {
    # Test 1: Health Check
    Write-Host "Testing: GET /health"
    $health = Invoke-WebRequest -Uri "http://localhost:3000/health" -UseBasicParsing
    Write-Host "✅ Status: $($health.StatusCode)"
    Write-Host "   Response: $($health.Content)`n"

    # Test 2: Get all angpao
    Write-Host "Testing: GET /api/angpao"
    $angpao = Invoke-WebRequest -Uri "http://localhost:3000/api/angpao" -UseBasicParsing
    Write-Host "✅ Status: $($angpao.StatusCode)"
    Write-Host "   Response: $($angpao.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10)`n"

    # Test 3: Create angpao
    Write-Host "Testing: POST /api/angpao"
    $body = @{
        name = "Angpao Tahun Baru 2026"
        amount = 500000
        description = "Angpao untuk tahun baru"
    } | ConvertTo-Json

    $newAngpao = Invoke-WebRequest -Uri "http://localhost:3000/api/angpao" `
        -Method POST `
        -Body $body `
        -ContentType "application/json" `
        -UseBasicParsing
    Write-Host "✅ Status: $($newAngpao.StatusCode)"
    Write-Host "   Response: $($newAngpao.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10)`n"

    Write-Host "🎉 Semua test berhasil! Backend siap digunakan.`n"
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)`n" -ForegroundColor Red
}

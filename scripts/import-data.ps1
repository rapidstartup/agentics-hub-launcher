try {
    Write-Host "Reading export file..." -ForegroundColor Cyan
    $exportData = Get-Content "central-brain-export.json" -Raw | ConvertFrom-Json
    
    Write-Host "Preparing request body..." -ForegroundColor Cyan
    $body = @{data = $exportData.data} | ConvertTo-Json -Depth 100 -Compress
    
    Write-Host "Sending to import function..." -ForegroundColor Cyan
    $response = Invoke-WebRequest -Uri "https://bzldwfwyriwvlyfixmrt.supabase.co/functions/v1/import-central-brain-data" -Method POST -Headers @{"Content-Type"="application/json"} -Body $body -UseBasicParsing
    
    Write-Host "Success!" -ForegroundColor Green
    $response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
} catch {
    Write-Host "Error occurred:" -ForegroundColor Red
    Write-Host "Status Code: $($_.Exception.Response.StatusCode)" -ForegroundColor Yellow
    
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $errorBody = $reader.ReadToEnd()
        Write-Host "Error Details:" -ForegroundColor Yellow
        Write-Host $errorBody
    } else {
        Write-Host $_.Exception.Message
    }
}


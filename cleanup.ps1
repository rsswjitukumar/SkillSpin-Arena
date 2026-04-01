# SkillSpin Arena - One Click Performance Cleanup Script
Write-Host " Starting Extreme Performance Cleanup..." -ForegroundColor Cyan

# Remove Build Cache (Major speed hog for IDE)
if (Test-Path ".next") {
    Write-Host "🧹 Deleting .next build cache..."
    Remove-Item -Recurse -Force ".next"
}

# Remove redundant/empty folders
if (Test-Path "SkillSpin_Arena") {
    Write-Host "🚚 Removing redundant empty folder..."
    Remove-Item -Recurse -Force "SkillSpin_Arena"
}

# Remove extension junk
if (Test-Path ".qodo") {
    Write-Host "📦 Clearing extension data..."
    Remove-Item -Recurse -Force ".qodo"
}

# Cleanup root directory (Tutorials & Zips)
$rootPath = ".."
$unwantedRootItems = @("00_quick_start", "database.zip", "indexfile_game.zip")

foreach ($item in $unwantedRootItems) {
    $fullPath = Join-Path $rootPath $item
    if (Test-Path $fullPath) {
        Write-Host "🗑️ Deleting unwanted root item: $item"
        Remove-Item -Recurse -Force $fullPath
    }
}

Write-Host "✅ DONE! Your workspace is now MAKKHAN! Restart VS Code for full speed boost." -ForegroundColor Green

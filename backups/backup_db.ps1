# Portal SDM - Backup Database Docker
$backupDir = "D:\portal-sdmv3\backups"
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupFile = "$backupDir\database_backup_$timestamp.sqlite"

Write-Host "Mencari docker container..."
docker cp portal_sdm_backend:/data/database.sqlite $backupFile

if ($LASTEXITCODE -eq 0) {
    Write-Host "Backup berhasil disimpan di: $backupFile" -ForegroundColor Green
    
    # Hapus backup yang lebih tua dari 14 hari
    $limitDate = (Get-Date).AddDays(-14)
    Get-ChildItem -Path $backupDir -Filter "database_backup_*.sqlite" | Where-Object { $_.CreationTime -lt $limitDate } | Remove-Item
    Write-Host "Selesai membersihkan backup lama."
} else {
    Write-Host "Gagal membackup database!" -ForegroundColor Red
}

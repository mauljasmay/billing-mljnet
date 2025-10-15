Get-ChildItem -Path '.' -Recurse -File | Where-Object { $_.FullName -notmatch '\\.git\\' -and $_.FullName -notmatch '\\node_modules\\' } | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    $newContent = $content -replace 'Billing MLJNET', 'Billing MLJNET'
    if ($content -ne $newContent) {
        Set-Content $_.FullName $newContent
    }
}


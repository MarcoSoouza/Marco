# PowerShell script to auto-commit and push changes to GitHub

param(
    [string]$Path = ".",
    [string]$Filter = "*.*"
)

# Function to commit and push
function Commit-And-Push {
    try {
        # Add all changes
        & git add .

        # Check if there are changes to commit
        $status = & git status --porcelain
        if ($status) {
            # Commit with timestamp
            $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
            & git commit -m "Auto commit: $timestamp"

            # Push to origin main
            & git push origin main
            Write-Host "Changes committed and pushed to GitHub at $timestamp"
        } else {
            Write-Host "No changes to commit"
        }
    } catch {
        Write-Host "Error during commit/push: $_"
    }
}

# Create a FileSystemWatcher
$watcher = New-Object System.IO.FileSystemWatcher
$watcher.Path = $Path
$watcher.Filter = $Filter
$watcher.IncludeSubdirectories = $true
$watcher.EnableRaisingEvents = $true

# Define the action to take on file change
$action = {
    $path = $Event.SourceEventArgs.FullPath
    $changeType = $Event.SourceEventArgs.ChangeType
    Write-Host "File $path was $changeType"

    # Debounce to avoid multiple triggers
    Start-Sleep -Seconds 2

    Commit-And-Push
}

# Register the event handlers
Register-ObjectEvent $watcher "Created" -Action $action
Register-ObjectEvent $watcher "Changed" -Action $action
Register-ObjectEvent $watcher "Deleted" -Action $action
Register-ObjectEvent $watcher "Renamed" -Action $action

# Keep the script running
Write-Host "Watching for file changes in $Path. Press Ctrl+C to stop."
while ($true) { Start-Sleep -Seconds 1 }

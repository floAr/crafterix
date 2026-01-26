<#
.SYNOPSIS
    Barebones RALPH loop for Crafterix refactoring tasks.

.DESCRIPTION
    Iteratively runs Claude Code to complete tasks from tasks.md.
    Each iteration: pick task -> implement -> test -> commit -> mark done.
    Loop continues until all tasks complete or max iterations reached.

.PARAMETER MaxIterations
    Maximum number of loop iterations (default: 20)

.PARAMETER PromptFile
    Path to the prompt file (default: ralph-prompt.md)

.EXAMPLE
    .\ralph.ps1 -MaxIterations 10
#>

param(
    [int]$MaxIterations = 20,
    [string]$PromptFile = "ralph-prompt.md"
)

$ErrorActionPreference = "Stop"

# Colors for output
function Write-Status { param($msg) Write-Host "[RALPH] $msg" -ForegroundColor Cyan }
function Write-Success { param($msg) Write-Host "[RALPH] $msg" -ForegroundColor Green }
function Write-Warn { param($msg) Write-Host "[RALPH] $msg" -ForegroundColor Yellow }
function Write-Err { param($msg) Write-Host "[RALPH] $msg" -ForegroundColor Red }

# Check if all tasks are complete
function Test-AllTasksComplete {
    $tasksFile = "tasks.md"
    if (-not (Test-Path $tasksFile)) {
        Write-Err "tasks.md not found"
        return $false
    }

    $content = Get-Content $tasksFile -Raw

    # Count unchecked vs checked boxes in completion checklist
    $unchecked = ([regex]::Matches($content, '\- \[ \]')).Count
    $checked = ([regex]::Matches($content, '\- \[x\]')).Count

    Write-Status "Progress: $checked completed, $unchecked remaining"

    return $unchecked -eq 0
}

# Check if prompt file exists
if (-not (Test-Path $PromptFile)) {
    Write-Err "Prompt file not found: $PromptFile"
    Write-Err "Create it first or specify -PromptFile"
    exit 1
}

$prompt = Get-Content $PromptFile -Raw

Write-Status "Starting RALPH loop"
Write-Status "Max iterations: $MaxIterations"
Write-Status "Prompt file: $PromptFile"
Write-Host ""

$iteration = 0
$startTime = Get-Date

while ($iteration -lt $MaxIterations) {
    $iteration++

    Write-Host ""
    Write-Host ("=" * 60) -ForegroundColor Magenta
    Write-Status "ITERATION $iteration / $MaxIterations"
    Write-Host ("=" * 60) -ForegroundColor Magenta
    Write-Host ""

    # Check if done before starting
    if (Test-AllTasksComplete) {
        Write-Success "All tasks complete!"
        break
    }

    # Run Claude Code in print mode (non-interactive)
    # -p: print mode (non-interactive, exits after completion)
    # --dangerously-skip-permissions: auto-approve file edits
    # --verbose: show what's happening
    try {
        Write-Status "Invoking Claude Code (print mode)..."

        # Pass prompt as argument with -p flag for non-interactive mode
        & claude -p --dangerously-skip-permissions --verbose $prompt

        $exitCode = $LASTEXITCODE
        Write-Status "Claude exited with code: $exitCode"
    }
    catch {
        Write-Err "Claude invocation failed: $_"
        Write-Warn "Waiting 10s before retry..."
        Start-Sleep -Seconds 10
        continue
    }

    # Brief pause between iterations to avoid rate limiting
    if ($iteration -lt $MaxIterations) {
        Write-Status "Pausing 5s before next iteration..."
        Start-Sleep -Seconds 5
    }
}

$elapsed = (Get-Date) - $startTime

Write-Host ""
Write-Host ("=" * 60) -ForegroundColor Magenta
Write-Status "RALPH loop finished"
Write-Status "Iterations: $iteration"
Write-Status "Elapsed: $($elapsed.ToString('hh\:mm\:ss'))"

if (Test-AllTasksComplete) {
    Write-Success "All tasks completed successfully!"
} else {
    Write-Warn "Some tasks remain incomplete. Run again to continue."
}

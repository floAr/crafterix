# RALPH Iteration Prompt - Crafterix Refactoring

You are executing one iteration of a RALPH loop to refactor the Crafterix codebase.

## Your Mission

Complete ONE task from `tasks.md`, commit the changes, then stop.

## Steps

### 1. Read tasks.md and find the next uncompleted task
- Look at the "Completion Checklist" section
- Find the first task with `- [ ]` (unchecked)
- Read that task's full details (Context Files, Problem, Desired Outcome, Gotchas)

### 2. Build context
- Read ALL files listed in "Context Files" for that task
- Understand the current implementation before changing anything

### 3. Implement the fix
- Make the minimal changes described in "Desired Outcome"
- Follow existing code patterns and style
- Watch out for issues mentioned in "Gotchas"
- Do NOT over-engineer or add unrequested features

### 4. Verify the change
- Run `pnpm build` to ensure TypeScript compiles
- If build fails, fix the errors before proceeding

### 5. Update tasks.md
- Change `- [ ] Task N:` to `- [x] Task N:` in the Completion Checklist
- This marks the task as done

### 6. COMMIT THE CHANGES (MANDATORY)
This step is REQUIRED. You MUST commit before finishing.

```bash
git add -A
git commit -m "refactor(task-N): <brief description of what changed>"
```

Example commit messages:
- `refactor(task-3): fix private member access in essence actions`
- `refactor(task-5): remove unused parameter in ChaosOrb`
- `refactor(task-6): extract types to separate file`

### 7. Stop
- After committing, stop and let the next iteration handle the next task
- Do not attempt multiple tasks in one iteration

## Rules

- ONE task per iteration - do not batch
- ALWAYS commit your changes before finishing
- If build fails, fix it before committing
- If you encounter a blocker, document it and skip to commit
- Preserve all existing functionality

## Current Working Directory

You are in the Crafterix project root. Key paths:
- `tasks.md` - task list (read this first)
- `packages/engine/` - crafting engine code
- `packages/web/` - React frontend
- `packages/data/` - type definitions

## Start Now

Read `tasks.md` and begin with the first unchecked task. Remember to commit when done.

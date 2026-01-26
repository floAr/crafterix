# RALPH Iteration Prompt - Crafterix Refactoring

You are executing one iteration of a RALPH loop to refactor the Crafterix codebase.

## Your Mission

Complete ONE task from `tasks.md`, then stop.

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
- Run `pnpm test` if tests exist
- Manually verify the logic makes sense

### 5. Commit the change
- Stage only the files you changed
- Write a clear commit message: `refactor: <brief description>`
- Include which task number was completed

### 6. Update tasks.md
- Change `- [ ] Task N:` to `- [x] Task N:` in the Completion Checklist
- This marks the task as done

### 7. Stop
- After completing ONE task, stop and let the next iteration handle the next task
- Do not attempt multiple tasks in one iteration

## Rules

- ONE task per iteration - do not batch
- If build fails, fix it before committing
- If you encounter a blocker, document it in the task and mark it `- [x]` anyway with a note
- Do not modify tasks.md except to check off completed tasks
- Preserve all existing functionality

## Current Working Directory

You are in the Crafterix project root. Key paths:
- `tasks.md` - task list (read this first)
- `packages/engine/` - crafting engine code
- `packages/web/` - React frontend
- `packages/data/` - type definitions

## Start Now

Read `tasks.md` and begin with the first unchecked task.

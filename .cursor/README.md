# `.cursor` directory

This folder holds **Cursor-specific** material for this repository: optional **rules** for the AI agent and a **local-only** knowledge base. It is safe to commit everything here **except** what Git already ignores (see below).

## Layout

```
.cursor/
├── README.md                 # This file
├── rules/                    # Cursor project rules (*.mdc)
│   └── (optional .mdc files) # YAML frontmatter + instructions for the agent
└── project-context/          # Gitignored — see repo root .gitignore
    ├── project-overview.md
    ├── project-structure.md
    └── tech-stack/
        ├── npm-dependencies.md
        └── tooling-and-config.md
```

## `rules/`

- Files use the **`.mdc`** extension (Markdown with YAML frontmatter).
- Typical frontmatter: `description`, `alwaysApply` (boolean), optional `globs` for path-scoped rules.
- Rules are **versioned** when committed; they apply in Cursor according to their settings.
- Add new rules here if you want persistent instructions (coding style, “always read X before Y”, etc.).

## `project-context/`

Path: **`.cursor/project-context/`**. **Gitignored.** Use before large refactors or dependency changes.

- **Not committed** (`.gitignore`: `.cursor/project-context/`).
- Markdown-only **reference**: purpose, repo layout, npm stack, tooling (fewer tokens than a long rule).
- **Clone note:** recreate this folder locally after clone if you want the same docs; they are not on the remote.
- **Usage:** `@`-mention paths under `project-context/`, or add a rule under `rules/` so the model reads specific files when needed.

### Files in `project-context/`

| File | Contents |
|------|----------|
| `project-overview.md` | Why the project exists + short app summary |
| `project-structure.md` | Folder tree + conventions |
| `tech-stack/npm-dependencies.md` | `dependencies` / `devDependencies` from `package.json` |
| `tech-stack/tooling-and-config.md` | Vite, TS, Tailwind, PostCSS, npm scripts, `.env` |

Exact installed dependency tree: `npm ls` at repository root.

## What Cursor does with this

- **Rules** in `rules/` are loaded by Cursor when their `alwaysApply` / `globs` / manual selection matches the session.
- **`project-context/`** is normal files on disk; the model only sees them if included in context (attachment, `@file`, or a rule that points to them).

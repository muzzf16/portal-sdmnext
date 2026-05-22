# PR TODO: Safe Refactor Implementation Sequence (PORTALS-SDM)

_This checklist allows for safe, auditable refactor PR sequencing in a monorepo with historical drift._

---

## Phase 1: Zero-Risk, Immediate

- [ ] Create and review `.env.example` files for backend and frontend.
- [ ] Add missing `CODEOWNERS` file at repo root.
- [ ] Implement `/api/health` on the backend; `/health` on the frontend if useful.
- [ ] Edit `docker-compose.yml` to remove deprecated `version: '3.8'` section.
- [ ] Delete `react-hook-form` from backend deps in `package.json`.
- [ ] (Optional) Pick only one of `bcrypt` or `bcryptjs` for backend, remove the other if possible.

## Phase 2: Low-Risk, Reference/Script Updates

- [ ] Write `deploy.sh` bash script for parity with `deploy.ps1` (document both in AGENTS.md).
- [ ] For all `apps/backend/*.js|ts` root scripts: move live-only scripts to `/scripts/` and delete obsolete/debug/one-off scripts. State reasons in the commit description.
- [ ] Update all `package.json` scripts to reference their new script paths/names.
- [ ] Add a `/scripts/README.md` describing script purpose, input/output, owner.

## Phase 3: Planned, Coordinated Changes

- [ ] Refactor Docker env config to use external file, update prod/staging first before live cutover.
- [ ] Add/verify `.github/workflows/` or equivalent CI for lint, build and test (document platform—GitHub Actions, GitLab, etc).
- [ ] For backend/frontend shared types: initially copy/paste only what’s truly shared; workspace if >3 types and drifting.

---

## Critical Additions

- [ ] Before Phase 2+, audit all backend scripts: only move/keep if referenced in deployment/test/package script/CI logs. Remove deadweight.
- [ ] Remove all backend dependencies that aren’t referenced in code or only belong to another app (esp. FE libs).
- [ ] Ensure all deployment/infra scripts have Bash equivalents for any non-Windows server.

---

## Runbook/Discipline
- [ ] Pause after each phase, deploy, and validate normal operation before proceeding.
- [ ] Update `AGENTS.md` with each round of script, workflow, or infra change (do not let doc drift).

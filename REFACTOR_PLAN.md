# Monorepo SAFE Refactor Plan: PORTALS-SDM (Phase-based)

_This plan provides precise, zero-footgun steps for large/legacy Node+React monorepo refactoring._

---

## Phase 1 — Zero-Risk, Immediate Actions

- [ ] **Create `.env.example` for both apps.** List and document all required vars (`JWT_SECRET`, `CORS_ORIGIN`, etc).
- [ ] **Add `CODEOWNERS` file** to root. Document in AGENTS.md if ownership is nuanced.
- [ ] **Add `/api/health` endpoint** (backend) and `/health` (frontend, if useful).
- [ ] **Remove deprecated `version: '3.8'`** from `docker-compose.yml`.
- [ ] **Clean backend dependencies:** Remove `react-hook-form` from backend deps. Choose `bcrypt` _or_ `bcryptjs` (not both) unless both are truly used.

## Phase 2 — Low-Risk, Needs Verification

- [ ] **Create `deploy.sh` for Linux**, mirroring `deploy.ps1`. Mention both in AGENTS.md.
- [ ] **Triage backend root scripts:** Move only actively referenced scripts to `/scripts/`, delete obsolete/debug scripts. Commit log must state rationale.
- [ ] **Update `package.json`** scripts for new script locations/names only.
- [ ] **Add `/scripts/README.md`** explaining per-script ownership/intended use.

## Phase 3 — Medium-to-High Risk, Requires Planning & Rollback Option

- [ ] **Externalize Docker env:** Move secrets/config to `.env.docker` or similar. Remove fallback inline. Staging/test before prod.
- [ ] **Introduce/Update CI/CD:** Add workflow for lint/typecheck/test. Confirm platform (GitHub, GitLab, etc). Add SSH/secret infra after basic CI works.
- [ ] **Shared Types Strategy:** For now, copy minimal API types to FE/BE; workspace only if types grow substantially.

---

## Critical Explicit Additions
- [ ] Audit and remove root-level backend scripts not referenced by tests/CI/package scripts.
- [ ] Audit backend `package.json` for unused/misplaced dependencies.
- [ ] All deploy scripts must have Bash/Unix (`deploy.sh`) equivalents if production is not Windows.

---

## Implementation Checklist (Process)

- [ ] **Phase 1:** Low-risk env/doc/script/dep fixes
- [ ] **Deploy, verify all basics**
- [ ] **Phase 2:** Script triage, Linux deploy, update references, `/scripts/README.md`
- [ ] **Deploy again, verify**
- [ ] **Phase 3:** Docker env, CI, shared types
- [ ] **Document all major structure/script changes in AGENTS.md**

---

**CAUTION:**
- Do NOT move/delete prod migration scripts until all hard workflow references are updated and staged/tested live.
- Do NOT move/copy/symlink types/scripts without staging/build/test.
- _Update AGENTS.md after every major script or infrastructure change._

---

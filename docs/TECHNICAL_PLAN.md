# WedLove - Technical Implementation Plan

## Executive Summary

**Stack:** React 19 SPA + Node.js/Express + PostgreSQL 16 + Redis 7 + Prisma v7 + AWS S3
**Target:** Nền tảng thiệp cưới online cao cấp
**Timeline:** 5 phases, 16-20 tuần
**Current State:** Phase 1 hoàn thành (1.1-1.10 ✅), còn 1.11-1.12

---

## Document Index

Chi tiết kỹ thuật được chia thành các file nhỏ để dễ review và maintain:

| File | Nội dung | ~Dòng |
|------|----------|-------|
| [01-architecture-and-schema.md](plan/01-architecture-and-schema.md) | System architecture, tech stack, Prisma schema (existing + new models), migration strategy | 393 |
| [02-api-design.md](plan/02-api-design.md) | RESTful API structure (✅/❌ status), request/response TypeScript types, existing + new endpoints | 280 |
| [03-features.md](plan/03-features.md) | Feature implementation details cho Phase 1-4 (largest file), code snippets TypeScript/Prisma | 970 |
| [04-realtime-security-performance.md](plan/04-realtime-security-performance.md) | Socket.io, JWT auth, rate limiting, Redis caching, Prisma query optimization | 270 |
| [05-roadmap-and-infra.md](plan/05-roadmap-and-infra.md) | Development roadmap (Phase 1-5 with task tables), Docker compose, env variables | 186 |
| [06-testing-monitoring.md](plan/06-testing-monitoring.md) | Testing strategy, test cases, Winston logging, Prometheus metrics, comparison matrix, next steps | 174 |

---

## Quick Reference

### ⚠️ Critical Implementation Notes

**Prisma v7 Adapter** — Must use `PrismaPg(pool)` with explicit `pg.Pool`, NOT `PrismaPg({ connectionString })` (causes SASL auth error). See [01-architecture-and-schema.md](plan/01-architecture-and-schema.md).

**Tailwind CSS v4** — PostCSS config must use `@tailwindcss/postcss`, NOT `tailwindcss`. See [01-architecture-and-schema.md](plan/01-architecture-and-schema.md).

### Demo Credentials
- Email: `demo@wedlove.pro` / Password: `123456`
- Invitation slug: `an-va-linh-demo`

### Current Priority
1. **Task 1.11** — Wire frontend to real API (replace mock data)
2. **Task 1.12** — Add S3 upload support

See [05-roadmap-and-infra.md](plan/05-roadmap-and-infra.md) for full roadmap.

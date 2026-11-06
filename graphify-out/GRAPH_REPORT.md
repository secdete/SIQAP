# Graph Report - SIQAP  (2026-11-06)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 547 nodes · 772 edges · 34 communities (27 shown, 7 thin omitted)
- Extraction: 92% EXTRACTED · 8% INFERRED · 0% AMBIGUOUS · INFERRED: 59 edges (avg confidence: 0.86)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `b9b131c9`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Community 0
- Community 1
- Community 2
- Community 3
- Community 4
- Community 5
- Community 6
- Community 7
- Community 8
- Community 9
- Community 10
- Community 11
- Community 12
- Community 13
- Community 14
- Community 15
- Community 16
- Community 17
- Community 18
- Community 19
- Community 20
- Community 21
- Community 22
- Community 23
- Community 24
- Community 25
- Community 26
- Community 27
- Community 28
- Community 29
- Community 30
- Community 31

## God Nodes (most connected - your core abstractions)
1. `GameManager` - 27 edges
2. `SessionStore` - 26 edges
3. `MemorySessionStore` - 23 edges
4. `RedisSessionStore` - 23 edges
5. `compilerOptions` - 17 edges
6. `PRD — SIQAP, Platform Kuis Realtime (Kahoot-like)` - 17 edges
7. `compilerOptions` - 16 edges
8. `SIQAP Contract (v0.1)` - 16 edges
9. `StoredPlayer` - 15 edges
10. `StoredSession` - 11 edges

## Surprising Connections (you probably didn't know these)
- `5. Integrasi AI Quiz Generator (9router)` --references--> `GenerateQuizInput`  [INFERRED]
  CLAUDE.md → packages/shared/src/contract/ai.ts
- `13. Kontrak REST (apps/web)` --references--> `GenerateQuizInput`  [INFERRED]
  CONTRACT.md → packages/shared/src/contract/ai.ts
- `3. Protokol Integrasi AI 9router` --references--> `GenerateQuizOutput`  [INFERRED]
  AGENTS.md → packages/shared/src/contract/ai.ts
- `5. Integrasi AI Quiz Generator (9router)` --references--> `GenerateQuizOutput`  [INFERRED]
  CLAUDE.md → packages/shared/src/contract/ai.ts
- `13. Kontrak REST (apps/web)` --references--> `GenerateQuizOutput`  [INFERRED]
  CONTRACT.md → packages/shared/src/contract/ai.ts

## Import Cycles
- None detected.

## Communities (34 total, 7 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.07
Nodes (23): HostLivePage(), OPTION_THEMES, JoinContent(), JoinPage(), metadata, OPTION_STYLES, PlayPage(), OptionItem (+15 more)

### Community 1 - "Community 1"
Cohesion: 0.07
Nodes (6): MemorySessionStore, RedisSessionStore, StoredAnswer, StoredPlayer, StoredSession, ioredis

### Community 3 - "Community 3"
Cohesion: 0.06
Nodes (29): 1. Pembagian Wilayah Kerja Agen (Ownership Boundaries), 2. Protokol Perubahan Kontrak (Contract Change Protocol), 3. Protokol Integrasi AI 9router, AGENTS.md — SIQAP Agent Collaboration & Operational Rules, 1. Perintah Proyek (Commands), 2. Arsitektur Monorepo & Pembagian Peran Agen, 3. Aturan Inti Contract (Server-Authoritative), 4. State Machine Alur Permainan (+21 more)

### Community 4 - "Community 4"
Cohesion: 0.07
Nodes (26): dependencies, @prisma/client, devDependencies, prisma, @types/node, typescript, exports, @types/node (+18 more)

### Community 5 - "Community 5"
Cohesion: 0.08
Nodes (24): 10. Non-Functional Requirements, 11. Keamanan & Anti-Abuse, 12. Metrik Keberhasilan, 13. Roadmap & Milestone, 14. Risiko & Mitigasi, 15. Repo, Library, dan Skill yang Disarankan, 16. Keputusan Produk & Pertanyaan Tersisa, 1. Ringkasan (+16 more)

### Community 6 - "Community 6"
Cohesion: 0.10
Nodes (21): 5. Event: client → server, ClientToServerEvents, GameEnd, GamePhaseEvent, HostAction, HostCreate, HostKick, HostRejoin (+13 more)

### Community 7 - "Community 7"
Cohesion: 0.09
Nodes (21): import, types, dependencies, zod, devDependencies, typescript, vitest, exports (+13 more)

### Community 8 - "Community 8"
Cohesion: 0.11
Nodes (18): @siqap/db, @siqap/shared, socket.io-client, @types/node, typescript, name, private, type (+10 more)

### Community 9 - "Community 9"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 10 - "Community 10"
Cohesion: 0.11
Nodes (18): devDependencies, turbo, typescript, typescript, name, packageManager, private, scripts (+10 more)

### Community 11 - "Community 11"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, declaration, declarationMap, esModuleInterop, forceConsistentCasingInFileNames, lib, module (+10 more)

### Community 12 - "Community 12"
Cohesion: 0.15
Nodes (3): BLOCKED_WORDS, isNicknameAllowed(), sanitizeNickname()

### Community 13 - "Community 13"
Cohesion: 0.12
Nodes (16): dependencies, cors, dotenv, express, ioredis, @siqap/db, @siqap/shared, socket.io (+8 more)

### Community 14 - "Community 14"
Cohesion: 0.15
Nodes (11): QuizGenerator, ErrorCode, GameSettings, LeaderboardEntry, Nickname, OptionIndex, Pin, PlayerPublic (+3 more)

### Community 15 - "Community 15"
Cohesion: 0.13
Nodes (14): dependsOn, outputs, dependsOn, cache, persistent, dependsOn, $schema, tasks (+6 more)

### Community 16 - "Community 16"
Cohesion: 0.14
Nodes (13): @siqap/db, @siqap/shared, socket.io-client, @types/node, typescript, vitest, name, private (+5 more)

### Community 17 - "Community 17"
Cohesion: 0.14
Nodes (14): dependencies, canvas-confetti, clsx, framer-motion, lucide-react, next, qrcode.react, react (+6 more)

### Community 18 - "Community 18"
Cohesion: 0.21
Nodes (10): config, app, gameManager, httpServer, io, store, getSessionStore(), cors (+2 more)

### Community 19 - "Community 19"
Cohesion: 0.17
Nodes (4): TypedServer, getHostTokenFromRoom(), registerSocketHandlers(), TypedSocket

### Community 20 - "Community 20"
Cohesion: 0.17
Nodes (11): HOST_DISCONNECT_END_MS, HOST_DISCONNECT_PAUSE_MS, LEADERBOARD_TOP_N, MAX_PLAYERS_HARD_CAP, NICKNAME_MAX, NICKNAME_MIN, PIN_LENGTH, QUESTION_TIME_DEFAULT_SEC (+3 more)

### Community 21 - "Community 21"
Cohesion: 0.27
Nodes (7): 4. Checklist Kualitas Sebelum Selesai (Definition of Done), MAX_POINTS_DEFAULT, STREAK_BONUS_CAP, STREAK_BONUS_STEP, PointsMode, calcPoints(), streakBonus()

### Community 22 - "Community 22"
Cohesion: 0.22
Nodes (9): devDependencies, autoprefixer, postcss, tailwindcss, @types/canvas-confetti, @types/node, @types/react, @types/react-dom (+1 more)

### Community 23 - "Community 23"
Cohesion: 0.25
Nodes (7): compilerOptions, outDir, rootDir, exclude, extends, include, ../../tsconfig.base.json

### Community 24 - "Community 24"
Cohesion: 0.25
Nodes (7): compilerOptions, outDir, rootDir, exclude, extends, include, ../../tsconfig.base.json

### Community 25 - "Community 25"
Cohesion: 0.25
Nodes (7): compilerOptions, outDir, rootDir, exclude, extends, include, ../../tsconfig.base.json

### Community 26 - "Community 26"
Cohesion: 0.33
Nodes (6): scripts, build, check-types, dev, start, test

### Community 27 - "Community 27"
Cohesion: 0.33
Nodes (6): scripts, build, check-types, dev, lint, start

## Knowledge Gaps
- **277 isolated node(s):** `name`, `version`, `private`, `type`, `dev` (+272 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 334 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `Community 0` to `Community 8`, `Community 28`?**
  _High betweenness centrality (0.079) - this node is a cross-community bridge._
- **What connects `name`, `version`, `private` to the rest of the system?**
  _277 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.06857142857142857 - nodes in this community are weakly interconnected._
- **Why does `socket.io` connect `Community 29` to `Community 16`, `Community 18`, `Community 19`, `Community 12`?**
  _High betweenness centrality (0.070) - this node is a cross-community bridge._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.07171717171717172 - nodes in this community are weakly interconnected._
- **Why does `GameManager` connect `Community 2` to `Community 18`, `Community 19`, `Community 12`, `Community 29`?**
  _High betweenness centrality (0.059) - this node is a cross-community bridge._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.1273532668881506 - nodes in this community are weakly interconnected._
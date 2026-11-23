# Graph Report - SIQAP  (2026-11-23)

## Corpus Check
- 67 files · ~75,831 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 10 file(s) not represented in the graph (top: (none) 3, .fig 2, .example 1)

## Summary
- 991 nodes · 1305 edges · 65 communities (60 shown, 5 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 70 edges (avg confidence: 0.86)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `d3a1df2b`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- next
- MemorySessionStore
- GameManager
- SIQAP Contract (v0.1)
- db/package.json
- PRD — SIQAP, Platform Kuis Realtime (Kahoot-like)
- events.ts
- shared/package.json
- web/package.json
- compilerOptions
- scripts
- compilerOptions
- game-manager.ts
- realtime/package.json
- AGENTS.md: SIQAP
- tasks
- Tone & Voice
- dependencies
- realtime/src/index.ts
- handlers.ts
- antislop-layoutmobile
- rate-limit.ts
- devDependencies
- realtime/tsconfig.json
- db/tsconfig.json
- shared/tsconfig.json
- contrast-check.py
- scripts
- quizzes/route.ts
- antislop-human
- Comments That Add Nothing
- tailwind.config.ts
- Group 1: Hard Gate (absolute, no exceptions)
- Group 1: Hard Gate (absolute, no exceptions)
- Group 2: Purpose-Gate (technique allowed, purpose required)
- Group 2: Purpose-Gate (technique allowed, purpose required)
- Decorative Elements
- SIQAP Design Guide (v0.2)
- antislop-ui
- Layout & Components
- Visual & Color
- store.ts
- SoundFX
- Group 3: Quality Locks (consistency)
- Group 3: Quality Locks (consistency)
- play/[pin]/page.tsx
- antislop
- antislop
- SIQAP: Prompt Pembuka per Agen
- Part 1: AI Slop Patterns (Warning Signs)
- App & Dashboard
- Part 1: AI Slop Patterns (Warning Signs)
- eslint.config.mjs
- The Craftsmanship Standard
- The Craftsmanship Standard
- layout.tsx
- host/[pin]/page.tsx
- packages_shared_dist_index
- Delivery Gate (Mandatory)
- Delivery Gate (Mandatory)
- Part 3: Liveliness Toolkit
- Part 3: Liveliness Toolkit
- profanity.ts

## God Nodes (most connected - your core abstractions)
1. `GameManager` - 34 edges
2. `SessionStore` - 26 edges
3. `MemorySessionStore` - 23 edges
4. `RedisSessionStore` - 23 edges
5. `Group 1: Hard Gate (absolute, no exceptions)` - 18 edges
6. `Group 1: Hard Gate (absolute, no exceptions)` - 18 edges
7. `compilerOptions` - 17 edges
8. `PRD — SIQAP, Platform Kuis Realtime (Kahoot-like)` - 17 edges
9. `StoredPlayer` - 16 edges
10. `compilerOptions` - 16 edges

## Surprising Connections (you probably didn't know these)
- `5. Integrasi AI Quiz Generator (9router)` --references--> `GenerateQuizInput`  [INFERRED]
  CLAUDE.md → packages/shared/src/contract/ai.ts
- `13. Kontrak REST (apps/web)` --references--> `GenerateQuizInput`  [INFERRED]
  CONTRACT.md → packages/shared/src/contract/ai.ts
- `5. Integrasi AI Quiz Generator (9router)` --references--> `GenerateQuizOutput`  [INFERRED]
  CLAUDE.md → packages/shared/src/contract/ai.ts
- `13. Kontrak REST (apps/web)` --references--> `GenerateQuizOutput`  [INFERRED]
  CONTRACT.md → packages/shared/src/contract/ai.ts
- `2. Stack` --references--> `QuizGenerator`  [INFERRED]
  AGENTS.md → packages/shared/src/contract/ai.ts

## Import Cycles
- None detected.

## Communities (65 total, 5 thin omitted)

### Community 0 - "next"
Cohesion: 0.18
Nodes (6): OPTION_BADGES, OptionItem, QuestionFormItem, lucide-react, next, react

### Community 1 - "MemorySessionStore"
Cohesion: 0.06
Nodes (10): config, getSessionStore(), MemorySessionStore, RedisSessionStore, StoredAnswer, StoredPlayer, StoredSession, nextConfig (+2 more)

### Community 2 - "GameManager"
Cohesion: 0.11
Nodes (5): GameManager, sortPlayersForStandings(), toLeaderboardEntry(), toOptionObjects(), SessionStore

### Community 3 - "SIQAP Contract (v0.1)"
Cohesion: 0.08
Nodes (25): 1. Perintah Proyek (Commands), 2. Arsitektur Monorepo & Pembagian Peran Agen, 3. Aturan Inti Contract (Server-Authoritative), 4. State Machine Alur Permainan, 5. Integrasi AI Quiz Generator (9router), 6. Standar Kualitas Desain UI (Anti-Slop), Agen Pemilik Modul (Agent Ownership), CLAUDE.md — SIQAP (Platform Kuis Realtime) (+17 more)

### Community 4 - "db/package.json"
Cohesion: 0.07
Nodes (26): dependencies, @prisma/client, devDependencies, prisma, @types/node, typescript, exports, @types/node (+18 more)

### Community 5 - "PRD — SIQAP, Platform Kuis Realtime (Kahoot-like)"
Cohesion: 0.08
Nodes (24): 10. Non-Functional Requirements, 11. Keamanan & Anti-Abuse, 12. Metrik Keberhasilan, 13. Roadmap & Milestone, 14. Risiko & Mitigasi, 15. Repo, Library, dan Skill yang Disarankan, 16. Keputusan Produk & Pertanyaan Tersisa, 1. Ringkasan (+16 more)

### Community 6 - "events.ts"
Cohesion: 0.05
Nodes (48): 4. Pembagian area dan kepemilikan, 5. Event: client → server, HOST_DISCONNECT_END_MS, HOST_DISCONNECT_PAUSE_MS, LEADERBOARD_TOP_N, MAX_PLAYERS_HARD_CAP, MAX_POINTS_DEFAULT, NICKNAME_MAX (+40 more)

### Community 7 - "shared/package.json"
Cohesion: 0.09
Nodes (22): import, types, dependencies, zod, devDependencies, typescript, vitest, exports (+14 more)

### Community 8 - "web/package.json"
Cohesion: 0.09
Nodes (21): @siqap/db, @siqap/shared, socket.io-client, @types/node, typescript, zod, name, private (+13 more)

### Community 9 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 10 - "scripts"
Cohesion: 0.11
Nodes (18): devDependencies, turbo, typescript, typescript, name, packageManager, private, scripts (+10 more)

### Community 11 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, declaration, declarationMap, esModuleInterop, forceConsistentCasingInFileNames, lib, module (+10 more)

### Community 12 - "game-manager.ts"
Cohesion: 0.14
Nodes (3): HostSnapshotEvent, LEADERBOARD_AUTO_ADVANCE_MS, REVEAL_AUTO_ADVANCE_MS

### Community 13 - "realtime/package.json"
Cohesion: 0.06
Nodes (35): dependencies, cors, dotenv, express, ioredis, @siqap/db, @siqap/shared, socket.io (+27 more)

### Community 14 - "AGENTS.md: SIQAP"
Cohesion: 0.12
Nodes (15): 10. Konvensi kode, 11. Git dan PR, 12. Definition of done, 13. Handoff antar agen, 14. Yang jangan dilakukan, 1. Ringkasan proyek, 2. Stack, 3. Struktur repo (+7 more)

### Community 15 - "tasks"
Cohesion: 0.13
Nodes (14): dependsOn, outputs, dependsOn, cache, persistent, dependsOn, $schema, tasks (+6 more)

### Community 16 - "Tone & Voice"
Cohesion: 0.05
Nodes (38): Actorless Passive, All-Caps Emphasis, antislop-copywriting, Aphorism Formulas, Boldface Overuse, Chatbot Closers, Copywriting Skill Checklist, Draft, audit, final (+30 more)

### Community 17 - "dependencies"
Cohesion: 0.12
Nodes (16): dependencies, canvas-confetti, clsx, framer-motion, lucide-react, next, qrcode.react, react (+8 more)

### Community 18 - "realtime/src/index.ts"
Cohesion: 0.14
Nodes (9): app, gameManager, httpServer, io, store, TypedClientSocket, cors, express (+1 more)

### Community 19 - "handlers.ts"
Cohesion: 0.14
Nodes (7): TypedServer, emitSnapshotEvent(), getHostTokenFromRoom(), LimitedAck, rateLimiter, registerSocketHandlers(), TypedSocket

### Community 20 - "antislop-layoutmobile"
Cohesion: 0.06
Nodes (30): 100vh Sections, antislop-layoutmobile, Bottom Nav That Eats Content, Breakpoint Driven by Device List, Breakpoints, Columns That Don't Collapse, Desktop-Only Layout, Desktop-Sized Everything (+22 more)

### Community 21 - "rate-limit.ts"
Cohesion: 0.22
Nodes (4): EventState, RateVerdict, SocketRateLimiter, Window

### Community 22 - "devDependencies"
Cohesion: 0.17
Nodes (12): devDependencies, autoprefixer, eslint, eslint-config-next, @eslint/eslintrc, postcss, tailwindcss, @types/canvas-confetti (+4 more)

### Community 23 - "realtime/tsconfig.json"
Cohesion: 0.25
Nodes (7): compilerOptions, outDir, rootDir, exclude, extends, include, ../../tsconfig.base.json

### Community 24 - "db/tsconfig.json"
Cohesion: 0.25
Nodes (7): compilerOptions, outDir, rootDir, exclude, extends, include, ../../tsconfig.base.json

### Community 25 - "shared/tsconfig.json"
Cohesion: 0.25
Nodes (7): compilerOptions, outDir, rootDir, exclude, extends, include, ../../tsconfig.base.json

### Community 26 - "contrast-check.py"
Cohesion: 0.13
Nodes (18): contrast_ratio(), linearize(), luminance(), main(), parse_hex(), parse_pairing(), parse_reference_rows(), reference_doc_path() (+10 more)

### Community 27 - "scripts"
Cohesion: 0.33
Nodes (6): scripts, build, check-types, dev, lint, start

### Community 28 - "quizzes/route.ts"
Cohesion: 0.21
Nodes (10): CreateQuizBody, GET(), messageOf(), mockQuizzes, POST(), QuizSummary, StoredQuestion, StoredQuiz (+2 more)

### Community 29 - "antislop-human"
Cohesion: 0.10
Nodes (20): antislop-human, Broken Tab Order, Color & Contrast, Color-Only Feedback, Focus & States, How to use this skill, Human Skill Checklist, Keyboard (+12 more)

### Community 30 - "Comments That Add Nothing"
Cohesion: 0.11
Nodes (17): antislop-code, Code Comment Checklist, Comments That Add Nothing, Decorative Emoji, Decorative Separators, Empty Labels, End Markers, How It Should Read (+9 more)

### Community 34 - "Group 1: Hard Gate (absolute, no exceptions)"
Cohesion: 0.11
Nodes (18): Group 1: Hard Gate (absolute, no exceptions), R-02 — Copywriting, R-03 — Mobile Responsiveness, R-17 — Data & Numbers, R-18 — Testimonials, R-23 — Clarification & Visual Assets, R-24 — Navigation, R-25 — Color Contrast (+10 more)

### Community 35 - "Group 1: Hard Gate (absolute, no exceptions)"
Cohesion: 0.11
Nodes (18): Group 1: Hard Gate (absolute, no exceptions), R-02 — Copywriting, R-03 — Mobile Responsiveness, R-17 — Data & Numbers, R-18 — Testimonials, R-23 — Clarification & Visual Assets, R-24 — Navigation, R-25 — Color Contrast (+10 more)

### Community 36 - "Group 2: Purpose-Gate (technique allowed, purpose required)"
Cohesion: 0.15
Nodes (13): Group 2: Purpose-Gate (technique allowed, purpose required), R-01 — Color & Gradients, R-04 — Icons, R-06 — Typography, R-07 — Background, R-08 — Button Arrows, R-09 — Badges, R-10 — Glassmorphism (+5 more)

### Community 37 - "Group 2: Purpose-Gate (technique allowed, purpose required)"
Cohesion: 0.15
Nodes (13): Group 2: Purpose-Gate (technique allowed, purpose required), R-01 — Color & Gradients, R-04 — Icons, R-06 — Typography, R-07 — Background, R-08 — Button Arrows, R-09 — Badges, R-10 — Glassmorphism (+5 more)

### Community 38 - "Decorative Elements"
Cohesion: 0.17
Nodes (12): AI Capsule Badges, Colored Left Stripe, Decorative Elements, Decorative Status Dot, Emoji as Decoration, Eyebrow Badge Above the Headline, Fake Terminal Window, Generic AI Icons (+4 more)

### Community 39 - "SIQAP Design Guide (v0.2)"
Cohesion: 0.17
Nodes (11): 10. Yang jangan dilakukan, 1. Palet inti, 2. Tiga bobot oranye (aturan terpenting), 3. Warna jawaban, 4. Token di Tailwind, 5. Tipografi, 6. Gaya UI, 7. Penerapan per layar (+3 more)

### Community 40 - "antislop-ui"
Cohesion: 0.18
Nodes (10): antislop-ui, Dead Navigation, Endless Pulses and Loops, How to use this skill, Motion, Non-Functional Controls, Sections That Fill a Template, Structural & Flow (+2 more)

### Community 41 - "Layout & Components"
Cohesion: 0.18
Nodes (11): 4-Column Template Footer, Bento Grid, Copy-Paste Feature Cards, Demo Without a Product, "How It Works" Always 3 Steps, Layout & Components, Monotonous Template Layout, "Most Popular" Pricing Card (+3 more)

### Community 42 - "Visual & Color"
Cohesion: 0.18
Nodes (11): Background Grid, Dark Mode Default for No Reason, Excessive Accent Color, Excessive Border Radius, Excessive Glassmorphism, Generic Blue-Purple Gradient, Glow Everywhere, Overly Soft Shadows (+3 more)

### Community 43 - "store.ts"
Cohesion: 0.22
Nodes (6): QuizSummary, QuizzesPage(), HostState, PlayerState, useHostStore, zustand

### Community 45 - "Group 3: Quality Locks (consistency)"
Cohesion: 0.20
Nodes (10): Group 3: Quality Locks (consistency), R-05 — Layout & Page Structure, R-11 — Border Radius, R-15 — CTA (Call to Action), R-16 — Copywriting & Buzzwords, R-20 — Visual Identity, R-21 — Dark Mode, R-29 — Color Palette (+2 more)

### Community 46 - "Group 3: Quality Locks (consistency)"
Cohesion: 0.20
Nodes (10): Group 3: Quality Locks (consistency), R-05 — Layout & Page Structure, R-11 — Border Radius, R-15 — CTA (Call to Action), R-16 — Copywriting & Buzzwords, R-20 — Visual Identity, R-21 — Dark Mode, R-29 — Color Palette (+2 more)

### Community 47 - "play/[pin]/page.tsx"
Cohesion: 0.36
Nodes (7): JoinContent(), JoinPage(), OPTION_STYLES, PlayPage(), getSocket(), sounds, usePlayerStore

### Community 48 - "antislop"
Cohesion: 0.22
Nodes (8): Already installed, and the user asks how to update, antislop, Core Principle, First-Run Install Wizard, Functional Patterns, Part 2: Mandatory Rules (R-01 to R-38, grouped), Two Usage Modes, What This Is (and What It Isn't)

### Community 49 - "antislop"
Cohesion: 0.22
Nodes (8): Already installed, and the user asks how to update, antislop, Core Principle, First-Run Install Wizard, Functional Patterns, Part 2: Mandatory Rules (R-01 to R-38, grouped), Two Usage Modes, What This Is (and What It Isn't)

### Community 50 - "SIQAP: Prompt Pembuka per Agen"
Cohesion: 0.25
Nodes (7): Catatan koordinasi, Prompt 0: pembuka umum (tempel di awal prompt agen mana pun), Prompt A: Scaffold + inti game (Codex), Prompt B: Server realtime (OpenCode), Prompt C: UI (Gemini), Prompt D: Data, akun, dan AI generator (Antigravity), SIQAP: Prompt Pembuka per Agen

### Community 51 - "Part 1: AI Slop Patterns (Warning Signs)"
Cohesion: 0.25
Nodes (8): Accessibility, Copywriting & Content, Decorative Elements, Functionality & Content, Identity & Originality, Layout & Components, Part 1: AI Slop Patterns (Warning Signs), Visual & Color

### Community 52 - "App & Dashboard"
Cohesion: 0.25
Nodes (8): App & Dashboard, Charts Without a Question, Default Dashboard Shell, Filler Activity Feed, Filler Data in Fields and Columns, Generic Table Columns, Placeholder Empty and Loading States, Stat Cards With Invented Numbers

### Community 53 - "Part 1: AI Slop Patterns (Warning Signs)"
Cohesion: 0.25
Nodes (8): Accessibility, Copywriting & Content, Decorative Elements, Functionality & Content, Identity & Originality, Layout & Components, Part 1: AI Slop Patterns (Warning Signs), Visual & Color

### Community 54 - "eslint.config.mjs"
Cohesion: 0.25
Nodes (5): compat, __dirname, eslintConfig, __filename, @eslint/eslintrc

### Community 55 - "The Craftsmanship Standard"
Cohesion: 0.33
Nodes (6): C-1 — Intentionality, C-2 — Functional Completeness, C-3 — Content-Driven Composition, C-4 — Resilience, C-5 — Evidence Over Claims, The Craftsmanship Standard

### Community 56 - "The Craftsmanship Standard"
Cohesion: 0.33
Nodes (6): C-1 — Intentionality, C-2 — Functional Completeness, C-3 — Content-Driven Composition, C-4 — Resilience, C-5 — Evidence Over Claims, The Craftsmanship Standard

### Community 57 - "layout.tsx"
Cohesion: 0.33
Nodes (3): inter, metadata, montserrat

### Community 58 - "host/[pin]/page.tsx"
Cohesion: 0.40
Nodes (5): ActionErrorToast(), HostLivePage(), OPTION_THEMES, canvas-confetti, qrcode.react

### Community 60 - "Delivery Gate (Mandatory)"
Cohesion: 0.40
Nodes (5): Block 1: Hard Gate (absolute), Block 2: Purpose-Gate (technique allowed, reason required), Block 3: Liveliness (required to be alive, not just clean), Block 4: Craftsmanship & Quality Locks, Delivery Gate (Mandatory)

### Community 61 - "Delivery Gate (Mandatory)"
Cohesion: 0.40
Nodes (5): Block 1: Hard Gate (absolute), Block 2: Purpose-Gate (technique allowed, reason required), Block 3: Liveliness (required to be alive, not just clean), Block 4: Craftsmanship & Quality Locks, Delivery Gate (Mandatory)

### Community 62 - "Part 3: Liveliness Toolkit"
Cohesion: 0.50
Nodes (4): Design Read (how the dials are set), Levers (how the dials become visual decisions), Part 3: Liveliness Toolkit, Three Dials (required)

### Community 63 - "Part 3: Liveliness Toolkit"
Cohesion: 0.50
Nodes (4): Design Read (how the dials are set), Levers (how the dials become visual decisions), Part 3: Liveliness Toolkit, Three Dials (required)

### Community 64 - "profanity.ts"
Cohesion: 0.50
Nodes (3): BLOCKED_WORDS, isNicknameAllowed(), sanitizeNickname()

## Knowledge Gaps
- **583 isolated node(s):** `name`, `version`, `private`, `type`, `dev` (+578 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 655 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `next` to `web/package.json`, `store.ts`, `play/[pin]/page.tsx`, `layout.tsx`, `host/[pin]/page.tsx`, `quizzes/route.ts`?**
  _High betweenness centrality (0.044) - this node is a cross-community bridge._
- **What connects `name`, `version`, `private` to the rest of the system?**
  _583 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `MemorySessionStore` be split into smaller, more focused modules?**
  _Cohesion score 0.05649717514124294 - nodes in this community are weakly interconnected._
- **Why does `GameManager` connect `GameManager` to `realtime/src/index.ts`, `handlers.ts`, `game-manager.ts`?**
  _High betweenness centrality (0.023) - this node is a cross-community bridge._
- **Should `GameManager` be split into smaller, more focused modules?**
  _Cohesion score 0.10957910014513789 - nodes in this community are weakly interconnected._
- **Why does `socket.io` connect `realtime/src/index.ts` to `handlers.ts`, `game-manager.ts`, `realtime/package.json`?**
  _High betweenness centrality (0.022) - this node is a cross-community bridge._
- **Should `SIQAP Contract (v0.1)` be split into smaller, more focused modules?**
  _Cohesion score 0.07692307692307693 - nodes in this community are weakly interconnected._
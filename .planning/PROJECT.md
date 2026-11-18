# REV THE BEAST — ULTIMATE EDITION

## What This Is

REV THE BEAST is a premium automotive experience and genuinely playable browser racing simulator built with React, TypeScript, Three.js, and the Web Audio API. It bridges the thrilling driving experience of Forza Horizon, the nocturnal street racing atmosphere of Need for Speed, the engineering realism of Gran Turismo, and the visual fidelity of a high-end supercar configurator.

Tagline: **UNLEASH THE MACHINE.**
Headline: **BUILT TO BE DRIVEN.**

## Core Value

A genuinely playable, high-fidelity browser automotive platform featuring accurate vehicle physics, car-specific Web Audio engine synthesis, multi-mode circuit and drag racing with AI opponents, and deep visual/mechanical customization without placeholder features or paywalls.

## Requirements

### Validated
- ✓ [Core Three.js WebGL procedural and imported vehicle rendering models]
- ✓ [Initial Web Audio acoustic synthesis pipeline and multi-channel engine profiles]
- ✓ [Vehicle physics profiles for AI beasts, supercars, and electric drive units]
- ✓ [Dual-mode 3D WebGL / Studio Photo customizer architecture]

### Active
- [ ] **Phase 1: Complete Project Audit** — Comprehensive audit of pages, assets, navigation, audio instances, and state management.
- [ ] **Phase 2: Complete Visual Redesign** — Dark automotive aesthetic (deep black `#08080a`, graphite, racing crimson/amber accents, clean automotive typography, hero section, standard navigation: Home, Cars, Racing, Garage, Customization, About).
- [ ] **Phase 3: Ultimate Car Collection & Detail Pages** — Structured catalog across Hypercars, Supercars, Sports Cars, Muscle Cars, JDM, Track Cars, Electric Performance; dedicated detail view with 9-angle galleries, verified specs, audio controls, test drive, and race action buttons.
- [ ] **Phase 4: Realistic Individual Engine Sound System** — Dedicated audio configurations for every vehicle (startup, idle, acceleration, redline scream, gear shifts, deceleration backfire, turbo BOV, EV whine) using multi-oscillator Web Audio synthesis & crossfading.
- [ ] **Phase 5: Actual Playable Racing Simulator** — Real playable 3D Three.js racing across Quick Race, Time Trial, Drag Racing, and Free Drive; vehicle physics (mass, torque, drag, grip, drifting, speed-dependent steering); tracks (GP Circuit, Mountain Pass, Tokyo City Loop, Drag Strip); AI opponents with pathfinding and braking; complete Race HUD & mobile controls.
- [ ] **Phase 6: Personal Garage & Vehicle Fleet** — Vehicle inventory, custom build saving to localStorage, side-by-side spec comparisons, career stats tracking.
- [ ] **Phase 7: Visual & Mechanical Customization** — Paint finishes, rims, calipers, aero packages, engine/turbo/transmission/suspension stage upgrades directly modulating physics.
- [ ] **Phase 8: Race Results & Progression** — Finishing positions, lap times, top speed records, XP system, car unlocks, local achievements and leaderboard.
- [ ] **Phase 9: Environmental Audio & Ambiance** — Tire screeches, wind roar, curb rumbles, collision impulses, race countdowns, checkered flag fanfare.
- [ ] **Phase 10: Performance & Mobile Optimization** — Low/Medium/High graphics quality tiers, WebGL resize observer handling, touch overlays for mobile/tablet.
- [ ] **Phase 11: Code Quality & Security** — Clean modular separation of physics, audio, rendering, and UI; zero console warnings; strict TypeScript types.
- [ ] **Phase 12: Production Verification & Vercel Deployment** — End-to-end testing across desktop, tablet, and mobile; verified production build.

### Out of Scope
- Multiplayer networking / WebSocket backend — Local deterministic AI and local storage persistence fulfill requirements without paid servers or latency issues.
- Paid APIs / Subscriptions — All vehicle models, physics, audio, and textures are native zero-cost local assets or procedural WebGL shaders.
- Pre-rendered video cutscenes replacing gameplay — All driving and customization is real-time interactive 3D WebGL.

## Context
- Tech Stack: React 19, Vite 6, Tailwind CSS v4, Three.js (WebGL), Web Audio API, Lucide React, Framer Motion.
- Deployment Target: Vercel (`https://rev-the-beast.vercel.app/`).
- Repository: `https://github.com/shubhamkerure07/REV-THE-BEAST-`.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Procedural & GLB Hybrid 3D Engine | Guarantees instant load times and zero broken external 3D asset links while allowing full color/material customization | ✓ Good |
| Real-time Web Audio Synthesizer | Eliminates multi-megabyte sound pack downloads; allows dynamic pitch, throttle, load, and backfire modulation | ✓ Good |
| LocalStorage Persistence | High performance, instant save/load for garage, builds, lap times, and XP without requiring backend login | ✓ Good |
| Direct 3D Canvas Racing Loop | True physics engine with raycast/boundary checks rather than pre-baked css/canvas animations | ✓ Good |

---
*Last updated: 2026-11-18 after GSD project initiation*

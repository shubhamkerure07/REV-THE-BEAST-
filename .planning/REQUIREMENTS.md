# Requirements: REV THE BEAST — ULTIMATE EDITION

**Defined:** 2026-11-18
**Core Value:** A genuinely playable, high-fidelity browser automotive platform featuring accurate vehicle physics, car-specific Web Audio engine synthesis, multi-mode circuit and drag racing with AI opponents, and deep visual/mechanical customization without placeholder features or paywalls.

## v1 Requirements

### Phase 1: Codebase Audit & Foundation (AUDIT)
- [ ] **AUDIT-01**: Complete audit of all existing components, broken button handlers, and console warnings.
- [ ] **AUDIT-02**: Validate all vehicle catalog entries, ensuring zero broken image URLs or undefined property accesses.
- [ ] **AUDIT-03**: Verify audio synthesizer lifecycle to prevent leaked audio nodes or audio context desync.

### Phase 2: Visual Identity & Navigation (VISUAL)
- [ ] **VISUAL-01**: Dark automotive theme with `#08080a` obsidian base, graphite panels, and racing crimson/amber accents.
- [ ] **VISUAL-02**: Universal header navigation with direct routes: Home, Cars, Racing, Garage, Customization, About.
- [ ] **VISUAL-03**: Cinematic homepage with "BUILT TO BE DRIVEN", working action buttons ("Explore Cars", "Enter Racing"), featured machine carousel, and performance metrics.
- [ ] **VISUAL-04**: Dedicated About modal/page highlighting automotive engineering principles, simulator specs, and audio architecture.

### Phase 3: Ultimate Vehicle Catalog & Car Details (CARS)
- [ ] **CARS-01**: Comprehensive structured vehicle database categorizing Hypercars, Supercars, Sports Cars, Muscle, JDM, Track Cars, and Electric Performance.
- [ ] **CARS-02**: Verified realistic technical specs for every model (engine, powerHp, torqueNm, topSpeedKmh, 0-100 time, curb weight, redline, drivetrain).
- [ ] **CARS-03**: Dedicated Car Detail view with high-res angle gallery, interactive acoustic audition pad, technical breakdown, and direct "Customize", "Test Drive", and "Race Now" triggers.
- [ ] **CARS-04**: Real-time search, category filtering, and sorting (by HP, 0-100 time, top speed).

### Phase 4: Individual Vehicle Engine Sound System (AUDIO)
- [ ] **AUDIO-01**: Unique acoustic profiles for each car category (V12 Symphony, Flat-Plane V8, Twin-Turbo V8, High-Rev Inline-6, Screaming Supercharged Inline-4, Parallel Twin, Quad-Motor Electric).
- [ ] **AUDIO-02**: Dynamic Web Audio synthesis responding to RPM, throttle position, engine load, and gear ratio.
- [ ] **AUDIO-03**: Realistic operational sound routines: Cold start ignition, idle rumble, acceleration scream, redline limiter cut, deceleration backfire pops, turbo blow-off flutter, and electric regenerative whine.
- [ ] **AUDIO-04**: Master and channel volume mixer (Engine, Exhaust, Tires, Wind, Ambience) with mute toggles and browser autoplay unlock indicator.

### Phase 5: Playable 3D Racing Simulator (SIM)
- [ ] **SIM-01**: Real-time Three.js 3D playable racing loop with user-controlled steering, throttle, braking, handbrake, and manual/auto transmission.
- [ ] **SIM-02**: Four distinct playable game modes: Quick Race (with AI grid), Time Trial (lap timer & ghost delta), Drag Racing (Christmas tree lights, reaction timer, 0-100 & 1/4 mile timing), and Free Drive.
- [ ] **SIM-03**: Four playable race tracks: Nürburgring Nordschleife (GP circuit), Big Sur Mountain Pass, Tokyo C1 Shuto Expressway, and Santa Pod Drag Strip.
- [ ] **SIM-04**: Fully functional AI opponents with track node navigation, braking point calculations, overtaking maneuvers, and collision avoidance.
- [ ] **SIM-05**: Dynamic Race HUD displaying analog/digital tachometer, speedometer in km/h, gear indicator, boost gauge, lap counter, position, mini-map, and countdown sequence.
- [ ] **SIM-06**: Multi-camera director: Third-person chase cam, low bumper/hood cam, and cockpit dashboard cam.
- [ ] **SIM-07**: Responsive mobile touch overlay controls (on-screen throttle, brake, tilt/steer buttons).

### Phase 6: Personal Garage & Fleet Management (GARAGE)
- [ ] **GARAGE-01**: Interactive garage showroom allowing users to switch active vehicles and view stats.
- [ ] **GARAGE-02**: LocalStorage persistence for user custom builds, equipped performance packages, and unlock status.
- [ ] **GARAGE-03**: Side-by-side vehicle comparison tool evaluating power-to-weight, top speed, and quarter-mile estimates.

### Phase 7: Deep Visual & Mechanical Customization (CUSTOM)
- [ ] **CUSTOM-01**: Visual customization: curated motorsport colors, paint finishes (gloss, metallic, matte, frozen), alloy wheels, brake caliper accents, aerodynamic splitters, and wings.
- [ ] **CUSTOM-02**: Interactive 3D WebGL preview with 360° orbit rotation, lighting controls, and studio photo mode.
- [ ] **CUSTOM-03**: Mechanical stage upgrades: Stage 1/2/3 ECU, Race Turbo, Competition Exhaust, Slicks/Semi-Slicks, and Carbon Ceramic Brakes that directly alter vehicle physics simulation parameters.

### Phase 8: Results, Telemetry & Career Progression (PROGRESS)
- [ ] **PROGRESS-01**: Post-race telemetry breakdown: finishing rank, lap times, top speed achieved, average speed, and sector splits.
- [ ] **PROGRESS-02**: XP progression system unlocking high-tier hypercars and specialized racing liveries.
- [ ] **PROGRESS-03**: Local records and personal best leaderboard persisted across sessions.

### Phase 9: Dynamic Environmental Acoustics (ENV)
- [ ] **ENV-01**: Dynamic tire squeal and drift screech synthesized in Web Audio based on slip angle and lateral G forces.
- [ ] **ENV-02**: Speed-dependent wind rush and atmospheric tunnel reverberation.
- [ ] **ENV-03**: Audio feedback for start countdown beeps, checkpoint passes, and finish line celebrations.

### Phase 10: Performance & Mobile Optimization (PERF)
- [ ] **PERF-01**: Graphics quality selector (Low: lower shadows/particles, Medium: balanced, High: full post-processing & anisotropic filtering).
- [ ] **PERF-02**: Seamless responsive layout for desktop, tablet, and mobile displays without UI clipping or overflow.

### Phase 11 & 12: Code Quality, Verification & Production Deployment (SHIP)
- [ ] **SHIP-01**: Modular component architecture with zero TypeScript errors and zero runtime console warnings.
- [ ] **SHIP-02**: Successful production build (`npm run build`) and deployment to Vercel.

## Traceability Matrix

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUDIT-01..03 | Phase 1 | Pending |
| VISUAL-01..04 | Phase 2 | Pending |
| CARS-01..04 | Phase 3 | Pending |
| AUDIO-01..04 | Phase 4 | Pending |
| SIM-01..07 | Phase 5 | Pending |
| GARAGE-01..03 | Phase 6 | Pending |
| CUSTOM-01..03 | Phase 7 | Pending |
| PROGRESS-01..03 | Phase 8 | Pending |
| ENV-01..03 | Phase 9 | Pending |
| PERF-01..02 | Phase 10 | Pending |
| SHIP-01..02 | Phase 11-12 | Pending |

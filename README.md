# FreshFlower.zone — Phase 0 Preview

Client preview build for a premium Delhi NCR flower business. See `PROJECT_CONTEXT.md`
for the full stack, design system, data model, and phase log.

## Setup

```bash
npm install
npm run dev
```

Then open http://localhost:3000 — you'll see the Phase 0 design-token sanity-check
screen (color swatches, both fonts, a sample glass card, sample buttons). This route
(`src/app/page.tsx`) is a temporary check only and will be deleted in Phase 1 once
real homepage sections are built.

## Structure

```
src/
  app/                 routes (App Router)
  components/
    ui/                reusable primitives (Button, Card, Badge, Input, Modal)
    sections/          homepage sections & layout blocks — empty, Phase 1
    three/              R3F/drei 3D components — empty, Phase 1+
  lib/
    data/              dummy data (flowers, categories, orders, etc.) — active in preview
    types/             TypeScript interfaces for every entity
    db/                Mongoose connection + schemas — written, NOT active in preview
  styles/              reserved for shared style modules beyond globals.css
```

No live database calls happen in this build. All data is read from `src/lib/data/*.ts`.

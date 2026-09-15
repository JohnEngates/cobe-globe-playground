# cobe globe playground

A small Vite + React + TypeScript playground for [`cobe`](https://github.com/shuding/cobe) (v2): a draggable WebGL globe with San Antonio (SAT) and South Bend (SBN) markers, an SAT → SBN arc, and Notre Dame blue/gold themes (light / dark / dusk).

Inspired by the Cursor tech-demos cobe page.

## Requirements

- Node.js 20+ recommended
- npm

## Install

```bash
cd ~/projects/cobe-globe-playground
npm install
```

## Develop

```bash
npm run dev
```

Open the printed local URL (usually `http://localhost:5173`).

## Build

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Notes

- Drag the globe to rotate. It auto-rotates slowly when idle.
- Theme buttons update cobe colors live.
- Marker labels use CSS Anchor Positioning when the browser supports it.

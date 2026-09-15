import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import createGlobe, { type COBEOptions, type Globe } from 'cobe'
import './App.css'

type Theme = 'light' | 'dark' | 'dusk'

const SAT: [number, number] = [29.4241, -98.4936]
const SBN: [number, number] = [41.6764, -86.252]

const THEMES: Record<
  Theme,
  Pick<
    COBEOptions,
    | 'dark'
    | 'baseColor'
    | 'markerColor'
    | 'glowColor'
    | 'mapBrightness'
    | 'diffuse'
    | 'arcColor'
  >
> = {
  light: {
    dark: 0,
    baseColor: [0.93, 0.93, 0.95],
    markerColor: [0.788, 0.592, 0],
    glowColor: [0.85, 0.88, 0.95],
    mapBrightness: 4.2,
    diffuse: 1.3,
    arcColor: [0.047, 0.137, 0.251],
  },
  dark: {
    dark: 1,
    baseColor: [0.047, 0.137, 0.251],
    markerColor: [0.788, 0.592, 0],
    glowColor: [0.12, 0.2, 0.35],
    mapBrightness: 5.8,
    diffuse: 1.2,
    arcColor: [0.788, 0.592, 0],
  },
  dusk: {
    dark: 0.65,
    baseColor: [0.08, 0.12, 0.22],
    markerColor: [0.9, 0.7, 0.15],
    glowColor: [0.25, 0.18, 0.08],
    mapBrightness: 5.2,
    diffuse: 1.25,
    arcColor: [0.788, 0.592, 0],
  },
}

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const globeRef = useRef<Globe | null>(null)
  const pointerRef = useRef<{
    dragging: boolean
    x: number
    y: number
    phi: number
    theta: number
  }>({ dragging: false, x: 0, y: 0, phi: 2.2, theta: 0.25 })
  const phiRef = useRef(2.2)
  const thetaRef = useRef(0.25)
  const [theme, setTheme] = useState<Theme>('dark')
  const [size, setSize] = useState(720)

  useEffect(() => {
    const update = () => {
      const w = Math.min(window.innerWidth - 48, 820)
      setSize(Math.max(320, w))
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const width = size * 2
    const t = THEMES[theme]
    const globe = createGlobe(canvas, {
      devicePixelRatio: 2,
      width,
      height: width,
      phi: phiRef.current,
      theta: thetaRef.current,
      scale: 1.05,
      mapSamples: 18000,
      offset: [0, 0],
      markerElevation: 0.02,
      arcWidth: 0.55,
      arcHeight: 0.28,
      ...t,
      markers: [
        { location: SAT, size: 0.05, id: 'sat', color: t.markerColor },
        { location: SBN, size: 0.05, id: 'sbn', color: t.markerColor },
      ],
      arcs: [
        {
          from: SAT,
          to: SBN,
          id: 'sat-sbn',
          color: t.arcColor,
        },
      ],
    })
    globeRef.current = globe

    let frame = 0
    const tick = () => {
      if (!pointerRef.current.dragging) {
        phiRef.current += 0.0025
      }
      globe.update({
        phi: phiRef.current,
        theta: thetaRef.current,
        width,
        height: width,
      })
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(frame)
      globe.destroy()
      globeRef.current = null
    }
  }, [size])

  useEffect(() => {
    const globe = globeRef.current
    if (!globe) return
    const t = THEMES[theme]
    globe.update({
      ...t,
      markers: [
        { location: SAT, size: 0.05, id: 'sat', color: t.markerColor },
        { location: SBN, size: 0.05, id: 'sbn', color: t.markerColor },
      ],
      arcs: [
        {
          from: SAT,
          to: SBN,
          id: 'sat-sbn',
          color: t.arcColor,
        },
      ],
    })
  }, [theme])

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
    pointerRef.current = {
      dragging: true,
      x: e.clientX,
      y: e.clientY,
      phi: phiRef.current,
      theta: thetaRef.current,
    }
  }, [])

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    const p = pointerRef.current
    if (!p.dragging) return
    const dx = e.clientX - p.x
    const dy = e.clientY - p.y
    phiRef.current = p.phi + dx / 180
    thetaRef.current = Math.max(-0.8, Math.min(0.8, p.theta + dy / 250))
  }, [])

  const onPointerUp = useCallback(() => {
    pointerRef.current.dragging = false
  }, [])

  const themes = useMemo(() => ['light', 'dark', 'dusk'] as Theme[], [])

  return (
    <div className={`app theme-${theme}`} data-theme={theme}>
      <header className="header">
        <div>
          <h1>ND Leave No Doubt<br />Tour 2026</h1>
          <p className="sub">drag the globe · San Antonio → South Bend</p>
        </div>
        <div className="themes" role="group" aria-label="Theme">
          {themes.map((t) => (
            <button
              key={t}
              type="button"
              className={theme === t ? 'active' : undefined}
              onClick={() => setTheme(t)}
            >
              {t}
            </button>
          ))}
        </div>
      </header>

      <main className="stage">
        <div className="globe-wrap" style={{ width: size, height: size }}>
          <canvas
            ref={canvasRef}
            className="globe"
            width={size * 2}
            height={size * 2}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
          />
          <span className="marker-label label-sat">San Antonio</span>
          <span className="marker-label label-sbn">South Bend</span>
        </div>
      </main>

      <footer className="footer">
        <a href="https://github.com/shuding/cobe" target="_blank" rel="noreferrer">
          cobe
        </a>
        <span>·</span>
        <span>WebGL globe playground</span>
      </footer>
    </div>
  )
}

export default App

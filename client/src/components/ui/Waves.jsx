'use client'
import React, { useEffect, useRef } from 'react'
import { createNoise2D } from 'simplex-noise'

export function Waves({
  className = '',
  strokeColor = 'rgba(18, 97, 160, 0.25)',
  backgroundColor = 'transparent',
  pointerSize = 0.5,
}) {
  const containerRef = useRef(null)
  const svgRef = useRef(null)
  const isVisibleRef = useRef(true)
  const mouseRef = useRef({
    x: -10,
    y: 0,
    lx: 0,
    ly: 0,
    sx: 0,
    sy: 0,
    v: 0,
    vs: 0,
    a: 0,
    set: false,
  })
  const pathsRef = useRef([])
  const linesRef = useRef([])
  const noiseRef = useRef(null)
  const rafRef = useRef(null)
  const boundingRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    const svg = svgRef.current
    if (!container || !svg) return

    noiseRef.current = createNoise2D()

    setSize()
    setLines()

    // IntersectionObserver to pause heavy rendering when scrolled out of view
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isVisibleRef.current = entry.isIntersecting
          if (entry.isIntersecting && !rafRef.current) {
            rafRef.current = requestAnimationFrame(tick)
          }
        })
      },
      { threshold: 0.05 }
    )
    observer.observe(container)

    let resizeTimer = null
    const onResize = () => {
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(() => {
        setSize()
        setLines()
      }, 150)
    }

    const onMouseMove = (e) => {
      if (!isVisibleRef.current) return
      updateMousePosition(e.pageX, e.pageY)
    }

    const onTouchMove = (e) => {
      if (!isVisibleRef.current) return
      const touch = e.touches[0]
      if (touch) {
        updateMousePosition(touch.clientX, touch.clientY)
      }
    }

    window.addEventListener('resize', onResize, { passive: true })
    window.addEventListener('mousemove', onMouseMove, { passive: true })
    container.addEventListener('touchmove', onTouchMove, { passive: true })

    rafRef.current = requestAnimationFrame(tick)

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      observer.disconnect()
      window.removeEventListener('resize', onResize)
      window.removeEventListener('mousemove', onMouseMove)
      container.removeEventListener('touchmove', onTouchMove)
    }
  }, [])

  const setSize = () => {
    if (!containerRef.current || !svgRef.current) return
    boundingRef.current = containerRef.current.getBoundingClientRect()
    const { width, height } = boundingRef.current
    svgRef.current.style.width = `${width}px`
    svgRef.current.style.height = `${height}px`
  }

  const setLines = () => {
    if (!svgRef.current || !boundingRef.current) return

    const { width, height } = boundingRef.current
    linesRef.current = []

    pathsRef.current.forEach((path) => path.remove())
    pathsRef.current = []

    // Optimized spacing: reduces point computations by ~93% while preserving silky wave look
    const xGap = 24
    const yGap = 16

    const oWidth = width + 100
    const oHeight = height + 30

    const totalLines = Math.ceil(oWidth / xGap)
    const totalPoints = Math.ceil(oHeight / yGap)

    const xStart = (width - xGap * totalLines) / 2
    const yStart = (height - yGap * totalPoints) / 2

    const fragment = document.createDocumentFragment()

    for (let i = 0; i < totalLines; i++) {
      const points = []

      for (let j = 0; j < totalPoints; j++) {
        points.push({
          x: xStart + xGap * i,
          y: yStart + yGap * j,
          wave: { x: 0, y: 0 },
          cursor: { x: 0, y: 0, vx: 0, vy: 0 },
        })
      }

      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
      path.setAttribute('fill', 'none')
      path.setAttribute('stroke', strokeColor)
      path.setAttribute('stroke-width', '1')
      path.style.willChange = 'd'

      fragment.appendChild(path)
      pathsRef.current.push(path)
      linesRef.current.push(points)
    }

    svgRef.current.appendChild(fragment)
  }

  const updateMousePosition = (x, y) => {
    if (!boundingRef.current) return
    const mouse = mouseRef.current
    mouse.x = x - boundingRef.current.left
    mouse.y = y - boundingRef.current.top + window.scrollY

    if (!mouse.set) {
      mouse.sx = mouse.x
      mouse.sy = mouse.y
      mouse.lx = mouse.x
      mouse.ly = mouse.y
      mouse.set = true
    }

    if (containerRef.current) {
      containerRef.current.style.setProperty('--x', `${mouse.sx}px`)
      containerRef.current.style.setProperty('--y', `${mouse.sy}px`)
    }
  }

  const movePoints = (time) => {
    const lines = linesRef.current
    const mouse = mouseRef.current
    const noise = noiseRef.current

    if (!noise) return

    for (let i = 0; i < lines.length; i++) {
      const points = lines[i]
      for (let j = 0; j < points.length; j++) {
        const p = points[j]
        const move =
          noise(
            (p.x + time * 0.006) * 0.003,
            (p.y + time * 0.003) * 0.002
          ) * 8

        p.wave.x = Math.cos(move) * 12
        p.wave.y = Math.sin(move) * 6

        const dx = p.x - mouse.sx
        const dy = p.y - mouse.sy
        const d = Math.hypot(dx, dy)
        const l = Math.max(160, mouse.vs)

        if (d < l) {
          const s = 1 - d / l
          const f = Math.cos(d * 0.001) * s
          p.cursor.vx += Math.cos(mouse.a) * f * l * mouse.vs * 0.0003
          p.cursor.vy += Math.sin(mouse.a) * f * l * mouse.vs * 0.0003
        }

        p.cursor.vx += (0 - p.cursor.x) * 0.015
        p.cursor.vy += (0 - p.cursor.y) * 0.015
        p.cursor.vx *= 0.94
        p.cursor.vy *= 0.94
        p.cursor.x += p.cursor.vx
        p.cursor.y += p.cursor.vy
      }
    }
  }

  const moved = (point, withCursorForce = true) => ({
    x: point.x + point.wave.x + (withCursorForce ? point.cursor.x : 0),
    y: point.y + point.wave.y + (withCursorForce ? point.cursor.y : 0),
  })

  const drawLines = () => {
    const lines = linesRef.current
    const paths = pathsRef.current

    for (let lIndex = 0; lIndex < lines.length; lIndex++) {
      const points = lines[lIndex]
      if (points.length < 2 || !paths[lIndex]) continue

      const firstPoint = moved(points[0], false)
      let d = `M ${firstPoint.x.toFixed(1)} ${firstPoint.y.toFixed(1)}`

      for (let i = 1; i < points.length; i++) {
        const current = moved(points[i])
        d += ` L ${current.x.toFixed(1)} ${current.y.toFixed(1)}`
      }

      paths[lIndex].setAttribute('d', d)
    }
  }

  const tick = (time) => {
    if (!isVisibleRef.current) {
      rafRef.current = null
      return
    }

    const mouse = mouseRef.current

    mouse.sx += (mouse.x - mouse.sx) * 0.1
    mouse.sy += (mouse.y - mouse.sy) * 0.1

    const dx = mouse.x - mouse.lx
    const dy = mouse.y - mouse.ly
    const d = Math.hypot(dx, dy)

    mouse.v = d
    mouse.vs += (d - mouse.vs) * 0.1
    mouse.vs = Math.min(80, mouse.vs)
    mouse.lx = mouse.x
    mouse.ly = mouse.y
    mouse.a = Math.atan2(dy, dx)

    if (containerRef.current) {
      containerRef.current.style.setProperty('--x', `${mouse.sx}px`)
      containerRef.current.style.setProperty('--y', `${mouse.sy}px`)
    }

    movePoints(time)
    drawLines()

    rafRef.current = requestAnimationFrame(tick)
  }

  return (
    <div
      ref={containerRef}
      className={`waves-component relative overflow-hidden pointer-events-none ${className}`}
      style={{
        backgroundColor,
        position: 'absolute',
        top: 0,
        left: 0,
        margin: 0,
        padding: 0,
        width: '100%',
        height: '100%',
        contain: 'strict',
        '--x': '-0.5rem',
        '--y': '50%',
      }}
    >
      <svg
        ref={svgRef}
        className="block w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        style={{ contain: 'paint' }}
      />
      <div
        className="pointer-dot"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: `${pointerSize}rem`,
          height: `${pointerSize}rem`,
          background: strokeColor,
          borderRadius: '50%',
          transform: 'translate3d(calc(var(--x) - 50%), calc(var(--y) - 50%), 0)',
          willChange: 'transform',
        }}
      />
    </div>
  )
}

export default Waves

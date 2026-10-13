import { useEffect, useRef, useState } from 'react'
import { ACCENT_EVENT, accentBase, shade } from '../../lib/accent'
import { currentDeviceTier, maxCanvasPixelRatio } from '../../lib/deviceTier'
import { gpuLite } from '../../lib/gpuLite'
import { VIEW_PREFS_EVENT, bgAnimOn } from '../../state/viewPrefs'
import { makePal, paintScene } from './stageArt'

/** Спокойный монохромный фон: статичный градиент и лёгкий перелив светом. */

interface Scene {
  W: number
  H: number
  base: HTMLCanvasElement
}

function build(w: number, h: number, dpr: number, stage: boolean): Scene {
  const W = Math.round(w * dpr)
  const H = Math.round(h * dpr)
  return { W, H, base: paintScene(W, H, dpr, makePal(accentBase(), shade), stage) }
}

export function PixelField({ on }: { on: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null)
  const [anim, setAnim] = useState(false)

  useEffect(() => {
    const cv = ref.current
    if (!cv || !on) {
      setAnim(false)
      return
    }
    const ctx = cv.getContext('2d', { alpha: false })
    if (!ctx) return
    const lite = gpuLite()
    const still = () => lite || matchMedia('(prefers-reduced-motion: reduce)').matches || !bgAnimOn()
    setAnim(!still())
    let scene: Scene | null = null
    const fit = () => {
      const r = cv.getBoundingClientRect()
      if (!r.width || !r.height) return
      const dpr = lite ? 1 : Math.min(window.devicePixelRatio || 1, 1.5, maxCanvasPixelRatio(currentDeviceTier()))
      scene = build(r.width, r.height, dpr, !!cv.closest('.lobby'))
      cv.width = scene.W
      cv.height = scene.H
      ctx.drawImage(scene.base, 0, 0)
    }
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(cv)
    let recolor = 0
    const onAccent = () => {
      clearTimeout(recolor)
      recolor = window.setTimeout(fit, 150)
    }
    window.addEventListener(ACCENT_EVENT, onAccent)
    const onPrefs = () => setAnim(!still())
    window.addEventListener(VIEW_PREFS_EVENT, onPrefs)
    return () => {
      ro.disconnect()
      clearTimeout(recolor)
      window.removeEventListener(ACCENT_EVENT, onAccent)
      window.removeEventListener(VIEW_PREFS_EVENT, onPrefs)
    }
  }, [on])

  return (
    <>
      <canvas ref={ref} className="pixel-field" aria-hidden="true" />
      <div className={'pixel-glow' + (anim ? '' : ' off')} aria-hidden="true" />
    </>
  )
}

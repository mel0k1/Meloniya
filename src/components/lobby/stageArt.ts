/**
 * Спокойный монохромный фон: гладкий радиальный градиент от светлого центра
 * к тёмным краям, под героем — светлое пятно и тень. Палитра выводится из
 * цвета кнопок и перекрашивается вместе с ним.
 */

export interface Pal {
  glowCore: string
  glowMid: string
  glowEdge: string
  glowDeep: string
}

function luma(hex: string) {
  const n = parseInt(hex.slice(1), 16)
  return (0.2126 * (n >> 16 & 255) + 0.7152 * (n >> 8 & 255) + 0.0722 * (n & 255)) / 255
}

export function makePal(c: string, shade: (hex: string, amt: number) => string): Pal {
  const pale = luma(c) > 0.62
  return {
    glowCore: pale ? mix(c, '#000000', 0.12) : shade(c, 0.32),
    glowMid: mix(c, '#000000', pale ? 0.5 : 0.18),
    glowEdge: mix(c, '#000000', pale ? 0.6 : 0.34),
    glowDeep: mix(c, '#000000', pale ? 0.68 : 0.5),
  }
}

function mk(w: number, h: number) {
  const c = document.createElement('canvas')
  c.width = Math.max(1, Math.ceil(w))
  c.height = Math.max(1, Math.ceil(h))
  return c
}

function ctx2d(c: HTMLCanvasElement) {
  const g = c.getContext('2d')!
  g.imageSmoothingEnabled = true
  g.imageSmoothingQuality = 'high'
  return g
}

/** Эллипс радиального градиента: стопы [доля радиуса, альфа]. */
function ellipseGlow(
  g: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  color: string,
  stops: [number, number][],
) {
  g.save()
  g.translate(cx, cy)
  g.scale(1, ry / rx)
  const rg = g.createRadialGradient(0, 0, 0, 0, 0, rx)
  for (const [t, a] of stops) rg.addColorStop(t, 'rgba(' + color + ',' + a + ')')
  g.fillStyle = rg
  g.fillRect(-rx, -rx, rx * 2, rx * 2)
  g.restore()
}

const FEET_AT = 0.77

/**
 * Узор фона: пиксельные значки Minecraft 8×8 шахматным порядком.
 * Строки — пиксели значка, '#' — закрашено.
 */
export const MOTIFS: string[][] = [
  // крипер
  ['########', '########', '##..##..', '##..##..', '###..###', '##....##', '##....##', '##.##.##'].map((r) => r.replace(/#/g, 'x').replace(/\./g, '#').replace(/x/g, '.')),
  // кирка
  ['.######.', '#......#', '...##...', '...##...', '...##...', '...##...', '...##...', '...##...'],
  // меч
  ['......##', '.....###', '....###.', '#..###..', '.####...', '..##....', '.#.#....', '#.......'],
  // алмаз
  ['..####..', '.#....#.', '#......#', '.#....#.', '..#..#..', '...##...', '........', '........'],
  // сердце
  ['.##..##.', '########', '########', '########', '.######.', '..####..', '...##...', '........'],
  // блок травы
  ['########', '#.#.#.##', '########', '#......#', '#..#...#', '#.....##', '#...#..#', '########'],
]

export function paintScene(
  W: number,
  H: number,
  dpr: number,
  pal: Pal,
  stage: boolean,
) {
  const c = mk(W, H)
  const g = ctx2d(c)
  const cx = W / 2
  const cy = H * 0.5
  const rg = g.createRadialGradient(cx, cy, 0, cx, cy, Math.hypot(W, H) * 0.55)
  rg.addColorStop(0, pal.glowCore)
  rg.addColorStop(0.3, pal.glowCore)
  rg.addColorStop(0.62, pal.glowMid)
  rg.addColorStop(0.85, pal.glowEdge)
  rg.addColorStop(1, pal.glowDeep)
  g.fillStyle = rg
  g.fillRect(0, 0, W, H)

  if (stage) {
    ellipseGlow(g, cx, H * FEET_AT + 2 * dpr, W * 0.2, H * 0.05, '255,255,255', [
      [0, 0.16],
      [0.6, 0.07],
      [1, 0],
    ])
    ellipseGlow(g, cx, H * FEET_AT + 4 * dpr, W * 0.085, H * 0.02, '0,0,0', [
      [0, 0.38],
      [0.55, 0.2],
      [1, 0],
    ])
  }

  const bg = g.createLinearGradient(0, H * 0.7, 0, H)
  bg.addColorStop(0, 'rgba(0,0,0,0)')
  bg.addColorStop(1, 'rgba(0,0,0,0.28)')
  g.fillStyle = bg
  g.fillRect(0, H * 0.7, W, H * 0.3)
  return c
}

function hexRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, (n & 255)]
}
function toHexStr(r: number, g: number, b: number) {
  const h = (v: number) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')
  return '#' + h(r) + h(g) + h(b)
}
export function mix(a: string, b: string, k: number) {
  const x = hexRgb(a)
  const y = hexRgb(b)
  return toHexStr(x[0] + (y[0] - x[0]) * k, x[1] + (y[1] - x[1]) * k, x[2] + (y[2] - x[2]) * k)
}

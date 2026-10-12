import { PxIcon } from '../PxIcon'
import { setScreen } from '../../state/ui'
import type { ScreenId } from '../../state/ui'
import { preloadScreen } from '../../screens/registry'

/* Нижний док лобби Мелонии: разделы собраны в одну строгую полосу внизу,
   шапка сверху остаётся для аккаунта и друзей. */

const TABS: { id: ScreenId; label: string; icon: string }[] = [
  { id: 'play', label: 'Лобби', icon: 'blocks' },
  { id: 'playhub', label: 'Библиотека', icon: 'book' },
  { id: 'mods', label: 'Каталог', icon: 'grid' },
  { id: 'servers', label: 'Серверы', icon: 'server' },
  { id: 'skins', label: 'Скины', icon: 'shirt' },
  { id: 'rubies', label: 'Магазин', icon: 'gem' },
  { id: 'hosting', label: 'Хостинг', icon: 'server-cog' },
]

export function LobbyDock() {
  return (
    <nav className="mln-dock" aria-label="Разделы">
      {TABS.map((t) => (
        <button
          key={t.id}
          className={'mln-dock-item' + (t.id === 'play' ? ' on' : '')}
          data-sound="nav"
          data-track={'nav_' + t.id}
          onMouseEnter={() => preloadScreen(t.id)}
          onClick={() => setScreen(t.id)}
        >
          <PxIcon name={t.icon} size={20} />
          <span>{t.label}</span>
        </button>
      ))}
    </nav>
  )
}

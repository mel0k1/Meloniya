import { overlayVoice, type OverlayVoiceHud } from '../ipc/commands'
import { hasTauri } from '../ipc/tauri'
import { useCall } from '../state/call'
import { useGame } from '../state/game'
import { useGameNick } from '../state/gameNick'

/**
 * Мост разговора в оверлей: снимок состава и флагов речи уезжает в полоску HUD
 * при каждой осмысленной перемене. Уровни громкости в снимок не входят — они
 * меняются десятки раз в секунду, а оверлею нужен только ответ «кто говорит».
 * HUD показывается поверх игры: без игры снимок уходит с live:false, и окно
 * оверлея вправе уснуть.
 */
export function initOverlayVoice() {
  if (!hasTauri()) return
  let last = ''
  const push = () => {
    const c = useCall.getState()
    const hud: OverlayVoiceHud = {
      live: c.status === 'active' && useGame.getState().list.length > 0,
      title: c.mode === 'room' ? c.roomTitle || 'Группа' : c.peerNick || 'Друг',
      self: { nick: useGameNick.getState().name, speaking: c.speaking, muted: c.muted, deafened: c.deafened },
      peers: c.parts.map((p) => ({ id: p.userId, nick: p.nick, speaking: p.speaking, muted: p.muted })),
    }
    const key = JSON.stringify(hud)
    if (key === last) return
    last = key
    void overlayVoice(hud).catch(() => {})
  }
  useCall.subscribe(push)
  useGame.subscribe(push)
}

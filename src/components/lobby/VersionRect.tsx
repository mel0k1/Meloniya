import { useEffect, useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { BuildIcon } from '../playhub/BuildIcon'
import { PxIcon } from '../PxIcon'
import { LOADER_NAME } from '../../lib/format'
import { useProfiles } from '../../state/profiles'
import { useLobby, sameMode } from '../../state/lobbyMode'
import type { LobbyMode } from '../../state/lobbyMode'
import { ensureMcVersionList, useMcVersionList } from '../../state/mcVersionList'
import { playMode } from '../../lib/lobbyPlay'
import { setScreen } from '../../state/ui'

/* Прямоугольник версий в лобби Мелонии: свои сборки и релизы Minecraft
   в одном листающемся списке. Клик — выбрать для «Играть», стрелка —
   запустить сразу. */

export function VersionRect({ on }: { on: boolean }) {
  const profiles = useProfiles((s) => s.profiles)
  const picked = useLobby((s) => s.picked)
  const versions = useMcVersionList((s) => s.list)
  const [tab, setTab] = useState(profiles.length ? 'builds' : 'versions')
  const releases = versions.filter((v) => v.kind === 'release').slice(0, 80)

  useEffect(() => {
    if (on) void ensureMcVersionList().catch(() => {})
  }, [on])

  const pick = (m: LobbyMode) => useLobby.getState().pick(m)
  const pickAndPlay = (m: LobbyMode) => {
    pick(m)
    void playMode(m, profiles)
  }

  return (
    <div className="mln-rect">
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="mln-rect-tabs">
          <TabsTrigger value="builds">
            Сборки{profiles.length ? <span className="mln-rect-n">{profiles.length}</span> : null}
          </TabsTrigger>
          <TabsTrigger value="versions">Версии</TabsTrigger>
        </TabsList>

        <TabsContent value="builds" className="mln-rect-body">
          <ScrollArea className="mln-rect-scroll">
            <div className="mln-rect-list">
              {profiles.length ? (
                profiles.map((p) => {
                  const m: LobbyMode = { kind: 'build', name: p.name }
                  return (
                    <div
                      key={p.name}
                      className={'mln-row' + (sameMode(picked, m) ? ' on' : '')}
                      data-sound="nav"
                      onClick={() => pick(m)}
                    >
                      <BuildIcon icon={p.icon} name={p.name} size={30} />
                      <span className="mln-row-txt">
                        <b>{p.name}</b>
                        <i>
                          {LOADER_NAME(p)} · {p.version}
                        </i>
                      </span>
                      <button
                        className="mln-row-play"
                        aria-label={'Играть в ' + p.name}
                        data-sound="play"
                        data-track="rect_play"
                        data-kind="build"
                        data-id={p.name}
                        onClick={(e) => {
                          e.stopPropagation()
                          pickAndPlay(m)
                        }}
                      >
                        <PxIcon name="play" size={14} />
                      </button>
                    </div>
                  )
                })
              ) : (
                <button className="mln-empty" data-sound="open" onClick={() => setScreen('playhub')}>
                  <PxIcon name="box2" size={22} />
                  Сборок пока нет — собери свою в библиотеке
                </button>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="versions" className="mln-rect-body">
          <ScrollArea className="mln-rect-scroll">
            <div className="mln-rect-list">
              {releases.map((v) => {
                const m: LobbyMode = { kind: 'version', version: v.id }
                return (
                  <div
                    key={v.id}
                    className={'mln-row' + (sameMode(picked, m) ? ' on' : '')}
                    data-sound="nav"
                    onClick={() => pick(m)}
                  >
                    <span className="mln-row-ico">
                      <PxIcon name="blocks" size={18} />
                    </span>
                    <span className="mln-row-txt">
                      <b>{v.id}</b>
                      <i>Fabric</i>
                    </span>
                    <button
                      className="mln-row-play"
                      aria-label={'Играть в ' + v.id}
                      data-sound="play"
                      data-track="rect_play"
                      data-kind="version"
                      data-id={v.id}
                      onClick={(e) => {
                        e.stopPropagation()
                        pickAndPlay(m)
                      }}
                    >
                      <PxIcon name="play" size={14} />
                    </button>
                  </div>
                )
              })}
              {!releases.length ? <div className="mln-empty mln-empty-static">Список версий ещё грузится…</div> : null}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  )
}

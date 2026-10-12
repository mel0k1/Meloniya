import { Icon } from './Icon'
import { useUpdate } from '../state/update'
import { applyUpdate, DOWNLOAD_PAGE } from '../lib/updater'
import { openExt } from '../lib/api'

export function UpdateBanner() {
  const version = useUpdate((s) => s.version)
  const staged = useUpdate((s) => s.staged)
  const busy = useUpdate((s) => s.busy)
  const failed = useUpdate((s) => s.failed)
  if (!version) return null

  const label = failed
    ? 'Обновление ' + version + ' не скачалось'
    : staged
      ? 'Обновление ' + version + ' встанет при выходе'
      : 'Качаем обновление ' + version

  return (
    <div className="upd-banner" role="status">
      <Icon id="i-download" />
      <span className="upd-banner-txt">{label}</span>
      <button
        className="btn sm primary"
        disabled={busy}
        onClick={() => {
          if (failed) openExt(DOWNLOAD_PAGE)
          else void applyUpdate().catch(() => {})
        }}
      >
        {busy ? (
          <>
            <span className="spin" style={{ width: '14px', height: '14px' }}></span>
            Обновляем…
          </>
        ) : (
          <>
            <Icon id={failed ? 'i-download' : 'i-restart'} />
            {failed ? 'Открыть релиз' : 'Обновить'}
          </>
        )}
      </button>
    </div>
  )
}

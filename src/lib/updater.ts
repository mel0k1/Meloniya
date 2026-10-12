import { check, type Update } from '@tauri-apps/plugin-updater'
import { exit, relaunch } from '@tauri-apps/plugin-process'
import { hasTauri } from '../ipc/tauri'
import { useUpdate } from '../state/update'

export interface UpdateInfo {
  version: string
  notes: string
  install: () => Promise<void>
}

export const DOWNLOAD_PAGE = 'https://github.com/mel0k1/Meloniya/releases/latest'

let pending: UpdateInfo | null = null
let current: Update | null = null
let downloading: Promise<void> | null = null
let downloaded = false
let installing = false

export const pendingUpdate = (): UpdateInfo | null => pending
export const updateReady = (): boolean => downloaded && !!current

function remember(upd: Update) {
  if (current && current.version === upd.version && (downloaded || downloading)) return
  current = upd
  downloading = null
  downloaded = false
  pending = { version: upd.version, notes: upd.body || '', install: () => applyUpdate() }
  useUpdate.getState().set({ version: upd.version, staged: false, failed: false })
}

function ensureDownloaded(): Promise<void> {
  if (!current) return Promise.reject(new Error('нет обновления'))
  if (downloaded) return Promise.resolve()
  if (!downloading) {
    downloading = current
      .download()
      .then(() => {
        downloaded = true
        useUpdate.getState().set({ staged: true, busy: false })
      })
      .catch((e) => {
        downloading = null
        downloaded = false
        useUpdate.getState().set({ failed: true, busy: false })
        throw e
      })
    useUpdate.getState().set({ busy: true })
  }
  return downloading
}

function started(): boolean {
  return hasTauri() && !import.meta.env.DEV
}

export async function bootUpdate(): Promise<boolean> {
  if (!started()) return false
  try {
    const upd = await check()
    if (!upd) return false
    remember(upd)
    void ensureDownloaded().catch(() => {})
    return true
  } catch {
    return false
  }
}

export async function checkForUpdate(_loud = false): Promise<UpdateInfo | null> {
  if (!started()) return null
  try {
    const upd = await check()
    if (!upd) {
      pending = null
      current = null
      downloaded = false
      downloading = null
      useUpdate.getState().set({ version: '', staged: false, busy: false, failed: false })
      return null
    }
    remember(upd)
    void ensureDownloaded().catch(() => {})
    return pending
  } catch (e) {
    useUpdate.getState().set({ failed: true })
    throw e
  }
}

export async function applyUpdate(): Promise<void> {
  if (!current || installing) return
  installing = true
  useUpdate.getState().set({ busy: true })
  try {
    await ensureDownloaded()
    await current.install()
    await relaunch()
  } catch (e) {
    useUpdate.getState().set({ failed: true, busy: false })
    throw e
  } finally {
    installing = false
  }
}

export async function installUpdateOnExit(): Promise<void> {
  if (!current) return
  try {
    await ensureDownloaded()
  } catch {}
  try {
    await current.install()
  } catch {}
  try {
    await exit(0)
  } catch {}
}

// Мелония обновляется релизами GitHub: автообновление из чужого хранилища
// отключено, проверка версии просто ведёт на страницу релизов.
export interface UpdateInfo {
  version: string
  notes: string
  install: () => Promise<void>
}

export const DOWNLOAD_PAGE = 'https://github.com/mel0k1/Meloniya/releases/latest'

export const pendingUpdate = (): UpdateInfo | null => null
export const updateReady = (): boolean => false

export function betaChannel(): boolean {
  return false
}

export async function bootUpdate(): Promise<boolean> {
  return false
}

export async function autoUpdate(): Promise<{ version: string } | null> {
  return null
}

export async function installUpdateOnExit(): Promise<boolean> {
  return false
}

export async function applyUpdate(): Promise<void> {}

export async function checkForUpdate(_loud = false): Promise<UpdateInfo | null> {
  return null
}

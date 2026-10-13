import type { SnapshotServer } from '../lib/snapshot'
import { serverVersions } from '../lib/mcVersion'

const CAT: Record<string, string> = {
  SURVIVAL: 'Выживание',
  VANILLA: 'Ванилла',
  MMORPG: 'РПГ',
  ONEBLOCK: 'OneBlock',
  ANARCHY: 'Анархия',
  MINIGAMES: 'Мини-игры',
  OTHER: 'Разное',
  CREATIVE: 'Креатив',
  SKYBLOCK: 'SkyBlock',
  ROLEPLAY: 'RP',
  TECHNIC: 'Техно',
  PVP: 'PvP',
  ADVENTURE: 'Приключения',
  ECONOMY: 'Экономика',
  FACTIONS: 'Фракции',
  HARDCORE: 'Хардкор',
  MODDED: 'Моды',
}

export interface RatingServer {
  name: string
  slug: string
  shortDesc?: string
  aiDescription?: string
  description?: string
  ip?: string
  online?: number
  isOnline?: boolean
  onlineApprox?: boolean
  avgOnline?: number
  bannerUrl?: string
  logoUrl?: string
  versionMajors?: string[]
  categories?: string[]
  motd?: string
  license?: string
}

/**
 * Only a card that says LICENSE asks for a Microsoft account. Most cards say
 * nothing: an unknown mode is not a reason to warn the player off a server
 * that lets them in (OneBlock had no value and showed «Нужна лицензия»).
 */
export const licenseRequired = (lic: string | null | undefined): boolean => lic === 'LICENSE'

export const toCard = (sv: RatingServer, rank: number): SnapshotServer => ({
  rank,
  name: sv.name,
  slug: sv.slug,
  desc: (sv.shortDesc || sv.aiDescription || sv.description || '').replace(/\n/g, ' ').slice(0, 110),
  ip: sv.ip || '',
  online: sv.online ?? sv.avgOnline ?? 0,
  onlineApprox: sv.onlineApprox === true,
  // Сервер включён, даже когда на нём никого: рейтинг отвечает фактом пинга.
  // Старый ответ без поля судим по числу игроков, иначе весь каталог станет
  // офлайном — но приблизительное число так судить нельзя: у карточки мёртвого
  // адреса оно взято из засеянного рейтинга, а не из ответа сервера.
  isOnline: sv.isOnline ?? (sv.onlineApprox !== true && (sv.online ?? sv.avgOnline ?? 0) > 0),
  banner: sv.bannerUrl,
  logo: sv.logoUrl,
  versions: serverVersions(sv.versionMajors),
  cat: CAT[(sv.categories || ['OTHER'])[0]] || 'Разное',
  motd: (sv.motd || '').slice(0, 120),
  lic: sv.license || '',
})

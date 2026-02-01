
export interface TeamStandingsData {
  team: Team
}

interface Team {
  abbreviation: string
  color: string
  logos: Logo[]
  record: Record
  standingSummary: string
}

interface Logo {
  href: string
}

interface Record {
  items: Item[]
}

interface Item {
  summary: string
  stats: Stat[]
  description?: string
}

interface Stat {
  name: string
  value: number
}

export interface TeamRecord {
    abbreviation: string
    logo: string;
    gamesPlayed: number
    playoffSeed: number
    wins: number
    losses: number
    ties?: number
    otLosses?: number
    points?: number
    winPercent?: number
    standingSummary: string
}

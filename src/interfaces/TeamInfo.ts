export interface TeamInfoResponse {
  team: Team
}

interface Team {
  displayName: string
  record: Record
  nextEvent: NextEvent[]
  logos: Logo[]
}

interface Record {
  items: Item[]
}

interface Item {
  summary: string
}

interface Logo {
  href: string
}

interface NextEvent {
  id: string
}

export interface TeamInfo {
  displayName: string
  recordSummary: string
  logoUrl: string
  gameID: string
}
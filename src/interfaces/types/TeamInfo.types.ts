export interface TeamInfoResponse {
  team: {
    displayName: string
    record: {
      items: {
        summary: string
      }[]
    }
    nextEvent: {
      id: string
    }[]
    logos: {
      href: string
    }[]
  }
}

export interface TeamInfo {
  displayName: string
  recordSummary: string
  logoUrl: string
  gameID: string
}
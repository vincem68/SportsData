export interface GameOverviewResponse {
  id: string
  date: string
  name: string
  shortName: string
  season: Season
  competitions: Competition[]
}

interface Season {
  year: number
  type: number
}

interface Competition {
  id: string
  date: string
  competitors: Competitor[]
  status: Status
  startDate: string
  series: Series
  situation?: Situation
}

interface Situation {
    downDistanceText?: string
    possession?: string
    balls?: number
    strikes?: number
    outs?: number
}

interface Series {
    summary: string
}

interface Competitor {
    id: string
    type: string
    homeAway: string
    team: Team
    score: string
    records: Record[]
}

interface Team {
  id: string
  name: string
  abbreviation: string
  displayName: string
  logo: string
}

interface Record {
  summary: string
}

export interface Status {
  displayClock: string
  period: number
  type: Type
}

interface Type {
  id: string
  name: string
  state: string
  description: string
  detail: string
  shortDetail: string
}


//we will use this interface in the actual views to simplify data access
export interface GameOverview {
    id: string
    date: string
    seasonType: number,
    awayTeam: {
        id: string
        abbreviation: string
        displayName: string
        logo: string
        score: string
    }
    homeTeam: {
        id: string
        abbreviation: string
        displayName: string
        logo: string
        score: string
    }
    status: {
        state: string
        shortDetail: string
        period: number
        displayClock: string
    }
    situation?: {
        downDistanceText?: string
        possession?: string
        balls?: number
        strikes?: number
        outs?: number
    }
    seriesSummary?: string
}


export interface StandingsResponse {
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
    standingSummary?: string
    nhlDivisionStanding?: string
    playoffState?: string
}


export interface LeagueStandings {

  firstConferenceName?: string //name of first conference
  secondConferenceName?: string //name of second conference
  firstConferenceDivisions?: string[] //array names of divisions in first conference 
  secondConferenceDivisions?: string[] // array names of divisions in second conference
  firstConferenceTeams?: TeamRecord[] //array of team records for teams in first conference, should be sorted by playoff seed already
  secondConferenceTeams?: TeamRecord[] //array of team records for teams in second conference, should be sorted by playoff seed already

}

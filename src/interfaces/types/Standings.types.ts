export interface StandingsResponse {

  abbreviation: string
  name: string

  season: {
    year: number
  }

  seasons: {
    year: number
  }[]

  children: Group[]
}

export interface Group {

  name: string

  standings: {

    entries: {

      team: {

        abbreviation: string
        name: string

        logos: {
          href: string
        }[]
      }

      stats: {
        type: string
        abbreviation?: string
        shortDisplayName?: string
        description?: string
        displayValue: string
      }[]
    }[]
  }
}

export interface Standings {

  currentSeason: number
  maxSeason: number

  //array of first conf division teams
  firstConferenceDivisions: {

    name: string //division name
    teams: TeamRecord[] //divison team
  }[]

  //array of second conf division teams 
  secondConferenceDivisions: {

    name: string
    teams: TeamRecord[]
  }[]

  conferenceStandings: {

    name: string
    teams: TeamRecord[]
  }[]

}

export interface TeamRecord {
  
  abbr: string
  logo: string

  stats: Stats[]
}

export interface Stats {
  abbr: string
  desc: string
  value: string
}

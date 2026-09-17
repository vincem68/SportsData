export interface ConferenceStandingsResponse {

  abbreviation: string
  name: string

  season: {
    year: number
  }

  seasons: {
    year: number
  }[]

  children: {

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
          abbreviation?: string
          shortDisplayName?: string
          description?: string
          displayValue: string
        }[]
      }[]
    }

  }[]
}

export interface ConferenceStandings {

  abbr: string
  currentSeason: number
  maxSeason: number

  divisions: {

    name: string

    teams: TeamRecord[]
  }[]
}

export interface TeamRecord {
  
  abbr: string
  logo: string

  stats: {
    abbr: string
    desc: string
    value: string
  }[]
}

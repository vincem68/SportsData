
export interface LeagueStatsResponse {

  status: string

  season: {
    year: number
    type: number
    displayName: string
    name: string
  }

  requestedSeason: {
    year: number
    type: number
    displayName: string
    name: string
    qualifiedPostSeason: boolean
  }

  team: {
    id: number
    name: string
    abbreviation: string
    displayName: string
    logo: string
    recordSummary: string
  }

  results: {
    stats: {
      categories: {
        displayName: string
        stats: {
          abbreviation: string
          displayName: string
          displayValue: string
          description: string
          perGameDisplayValue?: string
        }[]
      }[]
    }
  }
  code?: number
}


//this will be the interface we use when putting the array of all the teams stats together
//in the league stats route
export interface LeagueStats {

  season: {
    year: number
    type: number
    displayName: string
    name: string
  }

  requestedSeason: {
    year: number
    type: number
    displayName: string
    name: string
  }

  categories: { //we will partition th data by categories, then get the needed team stats

    name: string
    statsDesc: { //the text descriptions of the cats and stats
      name: string
      abbreviation: string
      description: string
    }[]

    teams: { //the actual stats for each team in the category
      teamAbbr: string
      teamLogo: string
      statValues: string[] //where we will keep the stats for the entire category for each team
    }[]

  }[]
}

export interface LeagueStatsResponse {
  status: string
  results: Results
  season: Season
  requestedSeason: RequestedSeason
  team: Team
  code?: number
}

interface Results {
  stats: Statistics
}

interface Statistics {
  categories: Category[]
}

export interface Category {
  displayName: string
  abbreviation: string
  stats: Stat[]
}

export interface Stat {
  displayName: string
  description: string
  abbreviation: string
  displayValue: string
}

export interface Season {
  year: number
  type: number
  name: string
  displayName: string
}

export interface RequestedSeason {
  year: number
  type: number
  name: string
  displayName: string
  qualifiedPostSeason: boolean
}

export interface Team {
  abbreviation: string
  logo: string
}


//this will be the interface we use when putting the array of all the teams stats together
//in the league stats route
export interface TeamStats {
  teamName: string;
  categories: Category[];
}
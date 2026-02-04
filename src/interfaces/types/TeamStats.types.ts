export interface TeamStatsResponse {
  status: string | number
  results: Results
  season: Season
  requestedSeason: RequestedSeason
  team: Team
}

interface Results {
  stats: Stats
  splits: Split[]
}

interface Stats {
  name: string
  abbreviation: string
  categories: Category[]
}

interface Category {
  name: string
  displayName: string
  stats: Stat[]
}

interface Stat {
  name: string
  displayName: string
  shortDisplayName: string
  description: string
  abbreviation: string
  value: number
  displayValue: string
  perGameValue?: number
  perGameDisplayValue?: string
}

interface Season {
  year: number
  type: number
  name: string
  displayName: string
}

interface RequestedSeason {
  year: number
  type: number
  name: string
  displayName: string
  qualifiedPostSeason: boolean
}

interface Team {
  id: string
  abbreviation: string
  location: string
  name: string
  displayName: string
  color: string
  logo: string
  recordSummary: string
  seasonSummary: string
  standingSummary: string
}

interface Split {
    abbreviation: string
    categories: Category[]
}


/**
 * This file contains the TypeScript interfaces for the Team Stats response from the ESPN API.
 */
export interface TeamStats {
    status: string | number
    teamName: string;
    teamLogo: string;
    seasonYear: number;
    seasonType: number;
    requestedType: number;
    requestedSeason: number;
    requestedYearText: string;
    requestedTypeText: string;
    recordSummary?: string;
    seasonSummary: string;
    standingSummary: string;
    qualifiedPostSeason: boolean;
    categories: {
        name: string
        stats: {
            name: string
            abbreviation: string
            description: string
            value: string
        }[]
    }[]
    splits?: {  //only use this for baseball teams
        abbreviation: string
        categories: {
            name: string
            stats: {
                name: string
                abbreviation: string
                description: string
                value: string
            }[]
        }[]
    }[]
}
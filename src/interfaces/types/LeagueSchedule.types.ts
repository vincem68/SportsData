//------------------------------ LEAGUE SCHEDULE RESPONSE TRANSFORMATION ------------------------------//
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
        name: string
        logo: string
        score: string
    }
    homeTeam: {
        id: string
        abbreviation: string
        name: string
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
        count?: string
        outs?: number
    }
    seriesSummary?: string
}



//----------------------------- OVERALL SCHEDULE RESPONSE TRANSFORMATION -----------------------------//
export interface LeagueScheduleResponse {
    leagues: League[]
    events: GameOverviewResponse[]
    day?: Day
    week?: Week
}

interface League {
    calendarEndDate?: string
    season: {
        year: number
        type: {
            type: number
            name: string
        }
    }
}

interface Day {
    date: string
}

interface Week {
    number: number
    teamsOnBye: TeamOnBye[]
}

export interface TeamOnBye {
    logo: string
    abbreviation: string
}

/**
 * The exported interface we'll use for the scoreboard response
 * Will contain all the data of the current requested games
 */
export interface LeagueSchedule {
    
    endpoint: string
    season: number //season year and type
    seasonType: number
    seasonTypeName: string //the name of the season type (ex: regular, preseason, etc)
    totalGames: number //the total games of the request
    seasonEndDate: string //if needed, the season end date
    schedule: {
        activeGames: { //all of the active games filtered
            id: string
            name: string
            games: GameOverview[]
        }
        upcomingGames: { //all of the upcoming games filtered
            id: string
            name: string
            games: GameOverview[]
        }
        completedGames: {  //all of the completed games filtered
            id: string
            name: string
            games: GameOverview[]
        }
    }
    day?: string //if not an NFL game, the date in mm/dd/yyyy format
    week?: number //if NFL game, week #
    teamsOnBye?: TeamOnBye[] //if NFL, the teams on a bye week
}
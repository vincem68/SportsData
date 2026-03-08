import type { GameOverviewResponse, GameOverview } from "./GameOverview.types"

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
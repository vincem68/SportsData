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

/**
 * Function to parse the GameOverviewResponse from ESPN into a more manageable GameOverview object
 * @param response JSON response from ESPN containing game info
 * @returns a variable of type GameOverview to have needed JSON info much more organized and readable
 */
export const parseGameOverviewResponse = (response: GameOverviewResponse): GameOverview => {
    const competition = response.competitions[0];
    const awayCompetitor = competition.competitors[1];
    const homeCompetitor = competition.competitors[0];
    return {
        id: response.id,
        date: response.date,
        seasonType: response.season.type,
        awayTeam: {
            id: awayCompetitor.id,
            abbreviation: awayCompetitor.team.abbreviation,
            displayName: awayCompetitor.team.displayName,
            logo: awayCompetitor.team.logo,
            score: awayCompetitor.score
        },
        homeTeam: {
            id: homeCompetitor.id,
            abbreviation: homeCompetitor.team.abbreviation,
            displayName: homeCompetitor.team.displayName,
            logo: homeCompetitor.team.logo,
            score: homeCompetitor.score
        },
        status: {
            state: competition.status.type.state,
            shortDetail: competition.status.type.shortDetail,
            period: competition.status.period,
            displayClock: competition.status.displayClock
        },
        situation: competition.situation ? {
            downDistanceText: competition.situation.downDistanceText,
            possession: competition.situation.possession,
            balls: competition.situation.balls,
            strikes: competition.situation.strikes,
            outs: competition.situation.outs
        } : undefined,
        seriesSummary: competition.series?.summary || ''
    };
}
import type { GameOverviewResponse, GameOverview } from "../types/GameOverview.types";
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
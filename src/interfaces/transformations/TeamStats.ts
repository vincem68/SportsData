import type { TeamStatsResponse, TeamStats } from '../types/TeamStats.types';

export const parseTeamStatsResponse = (response: TeamStatsResponse, league: string): TeamStats => {
    
    const teamStats: TeamStats = {
        status: response.status,
        teamName: response.team.displayName,
        teamLogo: response.team.logo,
        seasonYear: response.season.year,
        seasonType: response.season.type,
        requestedSeason: response.requestedSeason.year,
        requestedType: response.requestedSeason.type,
        requestedYearText: response.requestedSeason.displayName,
        requestedTypeText: response.requestedSeason.name,
        recordSummary: (response.team.recordSummary) ? response.team.recordSummary : undefined,
        seasonSummary: response.team.seasonSummary,
        standingSummary: response.team.standingSummary,
        qualifiedPostSeason: response.requestedSeason.qualifiedPostSeason,
        categories: response.results.stats.categories.map(category => ({
            name: category.displayName,
            stats: category.stats.map(currStat => ({
                name: currStat.displayName,
                description: currStat.description,
                abbreviation: (league == "nba" && currStat.name.substring(0, 3) == "avg") ?
                    currStat.shortDisplayName : currStat.abbreviation,
                value: currStat.displayValue
            }))
        })),
        splits: (league.toLowerCase() == "mlb") ? getSplits(response) : undefined
    };
    return teamStats;
}


/**
 * A helper function to get the splits from the TeamStatsResponse if the team is a baseball team
 * @param response - response JSON data
 * @param league - string name of the league the requested team is in
 * @returns 
 */
function getSplits(response: TeamStatsResponse){

    const splits = response.results.splits.map(split => ({
        abbreviation: split.abbreviation,
        categories: split.categories.map(category => ({
            name: category.displayName,
            stats: category.stats.map(currStat => ({
                name: currStat.displayName,
                description: currStat.description,
                abbreviation: currStat.abbreviation,
                value: currStat.displayValue
            }))
        }))
    }));

    return splits;
}
import type { 
    BasicPlayerStatsResponse, BasicPlayerStats, 
    PlayerStatsOverviewResponse, PlayerStatsOverview,
    PlayerSplitsResponse, PlayerSplits 
} from '../types/PlayerStats.types';

/**
 * Parses JSON response data for basic player data
 * @param data The JSON response data for basic player info
 * @returns better formatted data for rendering
 */
export const parseBasicPlayerStats = (data: BasicPlayerStatsResponse): BasicPlayerStats => {
    const athlete = data.athlete;
    return {
        playerName: athlete.displayName,
        playerHeadshot: (athlete.headshot !== undefined) ? athlete.headshot.href : "",
        playerPosition: athlete.position.displayName,
        playerJersey: athlete.displayJersey,
        teamName: athlete.team.displayName,
        teamAbbreviation: athlete.team.abbreviation,
        teamLogo: athlete.team.logos[0].href,
        playerDOB: athlete.displayDOB.split("/")[1] + "/" + 
            athlete.displayDOB.split("/")[0] + "/" + athlete.displayDOB.split("/")[2],
        playerHeight: athlete.displayHeight,
        playerWeight: athlete.displayWeight,
        playerAge: athlete.age,
        playerDraft: athlete.displayDraft
    };
}

/**
 * Same sort of function to parse main player stats overview
 * Will contain the labels of stats, their full names/desc, and the values of the stats
 * @param response 
 * @returns PlayerStatsOverview instance for rendering the file. Contains all the main stats of the season
 * and career
 */
export const parseMainPlayerStats = (response: PlayerStatsOverviewResponse): PlayerStatsOverview | null => {
    const data = response.statistics;
    if (response.statistics.displayNames === undefined) {
        return null;
    }
    const statsDesc = data.displayNames.map((name, index) => ({
        label: data.labels[index],
        name: name
    }));
    return {
        statsDesc: statsDesc,
        splits: data.splits.map(split => ({
            name: split.displayName,
            values: split.stats
        }))
    };
}


/**
 * A parser function to take in the raw JSON response for the advanced splits of a player and 
 * return a better structured object for rendering the advanced splits section of the player stats page
 * @param response - JSON response for advanced splits of a player
 * @returns - better structured data for rendering the advanced splits
 */
export const parsePlayerSplits = (response: PlayerSplitsResponse): PlayerSplits => {

    const statsDesc = response.displayNames.map((name, index) => ({
        label: response.labels[index],
        name: name,
        description: response.descriptions[index]
    }));
    const data = response.splitCategories.filter(category => category.splits !== undefined); //filter out categories with no splits
    return {
        statsDesc: statsDesc,
        categories: data.map((category, index) => ({
            index: index,
            name: category.displayName,
            splits: category.splits.map((split, index) => ({
                index: index,
                name: split.displayName,
                values: split.stats
            }))
        }))
    };
}
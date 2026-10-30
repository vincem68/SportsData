import type { 
    PlayerInfoResponse, PlayerInfo, 
    PlayerStatsOverviewResponse, PlayerStatsOverview,
    PlayerSplitsResponse, PlayerSplits 
} from '../types/PlayerStats.types';

/**
 * Parses JSON response data for basic player data
 * @param data The JSON response data for basic player info
 * @returns better formatted data for rendering
 */
export async function parseBasicPlayerStats(league: string, sport: string, playerID: string): Promise<PlayerInfo> {

    //get the data
    const res: PlayerInfoResponse = await (
        await fetch(`https://site.web.api.espn.com/apis/common/v3/sports/${sport}/${league.toLowerCase()}/athletes/${playerID}`)
    ).json();

    const athlete = res.athlete;
    return {
        playerName: athlete.displayName,
        playerHeadshot: (athlete.headshot !== undefined) ? athlete.headshot.href : "",
        playerPosition: athlete.position.displayName,
        playerJersey: athlete.displayJersey ? athlete.displayJersey : athlete.jersey!,
        teamName: athlete.team.displayName,
        teamAbbreviation: athlete.team.abbreviation,
        teamLogo: athlete.team.logos[0].href,
        playerDOB: athlete.displayDOB.split("/")[1] + "/" + 
            athlete.displayDOB.split("/")[0] + "/" + athlete.displayDOB.split("/")[2],
        playerHeight: athlete.displayHeight,
        playerWeight: athlete.displayWeight,
        playerAge: athlete.age,
        playerDraft: athlete.displayDraft ? athlete.displayDraft : undefined,
        playerExp: athlete.displayExperience,
        debutYear: athlete.debutYear ? athlete.debutYear : 
            isNaN(Number(athlete.displayExperience.charAt(1))) ? Number(athlete.displayExperience.substring(0, 0)) 
            : Number(athlete.displayExperience.substring(0, 1)),
        currentSeason: res.season.year,
        currentSeasonType: res.season.type.type,

        playerShoots: athlete.hand ? athlete.hand.displayValue : undefined,
        playerBatsThrows: athlete.displayBatsThrows ? athlete.displayBatsThrows : undefined
    };
}

/**
 * Same sort of function to parse main player stats overview
 * Will contain the labels of stats, their full names/desc, and the values of the stats
 * @param response 
 * @returns PlayerStatsOverview instance for rendering the file. Contains all the main stats of the season
 * and career
 */
export async function parseMainPlayerStats(league: string, sport: string, playerID: string, year: number, seasonType: number): Promise<PlayerStatsOverview> {

    console.log(`https://sports.core.api.espn.com/v2/sports/${sport}/leagues/${league.toLowerCase()}/seasons/${year}/types/${seasonType}/athletes/${playerID}/statistics`);

    const res: PlayerStatsOverviewResponse = await (
        await fetch(`https://sports.core.api.espn.com/v2/sports/${sport}/leagues/${league.toLowerCase()}/seasons/${year}/types/${seasonType}/athletes/${playerID}/statistics`)
    ).json();

    return {

        requestedSeason: year,
        requestedSeasonType: seasonType == 2 ? "Regular Season" : "Postseason",

        categories: res.splits ? res.splits.categories.map(cat => {

            return {
                name: cat.displayName,
                stats: cat.stats.map(stat => {
                    return {
                        abbr: stat.abbreviation, 
                        name: stat.displayName,
                        desc: stat.description,
                        value: stat.value
                    }
                })
            }
        }) : undefined
    }
}


/**
 * A parser function to take in the raw JSON response for the advanced splits of a player and 
 * return a better structured object for rendering the advanced splits section of the player stats page
 * @param response - JSON response for advanced splits of a player
 * @returns - better structured data for rendering the advanced splits
 */
export async function parsePlayerSplits(league: string, sport: string, playerID: string, year: number): Promise<PlayerSplits> {

    //get the data
    const response: PlayerSplitsResponse = await (
        await fetch(`https://site.web.api.espn.com/apis/common/v3/sports/${sport}/${league.toLowerCase()}/athletes/${playerID}/splits?season=${year}`)
    ).json()

    if (!response.displayNames){
        return {
            statsDesc: undefined,
            categories: undefined
        }
    }

    const statsDesc = response.displayNames.map((name, index) => ({
        label: response.labels![index],
        name: name,
        description: response.descriptions![index]
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
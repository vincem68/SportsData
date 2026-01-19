import { SeasonInfo } from "./interfaces/SeasonInfo";

export async function getCurrentSeasonInfo(endpoint: string): Promise<SeasonInfo>{
    const seasonInfo: SeasonInfo = await (await fetch(endpoint)).json();
    if (seasonInfo.code !== undefined){
        throw new Error("Invalid request");
    }
    return seasonInfo;
}

export function checkRequestParams(sport: string, league: string): boolean {
    const validSports = ['football', 'basketball', 'baseball', 'hockey'];
    const validLeagues = ['nfl', 'nba', 'mlb', 'nhl'];
    return validSports.includes(sport.toLowerCase()) && validLeagues.includes(league.toLowerCase());
}

/**
 * Use this to check if the requested season info is valid
 * @param seasonInfo - interface that will contain season year and type
 */
export function checkValidSeason(seasonInfo: SeasonInfo, requestedYear: number, requestedType: number): boolean {

    //make sure the user does't put in wrong queries into the URL
    if (requestedYear < 2000 || requestedType < 1 || requestedType > 4){
        return false;
    }

    //if the requested year is higher than the current year, false
    if (seasonInfo.year < requestedYear){
        return false;
    }
    //if the requested year is the same as current year, but the part of the season hasn't happened yet, false
    if (seasonInfo.year == requestedYear && seasonInfo.type < requestedType){
        return false;
    }
    //true otherwise
    return true;
}

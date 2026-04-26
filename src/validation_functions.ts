import { SeasonInfo } from "./interfaces/types/SeasonInfo.types";
import { nflTeams, nbaTeams, mlbTeams, nhlTeams } from "./index";
import { BasicTeamInfo, DataResponse } from "./interfaces/types/BasicTeamInfo.types";


/**
 * This function will be used to get basic info from requests in case of 404 responses
 * We need this basic info to render some files, so in case responses for specific requests don't get 
 * fulfilled, we use this to make sure we get it. Only used for base endpoints. 
 * @param endpoint string that will respresent the data endpoint where we send requests to
 * @returns a simple object that will contain the current season year and type of what data we're looking at
 */
export async function getBasicResponseInfo(endpoint: string): Promise<BasicTeamInfo>{

    console.log(endpoint);

    const response = await fetch(endpoint)
        .then(res => res.json())
        .then((data: DataResponse) => {
            const basicInfo: BasicTeamInfo = {
                seasonYear: data.season.year,
                seasonType: data.season.type,
                teamName: data.team ? data.team.displayName : undefined,
                teamLogo: data.team ? data.team.logo : undefined
            }
            return basicInfo;
        })
        .catch(err => {
            console.error("Error fetching basic response info:", err);
            throw err;
        });

    return response;

}

export function checkRequestParams(sport: string, league: string, team?: string): boolean {
    //console.log("Checking request params:", sport, league, team);
    const validSports = ['football', 'basketball', 'baseball', 'hockey'];
    const validLeagues = ['nfl', 'nba', 'mlb', 'nhl'];
    const teams: string[] = (league.toLowerCase() === 'nfl') ? nflTeams :
        (league.toLowerCase() === 'nba') ? nbaTeams :
        (league.toLowerCase() === 'mlb') ? mlbTeams :
        (league.toLowerCase() === 'nhl') ? nhlTeams : [];
    //return true if sport and league are valid, and if team is provided, check that too
    return validSports.includes(sport.toLowerCase()) && validLeagues.includes(league.toLowerCase()) && 
        (team === undefined || teams.includes(team.toUpperCase()));
}

export function checkQueryParams(league: string, year: number, type: number, week?: number, date?: string): boolean {
    if (type > 4 || type < 1){
        return false;
    }
    if (year < 2000){
        return false;
    }
    if ((league.toLowerCase() == 'nfl' || league.toLowerCase() == 'mlb') && new Date().getFullYear() < year){
        return false;
    }
    if ((league.toLowerCase() == 'nba' || league.toLowerCase() == 'nhl') && 
        (new Date().getFullYear() < year + 1 && new Date().getMonth() >= 8) || (new Date().getFullYear() < year && new Date().getMonth() < 6)){
        return false;
    }
    if (week !== undefined && (week < 1 || week > 18)){
        return false;
    }
    if (date !== undefined){
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(date)){
            return false;
        }
    }
    return true;
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

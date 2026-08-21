import type { LeagueStatsResponse, LeagueStats } from "../types/LeagueStats.types";
import { getBasicResponseInfo } from "../../validation_functions";
import { BasicTeamInfo } from "../types/BasicTeamInfo.types";


export async function parseLeageStatsResponse(teams: string[], league: string, sport: string, year?: string, type?: string): Promise<LeagueStats> {

    //get the default year and type, which are the type we are currently in
    const defaultData = await getBasicResponseInfo(`https://site.api.espn.com/apis/site/v2/sports/${sport}/${league}/teams/${teams[0]}/statistics`);

    //go through each team to get the needed data
    let teamData: LeagueStatsResponse[] = await Promise.all(teams.map(async team => {

        const endpoint = (year && type) ? `https://site.api.espn.com/apis/site/v2/sports/${sport}/${league}/teams/${team}/statistics?season=${year}&seasontype=${type}` 
            : `https://site.api.espn.com/apis/site/v2/sports/${sport}/${league}/teams/${team}/statistics`;


        const teamStatsResponse: LeagueStatsResponse = await fetch(endpoint)
            .then(res => res.json())
            .catch(err => {
                console.error(`Error fetching stats for team ${team}:`, err);
                return null; // Return null or handle the error as needed
            });
        return teamStatsResponse;
    }));

    const categories = teamData.filter(team => team.code === undefined).length == 0 ? undefined : parseTeamData(teamData, defaultData, type);
    
    const finalSeasonType = type ? Number(type) : defaultData.seasonType;

    return {

        season: {
            year: defaultData.seasonYear,
            type: defaultData.seasonType,
            name: defaultData.seasonType == 1 ? "Preseason" : defaultData.seasonType == 3 ? "Postseason" : "Regular Season"
        },

        requestedSeason: {
            year: year ? Number(year) : defaultData.seasonYear,
            type: finalSeasonType,
            name: finalSeasonType == 1 ? "Preseason" : finalSeasonType == 3 ? "Postseason" : "Regular Season"
        },

        categories: categories
    }

}

//helper function to parse and filter team data
function parseTeamData(teamData: LeagueStatsResponse[], defaultData: BasicTeamInfo, type?: string) {

    //if the user requests postseason data, filter out the teams that did not qualify 
    if ((type && type == '3') || (!type && defaultData.seasonType == 3)){
        teamData = teamData.filter(team => team.requestedSeason.qualifiedPostSeason == true);
    }

    const parsedData = teamData[0].results.stats.categories.map((category, index) => {

        return { //return each category with its name and the stat info for each stat in the category

            name: category.displayName,
            //get the stat names, abbr and descriptions for each stat in the category
            statsDesc: category.stats.map(stat => {

                return {
                    name: stat.displayName,
                    abbreviation: stat.abbreviation,
                    description: stat.description
                }
            }), 

            teams: teamData.map(team => { //for each team, get the stat values for the category

                return {
                    teamAbbr: team.team.abbreviation,
                    teamLogo: team.team.logo,
                    //get the display value for each stat in the category
                    statValues: team.results.stats.categories[index].stats.map(stat => {
                        return (stat.perGameDisplayValue) ? stat.displayValue + " PG: " + stat.perGameDisplayValue
                            : stat.displayValue.split(':')[0];
                    })
                }
            })
        }
    });

    return parsedData;
}
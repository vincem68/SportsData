import type { LeagueStatsResponse, LeagueStats } from "../types/LeagueStats.types";
import { getBasicResponseInfo } from "../../validation_functions";


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

    //if the user requests postseason data, filter out the teams that did not qualify 
    if ((type && type == '3') || (!type && defaultData.seasonType == 3)){
        teamData = teamData.filter(team => team.requestedSeason.qualifiedPostSeason == true);
    }

    const categories = teamData[0].results.stats.categories.map((category, index) => {

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
                        return (stat.perGameDisplayValue) ? stat.displayValue + " | Per Game: " + stat.perGameDisplayValue
                            : stat.displayValue.split(':')[0];
                    })
                }
            })
        }
    });

    return {

        season: {
            year: teamData[0].season.year,
            type: teamData[0].season.type,
            displayName: teamData[0].season.displayName,
            name: teamData[0].season.name
        },

        requestedSeason: {
            year: teamData[0].requestedSeason.year,
            type: teamData[0].requestedSeason.type,
            displayName: teamData[0].requestedSeason.displayName,
            name: teamData[0].requestedSeason.name
        },

        categories: categories
    }

}
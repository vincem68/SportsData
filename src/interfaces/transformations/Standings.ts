import { takeCoverage } from "v8";
import type { StandingsResponse, Standings, Group, Stats } from "../types/Standings.types";


/**
 * 
 * @param endpoint base endpoint to send requests to get each teams standing data
 * @param teamIDs array of strings that contains every team's shorthand abbreviation
 * @param league string name of the league
 * @returns an object of LeagueStandings tha contains all the necessary data for the file rendering
 */
export async function parseStandingsResponse(league: string, sport: string, season?: number): Promise<Standings> {

    //conference ID numbers for API. 5 and 6 for NBA conferences, 7 and 8 for other 3 leagues
    const conferenceIDs = league == "NBA" ? [5, 6] : [7, 8];

    //check to see if the data is available. If not, return empty object
    const firstConfDivisionStandings: StandingsResponse = await (
        await fetch(
            `https://site.api.espn.com/apis/v2/sports/${sport}/${league.toLowerCase()}/standings?group=${conferenceIDs[0]}` + (season ? `&season=${season}` : "")
        )
    ).json();

    const secondConfDivisionStandings: StandingsResponse = await (
        await fetch(
            `https://site.api.espn.com/apis/v2/sports/${sport}/${league.toLowerCase()}/standings?group=${conferenceIDs[1]}` + (season ? `&season=${season}` : "")
        )
    ).json();

    const confStandings: StandingsResponse = await (
        await fetch(
            `https://site.api.espn.com/apis/v2/sports/${sport}/${league.toLowerCase()}/standings` + (season ? `?season=${season}` : "")
        )
    ).json();

    return {

        currentSeason: confStandings.season.year,
        maxSeason: confStandings.seasons[0].year,

        firstConferenceDivisions: firstConfDivisionStandings.children[0].standings.entries ?
            parseStandingsByGroup(firstConfDivisionStandings.children) : [],

        secondConferenceDivisions: secondConfDivisionStandings.children[0].standings.entries ?
            parseStandingsByGroup(secondConfDivisionStandings.children) : [],

        conferenceStandings: confStandings.children[0].standings.entries ?
            parseStandingsByGroup(confStandings.children) : []
    }
}


/**
 * helper function to minimize code and parse the division standings data into what we want
 * @param groups group data for each division
 */
function parseStandingsByGroup(groups: Group[]) {

    const statsOrder = [
        "total",
        "gamesbehind",
        "playoffseed",
        "streak",
        "winpercent",
        "differential",
        "pointsfor",
        "pointsagainst",
        "divisionrecord",
        "divisionwins",
        "divisionlosses",
        "home",
        "road",
        "vsconf"
    ];

    return groups.map(group => { //groups are either division or conference

        return {

            name: group.name,

            teams: group.standings.entries.map(team => { //for each team in group

                let clinched = "";

                //if a team has clinched a postseason spot or division, or eliminated, bonus stat entry will be at the front
                if (team.stats[0].shortDisplayName && team.stats[0].shortDisplayName == "CLINCH"){
                    clinched = " - " + team.stats[0].displayValue;
                }

                const orderedStats: Stats[] = []; //empty array to put parsed and sorted data into
                statsOrder.forEach(type => { //for each picked statistic we want above
                    const data = team.stats.find(stat => stat.type == type); //find the stat. Should exist
                    const parsedData = {
                        abbr: data!.abbreviation ? data!.abbreviation : data!.shortDisplayName!,
                        desc: data!.description ? data!.description : "Overall",
                        value: data!.displayValue
                    }
                    orderedStats.push(parsedData);
                })

                return {
                    abbr: team.team.abbreviation + (clinched != "" ? clinched : ""), //if clinched, put it next to team abbr
                    logo: team.team.logos[0].href,
                    stats: orderedStats
                }

            })
        }
    })
}
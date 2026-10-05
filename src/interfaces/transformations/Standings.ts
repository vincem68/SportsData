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

    //check to see if the season has begun yet, if not, return just season list and current season
    if (!firstConfDivisionStandings.children[0].standings.entries[0].stats.find(stat => stat.type == "total")){
        return {
            currentSeason: firstConfDivisionStandings.season.year,
            maxSeason: firstConfDivisionStandings.seasons[0].year
        }
    }

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
            parseStandingsByGroup(firstConfDivisionStandings.children, sport) : [],

        secondConferenceDivisions: secondConfDivisionStandings.children[0].standings.entries ?
            parseStandingsByGroup(secondConfDivisionStandings.children, sport) : [],

        conferenceStandings: confStandings.children[0].standings.entries ?
            parseStandingsByGroup(confStandings.children, sport) : []
    }
}


/**
 * helper function to minimize code and parse the division standings data into what we want
 * @param groups group data for each division
 */
function parseStandingsByGroup(groups: Group[], sport: string) {

    const statsOrder = sport == "football" ? [

        "total", "gamesbehind", "playoffseed", "streak", "winpercent", "differential", "pointsfor", "pointsagainst",
        "divisionrecord", "divisionwins", "divisionlosses", "home", "road", "vsconf"

    ] : sport == "hockey" ? [

        "total", "points", "playoffseed", "gamesplayed", "gamesbehind", "streak", "lasttengames", "regwins", "reglosses", 
        "overtimewins", "overtimelosses", "rotwins", "rotlosses", "shootoutwins", "shootoutlosses", "home", 
        "road", "vsdiv", "differential", "pointsfor", "pointsagainst"

    ] : sport == "baseball" ? [

        "total", "winpercent", "playoffseed", "gamesbehind", "streak", "lasttengames", "playoffpercent", "leaguewinpercent", 
        "divisionpercent", "wildcardpercent", "magicnumberdivision", "magicnumberwildcard",
        "otwins", "otlosses", "home", "road", "intradivision", "intraleague", "differential", "pointsfor", "pointsagainst",
        "avgpointsfor", "avgpointsagainst" 

    ] : [

        "total", "winpercent", "playoffseed", "gamesahead", "gamesbehind", "streak", 
        "home", "road", "vsdiv", "vsconf", "differential", "pointsfor", "pointsagainst", "avgpointsfor",
        "avgpointsagainst"

    ];

    return groups.map(group => { //groups are either division or conference

        return {

            name: group.name,

            teams: group.standings.entries.map(team => { //for each team in group

                //if a team has clinched a postseason spot or division, or eliminated, will be bonus entry
                const clinched = team.stats.find(stat => stat.type == "clincher");
                if (clinched){
                    team.team.abbreviation += " - " + clinched.displayValue;
                }

                const orderedStats: Stats[] = []; //empty array to put parsed and sorted data into
                //console.log(team.stats);
                statsOrder.forEach(type => { //for each picked statistic we want above
                    const data = team.stats.find(stat => stat.type == type); //find the stat. Should exist
                    console.log(type);
                    //console.log(data);
                    const parsedData = {
                        abbr: data!.abbreviation ? data!.abbreviation : data!.shortDisplayName!,
                        desc: data!.description ? data!.description : "Overall Record",
                        value: data!.displayValue
                    }
                    orderedStats.push(parsedData);
                })

                orderedStats[0].abbr = "Record"; //rename overall record stat from any to record
                if (sport == "hockey"){
                    orderedStats[0].value = orderedStats[0].value.substring(0, orderedStats[0].value.indexOf(','));
                }

                return {
                    abbr: team.team.abbreviation, //if clinched, put it next to team abbr
                    logo: team.team.logos[0].href,
                    stats: orderedStats
                }

            }).sort((a, b) => (sport != "hockey") ? Number(b.stats.find(val => val.abbr == "PCT")!.value) - Number(a.stats.find(val => val.abbr == "PCT")!.value)
                :  Number(b.stats.find(val => val.abbr == "PTS")!.value) - Number(a.stats.find(val => val.abbr == "PTS")!.value)) //sort to make sure teams are in right order
        }
    });

    
}
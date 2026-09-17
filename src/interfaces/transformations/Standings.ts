import { ConferenceStandingsResponse, ConferenceStandings } from "../types/Standings.types";


/**
 * 
 * @param endpoint base endpoint to send requests to get each teams standing data
 * @param teamIDs array of strings that contains every team's shorthand abbreviation
 * @param league string name of the league
 * @returns an object of LeagueStandings tha contains all the necessary data for the file rendering
 */
export async function parseConferenceStandingsResponse(league: string, sport: string, groupID: number, season?: number): Promise<ConferenceStandings> {

    const endpoint = season ?
        `https://site.api.espn.com/apis/v2/sports/${sport}/${league.toLowerCase()}/standings?group=${groupID}&season=${season}`
        : `https://site.api.espn.com/apis/v2/sports/${sport}/${league.toLowerCase()}/standings?group=${groupID}`;

    //check to see if the data is available. If not, return empty object
    const conferenceStandings: ConferenceStandingsResponse = await (
        await fetch(endpoint)
    ).json();

    return {

        abbr: conferenceStandings.abbreviation,
        currentSeason: conferenceStandings.season.year,
        maxSeason: conferenceStandings.seasons[0].year,

        divisions: conferenceStandings.children[0].standings.entries ? conferenceStandings.children.map(division => {

            return {

                name: division.name,

                teams: division.standings.entries.map(team => {

                    return {
                        abbr: team.team.abbreviation,
                        logo: team.team.logos[0].href,

                        stats: team.stats.map(stat => {
                            return {
                                abbr: stat.abbreviation ? stat.abbreviation : stat.shortDisplayName!,
                                desc: stat.description ? stat.description : "Overall",
                                value: stat.displayValue
                            }
                        })
                    }

                })
            }
        }) : []
    }
}

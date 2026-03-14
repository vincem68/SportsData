import { StandingsResponse, LeagueStandings, TeamRecord } from "../types/Standings.types";


/**
 * 
 * @param endpoint base endpoint to send requests to get each teams standing data
 * @param teamIDs array of strings that contains every team's shorthand abbreviation
 * @param league string name of the league
 * @returns an object of LeagueStandings tha contains all the necessary data for the file rendering
 */
export async function parseStandingsResponse(endpoint: string, teamIDs: string[], league: string): Promise<LeagueStandings> {

    //fetch the data for each team in the league and store it in an array of TeamRecord objects
    const teamStandings: TeamRecord[] = await Promise.all(teamIDs.map(teamID => fetchTeamData(endpoint, teamID, league)));

    const firstConferenceDivisions = //the division names in the first conference of league
        (league == "NFL") ? ["AFC East", "AFC North", "AFC South", "AFC West"] 
        : (league == "NBA") ? ["Atlantic", "Central", "Southeast"] 
        : (league == "NHL") ? ["Atlantic", "Metropolitan"] 
        : ["AL East", "AL Cent", "AL West"];

    const secondConferenceDivisions = //the division names in the second conference of league
        (league == "NFL") ? ["NFC East", "NFC North", "NFC South", "NFC West"] 
        : (league == "NBA") ? ["Northwest", "Pacific", "Southwest"] 
        : (league == "NHL") ? ["Central", "Pacific"] 
        : ["NL East", "NL Cent", "NL West"];

    return { //this will be the returned data from this function which will be used to render the standings file

        firstConferenceDivisions: firstConferenceDivisions,
        
        secondConferenceDivisions: secondConferenceDivisions,
        //the conference names depend on the league, so we set them based on the league parameter
        firstConferenceName:
            (league == "NFL") ? "AFC"
            : (league == "MLB") ? "American League"
            : "Eastern Conference",
        //the conference names depend on the league, so we set them based on the league parameter
        secondConferenceName:
            (league == "NFL") ? "NFC" 
            : (league == "MLB") ? "National League" 
            : "Western Conference",
        //filtered teams in first conference sorted by their playoff seed
        firstConferenceTeams: (teamStandings[0].standingSummary) 
            ? teamStandings.filter(team => firstConferenceDivisions.some(division => team.standingSummary!.includes(division)))
            .sort((a, b) => a.playoffSeed - b.playoffSeed) : undefined,
        //filtered teams in second conference sorted by their playoff seed
        secondConferenceTeams: (teamStandings[0].standingSummary) 
            ? teamStandings.filter(team =>secondConferenceDivisions.some(division => team.standingSummary!.includes(division)))
            .sort((a, b) => a.playoffSeed - b.playoffSeed) : undefined,
    };
}


/**
 * 
 * @param endpoint base endpoint where we will send requests to for each team's standing data. Just add team abbr at end
 * @param teamID string which is the team's shorthand abbreviation (e.g. "NYG" for New York Giants) which we will use to send request to get the team's data
 * @returns a promise that resolves to a TeamRecord object which contains the team's record data and other relevant info we need to render the standings file
 */
async function fetchTeamData(endpoint: string, teamID: string, league: string): Promise<TeamRecord> {

    const teamData: TeamRecord = await fetch(endpoint + teamID)
        .then(res => res.json())
        .then(data => data as StandingsResponse)
        .then(teamData => {
            return {
                abbreviation: teamData.team.abbreviation,
                logo: teamData.team.logos[0].href,
                gamesPlayed: teamData.team.record.items[0].stats.find(stat => stat.name === "gamesPlayed")?.value || 0,
                playoffSeed: teamData.team.record.items[0].stats.find(stat => stat.name === "playoffSeed")?.value || 0,
                wins: teamData.team.record.items[0].stats.find(stat => stat.name === "wins")?.value || 0,
                losses: teamData.team.record.items[0].stats.find(stat => stat.name === "losses")?.value || 0,
                ties: teamData.team.record.items[0].stats.find(stat => stat.name === "ties")?.value,
                otLosses: teamData.team.record.items[0].stats.find(stat => stat.name === "otLosses")?.value,
                points: teamData.team.record.items[0].stats.find(stat => stat.name === "points")?.value,
                winPercent: teamData.team.record.items[0].stats.find(stat => stat.name === "winPercent")?.value,
                standingSummary: teamData.team.standingSummary,
                nhlDivisionStandings: (league == "NHL" && teamData.team.standingSummary) ? teamData.team.standingSummary[0] : undefined,
                playoffState: 
                    (league == "NHL" && teamData.team.standingSummary) ?
                    getPlayoffState(teamData.team.record.items[0].stats.find(stat => stat.name === "playoffSeed")!.value, league, teamData.team.standingSummary[0])
                    : getPlayoffState(teamData.team.record.items[0].stats.find(stat => stat.name === "playoffSeed")!.value, league)
                    
            } as TeamRecord;
        })
        .catch(err => {
            console.error(`Error fetching data for team ${teamID}:`, err);
            throw err;
        });
    return teamData;
}

function getPlayoffState(playoffSeed: number, league: string, nhlSeed?: string): string | undefined {

    if (playoffSeed == 0) return undefined; //if playoff seed is undefined, we can't determine playoff state, so return undefined

    const playoffSeedCutoff = (league: string) => {
        if (league === "NFL") return 4;
        if (league === "NBA") return 6;
        if (league === "MLB") return 3;
        return 0; //default case, should not happen
    };

    const wildcardSeedCutoff = (league: string) => {
        if (league === "NFL") return 7;
        if (league === "NBA") return 10;
        if (league === "NHL") return 8;
        if (league === "MLB") return 6;
        return 0; //default case, should not happen
    }

    if (league === "NHL" && Number(nhlSeed) <= 3){
        return "playoffs";
    }

    if (playoffSeed <= playoffSeedCutoff(league)) {
        return "playoffs";
    }

    if (playoffSeed <= wildcardSeedCutoff(league)) {
        return "wildcard";
    }
}

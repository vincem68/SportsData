import { TeamResponse, Team } from "../types/Team.types";

/**
 * 
 * @param endpoint string endpoint to send requests to to get the list of teams.
 * @returns an array of Team[] objects. Should just be the team names and logos
 */
export async function parseTeamResponse(league: string, sport: string): Promise<Team[]> {

    const data: TeamResponse = await (
        await fetch(`http://site.api.espn.com/apis/site/v2/sports/${sport}/${league}/teams`)
    ).json();

    return data.sports[0].leagues[0].teams.map((teamWrapper) => teamWrapper.team);
}
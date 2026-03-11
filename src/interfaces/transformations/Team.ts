import { TeamResponse, Team } from "../types/Team.types";


/**
 * 
 * @param endpoint string endpoint to send requests to to get the list of teams.
 * @returns an array of Team[] objects. Should just be the team names and logos
 */
export async function parseTeamResponse(endpoint: string): Promise<Team[]> {
    const response = await fetch(endpoint);
    const data: TeamResponse = await response.json();
    return data.sports[0].leagues[0].teams.map((teamWrapper) => teamWrapper.team);
}
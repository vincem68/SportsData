import type { LeadersResponse, LeagueLeaders } from "../types/Leaders.types";

/**
 * Function to take the leagye leaders endpoint and parse the data into a more usable format for our 
 * application. We will use this function to get the data we need to render the leaders file.
 * @param endpoint the endpoint to which we get all the league leader data from
 * @returns - the parsed data from the JSON response
 */
export const parseLeaderData = async (endpoint: string): Promise<LeagueLeaders> => {

    const response = await fetch(endpoint)
        .then(res => res.json())
        .then((data: LeadersResponse) => {
            const parsedData: LeagueLeaders = {
                categories: data.categories.map(category => ({
                    id: category.name,
                    name: category.displayName,
                    leaders: category.leaders.map((leader, index) => ({
                        rank: index + 1,
                        playerID: leader.athlete.$ref.substring(leader.athlete.$ref.lastIndexOf("/") + 1, 
                            leader.athlete.$ref.indexOf("?")),
                        athleteEndpoint: leader.athlete.$ref,
                        teamEndpoint: leader.team.$ref,
                        value: Math.round(leader.value * 1000) / 1000
                    }))
                }))
            };
            return parsedData;
        })
        .catch(err => {
            console.error("Error fetching leader data:", err);
            throw err;
        });
    return response;
}
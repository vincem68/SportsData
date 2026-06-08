

export interface LeadersResponse {
    categories?: {
        name: string;
        displayName: string;
        leaders: {
            value: number;
            athlete: {
                $ref: string;
            }
            team: {
                $ref: string;
            }
        }[];
    }[];
}

/**
 * This interface represents the structure of the league leaders data that we will be working with in our application.
 * It includes an array of categories, where each category has a name and an array of leaders. 
 * Each leader has an athlete and team ID, which we will use to send requests in the rendered file.
 */
export interface LeagueLeaders {
    categories?: {
        id: string;
        name: string;
        leaders: {
            rank: number;
            playerID: string;
            athleteEndpoint: string;
            teamEndpoint: string;
            value: number;
        }[];
    }[];
}
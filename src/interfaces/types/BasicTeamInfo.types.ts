
/**
 * This will be used to map the JSON response immediately
 * It will always contain the season data in year number and season type number (1-4)
 * It may also contain team name and logo if the endpoint requested is team specific
 */
export interface DataResponse {

    season: {
        year: number
        type: number
    }

    requestedSeason: {
        year: number
        type: number
    }

    team?: {
        displayName: string
        logo: string
    }
}


/**
 * We'll use this interface to get basic info from responses in case we get 404 responses
 */
export interface BasicTeamInfo {

    seasonYear: number
    seasonType: number
    teamName?: string
    teamLogo?: string
}
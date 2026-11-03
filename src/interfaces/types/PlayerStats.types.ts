
/**
 * This section of interfaces is dedicated to mapping out the response for the basic player info
 */
export interface PlayerInfoResponse {

    athlete: {

        displayName: string;

        headshot: {
            href: string
        }

        position: {
            abbreviation: string;
            displayName: string;
        }

        team: {
            abbreviation: string;
            displayName: string;
            logos: {
                href: string
            }[];
        }

        hand?: { //for hockey
            displayValue: string
        }

        displayHeight: string;
        displayWeight: string;
        displayDOB: string;
        age: number;
        displayDraft?: string;
        displayJersey?: string;
        jersey?: string
        displayExperience: string;
        debutYear?: number;
        displayBatsThrows?: string;
    }

    season : {
        year: number
        type: {
            type: number
        }
    }
}


//the main interface we'll render
export interface PlayerInfo {
    playerName: string;
    playerHeadshot: string;
    playerPosition: string;
    playerJersey: string;
    teamName: string;
    teamAbbreviation: string;
    teamLogo: string;
    playerDOB: string;
    playerHeight: string;
    playerWeight: string;
    playerAge: number;
    playerDraft?: string;
    debutYear: number
    playerExp: string;
    currentSeason: number
    currentSeasonType: number

    playerShoots?: string
    playerBatsThrows?: string
}


/**
 * This section of interfaces is dedicated to mapping out the response for the main overall player stats
 */
export interface PlayerStatsOverviewResponse {

    splits?: {

        categories: {

            displayName: string
            stats: {
                displayName: string
                abbreviation: string
                description: string
                displayValue: string
            }[]
        }[]
    }
}

export interface PlayerStatsOverview {

    requestedSeason: number
    requestedSeasonType: string

    categories?: {
        name: string
        stats: {
            abbr: string
            name: string
            desc: string
            value: string
        }[]
    }[]
}


/**
 * This section of interfaces is dedicated to mapping out the response for the advanced player stats splits
 * This will be used for the advanced splits page, which will have more detailed stats and more splits than the main overview page
 * The main overview page will only have the most important stats and a few splits (season, career, playoffs)
 * The advanced splits page will have all the stats and all the splits (home/away, wins/losses, etc.)
 */
export interface PlayerSplitsResponse {

    labels?: string[];
    displayNames?: string[];
    descriptions?: string[];

    splitCategories: {
        displayName: string;
        splits: {
            displayName: string;
            stats: string[]; 
        }[];
    }[];
}


//this will be the final structure of the data we render for advanced splits
export interface PlayerSplits {

    statsDesc?: {
        label: string;
        name: string;
        description: string;
    }[];

    categories?: {
        index: number;
        name: string;
        splits: {
            index: number;
            name: string;
            values: string[];
        }[];
    }[];
}


export interface PlayerContractResponse {
    
}
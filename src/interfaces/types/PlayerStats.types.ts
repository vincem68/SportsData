
/**
 * This section of interfaces is dedicated to mapping out the response for the basic player info
 */
export interface BasicPlayerStatsResponse {
    athlete: Athlete
}

interface Athlete {
    displayName: string;
    headshot: Headshot;
    position: Position
    team: Team;
    displayHeight: string;
    displayWeight: string;
    displayDOB: string;
    age: number;
    displayDraft: string;
    displayJersey: string;
}

interface Headshot {
    href: string;
}

interface Position {
    abbreviation: string;
    displayName: string;
}

interface Team {
    abbreviation: string;
    displayName: string;
    logos: Logo[];
}

interface Logo {
    href: string;
}

//the main interface we'll render
export interface BasicPlayerStats {
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
    playerDraft: string;
}


/**
 * This section of interfaces is dedicated to mapping out the response for the main overall player stats
 */
export interface PlayerStatsOverviewResponse {
  statistics: Statistics
}

interface Statistics {
  displayName: string
  categories: Category[]
  labels: string[]
  displayNames: string[]
  splits: Split[]
}

interface Category {
  name: string
  displayName: string
  count: number
}

interface Split {
    displayName: string;
    stats: string[];
}

export interface PlayerStatsOverview {
    statsDesc: {
        label: string;
        name: string;
    }[];
    splits: {
        name: string;
        values: string[];
    }[];
}


/**
 * This section of interfaces is dedicated to mapping out the response for the advanced player stats splits
 * This will be used for the advanced splits page, which will have more detailed stats and more splits than the main overview page
 * The main overview page will only have the most important stats and a few splits (season, career, playoffs)
 * The advanced splits page will have all the stats and all the splits (home/away, wins/losses, etc.)
 */
export interface PlayerSplitsResponse {
    labels: string[];
    displayNames: string[];
    descriptions: string[];
    splitCategories: SplitCategory[];
}

interface SplitCategory {
    displayName: string;
    splits: Split[];
}


//this will be the final structure of the data we render for advanced splits
export interface PlayerSplits {
    statsDesc: {
        label: string;
        name: string;
        description: string;
    }[];
    categories: {
        index: number;
        name: string;
        splits: {
            index: number;
            name: string;
            values: string[];
        }[];
    }[];
}
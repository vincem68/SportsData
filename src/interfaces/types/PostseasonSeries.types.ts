
/**
 * The raw JSON response we get from the API, we will parse this into a more usable format for our frontend
 * We will have a different interface for the raw response and the parsed response, since we will be reshaping the data to be more usable for our frontend
 * The raw response will be used for type checking the API response, and the parsed response will be used for type checking the data we pass to our frontend
 */
export interface PostseasonScheduleResponse {

    team: {
        id: number;
        displayName: string;
        abbreviation: string;
        logo: string;
    }

    season: {
        year: number;
        name: string;
        type: number;
    }

    requestedSeason?: {
        year: number;
        name: string;
        type: number;
    }

    events: {

        id: string;
        date: string;
        shortName: string;

        competitions: {

            id: number;

            type: {
                abbreviation: string;
            }

            status: {
                type: {
                    state: string;
                    detail: string;
                }
            };

            competitors: {

                team: {
                    id: number;
                    abbreviation: string;
                    displayName: string;
                    logos: {
                        href: string;
                    }[]
                }

                homeAway: string; //home or away

                winner?: boolean;

                score: {
                    displayValue: string;
                }

            }[]
        }[]
    }[]

}


/**
 * The parsed version of the JSON data we want to structure it to
 */
export interface PostseasonSchedule {

    team: {
        id: number;
        displayName: string;
        abbr: string;
        logo: string;
    }

    season: {
        year: number;
        name: string;
        type: number;
    }

    requestedSeason: {
        year: number;
        name: string;
        type: number;
    }

    rounds: Round[] //we'll organize each round of the playoffs a team will go through here. Will contain opponent info
}

export interface Round {

    roundName: string

    seriesOpponent: {
        name: string
        logo: string
        abbr: string
    }

    homeWins: number
    awayWins: number

    neededWins: number //number of wins needed to win the series

    games: {
        id: string
        date: string
        gameNumOfSeries: number
        startTime: string
        home: boolean
        status: string
        homeScore?: string
        awayScore?: string
        winner?: boolean
    }[]
}
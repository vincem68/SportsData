export interface CalendarResponse {

    team: {
        id: number;
        displayName: string;
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

    events: {

        id: string;
        date: string;
        shortName: string;

        competitions: {
            id: number;
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
 * The interface we will be reshaping the response to, to be used in our app.
 */
export interface Calendar {

    team: {
        id: number;
        displayName: string;
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

    months: { //divide the games into the months of the calendar year, make it easier to iterate
        monthName: string;
        firstWeekDayOfMonth: number;
        lastWeekDayOfMonth: number;
        totalCalendarWeeks: number; //number of actual rows on a physical calendar for month, can include empty spaces overlapping between months
        events: Event[]
    }[]
}

//sub interface for the games in the calendar
export interface Event {
    id: string; //id for the game link
    dayNum: number; //the day of the month the game is on
    date: string;
    home: boolean;
    startTime: string;
    opponentAbbr: string;
    opponentLogo: string;
    score?: string;
    winner?: boolean; //only included if the game is final, will be used to color code wins and losses on the calendar
    status: string;
    //maybe put something here for baseball in case a game gets rained out and have a double header?
}
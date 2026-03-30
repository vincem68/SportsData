export interface NFLScheduleResponse {

    team: {
        id: string
        displayName: string
        abbreviation: string
        logo: string
    }

    season: {
        year: number
        type: number
        name: string
    }

    requestedSeason?: {
        year: number
        type: number
        name: string
    }, 

    events: {

        id: string,
        date: string
        name: string
        shortName: string

        week: {
            number: number
            text: string
        }

        competitions: {

            status: {
                type: {
                    state: string
                    shortDetail: string
                    detail: string
                }
            }

            competitors: {
                winner: boolean
                homeAway: string
                team: {
                    id: string
                    displayName: string
                    abbreviation: string
                    logos: {
                        href: string
                    }[]
                }
                score: {
                    displayValue: string
                }
            }[]

        }[]

    }[]

    byeWeek: number
}


export interface NFLSchedule {

    team: {
        id: string
        name: string
        abbreviation: string
        logo: string
    }

    season: {
        year: number
        type: number
        name: string
    }

    requestedSeason?: {
        year: number
        type: number
        name: string
    },

    eliminatedPostseason?: boolean, //true if the team is eliminated from the postseason 

    inactivePostseason?: boolean, //true if the team is in regular season and postseason ahs not happened yet

    byeWeek: number

    games: {
        opponent: string
        opponentLogo: string
        home: boolean
        week: string
        score?: string
        state: string
        detail: string
        winner?: boolean
    }[]
}
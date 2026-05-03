export interface RosterResponse {

    season: {
        year: number
        type: number
        displayName: string
    }

    athletes: NBA_Player[] | Roster[] //with basketball rosters, the format for the athletes is different than the other 3 sports

    coach: {
        firstName: string
        lastName: string
    }[]

    team: {
        displayName: string
        logo: string
        recordSummary: string
        standingSummary: string
        color: string
    }
}

export interface NBA_Player { //for the NBA rosters. There's no positions listed to there's one less nested layer

    id: string
    fullName: string
    displayWeight: string
    displayHeight: string
    age: number
    jersey: string

    position: {
        displayName: string
        abbreviation: string
    }

    experience: {
        years: number
    }

    headshot: {
        href: string
    }

    status: {
        name: string
    }

    injuries: {
        status: string
    }[]
}

export interface Roster {

    position: string

    items: {

        id: string
        fullName: string
        displayWeight: string
        displayHeight: string
        age: number
        jersey: string

        position: {
            displayName: string
            abbreviation: string
        }

        experience: {
            years: number
        }

        headshot: {
            href: string
        }

        status: {
            name: string
        }

        injuries: {
            status: string
        }[]

        bats?: {
            abbreviation: string
        }

        throws?: {
            abbreviation: string
        }
    }[]
}


export interface RosterData {

    season: {
        year: number
        type: number
        name: string
    }

    coach: string

    team: {
        name: string
        logo: string
        record: string
        standings: string
        color: string
    }

    groups: {

        name: string

        athletes: {
            id: string
            fullName: string
            weight: string
            height: string
            age: number
            jersey: string
            position: {
                name: string
                abbr: string
            }
            yearsExperience: number
            headshot: string
            status: string
            bats?: string
            throws?: string
        }[]
    }[]
}
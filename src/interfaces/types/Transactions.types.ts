export interface TransactionResponse {

    team?: {
        displayName: string
        logo: string
        abbreviation: string
    }

    season: {
        year: number
        type: number
        displayName: string
    }

    requestedYear: {
        year: number
        displayName: string
    }

    pageIndex: number //index of page 

    pageCount: number //total number of pages

    transactions: {

        date: string
        description: string
        team?: {
            abbreviation: string
            displayName: string
            logos: {
                href: string
            }[]
        }

    }[]
}


export interface Transactions {

    currentYear: number
    requestedYear: number
    requestedSeasonName: string

    pageCount: number
    pageIndex: number

    team?: {
        name: string
        logo: string
        abbr: string
    }

    transactions: {
        date: string
        desc: string
        team?: {
            abbr: string
            logo: string
            name: string
        }
    }[]
}
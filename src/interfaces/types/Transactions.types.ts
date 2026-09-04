export interface TransactionResponse {

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
        team: {
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

    transactions: {
        date: string
        desc: string
        teamAbbr: string
        teamName: string
        teamLogo: string
    }[]
}
export interface DepthChartResponse {

    depthchart: {

        name: string
        positions: {
            [position: string]: PositionData
        }
    }[]
}

interface PositionData {
    position: {
        abbreviation: string
        displayName: string
    }

    athletes: {
        displayName: string
        shortName: string
        injuries: {
            status: string
        }[]
    }[]
}



export interface DepthChart {

    categories: {

        name: string
        maxColLength: number

        positions: {

            abbr: string 
            name: string

            athletes: {
                name: string
                injury?: string
            }[]

        }[]
    }[]
}

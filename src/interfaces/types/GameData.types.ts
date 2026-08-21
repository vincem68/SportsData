export interface GameSpecificOverviewResponse {

  id: string
  date: string
  name: string
  shortName: string

  season: {
    year: number
    type: number
  }

  competitions: {

    id: string
    date: string

    competitors: {

      id: string
      type: string
      homeAway: string

      team: {
        id: string
        name: string
        abbreviation: string
        displayName: string
        logo: string
      }

      probables?: {
        athlete: {
          fullName: string
          headshot: string
        }
      }[]

      score: string
      records: Record[]
      linescores: Linescore[]
      statistics: {
        displayValue: string
      }[]

      hits?: number; //only for baseball
      errors?: number; //only for baseball

    }[]

    status: Status
    startDate: string

    series: {
      summary: string
    }

    situation?: {

      downDistanceText?: string
      possession?: string
      balls?: number
      strikes?: number
      outs?: number

      pitcher?: {
        athlete: {
          shortName: string
          headshot: string
        }
      }

      batter?: {
        athlete: {
          shortName: string
          headshot: string
        }
      }

      onFirst?: boolean
      onSecond?: boolean
      onThird?: boolean
    }

    format: {
      regulation: {
      periods: number
    }

  }

}[]

}

interface Linescore {
    displayValue: string
}

interface Record {
  summary: string
}

export interface Status {
  displayClock: string
  period: number
  type: {
    id: string
    name: string
    state: string
    description: string
    detail: string
    shortDetail: string
  }
}

//we will use this interface in the actual views to simplify data access
export interface GameSpecificOverview {

    id: string
    date: string
    seasonType: number

    endpoint: string

    awayTeam: {
        id: string
        abbreviation: string
        name: string
        logo: string
        score: string
        record?: string
        startingPitcher?: {
          name: string
          headshot: string
        }
    }

    homeTeam: {
        id: string
        abbreviation: string
        name: string
        logo: string
        score: string
        record?: string
        startingPitcher?: {
          name: string
          headshot: string
        }
    }

    status: {
        state: string
        shortDetail: string
        period: number
        displayClock: string
    }

    situation?: {

        downDistanceText?: string
        possession?: string
        count?: string
        outs?: number

        pitcher?: {
          name: string
          headshot: string
        }

        batter?: {
          name: string
          headshot: string
        }

        onFirst?: boolean
        onSecond?: boolean
        onThird?: boolean
    }

    seriesSummary?: string

    linescore: {

      intervalLength: number
      intervals: string[] // the numebred labels of intervals, such as 1, 2, 3, ... OT, SO, etc
      awayLinescore: string[]
      awayRuns?: string;
      awayHits?: number;
      awayErrors?: number;
      homeLinescore: string[]
      homeRuns?: string;
      homeHits?: number;
      homeErrors?: number;

    }
}




// -----------------------------FOR THE GAME SUMMARY DATA -------------------------------------
export interface GameSpecificSummaryResponse {
  boxscore: Boxscore
  leaders: Leader[]
  meta: {
    gameState: string
  }
}

interface Leader {
  leaders: {
    displayName: string
    leaders: {
      displayValue: string
      athlete: {
        shortName: string
        headshot: string | { href: string }
      }
    }[]
  }[]
}

interface Boxscore {

  teams: { //teams array, only two teams

    team: { //team details
      abbreviation: string
      displayName: string
    }

    statistics: {
      displayValue: string
      label?: string //depending on league, we will have abbrevation or label for stat description
      abbreviation?: string
    }[]
    
  }[]

  //right here 
  players?: {

    statistics: {
      type?: string
      name?: string
      labels: string[]
      descriptions: string[]

      athletes: {

        starter: boolean
        didNotPlay?: boolean
        
        athlete: {
          id: string
          shortName?: string
          firstName?: string
          lastName?: string
          position?: {
            abbreviation: string
          }
        }
        batOrder?: number
        stats: string[]
        
      }[]

    }[]

  }[]
}


//The full, final interface we will restructire to from the response object
export interface GameSpecificSummary {

  endpoint: string

  awayTeamAbbr: string
  homeTeamAbbr: string

  gameState: string

  awayTeamStats: {
    label: string
    value: string
  }[]

  homeTeamStats: {
    label: string
    value: string
  }[]

  awayLeaders?: {
    category: string
    athleteName: string
    athleteHeadshot: string
    value: string
  }[],

  homeLeaders?: {
    category: string
    athleteName: string
    athleteHeadshot: string
    value: string
  }[]

  awayPlayerStats?: {

    categoryName: string //the full, readable name of the category, e.g. "Batting", "Pitching", etc
    tableID: string //the ID we will give the tables

    catLabelsAndDescs: { //the labels and descriptions for the header row of the player stats table
      label: string
      desc: string
    }[]

    players: { //the players with their needed info, and a stats array which will represent one row per player
      rowID: string
      athleteName: string
      starter?: boolean
      position?: string
      batOrder?: number //only for baseball
      stats: string[]
    }[]

  }[]

  homePlayerStats?: {

    categoryName: string //the full, readable name of the category, e.g. "Batting", "Pitching", etc
    tableID: string //the ID we will give the tables

    catLabelsAndDescs: {
      label: string
      desc: string
    }[]

    players: {
      rowID: string
      athleteName: string
      starter?: boolean
      position?: string
      batOrder?: number //only for baseball
      stats: string[]
    }[]
  }[]
 
}
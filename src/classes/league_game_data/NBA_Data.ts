import { League_Data } from "./League_Data";

export class NBA_Data extends League_Data {
    currentQuarter: number = 0;
    clock: string = "";

    //here's stats before the game, check to see if post game stats show up
    awayAvgFGPct: number = 0;
    homeAvgFGPct: number = 0;

    awayAvgRebounds: number = 0;
    homeAvgRebounds: number = 0;

    awayAvgPoints: number = 0;
    homeAvgPoints: number = 0;

    awayAvg3Pct: number = 0;
    homeAvg3Pct: number = 0;

    //check to see if these stats show up in JSON data once game is finished
    awayRebounds: number = 0;
    homeRebounds: number = 0;
    awayFreeThrows: number = 0;
    homeFreeThrows: number = 0;
    awayFG: number = 0;
    homeFG: number = 0;
    away3Pts: number = 0;
    home3Pts: number = 0;

    constructor(data: any){

        super(data);

        this.clock = data.status.displayClock;
        this.currentQuarter = data.status.period;

        this.awayAvgRebounds = parseInt(data.competitions[0].competitors[1].statistics[1].displayValue);
        this.homeAvgRebounds = parseInt(data.competitions[0].competitors[0].statistics[1].displayValue);

        this.awayAvgFGPct = parseInt(data.competitions[0].competitors[1].statistics[5].displayValue);
        this.homeAvgFGPct = parseInt(data.competitions[0].competitors[0].statistics[5].displayValue);

        this.awayAvgPoints = parseInt(data.competitions[0].competitors[1].statistics[13].displayValue);
        this.homeAvgPoints = parseInt(data.competitions[0].competitors[0].statistics[13].displayValue);

        this.awayAvg3Pct = parseInt(data.competitions[0].competitors[1].statistics[10].displayValue);
        this.homeAvg3Pct = parseInt(data.competitions[0].competitors[0].statistics[10].displayValue);
    }
}
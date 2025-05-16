import { League_Data } from "./League_Data";

export class MLB_Data extends League_Data {
    //thinking of maybe having the box score here? show the amount of hits, runs, errors in each inning
    awayStartingPitcher: string = "";;
    homeStarterPitcher: string = "";
    awayRuns: number[] = [0,0,0,0,0,0,0,0,0];
    homeRuns: number[] = [0,0,0,0,0,0,0,0,0];
    awayHits: number = 0;
    homeHits: number = 0;
    awayErrors: number = 0;
    homeErrors: number = 0;
    currentInning: number = 0;

    constructor(data: any){

        super(data);
    }
}
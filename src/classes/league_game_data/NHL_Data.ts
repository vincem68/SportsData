import { League_Data } from "./League_Data";

export class NHL_Data extends League_Data {

    currentPeriod: number = 0;
    clock: string = "";

    goalLeaderName: string = "";
    goalLeaderTotal: number = 0;

    assistLeaderName: string = "";
    assistLeaderTotal: number = 0;

    goalieLeaderName: string = "";
    goalieLeaderSV: number = 0;

    constructor(data: any){

        super(data); //call constructor for League_Data
        this.currentPeriod = parseInt(data.status.period);
        this.clock = data.status.displayClock;

    }
}
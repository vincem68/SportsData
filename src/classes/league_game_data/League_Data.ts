
//use this one to keep data that all interfaces would need and have the others inherit it, like dates
export class League_Data {

    //put thing here to distinguish between whether 
    gameStatus: string = ""; //state is either in, post, or pre

    awayTeamName: string = "";
    awayTeamScore: number = 0;

    homeTeamName: string = "";
    homeTeamScore: number = 0;

    homeTeamLogo: string = "";
    awayTeamLogo: string = "";
    
    //pass each element of events[]
    constructor(data: any){

        this.gameStatus = data.status.type.state;

        this.homeTeamName = data.competitions[0].competitors[0].team.name;
        this.awayTeamName = data.competitions[0].competitors[1].team.name;

        this.awayTeamScore = parseInt(data.competitions[0].competitors[1].score);
        this.homeTeamScore = parseInt(data.competitions[0].competitors[0].score);

        this.awayTeamLogo = data.competitions[0].competitors[1].team.logo;
        this.homeTeamLogo = data.competitions[0].competitors[0].team.logo;
    }
}



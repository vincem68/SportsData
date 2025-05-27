class MLB_Team_Data {

    name: string = "";
    logo: string = "";

    manager: string = "";

    startingPitchers: {name: string, jerseyNo: number}[] = [];
    bullpen: {name: string, jerseyNo: number}[] = [];

    infielders: {name: string, jerseyNo: number}[] = [];
    outfielders: {name: string, jerseyNo: number}[] = [];
    catchers: {name: string, jerseyNo: number}[] = [];
}
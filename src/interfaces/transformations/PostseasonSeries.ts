import type { PostseasonSchedule, PostseasonScheduleResponse, Round } from "../types/PostseasonSeries.types";

export async function parsePostseasonScheduleResponse(sport: string, league: string, team: string, requestedYear: number, requestedType: number): Promise<PostseasonSchedule> {

    //get the JSON response data to parse into a more usable format for our frontend
    const response: PostseasonScheduleResponse = await (
        await fetch(`https://site.api.espn.com/apis/site/v2/sports/${sport}/${league}/teams/${team}/schedule?season=${requestedYear}&seasontype=${requestedType}`)
    ).json();

    //restructure the games before parsing so we have better structured data for the games
    response.events.forEach(game => {

         //make sure the specific team is always first in the array
        if (game.competitions[0].competitors[0].team.id != response.team.id){
            game.competitions[0].competitors = game.competitions[0].competitors.reverse();
        }
        //change the date of the games, the JSON data gives it in one timezone
        game.date = parseDate(game.date);
    });

    //filter the games by round, this will also give us the series info we need for each round
    const seriesSchedule = filterGamesByRound(response.events, league);

    return {

        team: {
            id: response.team.id,
            displayName: response.team.displayName,
            abbr: response.team.abbreviation,
            logo: response.team.logo
        },

        season: {
            year: response.season.year,
            name: response.season.name,
            type: response.season.type
        },

        requestedSeason: {
            year: response.requestedSeason.year,
            name: response.requestedSeason.name,
            type: response.requestedSeason.type
        },

        rounds: seriesSchedule
    }
}


function filterGamesByRound(events: PostseasonScheduleResponse["events"], league: string): Round[] {

    //the names of each round depending on the league
    const seriesNames = league.toLowerCase() === "nba" ? ["First Round", "Conference Semifinals", "Conference Finals", "NBA Finals"] :
        league.toLowerCase() === "mlb" ? ["Wild Card Series", "Division Series", "Championship Series", "World Series"] :
        league.toLowerCase() === "nfl" ? ["Wild Card Round", "Divisional Round", "Conference Championships", "Super Bowl"] :
        ["First Round", "Conference Semifinals", "Conference Finals", "Stanley Cup Finals"];

    //these are the names of the rounds that the JSON response will give, use this to iterate over games by round
    const responseSeriesNames = ["RD16", "QTR", "SEMI", "FINAL"];

    //go through each of the four rounds to filter the games and get the series info
    const seriesRounds: Round[] = responseSeriesNames.map((series, index) => {

        //the filtered games of each round
        const games = events.filter(game => game.competitions[0].type.abbreviation == series)
            .filter(game => game.competitions[0].status.type.detail != "Postponed");

        //parse the games of the round to get the info we need for our frontend
        const parsedGames = games.map((game, index) => {
            return {
                id: game.id,
                date: game.date,
                gameNumOfSeries: index + 1,
                home: game.competitions[0].competitors[0].homeAway == "home" ? true : false, //if the team is the home team, set to true, else false
                //get the military time switched to standard time
                startTime: Number(game.date.slice(11, 13)) > 12 ? (Number(game.date.slice(11, 13)) - 12) + game.date.slice(13, 16) + " PM" : game.date.slice(11, 16) + " AM",
                homeScore: game.competitions[0].status.type.state == "post" ? game.competitions[0].competitors[0].score.displayValue : undefined,
                awayScore: game.competitions[0].status.type.state == "post" ? game.competitions[0].competitors[1].score.displayValue : undefined,
            
                winner: game.competitions[0].status.type.state == "post" ? game.competitions[0].competitors[0].winner : undefined,
                status: game.competitions[0].status.type.detail == "Postponed" ? "Postponed" : game.competitions[0].status.type.state
            }
        });

        return {

            roundName: seriesNames[index],
            seriesOpponent: {
                name: games.length > 0 ? games[0].competitions[0].competitors[1].team.displayName : "",
                logo: games.length > 0 ? games[0].competitions[0].competitors[1].team.logos[0].href : "",
                abbr: games.length > 0 ? games[0].competitions[0].competitors[1].team.abbreviation : ""
            },

            homeWins: games.length > 0 ? games.filter(game => game.competitions[0].competitors[0].winner).length : 0,
            awayWins: games.length > 0 ? games.filter(game => game.competitions[0].competitors[0].winner == false).length : 0,

            neededWins: league.toLowerCase() == "mlb" && seriesNames[index].includes("Wild Card") ? 2
                : league.toLowerCase() == "mlb" && seriesNames[index].includes("Division") ? 3 : 4,

            games: parsedGames
        }
    })

    return seriesRounds;
}


/**
 * This function will parse the dates of a game to local time, the dates from the JSON response are wrong
 * @param date 
 * @returns 
 */
function parseDate(date: string){
    //change the dates of the games to local time dates
    const localDate = new Date(date);
    const year = localDate.getFullYear();
    const month = String(localDate.getMonth() + 1).padStart(2, '0');
    const day = String(localDate.getDate()).padStart(2, '0');
    const hours = String(localDate.getHours()).padStart(2, '0');
    const minutes = String(localDate.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
}
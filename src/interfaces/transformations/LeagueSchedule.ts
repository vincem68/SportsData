import type { GameOverview, GameOverviewResponse } from "../types/LeagueSchedule.types";
import type { LeagueScheduleResponse, LeagueSchedule } from "../types/LeagueSchedule.types"

//a simple interface that can represent the type of parameter we get for the parser below, really for football games
interface Queries {
    season: string
    week: string
    type: string
}

/**
 * 
 * @param data the league schedule response from the API
 * @returns an instance of LeagueSchedule. Will contain an instance that contains season year and type, 
 * allGames which is an array that holds 3 objects, each containing all the games but in specific states, and
 * the respone's date or week
 */
export async function parseLeagueScheduleResponse(league: string, sport: string, queries?: string | Queries): Promise<LeagueSchedule> {

    const endpoint = 
        //if queries exists and type string, its just a date string. Use this when user goes to previous date
        (queries && typeof queries == "string") ? `https://site.api.espn.com/apis/site/v2/sports/${sport}/${league.toLowerCase()}/scoreboard?dates=${queries.replace(/-/g, "")}`
        //if an object of strings, its for previous football games
        : queries ? `https://site.api.espn.com/apis/site/v2/sports/${sport}/${league.toLowerCase()}/scoreboard?dates=${(queries as Queries).season}&week=${(queries as Queries).week}&seasontype=${(queries as Queries).type}`
        //the default endpoint
        : `https://site.api.espn.com/apis/site/v2/sports/${sport}/${league.toLowerCase()}/scoreboard`;


    const data: LeagueScheduleResponse = await (
        await fetch(endpoint)
    ).json();

    const parsedGames: GameOverview[] = await Promise.all(data.events.map(event => parseGame(event)));

    return {
        
        endpoint: endpoint,
        season: data.leagues[0].season.year,
        seasonType: data.leagues[0].season.type.type,
        seasonTypeName: data.leagues[0].season.type.name,
        totalGames: parsedGames.length,
        seasonEndDate: parseDate(data.leagues[0].calendarEndDate || ""),
        schedule: {
            activeGames: {
                id: "activeGames",
                name: "All Games",
                games: parsedGames.filter(game => game.status.state == "in")
            },
            upcomingGames: {
                id: "upcomingGames",
                name: "Upcoming Games",
                games: parsedGames.filter(game => game.status.state == "pre")
            },
            completedGames: {
                id: "completedGames",
                name: "Completed Games",
                games: parsedGames.filter(game => game.status.state == "post")
            }
        },
        day: data.day ? data.day.date : undefined,
        week: data.week ? data.week.number : undefined,
        teamsOnBye: data.week ? data.week.teamsOnBye : undefined
    }
}

/**
 * Function to parse the GameOverviewResponse from ESPN into a more manageable GameOverview object
 * @param response JSON response from ESPN containing game info
 * @returns a variable of type GameOverview to have needed JSON info much more organized and readable
 */
export async function parseGame(responseOrLeague: GameOverviewResponse | string, sport?: string, gameID?: string): Promise<GameOverview>{

    //if we get three string values, fetch the data, else leave it as is
    const data: GameOverviewResponse = typeof responseOrLeague == "string" ? await (
        await fetch(`https://site.api.espn.com/apis/site/v2/sports/${sport}/${responseOrLeague.toLowerCase()}/scoreboard/${gameID}`)
    ).json() : responseOrLeague;

    const competition = data.competitions[0];
    const awayCompetitor = competition.competitors[1];
    const homeCompetitor = competition.competitors[0];
    return {
        id: data.id,
        date: data.date,
        seasonType: data.season.type,
        awayTeam: {
            id: awayCompetitor.id,
            abbreviation: awayCompetitor.team.abbreviation,
            name: awayCompetitor.team.displayName,
            logo: awayCompetitor.team.logo,
            score: awayCompetitor.score
        },
        homeTeam: {
            id: homeCompetitor.id,
            abbreviation: homeCompetitor.team.abbreviation,
            name: homeCompetitor.team.displayName,
            logo: homeCompetitor.team.logo,
            score: homeCompetitor.score
        },
        status: {
            state: competition.status.type.state,
            shortDetail: competition.status.type.shortDetail,
            period: competition.status.period,
            displayClock: competition.status.displayClock
        },
        situation: competition.situation ? {
            downDistanceText: competition.situation.downDistanceText,
            possession: competition.situation.possession,
            count: `${competition.situation.balls}-${competition.situation.strikes}`,
            outs: competition.situation.outs
        } : undefined,
        seriesSummary: competition.series?.summary || ''
    };
}

function parseDate(dateString: string): string {
    const localDate = new Date(dateString);
    const year = localDate.getFullYear();
    const month = String(localDate.getMonth() + 1).padStart(2, '0');
    const day = String(localDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}
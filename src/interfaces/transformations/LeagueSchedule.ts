import type { GameOverview } from "../types/GameOverview.types";
import { parseGameOverviewResponse } from "./GameOverview"
import type { LeagueScheduleResponse, LeagueSchedule } from "../types/LeagueSchedule.types"


/**
 * 
 * @param data the league schedule response from the API
 * @returns an instance of LeagueSchedule. Will contain an instance that contains season year and type, 
 * allGames which is an array that holds 3 objects, each containing all the games but in specific states, and
 * the respone's date or week
 */
export const parseLeagueScheduleResponse = (data: LeagueScheduleResponse): LeagueSchedule => {
    const parsedGames: GameOverview[] = data.events.map(event => parseGameOverviewResponse(event));
    return {
        season: data.season,
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

function parseDate(dateString: string): string {
    const localDate = new Date(dateString);
    const year = localDate.getFullYear();
    const month = String(localDate.getMonth() + 1).padStart(2, '0');
    const day = String(localDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}
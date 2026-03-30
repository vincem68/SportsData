import type { NFLSchedule, NFLScheduleResponse } from "../types/NFLSchedules.types";

export async function parseNFLScheduleResponse(team: string, season: number, seasonType: number): Promise<NFLSchedule> {

    const data: NFLScheduleResponse = await fetch(`https://site.api.espn.com/apis/site/v2/sports/football/nfl/teams/${team}/schedule?season=${season}&seasontype=${seasonType}`)
        .then(async response => await response.json());

    const games = data.events.map((event) => {

        //make sure the specific team is always first in the array
        if (event.competitions[0].competitors[0].team.id != data.team.id){
            event.competitions[0].competitors = event.competitions[0].competitors.reverse();
        }

        return {
            opponent: event.competitions[0].competitors[1].team.displayName,
            opponentLogo: event.competitions[0].competitors[1].team.logos[0].href,
            home: event.competitions[0].competitors[0].homeAway == "home" ? true : false,
            week: event.week.text,
            state: event.competitions[0].status.type.state,
            detail: event.competitions[0].status.type.detail,
            winner: event.competitions[0].status.type.state == "post" ? event.competitions[0].competitors[0].winner : undefined,
            score: event.competitions[0].status.type.state != "in" ?
                 event.competitions[0].competitors[0].score.displayValue + "-" + event.competitions[0].competitors[1].score.displayValue
                    : undefined
        }
    });

    return {

        team: {
            id: data.team.id,
            name: data.team.displayName,
            abbreviation: data.team.abbreviation,
            logo: data.team.logo
        },

        season: {
            year: data.season.year,
            type: data.season.type,
            name: data.season.name
        },

        requestedSeason: data.requestedSeason ? {
            year: data.requestedSeason.year,
            type: data.requestedSeason.type,
            name: data.requestedSeason.name
        } : undefined,

        eliminatedPostseason: seasonType == 3 && games.length == 0 && season <= data.season.year && data.season.type >= 3 ? true : undefined,

        inactivePostseason: seasonType == 3 && games.length == 0 && season == data.season.year && data.season.type < 3 ? true : undefined,
        
        byeWeek: data.byeWeek ? data.byeWeek : 0,

        games: games
    }
}

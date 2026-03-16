import type { NFLSchedule, NFLScheduleResponse } from "../types/NFLSchedules.types";

export async function parseNFLScheduleResponse(endpoint: string): Promise<NFLSchedule> {

    const response = await fetch(endpoint);
    const data: NFLScheduleResponse = await response.json();

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
            id: data.events[0].competitions[0].competitors[0].team.id,
            name: data.events[0].competitions[0].competitors[0].team.displayName,
            abbreviation: data.events[0].competitions[0].competitors[0].team.abbreviation,
            logo: data.team.logo
        },

        season: {
            year: data.season.year,
            type: data.season.type,
            name: data.season.name
        },

        requestedSeason: {
            year: data.requestedSeason.year,
            type: data.requestedSeason.type,
            name: data.requestedSeason.name
        },
        
        byeWeek: data.byeWeek ? data.byeWeek : 0,

        games: games
    }
}

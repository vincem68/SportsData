import type { Calendar, CalendarResponse, Event } from "../types/Calendar.types";

export async function parseCalendarResponse(league: string, sport: string, team: string, season: number, seasonType: number): Promise<Calendar> {


    const response: CalendarResponse = await (
        await fetch(`https://site.api.espn.com/apis/site/v2/sports/${sport}/${league}/teams/${team}/schedule?season=${season}&seasontype=${seasonType}`)
    ).json();

    //got to parse the games before filtering the games by month
    const parsedGames: Event[] = response.events.map(game => {

        //make sure the specific team is always first in the array
        if (game.competitions[0].competitors[0].team.id != response.team.id){
            game.competitions[0].competitors = game.competitions[0].competitors.reverse();
        }

        //change the date of the games, the JSON data gives it in one timezone
        const newDate = parseDate(game.date);

        return {
            id: game.id,
            date: newDate,
            dayNum: parseInt(String(new Date(game.date).getDate())),
            home: game.competitions[0].competitors[0].homeAway == "home" ? true : false, //if the team is the home team, set to true, else false
            //get the military time switched to standard time
            startTime: Number(newDate.slice(11, 13)) > 12 ? (Number(newDate.slice(11, 13)) - 12) + newDate.slice(13, 16) + " PM" : newDate.slice(11, 16) + " AM",
            opponentAbbr: game.competitions[0].competitors[1].team.abbreviation,
            opponentLogo: game.competitions[0].competitors[1].team.logos[0].href,
            score: game.competitions[0].status.type.state == "post" ?
                 game.competitions[0].competitors[0].score.displayValue + "-" + game.competitions[0].competitors[1].score.displayValue
                    : undefined,
            winner: game.competitions[0].status.type.state == "post" ? game.competitions[0].competitors[0].winner : undefined,
            status: game.competitions[0].status.type.detail == "Postponed" ? "Postponed" : game.competitions[0].status.type.state
        }

    });

    const filteredGames = filterGamesByMonth(parsedGames, league, seasonType);

    const calendar: Calendar = {
        team: response.team,
        season: response.season,
        requestedSeason: response.requestedSeason,
        months: filteredGames.filter(month => month !== null) as Calendar["months"] //filter out any months that had no games, the filter function returns null for those months
    }

    return calendar;
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



function filterGamesByMonth(games: Event[], league: string, seasonType: number){

    //get the months for the season in order
    const months = getSeasonMonths(league, seasonType);

    //get the leap year part out of the way here first
    const year = games.find(game => game.date.slice(5, 7) == "02") !== undefined ? 
        parseInt(games.find(game => game.date.slice(5, 7) == "02")!.date.slice(0, 4)) : undefined;

    //take care of leap year just in case
    if (year !== undefined && (Number(year) % 4 === 0)){ //if there is a february game and it's a leap year, change the total days in february to 29
        months.find(month => month.key == "02")!.totalDays = 29;
    }
        
    //for each month in the array
    const gamesByMonth = months.map(month => {
        //filter out any games for said month
        const gamesInMonth = games.filter(game => game.date.slice(5, 7) == month.key);

        if (gamesInMonth.length == 0) return null;

        //get the index value of the weekday of the first day of the month (0 Sun, 1 Mon, etc)
        const firstWeekdayOfMonth = new Date(gamesInMonth[0].date.substring(0, 8) + "01" +
            gamesInMonth[0].date.substring(10, 16)).getDay();
        //get the index value of the weekday of the last day of the month (0 Sun, 1 Mon, etc)
        const lastWeekdayOfMonth = new Date(gamesInMonth[0].date.substring(0, 8) + String(month.totalDays) +
            gamesInMonth[0].date.substring(10, 16)).getDay();
        
        //calculate the total number of calendar weeks the month will take up, can be 4, 5, or 6 depending on the month and what day of the week it starts on
        const totalCalendarWeeks = Math.ceil((month.totalDays + firstWeekdayOfMonth) / 7);

        return { //just return the month
            monthName: month.name,
            firstWeekDayOfMonth: firstWeekdayOfMonth,
            lastWeekDayOfMonth: lastWeekdayOfMonth,
            totalCalendarWeeks: totalCalendarWeeks,
            events: gamesInMonth
        }
    })

    return gamesByMonth.filter(month => month !== null); //filter out any months that had no games, return the rest
}


/**
 * A simple function to return the ordered list of months with their data needed for page rendering
 * @param league string value of league name
 * @param seasonType numeric value for season type (really just looking at 1 for preseason, or 2 for regular season)
 * @returns order of months for the season, as well as the total number of days in each month (for calendar formatting purposes)
 */
function getSeasonMonths(league: string, seasonType: number){

    if (league == "MLB" && seasonType == 2){ //if regular season MLB, March - October
        return [
            {key: "03", totalDays: 31, name: "March"},
            {key: "04", totalDays: 30, name: "April"},
            {key: "05", totalDays: 31, name: "May"},
            {key: "06", totalDays: 30, name: "June"},
            {key: "07", totalDays: 31, name: "July"},
            {key: "08", totalDays: 31, name: "August"},
            {key: "09", totalDays: 30, name: "September"},
            {key: "10", totalDays: 31, name: "October"}
        ]

    } else if (league == "NBA" && seasonType == 2){ //if regular season NBA, October - April
        return [
            {key: "10", totalDays: 31, name: "October"},
            {key: "11", totalDays: 30, name: "November"},
            {key: "12", totalDays: 31, name: "December"},
            {key: "01", totalDays: 31, name: "January"},
            {key: "02", totalDays: 28, name: "February"}, //leap year will be handled in the filter function
            {key: "03", totalDays: 31, name: "March"},
            {key: "04", totalDays: 30, name: "April"}
        ]
    } else if (league == "NHL" && seasonType == 2){ //if regular season NHL, September - April
        return [
            {key: "09", totalDays: 30, name: "September"},
            {key: "10", totalDays: 31, name: "October"},
            {key: "11", totalDays: 30, name: "November"},
            {key: "12", totalDays: 31, name: "December"},
            {key: "01", totalDays: 31, name: "January"},
            {key: "02", totalDays: 28, name: "February"}, //leap year will be handled in the filter function
            {key: "03", totalDays: 31, name: "March"},
            {key: "04", totalDays: 30, name: "April"}
        ]
    } else if (league == "MLB" && seasonType == 1){ //if preseason MLB, February - March
        return [
            {key: "02", totalDays: 28, name: "February"}, //leap year will be handled in the filter function
            {key: "03", totalDays: 31, name: "March"}
        ]
    } else { //if preseason NBA or NHL, September - October
        return [
            {key: "09", totalDays: 30, name: "September"},
            {key: "10", totalDays: 31, name: "October"}
        ]
    }
}
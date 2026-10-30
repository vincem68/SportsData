import type { TransactionResponse, Transactions } from "../types/Transactions.types";
import { parseDate } from "../../utility_functions";

export async function parseTransactionResponse(league: string, sport: string, team: string = "", year: number = -1, page: number = -1): Promise<Transactions> {

    const endpoint = `https://site.api.espn.com/apis/site/v2/sports/${sport}/${league}/transactions?` 
        + ((year != -1 && page != -1 && team != "") ? `season=${year}&page=${page}&team=${team}`
        : (year != -1 && team != "") ? `season=${year}&team=${team}`
        : (year != -1 && page != -1) ? `season=${year}&page=${page}` 
        : (year != -1 && page == -1) ? `season=${year}` 
        : (team != "") ? `team=${team}`
        : "");

    console.log(endpoint);

    const data: TransactionResponse = await (
        await fetch(endpoint)
    ).json();

    return {

        currentYear: data.season.year,
        requestedYear: data.requestedYear.year,
        requestedSeasonName: data.requestedYear.displayName,

        pageCount: data.pageCount,
        pageIndex: data.pageIndex,

        team: data.team ? {
            name: data.team.displayName,
            logo: data.team.logo,
            abbr: data.team.abbreviation
        } : undefined,

        transactions: data.transactions ? data.transactions.map(trans => {

            return {
                date: cleanUpDate(parseDate(trans.date)),
                desc: trans.description,
                team : trans.team ? {
                    abbr: trans.team.abbreviation,
                    logo: trans.team.logos[0].href,
                    name: trans.team.displayName
                } : undefined
            }
        }) : []
    }
}

/**
 * parses computer time format to MM/DD/YYYY HH:mm format
 * @param date date string from the parsed time to local time
 * @returns a more English/written styled date
 */
function cleanUpDate(date: string){

    const dayValues = date.split('T')[0].split('-');

    return dayValues[1] + "/" + dayValues[2] + "/" + dayValues[0];
}
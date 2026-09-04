import type { TransactionResponse, Transactions } from "../types/Transactions.types";
import { parseDate } from "../../utility_functions";

export async function parseTransactionResponse(league: string, sport: string, year?: number, page?: number): Promise<Transactions> {

    const endpoint = `https://site.api.espn.com/apis/site/v2/sports/${sport}/${league}/transactions` 
        + ((year && page) ? `?season=${year}&page=${page}` : (year && !page) ? `?season=${year}` : "");

    const data: TransactionResponse = await (
        await fetch(endpoint)
    ).json();

    return {

        currentYear: data.season.year,
        requestedYear: data.requestedYear.year,
        requestedSeasonName: data.requestedYear.displayName,

        pageCount: data.pageCount,
        pageIndex: data.pageIndex,

        transactions: data.transactions ? data.transactions.map(trans => {

            return {
                date: cleanUpDate(parseDate(trans.date)),
                desc: trans.description,
                teamAbbr: trans.team.abbreviation,
                teamName: trans.team.displayName,
                teamLogo: trans.team.logos[0].href
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
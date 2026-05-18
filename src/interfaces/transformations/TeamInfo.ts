import type { TeamNewsResponse, TeamNews } from "../types/TeamNews.types";
import type { TeamInfoResponse, TeamInfo } from "../types/TeamInfo.types";

import { parseGame } from "./LeagueSchedule";


/**
 * parse to get the basic team info
 * @param league string of league name
 * @param sport sport name
 * @param team team abbreviation
 * @returns 
 */
export async function parseTeamInfoResponse(league: string, sport: string, team: string): Promise<TeamInfo>{

    const data: TeamInfoResponse = await (
        await fetch(`https://site.api.espn.com/apis/site/v2/sports/${sport}/${league.toLowerCase()}/teams/${team}`)
    ).json();

    return {

        displayName: data.team.displayName,
        recordSummary: data.team.record.items !== undefined ? data.team.record.items[0].summary : '',
        logoUrl: data.team.logos[0].href,
        nextGame: data.team.nextEvent.length > 0 ? await parseGame(league, sport, data.team.nextEvent[0].id) : undefined

    } as TeamInfo;

}


/**
 * simple parsing function to get the list of news for the team
 * @param league string name of league
 * @param sport string of sport name
 * @param team string abbreviation of team
 * @returns 
 */
export async function parseTeamNewsResponse(league: string, sport: string, team: string): Promise<TeamNews[]>{

    const res: TeamNewsResponse = await (
        await fetch(`https://site.api.espn.com/apis/site/v2/sports/${sport}/${league.toLowerCase()}/news?team=${team}`)
    ).json();

    const teamNews: TeamNews[] = res.articles.map((article) => {{
        return {
            headline: article.headline,
            description: article.description,
            imageUrl: article.images.length > 0 ? article.images[0].url : '',
            articleUrl: article.links.length > 0 ? article.links[0].web.href : ''
        }
    }});

    return teamNews;
}

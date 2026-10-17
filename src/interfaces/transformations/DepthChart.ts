import type { DepthChart, DepthChartResponse } from "../types/DepthChart.types";

export async function parseDepthChartResponse(league: string, sport: string, teamID: string): Promise<DepthChart> {

    const response: DepthChartResponse = await (
        await fetch(`https://site.api.espn.com/apis/site/v2/sports/${sport}/${league}/teams/${teamID}/depthcharts`)
    ).json();

    return {

        categories: response.depthchart.map(cat => { //for every category (mainly football)

            return {

                name: cat.name,

                positions: Object.keys(cat.positions).map(pos => { //for every position within category

                    return {

                        abbr: pos.toUpperCase(),
                        name: cat.positions[pos].position.displayName,

                        athletes: cat.positions[pos].athletes.map(athlete => {
                            return {
                                name: athlete.shortName,
                                injury: athlete.injuries.length > 0 ? athlete.injuries[0].status : undefined
                            }
                        })
                    }
                }),

                maxColLength: Math.max(...Object.keys(cat.positions).map(pos => cat.positions[pos].athletes.length))
            }
        })
    }
}